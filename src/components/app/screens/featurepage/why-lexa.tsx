"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { Zap, ShieldCheck, BadgeCheck, Gift, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// VALUE PROPS DATA
// ============================================

interface ValueProp {
  icon: React.ElementType;
  title: string;
  description: string;
}

const VALUE_PROPS: ValueProp[] = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Results in seconds, not minutes.",
  },
  {
    icon: BadgeCheck,
    title: "Premium Quality",
    description: "Natural, realistic, stunning results.",
  },
  {
    icon: ShieldCheck,
    title: "Your Privacy",
    description: "Your photos, your data, always safe.",
  },
  {
    icon: Gift,
    title: "Free Credits",
    description: "Start for free, explore freely.",
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
// SHARED CTA STYLE
// ============================================

const ctaClass = cn(
  "group/btn inline-flex h-10 cursor-pointer items-center justify-center gap-2",
  "rounded-full px-5 text-sm font-semibold",
  "bg-linear-to-r from-primary to-primary/80",
  "text-primary-foreground",
  "shadow-md shadow-primary/30",
  "transition-all duration-300",
  "hover:shadow-lg hover:shadow-primary/50",
  "no-underline",
);

// ============================================
// MAIN SECTION
// ============================================

export function WhyLexa() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <section className="relative w-full py-14 sm:py-16 lg:py-20">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-1/4 size-[400px] rounded-full bg-primary/8 blur-[120px] dark:bg-primary/12" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* ============================================
              LEFT — WHY CHOOSE LEXA
              ============================================ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col gap-6 lg:col-span-6"
          >
            {/* Header */}
            <div className="flex flex-col items-start gap-3">
              <motion.div variants={itemVariants}>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full",
                    "border border-primary/30 bg-primary/10",
                    "px-3 py-1",
                    "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
                  )}
                >
                  Why LEXA
                </span>
              </motion.div>

              <motion.h2
                variants={itemVariants}
                className={cn(
                  "text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground",
                  "sm:text-3xl lg:text-[2rem]",
                )}
              >
                Why Choose LEXA?
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
              >
                More than just an app — it&apos;s your personal style studio.
              </motion.p>
            </div>

            {/* Value Cards */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
            >
              {VALUE_PROPS.map((value) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    variants={itemVariants}
                    className="group flex flex-col gap-2.5"
                  >
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl",
                        "bg-linear-to-br from-primary to-primary/70",
                        "shadow-md shadow-primary/25",
                        "transition-transform duration-500",
                        "group-hover:scale-110 group-hover:rotate-3",
                      )}
                    >
                      <Icon
                        className="size-4.5 text-primary-foreground"
                        strokeWidth={2.5}
                      />
                    </div>

                    <h3 className="text-sm font-bold leading-tight tracking-tight text-foreground sm:text-[15px]">
                      {value.title}
                    </h3>

                    <p className="text-[11px] leading-[1.55] text-muted-foreground sm:text-xs">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* ============================================
              RIGHT — AI IMAGE GENERATION HIGHLIGHT CARD
              ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="lg:col-span-6"
          >
            <div
              className={cn(
                "group relative h-full overflow-hidden rounded-3xl",
                "border border-border/60",
                "bg-linear-to-br from-[#1A1714] via-[#241C15] to-[#2E2319]",
                "shadow-xl shadow-primary/10",
              )}
            >
              {/* Ambient warm glow inside card */}
              <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/25 blur-[100px]" />

              {/* Image */}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-[55%]">
                <Image
                  src="/images/featurepage/ai-highlight.png"
                  alt="AI Image Generation — Create anything you can imagine"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className={cn(
                    "object-cover object-right",
                    "transition-transform duration-700 ease-out",
                    "group-hover:scale-[1.04]",
                  )}
                />
                <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-[#1A1714] to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-center gap-4 p-6 sm:p-7 lg:max-w-[55%] lg:p-8">
                {/* Badge */}
                <div className="flex items-center">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full",
                      "border border-primary/40 bg-primary/15 backdrop-blur-sm",
                      "px-3 py-1",
                      "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
                    )}
                  >
                    <Zap className="size-2.5" strokeWidth={2.5} />
                    The Free Hook
                  </span>
                </div>

                {/* Title */}
                <h3
                  className={cn(
                    "text-2xl font-extrabold leading-[1.1] tracking-[-0.028em] text-white",
                    "sm:text-3xl lg:text-[2rem]",
                  )}
                >
                  AI Image{" "}
                  <span className="bg-linear-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                    Generation
                  </span>
                </h3>

                {/* Description */}
                <p className="max-w-md text-sm leading-[1.65] text-white/70 sm:text-[15px]">
                  Create anything. From portraits to fantasy, aesthetic to
                  professional — your imagination is the only limit.
                </p>

                {/* ============================================
                    ADAPTIVE CTA — DEFINITIVE FIX
                    NOT LOGGED IN → Clerk modal opens
                    LOGGED IN     → navigates to /app
                    ============================================ */}
                <div className="mt-1">
                  {isLoaded && isSignedIn ? (
                    // ✅ Logged in → Link to /app
                    <Link href="/app" className={ctaClass}>
                      <Sparkles className="size-3.5" strokeWidth={2.5} />
                      Try It Now
                      <ArrowRight
                        className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                        strokeWidth={2.5}
                      />
                    </Link>
                  ) : (
                    // ✅ Not logged in → Clerk modal opens
                    <SignUpButton mode="modal">
                      <button type="button" className={ctaClass}>
                        Try It Now Free
                        <ArrowRight
                          className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                          strokeWidth={2.5}
                        />
                      </button>
                    </SignUpButton>
                  )}
                </div>
              </div>

              {/* Amber ring on hover */}
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-3xl",
                  "ring-1 ring-primary/0",
                  "transition-all duration-500",
                  "group-hover:ring-primary/40",
                )}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}