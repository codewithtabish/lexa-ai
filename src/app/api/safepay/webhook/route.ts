// src/app/api/safepay/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";
import { verifyWebhookSignature } from "@/lib/safepay/client";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature =
    req.headers.get("x-sfpy-signature") ??
    req.headers.get("x-safepay-signature") ??
    "";

  // ✅ Sync call — no await
  if (!verifyWebhookSignature({ rawBody, signatureHeader: signature })) {
    console.error("[Safepay Webhook] ❌ Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  console.log("[Safepay Webhook] ✅ Event:", event.type);
  console.log("[Safepay Webhook] 📦 Data:", JSON.stringify(event.data, null, 2));

  try {
    // ─────────────────────────────────────────────────────────
    // ACTIVE — payment succeeded / subscription created / renewed
    // ─────────────────────────────────────────────────────────
    const ACTIVE_EVENTS = [
      "payment.succeeded",
      "payment:created",
      "subscription.created",
      "subscription.created:success",
      "subscription.charged",
      "subscription.renewed",
      "subscription.activated",
    ];

    if (ACTIVE_EVENTS.includes(event.type)) {
      // 🎯 Safepay may use `reference` OR `tracker` — try both
      const reference =
        event.data?.reference ??
        event.data?.tracker ??
        event.data?.metadata?.reference ??
        null;

      if (!reference) {
        console.warn("[Webhook] No reference/tracker in payload");
        return NextResponse.json({ received: true });
      }

      const sub = await prisma.safepaySubscription.findUnique({
        where: { safepayTrackerId: reference },
      });

      if (!sub) {
        console.warn(`[Webhook] No subscription for reference ${reference}`);
        return NextResponse.json({ received: true });
      }

      // Skip if already granted (idempotency)
      if (sub.status === "ACTIVE" && sub.safepaySubscriptionId) {
        console.log(`[Webhook] Already active: ${sub.id}`);
        return NextResponse.json({ received: true });
      }

      const credits =
        sub.planType === "PRO" ? 80 : sub.planType === "BASIC" ? 40 : 0;

      if (credits === 0) {
        return NextResponse.json({ received: true });
      }

      await prisma.user.update({
        where: { id: sub.userId },
        data: {
          credits: { increment: credits },
          plan: sub.planType,
          isPro: true,
          paymentProvider: "SAFEPAY",
          planStartedAt: new Date(),
          nextRenewalAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.creditTransaction.create({
        data: {
          userId: sub.userId,
          amount: credits,
          reason: "SUBSCRIPTION",
          metadata: {
            planId: sub.planType,
            reference,
            eventType: event.type,
          },
        },
      });

      await prisma.safepaySubscription.update({
        where: { id: sub.id },
        data: {
          status: "ACTIVE",
          safepaySubscriptionId:
            event.data?.subscription_id ??
            event.data?.subscriptionId ??
            event.data?.id ??
            null,
        },
      });

      console.log(`[Webhook] ✅ ${credits} credits → user ${sub.userId}`);
      return NextResponse.json({ received: true });
    }

    // ─────────────────────────────────────────────────────────
    // INACTIVE — cancelled / failed / expired
    // ─────────────────────────────────────────────────────────
    const INACTIVE_EVENTS = [
      "payment.failed",
      "subscription.cancelled",
      "subscription.canceled",
      "subscription.past_due",
      "subscription.expired",
      "subscription.deactivated",
    ];

    if (INACTIVE_EVENTS.includes(event.type)) {
      const reference =
        event.data?.reference ??
        event.data?.tracker ??
        event.data?.metadata?.reference ??
        null;

      if (!reference) {
        return NextResponse.json({ received: true });
      }

      const sub = await prisma.safepaySubscription.findFirst({
        where: { safepayTrackerId: reference },
      });
      if (!sub) return NextResponse.json({ received: true });

      await prisma.safepaySubscription.update({
        where: { id: sub.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });

      await prisma.user.update({
        where: { id: sub.userId },
        data: { plan: "FREE", isPro: false, paymentProvider: "NONE" },
      });

      console.log(`[Webhook] ❌ Subscription ended for ${sub.userId}`);
      return NextResponse.json({ received: true });
    }

    console.log(`[Webhook] Unhandled event: ${event.type}`);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Safepay Webhook] 💥", err.message);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}