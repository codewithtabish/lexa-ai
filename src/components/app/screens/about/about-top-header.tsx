"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { Sparkles, ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
// SHARED BUTTON STYLES
// ============================================

const primaryButtonClass = cn(
  "group/btn inline-flex h-11 cursor-pointer items-center justify-center gap-2",
  "rounded-full px-6 text-sm font-semibold sm:text-base",
  "bg-linear-to-r from-primary to-primary/80",
  "text-primary-foreground",
  "shadow-lg shadow-primary/30",
  "transition-all duration-300",
  "hover:shadow-xl hover:shadow-primary/40",
  "no-underline",
);

const secondaryButtonClass = cn(
  "group/btn inline-flex h-11 cursor-pointer items-center justify-center gap-2",
  "rounded-full border border-border/60 bg-background/60 px-6 backdrop-blur-sm",
  "text-sm font-semibold text-foreground sm:text-base",
  "transition-all duration-300",
  "hover:border-primary/50 hover:bg-primary/5",
  "no-underline",
);

// ============================================
// MAIN COMPONENT
// ============================================

export default function AboutTopHeader() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <section className="relative w-full overflow-hidden pt-10 pb-10 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* ============================================
              LEFT — Text
              ============================================ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start lg:col-span-6"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-5">
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                  "px-3.5 py-1.5",
                  "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
                )}
              >
                <Sparkles className="size-3" strokeWidth={2.5} />
                About Lexa
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className={cn(
                "text-3xl font-extrabold leading-[1.08] tracking-[-0.032em] text-foreground",
                "sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl",
              )}
            >
              Redefining beauty
              <br />
              with AI that feels
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  effortlessly yours
                </span>
                <svg
                  className="pointer-events-none absolute left-0 w-full"
                  style={{ bottom: "-0.3em" }}
                  viewBox="0 0 300 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
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
                      delay: 0.8,
                      duration: 1.1,
                      ease: [0.22, 1, 0.36, 1] as const,
                    }}
                  />
                </svg>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className={cn(
                "mt-5 max-w-xl text-sm leading-[1.7] tracking-[-0.008em] text-muted-foreground",
                "sm:text-base lg:text-[17px]",
              )}
            >
              LEXA was born from a simple belief — everyone deserves to see
              their best self. We built an AI that transforms your look in
              seconds, not hours.
            </motion.p>

            {/* ============================================
                ADAPTIVE CTAs
                NOT LOGGED IN → Clerk modal opens
                LOGGED IN     → navigates to /app
                ============================================ */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              {isLoaded && isSignedIn ? (
                // ✅ Logged in → Link to /app
                <Link href="/app" className={primaryButtonClass}>
                  <Sparkles className="size-4" strokeWidth={2.5} />
                  Let&apos;s Try
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </Link>
              ) : (
                // ✅ Not logged in → Clerk modal opens
                <SignUpButton mode="modal">
                  <button type="button" className={primaryButtonClass}>
                    Get Started Free
                    <ArrowRight
                      className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                      strokeWidth={2.5}
                    />
                  </button>
                </SignUpButton>
              )}

              {/* Secondary CTA — always external link */}
              <a
                href="http://codewithtabish.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryButtonClass}
              >
                Visit codewithtabish.com
                <ExternalLink
                  className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                  strokeWidth={2.5}
                />
              </a>
            </motion.div>
          </motion.div>

          {/* ============================================
              RIGHT — Orb
              ============================================ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:col-span-6 lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative aspect-square w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[480px]"
            >
              <Image
                src="/images/about/hero-orb.png"
                alt="LEXA AI glowing orb"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-contain drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}