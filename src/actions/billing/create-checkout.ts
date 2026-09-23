// src/actions/billing/create-checkout.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma-client";
import { getPlan, type PlanId } from "@/data/plans";
import { createSubscriptionCheckout } from "@/lib/safepay/client";
import { SAFEPAY_CONFIG } from "@/lib/safepay/config";

type Result =
  | { success: true; checkoutUrl: string }
  | { success: false; error: string };

export async function createCheckout(planId: PlanId): Promise<Result> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "You must be signed in." };

    const plan = getPlan(planId);
    if (!plan) return { success: false, error: "Invalid plan." };

    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, email: true },
    });
    if (!dbUser) return { success: false, error: "User not found." };

    const reference = `${dbUser.id}-${Date.now()}`;

    const checkoutUrl = await createSubscriptionCheckout({
      planId: plan.safepayPlanId,
      reference,
      cancelUrl: `${SAFEPAY_CONFIG.appUrl}/pricing`,
      // 🎯 Redirect to API route, not a page
      redirectUrl: `${SAFEPAY_CONFIG.appUrl}/api/payment-confirm?ref=${reference}`,
    });

    await prisma.safepaySubscription.create({
      data: {
        userId: dbUser.id,
        safepayTrackerId: reference,
        planType: planId,
        status: "ACTIVE",
        amount: plan.priceCents,
        currency: "USD",
      },
    });

    console.log(`[createCheckout] ✅ ${planId} → ${checkoutUrl}`);

    return { success: true, checkoutUrl };
  } catch (err: any) {
    console.error("[createCheckout] 💥", err?.message ?? err);
    return { success: false, error: "Could not start checkout." };
  }
}