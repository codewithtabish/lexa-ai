"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  HelpCircle,
  Search,
  Sparkles,
  UserPlus,
  Wand2,
  Coins,
  ShieldCheck,
  CreditCard,
  Wrench,
  Plus,
  Minus,
  ArrowRight,
  BookOpen,
  Gem,
  Mail,
  MessageCircleQuestion,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// FAQ DATA (LEXA AI specific)
// ============================================

interface FaqItem {
  q: string;
  a: string;
}

interface FaqGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: FaqItem[];
}

const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: UserPlus,
    items: [
      {
        q: "How do I get started with LEXA?",
        a: "Sign up for free with Google or email. You'll get 4 free credits instantly — no credit card required. Then upload a photo, choose a transformation (hairstyle, beard, outfit, age, hair color, or AI image generation), and watch the AI work its magic in seconds.",
      },
      {
        q: "Do I need any design or editing skills?",
        a: "Not at all. LEXA is designed for everyone — no Photoshop, no tutorials, no learning curve. Just upload, tap, and see your new look. Our AI handles all the complex editing behind the scenes.",
      },
      {
        q: "What devices does LEXA work on?",
        a: "LEXA works on any modern device with a browser — desktop, laptop, tablet, and mobile phone. No app download required. Your transformations sync across all your devices when you're signed in.",
      },
      {
        q: "Is there a mobile app?",
        a: "LEXA runs beautifully in your mobile browser right now. A dedicated iOS and Android app is coming soon. For now, add LEXA to your home screen for a native app-like experience.",
      },
    ],
  },
  {
    id: "features-ai",
    label: "Features & AI",
    icon: Wand2,
    items: [
      {
        q: "What AI features does LEXA offer?",
        a: "Six powerful transformations: AI Hairstyles (100+ styles), Beard Styles (50+ options), Outfit Try-On (200+ outfits), Age Transformations (10 stages), Hair Colors (80+ shades), and free AI Image Generation. Every feature uses state-of-the-art AI for realistic, natural-looking results.",
      },
      {
        q: "How realistic are the results?",
        a: "Extremely realistic. Our AI preserves your unique facial features — eyes, nose, jawline — while transforming only what you choose. The results look like professionally retouched photos, not like cartoon edits.",
      },
      {
        q: "Can I try a look before committing?",
        a: "Yes! That's the whole point of LEXA. Try any hairstyle, color, or look on your photo before you dye, cut, or buy anything. No commitment, no risk — just previews. Each try costs a few credits.",
      },
      {
        q: "How long does a transformation take?",
        a: "Usually under 5 seconds. Complex transformations or larger photos may take up to 15 seconds. Pro users get priority processing for even faster results.",
      },
      {
        q: "Can I download and share my results?",
        a: "Absolutely. Every transformation comes with a high-resolution download. Share directly to Instagram, TikTok, WhatsApp, or save to your device. All creations are also saved in your history for later access.",
      },
    ],
  },
  {
    id: "credits-pricing",
    label: "Credits & Pricing",
    icon: Coins,
    items: [
      {
        q: "How do credits work?",
        a: "You get 4 free credits when you sign up. Each AI transformation uses a few credits — Hairstyles (5), Beard Styles (5), Hair Colors (5), Outfits (10), Age Transformations (10). AI Image Generation is completely free with no credit cost. Buy more credits anytime or subscribe to a monthly plan.",
      },
      {
        q: "What's the difference between Basic and Pro?",
        a: "Basic ($4.99/month) gives you 20 AI credits per month. Pro ($7.99/month) gives you 40 credits plus lightning-fast processing, priority 24/7 support, early access to new features, and commercial usage rights. Both include unlimited free AI image generation.",
      },
      {
        q: "Do unused credits roll over?",
        a: "Credits reset at the start of each billing cycle and don't roll over. We recommend using them within the month. If you need more credits, you can upgrade to Pro anytime or purchase additional credit packs.",
      },
      {
        q: "Can I cancel my subscription anytime?",
        a: "Yes — cancel anytime from your account settings with one click. No questions asked, no hidden fees, no cancellation penalties. You'll keep full access until the end of your current billing period.",
      },
    ],
  },
  {
    id: "privacy-security",
    label: "Privacy & Security",
    icon: ShieldCheck,
    items: [
      {
        q: "Are my photos safe?",
        a: "Yes. Your photos are encrypted in transit and at rest. They're processed in isolated environments and automatically deleted within 24 hours. We never use your photos to train AI models, and we never share them with third parties.",
      },
      {
        q: "Do you sell or share my data?",
        a: "Never. We don't sell, rent, or share your personal data with advertisers or third parties. Your privacy is fundamental to LEXA — we make money from subscriptions, not from your data.",
      },
      {
        q: "How long are photos stored?",
        a: "Your uploaded photos are automatically deleted from our servers within 24 hours of processing. AI-generated results are stored in your account history for 30 days, and you can delete them anytime from your account settings.",
      },
    ],
  },
  {
    id: "account-billing",
    label: "Account & Billing",
    icon: CreditCard,
    items: [
      {
        q: "How do I change my email or password?",
        a: "Go to your account settings (click your avatar in the top-right corner). You can update your email, password, and other account details there. Changes take effect immediately.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard) worldwide via Safepay. Pakistani users can also pay via JazzCash and EasyPaisa. All payments are secure and PCI-compliant.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Account Settings → scroll to the bottom → click 'Delete Account'. Your data, photos, and history will be permanently removed within 24 hours. This action cannot be undone.",
      },
    ],
  },
  {
    id: "troubleshooting",
    label: "Troubleshooting",
    icon: Wrench,
    items: [
      {
        q: "Why is my transformation slow?",
        a: "Transformations usually take 5-15 seconds depending on photo complexity and current server load. If it's taking longer, try refreshing the page, checking your internet connection, or waiting a moment. Pro users get priority processing.",
      },
      {
        q: "The AI didn't recognize my face — what now?",
        a: "For best results, use a clear front-facing photo with good lighting and no heavy filters. Make sure your face takes up at least 30% of the frame and isn't obscured by sunglasses, masks, or hair. Try a different photo if the AI struggles.",
      },
      {
        q: "I'm having payment issues — what should I do?",
        a: "First, check that your card details are correct and that you have sufficient funds. If the issue persists, try a different payment method or contact our support team at tabish@codewithtabish.com. We typically respond within 24 hours.",
      },
    ],
  },
];

const CATEGORY_PILLS = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "getting-started", label: "Getting Started", icon: UserPlus },
  { id: "features-ai", label: "Features & AI", icon: Sparkles },
  { id: "credits-pricing", label: "Credits & Pricing", icon: Coins },
  { id: "privacy-security", label: "Privacy & Security", icon: ShieldCheck },
  { id: "account-billing", label: "Account & Billing", icon: CreditCard },
  { id: "troubleshooting", label: "Troubleshooting", icon: Wrench },
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

// ============================================
// SECTION 1 — HERO
// ============================================

function FaqHero({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
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
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-5">
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 rounded-full border-primary/30 bg-primary/10",
                "px-3.5 py-1.5",
                "text-[11px] font-bold uppercase tracking-[0.15em] text-primary",
              )}
            >
              <HelpCircle className="size-3" strokeWidth={2.5} />
              Help Center
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className={cn(
              "text-4xl font-extrabold leading-[1.08] tracking-[-0.032em] text-foreground",
              "sm:text-5xl md:text-6xl lg:text-[4rem]",
            )}
          >
            Frequently Asked
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Questions
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

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-xl text-sm leading-[1.7] text-muted-foreground sm:text-base md:text-[17px]"
          >
            Everything you need to know about LEXA. Can&apos;t find an answer?
            We&apos;re just a message away.
          </motion.p>

          {/* Search Bar */}
          <motion.div variants={itemVariants} className="mt-8 w-full max-w-xl">
            <div
              className={cn(
                "group relative flex items-center gap-3 rounded-full",
                "border border-border/60 bg-card/70 backdrop-blur-sm",
                "px-5 py-3.5",
                "transition-all duration-300",
                "focus-within:border-primary/50",
                "focus-within:shadow-lg focus-within:shadow-primary/10",
              )}
            >
              <Search
                className="size-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary"
                strokeWidth={2.5}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search for a question..."
                className={cn(
                  "w-full bg-transparent text-sm text-foreground outline-none",
                  "placeholder:text-muted-foreground sm:text-[15px]",
                )}
              />
              <span
                className={cn(
                  "hidden shrink-0 rounded-md border border-border/60 bg-muted/40",
                  "px-2 py-0.5",
                  "text-[10px] font-bold text-muted-foreground",
                  "sm:inline-block",
                )}
              >
                ⌘K
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 2 — CATEGORY PILLS
// ============================================

function CategoryPills({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="relative w-full pb-8 pt-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={cn(
            "flex items-center gap-2 overflow-x-auto pb-2",
            "scrollbar-hide",
            // Center on desktop, scroll on mobile
            "sm:justify-center sm:flex-wrap sm:overflow-visible",
          )}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {CATEGORY_PILLS.map((pill) => {
            const Icon = pill.icon;
            const isActive = active === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onSelect(pill.id)}
                className={cn(
                  "group inline-flex shrink-0 items-center gap-1.5 rounded-full",
                  "px-4 py-2",
                  "text-[12px] font-semibold tracking-tight sm:text-[13px]",
                  "transition-all duration-300",
                  isActive
                    ? [
                        "bg-linear-to-r from-primary to-primary/80",
                        "text-primary-foreground",
                        "shadow-md shadow-primary/30",
                      ].join(" ")
                    : [
                        "border border-border/60 bg-card/60 backdrop-blur-sm",
                        "text-muted-foreground",
                        "hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
                      ].join(" "),
                )}
              >
                <Icon
                  className={cn("size-3.5", isActive ? "" : "text-primary/70")}
                  strokeWidth={2.5}
                />
                {pill.label}
              </button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// FAQ ITEM
// ============================================

function FaqItemCard({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border",
        "transition-all duration-300",
        isOpen
          ? "border-primary/40 bg-card/80 shadow-sm shadow-primary/5"
          : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/70",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
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
          {item.q}
        </span>
        <div
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full",
            "transition-all duration-300",
            isOpen
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
          )}
        >
          {isOpen ? (
            <Minus className="size-3" strokeWidth={2.5} />
          ) : (
            <Plus className="size-3" strokeWidth={2.5} />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.25, delay: 0.05 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.15 },
              },
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 px-5 pb-4 pt-3.5">
              <p className="text-[12px] leading-[1.7] text-muted-foreground sm:text-[13px]">
                {item.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// SECTION 3 — FAQ ACCORDION (Grouped)
// ============================================

function FaqAccordion({
  groups,
  activeCategory,
  search,
}: {
  groups: FaqGroup[];
  activeCategory: string;
  search: string;
}) {
  // Track open item per group (one at a time)
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  // Filter groups by active category and search
  const filteredGroups = groups
    .filter((g) => activeCategory === "all" || g.id === activeCategory)
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (item) =>
          search === "" ||
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((g) => g.items.length > 0);

  const totalResults = filteredGroups.reduce(
    (sum, g) => sum + g.items.length,
    0,
  );

  return (
    <section className="relative w-full pb-12 sm:pb-14 lg:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          {filteredGroups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col items-center gap-3 rounded-3xl",
                "border border-border/60 bg-card/60 backdrop-blur-sm",
                "px-6 py-16 text-center",
              )}
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                <Search
                  className="size-5 text-primary"
                  strokeWidth={2.5}
                />
              </div>
              <h3 className="text-base font-bold text-foreground sm:text-lg">
                No questions found
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                We couldn&apos;t find any questions matching &ldquo;{search}
                &rdquo;. Try a different keyword or{" "}
                <a
                  href="mailto:tabish@codewithtabish.com"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  contact our support team
                </a>
                .
              </p>
            </motion.div>
          ) : (
            <>
              {/* Search results count */}
              {search && (
                <p className="text-center text-xs text-muted-foreground sm:text-sm">
                  Found{" "}
                  <span className="font-bold text-foreground">
                    {totalResults}
                  </span>{" "}
                  {totalResults === 1 ? "result" : "results"}
                </p>
              )}

              {filteredGroups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex flex-col gap-3"
                  >
                    {/* Group header */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex size-8 items-center justify-center rounded-full",
                          "bg-linear-to-br from-primary to-primary/70",
                          "shadow-md shadow-primary/25",
                        )}
                      >
                        <GroupIcon
                          className="size-3.5 text-primary-foreground"
                          strokeWidth={2.5}
                        />
                      </div>
                      <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary sm:text-xs">
                        {group.label}
                      </h2>
                    </div>

                    {/* Items */}
                    <div className="flex flex-col gap-2.5">
                      {group.items.map((item, i) => {
                        const key = `${group.id}-${i}`;
                        return (
                          <FaqItemCard
                            key={key}
                            item={item}
                            isOpen={openItem === key}
                            onToggle={() =>
                              setOpenItem(openItem === key ? null : key)
                            }
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 4 — STILL HAVE QUESTIONS
// ============================================

function StillHaveQuestions() {
  return (
    <section className="relative w-full py-12 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[140px] dark:bg-primary/12" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative mx-auto flex max-w-2xl flex-col items-center gap-4",
            "overflow-hidden rounded-3xl",
            "border border-primary/25",
            "bg-card/60 backdrop-blur-sm",
            "px-6 py-10 text-center sm:px-12 sm:py-12",
          )}
        >
          {/* Corner glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/15 blur-[80px]" />

          {/* Icon */}
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl",
              "bg-linear-to-br from-primary to-primary/70",
              "shadow-lg shadow-primary/30",
            )}
          >
            <MessageCircleQuestion
              className="size-7 text-primary-foreground"
              strokeWidth={2.5}
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground sm:text-3xl lg:text-[2rem]">
            Still have questions?
          </h2>

          {/* Subtitle */}
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Our team is here to help. Reach out and we&apos;ll get back to you
            within 24 hours.
          </p>

          {/* CTAs */}
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className={cn(
                "group/btn h-11 rounded-full px-6 text-sm font-semibold sm:text-base",
                "bg-linear-to-r from-primary to-primary/80",
                "text-primary-foreground",
                "shadow-lg shadow-primary/30",
                "transition-all duration-300",
                "hover:shadow-xl hover:shadow-primary/40",
              )}
            >
              <a href="mailto:tabish@codewithtabish.com">
                Contact Support
                <ArrowRight
                  className="ml-2 size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className={cn(
                "h-11 rounded-full border-primary/40 bg-transparent px-6",
                "text-sm font-semibold text-primary sm:text-base",
                "transition-all duration-300",
                "hover:border-primary hover:bg-primary/5",
              )}
            >
              <a href="mailto:tabish@codewithtabish.com">Email Us</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 5 — HELPFUL LINKS
// ============================================

function HelpfulLinks() {
  const LINKS = [
    {
      icon: BookOpen,
      title: "How It Works",
      description: "Step-by-step guide to your first transformation.",
      href: "/how-it-works",
    },
    {
      icon: Gem,
      title: "Pricing & Plans",
      description: "Compare Basic and Pro to find your perfect plan.",
      href: "/pricing",
    },
    {
      icon: Mail,
      title: "Contact Support",
      description: "Reach our team and get help within 24 hours.",
      href: "mailto:tabish@codewithtabish.com",
    },
  ];

  return (
    <section className="relative w-full pb-12 sm:pb-14 lg:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center gap-8"
        >
          {/* Header */}
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
                <Sparkles className="size-2.5" strokeWidth={2.5} />
                Popular Resources
              </Badge>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground sm:text-3xl lg:text-[2rem]"
            >
              Helpful Links
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm text-muted-foreground sm:text-[15px]"
            >
              Quick access to our most useful pages.
            </motion.p>
          </div>

          {/* 3 Cards */}
          <motion.div
            variants={containerVariants}
            className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
          >
            {LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <motion.div key={link.title} variants={itemVariants}>
                  <Link
                    href={link.href}
                    className={cn(
                      "group flex h-full flex-col gap-3 rounded-2xl",
                      "border border-border/50 bg-card/60 backdrop-blur-sm",
                      "p-5",
                      "transition-all duration-500",
                      "hover:-translate-y-1 hover:border-primary/40",
                      "hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5",
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl",
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

                    {/* Title */}
                    <h3 className="text-[15px] font-bold leading-tight tracking-tight text-foreground sm:text-base">
                      {link.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
                      {link.description}
                    </p>

                    {/* Open link */}
                    <div className="mt-auto flex items-center gap-1 pt-1 text-[12px] font-semibold text-primary sm:text-[13px]">
                      <span>Open</span>
                      <ArrowRight
                        className="size-3 transition-transform duration-300 group-hover:translate-x-1"
                        strokeWidth={2.5}
                      />
                    </div>
                  </Link>
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
// MAIN PAGE COMPONENT
// ============================================

export default function FaqPage() {
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("all");

  // Reset category when searching
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value && activeCategory !== "all") {
      setActiveCategory("all");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <FaqHero search={search} onSearchChange={handleSearchChange} />
      <CategoryPills active={activeCategory} onSelect={setActiveCategory} />
      <FaqAccordion
        groups={FAQ_GROUPS}
        activeCategory={activeCategory}
        search={search}
      />
      <StillHaveQuestions />
      <HelpfulLinks />
    </div>
  );
}