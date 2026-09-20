"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  User,
  Tag,
  Send,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Heart,
  MapPinned,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// BACK ICON (SVG)
// ============================================

const BackArrowIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

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
// BACK BUTTON (only shows if came from another page)
// ============================================

function BackButton() {
  const router = useRouter();
  const [showBack, setShowBack] = React.useState(false);

  React.useEffect(() => {
    // Only show back button if there's a referrer from the same site
    if (typeof window !== "undefined") {
      const referrer = document.referrer;
      const isSameSite =
        referrer &&
        (referrer.includes(window.location.hostname) ||
          referrer.startsWith("/"));

      // Also check if there's browser history
      const hasHistory = window.history.length > 1;

      setShowBack(!!isSameSite && hasHistory);
    }
  }, []);

  if (!showBack) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 flex"
    >
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className={cn(
          "group inline-flex items-center gap-2 rounded-full",
          "border border-border/60 bg-card/60 backdrop-blur-sm",
          "px-4 py-2",
          "text-sm font-semibold text-foreground",
          "transition-all duration-300",
          "hover:-translate-x-0.5",
          "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
        )}
      >
        <BackArrowIcon className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
        <span>Back</span>
      </button>
    </motion.div>
  );
}

// ============================================
// SECTION 1 — HERO
// ============================================

function ContactHero() {
  return (
    <section className="relative w-full py-12 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[140px] dark:bg-primary/18" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        {/* Back button (only if user came from another page) */}
        <BackButton />

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
            <MessageCircle className="size-3" strokeWidth={2.5} />
            Get In Touch
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
          Let&apos;s Talk
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              We&apos;re Here to Help
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
          Whether you have a question, feedback, or want to partner with us —
          we&apos;d love to hear from you. We reply within 24 hours.
        </motion.p>
      </motion.div>
    </section>
  );
}

// ============================================
// SECTION 2 — FORM + INFO CARDS
// ============================================

function ContactForm() {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  };

  const inputBase = cn(
    "w-full rounded-2xl border border-border/60 bg-background/60",
    "px-4 py-3 pl-11",
    "text-sm text-foreground",
    "placeholder:text-muted-foreground/70",
    "transition-all duration-200",
    "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10",
    "sm:text-[15px]",
  );

  const labelBase = cn(
    "mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground",
    "sm:text-xs",
  );

  const iconBase = cn(
    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-4 text-primary",
  );

  return (
    <section className="relative w-full pb-12 sm:pb-14 lg:pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/2 size-[500px] -translate-y-1/2 rounded-full bg-primary/6 blur-[140px] dark:bg-primary/10" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12 lg:gap-8">
        {/* LEFT — FORM */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative overflow-hidden rounded-3xl",
            "border border-primary/20 bg-card/60 backdrop-blur-sm",
            "p-5 sm:p-7 lg:col-span-7 lg:p-8",
          )}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/10 blur-[80px]" />

          <div className="relative flex flex-col gap-5">
            <span
              className={cn(
                "inline-flex w-fit items-center gap-1.5 rounded-full",
                "border border-primary/30 bg-primary/10",
                "px-3 py-1",
                "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
              )}
            >
              <MessageSquare className="size-2.5" strokeWidth={2.5} />
              Send a Message
            </span>

            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground sm:text-3xl">
                Drop Us a Line
              </h2>
              <p className="text-sm text-muted-foreground sm:text-[15px]">
                Fill out the form and we&apos;ll get back to you within 24
                hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-4">
              <div>
                <label htmlFor="name" className={labelBase}>
                  Full Name
                </label>
                <div className="relative">
                  <User className={iconBase} strokeWidth={2.5} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={inputBase}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelBase}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={iconBase} strokeWidth={2.5} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputBase}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className={labelBase}>
                  Subject
                </label>
                <div className="relative">
                  <Tag className={iconBase} strokeWidth={2.5} />
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className={inputBase}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className={labelBase}>
                  Message
                </label>
                <div className="relative">
                  <MessageSquare
                    className="pointer-events-none absolute left-4 top-4 size-4 text-primary"
                    strokeWidth={2.5}
                  />
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your question or idea..."
                    rows={5}
                    className={cn(
                      "w-full resize-none rounded-2xl border border-border/60 bg-background/60",
                      "px-4 py-3 pl-11",
                      "text-sm text-foreground",
                      "placeholder:text-muted-foreground/70",
                      "transition-all duration-200",
                      "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10",
                      "sm:text-[15px]",
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={sending}
                className={cn(
                  "group/btn mt-1 h-11 w-full rounded-full",
                  "text-sm font-semibold sm:text-base",
                  "bg-linear-to-r from-primary to-primary/80",
                  "text-primary-foreground",
                  "shadow-lg shadow-primary/30",
                  "transition-all duration-300",
                  "hover:shadow-xl hover:shadow-primary/40",
                )}
              >
                {sending ? (
                  "Sending..."
                ) : sent ? (
                  "Message Sent!"
                ) : (
                  <>
                    Send Message
                    <Send
                      className="ml-2 size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                      strokeWidth={2.5}
                    />
                  </>
                )}
              </Button>

              <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                By submitting, you agree to our{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Terms
                </Link>{" "}
                &amp;{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </motion.div>

        {/* RIGHT — INFO CARDS */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col gap-3.5 lg:col-span-5 lg:gap-4"
        >
          {[
            {
              icon: Mail,
              label: "Email Us",
              value: "tabish@codewithtabish.com",
              sub: "Reply within 24 hours",
              href: "mailto:tabish@codewithtabish.com",
            },
            {
              icon: Phone,
              label: "Call Us",
              value: "+92 300 123 4567",
              sub: "Mon - Fri, 9AM - 6PM (PKT)",
              href: "tel:+923001234567",
            },
            {
              icon: MapPin,
              label: "Visit Us",
              value: "Mardan, Pakistan",
              sub: "Our headquarters",
              href: "#find-us",
            },
            {
              icon: MessageCircle,
              label: "Follow Us",
              value: "@codewithtabish",
              sub: "Get the latest updates",
              href: "https://codewithtabish.com",
            },
          ].map((info) => {
            const Icon = info.icon;
            return (
              <motion.a
                key={info.label}
                variants={itemVariants}
                href={info.href}
                target={info.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  info.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className={cn(
                  "group relative flex items-center gap-4 overflow-hidden",
                  "rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm",
                  "p-4 sm:p-5",
                  "transition-all duration-500",
                  "hover:-translate-y-1 hover:border-primary/40",
                  "hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5",
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

                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                    {info.label}
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground sm:text-[15px]">
                    {info.value}
                  </span>
                  <span className="text-[11px] text-muted-foreground sm:text-xs">
                    {info.sub}
                  </span>
                </div>

                <ArrowRight
                  className={cn(
                    "ml-auto size-4 shrink-0 text-muted-foreground/50",
                    "transition-all duration-300",
                    "group-hover:translate-x-0.5 group-hover:text-primary",
                  )}
                  strokeWidth={2.5}
                />
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 3 — WHY CHOOSE LEXA
// ============================================

function WhyContact() {
  const ITEMS = [
    {
      icon: Zap,
      title: "Fast Response",
      description: "We reply within 24 hours (usually much sooner).",
    },
    {
      icon: Users,
      title: "Real Support",
      description: "Talk to our friendly team, not bots.",
    },
    {
      icon: ShieldCheck,
      title: "Your Privacy Matters",
      description: "We respect your data and keep it secure.",
    },
    {
      icon: Heart,
      title: "We're Always Improving",
      description: "Your feedback helps us build a better LEXA.",
    },
  ];

  return (
    <section className="relative w-full py-12 sm:py-14 lg:py-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="flex flex-col items-center gap-10"
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
              <Sparkles className="size-2.5" strokeWidth={2.5} />
              Why Choose LEXA
            </Badge>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground sm:text-3xl lg:text-[2rem]"
          >
            We&apos;re Always Here for You
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
          >
            Your satisfaction means everything to us. Get in touch and
            we&apos;ll make sure you get the help you need, when you need it.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          className="grid w-full grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4"
        >
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div
                  className={cn(
                    "flex size-14 items-center justify-center rounded-full",
                    "bg-linear-to-br from-primary to-primary/70",
                    "shadow-lg shadow-primary/25",
                  )}
                >
                  <Icon
                    className="size-6 text-primary-foreground"
                    strokeWidth={2.5}
                  />
                </div>
                <h3 className="text-sm font-bold leading-tight tracking-tight text-foreground sm:text-[15px]">
                  {item.title}
                </h3>
                <p className="max-w-[180px] text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// SECTION 4 — FIND US
// ============================================

function FindUs() {
  return (
    <section
      id="find-us"
      className="relative w-full py-12 sm:py-14 lg:py-16"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-1/3 size-[400px] rounded-full bg-primary/6 blur-[120px] dark:bg-primary/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "border border-primary/20 bg-card/60 backdrop-blur-sm",
          "p-5 sm:p-7 lg:p-8",
        )}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <span
              className={cn(
                "inline-flex w-fit items-center gap-1.5 rounded-full",
                "border border-primary/30 bg-primary/10",
                "px-3 py-1",
                "text-[10px] font-bold uppercase tracking-[0.15em] text-primary",
              )}
            >
              <MapPinned className="size-2.5" strokeWidth={2.5} />
              Our Location
            </span>

            <h2 className="text-2xl font-extrabold leading-tight tracking-[-0.028em] text-foreground sm:text-3xl lg:text-[2rem]">
              Find Us
            </h2>

            <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              We&apos;re based in Mardan, Pakistan. While we work remotely, our
              team is always just a message away.
            </p>

            <div className="mt-1 flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  "bg-linear-to-br from-primary to-primary/70",
                  "shadow-md shadow-primary/25",
                )}
              >
                <MapPin
                  className="size-4.5 text-primary-foreground"
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-foreground sm:text-sm">
                  Mardan, Pakistan
                </span>
                <span className="text-[11px] text-muted-foreground sm:text-xs">
                  Our headquarters
                </span>
              </div>
            </div>

            <div className="relative mt-3 aspect-3/2 w-full overflow-hidden rounded-2xl border border-border/50">
              <Image
                src="/images/contact-us/building.jpg"
                alt="LEXA headquarters building"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center"
              />
              <div className="pointer-events-none absolute bottom-3 right-4 flex items-center gap-1 text-[10px] font-semibold italic text-white drop-shadow-lg sm:text-xs">
                <span>— Team LEXA</span>
                <Heart
                  className="size-3 text-primary"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              className={cn(
                "relative h-full min-h-[320px] overflow-hidden rounded-2xl",
                "border border-border/50 bg-linear-to-br from-primary/8 via-card/40 to-background",
                "sm:min-h-[400px] lg:min-h-[480px]",
              )}
            >
              <Image
                src="/images/contact-us/map.png"
                alt="LEXA HQ location on Mardan map"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain object-center p-2"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ============================================
// SECTION 5 — COMMUNITY CTA (adaptive button)
// ============================================

function CommunityCta() {
  const { isSignedIn, isLoaded } = useUser();

  const ctaClass = cn(
    "group/btn inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full px-6",
    "bg-primary-foreground text-primary",
    "text-sm font-semibold sm:text-base",
    "shadow-lg shadow-black/10",
    "transition-all duration-300",
    "hover:bg-primary-foreground/95 hover:shadow-xl",
    "no-underline",
  );

  return (
    <section className="relative w-full py-12 sm:py-14 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "bg-linear-to-br from-primary via-primary to-primary/80",
          "px-5 py-8 sm:px-10 sm:py-10 lg:py-12",
          "shadow-xl shadow-primary/25",
        )}
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 size-64 rounded-full bg-primary-foreground/20 blur-[80px]" />
          <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-primary-foreground/15 blur-[80px]" />
          <div className="absolute left-1/4 top-1/3 size-2 rounded-full bg-primary-foreground/40 blur-sm" />
          <div className="absolute right-1/3 bottom-1/3 size-3 rounded-full bg-primary-foreground/30 blur-sm" />
        </div>

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
            <div
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-2xl",
                "bg-primary-foreground/20 backdrop-blur-sm",
              )}
            >
              <Users
                className="size-6 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span
                className={cn(
                  "inline-flex w-fit items-center gap-1.5 rounded-full",
                  "bg-primary-foreground/20 backdrop-blur-sm",
                  "px-2.5 py-1",
                  "text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground",
                )}
              >
                <Sparkles className="size-2.5" strokeWidth={3} />
                Join Thousands
              </span>
              <h2 className="text-xl font-extrabold leading-tight tracking-[-0.028em] text-primary-foreground sm:text-2xl lg:text-3xl">
                Be Part of the LEXA Community
              </h2>
              <p className="max-w-xl text-[13px] leading-relaxed text-primary-foreground/85 sm:text-sm">
                Join millions of users who are already transforming their looks
                with the power of AI.
              </p>
            </div>
          </div>

          {/* ============================================
              ADAPTIVE CTA
              NOT LOGGED IN → Clerk modal
              LOGGED IN     → /app
              ============================================ */}
          {isLoaded && isSignedIn ? (
            <Link href="/app" className={ctaClass}>
              Get Started Free
              <ArrowRight
                className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                strokeWidth={2.5}
              />
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button type="button" className={ctaClass}>
                Get Started Free
                <ArrowRight
                  className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </button>
            </SignUpButton>
          )}
        </div>
      </motion.div>
    </section>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col">
      <ContactHero />
      <ContactForm />
      <WhyContact />
      <FindUs />
      <CommunityCta />
    </div>
  );
}