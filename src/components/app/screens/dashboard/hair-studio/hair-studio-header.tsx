// src/components/app/screens/hair-studio/hair-studio-header.tsx
"use client";

import { Sparkles } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, staggerChildren: 0.12 },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const headlineVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const subtextVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

export function HairStudioHeader() {
  return (
    <motion.header
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "relative w-full",
        "flex flex-col items-center justify-center",
        // 🔽 Reduced vertical padding
        "px-4 pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-6 md:pb-6"
      )}
    >
      {/* BADGE PILL */}
      <motion.div variants={badgeVariants} className="mb-3">
        <div
          className={cn(
            "inline-flex items-center gap-2",
            "rounded-full",
            "border border-[color-mix(in_oklab,var(--primary)_35%,transparent)]",
            "bg-[color-mix(in_oklab,var(--primary)_8%,transparent)]",
            "px-4 py-1.5",
            "backdrop-blur-sm"
          )}
        >
          <Sparkles
            className="size-3.5 text-primary"
            strokeWidth={2.5}
            fill="currentColor"
          />
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.18em]",
              "text-primary sm:text-[11px]"
            )}
          >
            Hair Studio
          </span>
        </div>
      </motion.div>

      {/* MAIN HEADLINE */}
      <motion.h1
        variants={headlineVariants}
        className={cn(
          "text-center",
          "text-[28px] leading-[1.1] font-extrabold tracking-[-0.03em]",
          "text-foreground",
          "sm:text-[36px]",
          "md:text-[46px]",
          "lg:text-[52px]"
        )}
      >
        Try On Any{" "}
        <span
          className={cn(
            "bg-clip-text text-transparent",
            "bg-linear-to-r from-[#D99A5B] via-[#D18A4A] to-[#B86F32]",
            "dark:from-[#D99A5B] dark:via-[#D18A4A] dark:to-[#B86F32]"
          )}
        >
          Hairstyle
        </span>
      </motion.h1>

      {/* SUBTITLE */}
      <motion.p
        variants={subtextVariants}
        className={cn(
          "mt-2 max-w-[600px] text-center",
          "text-[13.5px] leading-[1.55] font-normal",
          "text-muted-foreground",
          "sm:text-[14.5px]",
          "md:mt-3 md:text-[15px]"
        )}
      >
        Upload your photo, choose from{" "}
        <span className="font-semibold text-(--foreground)/80">
          100+ curated hairstyles
        </span>
        , and see yourself transformed in seconds.
      </motion.p>
    </motion.header>
  );
}