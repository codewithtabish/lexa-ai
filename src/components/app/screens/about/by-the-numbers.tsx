"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const STATS = [
  { value: "10K+", label: "Happy Users" },
  { value: "500K+", label: "Transformations" },
  { value: "4.9/5", label: "Average Rating" },
  { value: "99.9%", label: "Uptime" },
];

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

export function ByTheNumbers() {
  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center gap-8"
        >
          {/* Header */}
          <div className="flex max-w-xl flex-col items-center gap-2.5 text-center">
            <motion.h2
              variants={itemVariants}
              className={cn(
                "text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground",
                "sm:text-3xl lg:text-4xl",
              )}
            >
              By The Numbers
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm text-muted-foreground sm:text-base"
            >
              Real growth. Real impact.
            </motion.p>
          </div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          >
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className={cn(
                  "group relative overflow-hidden rounded-2xl sm:rounded-3xl",
                  "border border-border/60 bg-card/60 backdrop-blur-sm",
                  "p-4 text-center sm:p-6 lg:p-7",
                  "transition-all duration-500",
                  "hover:-translate-y-1 hover:border-primary/40",
                  "hover:shadow-lg hover:shadow-primary/10",
                )}
              >
                <div className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  <span className="bg-linear-to-br from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:text-[11px] lg:text-xs">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="max-w-md text-center text-[11px] text-muted-foreground sm:text-xs"
          >
            Numbers accurate as of 2026. See our live status page for current
            metrics.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}