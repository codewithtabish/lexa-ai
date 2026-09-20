"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { useClerk, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Sparkles, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../../general/theme/mode-toggle";

// ============================================
// NAVIGATION LINKS
// ============================================

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

// ============================================
// CLERK APPEARANCE — matches Container gradient
// ============================================

const clerkAppearance = {
  variables: {
    colorPrimary: "hsl(var(--primary))",
    colorBackground: "hsl(var(--background))",
    colorText: "hsl(var(--foreground))",
    colorTextSecondary: "hsl(var(--muted-foreground))",
    colorInputBackground: "hsl(var(--background))",
    colorInputText: "hsl(var(--foreground))",
    borderRadius: "0.9rem",
  },
  elements: {
    modalBackdrop: "bg-background/70 backdrop-blur-md",
    modalContent:
      "bg-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl dark:border-white/10",
    card: "bg-transparent shadow-none",
    headerTitle: "text-foreground font-bold",
    headerSubtitle: "text-muted-foreground",
    formButtonPrimary:
      "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90",
    formFieldInput:
      "bg-muted/40 border-border/60 focus:border-primary/40 focus:ring-primary/20",
    footerActionLink: "text-primary hover:text-primary/80",
    identityPreviewEditButton: "text-primary",
    formFieldLabel: "text-foreground",
    dividerLine: "bg-border/60",
    dividerText: "text-muted-foreground",
  },
};

// ============================================
// MAIN NAVBAR
// ============================================

export function MarketingNavbar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const { openSignUp } = useClerk();

  // -------------------------------------------------
  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURN
  // -------------------------------------------------
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 12);
  });

  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // ============================================
  // 🔒 ONLY SHOW ON LANDING PAGE (/)
  // Completely hidden on every other route
  // ============================================
  const isLandingPage = pathname === "/";
  if (!isLandingPage) {
    return null;
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 w-full"
      >
        <motion.div
          animate={{
            paddingTop: isScrolled ? 12 : 20,
            paddingBottom: isScrolled ? 12 : 20,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          {/* Floating Glass Background */}
          <motion.div
            animate={{
              opacity: 1,
              scale: isScrolled ? 1 : 0.995,
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "pointer-events-none absolute inset-x-3 top-2 bottom-2 -z-10",
              "rounded-2xl transition-all duration-500",
              isScrolled
                ? "border border-border/50 bg-background/85 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)]"
                : "border border-border/30 bg-background/40 backdrop-blur-md",
              isScrolled
                ? "dark:border-white/10 dark:bg-[color-mix(in_oklab,var(--background)_68%,var(--primary)_11%)] dark:shadow-[0_8px_40px_-10px_rgba(0,0,0,0.7)]"
                : "dark:border-white/6 dark:bg-[color-mix(in_oklab,var(--background)_55%,var(--primary)_8%)]",
            )}
          />

          {/* Bottom Border */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 h-px transition-all duration-500",
              isScrolled
                ? "bg-border/70 dark:bg-[color-mix(in_oklab,var(--primary)_35%,transparent)]"
                : "bg-border/20 dark:bg-white/4",
            )}
          />

          {/* ============================================
              LOGO
              ============================================ */}
          <Link
            href="/"
            className="group relative flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="relative flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/70 shadow-lg shadow-primary/25"
            >
              <Sparkles className="size-[18px] text-white" strokeWidth={2.5} />
            </motion.div>

            <span className="text-lg font-extrabold tracking-[0.14em] text-foreground">
              LEXA
            </span>
          </Link>

          {/* ============================================
              DESKTOP NAV LINKS
              ============================================ */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.05, duration: 0.4 }}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "group relative rounded-xl px-4 py-2",
                    "text-sm font-medium text-muted-foreground",
                    "transition-colors duration-200",
                    "hover:text-foreground",
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-primary/10" />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* ============================================
              DESKTOP ACTIONS
              ============================================ */}
          <div className="hidden items-center gap-2.5 md:flex">
            <ModeToggle />

            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            ) : (
              <SignUpButton mode="modal" appearance={clerkAppearance}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.975 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className={cn(
                    "group relative inline-flex items-center gap-2 overflow-hidden",
                    "rounded-xl px-5 py-2.5",
                    "text-sm font-semibold text-primary-foreground",
                    "shadow-lg shadow-primary/25",
                    "hover:shadow-xl hover:shadow-primary/35",
                    "transition-shadow duration-300",
                  )}
                >
                  <span className="absolute inset-0 bg-linear-to-r from-primary via-primary/90 to-primary/75" />
                  <span className="absolute inset-0 bg-linear-to-r from-primary/0 via-white/20 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="size-3.5" strokeWidth={2.5} />
                  </span>
                </motion.button>
              </SignUpButton>
            )}
          </div>

          {/* ============================================
              MOBILE TOGGLE
              ============================================ */}
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />

            {isSignedIn && (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            )}

            <button
              type="button"
              onClick={() => setIsMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className={cn(
                "flex size-10 items-center justify-center rounded-xl",
                "bg-muted/40 backdrop-blur-sm",
                "transition-colors duration-200",
                "hover:bg-muted/70",
              )}
            >
              <div className="relative size-5">
                <motion.span
                  animate={
                    isMobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-0.5 block h-0.5 w-full rounded-full bg-foreground"
                />
                <motion.span
                  animate={
                    isMobileOpen ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }
                  }
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-2.5 block h-0.5 w-full rounded-full bg-foreground"
                />
                <motion.span
                  animate={
                    isMobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-[18px] block h-0.5 w-full rounded-full bg-foreground"
                />
              </div>
            </button>
          </div>
        </motion.div>
      </motion.header>

      {/* ============================================
          MOBILE MENU
          ============================================ */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md md:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "fixed inset-x-4 top-24 z-50 md:hidden",
                "rounded-3xl border border-border/50",
                "bg-background/95 backdrop-blur-2xl",
                "p-5 shadow-2xl",
                "dark:border-white/10",
                "dark:bg-[color-mix(in_oklab,var(--background)_82%,var(--primary)_8%)]",
              )}
            >
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.28 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-3.5",
                        "text-base font-medium text-foreground",
                        "transition-colors duration-200",
                        "hover:bg-muted/50",
                      )}
                    >
                      {link.label}
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {!isSignedIn && (
                <>
                  <div className="my-5 h-px bg-border/60 dark:bg-white/10" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileOpen(false);
                      openSignUp();
                    }}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5",
                      "bg-linear-to-r from-primary to-primary/80",
                      "text-base font-semibold text-primary-foreground",
                      "shadow-lg shadow-primary/25",
                    )}
                  >
                    Get Started Free
                    <ArrowRight className="size-4" strokeWidth={2.5} />
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}