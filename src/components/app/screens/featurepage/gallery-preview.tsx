"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// GALLERY DATA
// ============================================

interface GalleryItem {
  id: string;
  title: string;
  image: string;
}

const GALLERY: GalleryItem[] = [
  {
    id: "hairstyle",
    title: "Hairstyle Transformation",
    image: "/images/feat/hairs.jpg",
  },
  {
    id: "beard",
    title: "Beard Transformation",
    image: "/images/feat/beard.jpg",
  },
  {
    id: "outfit",
    title: "Outfit Transformation",
    image: "/images/feat/outfit.jpg",
  },
  {
    id: "age",
    title: "Age Transformation",
    image: "/images/feat/age.jpg",
  },
  {
    id: "color",
    title: "Hair Color Transformation",
    image: "/images/feat/color.jpg",
  },
  {
    id: "hairstyle2",
    title: "Hairstyle Transformation",
    image: "/images/feat/hairs.jpg",
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ============================================
// SHARED CARD CLASS
// ============================================

const cardClass = cn(
  "group relative block overflow-hidden rounded-2xl",
  "w-[150px] sm:w-[170px] md:w-[185px] lg:w-[200px]",
  "aspect-[3/4]",
  "border border-border/50",
  "bg-card",
  "cursor-pointer",
  "transition-all duration-500 ease-out",
  "hover:-translate-y-1.5",
  "hover:border-primary/50",
  "hover:shadow-xl hover:shadow-primary/20",
);

// ============================================
// GALLERY CARD
// ============================================

function GalleryCard({ item }: { item: GalleryItem }) {
  const { isSignedIn, isLoaded } = useUser();

  const inner = (
    <>
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(max-width: 640px) 150px, (max-width: 1024px) 185px, 200px"
        className={cn(
          "object-cover object-center",
          "transition-transform duration-700 ease-out",
          "group-hover:scale-[1.05]",
        )}
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0",
          "bg-linear-to-t from-black/90 via-black/50 to-transparent",
          "px-2.5 pt-8 pb-2.5",
        )}
      >
        <p className="text-center text-[10px] font-semibold leading-tight text-white sm:text-[11px]">
          {item.title}
        </p>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "ring-2 ring-primary/0",
          "transition-all duration-500",
          "group-hover:ring-primary/50",
        )}
      />
    </>
  );

  return (
    <motion.div variants={itemVariants} className="shrink-0 snap-start">
      {isLoaded && isSignedIn ? (
        // ✅ Logged in → Link to /app/gallery
        <Link href="/app/gallery" className={cardClass}>
          {inner}
        </Link>
      ) : (
        // ✅ Not logged in → Clerk modal opens
        <SignUpButton mode="modal">
          <div role="button" tabIndex={0} className={cardClass}>
            {inner}
          </div>
        </SignUpButton>
      )}
    </motion.div>
  );
}

// ============================================
// VIEW ALL BUTTON
// ============================================

function ViewAllButton() {
  const { isSignedIn, isLoaded } = useUser();

  const btnClass = cn(
    "group inline-flex h-10 cursor-pointer items-center justify-center gap-2",
    "rounded-full border border-border/60 bg-background/60 backdrop-blur-sm",
    "px-4 text-sm font-semibold text-foreground",
    "transition-all duration-300",
    "hover:border-primary/50 hover:bg-primary/5",
    "no-underline",
  );

  if (isLoaded && isSignedIn) {
    return (
      <Link href="/app/gallery" className={btnClass}>
        View Full Gallery
        <ArrowRight
          className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
          strokeWidth={2.5}
        />
      </Link>
    );
  }

  return (
    <SignUpButton mode="modal">
      <button type="button" className={btnClass}>
        View Full Gallery
        <ArrowRight
          className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
          strokeWidth={2.5}
        />
      </button>
    </SignUpButton>
  );
}

// ============================================
// MAIN SECTION
// ============================================

export function GalleryPreview() {
  return (
    <section className="relative w-full py-14 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-0 size-[400px] rounded-full bg-primary/8 blur-[120px] dark:bg-primary/12" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex flex-col items-start gap-3">
            <motion.div variants={headerItemVariants}>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full",
                  "border border-primary/30 bg-primary/10",
                  "px-3 py-1",
                  "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
                )}
              >
                <Sparkles className="size-2.5" strokeWidth={2.5} />
                Real People · Real Results
              </span>
            </motion.div>

            <motion.h2
              variants={headerItemVariants}
              className={cn(
                "text-2xl font-extrabold leading-[1.15] tracking-[-0.028em] text-foreground",
                "sm:text-3xl lg:text-[2rem]",
              )}
            >
              Real Transformations,{" "}
              <span className="bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Real People
              </span>
            </motion.h2>

            <motion.p
              variants={headerItemVariants}
              className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
            >
              See how LEXA helps people discover their best selves.
            </motion.p>
          </div>

          {/* View All button — adaptive */}
          <motion.div variants={headerItemVariants} className="shrink-0">
            <ViewAllButton />
          </motion.div>
        </motion.div>

        {/* GALLERY ROW */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-linear-to-r from-background to-transparent lg:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-linear-to-l from-background to-transparent lg:block" />

          <div
            className={cn(
              "flex gap-3 overflow-x-auto pb-2",
              "snap-x snap-mandatory",
              "scrollbar-hide",
              "scroll-smooth",
            )}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {GALLERY.map((item) => (
              <div key={item.id} data-card>
                <GalleryCard item={item} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}