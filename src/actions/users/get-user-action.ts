// src/actions/users/get-user-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";

import prisma from "@/lib/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-key";

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

type GetUserResult =
  | { success: true; user: UserInfo }
  | { success: false; error: string };

async function getCachedUser(clerkId: string): Promise<UserInfo> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.users);

  console.log(`[getCachedUser] 🔍 DB query for: ${clerkId}`);

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true, clerkId: true, email: true,
      firstName: true, lastName: true, imageUrl: true,
      credits: true, plan: true, isPro: true,
      planStartedAt: true, planExpiresAt: true, nextRenewalAt: true,
      totalGenerations: true, lastActiveAt: true,
    },
  });

  if (!user) {
    console.log(`[getCachedUser] ❌ NULL → will NOT cache`);
    throw new Error(`USER_NOT_FOUND:${clerkId}`);
  }

  console.log(`[getCachedUser] ✅ Found (${user.credits} credits) → caching`);
  return user;
}

export async function getUserAction(): Promise<GetUserResult> {
  try {
    const { userId } = await auth();
    console.log(`\n[getUserAction] 🚀 Called for: ${userId ?? "NONE"}`);

    if (!userId) {
      return { success: false, error: "Not authenticated." };
    }

    // ─── Attempt 1: cached lookup ───
    try {
      const user = await getCachedUser(userId);
      console.log(`[getUserAction] ⚡ From cache: ${user.credits} credits`);
      return { success: true, user };
    } catch (err: any) {
      if (!err.message?.startsWith("USER_NOT_FOUND:")) throw err;
      console.log(`[getUserAction] ⏳ Not yet in DB (webhook still running)`);
    }

    // ─── Retry: 6 attempts × 800ms = ~5 seconds ───
    for (let attempt = 1; attempt <= 6; attempt++) {
      console.log(`[getUserAction] 🔄 Retry ${attempt}/6 in 800ms...`);
      await new Promise((r) => setTimeout(r, 800));

      try {
        const user = await getCachedUser(userId);
        console.log(
          `[getUserAction] ✅ Found & cached on retry ${attempt}: ${user.credits} credits`
        );
        return { success: true, user };
      } catch (err: any) {
        if (!err.message?.startsWith("USER_NOT_FOUND:")) throw err;
        console.log(`[getUserAction] ⏳ Retry ${attempt} — still NULL`);
      }
    }

    console.log(`[getUserAction] ❌ Not found after 6 retries`);
    return {
      success: false,
      error: "Setting up your account. Please refresh in a moment.",
    };
  } catch (err: any) {
    console.error(`[getUserAction] 💥 Error:`, err.message);
    return { success: false, error: "Failed to load user data." };
  }
}