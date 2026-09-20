"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Sun, Crown, Home, Wand2, History, Image as ImageIcon, Gem } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// ============================================
// SHIMMER BLOCK
// ============================================
// A reusable shimmer element that adapts to light/dark mode.
// Uses primary color gradient from your theme — looks great in both modes.

function Shimmer({
  width = "w-6",
  height = "h-3.5",
  className,
  rounded = "rounded-full",
}: {
  width?: string;
  height?: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0.35 }}
      animate={{ opacity: [0.35, 0.85, 0.35] }}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(
        "inline-block",
        "bg-linear-to-r from-primary/15 via-primary/35 to-primary/15",
        width,
        height,
        rounded,
        className,
      )}
    />
  );
}

// ============================================
// NAV LINKS (same as the real navbar for width match)
// ============================================

const NAV_LINKS = [
  { label: "Home", icon: Home },
  { label: "Generate", icon: Wand2 },
  { label: "History", icon: History },
  { label: "Gallery", icon: ImageIcon },
  { label: "Pricing", icon: Gem },
];

// ============================================
// MAIN FALLBACK COMPONENT
// ============================================

export function DashboardNavbarFallback() {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full",
          "border-b border-border/60",
          "bg-background/80 backdrop-blur-xl backdrop-saturate-150",
        )}
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading navigation"
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* ============================================
              LOGO — real (not shimmer) so brand is visible
              ============================================ */}
          <div className="flex items-center gap-3">
            <div className="group flex shrink-0 items-center gap-2.5">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  "bg-linear-to-br from-primary to-primary/70",
                  "shadow-md shadow-primary/25",
                )}
              >
                <Sparkles className="size-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-extrabold tracking-[0.08em] text-foreground">
                LEXA AI
              </span>
            </div>
          </div>

          {/* ============================================
              DESKTOP NAV LINKS — shimmer placeholders
              ============================================ */}
          <nav className="hidden items-center gap-2 lg:flex">
            {NAV_LINKS.map((link, i) => (
              <div
                key={link.label}
                className="flex items-center gap-1.5 rounded-lg px-3.5 py-2"
              >
                <Shimmer
                  width="w-4"
                  height="h-4"
                  rounded="rounded-md"
                  className="opacity-60"
                />
                <Shimmer
                  width={
                    i === 0
                      ? "w-10"
                      : i === 1
                        ? "w-16"
                        : i === 2
                          ? "w-14"
                          : i === 3
                            ? "w-14"
                            : "w-12"
                  }
                  height="h-3.5"
                />
              </div>
            ))}
          </nav>

          {/* ============================================
              RIGHT SIDE ACTIONS — shimmer placeholders
              ============================================ */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Credits Badge Skeleton */}
            <div
              className={cn(
                "hidden items-center gap-1.5 rounded-full sm:flex",
                "bg-linear-to-r from-primary/15 to-primary/10",
                "border border-primary/30",
                "px-3 py-1.5",
                "shadow-sm shadow-primary/10",
              )}
            >
              <Zap
                className="size-3.5 text-primary opacity-50"
                strokeWidth={2.5}
                fill="currentColor"
              />
              <Shimmer width="w-6" height="h-3.5" />
              <span className="text-[11px] font-medium text-primary/70">
                credits
              </span>
            </div>

            {/* Plan Badge Skeleton */}
            <div
              className={cn(
                "hidden items-center gap-1.5 rounded-full lg:flex",
                "bg-linear-to-r from-primary/10 to-primary/5",
                "border border-primary/20",
                "px-3 py-1.5",
              )}
            >
              <Crown
                className="size-3.5 text-primary/50"
                strokeWidth={2.5}
                fill="currentColor"
              />
              <Shimmer width="w-10" height="h-3" />
            </div>

            {/* Theme Toggle Skeleton */}
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full",
                "border border-border/60 bg-card/50",
              )}
            >
              <Sun
                className="size-4 text-muted-foreground/40"
                strokeWidth={2.5}
              />
            </div>

            {/* Avatar Skeleton */}
            <Shimmer
              width="size-9"
              height="size-9"
              rounded="rounded-full"
              className="opacity-70"
            />

            {/* Mobile Menu Toggle Skeleton */}
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full lg:hidden",
                "border border-border/60 bg-card/50",
              )}
            >
              <Shimmer width="w-4" height="h-4" rounded="rounded-md" />
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
}