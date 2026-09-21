// src/app/app/ai-generate/ai-generate-back.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Zap } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { getUserAction } from "@/actions/users/get-user-action";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface AIGenerateBackProps {
  backHref?: string;
  showCredits?: boolean;
  refreshKey?: number;
}

// ═══════════════════════════════════════════════════════════
// SHIMMER SKELETON
// ═══════════════════════════════════════════════════════════

function CreditShimmer() {
  return (
    <motion.span
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      className={cn(
        "inline-block h-3.5 w-6 rounded-full",
        "bg-linear-to-r from-[#D18A4A]/20 via-[#D18A4A]/40 to-[#D18A4A]/20",
        "dark:from-[#D99A5B]/25 dark:via-[#D99A5B]/50 dark:to-[#D99A5B]/25"
      )}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function AIGenerateBack({
  backHref = "/app",
  showCredits = true,
  refreshKey = 0,
}: AIGenerateBackProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const [credits, setCredits] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchCredits() {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const result = await getUserAction();
        if (cancelled) return;
        if (result.success) {
          setCredits(result.user.credits);
        } else {
          setCredits(0);
        }
      } catch (err) {
        if (cancelled) return;
        setCredits(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCredits();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, refreshKey]);

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push(backHref);
  };

  const showSkeleton = loading || (isSignedIn && credits === null);
  const creditsToShow = credits ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mx-auto flex w-full max-w-7xl items-center justify-between",
        "px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8"
      )}
    >
      {/* BACK BUTTON */}
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className={cn(
          "group inline-flex items-center gap-2",
          "rounded-full",
          // Theme-aware glass background
          "border border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-sm",
          "dark:border-[#4A473F] dark:bg-[#262421]/80",
          "px-3.5 py-2 sm:px-4 sm:py-2.5",
          "text-[13px] font-bold tracking-tight sm:text-[14px]",
          "text-[#2E2A24] dark:text-[#F7F5F0]",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
          "transition-all duration-300",
          "hover:-translate-y-0.5",
          "hover:border-[#D18A4A]/50 hover:bg-[#FDF4EB]",
          "hover:shadow-[0_8px_20px_rgba(217,154,91,0.15)]",
          "dark:hover:border-[#D99A5B]/50 dark:hover:bg-[#33312D]",
          "dark:hover:shadow-[0_8px_20px_rgba(217,154,91,0.1)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A] focus-visible:ring-offset-2",
          "focus-visible:ring-offset-[#F7F7F2] dark:focus-visible:ring-offset-[#2B2B28]"
        )}
      >
        <ArrowLeft
          className={cn(
            "size-4 transition-transform duration-300",
            "text-[#D18A4A] dark:text-[#D99A5B]",
            "group-hover:-translate-x-0.5",
            "sm:size-[18px]"
          )}
          strokeWidth={2.5}
        />
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden">Back</span>
      </button>

      {/* CREDITS BADGE */}
      {showCredits && (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full",
            "bg-linear-to-r from-[#D99A5B]/15 to-[#B86F32]/10",
            "border border-[#D18A4A]/30",
            "dark:from-[#D99A5B]/20 dark:to-[#B86F32]/15",
            "dark:border-[#D99A5B]/40",
            "px-3 py-1.5 sm:px-3.5 sm:py-2",
            "shadow-[0_2px_8px_rgba(217,154,91,0.1)]"
          )}
        >
          <Zap
            className={cn(
              "size-3.5 text-[#D18A4A] dark:text-[#D99A5B]",
              showSkeleton && "opacity-50"
            )}
            strokeWidth={2.5}
            fill="currentColor"
          />
          {showSkeleton ? (
            <CreditShimmer />
          ) : (
            <span
              className={cn(
                "text-[12px] font-bold sm:text-[13px]",
                "text-[#D18A4A] dark:text-[#D99A5B]"
              )}
            >
              {creditsToShow}
            </span>
          )}
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]",
              "text-[#8B8478] dark:text-[#B5B0A5]"
            )}
          >
            credits
          </span>
        </div>
      )}
    </motion.div>
  );
}