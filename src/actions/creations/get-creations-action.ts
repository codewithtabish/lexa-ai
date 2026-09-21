// src/actions/creations/get-creations-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

import prisma from "@/lib/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-key";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type Creation = {
  id: string;
  feature: string;
  imageUrl: string | null;
  originalImageUrl: string | null;
  prompt: string | null;
  creditsUsed: number;
  status: string;
  createdAt: Date;
};

type GetCreationsResult =
  | { success: true; creations: Creation[] }
  | { success: false; error: string };

interface GetCreationsInput {
  /** Optional filter — "HAIRSTYLE" | "IMAGEGEN" | etc. */
  feature?: string;
  /** Optional limit — for "Recent Creations" (e.g. 8) vs full History */
  limit?: number;
}

// ═══════════════════════════════════════════════════════════
// SHARED SELECT FIELDS
// ═══════════════════════════════════════════════════════════

const CREATION_SELECT = {
  id: true,
  feature: true,
  imageUrl: true,
  originalImageUrl: true,
  prompt: true,
  creditsUsed: true,
  status: true,
  createdAt: true,
} as const;

// ═══════════════════════════════════════════════════════════
// CACHED QUERY
// ═══════════════════════════════════════════════════════════
// Cache key is auto-generated from (userId, feature, limit).
// Each combination is cached independently.

async function getCachedCreations(
  userId: string,
  feature?: string,
  limit?: number
): Promise<Creation[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.creations);

  const creations = await prisma.creation.findMany({
    where: {
      userId,
      status: "COMPLETED",
      ...(feature ? { feature: feature as any } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: CREATION_SELECT,
  });

  // Empty array is a valid cached result (new user with no creations).
  // It will be invalidated when the user creates their first image.
  return creations;
}

// ═══════════════════════════════════════════════════════════
// DIRECT DB READ (bypasses cache — for cold start retries)
// ═══════════════════════════════════════════════════════════

async function getCreationsDirect(
  userId: string,
  feature?: string,
  limit?: number
): Promise<Creation[] | null> {
  try {
    return await prisma.creation.findMany({
      where: {
        userId,
        status: "COMPLETED",
        ...(feature ? { feature: feature as any } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: CREATION_SELECT,
    });
  } catch (err: any) {
    console.warn("[getCreationsDirect] DB error:", err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN ACTION
// ═══════════════════════════════════════════════════════════

export async function getCreationsAction(
  input: GetCreationsInput = {}
): Promise<GetCreationsResult> {
  const startTime = Date.now();

  try {
    // ─── Step 1: Auth ───
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: false, error: "Not authenticated." };
    }

    // ─── Step 2: Get DB user ───
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!dbUser) {
      return { success: false, error: "User account not found." };
    }

    // ─── Step 3: Try cache (fast path) ───
    try {
      const cached = await getCachedCreations(
        dbUser.id,
        input.feature,
        input.limit
      );
      console.log(
        `[getCreationsAction] ⚡ Cache hit (${Date.now() - startTime}ms, ${cached.length} items)`
      );
      return { success: true, creations: cached };
    } catch (err: any) {
      console.log(`[getCreationsAction] 🔄 Cache miss → retry with direct DB`);
    }

    // ─── Step 4: Retry with direct DB (cold start handling) ───
    const delays = [400, 700, 1000, 1400, 1800, 2200];

    for (let attempt = 0; attempt < delays.length; attempt++) {
      if (Date.now() - startTime > 8000) {
        console.warn(`[getCreationsAction] ⏰ Time budget reached`);
        break;
      }

      await new Promise((r) => setTimeout(r, delays[attempt]));

      const direct = await getCreationsDirect(
        dbUser.id,
        input.feature,
        input.limit
      );

      // Non-null return = successful DB read (even empty array is valid)
      if (direct !== null) {
        const elapsed = Date.now() - startTime;
        console.log(
          `[getCreationsAction] ✅ Direct DB on retry ${attempt + 1} (${elapsed}ms, ${direct.length} items)`
        );

        // Prime the cache for future calls
        try {
          revalidateTag(CACHE_TAGS.creations, "max");
        } catch {
          // Non-critical
        }

        return { success: true, creations: direct };
      }

      console.log(
        `[getCreationsAction] ⏳ Retry ${attempt + 1}/${delays.length}`
      );
    }

    // ─── Step 5: All retries failed ───
    const totalTime = Date.now() - startTime;
    console.warn(`[getCreationsAction] ❌ Failed after ${totalTime}ms`);

    return {
      success: false,
      error: "Could not load creations. Please try again.",
    };
  } catch (err: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[getCreationsAction] 💥 Error (${totalTime}ms):`, err.message);
    return { success: false, error: "Failed to load creations." };
  }
}