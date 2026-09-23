// src/app/api/payment-confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { confirmSubscriptionByRef } from "@/actions/billing/confirm-subscription";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawRef = searchParams.get("ref") ?? "";
  const cleanRef = rawRef.split("?")[0];

  console.log("[payment-confirm] 🔔 ref:", cleanRef);

  if (!cleanRef) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  try {
    const result = await confirmSubscriptionByRef(cleanRef);
    console.log("[payment-confirm] result:", result);
  } catch (err: any) {
    console.error("[payment-confirm] 💥", err);
  }

  // ✅ Always redirect to /app — no confirm page needed
  return NextResponse.redirect(new URL("/app", req.url));
}