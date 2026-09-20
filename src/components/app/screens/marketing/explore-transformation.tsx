"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// CARD DATA
// ============================================

interface TransformationCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

const CARDS: TransformationCard[] = [
  {
    id: "hairstyles",
    title: "Hairstyles",
    subtitle: "From classic to trendy",
    image: "/images/feat/hairs.jpg",
  },
  {
    id: "beards",
    title: "Beard Styles",
    subtitle: "Find your perfect look",
    image: "/images/feat/beard.jpg",
  },
  {
    id: "outfits",
    title: "Outfits",
    subtitle: "Style your vibe",
    image: "/images/feat/outfit.jpg",
  },
  {
    id: "age",
    title: "Age Transformations",
    subtitle: "See your future self",
    image: "/images/feat/age.jpg",
  },
  {
    id: "colors",
    title: "Hair Colors",
    subtitle: "Try new shades",
    image: "/images/feat/color.jpg",
  },
  {
    id: "image-gen",
    title: "AI Image Generation",
    subtitle: "Create anything",
    image: "/images/feat/color.jpg", // placeholder — replace with imagegen.jpg
  },
];

// ============================================
// ANIMATION VARIANTS (TypeScript-safe)
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
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
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

function TransformationCardItem({ card }: { card: TransformationCard }) {
  return (
    <motion.div variants={cardVariants} className="shrink-0 snap-start">
      <Link
        href={`/dashboard/${card.id}`}
        className={cn(
          "group relative block w-[260px] overflow-hidden rounded-[28px] sm:w-[280px] lg:w-[300px]",
          "aspect-784/1168",
          "border border-border/50",
          "bg-card",
          "transition-all duration-500 ease-out",
          "hover:-translate-y-2",
          "hover:border-primary/50",
          "hover:shadow-2xl hover:shadow-primary/20",
        )}
      >
        {/* ============================================
            BACKGROUND IMAGE
            ============================================ */}
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="(max-width: 640px) 260px, (max-width: 1024px) 280px, 300px"
          className={cn(
            "object-cover object-center",
            "transition-transform duration-700 ease-out",
            "group-hover:scale-[1.06]",
          )}
          priority={false}
        />

        {/* ============================================
            GRADIENT OVERLAY (for text readability)
            ============================================ */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            "bg-linear-to-t from-black/90 via-black/40 to-transparent",
            "transition-opacity duration-500",
            "group-hover:from-black/95",
          )}
        />

        {/* ============================================
            BOTTOM CONTENT AREA
            ============================================ */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5">
          {/* Title with sliding arrow */}
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold leading-tight tracking-tight text-white">
              {card.title}
            </h3>
            <ArrowRight
              className={cn(
                "size-4 shrink-0 text-primary",
                "translate-x-0 opacity-0",
                "transition-all duration-500",
                "group-hover:translate-x-1 group-hover:opacity-100",
              )}
              strokeWidth={2.5}
            />
          </div>

          {/* Subtitle */}
          <p className="mt-1 text-[13px] font-medium leading-snug text-white/70">
            {card.subtitle}
          </p>
        </div>

        {/* ============================================
            AMBER RING ON HOVER
            ============================================ */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[28px]",
            "ring-2 ring-primary/0",
            "transition-all duration-500",
            "group-hover:ring-primary/60",
          )}
        />
      </Link>
    </motion.div>
  );
}

// ============================================
// MAIN SECTION
// ============================================

export function TransformationsSection() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  // ---------- Scroll handlers ----------
  const scrollBy = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth =
      el.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? 300;
    const amount = cardWidth + 20; // card + gap
    el.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  // ---------- Track active dot on scroll ----------
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth =
      el.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? 300;
    const gap = 20;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(index, CARDS.length - 1));
  };

  return (
    <section className="relative w-full py-20 sm:py-24 lg:py-28">
      {/* ============================================
          AMBIENT BACKGROUND GLOW
          ============================================ */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/15 blur-[120px] dark:bg-primary/20" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px] dark:bg-primary/15" />
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
          className="mb-12 flex flex-col gap-6 sm:mb-14"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            {/* Left: Badge + Headline + Subheadline */}
            <div className="flex flex-col items-start gap-4">
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
                  <Sparkles className="size-3" strokeWidth={2.5} />
                  Try It Yourself
                </Badge>
              </motion.div>

              {/* Headline */}
              <motion.h2
                variants={headerItemVariants}
                className={cn(
                  "text-4xl font-extrabold leading-[1.08] tracking-[-0.028em] text-foreground",
                  "sm:text-5xl lg:text-6xl",
                )}
              >
                Explore All
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                    Transformations
                  </span>

                  {/* ═══ Hand-drawn smooth swoosh underline ═══ */}
                  <svg
                    className="pointer-events-none absolute left-0 w-full"
                    style={{ bottom: "-0.35em" }}
                    viewBox="0 0 300 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <motion.path
                      d="M 6 12 C 80 4, 220 4, 294 12"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className="text-primary"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.6,
                        duration: 1.1,
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                    />
                  </svg>
                </span>
              </motion.h2>

              {/* Subheadline */}
              <motion.p
                variants={headerItemVariants}
                className="max-w-xl text-base leading-[1.6] tracking-[-0.008em] text-muted-foreground sm:text-[17px]"
              >
                Endless possibilities. One powerful AI. Try any look on your
                photo in seconds.
              </motion.p>
            </div>

            {/* Right: View All button */}
            <motion.div variants={headerItemVariants} className="shrink-0">
              <Button
                asChild
                variant="outline"
                size="lg"
                className={cn(
                  "group h-11 rounded-full border-border/60 bg-background/60 backdrop-blur-sm",
                  "px-5 text-sm font-semibold",
                  "transition-all duration-300",
                  "hover:border-primary/50 hover:bg-primary/5",
                )}
              >
                <Link href="/features">
                  View All Features
                  <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* ============================================
            SCROLLABLE CARD ROW
            ============================================ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative"
        >
          {/* Fade edges for scroll hint (desktop) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-16 bg-linear-to-r from-background to-transparent lg:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-16 bg-linear-to-l from-background to-transparent lg:block" />

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className={cn(
              "flex gap-5 overflow-x-auto pb-2",
              "snap-x snap-mandatory",
              "scrollbar-hide",
              "scroll-smooth",
            )}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {CARDS.map((card) => (
              <div key={card.id} data-card>
                <TransformationCardItem card={card} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ============================================
            NAVIGATION CONTROLS
            ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          {/* Prev Button */}
          <button
            type="button"
            onClick={() => scrollBy("left")}
            aria-label="Scroll left"
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              "border border-border/60 bg-background/60 backdrop-blur-sm",
              "text-foreground",
              "transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
              "active:scale-95",
            )}
          >
            <ArrowLeft className="size-4" strokeWidth={2.5} />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {CARDS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeIndex
                    ? "w-8 bg-primary"
                    : "w-1.5 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => scrollBy("right")}
            aria-label="Scroll right"
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              "border border-border/60 bg-background/60 backdrop-blur-sm",
              "text-foreground",
              "transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
              "active:scale-95",
            )}
          >
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}