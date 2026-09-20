"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function FeaturesTopHeader() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <section className="relative w-full overflow-hidden pb-12 pt-14 sm:pb-16 sm:pt-20 lg:pb-20 lg:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ============================================
            HERO CONTENT (CENTERED)
            ============================================ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <Badge
              variant="outline"
              className={cn(
                "gap-2 rounded-full border-primary/30 bg-primary/10 backdrop-blur-sm",
                "px-4 py-2",
                "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
              )}
            >
              <Sparkles className="size-3" strokeWidth={2.5} />
              All Features · 6 Transformations
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className={cn(
              "text-4xl font-extrabold leading-[1.08] tracking-[-0.032em] text-foreground",
              "sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.25rem]",
            )}
          >
            Everything You Need
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                to Look Amazing
              </span>

              {/* ═══ Hand-drawn swoosh underline ═══ */}
              <svg
                className="pointer-events-none absolute left-0 w-full"
                style={{ bottom: "-0.3em" }}
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
                    delay: 1,
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
              "mt-6 max-w-xl text-sm leading-[1.7] tracking-[-0.008em] text-muted-foreground",
              "sm:text-base md:text-[17px]",
            )}
          >
            Six AI-powered transformations, one free AI image generator, and
            hundreds of style options — all in seconds.
          </motion.p>

          {/* ============================================
              CTAs — adaptive by auth state
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

        {/* ============================================
            LEFT FLOATING IMAGE (Woman Portrait)
            ============================================ */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "pointer-events-none absolute left-0 top-16 z-0",
            "hidden lg:block",
          )}
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "relative h-[420px] w-[336px] xl:h-[500px] xl:w-[400px]",
            )}
          >
            <Image
              src="/images/featurepage/header-left.png"
              alt="AI hairstyle transformation preview"
              fill
              priority
              sizes="(max-width: 1024px) 0vw, 400px"
              className="object-contain object-top-left drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>

        {/* ============================================
            RIGHT FLOATING IMAGE (Polaroid Collage)
            ============================================ */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "pointer-events-none absolute right-0 top-16 z-0",
            "hidden lg:block",
          )}
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className={cn(
              "relative h-[360px] w-[360px] xl:h-[440px] xl:w-[440px]",
            )}
          >
            <Image
              src="/images/featurepage/header-right.png"
              alt="AI transformation collage preview"
              fill
              priority
              sizes="(max-width: 1024px) 0vw, 440px"
              className="object-contain object-top-right drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}