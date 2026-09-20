"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { ShieldCheck, Zap, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "Your photos are auto-deleted in 24 hours. We never sell, share, or train on your data.",
  },
  {
    icon: Zap,
    title: "Ruthlessly Fast",
    description:
      "Every transformation happens in under 5 seconds. No waiting, no loading bars.",
  },
  {
    icon: Heart,
    title: "Warm by Default",
    description:
      "Technology should feel human. Every interaction is designed to feel kind, not cold.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
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

export function OurValues() {
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
                What We Believe
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className={cn(
                "text-3xl font-extrabold leading-[1.15] tracking-[-0.028em] text-foreground",
                "sm:text-4xl lg:text-[2.5rem]",
              )}
            >
              Three Values That Guide Everything
            </motion.h2>
          </div>

          {/* Cards */}
          <motion.div
            variants={containerVariants}
            className="grid w-full gap-4 sm:gap-5 md:grid-cols-3"
          >
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  variants={itemVariants}
                  className={cn(
                    "group relative flex flex-col gap-4 rounded-3xl",
                    "border border-border/60 bg-card/60 backdrop-blur-sm",
                    "p-6 transition-all duration-500",
                    "hover:-translate-y-1 hover:border-primary/40",
                    "hover:shadow-lg hover:shadow-primary/10",
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl",
                      "bg-linear-to-br from-primary to-primary/70",
                      "shadow-md shadow-primary/30",
                      "transition-transform duration-500",
                      "group-hover:scale-110 group-hover:rotate-3",
                    )}
                  >
                    <Icon
                      className="size-5 text-primary-foreground"
                      strokeWidth={2.5}
                    />
                  </div>

                  {/* Text */}
                  <h3 className="text-lg font-bold tracking-tight text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}