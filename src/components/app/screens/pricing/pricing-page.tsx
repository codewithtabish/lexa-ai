// src/app/pricing/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  ArrowRight,
  ImageIcon,
  Lock,
  Download,
  Bot,
  Rocket,
  Gift,
  Briefcase,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createCheckout } from "@/actions/billing/create-checkout";
import type { PlanId } from "@/data/plans";

// ============================================
// DATA
// ============================================

interface Plan {
  id: PlanId;
  name: string;
  price: number;
  description: string;
  icon: React.ElementType;
  popular?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "BASIC",
    name: "Basic",
    price: 4.99,
    description: "Perfect for regular creators",
    icon: Zap,
    features: [
      "40 AI credits per month",
      "All AI tools",
      "Unlimited image generation",
      "No watermark",
      "Standard processing speed",
      "Priority email support",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 7.99,
    description: "Best for creators & power users",
    icon: Crown,
    popular: true,
    features: [
      "80 AI credits per month",
      "All AI tools",
      "Unlimited image generation",
      "No watermark",
      "⚡ Lightning-fast processing",
      "Priority 24/7 support",
      "Early access to new features",
      "Commercial usage rights",
    ],
  },
];

const INCLUDED_FEATURES = [
  {
    icon: Bot,
    title: "All AI Tools",
    description:
      "Hairstyles, beards, outfits, age, colors, and AI generation.",
  },
  {
    icon: ImageIcon,
    title: "Unlimited Image Gen",
    description: "Create as many AI images as you want.",
  },
  {
    icon: Sparkles,
    title: "No Watermark",
    description:
      "All your transformations come clean, without any branding.",
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description:
      "Your photos are auto-deleted in 24 hours. Never shared.",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description: "Results in under 5 seconds, every single time.",
  },
  {
    icon: Download,
    title: "High-Res Download",
    description: "Save and share your results in full resolution.",
  },
];

interface CreditRow {
  feature: string;
  credits: string;
  bestFor: string;
}

const CREDIT_ROWS: CreditRow[] = [
  { feature: "Hairstyles", credits: "1 credit", bestFor: "New looks & style" },
  { feature: "Beard Styles", credits: "1 credit", bestFor: "Facial hair makeover" },
  { feature: "Outfits", credits: "1 credit", bestFor: "Fashion & style" },
  { feature: "Age Transformations", credits: "2 credits", bestFor: "See your future self" },
  { feature: "Hair Colors", credits: "1 credit", bestFor: "Try new shades" },
  { feature: "AI Image Generation", credits: "1 credit", bestFor: "Creative freedom" },
];

const WHY_PRO = [
  {
    icon: Zap,
    title: "Double the Credits",
    description:
      "80 credits per month instead of 40 — double the transformations.",
  },
  {
    icon: Rocket,
    title: "Lightning Processing",
    description:
      "Priority queue means your results arrive faster than ever.",
  },
  {
    icon: Gift,
    title: "Early Access",
    description:
      "Be the first to try new features and AI models as we ship them.",
  },
  {
    icon: Briefcase,
    title: "Commercial Rights",
    description:
      "Use your transformations for business, ads, and client work.",
  },
];

interface ComparisonRow {
  feature: string;
  basic: string | boolean;
  pro: string | boolean;
}

const COMPARISON: ComparisonRow[] = [
  { feature: "Monthly credits", basic: "40", pro: "80" },
  { feature: "Access to all AI tools", basic: true, pro: true },
  { feature: "Unlimited image generation", basic: true, pro: true },
  { feature: "No watermark", basic: true, pro: true },
  { feature: "Processing speed", basic: "Standard", pro: "⚡ Lightning" },
  { feature: "Support", basic: "Email", pro: "24/7 Priority" },
  { feature: "Early access to new features", basic: false, pro: true },
  { feature: "Commercial usage rights", basic: false, pro: true },
  { feature: "Price", basic: "$4.99/mo", pro: "$7.99/mo" },
];

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "What's the difference between Basic and Pro?",
    a: "Pro gives you 80 credits per month (vs 40), faster processing, priority support, early access to new features, and commercial usage rights. Basic is perfect for regular users who want the core features.",
  },
  {
    q: "Do unused credits roll over to next month?",
    a: "Credits reset each billing cycle and do not roll over. Use them within the month to make the most of your plan.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes. Cancel anytime from your account settings with one click. No questions asked, no hidden fees.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major international credit and debit cards (Visa, Mastercard), plus local Pakistani payment methods via Safepay — including Raast.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! Every new account gets 4 free credits on signup — no credit card required. Use them to try any feature before subscribing.",
  },
  {
    q: "Can I upgrade or downgrade later?",
    a: "Absolutely. You can switch plans anytime from your account settings. Changes take effect immediately with prorated billing.",
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
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
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ============================================
// ADAPTIVE "GET STARTED FREE" BUTTON
// ============================================

function GetStartedButton({
  className,
  children = "Get Started Free",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();

  const baseClass = cn(
    "group/btn inline-flex h-11 cursor-pointer items-center justify-center gap-2",
    "rounded-full px-6 text-sm font-semibold sm:text-base",
    "bg-linear-to-r from-primary to-primary/80",
    "text-primary-foreground",
    "shadow-lg shadow-primary/30",
    "transition-all duration-300",
    "hover:shadow-xl hover:shadow-primary/40",
    "no-underline",
    className,
  );

  if (isLoaded && isSignedIn) {
    return (
      <Link href="/app" className={baseClass}>
        {children}
        <ArrowRight
          className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
          strokeWidth={2.5}
        />
      </Link>
    );
  }

  return (
    <SignUpButton mode="modal">
      <button type="button" className={baseClass}>
        {children}
        <ArrowRight
          className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
          strokeWidth={2.5}
        />
      </button>
    </SignUpButton>
  );
}

// ============================================
// SECTION 1 — HERO
// ============================================

function PricingHero() {
  const TRUST_CHIPS = [
    "4 Credits Free",
    "Cancel Anytime",
    "No Card Required",
  ];

  return (
    <section className="relative w-full py-12 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[140px] dark:bg-primary/18" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.div variants={itemVariants} className="mb-5">
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

          <motion.h1
            variants={itemVariants}
            className={cn(
              "text-4xl font-extrabold leading-[1.08] tracking-[-0.032em] text-foreground",
              "sm:text-5xl md:text-6xl lg:text-[4rem]",
            )}
          >
            Start Free.
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Upgrade When Ready.
              </span>
              <svg
                className="pointer-events-none absolute left-0 w-full"
                style={{ bottom: "-0.28em" }}
                viewBox="0 0 300 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <motion.path
                  d="M 6 12 C 80 4, 220 4, 294 12"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="text-primary"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    delay: 0.8,
                    duration: 1.1,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-xl text-sm leading-[1.7] text-muted-foreground sm:text-base md:text-[17px]"
          >
            No hidden fees. Cancel anytime. Both plans include a 4-credit free
            trial — no credit card required.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            {TRUST_CHIPS.map((chip) => (
              <span
                key={chip}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full",
                  "border border-border/60 bg-card/60 backdrop-blur-sm",
                  "px-3.5 py-1.5",
                  "text-[11px] font-semibold text-foreground sm:text-xs",
                )}
              >
                <Check className="size-3 text-primary" strokeWidth={3} />
                {chip}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 2 — PRICING CARDS
// ============================================

function PricingCard({ plan }: { plan: Plan }) {
  const { isSignedIn, isLoaded } = useUser();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const Icon = plan.icon;

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createCheckout(plan.id);

      if (result.success) {
        // ✅ Redirect to Safepay checkout
        window.location.href = result.checkoutUrl;
        // Don't reset isLoading — the page is navigating away
      } else {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("[PricingCard] Checkout error:", err);
      setError("Could not start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  // -------------------------------------------------
  // CTA class
  // -------------------------------------------------
  const ctaClass = cn(
    "group/btn inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2",
    "rounded-full text-sm font-semibold sm:text-base",
    "no-underline",
    "transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    plan.popular
      ? "bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
      : "border border-primary/40 bg-transparent text-primary hover:border-primary hover:bg-primary/5",
    isLoading && "cursor-wait opacity-80",
  );

  const inner = (
    <>
      {/* Most Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2">
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
              "text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground",
              "shadow-lg shadow-primary/40",
            )}
          >
            <Sparkles className="size-3" strokeWidth={3} />
            Most Popular
          </motion.div>
        </div>
      )}

      {/* Icon + Name */}
      <div className="mb-5 flex items-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl",
            "bg-linear-to-br from-primary to-primary/70",
            "shadow-md shadow-primary/30",
            "transition-transform duration-500",
            "group-hover:scale-110 group-hover:rotate-3",
            plan.popular ? "size-12" : "size-11",
          )}
        >
          <Icon
            className={cn(
              "text-primary-foreground",
              plan.popular ? "size-5.5" : "size-5",
            )}
            strokeWidth={2.5}
          />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          {plan.name}
        </h3>
      </div>

      {/* Price */}
      <div className="mb-2 flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-extrabold tracking-tight text-foreground",
            plan.popular ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl",
          )}
        >
          ${plan.price}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          /month
        </span>
      </div>

      {/* Description */}
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        {plan.description}
      </p>

      {/* Divider */}
      <div className="mb-5 h-px bg-border/60" />

      {/* Features */}
      <ul className="mb-6 flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature, i) => (
          <motion.li
            key={feature}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.25 + i * 0.05,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="flex items-start gap-2.5"
          >
            <div
              className={cn(
                "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full",
                "bg-primary/15 ring-1 ring-primary/25",
              )}
            >
              <Check className="size-2.5 text-primary" strokeWidth={3.5} />
            </div>
            <span className="text-[13px] leading-snug text-foreground/90 sm:text-sm">
              {feature}
            </span>
          </motion.li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-auto">
        {!isLoaded ? (
          // ── Clerk still loading ──
          <button type="button" className={ctaClass} disabled>
            <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
          </button>
        ) : isSignedIn ? (
          // ── Signed in → start real checkout ──
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={isLoading}
            className={ctaClass}
          >
            {isLoading ? (
              <>
                <Loader2
                  className="size-4 animate-spin"
                  strokeWidth={2.5}
                />
                <span>Redirecting to Safepay...</span>
              </>
            ) : (
              <>
                <span>Get {plan.name}</span>
                <ArrowRight
                  className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </>
            )}
          </button>
        ) : (
          // ── Guest → Clerk sign-up modal ──
          <SignUpButton mode="modal">
            <button type="button" className={ctaClass}>
              <span>Get {plan.name}</span>
              <ArrowRight
                className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                strokeWidth={2.5}
              />
            </button>
          </SignUpButton>
        )}

        {/* Inline error */}
        {error && (
          <div
            className={cn(
              "mt-2.5 flex items-start gap-1.5 rounded-lg px-3 py-2",
              "border border-destructive/30 bg-destructive/5",
            )}
          >
            <AlertCircle
              className="mt-0.5 size-3.5 shrink-0 text-destructive"
              strokeWidth={2.5}
            />
            <span className="text-[11.5px] leading-snug text-destructive">
              {error}
            </span>
          </div>
        )}
      </div>

      {/* Hover Ring */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-3xl",
          "ring-1 ring-primary/0 transition-all duration-500",
          plan.popular ? "ring-primary/40" : "group-hover:ring-primary/30",
        )}
      />
    </>
  );

  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        "group relative flex h-full flex-col rounded-3xl border",
        "transition-all duration-500 ease-out",
        plan.popular
          ? "border-primary/60 bg-linear-to-b from-card to-card/60 shadow-xl shadow-primary/15 p-6 sm:p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/25"
          : "border-border/60 bg-card/70 backdrop-blur-sm p-5 sm:p-7 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
      )}
    >
      {inner}
    </motion.div>
  );
}

function PricingCards() {
  return (
    <section className="relative w-full pb-12 sm:pb-14 lg:pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[140px] dark:bg-primary/12" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto grid max-w-4xl grid-cols-1 gap-5 pt-4 sm:gap-6 md:grid-cols-2"
        >
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 text-center text-xs text-muted-foreground sm:text-sm"
        >
          All plans include a 4-credit free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}

// ============================================
// SECTION 3 — BOTH PLANS COME WITH
// ============================================

function BothPlansComeWith() {
  return (
    <section className="relative w-full py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center gap-8"
        >
          <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                  "px-3 py-1",
                  "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
                )}
              >
                Everything Included
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground sm:text-3xl lg:text-[2rem]"
            >
              Both Plans Come With
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm text-muted-foreground sm:text-[15px]"
            >
              Every core feature is available on both Basic and Pro.
            </motion.p>
          </div>

          <motion.div
            variants={containerVariants}
            className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
          >
            {INCLUDED_FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  className={cn(
                    "group flex items-start gap-3 rounded-2xl",
                    "border border-border/50 bg-card/60 backdrop-blur-sm",
                    "p-4 sm:p-5",
                    "transition-all duration-500",
                    "hover:-translate-y-1 hover:border-primary/40",
                    "hover:bg-card/80",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      "bg-linear-to-br from-primary to-primary/70",
                      "shadow-md shadow-primary/25",
                      "transition-transform duration-500",
                      "group-hover:scale-110 group-hover:rotate-3",
                    )}
                  >
                    <Icon
                      className="size-4.5 text-primary-foreground"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-[13px] font-bold leading-tight tracking-tight text-foreground sm:text-sm">
                      {item.title}
                    </h3>
                    <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 4 — CREDITS SIMPLIFIED
// ============================================

function CreditsSimplified() {
  return (
    <section className="relative w-full py-12 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-1/3 size-[400px] rounded-full bg-primary/6 blur-[120px] dark:bg-primary/10" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center gap-8"
        >
          <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                  "px-3 py-1",
                  "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
                )}
              >
                How Credits Work
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground sm:text-3xl lg:text-[2rem]"
            >
              Credits, Simplified
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm text-muted-foreground sm:text-[15px]"
            >
              Each AI transformation uses just a few credits.
            </motion.p>
          </div>

          <motion.div
            variants={itemVariants}
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm"
          >
            <div className="grid grid-cols-[1.5fr_1fr_1.5fr] gap-3 border-b border-border/50 bg-primary/5 px-4 py-3 sm:px-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[11px]">
                Feature
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[11px]">
                Credits
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[11px]">
                Best For
              </span>
            </div>

            <div className="divide-y divide-border/40">
              {CREDIT_ROWS.map((row, i) => (
                <motion.div
                  key={row.feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.1 + i * 0.05,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "grid grid-cols-[1.5fr_1fr_1.5fr] items-center gap-3",
                    "px-4 py-3 transition-colors duration-200",
                    "hover:bg-primary/5",
                    "sm:px-6 sm:py-3.5",
                  )}
                >
                  <span className="truncate text-[12px] font-semibold text-foreground sm:text-[13px]">
                    {row.feature}
                  </span>
                  <span className="text-[12px] font-semibold text-foreground sm:text-[13px]">
                    {row.credits}
                  </span>
                  <span className="text-[12px] text-muted-foreground sm:text-[13px]">
                    {row.bestFor}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GetStartedButton />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 5 — WHY GO PRO
// ============================================

function WhyGoPro() {
  return (
    <section className="relative w-full py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center gap-8"
        >
          <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                  "px-3 py-1",
                  "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
                )}
              >
                Upgrade To Pro
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground sm:text-3xl lg:text-[2rem]"
            >
              Why Go Pro?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm text-muted-foreground sm:text-[15px]"
            >
              For creators who want more speed, more credits, and more power.
            </motion.p>
          </div>

          <motion.div
            variants={containerVariants}
            className="grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
          >
            {WHY_PRO.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  className={cn(
                    "group flex items-start gap-3.5 rounded-2xl",
                    "border border-border/50 bg-card/60 backdrop-blur-sm",
                    "p-5",
                    "transition-all duration-500",
                    "hover:-translate-y-1 hover:border-primary/40",
                    "hover:bg-card/80",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      "bg-linear-to-br from-primary to-primary/70",
                      "shadow-md shadow-primary/25",
                      "transition-transform duration-500",
                      "group-hover:scale-110 group-hover:rotate-3",
                    )}
                  >
                    <Icon
                      className="size-5 text-primary-foreground"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold leading-tight tracking-tight text-foreground sm:text-[15px]">
                      {item.title}
                    </h3>
                    <p className="text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 6 — COMPARISON TABLE
// ============================================

function ComparisonTable() {
  const renderCell = (value: string | boolean) => {
    if (value === true) {
      return (
        <div
          className={cn(
            "flex size-5 items-center justify-center rounded-full",
            "bg-primary/15 ring-1 ring-primary/25",
          )}
        >
          <Check className="size-3 text-primary" strokeWidth={3.5} />
        </div>
      );
    }
    if (value === false) {
      return <span className="text-sm text-muted-foreground/50">—</span>;
    }
    return (
      <span className="text-[12px] font-semibold text-foreground sm:text-[13px]">
        {value}
      </span>
    );
  };

  return (
    <section className="relative w-full py-12 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/6 blur-[140px] dark:bg-primary/10" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center gap-8"
        >
          <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                  "px-3 py-1",
                  "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
                )}
              >
                At A Glance
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground sm:text-3xl lg:text-[2rem]"
            >
              Basic vs Pro
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm text-muted-foreground sm:text-[15px]"
            >
              Compare every feature side by side.
            </motion.p>
          </div>

          <motion.div
            variants={itemVariants}
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm"
          >
            <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-3 border-b border-border/50 px-4 py-3 sm:px-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[11px]">
                Feature
              </span>
              <span className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-foreground sm:text-xs">
                Basic
              </span>
              <div className="flex justify-center">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full",
                    "bg-linear-to-r from-primary to-primary/80",
                    "px-3 py-1",
                    "text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground",
                  )}
                >
                  <Crown className="size-2.5" strokeWidth={3} />
                  Pro
                </span>
              </div>
            </div>

            <div className="divide-y divide-border/40">
              {COMPARISON.map((row, i) => (
                <motion.div
                  key={row.feature}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.4 }}
                  className={cn(
                    "grid grid-cols-[1.4fr_1fr_1fr] items-center gap-3",
                    "px-4 py-3 transition-colors duration-200",
                    "hover:bg-primary/5",
                    "sm:px-6 sm:py-3.5",
                  )}
                >
                  <span className="text-[12px] font-medium text-foreground sm:text-[13px]">
                    {row.feature}
                  </span>
                  <div className="flex justify-center">
                    {renderCell(row.basic)}
                  </div>
                  <div
                    className={cn(
                      "flex justify-center rounded-lg py-1",
                      "bg-primary/5",
                    )}
                  >
                    {renderCell(row.pro)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-[11px] text-muted-foreground sm:text-xs"
          >
            All features listed are included in both plans.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 7 — FAQ
// ============================================

function PricingFaq() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="relative w-full py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center gap-8"
        >
          <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                  "px-3 py-1",
                  "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
                )}
              >
                Questions
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground sm:text-3xl lg:text-[2rem]"
            >
              Pricing FAQ
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm text-muted-foreground sm:text-[15px]"
            >
              Everything you need to know before you subscribe.
            </motion.p>
          </div>

          <motion.div
            variants={containerVariants}
            className="mx-auto flex w-full max-w-3xl flex-col gap-2.5"
          >
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div
                  key={faq.q}
                  variants={itemVariants}
                  className={cn(
                    "group overflow-hidden rounded-2xl border",
                    "transition-all duration-300",
                    isOpen
                      ? "border-primary/40 bg-card/80"
                      : "border-border/50 bg-card/50 hover:border-primary/30",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className={cn(
                      "flex w-full items-center justify-between gap-4",
                      "px-5 py-4 text-left",
                      "transition-colors duration-200",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[13px] font-semibold leading-snug tracking-tight sm:text-sm",
                        isOpen ? "text-primary" : "text-foreground",
                      )}
                    >
                      {faq.q}
                    </span>
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full",
                        "transition-all duration-300",
                        isOpen
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                      )}
                    >
                      {isOpen ? (
                        <Minus className="size-3.5" strokeWidth={2.5} />
                      ) : (
                        <Plus className="size-3.5" strokeWidth={2.5} />
                      )}
                    </div>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: isOpen ? "auto" : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{
                      height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.2 },
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4">
                      <p className="text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 8 — RISK FREE
// ============================================

function RiskFree() {
  const { isSignedIn, isLoaded } = useUser();

  const btnClass = cn(
    "group/btn inline-flex h-11 cursor-pointer items-center justify-center gap-2",
    "rounded-full px-6 text-sm font-semibold sm:text-base",
    "bg-linear-to-r from-primary to-primary/80",
    "text-primary-foreground",
    "shadow-lg shadow-primary/30",
    "transition-all duration-300",
    "hover:shadow-xl hover:shadow-primary/40",
    "no-underline",
  );

  // When signed in, scroll to plans (so they can subscribe)
  const handleUpgrade = () => {
    const plansEl = document.getElementById("pricing-plans");
    if (plansEl) {
      plansEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full py-12 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px] dark:bg-primary/15" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center"
        >
          <motion.div variants={itemVariants}>
            <div
              className={cn(
                "flex size-14 items-center justify-center rounded-2xl",
                "bg-linear-to-br from-primary to-primary/70",
                "shadow-lg shadow-primary/30",
              )}
            >
              <ShieldCheck
                className="size-7 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground sm:text-3xl lg:text-[2rem]"
          >
            Try LEXA Risk-Free
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
          >
            Get 4 free credits when you sign up. No credit card required.
            Cancel anytime — no questions asked.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-2 flex flex-col gap-3 sm:flex-row"
          >
            {!isLoaded ? (
              <button type="button" className={btnClass} disabled>
                <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
              </button>
            ) : isSignedIn ? (
              <button type="button" onClick={handleUpgrade} className={btnClass}>
                Upgrade Now
                <ArrowRight
                  className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </button>
            ) : (
              <SignUpButton mode="modal">
                <button type="button" className={btnClass}>
                  Get Started Free
                  <ArrowRight
                    className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </button>
              </SignUpButton>
            )}

            <Link
              href="/features"
              className={cn(
                "inline-flex h-11 cursor-pointer items-center justify-center gap-2",
                "rounded-full border border-border/60 bg-background/60 px-6 backdrop-blur-sm",
                "text-sm font-semibold text-foreground sm:text-base",
                "transition-all duration-300",
                "hover:border-primary/50 hover:bg-primary/5",
                "no-underline",
              )}
            >
              See Features
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function PricingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PricingHero />

      {/* Anchor target so RiskFree's "Upgrade Now" can scroll here */}
      <div id="pricing-plans" className="scroll-mt-24">
        <PricingCards />
      </div>

      <BothPlansComeWith />
      <CreditsSimplified />
      <WhyGoPro />
      <ComparisonTable />
      <PricingFaq />
      <RiskFree />
    </div>
  );
}