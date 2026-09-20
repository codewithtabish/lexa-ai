"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TECHNOLOGIES = [
  { name: "Next.js", symbol: "N" },
  { name: "React", symbol: "⚛" },
  { name: "React Native", symbol: "RN" },
  { name: "Expo", symbol: "E" },
  { name: "Android", symbol: "🤖" },
  { name: "TypeScript", symbol: "TS" },
  { name: "Prisma", symbol: "▲" },
  { name: "Neon Postgres", symbol: "N" },
  { name: "Clerk", symbol: "C" },
  { name: "Tailwind CSS", symbol: "~" },
  { name: "NativeWind", symbol: "NW" },
  { name: "Framer Motion", symbol: "F" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function TechStack() {
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
          <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                  "px-3.5 py-1.5",
                  "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
                )}
              >
                Powered By
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className={cn(
                "text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground",
                "sm:text-3xl lg:text-[2.25rem]",
              )}
            >
              Built on Modern Technology
            </motion.h2>
          </div>

          {/* Grid */}
          <motion.div
            variants={containerVariants}
            className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6"
          >
            {TECHNOLOGIES.map((tech) => (
              <motion.div
                key={tech.name}
                variants={itemVariants}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-2xl",
                  "border border-border/60 bg-card/60 backdrop-blur-sm",
                  "px-2 py-4 sm:py-5",
                  "transition-all duration-300",
                  "hover:-translate-y-1 hover:border-primary/40",
                )}
              >
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-xl sm:size-9",
                    "bg-primary/10 text-sm font-extrabold text-primary sm:text-base",
                  )}
                >
                  {tech.symbol}
                </div>
                <p className="text-center text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">
                  {tech.name}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}