// src/actions/agestudio/age-studio-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import OpenAI, { toFile } from "openai";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma-client";
import { getFeatureCost } from "@/lib/youcam/feature-costs";
import { uploadYouCamResult } from "@/lib/images/upload-youcam-result";
import { revalidateUserData } from "@/lib/revalidate-user";

// ═══════════════════════════════════════════════════════════
// OPENAI CLIENT
// ═══════════════════════════════════════════════════════════

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type StartAgeSimulatorInput = {
  imageUrl: string;
  ages: number[];
  aspectRatio: string;
};

type StartAgeSimulatorResult =
  | {
      success: true;
      creationId: string;
      images: string[];
      creditsUsed: number;
    }
  | { success: false; error: string };

// ═══════════════════════════════════════════════════════════
// 🎯 PROMPT BUILDER — ONE AGE, ONE FACE, ONE IMAGE
// ═══════════════════════════════════════════════════════════

function buildAgePrompt(age: number): string {
  return `Generate ONE SINGLE photorealistic portrait photograph of the SAME PERSON shown in the input image, but aged to exactly ${age} years old.

🚨 ABSOLUTE OUTPUT RULES — READ CAREFULLY 🚨
- Output contains EXACTLY ONE (1) FACE.
- Output contains EXACTLY ONE (1) PERSON.
- This is a SINGLE PORTRAIT PHOTOGRAPH — nothing else.
- NO grids. NO collages. NO side-by-side. NO split panels.
- NO multiple faces. NO multiple people. NO before/after.
- NO timeline. NO sequence. NO variations side-by-side.
- If you are about to draw more than one face — STOP. That is WRONG.
- Draw ONE face. Just ONE. The same person at age ${age}.

SUBJECT:
- SAME PERSON as input — identical bone structure, eye shape, eye color, nose shape, lip shape, natural hair base color, ethnicity, and identity.
- ONLY the age changes. Transform this exact person to ${age} years old.

STYLE:
- Ultra-realistic, editorial magazine quality photograph
- Warm amber cinematic lighting (golden hour)
- Head and shoulders portrait, slight 3/4 angle
- Calm, dignified, serene expression
- Dignified aging — NO sad, weak, tired, or unhealthy appearance
- Modest clothing: high-neck top, turtleneck, or crew-neck in warm neutral tones
- Background: soft blurred warm amber gradient

ABSOLUTE RULES:
- NO nudity, NO revealing clothing, NO cleavage, NO bare shoulders
- NO text, NO watermarks, NO labels, NO numbers written in the image
- NO cartoon, NO 3D render, NO anime — photorealistic ONLY
- ONE person. ONE face. ONE portrait. Age ${age}.`;
}

// ═══════════════════════════════════════════════════════════
// MAIN ACTION
// ═══════════════════════════════════════════════════════════

export async function startAgeSimulator({
  imageUrl,
  ages,
  aspectRatio,
}: StartAgeSimulatorInput): Promise<StartAgeSimulatorResult> {
  try {
    // ─────────────────────────────────────────
    // 1. AUTH
    // ─────────────────────────────────────────
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: false, error: "You must be signed in." };
    }

    // ─────────────────────────────────────────
    // 2. VALIDATE INPUT
    // ─────────────────────────────────────────
    if (!imageUrl || typeof imageUrl !== "string") {
      return { success: false, error: "Please upload a photo first." };
    }

    if (!Array.isArray(ages) || ages.length === 0) {
      return { success: false, error: "Please select at least one age." };
    }

    if (ages.length > 6) {
      return { success: false, error: "You can select up to 6 ages." };
    }

    // ─────────────────────────────────────────
    // 3. GET USER + CHECK CREDITS
    // ─────────────────────────────────────────
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, credits: true },
    });

    if (!dbUser) {
      return { success: false, error: "User account not found." };
    }

    // 🎯 FLAT COST — 2 credits no matter how many ages
    const totalCost = getFeatureCost("AGE"); // → 2

    if (dbUser.credits < totalCost) {
      return {
        success: false,
        error: `You need ${totalCost} credits but have ${dbUser.credits}. Please upgrade.`,
      };
    }

    // ─────────────────────────────────────────
    // 4. DOWNLOAD SOURCE IMAGE (once)
    // ─────────────────────────────────────────
    let imageBuffer: Buffer;
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      imageBuffer = Buffer.from(await response.arrayBuffer());
    } catch (err: any) {
      console.error("[startAgeSimulator] Image fetch failed:", err.message);
      return {
        success: false,
        error: "Could not read your photo. Please try uploading again.",
      };
    }

    // ─────────────────────────────────────────
    // 5. 🎯 GENERATE ONE IMAGE PER AGE (PARALLEL, n:1 each)
    // ─────────────────────────────────────────
    const generationResults = await Promise.allSettled(
      ages.map(async (age, index) => {
        try {
          // Fresh file handle per call — OpenAI client consumes the stream
          const imageFile = await toFile(imageBuffer, `input-${age}.png`, {
            type: "image/png",
          });

          const response = await openai.images.edit({
            model: "gpt-image-1.5",
            image: imageFile,
            prompt: buildAgePrompt(age),
            n: 1, // 🎯 ONE image per call — CANNOT be a grid
            size: "1024x1024",
            input_fidelity: "high",
            output_format: "png",
          });

          const img = response.data?.[0];
          if (!img) {
            throw new Error(`No image returned for age ${age}`);
          }

          const dataUrl = img.b64_json
            ? `data:image/png;base64,${img.b64_json}`
            : img.url;

          if (!dataUrl) {
            throw new Error(`No image data for age ${age}`);
          }

          // Upload to our S3
          const uploaded = await uploadYouCamResult({
            youCamUrl: dataUrl,
            fileName: `age-${age}-${Date.now()}-${index}`,
            feature: "age-studio/results",
          });

          console.log(
            `[startAgeSimulator] ✅ Age ${age} generated → ${uploaded.url}`
          );

          return { age, url: uploaded.url };
        } catch (err: any) {
          console.error(
            `[startAgeSimulator] ❌ Age ${age} failed:`,
            err.message
          );
          throw new Error(`Age ${age}: ${err.message}`);
        }
      })
    );

    // ─────────────────────────────────────────
    // 6. COLLECT SUCCESS + FAILURES
    // ─────────────────────────────────────────
    const succeeded: { age: number; url: string }[] = [];
    const failedAges: number[] = [];

    generationResults.forEach((result, i) => {
      if (result.status === "fulfilled") {
        succeeded.push(result.value);
      } else {
        failedAges.push(ages[i]);
      }
    });

    if (succeeded.length === 0) {
      return {
        success: false,
        error:
          "Generation failed for all selected ages. Please try again with a different photo.",
      };
    }

    // Sort by age for consistent order
    succeeded.sort((a, b) => a.age - b.age);

    const imageUrls = succeeded.map((s) => s.url);
    const successAges = succeeded.map((s) => s.age);

    // ─────────────────────────────────────────
    // 7. CREATE CREATION RECORD
    // ─────────────────────────────────────────
    const creation = await prisma.creation.create({
      data: {
        userId: dbUser.id,
        feature: "AGE",
        originalImageUrl: imageUrl,
        images: imageUrls,
        status: "COMPLETED",
        creditsUsed: totalCost,
        taskId: `oai_${randomUUID()}`,
        metadata: {
          ages: successAges,
          requestedAges: ages,
          ...(failedAges.length > 0 && { failedAges }),
          aspectRatio,
          provider: "openai",
          model: "gpt-image-1.5",
          imageCount: imageUrls.length,
          requestedCount: ages.length,
        },
      },
    });

    // ─────────────────────────────────────────
    // 8. DEDUCT USER CREDITS (FLAT 2)
    // ─────────────────────────────────────────
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        credits: { decrement: totalCost },
        totalGenerations: { increment: 1 },
      },
    });

    // ─────────────────────────────────────────
    // 9. CREDIT TRANSACTION (audit log)
    // ─────────────────────────────────────────
    await prisma.creditTransaction.create({
      data: {
        userId: dbUser.id,
        amount: -totalCost,
        reason: "USAGE",
        metadata: {
          creationId: creation.id,
          feature: "AGE",
          ages: successAges,
          ...(failedAges.length > 0 && { failedAges }),
          provider: "openai",
        },
      },
    });

    // ─────────────────────────────────────────
    // 10. REVALIDATE USER DATA
    // ─────────────────────────────────────────
    revalidateUserData();

    console.log(
      `[startAgeSimulator] ✅ Complete: ${imageUrls.length}/${ages.length} images, ${totalCost} credits (flat)`
    );

    return {
      success: true,
      creationId: creation.id,
      images: imageUrls,
      creditsUsed: totalCost,
    };
  } catch (err: any) {
    console.error("[startAgeSimulator] 💥 Unexpected error:", err.message);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}