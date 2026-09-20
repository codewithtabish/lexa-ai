"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Sparkles,
  Heart,
  Rocket,
  Users,
  Zap,
  Globe,
  Star,
  Briefcase,
  FileSearch,
  Mail,
  ArrowRight,
  Search,
  Code2,
  Palette,
  MessageSquare,
  Target,
} from "lucide-react";
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
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ============================================
// SECTION 1 — HERO
// ============================================

function CareersHero() {
  return (
    <section className="relative w-full py-10 sm:py-14 lg:py-16">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 size-[500px] -translate-y-1/3 rounded-full bg-primary/12 blur-[140px] dark:bg-primary/18" />
        <div className="absolute right-0 top-1/3 size-[450px] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/15" />
      </div>

      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        {/* ============================================
            LEFT — TEXT
            ============================================ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start gap-5 lg:col-span-6"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full",
                "border border-primary/30 bg-primary/10 backdrop-blur-sm",
                "px-3.5 py-1.5",
                "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
              )}
            >
              <Sparkles className="size-3" strokeWidth={2.5} />
              Work With Us
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className={cn(
              "text-5xl font-extrabold leading-[1.02] tracking-[-0.032em] text-foreground",
              "sm:text-6xl md:text-7xl lg:text-[4.5rem]",
            )}
          >
            Join Our
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Journey
              </span>
              <svg
                className="pointer-events-none absolute left-0 w-full"
                style={{ bottom: "-0.2em" }}
                viewBox="0 0 300 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <motion.path
                  d="M 6 12 C 80 4, 220 4, 294 12"
                  stroke="currentColor"
                  strokeWidth="6"
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
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="max-w-lg text-sm leading-[1.7] text-muted-foreground sm:text-base"
          >
            We&apos;re always on the lookout for talented designers,
            developers, and creators who share our vision of making AI beauty
            accessible to everyone.
          </motion.p>

          {/* Status pill */}
          <motion.div variants={itemVariants}>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full",
                "border border-primary/25 bg-primary/5 backdrop-blur-sm",
                "px-4 py-2",
                "text-[11px] font-semibold text-primary sm:text-xs",
              )}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              No open roles right now — but we&apos;d love to hear from you
            </span>
          </motion.div>
        </motion.div>

        {/* ============================================
            RIGHT — ORGANIC NEAR-CIRCLE IMAGE (NO BORDER)
            ============================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:col-span-6"
        >
          <div className="relative mx-auto max-w-[520px]">
            {/* Soft amber halo behind (replaces border) */}
            <div
              className="pointer-events-none absolute -inset-8 -z-10 bg-primary/15 blur-[60px] dark:bg-primary/25"
              style={{
                borderRadius: "58% 42% 52% 48% / 55% 45% 55% 45%",
              }}
            />

            {/* "Better Together" handwriting accent */}
            <motion.div
              initial={{ opacity: 0, rotate: -8, x: 20 }}
              animate={{ opacity: 1, rotate: -8, x: 0 }}
              transition={{ duration: 0.7, delay: 1.1 }}
              className="absolute -right-2 -top-4 z-20 sm:-right-6 sm:-top-2"
            >
              <div className="flex flex-col items-end leading-tight">
                <span className="font-italic text-lg text-primary sm:text-xl">
                  Better
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-italic text-lg text-primary sm:text-xl">
                    Together
                  </span>
                  <Heart
                    className="size-4 text-primary"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </div>
              </div>
            </motion.div>

            {/* ═══════════════════════════════════════════
                ORGANIC NEAR-CIRCLE SHAPE — 58/42 split
                Feels circular but subtly organic. No border.
                ═══════════════════════════════════════════ */}
            <div
              className="relative aspect-square w-full overflow-hidden"
              style={{
                borderRadius: "58% 42% 52% 48% / 55% 45% 55% 45%",
              }}
            >
              <Image
                src="/images/careers/career.jpg"
                alt="A warm, modern workspace — join the LEXA team"
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover object-center"
                priority
              />

              {/* Subtle warm overlay */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-primary/20 via-transparent to-transparent" />
            </div>

            {/* Floating sparkle stars */}
            <motion.div
              animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-3 top-1/4"
            >
              <Star
                className="size-3 text-primary"
                fill="currentColor"
                strokeWidth={0}
              />
            </motion.div>
            <motion.div
              animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-2 right-1/4"
            >
              <Star
                className="size-2 text-primary"
                fill="currentColor"
                strokeWidth={0}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 2 — WHY WORK WITH US
// ============================================

function WhyWorkWithUs() {
  const BENEFITS = [
    {
      icon: Globe,
      title: "Remote-First",
      description:
        "Work from anywhere in the world. We care about output, not hours in a chair.",
    },
    {
      icon: Rocket,
      title: "Ship Real Products",
      description:
        "Your work reaches millions of users. No busywork — only meaningful projects.",
    },
    {
      icon: Heart,
      title: "Warm Culture",
      description:
        "Small team, big respect. We treat everyone like humans, not resources.",
    },
    {
      icon: Zap,
      title: "Fast Growth",
      description:
        "Learn by doing. Ship features weekly and grow your skills exponentially.",
    },
    {
      icon: Star,
      title: "Ownership",
      description:
        "Own your features end-to-end. Your name ships with every release.",
    },
    {
      icon: Users,
      title: "Direct Impact",
      description:
        "Talk directly to the founder. Every idea gets heard, every voice matters.",
    },
  ];

  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/6 blur-[140px] dark:bg-primary/10" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="flex flex-col items-center gap-10"
      >
        {/* Header */}
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <motion.div variants={itemVariants}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full",
                "border border-primary/30 bg-primary/10",
                "px-3.5 py-1.5",
                "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
              )}
            >
              <Sparkles className="size-3" strokeWidth={2.5} />
              Why Work With Us
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className={cn(
              "text-3xl font-extrabold leading-tight tracking-[-0.028em] text-foreground",
              "sm:text-4xl lg:text-[2.75rem]",
            )}
          >
            What Makes LEXA Different
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
          >
            We&apos;re building something meaningful — and we want people who
            feel the same.
          </motion.p>
        </div>

        {/* 6 Cards */}
        <motion.div
          variants={containerVariants}
          className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-2xl",
                  "border border-border/50 bg-card/60 backdrop-blur-sm",
                  "p-5 sm:p-6",
                  "transition-all duration-500",
                  "hover:-translate-y-1 hover:border-primary/40",
                  "hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5",
                )}
              >
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl",
                    "bg-linear-to-br from-primary to-primary/70",
                    "shadow-md shadow-primary/25",
                    "transition-transform duration-500",
                    "group-hover:scale-110 group-hover:rotate-3",
                  )}
                >
                  <Icon
                    className="size-5 text-primary-foreground"
                    strokeWidth={2.5}
                  />
                </div>
                <h3 className="text-[15px] font-bold leading-tight tracking-tight text-foreground sm:text-base">
                  {benefit.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// SECTION 3 — WHAT WE LOOK FOR
// ============================================

function WhatWeLookFor() {
  const TRAITS = [
    {
      icon: Code2,
      title: "Builders",
      description: "People who ship, iterate, and learn from real users.",
    },
    {
      icon: Palette,
      title: "Designers",
      description: "Craft-driven creators who obsess over details and delight.",
    },
    {
      icon: Target,
      title: "Problem Solvers",
      description: "Those who thrive in ambiguity and turn chaos into clarity.",
    },
    {
      icon: MessageSquare,
      title: "Communicators",
      description: "Team players who share ideas openly and give honest feedback.",
    },
  ];

  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-1/4 size-[400px] rounded-full bg-primary/6 blur-[120px] dark:bg-primary/10" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="flex flex-col items-center gap-10"
      >
        {/* Header */}
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <motion.div variants={itemVariants}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full",
                "border border-primary/30 bg-primary/10",
                "px-3.5 py-1.5",
                "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
              )}
            >
              <Search className="size-3" strokeWidth={2.5} />
              What We Look For
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className={cn(
              "text-3xl font-extrabold leading-tight tracking-[-0.028em] text-foreground",
              "sm:text-4xl lg:text-[2.75rem]",
            )}
          >
            The Kind of People We Love
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
          >
            Skills can be learned. Attitude and curiosity can&apos;t.
          </motion.p>
        </div>

        {/* 4 trait cards */}
        <motion.div
          variants={containerVariants}
          className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TRAITS.map((trait) => {
            const Icon = trait.icon;
            return (
              <motion.div
                key={trait.title}
                variants={itemVariants}
                className={cn(
                  "group relative flex flex-col items-start gap-3 rounded-2xl",
                  "border border-border/50 bg-card/60 backdrop-blur-sm",
                  "p-5",
                  "transition-all duration-500",
                  "hover:-translate-y-1 hover:border-primary/40",
                  "hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5",
                )}
              >
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl",
                    "bg-linear-to-br from-primary to-primary/70",
                    "shadow-md shadow-primary/25",
                    "transition-transform duration-500",
                    "group-hover:scale-110 group-hover:rotate-3",
                  )}
                >
                  <Icon
                    className="size-5 text-primary-foreground"
                    strokeWidth={2.5}
                  />
                </div>
                <h3 className="text-[15px] font-bold leading-tight tracking-tight text-foreground">
                  {trait.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {trait.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// SECTION 4 — HOW WE HIRE
// ============================================

function HowWeHire() {
  const STEPS = [
    {
      number: "01",
      title: "Apply or Say Hi",
      description:
        "Send us your portfolio or just introduce yourself. No formal cover letter needed.",
    },
    {
      number: "02",
      title: "Quick Chat",
      description:
        "A 30-minute conversation with the founder. We talk about you, not just the role.",
    },
    {
      number: "03",
      title: "Paid Test Task",
      description:
        "A small, realistic project — paid and short. You show us how you actually work.",
    },
    {
      number: "04",
      title: "Offer & Onboarding",
      description:
        "If we're a match, we send a clear offer and you start shipping in week one.",
    },
  ];

  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 bottom-0 size-[400px] rounded-full bg-primary/6 blur-[120px] dark:bg-primary/10" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="flex flex-col items-center gap-10"
      >
        {/* Header */}
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <motion.div variants={itemVariants}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full",
                "border border-primary/30 bg-primary/10",
                "px-3.5 py-1.5",
                "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
              )}
            >
              <Target className="size-3" strokeWidth={2.5} />
              How We Hire
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className={cn(
              "text-3xl font-extrabold leading-tight tracking-[-0.028em] text-foreground",
              "sm:text-4xl lg:text-[2.75rem]",
            )}
          >
            A Simple, Human Process
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
          >
            No endless rounds. No ghosting. Just 4 clear steps.
          </motion.p>
        </div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          className="relative grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Dashed connector line (desktop only) */}
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden lg:block">
            <div className="mx-auto h-px w-[70%] border-t-2 border-dashed border-primary/25" />
          </div>

          {STEPS.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative flex flex-col items-center gap-3 text-center"
            >
              <div
                className={cn(
                  "relative z-10 flex size-14 items-center justify-center rounded-2xl",
                  "bg-linear-to-br from-primary to-primary/70",
                  "text-lg font-extrabold text-primary-foreground",
                  "shadow-lg shadow-primary/25",
                )}
              >
                {step.number}
              </div>

              <h3 className="mt-1 text-[15px] font-bold leading-tight tracking-tight text-foreground sm:text-base">
                {step.title}
              </h3>

              <p className="max-w-[220px] text-[13px] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// SECTION 5 — CURRENT OPENINGS
// ============================================

function CurrentOpenings() {
  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-1/3 size-[400px] rounded-full bg-primary/6 blur-[120px] dark:bg-primary/10" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="flex flex-col items-center gap-8"
      >
        {/* Header */}
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <motion.div variants={itemVariants}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full",
                "border border-primary/30 bg-primary/10",
                "px-3.5 py-1.5",
                "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
              )}
            >
              <Briefcase className="size-3" strokeWidth={2.5} />
              Open Positions
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className={cn(
              "text-3xl font-extrabold leading-tight tracking-[-0.028em] text-foreground",
              "sm:text-4xl lg:text-[2.75rem]",
            )}
          >
            Current Openings
          </motion.h2>
        </div>

        {/* Empty state card */}
        <motion.div
          variants={itemVariants}
          className={cn(
            "relative w-full max-w-3xl overflow-hidden rounded-3xl",
            "border border-primary/20 bg-card/60 backdrop-blur-sm",
            "px-6 py-12 text-center sm:px-12 sm:py-14",
          )}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-40 rounded-full bg-primary/10 blur-[80px]" />

          <div className="relative flex flex-col items-center gap-5">
            <div
              className={cn(
                "flex size-16 items-center justify-center rounded-2xl",
                "bg-linear-to-br from-primary to-primary/70",
                "shadow-lg shadow-primary/30",
              )}
            >
              <FileSearch
                className="size-7 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>

            <h3 className="text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground sm:text-3xl">
              No open roles at the moment
            </h3>

            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              We don&apos;t have any open positions right now, but we&apos;re
              always excited to connect with talented people. Feel free to
              reach out and say hello!
            </p>

            <Button
              asChild
              size="lg"
              className={cn(
                "group/btn mt-2 h-11 rounded-full px-6",
                "bg-linear-to-r from-primary to-primary/80",
                "text-sm font-semibold text-primary-foreground sm:text-base",
                "shadow-lg shadow-primary/30",
                "transition-all duration-300",
                "hover:shadow-xl hover:shadow-primary/40",
              )}
            >
              <Link href="/contact">
                <Mail className="mr-2 size-4" strokeWidth={2.5} />
                Get in Touch
                <ArrowRight
                  className="ml-2 size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// SECTION 6 — FINAL CTA
// ============================================

function CareersCta() {
  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "bg-linear-to-br from-primary via-primary to-primary/80",
          "px-6 py-10 sm:px-10 sm:py-12",
          "shadow-xl shadow-primary/25",
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 size-64 rounded-full bg-primary-foreground/25 blur-[80px]" />
          <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-primary-foreground/20 blur-[80px]" />
          <div className="absolute left-1/4 top-1/3 size-2 rounded-full bg-primary-foreground/40 blur-sm" />
          <div className="absolute right-1/3 bottom-1/3 size-3 rounded-full bg-primary-foreground/30 blur-sm" />
        </div>

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full",
                "bg-primary-foreground/20 backdrop-blur-sm",
                "px-3 py-1",
                "text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground",
              )}
            >
              <Rocket className="size-2.5" strokeWidth={3} />
              Let&apos;s Build Together
            </span>

            <h2 className="max-w-xl text-2xl font-extrabold leading-[1.15] tracking-[-0.028em] text-primary-foreground sm:text-3xl lg:text-[2.25rem]">
              Interested in Joining LEXA?
            </h2>

            <p className="max-w-xl text-sm leading-relaxed text-primary-foreground/85 sm:text-[15px]">
              We&apos;re always open to connecting with great people.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className={cn(
              "group/btn h-11 shrink-0 rounded-full px-6",
              "bg-primary-foreground text-primary",
              "text-sm font-semibold sm:text-base",
              "shadow-lg shadow-black/10",
              "transition-all duration-300",
              "hover:bg-primary-foreground/95 hover:shadow-xl",
            )}
          >
            <Link href="/contact">
              Contact Us
              <ArrowRight
                className="ml-2 size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                strokeWidth={2.5}
              />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function CareersPage() {
  return (
    <div className="flex flex-1 flex-col">
      <CareersHero />
      <WhyWorkWithUs />
      <WhatWeLookFor />
      <HowWeHire />
      <CurrentOpenings />
      <CareersCta />
    </div>
  );
}