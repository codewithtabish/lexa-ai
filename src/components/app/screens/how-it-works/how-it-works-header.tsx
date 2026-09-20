"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import {
  Sparkles,
  ArrowRight,
  Camera,
  Palette,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// FLOW CHIPS DATA
// ============================================

const FLOW_CHIPS = [
  { icon: Camera, label: "Upload" },
  { icon: Palette, label: "Choose" },
  { icon: Wand2, label: "Get Result" },
];

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
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

export default function HowItWorksHeader() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <section className="relative w-full overflow-hidden pb-12 pt-14 sm:pb-16 sm:pt-20 lg:pb-20 lg:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          {/* ============================================
              BADGE
              ============================================ */}
          <motion.div variants={itemVariants} className="mb-6">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full",
                "border border-primary/30 bg-primary/10 backdrop-blur-sm",
                "px-4 py-2",
                "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
              )}
            >
              <Sparkles className="size-3" strokeWidth={2.5} />
              How It Works
            </span>
          </motion.div>

          {/* ============================================
              HEADLINE
              ============================================ */}
          <motion.h1
            variants={itemVariants}
            className={cn(
              "text-4xl font-extrabold leading-[1.08] tracking-[-0.032em] text-foreground",
              "sm:text-5xl md:text-6xl lg:text-[4rem]",
            )}
          >
            From Photo to
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Transformation
              </span>
              {/* Hand-drawn swoosh */}
              <svg
                className="pointer-events-none absolute left-0 w-full"
                style={{ bottom: "-0.28em" }}
                viewBox="0 0 300 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <motion.path
                  d="M 6 12 C 80 4, 220 4, 294 12"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="text-primary"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    delay: 0.9,
                    duration: 1.1,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                />
              </svg>
            </span>
            <br />
            in Three Simple Steps
          </motion.h1>

          {/* ============================================
              SUBHEADLINE
              ============================================ */}
          <motion.p
            variants={itemVariants}
            className={cn(
              "mt-6 max-w-xl text-sm leading-[1.7] tracking-[-0.008em] text-muted-foreground",
              "sm:text-base md:text-[17px]",
            )}
          >
            No editing skills. No learning curve. Just upload, choose, and
            watch the AI work its magic.
          </motion.p>

          {/* ============================================
              FLOW CHIPS
              ============================================ */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            {FLOW_CHIPS.map((chip, i) => {
              const Icon = chip.icon;
              return (
                <React.Fragment key={chip.label}>
                  {/* Chip */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full",
                      "border border-border/60 bg-card/60 backdrop-blur-sm",
                      "px-4 py-2",
                      "transition-colors duration-200",
                      "hover:border-primary/40 hover:bg-primary/5",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full",
                        "bg-primary/10",
                      )}
                    >
                      <Icon className="size-3 text-primary" strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-semibold text-foreground sm:text-sm">
                      {chip.label}
                    </span>
                  </motion.div>

                  {/* Arrow between chips */}
                  {i < FLOW_CHIPS.length - 1 && (
                    <motion.div
                      animate={{
                        x: [0, 4, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3,
                      }}
                      className="flex items-center"
                    >
                      <ArrowRight
                        className="size-4 text-primary/60"
                        strokeWidth={2.5}
                      />
                    </motion.div>
                  )}
                </React.Fragment>
              );
            })}
          </motion.div>

          {/* ============================================
              CTA BUTTONS — adaptive by auth state
              ============================================ */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            {isLoaded && isSignedIn ? (
              // ── Signed-in: "Let's Try" → /app ──
              <Button
                asChild
                size="lg"
                className={cn(
                  "group/btn h-11 rounded-full px-6 text-sm font-semibold sm:text-base",
                  "bg-linear-to-r from-primary to-primary/80",
                  "text-primary-foreground",
                  "shadow-lg shadow-primary/30",
                  "transition-all duration-300",
                  "hover:shadow-xl hover:shadow-primary/40",
                )}
              >
                <Link href="/app">
                  <Sparkles className="mr-2 size-4" strokeWidth={2.5} />
                  Let&apos;s Try
                  <ArrowRight
                    className="ml-2 size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </Link>
              </Button>
            ) : (
              // ── Guest: "Get Started Free" → Clerk modal ──
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className={cn(
                    "group/btn h-11 rounded-full px-6 text-sm font-semibold sm:text-base",
                    "bg-linear-to-r from-primary to-primary/80",
                    "text-primary-foreground",
                    "shadow-lg shadow-primary/30",
                    "transition-all duration-300",
                    "hover:shadow-xl hover:shadow-primary/40",
                  )}
                >
                  Get Started Free
                  <ArrowRight
                    className="ml-2 size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </Button>
              </SignUpButton>
            )}

            {/* Secondary CTA — same for both */}
            <Button
              asChild
              variant="outline"
              size="lg"
              className={cn(
                "h-11 rounded-full border-border/60 bg-background/60 px-6 backdrop-blur-sm",
                "text-sm font-semibold sm:text-base",
                "transition-all duration-300",
                "hover:border-primary/50 hover:bg-primary/5",
              )}
            >
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}