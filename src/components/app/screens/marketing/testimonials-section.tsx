"use client";

import * as React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Star, ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================
// TESTIMONIAL DATA
// ============================================

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "sarah",
    quote:
      "LYXA is honestly incredible! I tried like 10 different hairstyles and found my perfect look. The AI is so realistic and easy to use. Highly recommend!",
    name: "Sarah Khan",
    role: "Content Creator",
    avatar: "/images/avatars/sarah.jpg",
    rating: 5,
  },
  {
    id: "ali",
    quote:
      "I used the beard transformation feature and it nailed it! The results look so natural. This app is a game changer for self-expression.",
    name: "Ali Raza",
    role: "Software Engineer",
    avatar: "/images/avatars/ali.jpg",
    rating: 5,
  },
  {
    id: "Aleena Malik",
    quote:
      "The outfit try-on feature is amazing! I found my style in minutes. The quality and realism are next level. LYXA is my new favorite app!",
    name: "Aleena Malik",
    role: "Student",
    avatar: "/images/avatars/aleena.jpg",
    rating: 5,
  },
  {
    id: "hassan",
    quote:
      "Tried LYXA for my wedding photos. The age transform feature blew my mind — it looked like a professional photoshoot.",
    name: "Hassan Ahmed",
    role: "Photographer",
    avatar: "/images/avatars/hassan.jpg",
    rating: 5,
  },
  {
    id: "faiza",
    quote:
      "As a makeup artist, I use LYXA daily to preview looks for my clients. The hair color simulation is scarily accurate.",
    name: "Faiza Sheikh",
    role: "Makeup Artist",
    avatar: "/images/avatars/faiza.jpg",
    rating: 5,
  },
  {
    id: "usman",
    quote:
      "Finally an AI app that doesn't feel like a toy. The results are studio-quality and the speed is unreal. Worth every penny.",
    name: "Usman Tariq",
    role: "Entrepreneur",
    avatar: "/images/avatars/usman.jpg",
    rating: 5,
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
// TESTIMONIAL CARD
// ============================================

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        "group relative flex shrink-0 snap-start flex-col",
        "w-xs sm:w-[340px] lg:w-[360px]",
        "rounded-3xl border border-border/50",
        "bg-card/70 backdrop-blur-sm",
        "p-6 sm:p-7",
        "transition-all duration-500 ease-out",
        "hover:-translate-y-1.5",
        "hover:border-primary/40",
        "hover:bg-card",
        "hover:shadow-xl hover:shadow-primary/10",
      )}
    >
      {/* ============================================
          LARGE QUOTE ICON
          ============================================ */}
      <div className="mb-4">
        <Quote
          className="size-8 text-primary"
          fill="currentColor"
          strokeWidth={0}
        />
      </div>

      {/* ============================================
          QUOTE TEXT
          ============================================ */}
      <p className="mb-6 flex-1 text-[15px] italic leading-[1.65] tracking-[-0.005em] text-foreground/90">
        &ldquo;{item.quote}&rdquo;
      </p>

      {/* ============================================
          AUTHOR ROW
          ============================================ */}
      <div className="flex items-center gap-3 border-t border-border/50 pt-5">
        {/* Avatar */}
        <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-primary/30">
          <Image
            src={item.avatar}
            alt={item.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>

        {/* Name + Role */}
        <div className="flex min-w-0 flex-col">
          <h4 className="text-sm font-bold leading-tight text-foreground">
            {item.name}
          </h4>
          <p className="text-xs leading-tight text-muted-foreground">
            {item.role}
          </p>
        </div>
      </div>

      {/* ============================================
          STAR RATING
          ============================================ */}
      <div className="mt-4 flex items-center gap-1">
        {[...Array(item.rating)].map((_, i) => (
          <Star
            key={i}
            className="size-4 fill-primary text-primary"
            strokeWidth={0}
          />
        ))}
      </div>

      {/* Hover Ring */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-3xl",
          "ring-1 ring-primary/0",
          "transition-all duration-500",
          "group-hover:ring-primary/30",
        )}
      />
    </motion.div>
  );
}

// ============================================
// MAIN SECTION
// ============================================

export function TestimonialsSection() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  // ---------- Scroll handlers ----------
  const scrollBy = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth =
      el.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? 360;
    const amount = cardWidth + 20;
    el.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  // ---------- Track active dot ----------
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth =
      el.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? 360;
    const gap = 20;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(index, TESTIMONIALS.length - 1));
  };

  return (
    <section className="relative w-full py-20 sm:py-24 lg:py-28">
      {/* ============================================
          AMBIENT BACKGROUND GLOW
          ============================================ */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px] dark:bg-primary/12" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ============================================
            SECTION HEADER (Centered)
            ============================================ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center sm:mb-14"
        >
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
              Loved by Thousands
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={headerItemVariants}
            className={cn(
              "text-4xl font-extrabold leading-[1.1] tracking-[-0.028em] text-foreground",
              "sm:text-5xl lg:text-[3.25rem]",
            )}
          >
            What Our Users Say
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            variants={headerItemVariants}
            className="max-w-xl text-base leading-[1.6] tracking-[-0.008em] text-muted-foreground sm:text-[17px]"
          >
            Over 10,000 transformations. Over 10,000 happy faces.
          </motion.p>
        </motion.div>

        {/* ============================================
            SCROLLABLE TESTIMONIALS ROW
            ============================================ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative"
        >
          {/* Fade edges (desktop) */}
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
            {TESTIMONIALS.map((item) => (
              <div key={item.id} data-card>
                <TestimonialCard item={item} />
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
          {/* Prev */}
          <button
            type="button"
            onClick={() => scrollBy("left")}
            aria-label="Previous testimonials"
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
            {TESTIMONIALS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeIndex
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={() => scrollBy("right")}
            aria-label="Next testimonials"
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