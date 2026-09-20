"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Scissors,
  User,
  Shirt,
  Hourglass,
  Palette,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================
// FEATURE DATA
// ============================================

interface FeatureCard {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: React.ElementType;
  href: string;
}

const FEATURES: FeatureCard[] = [
  {
    id: "hairstyles",
    badge: "100+ Styles",
    title: "Hairstyles",
    subtitle: "From classic to trendy",
    description:
      "Try any haircut, length, or style on your photo. From bobs to pixie cuts to long waves — see yourself with any look before you commit.",
    image: "/images/featurepage/hair.png",
    icon: Scissors,
    href: "/app/hairstyles",
  },
  {
    id: "beards",
    badge: "50+ Beards",
    title: "Beard Styles",
    subtitle: "Find your perfect look",
    description:
      "Grow, trim, or completely restyle your facial hair. Explore full beards, stubble, goatees, and more in one tap.",
    image: "/images/featurepage/beard.png",
    icon: User,
    href: "/app/beards",
  },
  {
    id: "outfits",
    badge: "200+ Outfits",
    title: "Outfits",
    subtitle: "Style your vibe",
    description:
      "See yourself in any outfit — casual, formal, or bold. Try new looks without leaving your home or spending a rupee.",
    image: "/images/featurepage/outfits.png",
    icon: Shirt,
    href: "/app/outfits",
  },
  {
    id: "age",
    badge: "10 Stages",
    title: "Age Transformations",
    subtitle: "See your future self",
    description:
      "Preview how you'll look at any age — 10 years younger, 20 years older, or anywhere in between. Both fascinating and fun.",
    image: "/images/featurepage/age.png",
    icon: Hourglass,
    href: "/app/age",
  },
  {
    id: "colors",
    badge: "80+ Colors",
    title: "Hair Colors",
    subtitle: "Find your perfect shade",
    description:
      "Try any hair color — from natural tones to bold fantasy colors. See what suits you best before you dye.",
    image: "/images/featurepage/color.png",
    icon: Palette,
    href: "/app/colors",
  },
  {
    id: "image-gen",
    badge: "Unlimited · Free",
    title: "AI Image Generation",
    subtitle: "Turn imagination into reality",
    description:
      "Create stunning, unique AI images from your ideas. Portraits, fantasy, aesthetic, professional — and more — all for free.",
    image: "/images/featurepage/ai.png",
    icon: Wand2,
    href: "/app/imagegen",
  },
];

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

const headerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ============================================
// FEATURE CARD
// ============================================

function FeatureCardItem({ card }: { card: FeatureCard }) {
  const { isSignedIn, isLoaded } = useUser();
  const Icon = card.icon;

  const wrapperClass = cn(
    "group relative block w-full overflow-hidden rounded-3xl",
    "aspect-3/4",
    "border border-border/50",
    "bg-card",
    "transition-all duration-500 ease-out",
    "hover:-translate-y-2",
    "hover:border-primary/50",
    "hover:shadow-2xl hover:shadow-primary/20",
    "cursor-pointer text-left",
  );

  const innerContent = (
    <>
      {/* BACKGROUND IMAGE */}
      <Image
        src={card.image}
        alt={card.title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={cn(
          "object-cover object-center",
          "transition-transform duration-700 ease-out",
          "group-hover:scale-[1.06]",
        )}
      />

      {/* BOTTOM GRADIENT OVERLAY */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-linear-to-t from-black/95 via-black/60 via-40% to-transparent",
        )}
      />

      {/* TOP-LEFT STAT BADGE */}
      <div className="absolute left-4 top-4 z-10">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full",
            "border border-white/15 bg-black/50 backdrop-blur-md",
            "px-3 py-1.5",
            "text-[11px] font-bold tracking-wide text-white",
          )}
        >
          <Sparkles className="size-3 text-primary" strokeWidth={2.5} />
          {card.badge}
        </span>
      </div>

      {/* BOTTOM CONTENT */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-5">
        {/* Icon + Title Row */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl",
              "bg-linear-to-br from-primary to-primary/70",
              "shadow-lg shadow-primary/40",
              "transition-transform duration-500",
              "group-hover:scale-110 group-hover:rotate-3",
            )}
          >
            <Icon
              className="size-5 text-primary-foreground"
              strokeWidth={2.5}
            />
          </div>

          <div className="flex min-w-0 flex-col pt-0.5">
            <h3 className="text-lg font-bold leading-tight tracking-tight text-white">
              {card.title}
            </h3>
            <p className="mt-0.5 text-xs font-medium leading-snug text-white/70">
              {card.subtitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[13px] leading-[1.55] text-white/75">
          {card.description}
        </p>

        {/* Try This Feature link */}
        <div
          className={cn(
            "mt-1 inline-flex items-center gap-1.5 self-start",
            "text-[13px] font-semibold text-primary",
            "transition-all duration-300",
          )}
        >
          <span>Try This Feature</span>
          <ArrowRight
            className={cn(
              "size-3.5",
              "transition-transform duration-300",
              "group-hover:translate-x-0.5",
            )}
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* AMBER RING ON HOVER */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-3xl",
          "ring-2 ring-primary/0",
          "transition-all duration-500",
          "group-hover:ring-primary/60",
        )}
      />
    </>
  );

  return (
    <motion.div variants={cardVariants}>
      {isLoaded && isSignedIn ? (
        // ── Signed-in: navigate to feature page ──
        <Link href={card.href} className={wrapperClass}>
          {innerContent}
        </Link>
      ) : (
        // ── Guest: open Clerk signup modal ──
        <SignUpButton mode="modal">
          <div className={wrapperClass} role="button" tabIndex={0}>
            {innerContent}
          </div>
        </SignUpButton>
      )}
    </motion.div>
  );
}

// ============================================
// MAIN SECTION
// ============================================

export function FeatureGrid() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <section className="relative w-full py-14 sm:py-16 lg:py-20">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 size-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/12 blur-[120px] dark:bg-primary/18" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ============================================
            SECTION HEADER
            ============================================ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3.5 text-center sm:mb-12"
        >
          <motion.div variants={headerItemVariants}>
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                "px-3.5 py-1.5",
                "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
              )}
            >
              <Sparkles className="size-3" strokeWidth={2.5} />
              The Magic
            </Badge>
          </motion.div>

          <motion.h2
            variants={headerItemVariants}
            className={cn(
              "text-3xl font-extrabold leading-[1.1] tracking-[-0.028em] text-foreground",
              "sm:text-4xl lg:text-[2.75rem]",
            )}
          >
            Every Transformation.
            <br />
            <span className="bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              One Tap Away.
            </span>
          </motion.h2>

          <motion.p
            variants={headerItemVariants}
            className="max-w-lg text-sm leading-[1.6] text-muted-foreground sm:text-base"
          >
            Choose any feature. Upload your photo. Watch the magic happen.
          </motion.p>
        </motion.div>

        {/* ============================================
            3x2 GRID OF FEATURE CARDS
            ============================================ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {FEATURES.map((card) => (
            <FeatureCardItem key={card.id} card={card} />
          ))}
        </motion.div>

        {/* ============================================
            SEE IT IN ACTION CTA
            ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 flex justify-center sm:mt-12"
        >
          {isLoaded && isSignedIn ? (
            // ── Signed-in: navigate to /app ──
            <Link
              href="/app"
              className={cn(
                "group inline-flex items-center gap-2",
                "rounded-full border border-border/60 bg-background/60 backdrop-blur-sm",
                "px-5 py-2.5",
                "text-sm font-semibold text-foreground",
                "transition-all duration-300",
                "hover:border-primary/50 hover:bg-primary/5",
              )}
            >
              See It In Action
              <ArrowUpRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2.5}
              />
            </Link>
          ) : (
            // ── Guest: open Clerk signup modal ──
            <SignUpButton mode="modal">
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  "group inline-flex cursor-pointer items-center gap-2",
                  "rounded-full border border-border/60 bg-background/60 backdrop-blur-sm",
                  "px-5 py-2.5",
                  "text-sm font-semibold text-foreground",
                  "transition-all duration-300",
                  "hover:border-primary/50 hover:bg-primary/5",
                )}
              >
                See It In Action
                <ArrowUpRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2.5}
                />
              </div>
            </SignUpButton>
          )}
        </motion.div>
      </div>
    </section>
  );
}