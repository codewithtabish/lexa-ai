// src/lib/safepay/client.ts
// ⚠️ NO "use server" — this is a library file.

import crypto from "crypto";
import { Safepay } from "@sfpy/node-sdk";
import { SAFEPAY_CONFIG } from "./config";

// ═══════════════════════════════════════════════════════════
// SAFEPAY CLIENT
// ═══════════════════════════════════════════════════════════

const safepay = new Safepay({
  // SDK expects an enum type, not a plain string — cast to satisfy TS
  environment: SAFEPAY_CONFIG.env as any, // "sandbox" | "production"
  apiKey: SAFEPAY_CONFIG.publicKey,       // sec_...
  v1Secret: SAFEPAY_CONFIG.secretKey,     // your secret
  webhookSecret: SAFEPAY_CONFIG.webhookSecret,
});

// ═══════════════════════════════════════════════════════════
// CREATE SUBSCRIPTION CHECKOUT URL
// ═══════════════════════════════════════════════════════════

export async function createSubscriptionCheckout(params: {
  planId: string;      // "basic_monthly" from Safepay dashboard
  reference: string;   // unique id (e.g. user id + timestamp)
  cancelUrl: string;
  redirectUrl: string;
}): Promise<string> {
  // 1. Create auth token
  const authToken = await safepay.authorization.create();

  // 2. Create subscription checkout URL
  const url = await safepay.checkout.createSubscriptionWithToken({
    planId: params.planId,
    reference: params.reference,
    cancelUrl: params.cancelUrl,
    redirectUrl: params.redirectUrl,
    authToken,
  });

  return url;
}

// ═══════════════════════════════════════════════════════════
// VERIFY WEBHOOK (sync)
// ═══════════════════════════════════════════════════════════

export function verifyWebhookSignature(params: {
  rawBody: string;
  signatureHeader: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", SAFEPAY_CONFIG.webhookSecret)
    .update(params.rawBody)
    .digest("hex");

  const provided = params.signatureHeader.replace("sha256=", "");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(provided)
    );
  } catch {
    return false;
  }
}