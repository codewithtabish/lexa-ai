// src/lib/hive/actions/ai-image.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { generateHiveImage } from "@/lib/hive/client";
import { uploadHiveResult } from "@/lib/images/upload-hive-result";
import { revalidateUserData } from "@/lib/revalidate-user";
import prisma from "@/lib/prisma-client";

const USER_CREDITS_COST = 0; // 🆓 FREE

type GenerateAIImageInput = {
  prompt: string;
  style?: string;
  aspect?: string;
};

type GenerateAIImageResult =
  | { success: true; imageUrl: string; creationId: string }
  | { success: false; error: string };

function getAspectDimensions(aspect: string = "1:1") {
  switch (aspect) {
    case "16:9": return { width: 1344, height: 768 };
    case "9:16": return { width: 768,  height: 1344 };
    case "4:3":  return { width: 1280, height: 960 };
    case "3:4":  return { width: 960,  height: 1280 };
    case "1:1":
    default:     return { width: 1024, height: 1024 };
  }
}

export async function generateAIImage({
  prompt,
  style,
  aspect,
}: GenerateAIImageInput): Promise<GenerateAIImageResult> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "You must be signed in." };

    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!dbUser) return { success: false, error: "User account not found." };

    if (!prompt || prompt.trim().length < 3) {
      return { success: false, error: "Please enter a longer prompt." };
    }
    if (prompt.length > 500) {
      return { success: false, error: "Prompt is too long (max 500 chars)." };
    }

    const finalPrompt = style
      ? `${prompt.trim()}, ${style} style`
      : prompt.trim();

    const { width, height } = getAspectDimensions(aspect);

    // ─── Step 4: Generate via Hive ───
    let generated;
    try {
      generated = await generateHiveImage({
        prompt: finalPrompt,
        model: "hive/flux-schnell-enhanced",
        width,
        height,
        steps: 4,
      });
    } catch (hiveErr: any) {
      console.error("[generateAIImage] Hive error:", hiveErr.message);
      return {
        success: false,
        error: "Could not generate image. Please try again.",
      };
    }

    // ─── Step 5: Download from Hive + Upload to YOUR S3 ───
    let uploaded;
    try {
      uploaded = await uploadHiveResult({
        sourceUrl: generated.imageUrl,  // ✅ URL, not base64
        fileName: "ai-image",
        feature: "ai-images",
      });
    } catch (uploadErr: any) {
      console.error("[generateAIImage] S3 error:", uploadErr.message);
      return {
        success: false,
        error: "Failed to save image. Please try again.",
      };
    }

    // ─── Step 6: Save to DB ───
    const creation = await prisma.creation.create({
      data: {
        userId: dbUser.id,
        feature: "IMAGEGEN",
        originalImageUrl: null,
        prompt: finalPrompt,
        taskId: generated.taskId || null,
        status: "COMPLETED",
        creditsUsed: USER_CREDITS_COST,
        imageUrl: uploaded.url,           // ✅ CloudFront URL
        metadata: {
          model: generated.model,
          aspect: aspect || "1:1",
          style: style || "none",
          free: true,
          hiveSourceUrl: generated.imageUrl, // Keep original for debugging
        },
      },
    });

    // ─── Step 7: Increment counter ───
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { totalGenerations: { increment: 1 } },
    });

    revalidateUserData();

    console.log("[generateAIImage] ✅ Success:", uploaded.url);

    return {
      success: true,
      imageUrl: uploaded.url,
      creationId: creation.id,
    };
  } catch (err: any) {
    console.error("[generateAIImage] 💥 Error:", err.message);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}