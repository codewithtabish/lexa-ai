// src/actions/billing/confirm-subscription.ts
"use server";

import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma-client";
import { CACHE_TAGS } from "@/lib/cache-key";
import { PLANS } from "@/data/plans";

type Result =
  | {
      success: true;
      activated: boolean;
      plan?: string;
      creditsGranted?: number;
    }
  | { success: false; error: string };

// 🎯 Map internal plan type → Safepay's real plan ID
function getSafepayPlanIdFromType(planType: string): string | null {
  const plan = PLANS.find((p) => p.id === planType);
  return plan?.safepayPlanId ?? null;
}

export async function confirmSubscriptionByRef(ref: string): Promise<Result> {
  try {
    if (!ref || typeof ref !== "string") {
      return { success: false, error: "Missing payment reference." };
    }

    const sub = await prisma.safepaySubscription.findUnique({
      where: { safepayTrackerId: ref },
    });

    if (!sub) {
      return { success: false, error: "No pending payment found." };
    }

    const credits =
      sub.planType === "PRO" ? 80 : sub.planType === "BASIC" ? 40 : 0;

    // 🎯 Idempotent — already activated, just return success
    if (sub.safepaySubscriptionId) {
      return {
        success: true,
        activated: false,
        plan: sub.planType,
        creditsGranted: credits,
      };
    }

    if (credits === 0) {
      return { success: false, error: "Unknown plan type." };
    }

    const now = new Date();
    const renewalDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 1️⃣ Grant credits + upgrade plan
    await prisma.user.update({
      where: { id: sub.userId },
      data: {
        credits: { increment: credits },
        plan: sub.planType,
        isPro: true,
        paymentProvider: "SAFEPAY",
        planStartedAt: now,
        nextRenewalAt: renewalDate,
      },
    });

    // 2️⃣ Log credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId: sub.userId,
        amount: credits,
        reason: "SUBSCRIPTION",
        metadata: {
          planId: sub.planType,
          reference: ref,
          confirmedVia: "redirect",
        },
      },
    });

    // 3️⃣ Update subscription with ALL fields populated
    await prisma.safepaySubscription.update({
      where: { id: sub.id },
      data: {
        safepaySubscriptionId: `safepay_${ref}`,
        safepayPlanId: getSafepayPlanIdFromType(sub.planType), // 🎯
        currentStart: now,                                     // 🎯
        currentEnd: renewalDate,                               // 🎯
        rawPayload: {                                          // 🎯
          source: "payment-confirm-redirect",
          reference: ref,
          planType: sub.planType,
          amount: sub.amount,
          currency: sub.currency,
          activatedAt: now.toISOString(),
        },
      },
    });

    revalidateTag(CACHE_TAGS.users, "default");

    console.log(
      `[confirmSubscriptionByRef] ✅ ${credits} credits → ${sub.userId}`
    );

    return {
      success: true,
      activated: true,
      plan: sub.planType,
      creditsGranted: credits,
    };
  } catch (err: any) {
    console.error("[confirmSubscriptionByRef] 💥", err);
    return { success: false, error: err.message ?? "Confirmation failed." };
  }
}