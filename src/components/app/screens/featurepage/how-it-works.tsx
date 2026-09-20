"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import {
  Sparkles,
  Upload,
  Wand2,
  ImageIcon,
  Check,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// DATA
// ============================================

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  {
    number: "1",
    title: "Upload Your Photo",
    description: "Choose a clear photo from your gallery",
    icon: Upload,
  },
  {
    number: "2",
    title: "Choose Transformation",
    description: "Pick your desired feature and style",
    icon: Wand2,
  },
  {
    number: "3",
    title: "See Your Result",
    description: "Get your AI transformation in seconds",
    icon: ImageIcon,
  },
];

interface ComparisonRow {
  feature: string;
  credits: string;
  bestFor: string;
  isFree?: boolean;
}

const COMPARISON: ComparisonRow[] = [
  { feature: "Hairstyles", credits: "5 credits", bestFor: "New looks & style" },
  {
    feature: "Beard Styles",
    credits: "5 credits",
    bestFor: "Facial hair makeover",
  },
  { feature: "Outfits", credits: "10 credits", bestFor: "Fashion & style" },
  {
    feature: "Age Transformations",
    credits: "10 credits",
    bestFor: "See your future self",
  },
  { feature: "Hair Colors", credits: "5 credits", bestFor: "Try new shades" },
  {
    feature: "AI Image Generation",
    credits: "Free",
    bestFor: "Creative freedom",
    isFree: true,
  },
];

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
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
// STEP CARD
// ============================================

function StepCard({
  step,
  index,
  isLast,
}: {
  step: Step;
  index: number;
  isLast: boolean;
}) {
  const Icon = step.icon;

  return (
    <motion.div
      variants={itemVariants}
      className="relative flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
    >
      <div className="relative flex w-full items-center justify-center lg:justify-start">
        <div
          className={cn(
            "relative flex size-12 shrink-0 items-center justify-center rounded-full",
            "border-2 border-primary/40 bg-primary/10 backdrop-blur-sm",
            "text-lg font-extrabold text-primary",
            "transition-all duration-500",
            "hover:border-primary hover:bg-primary/20 hover:scale-105",
          )}
        >
          {step.number}
        </div>

        {!isLast && (
          <div className="ml-4 hidden flex-1 items-center lg:flex">
            <div className="h-px flex-1 border-t-2 border-dashed border-primary/30" />
            <ArrowRight
              className="size-3.5 shrink-0 text-primary/50"
              strokeWidth={2.5}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center lg:items-start">
        <div
          className={cn(
            "mb-2 flex size-10 items-center justify-center rounded-xl",
            "bg-primary/10",
          )}
        >
          <Icon className="size-5 text-primary" strokeWidth={2.5} />
        </div>

        <h3 className="text-base font-bold leading-tight tracking-tight text-foreground sm:text-[17px]">
          {step.title}
        </h3>
        <p className="mt-1.5 max-w-[200px] text-[13px] leading-[1.55] text-muted-foreground lg:max-w-none">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN SECTION
// ============================================

export function HowItWorks() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <section className="relative w-full py-14 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 size-[400px] -translate-y-1/3 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* LEFT — HOW IT WORKS */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className={cn(
              "relative flex flex-col gap-6 rounded-3xl",
              "border border-border/60 bg-card/60 backdrop-blur-sm",
              "p-6 sm:p-7 lg:p-8",
              "lg:col-span-5",
            )}
          >
            <div className="flex flex-col gap-3">
              <motion.div variants={itemVariants}>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                    "px-3 py-1",
                    "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
                  )}
                >
                  <Sparkles className="size-2.5" strokeWidth={2.5} />
                  Simple Steps
                </Badge>
              </motion.div>

              <motion.h2
                variants={itemVariants}
                className={cn(
                  "text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground",
                  "sm:text-3xl",
                )}
              >
                How It Works
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
              >
                Get amazing results in just 3 simple steps.
              </motion.p>
            </div>

            <motion.div
              variants={containerVariants}
              className={cn(
                "flex flex-col gap-6 sm:flex-row sm:gap-4",
                "lg:flex-row lg:gap-2",
              )}
            >
              {STEPS.map((step, i) => (
                <StepCard
                  key={step.number}
                  step={step}
                  index={i}
                  isLast={i === STEPS.length - 1}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — COMPARISON TABLE */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className={cn(
              "relative flex flex-col gap-5 rounded-3xl",
              "border border-border/60 bg-card/60 backdrop-blur-sm",
              "p-6 sm:p-7 lg:p-8",
              "lg:col-span-7",
            )}
          >
            <div className="flex flex-col gap-3">
              <motion.div variants={itemVariants}>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                    "px-3 py-1",
                    "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
                  )}
                >
                  <Check className="size-2.5" strokeWidth={3} />
                  Quick Comparison
                </Badge>
              </motion.div>

              <motion.h2
                variants={itemVariants}
                className={cn(
                  "text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground",
                  "sm:text-3xl",
                )}
              >
                What You Get
              </motion.h2>
            </div>

            <motion.div
              variants={itemVariants}
              className="overflow-hidden rounded-2xl border border-border/50"
            >
              <div
                className={cn(
                  "grid grid-cols-[1.5fr_0.8fr_1.4fr] gap-3",
                  "border-b border-border/50 bg-primary/5 px-4 py-3",
                  "sm:px-5",
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[11px]">
                  Feature
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[11px]">
                  Credits
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[11px]">
                  Best For
                </span>
              </div>

              <div className="divide-y divide-border/40">
                {COMPARISON.map((row, i) => (
                  <motion.div
                    key={row.feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.15 + i * 0.05,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={cn(
                      "grid grid-cols-[1.5fr_0.8fr_1.4fr] items-center gap-3",
                      "px-4 py-3 transition-colors duration-200",
                      "hover:bg-primary/5",
                      "sm:px-5 sm:py-3.5",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full",
                          "bg-primary/15",
                          "ring-1 ring-primary/25",
                        )}
                      >
                        <Check
                          className="size-2.5 text-primary"
                          strokeWidth={3.5}
                        />
                      </div>
                      <span className="truncate text-[12px] font-semibold text-foreground sm:text-[13px]">
                        {row.feature}
                      </span>
                    </div>

                    <div>
                      <span
                        className={cn(
                          "text-[12px] font-semibold sm:text-[13px]",
                          row.isFree
                            ? "bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                            : "text-foreground",
                        )}
                      >
                        {row.credits}
                      </span>
                    </div>

                    <div>
                      <span className="text-[12px] text-muted-foreground sm:text-[13px]">
                        {row.bestFor}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ============================================
            ADAPTIVE CTA
            ─────────────────────────────────────────────
            NOT LOGGED IN → click opens Clerk signup modal
            LOGGED IN     → click navigates to /app
            ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 flex justify-center sm:mt-12"
        >
          {isLoaded && isSignedIn ? (
            <Link
              href="/app"
              className={cn(
                "group/btn inline-flex h-11 items-center justify-center gap-2 rounded-full px-6",
                "text-sm font-semibold sm:text-base",
                "bg-linear-to-r from-primary to-primary/80",
                "text-primary-foreground",
                "shadow-lg shadow-primary/30",
                "transition-all duration-300",
                "hover:shadow-xl hover:shadow-primary/40",
              )}
            >
              <Sparkles className="size-4" strokeWidth={2.5} />
              Let&apos;s Try
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                strokeWidth={2.5}
              />
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button
                type="button"
                className={cn(
                  "group/btn inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-6",
                  "text-sm font-semibold sm:text-base",
                  "bg-linear-to-r from-primary to-primary/80",
                  "text-primary-foreground",
                  "shadow-lg shadow-primary/30",
                  "transition-all duration-300",
                  "hover:shadow-xl hover:shadow-primary/40",
                )}
              >
                Get Started Free
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </button>
            </SignUpButton>
          )}
        </motion.div>
      </div>
    </section>
  );
}