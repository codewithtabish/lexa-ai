// src/components/app/screens/dashboard/create/recent-creations-grid.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface RecentCreationItem {
  id: string;
  url: string;
  prompt: string;
  style: string;
  createdAt?: Date;
}

export interface RecentCreationsGridProps {
  items: RecentCreationItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelect: (url: string) => void;
  /** Number of skeleton tiles to show while loading (default 8). */
  skeletonCount?: number;
  /** Title shown in header. */
  title?: string;
  /** Subtitle shown in header. */
  subtitle?: string;
  /** Empty state subtitle. */
  emptySubtitle?: string;
}

// ═══════════════════════════════════════════════════════════
// HEADER (shared across states)
// ═══════════════════════════════════════════════════════════

function SectionHeader({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count?: number;
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-[20px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
          {title}
        </h2>
        <p className="mt-0.5 text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
          {subtitle}
        </p>
      </div>
      {typeof count === "number" && count > 0 && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B8478] dark:text-[#B5B0A5]">
          {count} image{count === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "aspect-square animate-pulse rounded-2xl border",
            "border-[#E5E0D5] bg-[#E5E0D5]/30",
            "dark:border-[#4A473F] dark:bg-[#4A473F]/30"
          )}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ERROR FALLBACK
// ═══════════════════════════════════════════════════════════

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed",
        "border-[#E8B4B8]/40 bg-[#E8B4B8]/5",
        "dark:border-[#E8B4B8]/30 dark:bg-[#E8B4B8]/5",
        "px-6 py-12 text-center"
      )}
    >
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl",
          "border border-[#E8B4B8]/30 bg-[#E8B4B8]/10"
        )}
      >
        <AlertCircle className="size-6 text-[#E8B4B8]" strokeWidth={2} />
      </div>
      <p className="text-[15px] font-bold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
        Couldn&apos;t load your creations
      </p>
      <p className="max-w-[300px] text-[13px] leading-relaxed text-[#8B8478] dark:text-[#B5B0A5]">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "mt-1 inline-flex items-center gap-2 rounded-full border px-4 py-2",
            "border-[#D18A4A]/40 bg-[#FDF4EB] text-[#D18A4A]",
            "dark:border-[#D99A5B]/40 dark:bg-[#D99A5B]/10 dark:text-[#D99A5B]",
            "text-[12px] font-bold tracking-tight",
            "transition-all duration-200",
            "hover:border-[#D18A4A]/70 hover:bg-[#FDF4EB]/80",
            "dark:hover:border-[#D99A5B]/70 dark:hover:bg-[#D99A5B]/15"
          )}
        >
          <RefreshCw className="size-3.5" strokeWidth={2.5} />
          Try again
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════

function EmptyState({ subtitle }: { subtitle: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed",
        "border-[#E5E0D5] bg-transparent",
        "dark:border-[#4A473F] dark:bg-transparent",
        "px-6 py-14 text-center"
      )}
    >
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl",
          "bg-[#FDF4EB] border border-[#D18A4A]/20",
          "dark:bg-[#D99A5B]/10 dark:border-[#D99A5B]/20"
        )}
      >
        <Sparkles
          className="size-6 text-[#D18A4A] dark:text-[#D99A5B]"
          strokeWidth={2}
        />
      </div>
      <p className="text-[15px] font-bold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
        No images yet
      </p>
      <p className="max-w-[280px] text-[13px] leading-relaxed text-[#8B8478] dark:text-[#B5B0A5]">
        {subtitle}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function RecentCreationsGrid({
  items,
  loading = false,
  error = null,
  onRetry,
  onSelect,
  skeletonCount = 8,
  title = "Recent Creations",
  subtitle = "Your latest AI transformations",
  emptySubtitle = "Describe an idea above and hit Generate to create your first image.",
}: RecentCreationsGridProps) {
  const showSkeleton = loading && items.length === 0;
  const showError = !loading && !!error && items.length === 0;
  const showEmpty = !loading && !error && items.length === 0;

  return (
    <div className="mt-8">
      <SectionHeader
        title={title}
        subtitle={
          showEmpty
            ? "Your latest AI images will appear here"
            : subtitle
        }
        count={items.length}
      />

      {showSkeleton && <SkeletonGrid count={skeletonCount} />}

      {showError && <ErrorState message={error as string} onRetry={onRetry} />}

      {showEmpty && <EmptyState subtitle={emptySubtitle} />}

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                type="button"
                onClick={() => onSelect(item.url)}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-2xl border",
                  "border-[#E5E0D5]",
                  "dark:border-[#4A473F]",
                  "transition-all duration-300",
                  "hover:-translate-y-0.5",
                  "hover:border-[#D18A4A]/50",
                  "hover:shadow-[0_12px_32px_-8px_rgba(217,154,91,0.3)]",
                  "dark:hover:border-[#D99A5B]/50"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.prompt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div
                  className={cn(
                    "absolute left-2 top-2 inline-flex items-center gap-1 rounded-full",
                    "border border-white/15 bg-black/40 px-2 py-0.5 backdrop-blur-md"
                  )}
                >
                  <Sparkles
                    className="size-2.5 text-[#D99A5B]"
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                  <span className="text-[9px] font-bold uppercase tracking-wide text-[#D99A5B]">
                    {item.style}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <p className="line-clamp-2 text-[10.5px] font-semibold leading-tight text-white">
                    {item.prompt}
                  </p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default RecentCreationsGrid;