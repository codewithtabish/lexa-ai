// src/app/app/confirm/page.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { confirmSubscriptionByRef } from "@/actions/billing/confirm-subscription";

export default function ConfirmPage() {
  return (
    <React.Suspense fallback={<Loading />}>
      <ConfirmContent />
    </React.Suspense>
  );
}

function Loading() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 pt-24 text-center">
      <Loader2 className="size-8 animate-spin text-[#D99A5B]" strokeWidth={2.5} />
    </div>
  );
}

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [confirming, setConfirming] = React.useState(true);
  const [confirmed, setConfirmed] = React.useState(false);
  const [activatedPlan, setActivatedPlan] = React.useState<string | null>(null);
  const [creditsGranted, setCreditsGranted] = React.useState<number | null>(
    null
  );
  const [error, setError] = React.useState<string | null>(null);

  // 🎯 Extract ref, strip Safepay's appended params
  const rawRef = searchParams.get("ref") ?? "";
  const cleanRef = rawRef.split("?")[0];

  // 🎯 Prevent double-run (React Strict Mode + Clerk re-renders)
  const hasRun = React.useRef(false);

  React.useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!cleanRef) {
      setError("Missing payment reference.");
      setConfirming(false);
      return;
    }

    let cancelled = false;

    async function confirm() {
      try {
        const result = await confirmSubscriptionByRef(cleanRef);
        if (cancelled) return;

        if (!result.success) {
          setError(result.error);
          return;
        }

        setConfirmed(true);
        setActivatedPlan(result.plan ?? null);
        setCreditsGranted(result.creditsGranted ?? null);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Confirmation failed.");
      } finally {
        if (!cancelled) setConfirming(false);
      }
    }

    confirm();

    return () => {
      cancelled = true;
    };
  }, [cleanRef]);

  // ─── LOADING ───
  if (confirming) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 pt-24 text-center">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-[#D99A5B]/30 blur-2xl"
          />
          <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D99A5B] to-[#B86F32]">
            <Loader2
              className="size-9 animate-spin text-white"
              strokeWidth={2.5}
            />
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
          Activating your subscription...
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Just a moment while we set everything up.
        </p>
      </div>
    );
  }

  // ─── ERROR ───
  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 pt-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => router.push("/pricing")}
          className="mt-6 rounded-full bg-gradient-to-r from-[#D99A5B] to-[#B86F32] px-6 py-3 text-sm font-bold text-white"
        >
          Back to Pricing
        </button>
      </div>
    );
  }

  // ─── SUCCESS ───
  if (confirmed) {
    const planName = activatedPlan === "PRO" ? "Pro" : "Basic";
    const planEmoji = activatedPlan === "PRO" ? "👑" : "⚡";

    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 pt-24 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#4CAF50] to-[#2E7D32]"
        >
          <CheckCircle2 className="size-10 text-white" strokeWidth={2.5} />
        </motion.div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
          Welcome to {planName}! {planEmoji}
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          {creditsGranted
            ? `${creditsGranted} credits have been added to your account.`
            : "Your subscription is active."}{" "}
          Start creating your next masterpiece.
        </p>
        <button
          onClick={() => {
            window.location.href = "/app";
          }}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D99A5B] to-[#B86F32] px-6 py-3 text-sm font-bold text-white"
        >
          <Sparkles className="size-4" fill="currentColor" strokeWidth={2.5} />
          Start Creating
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return null;
}