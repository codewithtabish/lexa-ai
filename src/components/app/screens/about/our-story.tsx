"use client";

import * as React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export function OurStory() {
  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* LEFT — Developer portrait */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:col-span-5"
          >
            <div
              className={cn(
                "relative mx-auto aspect-2/3 w-full max-w-[360px] overflow-hidden sm:max-w-[400px]",
                "rounded-3xl border border-border/60",
                "bg-linear-to-br from-primary/10 via-card to-card/40",
                "shadow-xl shadow-primary/10",
              )}
            >
              <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-primary/25 blur-[70px]" />
              <Image
                src="/images/about/developer.png"
                alt="Talha Tabish — Founder of Lexa AI"
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-contain object-bottom drop-shadow-2xl"
                priority
              />
            </div>
          </motion.div>

          {/* RIGHT — Story text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col items-start lg:col-span-7"
          >
            <motion.div variants={itemVariants} className="mb-4">
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                  "px-3.5 py-1.5",
                  "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
                )}
              >
                Our Story
              </Badge>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className={cn(
                "text-2xl font-extrabold leading-[1.18] tracking-[-0.028em] text-foreground",
                "sm:text-3xl lg:text-[2.25rem]",
              )}
            >
              Born from a simple frustration: why does beauty have to be so
              hard to see?
            </motion.h2>

            <motion.div
              variants={itemVariants}
              className="mt-5 flex flex-col gap-3.5 text-sm leading-[1.7] text-muted-foreground sm:text-[15px] lg:text-base"
            >
              <p>
                <span className="font-semibold text-foreground">
                  The founding idea
                </span>{" "}
                — AI should let anyone preview their next look without
                commitment, judgment, or expensive salon visits.
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  The vision
                </span>{" "}
                — bringing studio-quality AI to everyone's pocket with warmth,
                speed, and complete privacy.
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  The mission
                </span>{" "}
                — helping 100 million people discover their best self by 2027.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-6 flex items-center gap-3"
            >
              <span className="h-px w-10 bg-linear-to-r from-primary to-transparent" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-wide text-foreground">
                  — Talha Tabish
                </span>
                <span className="text-xs text-muted-foreground">
                  Founder · CodeWithTabish
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}