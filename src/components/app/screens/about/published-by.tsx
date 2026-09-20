"use client";

import * as React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import {
  Sparkles,
  BadgeCheck,
  Smartphone,
  Globe,
  Bot,
  Rocket,
  Gamepad2,
  Wrench,
  ExternalLink,
  Users,
  Code2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// SERVICES WE BUILD
// ============================================

const SERVICES = [
  { icon: Smartphone, label: "Mobile Apps" },
  { icon: Globe, label: "Websites & Web Apps" },
  { icon: Bot, label: "AI Tools" },
  { icon: Rocket, label: "SaaS Products" },
  { icon: Gamepad2, label: "Games & Interactive" },
  { icon: Wrench, label: "Developer Tools" },
];

// ============================================
// TECH STACK LINE
// ============================================

const TECH_STACK =
  "TypeScript · React · React Native · Expo · Next.js · Node.js · Databases · Cloud · AI";

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

export function PublishedBy() {
  return (
    <section className="relative w-full overflow-hidden bg-card py-12 sm:py-16 lg:py-20">
      {/* Ambient amber glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 size-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 size-[500px] rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* ============================================
              LEFT — Portrait
              ============================================ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-2 lg:order-1 lg:col-span-5"
          >
            <div
              className={cn(
                "relative mx-auto aspect-2/3 w-full max-w-[340px] sm:max-w-[380px]",
                "overflow-hidden rounded-3xl",
                "border border-card-foreground/10",
                "bg-linear-to-br from-primary/15 via-card to-background",
              )}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/30 blur-[70px]" />
              <Image
                src="/images/about/developer.png"
                alt="Tabish — Founder of CodeWithTabish"
                fill
                sizes="(max-width: 1024px) 100vw, 380px"
                className="object-contain object-bottom drop-shadow-2xl"
                priority
              />
            </div>
          </motion.div>

          {/* ============================================
              RIGHT — Content
              ============================================ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="order-1 flex flex-col items-start lg:order-2 lg:col-span-7"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-4">
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full border-primary/40 bg-primary/10",
                  "px-3.5 py-1.5",
                  "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
                )}
              >
                <Sparkles className="size-3" strokeWidth={2.5} />
                Published By
              </Badge>
            </motion.div>

            {/* Title + Verified badge */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-2.5"
            >
              <h2 className="text-3xl font-extrabold tracking-[-0.028em] text-card-foreground sm:text-4xl lg:text-5xl">
                CodeWithTabish
              </h2>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full",
                  "bg-linear-to-r from-primary to-primary/80",
                  "px-2.5 py-1",
                  "text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground",
                )}
              >
                <BadgeCheck className="size-3" strokeWidth={2.5} />
                Verified
              </span>
            </motion.div>

            {/* Intro paragraph */}
            <motion.p
              variants={itemVariants}
              className="mt-3 max-w-2xl text-sm leading-[1.7] text-card-foreground/80 sm:text-base lg:text-[17px]"
            >
              A software development brand building modern{" "}
              <span className="font-semibold text-card-foreground">
                mobile apps, websites, SaaS platforms, AI-powered tools, and
                digital products
              </span>{" "}
              — led by{" "}
              <span className="font-semibold text-primary">Tabish</span>, a
              software engineer and independent developer.
            </motion.p>

            {/* Mission paragraph */}
            <motion.p
              variants={itemVariants}
              className="mt-3 max-w-2xl text-[13px] leading-[1.7] text-card-foreground/60 sm:text-sm lg:text-[15px]"
            >
              We explore the intersection of technology, creativity, and
              practical problem-solving — turning ideas into useful, polished,
              and accessible digital experiences. CodeWithTabish is not just
              about writing code; it's about taking an idea from concept to a
              real, usable product.
            </motion.p>

            {/* ============================================
                SERVICES GRID
                ============================================ */}
            <motion.div
              variants={itemVariants}
              className="mt-5 flex flex-wrap gap-2"
            >
              {SERVICES.map((service) => {
                const Icon = service.icon;
                return (
                  <span
                    key={service.label}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full",
                      "border border-card-foreground/15 bg-card-foreground/5 backdrop-blur-sm",
                      "px-2.5 py-1.5",
                      "text-[11px] font-semibold text-card-foreground/90 sm:text-xs",
                    )}
                  >
                    <Icon
                      className="size-3.5 text-primary"
                      strokeWidth={2.5}
                    />
                    {service.label}
                  </span>
                );
              })}
            </motion.div>

            {/* ============================================
                TECH STACK LINE
                ============================================ */}
            <motion.div
              variants={itemVariants}
              className={cn(
                "mt-4 inline-flex items-start gap-2 rounded-2xl",
                "border border-card-foreground/10 bg-card-foreground/5 backdrop-blur-sm",
                "px-3.5 py-2.5",
              )}
            >
              <Code2
                className="mt-0.5 size-3.5 shrink-0 text-primary"
                strokeWidth={2.5}
              />
              <p className="text-[11px] font-medium leading-relaxed text-card-foreground/70 sm:text-xs">
                {TECH_STACK}
              </p>
            </motion.div>

            {/* ============================================
                TAGLINE
                ============================================ */}
            <motion.div
              variants={itemVariants}
              className="mt-5 flex items-center gap-3"
            >
              <span className="h-px w-8 bg-linear-to-r from-primary to-transparent" />
              <p className="text-sm font-bold tracking-wide text-primary sm:text-base">
                Build. Learn. Experiment. Ship.
              </p>
            </motion.div>

            {/* ============================================
                CTAs
                ============================================ */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button
                asChild
                size="lg"
                className={cn(
                  "group/btn h-11 rounded-full px-5 text-sm font-semibold sm:px-6 sm:text-base",
                  "bg-linear-to-r from-primary to-primary/80",
                  "text-primary-foreground",
                  "shadow-lg shadow-primary/30",
                  "transition-all duration-300",
                  "hover:shadow-xl hover:shadow-primary/40",
                )}
              >
                <a
                  href="http://codewithtabish.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit codewithtabish.com
                  <ExternalLink
                    className="ml-2 size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                    strokeWidth={2.5}
                  />
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className={cn(
                  "h-11 rounded-full px-5 text-sm font-semibold sm:px-6 sm:text-base",
                  "border-card-foreground/20 bg-card-foreground/5 text-card-foreground backdrop-blur-sm",
                  "transition-all duration-300",
                  "hover:border-primary/50 hover:bg-card-foreground/10",
                )}
              >
                <a href="mailto:tabish@codewithtabish.com">
                  Contact the Developer
                </a>
              </Button>
            </motion.div>

            {/* ============================================
                TRUST ROW
                ============================================ */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex items-center gap-2 text-[11px] text-card-foreground/50 sm:text-xs lg:text-sm"
            >
              <Users className="size-4 text-primary" strokeWidth={2.5} />
              <span>
                Trusted by developers and creators across 30+ countries
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}