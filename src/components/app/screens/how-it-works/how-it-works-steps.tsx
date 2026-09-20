"use client";

import * as React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// STEPS DATA
// ============================================

interface Step {
  number: string;
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  image: string;
  imageAlt: string;
  reverse?: boolean;
}

const STEPS: Step[] = [
  {
    number: "01",
    badge: "Step One",
    title: "Upload Your Photo",
    description:
      "Choose any clear selfie or portrait from your gallery. Front-facing works best, but our AI handles any angle, lighting, or background.",
    bullets: [
      "Works with any photo format (JPG, PNG, HEIC)",
      "No editing or cropping needed",
      "Your photo is never stored — deleted in 24 hours",
    ],
    image: "/images/how-it-works/one.png",
    imageAlt: "Upload your photo interface",
    reverse: false, // image left, text right
  },
  {
    number: "02",
    badge: "Step Two",
    title: "Choose Your Transformation",
    description:
      "Pick from 6 AI-powered features — hairstyles, beards, outfits, age transformations, hair colors, or AI image generation. Then browse hundreds of styles.",
    bullets: [
      "100+ hairstyles, 50+ beards, 200+ outfits",
      "Real-time previews as you browse",
      "Try different styles, find your perfect look",
    ],
    image: "/images/how-it-works/two.png",
    imageAlt: "Choose transformation interface",
    reverse: true, // text left, image right
  },
  {
    number: "03",
    badge: "Step Three",
    title: "Get Your Transformation",
    description:
      "Sit back and watch the magic! Our AI processes your photo and creates your new look in seconds. Download, share, or try again with a different style.",
    bullets: [
      "High-quality, natural-looking results",
      "Download in high resolution",
      "Share with friends or keep it private",
    ],
    image: "/images/how-it-works/three.png",
    imageAlt: "Transformation result interface",
    reverse: false, // image left, text right
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ============================================
// STEP BLOCK COMPONENT
// ============================================

function StepBlock({ step }: { step: Step }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10"
    >
      {/* ============================================
          IMAGE COLUMN
          ============================================ */}
      <motion.div
        variants={itemVariants}
        className={cn(
          "lg:col-span-6",
          step.reverse ? "lg:order-2" : "lg:order-1",
        )}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "relative w-full overflow-hidden rounded-3xl",
            "aspect-4/3",
          )}
        >
          <Image
            src={step.image}
            alt={step.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain object-center drop-shadow-2xl"
          />
        </motion.div>
      </motion.div>

      {/* ============================================
          TEXT COLUMN
          ============================================ */}
      <motion.div
        variants={itemVariants}
        className={cn(
          "flex flex-col items-start gap-4 sm:gap-5",
          "lg:col-span-6",
          step.reverse ? "lg:order-1" : "lg:order-2",
        )}
      >
        {/* Number + Badge row */}
        <div className="flex items-center gap-4">
          {/* Big amber numeral */}
          <span
            className={cn(
              "bg-linear-to-br from-primary via-primary to-primary/70 bg-clip-text",
              "text-6xl font-extrabold leading-none tracking-[-0.04em] text-transparent",
              "sm:text-7xl lg:text-8xl",
            )}
          >
            {step.number}
          </span>

          {/* Small badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full",
              "border border-primary/30 bg-primary/10",
              "px-3 py-1",
              "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
            )}
          >
            {step.badge}
          </span>
        </div>

        {/* Title */}
        <h3
          className={cn(
            "text-2xl font-extrabold leading-[1.15] tracking-[-0.028em] text-foreground",
            "sm:text-3xl lg:text-[2.25rem]",
          )}
        >
          {step.title}
        </h3>

        {/* Description */}
        <p className="max-w-xl text-sm leading-[1.7] text-muted-foreground sm:text-[15px] lg:text-base">
          {step.description}
        </p>

        {/* Bullets */}
        <ul className="mt-1 flex flex-col gap-2.5">
          {step.bullets.map((bullet, i) => (
            <motion.li
              key={bullet}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.2 + i * 0.08,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-start gap-2.5"
            >
              <div
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center",
                  "rounded-full bg-primary/15 ring-1 ring-primary/25",
                )}
              >
                <Check className="size-3 text-primary" strokeWidth={3} />
              </div>
              <span className="text-[13px] leading-relaxed text-foreground/90 sm:text-sm">
                {bullet}
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function HowItWorksSteps() {
  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/3 size-[500px] rounded-full bg-primary/8 blur-[140px] dark:bg-primary/12" />
        <div className="absolute right-1/4 bottom-1/3 size-[400px] rounded-full bg-primary/6 blur-[120px] dark:bg-primary/10" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-16 sm:gap-20 lg:gap-24">
          {STEPS.map((step) => (
            <StepBlock key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}