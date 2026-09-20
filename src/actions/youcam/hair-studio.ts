// src/lib/youcam/actions/hairstyle.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { startTask, checkTaskStatus } from "@/lib/youcam/client";
import { revalidateUserData } from "@/lib/revalidate-user";
import { getFeatureCost } from "@/lib/youcam/feature-costs";
import prisma from "@/lib/prisma-client";

// ═══════════════════════════════════════════════════════════
// 🎯 TWO SEPARATE COSTS
// ═══════════════════════════════════════════════════════════

// 👤 What the USER pays (same for all features)
const USER_CREDITS_COST = 1;

// 🔑 What YOUCAM charges our key (varies per feature)
const YOUCAM_CREDITS_COST = getFeatureCost("HAIRSTYLE"); // → 2

const TASK_TIMEOUT_MS = 5 * 60 * 1000;

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type StartHairStyleInput = {
  imageUrl: string;
  referenceImageUrl: string;
};

type StartResult =
  | { success: true; creationId: string; taskId: string; userCost: number }
  | { success: false; error: string };

type StatusResult =
  | { success: true; status: "PROCESSING" }
  | { success: true; status: "COMPLETED"; imageUrl: string }
  | { success: true; status: "FAILED" }
  | { success: false; error: string };

// ═══════════════════════════════════════════════════════════
// START HAIRSTYLE
// ═══════════════════════════════════════════════════════════

export async function startHairStyle({
  imageUrl,
  referenceImageUrl,
}: StartHairStyleInput): Promise<StartResult> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: false, error: "You must be signed in." };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, credits: true },
    });

    if (!dbUser) {
      return { success: false, error: "User account not found." };
    }

    // 🎯 Check for USER credits — only needs 1
    if (dbUser.credits < USER_CREDITS_COST) {
      return {
        success: false,
        error: `You're out of credits. Please upgrade to continue.`,
      };
    }

    if (!imageUrl || !referenceImageUrl) {
      return {
        success: false,
        error: "Both your photo and a hairstyle must be selected.",
      };
    }

    let taskId: string;
    try {
      // 🎯 Pass YOUCAM cost (2 for hairstyle) — deducts from KEY, not user
      taskId = await startTask(
        "hair-transfer",
        {
          src_file_url: imageUrl,
          ref_file_url: referenceImageUrl,
        },
        YOUCAM_CREDITS_COST // 👈 2 — deducts 2 from YOUCAM key
      );
      console.log("[startHairStyle] ✅ Task started:", taskId);
    } catch (err: any) {
      console.error("[startHairStyle] YouCam error:", err.message);
      return {
        success: false,
        error: "Could not start generation. Please try again.",
      };
    }

    // 🎯 Save with USER_CREDITS_COST (1) — this is what USER pays
    const creation = await prisma.creation.create({
      data: {
        userId: dbUser.id,
        feature: "HAIRSTYLE",
        originalImageUrl: imageUrl,
        taskId,
        status: "PROCESSING",
        creditsUsed: USER_CREDITS_COST, // 👈 1 — what user pays
        imageUrl: null,
        metadata: {
          youcamCost: YOUCAM_CREDITS_COST, // 👈 Track internal cost
        },
      },
    });

    console.log(
      `[startHairStyle] ✅ Creation saved: ${creation.id} (user: 1, youcam: 2)`
    );

    return {
      success: true,
      creationId: creation.id,
      taskId,
      userCost: USER_CREDITS_COST,
    };
  } catch (err: any) {
    console.error("[startHairStyle] 💥 Error:", err.message);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// ═══════════════════════════════════════════════════════════
// CHECK STATUS
// ═══════════════════════════════════════════════════════════

export async function checkHairStyleStatus({
  creationId,
}: {
  creationId: string;
}): Promise<StatusResult> {
  try {
    const creation = await prisma.creation.findUnique({
      where: { id: creationId },
    });

    if (!creation || !creation.taskId) {
      return { success: false, error: "Creation not found." };
    }

    if (creation.status === "COMPLETED") {
      return {
        success: true,
        status: "COMPLETED",
        imageUrl: creation.imageUrl || "",
      };
    }

    if (creation.status === "FAILED") {
      return { success: true, status: "FAILED" };
    }

    const age = Date.now() - creation.createdAt.getTime();
    if (age > TASK_TIMEOUT_MS) {
      await prisma.creation.update({
        where: { id: creation.id },
        data: { status: "FAILED" },
      });
      return { success: true, status: "FAILED" };
    }

    let youCamResult: { status: string; results?: any };
    try {
      youCamResult = await checkTaskStatus("hair-transfer", creation.taskId);
    } catch (err: any) {
      console.error("[checkHairStyleStatus] YouCam error:", err.message);
      return { success: true, status: "PROCESSING" };
    }

    if (youCamResult.status === "success") {
      const finalImageUrl =
        youCamResult.results?.image_url ||
        youCamResult.results?.url ||
        (Array.isArray(youCamResult.results)
          ? youCamResult.results[0]?.url
          : null);

      if (!finalImageUrl) {
        await prisma.creation.update({
          where: { id: creation.id },
          data: { status: "FAILED" },
        });
        return { success: true, status: "FAILED" };
      }

      await prisma.creation.update({
        where: { id: creation.id },
        data: {
          status: "COMPLETED",
          imageUrl: finalImageUrl,
          metadata: {
            ...((creation.metadata as object) || {}),
            youcamResult: youCamResult.results,
          },
        },
      });

      // 🎯 Deduct USER credits (creditsUsed = 1)
      await prisma.user.update({
        where: { id: creation.userId },
        data: {
          credits: { decrement: creation.creditsUsed }, // ← 1
          totalGenerations: { increment: 1 },
        },
      });

      await prisma.creditTransaction.create({
        data: {
          userId: creation.userId,
          amount: -creation.creditsUsed, // ← -1
          reason: "USAGE",
          metadata: {
            creationId: creation.id,
            feature: "HAIRSTYLE",
          },
        },
      });

      revalidateUserData();

      return {
        success: true,
        status: "COMPLETED",
        imageUrl: finalImageUrl,
      };
    }

    if (youCamResult.status === "error") {
      await prisma.creation.update({
        where: { id: creation.id },
        data: { status: "FAILED" },
      });
      return { success: true, status: "FAILED" };
    }

    return { success: true, status: "PROCESSING" };
  } catch (err: any) {
    console.error("[checkHairStyleStatus] 💥 Error:", err.message);
    return { success: true, status: "PROCESSING" };
  }
}