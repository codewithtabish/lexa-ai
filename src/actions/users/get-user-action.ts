// src/actions/users/get-user-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

import prisma from "@/lib/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-key";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type UserInfo = {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  credits: number;
  plan: "FREE" | "BASIC" | "PRO";
  isPro: boolean;
  planStartedAt: Date | null;
  planExpiresAt: Date | null;
  nextRenewalAt: Date | null;
  totalGenerations: number;
  lastActiveAt: Date;
};

export type CreationItem = {
  id: string;
  feature: string;
  imageUrl: string | null;
  images: string[];              // 🆕 multi-image features (Age)
  originalImageUrl: string | null;
  prompt: string | null;
  creditsUsed: number;
  status: string;
  metadata: any;                 // 🆕 for ages array, provider, etc.
  createdAt: Date;
};

type GetUserResult =
  | {
      success: true;
      user: UserInfo;
      creations: CreationItem[];
    }
  | { success: false; error: string };

interface GetUserInput {
  creationsLimit?: number;
}

// ═══════════════════════════════════════════════════════════
// SHARED SELECT FIELDS
// ═══════════════════════════════════════════════════════════

const USER_SELECT = {
  id: true,
  clerkId: true,
  email: true,
  firstName: true,
  lastName: true,
  imageUrl: true,
  credits: true,
  plan: true,
  isPro: true,
  planStartedAt: true,
  planExpiresAt: true,
  nextRenewalAt: true,
  totalGenerations: true,
  lastActiveAt: true,
} as const;

const CREATION_SELECT = {
  id: true,
  feature: true,
  imageUrl: true,
  images: true,                  // 🆕
  originalImageUrl: true,
  prompt: true,
  creditsUsed: true,
  status: true,
  metadata: true,                // 🆕
  createdAt: true,
} as const;

// ═══════════════════════════════════════════════════════════
// CACHED QUERY
// ═══════════════════════════════════════════════════════════

async function getCachedAppData(
  clerkId: string,
  creationsLimit: number
): Promise<{ user: UserInfo; creations: CreationItem[] }> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.users);

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: USER_SELECT,
  });

  if (!user) {
    throw new Error(`USER_NOT_FOUND:${clerkId}`);
  }

  let creations: CreationItem[] = [];
  if (creationsLimit > 0) {
    creations = await prisma.creation.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
      take: creationsLimit,
      select: CREATION_SELECT,
    });
  }

  return { user, creations };
}

// ═══════════════════════════════════════════════════════════
// DIRECT DB READ
// ═══════════════════════════════════════════════════════════

async function getAppDataDirect(
  clerkId: string,
  creationsLimit: number
): Promise<{ user: UserInfo; creations: CreationItem[] } | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: USER_SELECT,
    });

    if (!user) return null;

    let creations: CreationItem[] = [];
    if (creationsLimit > 0) {
      creations = await prisma.creation.findMany({
        where: {
          userId: user.id,
          status: "COMPLETED",
        },
        orderBy: { createdAt: "desc" },
        take: creationsLimit,
        select: CREATION_SELECT,
      });
    }

    return { user, creations };
  } catch (err: any) {
    console.warn("[getAppDataDirect] DB error:", err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN ACTION
// ═══════════════════════════════════════════════════════════

export async function getUserAction(
  input: GetUserInput = {}
): Promise<GetUserResult> {
  const creationsLimit = input.creationsLimit ?? 8;

  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated." };
    }

    try {
      const cached = await getCachedAppData(userId, creationsLimit);
      return {
        success: true,
        user: cached.user,
        creations: cached.creations,
      };
    } catch (err: any) {
      if (!err.message?.startsWith("USER_NOT_FOUND:")) throw err;
    }

    const delays = [400, 700, 1000, 1400, 1800, 2200, 2500];

    for (let attempt = 0; attempt < delays.length; attempt++) {
      await new Promise((r) => setTimeout(r, delays[attempt]));

      const direct = await getAppDataDirect(userId, creationsLimit);

      if (direct) {
        try {
          revalidateTag(CACHE_TAGS.users, "max");
        } catch {}

        return {
          success: true,
          user: direct.user,
          creations: direct.creations,
        };
      }
    }

    return {
      success: false,
      error: "Setting up your account. Please refresh in a moment.",
    };
  } catch (err: any) {
    console.error(`[getUserAction] 💥 Error:`, err.message);
    return { success: false, error: "Failed to load user data." };
  }
}