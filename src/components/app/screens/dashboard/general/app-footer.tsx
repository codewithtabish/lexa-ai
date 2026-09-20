"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Heart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-border/60">
      {/* Subtle amber ambient glow at bottom */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-10 h-20 bg-primary/5 blur-[60px]" />

      <div
        className={cn(
          "relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-4",
          "px-4 py-5 sm:px-6 lg:px-8",
          "sm:flex-row sm:gap-6",
        )}
      >
        {/* ============================================
            LEFT — Copyright + Brand
            ============================================ */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
          {/* Tiny logo */}
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className={cn(
              "flex size-5 items-center justify-center rounded-md",
              "bg-linear-to-br from-primary to-primary/70",
              "shadow-sm shadow-primary/25",
            )}
          >
            <Sparkles
              className="size-2.5 text-primary-foreground"
              strokeWidth={2.5}
            />
          </motion.div>

          <span className="font-semibold text-foreground">LEXA AI</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">© {year}</span>
          <span className="sm:hidden">© {year}</span>
        </div>

        {/* ============================================
            CENTER — Legal Links
            ============================================ */}
        <nav className="flex items-center gap-4 text-[11px] sm:text-xs">
          <Link
            href="/privacy"
            className="font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
          >
            Privacy
          </Link>

          <span className="size-1 rounded-full bg-border" />

          <Link
            href="/terms"
            className="font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
          >
            Terms
          </Link>

          <span className="size-1 rounded-full bg-border" />

          <Link
            href="/contact"
            className="font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
          >
            Help
          </Link>
        </nav>

        {/* ============================================
            RIGHT — Published by CodeWithTabish
            ============================================ */}
        <a
          href="http://codewithtabish.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group inline-flex items-center gap-1.5",
            "text-[11px] text-muted-foreground sm:text-xs",
            "transition-colors duration-200",
            "hover:text-primary",
          )}
        >
          <span>Published by</span>
          <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
            CodeWithTabish
          </span>
          <ExternalLink
            className={cn(
              "size-2.5 shrink-0",
              "transition-transform duration-200",
              "group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
            )}
            strokeWidth={2.5}
          />
        </a>
      </div>

      {/* ============================================
          BOTTOM — Made with love (mobile only row)
          ============================================ */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-1.5 px-4 pb-5 text-[10px] text-muted-foreground/70 sm:hidden">
        <span>Made with</span>
        <Heart
          className="size-2.5 text-primary"
          fill="currentColor"
          strokeWidth={0}
        />
        <span>in Pakistan</span>
      </div>

      {/* Desktop: subtle made-with line (small, right-aligned on wide) */}
      <div className="relative mx-auto hidden max-w-7xl items-center justify-end gap-1.5 px-4 pb-5 text-[10px] text-muted-foreground/60 sm:flex sm:px-6 lg:px-8">
        <span>Made with</span>
        <Heart
          className="size-2.5 text-primary"
          fill="currentColor"
          strokeWidth={0}
        />
        <span>in Pakistan</span>
      </div>
    </footer>
  );
}