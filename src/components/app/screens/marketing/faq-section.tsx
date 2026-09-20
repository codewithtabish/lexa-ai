"use client";

import * as React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Plus, Sparkles, MessageCircleQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================
// FAQ DATA
// ============================================

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "how-it-works",
    question: "How does LYXA AI work?",
    answer:
      "Simply upload a photo, pick a transformation (hairstyle, beard, outfit, age, hair color, or AI image generation), and our advanced AI generates your new look in seconds. No editing skills required — everything happens in one tap.",
  },
  {
    id: "privacy",
    question: "Is my photo safe and private?",
    answer:
      "Absolutely. All photos are auto-deleted from our servers within 24 hours of processing. We never share your data with third parties, never use it for training, and never sell it. Your privacy is our top priority.",
  },
  {
    id: "plans",
    question: "What's the difference between Basic and Pro?",
    answer:
      "Basic gives you 20 AI credits per month for $4.99. Pro gives you 40 credits plus lightning-fast processing, priority 24/7 support, early access to new features, and commercial usage rights for $7.99/month. Both include unlimited free AI image generation.",
  },
  {
    id: "cancel",
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes. Cancel anytime from your account settings with one click. No questions asked, no hidden fees, no cancellation penalties. You'll keep access until the end of your current billing period.",
  },
  {
    id: "credits",
    question: "Do unused credits roll over to next month?",
    answer:
      "Credits reset at the start of each billing cycle and do not roll over. We recommend using them within the month. If you need more, you can upgrade to Pro anytime or purchase additional credit packs.",
  },
  {
    id: "mobile",
    question: "Can I use LYXA on my phone?",
    answer:
      "Yes! LYXA works beautifully on any device — mobile, tablet, or desktop. No app download required. Just open your browser, sign in, and start transforming your look from anywhere.",
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
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

// ============================================
// ACCORDION ITEM
// ============================================

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "group relative overflow-hidden",
        "rounded-2xl border",
        "transition-all duration-500 ease-out",
        isOpen
          ? "border-primary/40 bg-card shadow-lg shadow-primary/5"
          : "border-border/50 bg-card/40 hover:border-primary/30 hover:bg-card/70",
      )}
    >
      {/* ============================================
          QUESTION ROW (Clickable)
          ============================================ */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.id}`}
        className={cn(
          "flex w-full items-center justify-between gap-4",
          "px-5 py-5 text-left sm:px-6 sm:py-6",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <span
          className={cn(
            "text-base font-semibold leading-snug tracking-[-0.01em] sm:text-[17px]",
            "transition-colors duration-200",
            isOpen ? "text-primary" : "text-foreground",
          )}
        >
          {item.question}
        </span>

        {/* Rotating plus icon */}
        <motion.div
          animate={{
            rotate: isOpen ? 45 : 0,
            scale: isOpen ? 1.05 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            "transition-colors duration-300",
            isOpen
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
          )}
        >
          <Plus className="size-4" strokeWidth={2.5} />
        </motion.div>
      </button>

      {/* ============================================
          ANSWER (Collapsible)
          ============================================ */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${item.id}`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: {
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                },
                opacity: {
                  duration: 0.25,
                  delay: 0.05,
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                },
                opacity: {
                  duration: 0.15,
                },
              },
            }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              {/* Decorative amber divider */}
              <div className="mb-4 h-px w-12 bg-linear-to-r from-primary to-transparent" />

              <p className="text-[14px] leading-[1.7] text-muted-foreground sm:text-[15px]">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// MAIN SECTION
// ============================================

export function FaqSection() {
  // Track which items are open (allow multiple open at once)
  const [openIds, setOpenIds] = React.useState<string[]>([]);

  const toggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <section className="relative w-full py-20 sm:py-24 lg:py-28">
      {/* ============================================
          AMBIENT BACKGROUND GLOW
          ============================================ */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 bottom-1/4 h-[400px] w-[500px] rounded-full bg-primary/8 blur-[120px] dark:bg-primary/12" />
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
              <Sparkles className="size-3" strokeWidth={2.5} />
              Questions
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
            Frequently Asked{" "}
            <span className="bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Questions
            </span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            variants={headerItemVariants}
            className="max-w-xl text-base leading-[1.6] tracking-[-0.008em] text-muted-foreground sm:text-[17px]"
          >
            Everything you need to know about LYXA. Can't find your answer?{" "}
            <a
              href="mailto:hello@lyxa.ai"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Contact us
            </a>
            .
          </motion.p>
        </motion.div>

        {/* ============================================
            ACCORDION LIST
            ============================================ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto flex max-w-3xl flex-col gap-3 sm:gap-4"
        >
          {FAQS.map((item) => (
            <FaqAccordionItem
              key={item.id}
              item={item}
              isOpen={openIds.includes(item.id)}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </motion.div>

        {/* ============================================
            BOTTOM SUPPORT CARD
            ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-12 max-w-3xl"
        >
          <div
            className={cn(
              "relative flex flex-col items-center gap-4",
              "overflow-hidden rounded-2xl",
              "border border-primary/25",
              "bg-linear-to-br from-primary/10 via-card to-card",
              "p-6 text-center sm:p-8",
            )}
          >
            {/* Decorative amber glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/20 blur-[80px]" />

            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-2xl",
                "bg-linear-to-br from-primary to-primary/70",
                "shadow-lg shadow-primary/30",
              )}
            >
              <MessageCircleQuestion
                className="size-6 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Still have questions?
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Our team is here to help. Reach out and we'll get back to you
                within 24 hours.
              </p>
            </div>

            <a
              href="mailto:hello@lyxa.ai"
              className={cn(
                "group/btn inline-flex h-11 items-center gap-2 rounded-full",
                "border border-primary/40 bg-transparent px-6",
                "text-sm font-semibold text-primary",
                "transition-all duration-300",
                "hover:border-primary hover:bg-primary/10",
              )}
            >
              Contact Support
              <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-0.5">
                →
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}