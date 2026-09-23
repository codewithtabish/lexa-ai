// src/lib/safepay/config.ts

export type SafepayEnv = "sandbox" | "production";

const ENV = (process.env.SAFEPAY_ENV ?? "sandbox") as SafepayEnv;

export const SAFEPAY_CONFIG = {
  env: ENV,

  baseUrl:
    ENV === "production"
      ? "https://api.getsafepay.com"
      : "https://sandbox.api.getsafepay.com",

  publicKey: process.env.SAFEPAY_PUBLIC_KEY!,
  secretKey: process.env.SAFEPAY_SECRET_KEY!,
  webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET!,

  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export const IS_SANDBOX = ENV === "sandbox";
export const IS_PRODUCTION = ENV === "production";