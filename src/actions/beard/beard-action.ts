// src/actions/beard/beard-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { startTask, checkTaskStatus } from "@/lib/youcam/client";
import { revalidateUserData } from "@/lib/revalidate-user";
import { getFeatureCost } from "@/lib/youcam/feature-costs";
import prisma from "@/lib/prisma-client";
import { uploadYouCamResult } from "@/lib/images/upload-youcam-result";

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

// 👤 What the USER pays
const USER_CREDITS_COST = getFeatureCost("BEARD"); // → 1

// 🔑 What YOUCAM charges our key (AI Beard Style = 2 units)
const YOUCAM_CREDITS_COST = 2;

const YOUCAM_ENDPOINT = "beard-style";
const TASK_TIMEOUT_MS = 5 * 60 * 1000; // 5 min

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type StartBeardInput = {
  imageUrl: string;
  beardTemplateId: string; // 🎯 comes from UI (from getBeardTemplates)
  beardTemplateName?: string; // optional — for nicer history display
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
// START BEARD STYLE
// ═══════════════════════════════════════════════════════════

export async function startBeardStyle({
  imageUrl,
  beardTemplateId,
  beardTemplateName,
}: StartBeardInput): Promise<StartResult> {
  try {
    // ─── 1. AUTH ───
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: false, error: "You must be signed in." };
    }

    // ─── 2. VALIDATE INPUT ───
    if (!imageUrl || typeof imageUrl !== "string") {
      return { success: false, error: "Please upload a photo first." };
    }
    if (!beardTemplateId || typeof beardTemplateId !== "string") {
      return { success: false, error: "Please select a beard style." };
    }

    // ─── 3. GET USER + CHECK CREDITS ───
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, credits: true },
    });

    if (!dbUser) {
      return { success: false, error: "User account not found." };
    }

    if (dbUser.credits < USER_CREDITS_COST) {
      return {
        success: false,
        error: `You need ${USER_CREDITS_COST} credits but have ${dbUser.credits}. Please upgrade.`,
      };
    }

    // ─── 4. START YOUCAM TASK ───
    console.log("");
    console.log("══════════════════════════════════════════════");
    console.log("🧔 LEXA AI — BEARD STUDIO (YouCam)");
    console.log("══════════════════════════════════════════════");
    console.log(`👤 User image: ${imageUrl}`);
    console.log(`🧔 Template ID: ${beardTemplateId}`);
    console.log(`🧔 Template Name: ${beardTemplateName ?? "(none)"}`);
    console.log(`⚙️  Endpoint: ${YOUCAM_ENDPOINT}`);
    console.log(`💰 YouCam cost: ${YOUCAM_CREDITS_COST} units`);

    let taskId: string;
    try {
      taskId = await startTask(
        YOUCAM_ENDPOINT,
        {
          src_file_url: imageUrl,
          template_id: beardTemplateId, // 🎯 straight from UI → YouCam
        },
        YOUCAM_CREDITS_COST // 👈 deducts 2 from YouCam key
      );
      console.log("[startBeardStyle] ✅ Task started:", taskId);
    } catch (err: any) {
      console.error("[startBeardStyle] YouCam error:", err.message);
      return {
        success: false,
        error: "Could not start generation. Please try again.",
      };
    }

    // ─── 5. SAVE CREATION ───
    const creation = await prisma.creation.create({
      data: {
        userId: dbUser.id,
        feature: "BEARD",
        originalImageUrl: imageUrl,
        taskId,
        status: "PROCESSING",
        creditsUsed: USER_CREDITS_COST, // 👈 1 — what user pays
        imageUrl: null,
        metadata: {
          provider: "youcam",
          youcamCost: YOUCAM_CREDITS_COST,
          endpoint: YOUCAM_ENDPOINT,
          beardTemplateId,
          beardTemplateName: beardTemplateName ?? null,
        },
      },
    });

    console.log(
      `[startBeardStyle] ✅ Creation saved: ${creation.id} (user: ${USER_CREDITS_COST}, youcam: ${YOUCAM_CREDITS_COST})`
    );

    return {
      success: true,
      creationId: creation.id,
      taskId,
      userCost: USER_CREDITS_COST,
    };
  } catch (err: any) {
    console.error("[startBeardStyle] 💥 Error:", err.message);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// ═══════════════════════════════════════════════════════════
// CHECK STATUS
// ═══════════════════════════════════════════════════════════

export async function checkBeardStyleStatus({
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

    // ─── Already COMPLETED ───
    if (creation.status === "COMPLETED") {
      return {
        success: true,
        status: "COMPLETED",
        imageUrl: creation.imageUrl || "",
      };
    }

    // ─── Already FAILED ───
    if (creation.status === "FAILED") {
      return { success: true, status: "FAILED" };
    }

    // ─── Timeout check ───
    const age = Date.now() - creation.createdAt.getTime();
    if (age > TASK_TIMEOUT_MS) {
      await prisma.creation.update({
        where: { id: creation.id },
        data: { status: "FAILED" },
      });
      return { success: true, status: "FAILED" };
    }

    // ─── Poll YouCam ───
    let youCamResult: { status: string; results?: any };
    try {
      youCamResult = await checkTaskStatus(YOUCAM_ENDPOINT, creation.taskId);
    } catch (err: any) {
      console.error("[checkBeardStyleStatus] YouCam error:", err.message);
      return { success: true, status: "PROCESSING" };
    }

    // 🎯 Normalize status (YouCam: "running" | "success" | "error")
    const normalized = String(youCamResult.status ?? "").toLowerCase();

    // ─── Not done yet ───
    if (normalized === "running" || normalized === "processing") {
      return { success: true, status: "PROCESSING" };
    }

    // ─── Error ───
    if (normalized === "error" || normalized === "failed") {
      await prisma.creation.update({
        where: { id: creation.id },
        data: { status: "FAILED" },
      });
      return { success: true, status: "FAILED" };
    }

    // ─── SUCCESS ───
    if (normalized !== "success" && normalized !== "completed") {
      return { success: true, status: "PROCESSING" };
    }

    // 🎯 Extract YouCam's TEMPORARY URL (expires in 2h)
    const youCamTempUrl =
      youCamResult.results?.image_url ||
      youCamResult.results?.url ||
      (Array.isArray(youCamResult.results)
        ? youCamResult.results[0]?.url
        : null);

    if (!youCamTempUrl) {
      console.error(
        "[checkBeardStyleStatus] No image URL in results:",
        youCamResult.results
      );
      await prisma.creation.update({
        where: { id: creation.id },
        data: { status: "FAILED" },
      });
      return { success: true, status: "FAILED" };
    }

    // ═══════════════════════════════════════════════════
    // 🎯 CRITICAL: Download from YouCam + Upload to OUR S3
    // ═══════════════════════════════════════════════════
    let permanentUrl: string;

    try {
      const fileName = creation.originalImageUrl
        ? creation.originalImageUrl.split("/").pop()?.split(".")[0]
        : "beard";

      const uploaded = await uploadYouCamResult({
        youCamUrl: youCamTempUrl,
        fileName: `${fileName || "beard"}-beard-${Date.now()}`,
        feature: "beard-studio/results",
      });

      permanentUrl = uploaded.url;

      console.log(
        `[checkBeardStyleStatus] ✅ Re-uploaded to our S3: ${permanentUrl}`
      );
    } catch (uploadErr: any) {
      console.error(
        "[checkBeardStyleStatus] S3 re-upload failed:",
        uploadErr.message
      );

      // ⚠️ Fallback: Save YouCam URL anyway (works for 2h)
      permanentUrl = youCamTempUrl;
      console.warn(
        "[checkBeardStyleStatus] ⚠️ Using temporary YouCam URL as fallback"
      );
    }

    // ─── Save result to DB ───
    await prisma.creation.update({
      where: { id: creation.id },
      data: {
        status: "COMPLETED",
        imageUrl: permanentUrl,
        metadata: {
          ...((creation.metadata as object) || {}),
          youcamResult: youCamResult.results,
          youcamOriginalUrl: youCamTempUrl,
          reuploadedToS3: permanentUrl.startsWith(
            process.env.AWS_CLOUDFRONT_URL || "https://"
          ),
        },
      },
    });

    // 🎯 Deduct USER credits
    await prisma.user.update({
      where: { id: creation.userId },
      data: {
        credits: { decrement: creation.creditsUsed },
        totalGenerations: { increment: 1 },
      },
    });

    await prisma.creditTransaction.create({
      data: {
        userId: creation.userId,
        amount: -creation.creditsUsed,
        reason: "USAGE",
        metadata: {
          creationId: creation.id,
          feature: "BEARD",
          provider: "youcam",
        },
      },
    });

    revalidateUserData();

    console.log(`[checkBeardStyleStatus] ✅ Complete: ${permanentUrl}`);

    return {
      success: true,
      status: "COMPLETED",
      imageUrl: permanentUrl,
    };
  } catch (err: any) {
    console.error("[checkBeardStyleStatus] 💥 Error:", err.message);
    return { success: true, status: "PROCESSING" };
  }
}