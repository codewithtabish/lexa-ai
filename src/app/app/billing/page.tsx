// src/app/app/billing/page.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Crown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { confirmLatestSubscription } from "@/actions/billing/confirm-subscription";

// ═══════════════════════════════════════════════════════════
// PAGE — wraps inner in Suspense (required for useSearchParams)
// ═══════════════════════════════════════════════════════════

export default function BillingPage() {
  return (
    <React.Suspense fallback={<BillingLoading />}>
      <BillingContent />
    </React.Suspense>
  );
}

// ═══════════════════════════════════════════════════════════
// FALLBACK
// ═══════════════════════════════════════════════════════════

function BillingLoading() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 pt-24 text-center">
      <Loader2 className="size-8 animate-spin text-[#D99A5B]" strokeWidth={2.5} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INNER CONTENT — uses useSearchParams safely
// ═══════════════════════════════════════════════════════════

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  const status = searchParams.get("status");
  const planParam = searchParams.get("plan");

  const [confirming, setConfirming] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);
  const [activatedPlan, setActivatedPlan] = React.useState<string | null>(null);
  const [creditsGranted, setCreditsGranted] = React.useState<number | null>(
    null
  );
  const [error, setError] = React.useState<string | null>(null);

  // 🎯 Confirm pending subscription on load
  React.useEffect(() => {
    if (!isLoaded) return;
    if (!user) return;
    if (status !== "success") return;

    const currentUser = user;
    let cancelled = false;

    async function confirm() {
      setConfirming(true);
      setError(null);
      try {
        const result = await confirmLatestSubscription();
        if (cancelled) return;

        if (!result.success) {
          setError(result.error);
          return;
        }

        setConfirmed(true);
        setActivatedPlan(result.plan ?? planParam);
        setCreditsGranted(result.creditsGranted ?? null);

        await currentUser.reload();
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
  }, [isLoaded, user, status, planParam]);

  // ─── LOADING ───
  if (status === "success" && (confirming || (!confirmed && !error))) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 pt-24 text-center">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-[#D99A5B]/30 blur-2xl"
          />
          <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D99A5B] to-[#B86F32] shadow-[0_20px_60px_rgba(217,154,91,0.5)]">
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
          <AlertCircle
            className="size-8 text-destructive"
            strokeWidth={2.5}
          />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => router.push("/pricing")}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D99A5B] to-[#B86F32] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#D99A5B]/30"
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
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] shadow-[0_20px_60px_rgba(76,175,80,0.5)]"
        >
          <CheckCircle2 className="size-10 text-white" strokeWidth={2.5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 text-3xl font-extrabold tracking-tight text-foreground"
        >
          Welcome to {planName}! {planEmoji}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground"
        >
          {creditsGranted
            ? `${creditsGranted} credits have been added to your account.`
            : "Your subscription is active."}{" "}
          Start creating your next masterpiece.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <button
            onClick={() => router.push("/app")}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D99A5B] to-[#B86F32] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#D99A5B]/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Sparkles
              className="size-4"
              fill="currentColor"
              strokeWidth={2.5}
            />
            Start Creating
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.5}
            />
          </button>

          <button
            onClick={() => router.push("/pricing")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D18A4A]/40 px-6 py-3 text-sm font-bold transition-all duration-300 hover:bg-[#D99A5B]/5"
          >
            <Crown className="size-4" strokeWidth={2.5} />
            View Plans
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── DEFAULT ───
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 pt-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">Billing</h1>
      <button
        onClick={() => router.push("/pricing")}
        className="mt-4 rounded-full bg-gradient-to-r from-[#D99A5B] to-[#B86F32] px-6 py-2 text-white"
      >
        View Plans
      </button>
    </div>
  );
}