"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface DashboardHeroProps {
  firstName: string | null;
  lastName: string | null;
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

export function DashboardHero({ firstName, lastName }: DashboardHeroProps) {
  // -------------------------------------------------
  // Compute date on client to avoid prerender error
  // -------------------------------------------------
  const [dateLabel, setDateLabel] = React.useState<string>("");

  React.useEffect(() => {
    const today = new Date();
    const formatted = today
      .toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
      .toUpperCase();
    setDateLabel(formatted);
  }, []);

  const displayName = firstName || lastName || "there";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* ============================================
          LEFT — Greeting
          ============================================ */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-start gap-1.5"
      >
        {/* Date */}
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em]",
            "text-muted-foreground",
            "sm:text-[11px]",
          )}
        >
          {dateLabel || "\u00A0"}
        </span>

        {/* Hi, Name 👋 */}
        <h1
          className={cn(
            "text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground",
            "sm:text-3xl lg:text-4xl",
          )}
        >
          Hi, {displayName}{" "}
          <span role="img" aria-label="waving hand">
            👋
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground sm:text-[15px]">
          Ready to transform your look today?
        </p>
      </motion.div>

      {/* ============================================
          RIGHT — Quick Actions
          ============================================ */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
      >
        {/* Generate New — primary */}
        <Link
          href="/app/generate"
          className={cn(
            "group/btn inline-flex h-11 cursor-pointer items-center justify-center gap-2",
            "rounded-full px-6 text-sm font-semibold sm:text-base",
            "bg-linear-to-r from-primary to-primary/80",
            "text-primary-foreground",
            "shadow-lg shadow-primary/30",
            "transition-all duration-300",
            "hover:shadow-xl hover:shadow-primary/40",
            "no-underline",
          )}
        >
          <Sparkles className="size-4" strokeWidth={2.5} />
          Generate New
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
            strokeWidth={2.5}
          />
        </Link>

        {/* View History — outlined */}
        <Link
          href="/app/history"
          className={cn(
            "group/btn inline-flex h-11 cursor-pointer items-center justify-center gap-2",
            "rounded-full border border-border/60 bg-background/60 px-6 backdrop-blur-sm",
            "text-sm font-semibold text-foreground sm:text-base",
            "transition-all duration-300",
            "hover:border-primary/50 hover:bg-primary/5",
            "no-underline",
          )}
        >
          View History
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
            strokeWidth={2.5}
          />
        </Link>
      </motion.div>
    </motion.div>
  );
}