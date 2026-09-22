// src/components/app/screens/dashboard/mainpage/recenet-creaction.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Image as ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserAction, type CreationItem } from "@/actions/users/get-user-action";

// ============================================
// CONFIG
// ============================================

const CREATIONS_LIMIT = 6;

const FEATURE_LABELS: Record<string, { title: string; subtitle: string }> = {
  HAIRSTYLE: { title: "Hair Makeover", subtitle: "New Style" },
  BEARD: { title: "Beard Styling", subtitle: "New Look" },
  OUTFIT: { title: "Fashion Try-On", subtitle: "New Outfit" },
  AGE: { title: "Age Simulator", subtitle: "Age Preview" },
  HAIRCOLOR: { title: "Hair Color", subtitle: "New Color" },
  IMAGEGEN: { title: "AI Generated", subtitle: "Imagined" },
};

// ============================================
// HELPERS
// ============================================

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getCreationImage(c: CreationItem): string | null {
  if (c.images && c.images.length > 0) return c.images[0];
  if (c.imageUrl) return c.imageUrl;
  return null;
}

function getCreationSubtitle(c: CreationItem): string {
  if (c.feature === "AGE" && c.images?.length > 0) {
    return `${c.images.length} Age${c.images.length > 1 ? "s" : ""}`;
  }
  return FEATURE_LABELS[c.feature]?.subtitle ?? "New Creation";
}

// ============================================
// SKELETON
// ============================================

function RecentCreationsSkeleton() {
  return (
    <section className="w-full px-0 py-6">
      <div className="mb-4 flex items-end justify-between w-full">
        <div className="flex flex-col items-start">
          <div className="h-5 w-40 rounded-md bg-[#E5E0D5] dark:bg-[#33312D] animate-pulse" />
          <div className="mt-2 h-3 w-52 rounded-md bg-[#E5E0D5]/70 dark:bg-[#33312D]/70 animate-pulse" />
        </div>
        <div className="h-3 w-16 rounded-md bg-[#E5E0D5] dark:bg-[#33312D] animate-pulse" />
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-4 w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {Array.from({ length: CREATIONS_LIMIT }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex min-w-[150px] w-[150px] flex-col rounded-[20px] border p-2",
              "border-[#E5E0D5] bg-[#FCFBF7]",
              "dark:border-[#4A473F] dark:bg-[#262421]"
            )}
          >
            <div
              className={cn(
                "h-[180px] w-full rounded-[14px] animate-pulse",
                "bg-[#F7F7F2] dark:bg-[#1A1918]"
              )}
            />
            <div className="mt-3 flex flex-col px-1 pb-1 gap-1.5">
              <div className="h-3 w-20 rounded-md bg-[#E5E0D5] dark:bg-[#33312D] animate-pulse" />
              <div className="h-2.5 w-16 rounded-md bg-[#E5E0D5]/70 dark:bg-[#33312D]/70 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function RecentCreationsEmpty() {
  return (
    <section className="w-full px-0 py-6">
      <div className="mb-4 flex items-end justify-between w-full">
        <div className="flex flex-col items-start">
          <h2 className="text-[20px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
            Recent Creations
          </h2>
          <p className="mt-1 text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
            Your latest AI transformations
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-12",
          "border-[#E5E0D5] dark:border-[#4A473F]"
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-[#D99A5B]/10">
          <Sparkles
            className="size-5 text-[#D18A4A] dark:text-[#D99A5B]"
            strokeWidth={2.25}
          />
        </div>
        <p className="text-[13px] font-bold text-[#2E2A24] dark:text-[#F7F5F0]">
          No creations yet
        </p>
        <p className="max-w-xs text-center text-[11.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
          Try one of our tools below and your creations will appear here.
        </p>
        <Link
          href="/app/age-studio"
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 rounded-full px-4 py-2",
            "bg-gradient-to-r from-[#D99A5B] to-[#B86F32]",
            "text-[11.5px] font-bold text-white",
            "shadow-[0_8px_20px_-4px_rgba(217,154,91,0.5)]",
            "transition-all hover:-translate-y-0.5"
          )}
        >
          Try Age Simulator
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function RecentCreations() {
  const [creations, setCreations] = React.useState<CreationItem[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const result = await getUserAction({ creationsLimit: CREATIONS_LIMIT });
        if (cancelled) return;

        if (result.success && result.creations.length > 0) {
          setCreations(result.creations);
        } else {
          setCreations([]);
        }
      } catch {
        if (!cancelled) setCreations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Loading state
  if (loading) {
    return <RecentCreationsSkeleton />;
  }

  // Empty state
  if (!creations || creations.length === 0) {
    return <RecentCreationsEmpty />;
  }

  // Data state
  return (
    <section className="w-full px-0 py-6 relative group/section">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between w-full">
        <div className="flex flex-col items-start">
          <h2 className="text-[20px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
            Recent Creations
          </h2>
          <p className="mt-1 text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
            Your latest AI transformations
          </p>
        </div>
        <Link
          href="/app/history"
          className="flex items-center gap-1 text-[12px] font-bold text-[#D18A4A] hover:text-[#B86F32] transition-colors dark:text-[#D99A5B]"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal scroll */}
      <div
        className="flex gap-3 overflow-x-auto pb-4 w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {creations.map((item) => {
          const image = getCreationImage(item);
          const label = FEATURE_LABELS[item.feature] ?? {
            title: item.feature,
            subtitle: "Creation",
          };
          const subtitle = getCreationSubtitle(item);

          return (
            <Link
              key={item.id}
              href={`/app/history/${item.id}`}
              className={cn(
                "group relative flex min-w-[150px] w-[150px] flex-col rounded-[20px] border p-2",
                "border-[#E5E0D5] bg-[#FCFBF7] shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
                "transition-all duration-300 hover:-translate-y-0.5",
                "hover:shadow-[0_8px_20px_rgba(217,154,91,0.12)]",
                "dark:border-[#4A473F] dark:bg-[#262421]",
                "dark:hover:shadow-[0_8px_20px_rgba(217,154,91,0.08)]"
              )}
            >
              {/* Image */}
              <div className="relative h-[180px] w-full overflow-hidden rounded-[14px] bg-[#F7F7F2] dark:bg-[#1A1918]">
                {image ? (
                  <Image
                    src={image}
                    alt={label.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="150px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon
                      className="size-8 text-[#8B8478]/40 dark:text-[#B5B0A5]/40"
                      strokeWidth={1.5}
                    />
                  </div>
                )}

                {/* Date pill */}
                <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-1 backdrop-blur-md">
                  <span className="text-[9px] font-bold tracking-wider text-white uppercase">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                {/* Multi-image badge */}
                {item.images && item.images.length > 1 && (
                  <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 backdrop-blur-md">
                    <span className="text-[9px] font-bold tracking-wider text-white">
                      +{item.images.length - 1}
                    </span>
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="mt-3 flex flex-col px-1 pb-1">
                <h3 className="text-[13px] font-bold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
                  {label.title}
                </h3>
                <p className="mt-0.5 text-[10.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
                  {subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}