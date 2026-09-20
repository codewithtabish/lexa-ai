"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// PLAN DATA (Monthly only — Basic & Pro)
// ============================================

interface Plan {
  id: "basic" | "pro";
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 4.99,
    period: "per month",
    description: "Perfect for casual users",
    icon: Zap,
    features: [
      "20 AI credits per month",
      "All 6 AI features",
      "Unlimited image generation",
      "No watermark",
      "Standard processing speed",
      "Priority email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 7.99,
    period: "per month",
    description: "Best for creators & power users",
    icon: Crown,
    popular: true,
    features: [
      "40 AI credits per month",
      "All 6 AI features",
      "Unlimited image generation",
      "No watermark",
      "⚡ Lightning-fast processing",
      "Priority 24/7 support",
      "Early access to new features",
      "Commercial usage rights",
    ],
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
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

// ============================================
// PRICING CARD
// ============================================

function PricingCard({ plan }: { plan: Plan }) {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignUp } = useClerk();
  const Icon = plan.icon;

  // ---------- CTA Handler ----------
  // Guest → opens Clerk modal
  // Signed in → redirects to /dashboard/upgrade?plan=xxx
  const handleClick = () => {
    if (!isLoaded) return;

    if (isSignedIn) {
      // Signed-in users are redirected via the Link wrapper below
      return;
    }

    // Open Clerk modal for guests
    openSignUp({
      // Optional: redirect directly to the upgrade page after signup
      // afterSignUpUrl: `/dashboard/upgrade?plan=${plan.id}`,
    });
  };

  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        "group relative flex h-full flex-col",
        "rounded-3xl border",
        "transition-all duration-500 ease-out",
        plan.popular
          ? [
              "border-primary/60",
              "bg-linear-to-b from-card to-card/60",
              "shadow-xl shadow-primary/15",
              "hover:-translate-y-2",
              "hover:shadow-2xl hover:shadow-primary/25",
              "p-7 sm:p-8",
            ].join(" ")
          : [
              "border-border/60",
              "bg-card/70 backdrop-blur-sm",
              "hover:-translate-y-1",
              "hover:border-primary/40",
              "hover:shadow-lg hover:shadow-primary/10",
              "p-6 sm:p-7",
            ].join(" "),
      )}
    >
      {/* ============================================
          "MOST POPULAR" BADGE (Pro only)
          ============================================ */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.4,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full",
              "bg-linear-to-r from-primary to-primary/80",
              "px-4 py-1.5",
              "text-[11px] font-bold uppercase tracking-[0.12em] text-primary-foreground",
              "shadow-lg shadow-primary/40",
            )}
          >
            <Sparkles className="size-3" strokeWidth={3} />
            Most Popular
          </motion.div>
        </div>
      )}

      {/* ============================================
          HEADER: ICON + NAME
          ============================================ */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-2xl",
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
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {plan.name}
        </h3>
      </div>

      {/* ============================================
          PRICE
          ============================================ */}
      <div className="mb-2 flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-extrabold tracking-tight text-foreground",
            plan.popular ? "text-6xl" : "text-5xl",
          )}
        >
          ${plan.price}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          /month
        </span>
      </div>

      {/* ============================================
          DESCRIPTION
          ============================================ */}
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        {plan.description}
      </p>

      {/* ============================================
          DIVIDER
          ============================================ */}
      <div className="mb-6 h-px bg-border/60" />

      {/* ============================================
          FEATURES LIST
          ============================================ */}
      <ul className="mb-8 flex flex-1 flex-col gap-3.5">
        {plan.features.map((feature, i) => (
          <motion.li
            key={feature}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.3 + i * 0.05,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="flex items-start gap-3"
          >
            <div
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center",
                "rounded-full",
                "bg-primary/15",
                "ring-1 ring-primary/30",
              )}
            >
              <Check className="size-3 text-primary" strokeWidth={3} />
            </div>
            <span className="text-sm leading-snug text-foreground/90">
              {feature}
            </span>
          </motion.li>
        ))}
      </ul>

      {/* ============================================
          CTA BUTTON
          - Guests: opens Clerk sign-up modal
          - Signed-in: navigates to /dashboard/upgrade?plan=xxx
          ============================================ */}
      <div className="mt-auto">
        {isSignedIn ? (
          // ── Signed-in: navigate to upgrade page ──
          <Button
            asChild
            size="lg"
            variant={plan.popular ? "default" : "outline"}
            className={cn(
              "group/btn h-12 w-full rounded-full text-base font-semibold",
              plan.popular
                ? [
                    "bg-linear-to-r from-primary to-primary/80",
                    "text-primary-foreground",
                    "shadow-lg shadow-primary/30",
                    "transition-all duration-300",
                    "hover:shadow-xl hover:shadow-primary/40",
                  ].join(" ")
                : [
                    "border-primary/40 bg-transparent text-primary",
                    "transition-colors duration-200",
                    "hover:border-primary hover:bg-primary/5",
                  ].join(" "),
            )}
          >
            <Link href={`/dashboard/upgrade?plan=${plan.id}`}>
              Get {plan.name}
              <span className="ml-2 inline-block transition-transform duration-300 group-hover/btn:translate-x-0.5">
                →
              </span>
            </Link>
          </Button>
        ) : (
          // ── Guest: open Clerk sign-up modal ──
          <Button
            type="button"
            onClick={handleClick}
            disabled={!isLoaded}
            size="lg"
            variant={plan.popular ? "default" : "outline"}
            className={cn(
              "group/btn h-12 w-full rounded-full text-base font-semibold",
              plan.popular
                ? [
                    "bg-linear-to-r from-primary to-primary/80",
                    "text-primary-foreground",
                    "shadow-lg shadow-primary/30",
                    "transition-all duration-300",
                    "hover:shadow-xl hover:shadow-primary/40",
                  ].join(" ")
                : [
                    "border-primary/40 bg-transparent text-primary",
                    "transition-colors duration-200",
                    "hover:border-primary hover:bg-primary/5",
                  ].join(" "),
            )}
          >
            Get {plan.name}
            <span className="ml-2 inline-block transition-transform duration-300 group-hover/btn:translate-x-0.5">
              →
            </span>
          </Button>
        )}
      </div>

      {/* ============================================
          HOVER RING
          ============================================ */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-3xl",
          "ring-1 ring-primary/0",
          "transition-all duration-500",
          plan.popular
            ? "ring-primary/40"
            : "group-hover:ring-primary/30",
        )}
      />
    </motion.div>
  );
}

// ============================================
// MAIN SECTION
// ============================================

export function PricingSection() {
  return (
    <section className="relative w-full py-20 sm:py-24 lg:py-28">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
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
          className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center sm:mb-16"
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
              Simple Pricing
            </Badge>
          </motion.div>

          <motion.h2
            variants={headerItemVariants}
            className={cn(
              "text-4xl font-extrabold leading-[1.1] tracking-[-0.028em] text-foreground",
              "sm:text-5xl lg:text-[3.25rem]",
            )}
          >
            Start Free.{" "}
            <span className="bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Upgrade When Ready.
            </span>
          </motion.h2>

          <motion.p
            variants={headerItemVariants}
            className="max-w-xl text-base leading-[1.6] tracking-[-0.008em] text-muted-foreground sm:text-[17px]"
          >
            No hidden fees. Cancel anytime. Both plans include a 4-credit
            free trial.
          </motion.p>
        </motion.div>

        {/* ============================================
            TWO PRICING CARDS
            ============================================ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className={cn(
            "mx-auto grid max-w-4xl grid-cols-1 gap-6 pt-4",
            "md:grid-cols-2 md:gap-5 lg:gap-6",
          )}
        >
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </motion.div>

        {/* ============================================
            TRUST FOOTER
            ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:text-sm">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" strokeWidth={3} />
              4 credits free on signup
            </span>
            <span className="hidden size-1 rounded-full bg-border sm:block" />
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" strokeWidth={3} />
              No credit card required
            </span>
            <span className="hidden size-1 rounded-full bg-border sm:block" />
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" strokeWidth={3} />
              Cancel anytime
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}