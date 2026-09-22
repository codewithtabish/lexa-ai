// src/actions/emojistudio/emoji-studio-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { generateHiveImage } from "@/lib/hive/client";
import { uploadHiveResult } from "@/lib/images/upload-hive-result";
import { revalidateUserData } from "@/lib/revalidate-user";
import prisma from "@/lib/prisma-client";

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const USER_CREDITS_COST = 0; // 🆓 FREE feature

const ALLOWED_SIZES = [
  { width: 1024, height: 1024 },
  { width: 1280, height: 960 },
  { width: 960, height: 1280 },
  { width: 768, height: 1344 },
] as const;

const MIN_STEPS = 4;
const MAX_STEPS = 20;
const MAX_PROMPT_LENGTH = 200;
const MIN_PROMPT_LENGTH = 3;
const MAX_COUNT = 6;

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type GenerateEmojiInput = {
  prompt: string;
  count?: number;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
};

type GenerateEmojiResult =
  | {
      success: true;
      imageUrls: string[];
      creationId: string;
    }
  | { success: false; error: string };

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function isValidSize(w: number, h: number) {
  return ALLOWED_SIZES.some((s) => s.width === w && s.height === h);
}

// ═══════════════════════════════════════════════════════════
// MAIN ACTION
// ═══════════════════════════════════════════════════════════

export async function generateEmojis({
  prompt,
  count = 2,
  width = 1024,
  height = 1024,
  steps = 4,
  seed,
}: GenerateEmojiInput): Promise<GenerateEmojiResult> {
  try {
    // ─── 1. AUTH ───
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: false, error: "You must be signed in." };
    }

    // ─── 2. USER ───
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!dbUser) {
      return { success: false, error: "User account not found." };
    }

    // ─── 3. VALIDATE ───
    const cleanPrompt = (prompt ?? "").trim();

    if (cleanPrompt.length < MIN_PROMPT_LENGTH) {
      return { success: false, error: "Please enter a longer prompt." };
    }
    if (cleanPrompt.length > MAX_PROMPT_LENGTH) {
      return {
        success: false,
        error: `Prompt is too long (max ${MAX_PROMPT_LENGTH} chars).`,
      };
    }
    if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
      return {
        success: false,
        error: `Number of emojis must be between 1 and ${MAX_COUNT}.`,
      };
    }
    if (!Number.isInteger(steps) || steps < MIN_STEPS || steps > MAX_STEPS) {
      return {
        success: false,
        error: `Steps must be between ${MIN_STEPS} and ${MAX_STEPS}.`,
      };
    }
    if (!isValidSize(width, height)) {
      return { success: false, error: "Invalid image size." };
    }

    // ─── 4. GENERATE N EMOJIS IN PARALLEL ───
    const generateResults = await Promise.allSettled(
      Array.from({ length: count }).map((_, i) => {
        const imageSeed =
          typeof seed === "number" ? seed + i : Math.floor(Math.random() * 1e9);

        return generateHiveImage({
          prompt: cleanPrompt,
          model: "hive/flux-schnell-emoji",
          width,
          height,
          steps,
          seed: imageSeed,
          // 🎯 NO outputFormat — emoji model handles it
        });
      })
    );

    const generated: { url: string; taskId: string }[] = [];
    generateResults.forEach((r, i) => {
      if (r.status === "fulfilled") {
        generated.push({ url: r.value.imageUrl, taskId: r.value.taskId });
      } else {
        console.error(`[generateEmojis] Emoji ${i + 1} failed:`, r.reason);
      }
    });

    if (generated.length === 0) {
      return {
        success: false,
        error: "Could not generate emojis. Please try again.",
      };
    }

    // ─── 5. UPLOAD EACH TO S3 IN PARALLEL ───
    const uploadResults = await Promise.allSettled(
      generated.map((g, i) =>
        uploadHiveResult({
          sourceUrl: g.url,
          fileName: `emoji-${i + 1}`,
          feature: "emojis",
        })
      )
    );

    const imageUrls: string[] = [];
    uploadResults.forEach((r, i) => {
      if (r.status === "fulfilled") {
        imageUrls.push(r.value.url);
      } else {
        console.error(`[generateEmojis] Upload ${i + 1} failed:`, r.reason);
      }
    });

    if (imageUrls.length === 0) {
      return {
        success: false,
        error: "Failed to save emojis. Please try again.",
      };
    }

    // ─── 6. SAVE CREATION WITH images ARRAY ───
    const creation = await prisma.creation.create({
      data: {
        userId: dbUser.id,
        feature: "IMAGEGEN",
        originalImageUrl: null,
        prompt: cleanPrompt,
        taskId: generated[0]?.taskId || null,
        status: "COMPLETED",
        creditsUsed: USER_CREDITS_COST,
        images: imageUrls,
        metadata: {
          type: "emoji",
          model: "hive/flux-schnell-emoji",
          count: imageUrls.length,
          requestedCount: count,
          width,
          height,
          steps,
          seed: typeof seed === "number" ? seed : null,
          free: true,
          hiveSourceUrls: generated.map((g) => g.url),
        },
      },
    });

    // ─── 7. INCREMENT COUNTER ───
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { totalGenerations: { increment: 1 } },
    });

    revalidateUserData();

    console.log(
      `[generateEmojis] ✅ Generated ${imageUrls.length}/${count} emojis`
    );

    return {
      success: true,
      imageUrls,
      creationId: creation.id,
    };
  } catch (err: any) {
    console.error("[generateEmojis] 💥 Error:", err.message);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}