"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserInfo } from "@/actions/users/get-user-action";
import { DashboardHero } from "./dashboard-hero";

// ============================================
// TYPES
// ============================================

interface DashboardMainProps {
  user: UserInfo;
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const bannerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

export function DashboardMain({ user }: DashboardMainProps) {
  const isFree = user.plan === "FREE";
  const hasPaidPlan = !isFree;

  return (
    <div className="flex flex-col gap-6 py-6 sm:py-8">
      {/* ============================================
          GREETING / HERO
          ============================================ */}
      {/* <DashboardHero firstName={user.firstName} lastName={user.lastName} /> */}

      {/* ============================================
          UPGRADE BANNER — only for FREE users
          ============================================ */}
      {isFree && (
        <motion.div
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "relative isolate overflow-hidden rounded-3xl",
            "px-5 py-5 sm:px-8 sm:py-6",
            // Base gradient — same color-mix technique as your Container
            "bg-linear-to-br from-[color-mix(in_oklab,var(--primary)_85%,transparent)] via-[color-mix(in_oklab,var(--primary)_65%,transparent)] to-[color-mix(in_oklab,var(--primary)_45%,transparent)]",
            // Subtle border that catches the glow
            "border border-[color-mix(in_oklab,var(--primary)_40%,transparent)]",
            // Warm shadow that glows into the background
            "shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--primary)_60%,transparent)]",
            // Dark mode — stronger glow to stand out
            "dark:from-[color-mix(in_oklab,var(--primary)_75%,transparent)] dark:via-[color-mix(in_oklab,var(--primary)_55%,transparent)] dark:to-[color-mix(in_oklab,var(--primary)_35%,transparent)]",
            "dark:border-[color-mix(in_oklab,var(--primary)_50%,transparent)]",
            "dark:shadow-[0_20px_80px_-20px_color-mix(in_oklab,var(--primary)_90%,transparent)]",
          )}
        >
          {/* ============================================
              AMBIENT GLOWS + PARTICLES
              ============================================ */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Top-left warm glow */}
            <div className="absolute -left-16 -top-16 size-44 rounded-full bg-[color-mix(in_oklab,var(--primary)_60%,transparent)] blur-[70px]" />

            {/* Bottom-right warm glow */}
            <div className="absolute -bottom-20 -right-10 size-48 rounded-full bg-[color-mix(in_oklab,var(--primary)_50%,transparent)] blur-[70px]" />

            {/* Center luminous core */}
            <div className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_oklab,var(--primary)_35%,transparent)] blur-[80px]" />

            {/* Soft sparkles */}
            <div className="absolute left-1/3 top-1/4 size-1.5 rounded-full bg-white/80 blur-[1px]" />
            <div className="absolute right-1/3 bottom-1/3 size-2 rounded-full bg-white/70 blur-[1px]" />
            <div className="absolute left-2/3 top-2/3 size-1 rounded-full bg-white/90 blur-[1px]" />
            <div className="absolute left-1/4 bottom-1/4 size-1.5 rounded-full bg-white/60 blur-[1px]" />

            {/* Top sheen for glass effect */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/10 to-transparent" />

            {/* Bottom depth */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/10 to-transparent" />
          </div>

          {/* ============================================
              BANNER CONTENT
              ============================================ */}
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* LEFT — Icon + Text */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Frosted glass icon square */}
              <div
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-2xl",
                  "bg-white/20 backdrop-blur-md",
                  "border border-white/40",
                  "shadow-lg shadow-black/10",
                )}
              >
                <Sparkles
                  className="size-6 text-white drop-shadow-md"
                  strokeWidth={2.5}
                  fill="currentColor"
                />
              </div>

              {/* Text block */}
              <div className="flex flex-col gap-1">
                {/* Small label */}
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.2em]",
                    "text-white/90 drop-shadow-sm",
                    "sm:text-[11px]",
                  )}
                >
                  Upgrade to Pro
                </span>

                {/* Main headline */}
                <h3
                  className={cn(
                    "text-lg font-extrabold leading-tight tracking-[-0.02em] text-white drop-shadow-md",
                    "sm:text-xl lg:text-2xl",
                  )}
                >
                  Get 40 credits/month for $7.99
                </h3>

                {/* Subtext with separators */}
                <p
                  className={cn(
                    "text-[11px] font-medium text-white/90 drop-shadow-sm",
                    "sm:text-[13px]",
                  )}
                >
                  Faster processing
                  <span className="mx-1.5 text-white/60">·</span>
                  Priority support
                  <span className="mx-1.5 text-white/60">·</span>
                  Commercial rights
                </p>
              </div>
            </div>

            {/* ============================================
                RIGHT — White CTA Button
                ============================================ */}
            <Link
              href="/app/upgrade"
              className={cn(
                "group/btn inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2",
                "rounded-full px-6",
                "bg-white text-[#B86F32]",
                "text-sm font-bold",
                "shadow-lg shadow-black/15",
                "transition-all duration-300",
                "hover:bg-white/95 hover:shadow-xl",
                "hover:scale-[1.02] active:scale-[0.98]",
                "no-underline",
                "self-stretch sm:self-auto",
              )}
            >
              Upgrade Now
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </motion.div>
      )}

      {/* ============================================
          PLAN STATUS BADGE — for paid users
          ============================================ */}
      {hasPaidPlan && (
        <motion.div
          variants={badgeVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full",
            "border border-primary/25 bg-primary/5",
            "px-4 py-2",
          )}
        >
          <Zap
            className="size-3.5 text-primary"
            strokeWidth={2.5}
            fill="currentColor"
          />
          <span className="text-[12px] font-semibold text-primary sm:text-[13px]">
            {user.plan === "PRO" ? "Pro" : "Basic"} plan active
          </span>
          <span className="text-[11px] text-muted-foreground sm:text-xs">
            · {user.credits} credits remaining
          </span>
        </motion.div>
      )}
    </div>
  );
}