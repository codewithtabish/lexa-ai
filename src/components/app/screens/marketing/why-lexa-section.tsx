"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { Zap, Target, ShieldCheck, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================
// DATA
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
    description:
      "Transformations in under 5 seconds. No waiting, no loading screens.",
  },
  {
    icon: Target,
    title: "Studio-Quality AI",
    description:
      "Powered by enterprise-grade AI used by top beauty brands.",
  },
  {
    icon: ShieldCheck,
    title: "100% Private",
    description:
      "Your photos are auto-deleted in 24 hours. Never shared, never sold.",
  },
  {
    icon: DollarSign,
    title: "Actually Affordable",
    description:
      "Start free with 4 credits. Plans from just $4.99/month.",
  },
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

const headerItemVariants: Variants = {
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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
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
// CARD COMPONENT
// ============================================

function ValueCard({ item }: { item: ValueProp }) {
  const Icon = item.icon;

  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        "group relative flex gap-4 p-5 sm:p-6",
        "rounded-2xl border border-border/50",
        "bg-card/60 backdrop-blur-sm",
        "transition-all duration-500 ease-out",
        "hover:-translate-y-1",
        "hover:border-primary/40",
        "hover:bg-card",
        "hover:shadow-lg hover:shadow-primary/10",
      )}
    >
      {/* ============================================
          AMBER GRADIENT ICON SQUARE
          ============================================ */}
      <div className="shrink-0">
        <div
          className={cn(
            "flex size-12 items-center justify-center sm:size-14",
            "rounded-2xl",
            "bg-linear-to-br from-primary to-primary/70",
            "shadow-md shadow-primary/30",
            "transition-transform duration-500",
            "group-hover:scale-105 group-hover:rotate-3",
          )}
        >
          <Icon
            className="size-5 text-primary-foreground sm:size-6"
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* ============================================
          TEXT CONTENT
          ============================================ */}
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="text-base font-bold leading-tight tracking-tight text-foreground sm:text-[17px]">
          {item.title}
        </h3>
        <p className="text-[13px] leading-[1.6] text-muted-foreground sm:text-sm">
          {item.description}
        </p>
      </div>

      {/* ============================================
          SUBTLE AMBER RING ON HOVER
          ============================================ */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "ring-1 ring-primary/0",
          "transition-all duration-500",
          "group-hover:ring-primary/30",
        )}
      />
    </motion.div>
  );
}

// ============================================
// MAIN SECTION
// ============================================

export function WhyLexaSection() {
  return (
    <section className="relative w-full py-20 sm:py-24 lg:py-28">
      {/* ============================================
          AMBIENT BACKGROUND GLOW
          ============================================ */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ============================================
            SECTION HEADER (Centered)
            ============================================ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center sm:mb-14"
        >
          {/* Badge */}
          <motion.div variants={headerItemVariants}>
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                "px-3.5 py-1.5",
                "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
              )}
            >
              Why LYXA
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={headerItemVariants}
            className={cn(
              "text-4xl font-extrabold leading-[1.1] tracking-[-0.028em] text-foreground",
              "sm:text-5xl lg:text-[3.25rem]",
            )}
          >
            Built Different.{" "}
            <span className="bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Literally.
            </span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            variants={headerItemVariants}
            className="max-w-xl text-base leading-[1.6] tracking-[-0.008em] text-muted-foreground sm:text-[17px]"
          >
            Here's what makes LYXA the smartest choice for AI beauty.
          </motion.p>
        </motion.div>

        {/* ============================================
            2x2 GRID OF VALUE CARDS
            ============================================ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2"
        >
          {VALUE_PROPS.map((item) => (
            <ValueCard key={item.title} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}