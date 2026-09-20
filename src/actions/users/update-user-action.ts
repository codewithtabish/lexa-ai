"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

import prisma from "@/lib/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-key";

// ============================================
// TYPES
// ============================================

type FeatureType =
  | "HAIRSTYLE"
  | "BEARD"
  | "OUTFIT"
  | "AGE"
  | "HAIRCOLOR"
  | "IMAGEGEN";

// Credit cost per feature
const FEATURE_COSTS: Record<FeatureType, number> = {
  HAIRSTYLE: 5,
  BEARD: 5,
  OUTFIT: 10,
  AGE: 10,
  HAIRCOLOR: 5,
  IMAGEGEN: 0, // free
};

type DeductCreditsResult =
  | { success: true; creditsRemaining: number }
  | { success: false; error: string };

// ============================================
// DEDUCT CREDITS (called after successful generation)
// ============================================

export async function deductCreditsAction(
  feature: FeatureType,
): Promise<DeductCreditsResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated." };
    }

    const cost = FEATURE_COSTS[feature];
    if (cost === 0) {
      return { success: true, creditsRemaining: -1 }; // free feature
    }

    // Fetch current credits
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    if (user.credits < cost) {
      return { success: false, error: "Not enough credits." };
    }

    // Deduct credits + increment generations in one transaction
    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { clerkId: userId },
        data: {
          credits: { decrement: cost },
          totalGenerations: { increment: 1 },
          lastActiveAt: new Date(),
        },
        select: { credits: true },
      });

      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -cost,
          reason: "USAGE",
          metadata: { feature },
        },
      });

      return u;
    });

    // ============================================
    // ✅ REVALIDATE CACHE + PATH
    // ============================================
    revalidateTag(CACHE_TAGS.users,"default");
    revalidatePath("/app");

    return {
      success: true,
      creditsRemaining: updated.credits,
    };
  } catch (err) {
    console.error("[deductCreditsAction] Error:", err);
    return { success: false, error: "Failed to deduct credits." };
  }
}