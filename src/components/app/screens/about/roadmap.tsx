"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MILESTONES = [
  {
    date: "Q1 2027",
    title: "Real-Time Video Try-On",
    description: "See hairstyles and outfits in live video, not just photos.",
  },
  {
    date: "Q2 2027",
    title: "Team & Agency Plans",
    description:
      "For salons, stylists, and beauty brands managing multiple clients.",
  },
  {
    date: "Q3 2027",
    title: "Community Gallery",
    description:
      "Share your transformations and discover looks from creators worldwide.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
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

export function Roadmap() {
  return (
    <section className="relative w-full py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center gap-12"
        >
          {/* Header */}
          <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                  "px-3.5 py-1.5",
                  "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
                )}
              >
                The Road Ahead
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className={cn(
                "text-3xl font-extrabold leading-tight tracking-[-0.028em] text-foreground",
                "sm:text-4xl lg:text-[2.5rem]",
              )}
            >
              What's Coming Next
            </motion.h2>
          </div>

          {/* Timeline */}
          <div className="relative w-full">
            {/* Dashed amber line (desktop horizontal) */}
            <div className="absolute left-0 right-0 top-2 hidden h-px border-t-2 border-dashed border-primary/30 md:block" />

            <motion.div
              variants={containerVariants}
              className="grid gap-10 md:grid-cols-3 md:gap-6"
            >
              {MILESTONES.map((milestone) => (
                <motion.div
                  key={milestone.title}
                  variants={itemVariants}
                  className="relative flex flex-col gap-3"
                >
                  {/* Node */}
                  <div className="relative z-10 flex items-center gap-3">
                    <span className="size-4 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/40" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                      {milestone.date}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="pl-7">
                    <h3 className="text-lg font-bold tracking-tight text-foreground">
                      {milestone.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}