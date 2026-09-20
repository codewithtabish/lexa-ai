"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Sparkles, ArrowUpRight, Heart, Mail, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../../general/theme/mode-toggle";

// ============================================
// CUSTOM SVG SOCIAL ICONS
// ============================================

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// ============================================
// FOOTER LINKS DATA
// ============================================

const FOOTER_LINKS = {
  product: {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
};

const SOCIAL_LINKS = [
  { label: "Twitter", href: "https://twitter.com/codewithtabish", Icon: TwitterIcon },
  { label: "Instagram", href: "https://instagram.com/codewithtabish", Icon: InstagramIcon },
  { label: "YouTube", href: "https://youtube.com/@codewithtabish", Icon: YoutubeIcon },
  { label: "GitHub", href: "https://github.com/codewithtabish", Icon: GithubIcon },
  { label: "LinkedIn", href: "https://linkedin.com/in/codewithtabish", Icon: LinkedinIcon },
];

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ============================================
// MAIN FOOTER
// ============================================

export function Footer() {
  const [year, setYear] = React.useState<number>(2026);

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      className={cn(
        "relative mt-24 w-full overflow-hidden",
        // ── THEME-BASED BORDER ──
        "border-t border-primary/20 dark:border-primary/30",
        // ── THEME-BASED BACKGROUND (matches Container gradient style) ──
        // Light mode — soft warm radial gradients echoing Container
        "bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_60%),radial-gradient(ellipse_60%_50%_at_15%_40%,color-mix(in_oklab,var(--primary)_6%,transparent),transparent_55%),radial-gradient(ellipse_60%_50%_at_85%_30%,color-mix(in_oklab,var(--primary)_5%,transparent),transparent_50%)]",
        // Dark mode — richer warm aurora gradients
        "dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_20%,transparent),transparent_60%),radial-gradient(ellipse_60%_50%_at_15%_40%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_55%),radial-gradient(ellipse_60%_50%_at_85%_30%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_50%)]",
        // ── SMOOTH THEME TRANSITION ──
        "transition-colors duration-500 ease-out",
        "bg-background text-foreground",
      )}
    >
      {/* ============================================
          AMBIENT THEME-BASED GLOW (bottom center)
          ============================================ */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        )}
      >
        {/* Primary bottom glow — matches Container orb style */}
        <div
          className={cn(
            "absolute -bottom-40 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full blur-[120px]",
            "bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_30%,transparent),transparent_70%)]",
            "dark:bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_45%,transparent),transparent_70%)]",
            "opacity-50 dark:opacity-60",
          )}
        />

        {/* Secondary ambient glow — top right */}
        <div
          className={cn(
            "absolute -right-32 -top-32 h-[300px] w-[300px] rounded-full blur-[100px]",
            "bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_20%,transparent),transparent_70%)]",
            "dark:bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_30%,transparent),transparent_70%)]",
            "opacity-40 dark:opacity-50",
          )}
        />

        {/* Tertiary ambient glow — left */}
        <div
          className={cn(
            "absolute -left-40 top-1/3 h-[250px] w-[250px] rounded-full blur-[100px]",
            "bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_15%,transparent),transparent_70%)]",
            "dark:bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_25%,transparent),transparent_70%)]",
            "opacity-35 dark:opacity-45",
          )}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 lg:grid-cols-12 lg:gap-x-12"
        >
          {/* COLUMN 1 — BRAND */}
          <motion.div
            variants={itemVariants}
            className="col-span-2 sm:col-span-1 lg:col-span-4"
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <motion.div
                whileHover={{ rotate: 12, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  "bg-linear-to-br from-primary to-primary/70",
                  "shadow-md shadow-primary/30",
                )}
              >
                <Sparkles className="size-4 text-primary-foreground" strokeWidth={2.5} />
              </motion.div>
              <span className="text-lg font-extrabold tracking-[0.08em] text-foreground">
                LEXA
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Transform your look with AI in seconds. Try hairstyles, beards,
              outfits, age transformations, and more — all powered by
              state-of-the-art artificial intelligence.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.Icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      "border border-border/60 bg-card/50 backdrop-blur-sm",
                      "text-muted-foreground",
                      "transition-all duration-200",
                      "hover:-translate-y-0.5",
                      "hover:border-primary/50",
                      "hover:bg-primary/10",
                      "hover:text-primary",
                    )}
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* COLUMNS 2-4 — LINK GROUPS */}
          {Object.entries(FOOTER_LINKS).map(([key, section]) => (
            <motion.div key={key} variants={itemVariants} className="lg:col-span-2">
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-foreground">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group inline-flex items-center gap-1",
                        "text-sm font-medium text-muted-foreground",
                        "transition-colors duration-200",
                        "hover:text-primary",
                      )}
                    >
                      {link.label}
                      <ArrowUpRight
                        className={cn(
                          "size-3 opacity-0",
                          "transition-all duration-200",
                          "group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100",
                        )}
                        strokeWidth={2.5}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* CONTACT COLUMN */}
          <motion.div variants={itemVariants} className="col-span-2 lg:col-span-2">
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-foreground">
              Get in Touch
            </h3>
            <a
              href="mailto:hello@lexa.ai"
              className={cn(
                "group inline-flex items-center gap-2",
                "rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm",
                "px-3.5 py-2.5",
                "text-sm font-medium text-foreground",
                "transition-all duration-200",
                "hover:border-primary/50 hover:bg-primary/10",
              )}
            >
              <Mail className="size-4 text-primary" strokeWidth={2.5} />
              hello@lexa.ai
            </a>
            <div className="mt-5">
              <ModeToggle />
            </div>
          </motion.div>
        </motion.div>

        {/* PUBLISHED BY CODEWITHTABISH CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14"
        >
          <a
            href="http://codewithtabish.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group relative block overflow-hidden",
              "rounded-3xl border border-border/60",
              "bg-linear-to-br from-card/80 via-card/60 to-card/40",
              "backdrop-blur-sm",
              "p-6 sm:p-8",
              "transition-all duration-500",
              "hover:-translate-y-1",
              "hover:border-primary/50",
              "hover:shadow-2xl hover:shadow-primary/10",
            )}
          >
            {/* THEME-BASED AMBIENT GLOW — uses primary */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute -right-20 -top-20 size-64 rounded-full blur-[100px]",
                "bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_35%,transparent),transparent_70%)]",
                "dark:bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_50%,transparent),transparent_70%)]",
                "opacity-60 transition-opacity duration-500 group-hover:opacity-100",
              )}
            />

            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-2xl",
                    "bg-linear-to-br from-primary to-primary/70",
                    "shadow-lg shadow-primary/30",
                    "transition-transform duration-500",
                    "group-hover:scale-110 group-hover:rotate-3",
                  )}
                >
                  <Heart className="size-5 text-primary-foreground" fill="currentColor" strokeWidth={0} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Published by
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
                      CodeWithTabish
                    </h3>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Verified
                    </span>
                  </div>

                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    A software development brand by{" "}
                    <span className="font-semibold text-foreground">Talha Tabish</span>{" "}
                    — building modern{" "}
                    <span className="font-semibold text-foreground">
                      mobile apps, websites, SaaS platforms, AI-powered tools, and digital products
                    </span>
                    . The organization behind{" "}
                    <span className="font-semibold text-foreground">INSIDER</span>.
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 self-end sm:self-auto",
                  "rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-sm",
                  "px-4 py-2.5",
                  "text-sm font-semibold text-primary",
                  "transition-all duration-300",
                  "group-hover:border-primary/60 group-hover:bg-primary/15",
                )}
              >
                <span>codewithtabish.com</span>
                <ExternalLink
                  className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </a>
        </motion.div>

        {/* BOTTOM BAR */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className={cn(
            "mt-12 flex flex-col items-center justify-between gap-4",
            // ── THEME-BASED BORDER ──
            "border-t border-primary/15 dark:border-primary/25",
            "pt-6",
            "sm:flex-row",
          )}
        >
          <p className="text-xs text-muted-foreground sm:text-sm">
            © {year} LEXA AI. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            Made with
            <Heart className="size-3.5 text-primary" fill="currentColor" strokeWidth={0} />
            in Pakistan
          </p>

          <p className="text-xs text-muted-foreground sm:text-sm">
            A product by{" "}
            <a
              href="http://codewithtabish.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              CodeWithTabish
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}