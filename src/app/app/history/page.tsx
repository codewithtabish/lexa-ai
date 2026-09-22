// src/app/app/history/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  Download,
  RefreshCw,
  Share2,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Scissors,
  Calendar,
  Palette,
  Shirt,
  Wand2,
  User as UserIcon,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { getUserAction, type CreationItem } from "@/actions/users/get-user-action";
import { cn } from "@/lib/utils";

// ============================================
// CONFIG
// ============================================

const CREATIONS_LIMIT = 100;
const INITIAL_VISIBLE = 9;
const LOAD_MORE_STEP = 9;

const FEATURE_FILTERS = [
  { id: "All", label: "All" },
  { id: "AGE", label: "Age" },
  { id: "HAIRSTYLE", label: "Hair" },
  { id: "BEARD", label: "Beard" },
  { id: "OUTFIT", label: "Outfit" },
  { id: "HAIRCOLOR", label: "Color" },
  { id: "IMAGEGEN", label: "AI Gen" },
] as const;

const DATE_FILTERS = ["All Time", "Today", "This Week", "This Month"] as const;

type FeatureFilterId = (typeof FEATURE_FILTERS)[number]["id"];
type DateFilterId = (typeof DATE_FILTERS)[number];

const FEATURE_META: Record<
  string,
  { title: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }
> = {
  HAIRSTYLE: { title: "Hair Makeover", icon: Scissors },
  BEARD: { title: "Beard Styling", icon: UserIcon },
  OUTFIT: { title: "Fashion Try-On", icon: Shirt },
  AGE: { title: "Age Simulator", icon: Calendar },
  HAIRCOLOR: { title: "Hair Color", icon: Palette },
  IMAGEGEN: { title: "AI Generated", icon: Wand2 },
};

// ============================================
// HELPERS — no `new Date()` at module level
// ============================================

function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// 🎯 takes `now` as param — never calls new Date() internally
function formatRelativeDate(date: Date | string, now: number): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (now === 0) return formatShortDate(d); // safe fallback before mount

  const diffMs = now - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatShortDate(d);
}

// 🎯 takes `now` as param
function isInDateFilter(
  date: Date | string,
  filter: DateFilterId,
  now: number
): boolean {
  if (filter === "All Time") return true;
  if (now === 0) return true; // show all until client mounts

  const d = typeof date === "string" ? new Date(date) : date;
  const diffDays = (now - d.getTime()) / (1000 * 60 * 60 * 24);
  if (filter === "Today") return diffDays < 1;
  if (filter === "This Week") return diffDays < 7;
  if (filter === "This Month") return diffDays < 30;
  return true;
}

function getCreationTitle(c: CreationItem): string {
  const meta = FEATURE_META[c.feature];
  if (!meta) return "Creation";
  if (c.prompt) {
    const words = c.prompt.split(" ").slice(0, 4).join(" ");
    return words.length > 40 ? words.slice(0, 37) + "..." : words;
  }
  if (c.feature === "AGE") return "Future You";
  if (c.feature === "HAIRSTYLE") return "New Look";
  return meta.title;
}

function getCreationSubtitle(c: CreationItem): string {
  if (c.feature === "AGE" && Array.isArray(c.metadata?.ages)) {
    const ages: number[] = c.metadata.ages;
    if (ages.length > 0) return `Ages ${ages.join(" · ")}`;
  }
  if (c.metadata?.model) return String(c.metadata.model);
  const meta = FEATURE_META[c.feature];
  return meta ? meta.title : "Creation";
}

function getThumbnails(c: CreationItem): string[] {
  if (c.images && c.images.length > 0) return c.images;
  if (c.imageUrl) return [c.imageUrl];
  return [];
}

async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return true;
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  }
}

// ============================================
// PAGE
// ============================================

export default function HistoryPage() {
  const router = useRouter();

  // 🆕 `now` — set in useEffect, 0 during prerender
  const [now, setNow] = React.useState<number>(0);

  const [creations, setCreations] = React.useState<CreationItem[]>([]);
  const [credits, setCredits] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const [featureFilter, setFeatureFilter] = React.useState<FeatureFilterId>("All");
  const [dateFilter, setDateFilter] = React.useState<DateFilterId>("All Time");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_VISIBLE);

  // 🆕 Set `now` after mount — fixes prerender error
  React.useEffect(() => {
    setNow(Date.now());
  }, []);

  // ─── Fetch ───
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const result = await getUserAction({ creationsLimit: CREATIONS_LIMIT });
        if (cancelled) return;
        if (result.success) {
          setCredits(result.user.credits);
          setCreations(result.creations);
        } else {
          setFetchError(result.error);
          setCreations([]);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[History] fetch failed:", err);
          setFetchError("Failed to load your creations.");
          setCreations([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Derived ───
  const featureCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    creations.forEach((c) => {
      counts[c.feature] = (counts[c.feature] ?? 0) + 1;
    });
    return counts;
  }, [creations]);

  const filtered = React.useMemo(() => {
    return creations.filter((c) => {
      if (featureFilter !== "All" && c.feature !== featureFilter) return false;
      if (!isInDateFilter(c.createdAt, dateFilter, now)) return false;
      return true;
    });
  }, [creations, featureFilter, dateFilter, now]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const featuresUsedCount = Object.keys(featureCounts).length;

  React.useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [featureFilter, dateFilter]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* ══════════ TOP BAR ══════════ */}
      <TopBar
        credits={credits}
        loading={loading}
        onBack={() => router.push("/app")}
      />

      {/* ══════════ HERO ══════════ */}
      <HeroHeader
        now={now}
        creationCount={creations.length}
        featuresUsed={featuresUsedCount}
      />

      {/* ══════════ FILTER BAR ══════════ */}
      <FilterBar
        featureFilter={featureFilter}
        setFeatureFilter={setFeatureFilter}
        featureCounts={featureCounts}
        totalCount={creations.length}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* ══════════ CONTENT ══════════ */}
      <div className="mx-auto w-full max-w-6xl pb-16">
        {loading ? (
          <GridSkeleton />
        ) : fetchError ? (
          <ErrorState message={fetchError} />
        ) : filtered.length === 0 ? (
          <EmptyState
            isFiltered={featureFilter !== "All" || dateFilter !== "All Time"}
            onExplore={() => router.push("/app")}
            onReset={() => {
              setFeatureFilter("All");
              setDateFilter("All Time");
            }}
          />
        ) : viewMode === "grid" ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((c, i) => (
                <CreationCard key={c.id} creation={c} index={i} />
              ))}

              {filtered.length < 12 && (
                <CreateNewCard onClick={() => router.push("/app")} />
              )}
            </div>

            {hasMore && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + LOAD_MORE_STEP)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-5 py-3",
                    "border-[#D18A4A]/50 bg-[#FCFBF7] text-[#D18A4A]",
                    "dark:border-[#D99A5B]/50 dark:bg-[#262421] dark:text-[#D99A5B]",
                    "text-[12.5px] font-bold tracking-tight",
                    "transition-all duration-300",
                    "hover:bg-[#FDF4EB] hover:-translate-y-0.5",
                    "dark:hover:bg-[#33312D]"
                  )}
                >
                  Load More ({visible.length} of {filtered.length})
                  <ChevronDown className="size-3.5" strokeWidth={2.5} />
                </button>
                <p className="text-[11px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
                  Showing {visible.length} of {filtered.length} creations
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-2.5">
            {visible.map((c, i) => (
              <CreationListRow key={c.id} creation={c} index={i} now={now} />
            ))}
            {hasMore && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + LOAD_MORE_STEP)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-5 py-3",
                    "border-[#D18A4A]/50 bg-[#FCFBF7] text-[#D18A4A]",
                    "dark:border-[#D99A5B]/50 dark:bg-[#262421] dark:text-[#D99A5B]",
                    "text-[12.5px] font-bold tracking-tight",
                    "transition-all hover:bg-[#FDF4EB] dark:hover:bg-[#33312D]"
                  )}
                >
                  Load More
                  <ChevronDown className="size-3.5" strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════ TRUST STRIP ══════════ */}
      <TrustStrip />
    </div>
  );
}

// ============================================
// TOP BAR
// ============================================

function TopBar({
  credits,
  loading,
  onBack,
}: {
  credits: number | null;
  loading: boolean;
  onBack: () => void;
}) {
  const showSkeleton = loading || credits === null;
  const creditsToShow = credits ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mx-auto flex w-full max-w-6xl items-center justify-between",
        "px-1 pt-3 sm:pt-4"
      )}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className={cn(
          "group inline-flex items-center gap-2 rounded-full border",
          "border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-sm",
          "dark:border-[#4A473F] dark:bg-[#262421]/80",
          "px-3.5 py-2 sm:px-4 sm:py-2.5",
          "text-[13px] font-bold tracking-tight sm:text-[14px]",
          "text-[#2E2A24] dark:text-[#F7F5F0]",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
          "transition-all duration-300",
          "hover:-translate-y-0.5 hover:border-[#D18A4A]/50 hover:bg-[#FDF4EB]",
          "dark:hover:border-[#D99A5B]/50 dark:hover:bg-[#33312D]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F7F2] dark:focus-visible:ring-offset-[#2B2B28]"
        )}
      >
        <ArrowLeft
          className="size-4 transition-transform duration-300 text-[#D18A4A] dark:text-[#D99A5B] group-hover:-translate-x-0.5 sm:size-[18px]"
          strokeWidth={2.5}
        />
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden">Back</span>
      </button>

      <div className="hidden items-baseline gap-2 sm:flex">
        <span className="text-[15px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
          LEXA
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8B8478] dark:text-[#B5B0A5]">
          History
        </span>
      </div>

      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full",
          "bg-gradient-to-r from-[#D99A5B]/15 to-[#B86F32]/10",
          "border border-[#D18A4A]/30",
          "dark:from-[#D99A5B]/20 dark:to-[#B86F32]/15 dark:border-[#D99A5B]/40",
          "px-3 py-1.5 sm:px-3.5 sm:py-2"
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
          <motion.span
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block h-3.5 w-6 rounded-full bg-gradient-to-r from-[#D99A5B]/20 via-[#D99A5B]/40 to-[#D99A5B]/20"
          />
        ) : (
          <span className="text-[12px] font-bold text-[#D18A4A] dark:text-[#D99A5B] sm:text-[13px]">
            {creditsToShow}
          </span>
        )}
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8B8478] dark:text-[#B5B0A5] sm:text-[11px]">
          credits
        </span>
      </div>
    </motion.div>
  );
}

// ============================================
// HERO HEADER
// ============================================

function HeroHeader({
  now,
  creationCount,
  featuresUsed,
}: {
  now: number;
  creationCount: number;
  featuresUsed: number;
}) {
  // 🎯 Compute date from `now` — safe because now=0 during prerender
  const dateLabel =
    now > 0
      ? new Date(now).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "";

  return (
    <div className="relative mx-auto w-full max-w-6xl pt-6 sm:pt-8">
      <div className="relative grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative z-10">
          <div
            className={cn(
              "mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1",
              "border-[#D18A4A]/40 bg-[#D99A5B]/5"
            )}
          >
            <Sparkles
              className="size-3 text-[#D18A4A] dark:text-[#D99A5B]"
              strokeWidth={2.5}
              fill="currentColor"
            />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#D18A4A] dark:text-[#D99A5B]">
              All Creations
            </span>
          </div>

          <h1 className="text-[40px] font-extrabold leading-[1.05] tracking-tight text-[#2E2A24] dark:text-[#F7F5F0] sm:text-[52px] md:text-[60px]">
            Your Creative
            <br />
            <span className="bg-gradient-to-r from-[#D99A5B] to-[#B86F32] bg-clip-text text-transparent">
              Journey
            </span>
          </h1>

          <p className="mt-4 max-w-md text-[14px] font-medium leading-relaxed text-[#8B8478] dark:text-[#B5B0A5] sm:text-[15px]">
            Every transformation you've ever made.
            <br />
            Revisit, re-download, or start fresh.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <StatPill
              icon={<Sparkles className="size-3" strokeWidth={2.5} fill="currentColor" />}
              label={`${creationCount} Creation${creationCount !== 1 ? "s" : ""}`}
            />
            <StatPill
              icon={<Zap className="size-3" strokeWidth={2.5} fill="currentColor" />}
              label={`${featuresUsed} Feature${featuresUsed !== 1 ? "s" : ""} Used`}
            />
            {/* 🎯 Only render when `now` is ready */}
            {dateLabel && (
              <StatPill
                icon={<Calendar className="size-3" strokeWidth={2.5} />}
                label={dateLabel}
              />
            )}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 mx-auto h-full w-[85%] rounded-full bg-[#D99A5B]/25 blur-3xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/about/hero-orb.png"
            alt=""
            className="mx-auto h-auto w-full max-w-[520px] select-none object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5",
        "border-[#E5E0D5] bg-[#FCFBF7]",
        "dark:border-[#4A473F] dark:bg-[#262421]",
        "text-[11.5px] font-bold tracking-tight",
        "text-[#2E2A24] dark:text-[#F7F5F0]"
      )}
    >
      <span className="text-[#D18A4A] dark:text-[#D99A5B]">{icon}</span>
      {label}
    </div>
  );
}

// ============================================
// FILTER BAR
// ============================================

function FilterBar({
  featureFilter,
  setFeatureFilter,
  featureCounts,
  totalCount,
  dateFilter,
  setDateFilter,
  viewMode,
  setViewMode,
}: {
  featureFilter: FeatureFilterId;
  setFeatureFilter: (f: FeatureFilterId) => void;
  featureCounts: Record<string, number>;
  totalCount: number;
  dateFilter: DateFilterId;
  setDateFilter: (f: DateFilterId) => void;
  viewMode: "grid" | "list";
  setViewMode: (v: "grid" | "list") => void;
}) {
  return (
    <div className="mx-auto mt-6 w-full max-w-6xl sm:mt-8">
      <div
        className={cn(
          "flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4",
          "border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-xl",
          "dark:border-[#4A473F] dark:bg-[#262421]/80"
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="hidden text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#8B8478] dark:text-[#B5B0A5] sm:inline">
            Feature
          </span>
          {FEATURE_FILTERS.map((f) => {
            const active = featureFilter === f.id;
            const count =
              f.id === "All" ? totalCount : featureCounts[f.id] ?? 0;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFeatureFilter(f.id)}
                disabled={count === 0 && f.id !== "All"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5",
                  "text-[11.5px] font-bold tracking-tight transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
                  active
                    ? [
                        "bg-gradient-to-r from-[#D99A5B] to-[#B86F32] text-white",
                        "shadow-[0_6px_16px_-4px_rgba(217,154,91,0.55)]",
                      ]
                    : [
                        "bg-[#F7F7F2] text-[#8B8478]",
                        "dark:bg-[#1A1918] dark:text-[#B5B0A5]",
                        "hover:bg-[#FDF4EB] hover:text-[#2E2A24]",
                        "dark:hover:bg-[#33312D] dark:hover:text-[#F7F5F0]",
                        count === 0 &&
                          "cursor-not-allowed opacity-40 hover:bg-[#F7F7F2] dark:hover:bg-[#1A1918]",
                      ]
                )}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "text-[10px] font-extrabold opacity-70",
                      active && "opacity-90"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="h-px w-full bg-[#E5E0D5] dark:bg-[#4A473F] sm:h-6 sm:w-px" />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="hidden text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#8B8478] dark:text-[#B5B0A5] sm:inline">
            Date
          </span>
          {DATE_FILTERS.map((f) => {
            const active = dateFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setDateFilter(f)}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-[11.5px] font-bold tracking-tight",
                  "transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
                  active
                    ? "bg-[#D99A5B]/15 text-[#D18A4A] ring-1 ring-[#D18A4A]/40 dark:text-[#D99A5B]"
                    : "bg-[#F7F7F2] text-[#8B8478] hover:bg-[#FDF4EB] hover:text-[#2E2A24] dark:bg-[#1A1918] dark:text-[#B5B0A5] dark:hover:bg-[#33312D] dark:hover:text-[#F7F5F0]"
                )}
              >
                {f}
              </button>
            );
          })}
        </div>

        <div className="hidden h-6 w-px bg-[#E5E0D5] dark:bg-[#4A473F] sm:block" />

        <div className="flex items-center gap-1 sm:ml-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
              viewMode === "grid"
                ? "bg-[#D99A5B]/15 text-[#D18A4A] ring-1 ring-[#D18A4A]/40 dark:text-[#D99A5B]"
                : "text-[#8B8478] hover:bg-[#F7F7F2] dark:text-[#B5B0A5] dark:hover:bg-[#33312D]"
            )}
          >
            <LayoutGrid className="size-4" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
              viewMode === "list"
                ? "bg-[#D99A5B]/15 text-[#D18A4A] ring-1 ring-[#D18A4A]/40 dark:text-[#D99A5B]"
                : "text-[#8B8478] hover:bg-[#F7F7F2] dark:text-[#B5B0A5] dark:hover:bg-[#33312D]"
            )}
          >
            <ListIcon className="size-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CREATION CARD — GRID
// ============================================

function CreationCard({
  creation,
  index,
}: {
  creation: CreationItem;
  index: number;
}) {
  const [downloading, setDownloading] = React.useState(false);
  const thumbnails = getThumbnails(creation);
  const meta = FEATURE_META[creation.feature];
  const Icon = meta?.icon ?? Sparkles;
  const title = getCreationTitle(creation);
  const subtitle = getCreationSubtitle(creation);
  const isMulti = thumbnails.length > 1;
  const isFailed = creation.status === "FAILED";
  const isProcessing = creation.status === "PROCESSING";

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (thumbnails.length === 0) return;
    setDownloading(true);
    const ext = thumbnails[0].match(/\.(png|jpg|jpeg|webp)(\?|$)/i)?.[1] || "png";
    await downloadImage(
      thumbnails[0],
      `lexa-${creation.feature.toLowerCase()}-${Date.now()}.${ext}`
    );
    setDownloading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border p-2.5",
        "border-[#E5E0D5] bg-[#FCFBF7] shadow-[0_2px_12px_rgba(0,0,0,0.03)]",
        "dark:border-[#4A473F] dark:bg-[#262421]",
        "transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-[#D18A4A]/50",
        "hover:shadow-[0_12px_32px_-8px_rgba(217,154,91,0.25)]",
        "dark:hover:border-[#D99A5B]/50",
        "dark:hover:shadow-[0_12px_32px_-8px_rgba(217,154,91,0.15)]"
      )}
    >
      <div className="flex items-center justify-between px-1.5 pt-1 pb-2">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
            "border-[#D18A4A]/30 bg-[#D99A5B]/10"
          )}
        >
          <Icon className="size-3 text-[#D18A4A] dark:text-[#D99A5B]" strokeWidth={2.5} />
          <span className="text-[10px] font-extrabold tracking-tight text-[#D18A4A] dark:text-[#D99A5B]">
            {meta?.title ?? creation.feature}
          </span>
        </div>
        <span className="text-[10.5px] font-semibold text-[#8B8478] dark:text-[#B5B0A5]">
          {formatShortDate(creation.createdAt)}
        </span>
      </div>

      <div
        className={cn(
          "relative aspect-[4/5] w-full overflow-hidden rounded-2xl",
          "bg-gradient-to-br from-[#FDF4EB] via-[#F7F7F2] to-[#FDF4EB]",
          "dark:from-[#33312D] dark:via-[#2A2825] dark:to-[#33312D]"
        )}
      >
        {isFailed ? (
          <FailedOverlay />
        ) : isProcessing ? (
          <ProcessingOverlay />
        ) : isMulti ? (
          <MultiImageGrid thumbnails={thumbnails} />
        ) : thumbnails[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnails[0]}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="size-10 text-[#8B8478]/40 dark:text-[#B5B0A5]/40" strokeWidth={1.5} />
          </div>
        )}

        {isMulti && thumbnails.length > 4 && (
          <div className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 backdrop-blur-md">
            <span className="text-[9.5px] font-extrabold text-white">
              +{thumbnails.length - 4} more
            </span>
          </div>
        )}

        {!isFailed && !isProcessing && thumbnails.length > 0 && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            aria-label="Download"
            className={cn(
              "absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-full",
              "bg-black/60 text-white backdrop-blur-md",
              "opacity-0 transition-all duration-200 group-hover:opacity-100",
              "hover:bg-black/80 hover:scale-105",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              isMulti && thumbnails.length > 4 && "hidden"
            )}
          >
            {downloading ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
            ) : (
              <Download className="size-3.5" strokeWidth={2.5} />
            )}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1 px-1.5 pt-3">
        <h3 className="truncate text-[13.5px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
          {title}
        </h3>
        <p className="truncate text-[11px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
          {subtitle}
        </p>

        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold">
          {creation.creditsUsed > 0 && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
                "bg-[#D99A5B]/15 text-[#D18A4A] dark:text-[#D99A5B]"
              )}
            >
              <Zap className="size-2.5" strokeWidth={3} fill="currentColor" />
              {creation.creditsUsed}
            </span>
          )}
          <span className="text-[#8B8478] dark:text-[#B5B0A5]">·</span>
          <span className="text-[#8B8478] dark:text-[#B5B0A5]">
            {creation.status === "COMPLETED"
              ? "Ready"
              : creation.status === "FAILED"
                ? "Failed"
                : "Processing"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 px-0.5 pb-0.5">
        <ActionButton
          icon={<Download className="size-3.5" strokeWidth={2.5} />}
          label="Save"
          onClick={handleDownload}
          disabled={thumbnails.length === 0}
        />
        <ActionButton
          icon={<RefreshCw className="size-3.5" strokeWidth={2.5} />}
          label="Redo"
        />
        <ActionButton
          icon={<Share2 className="size-3.5" strokeWidth={2.5} />}
          label="Share"
        />
        <ActionButton
          icon={<Trash2 className="size-3.5" strokeWidth={2.5} />}
          label="Delete"
          danger
        />
      </div>
    </motion.div>
  );
}

// ============================================
// MULTI IMAGE GRID
// ============================================

function MultiImageGrid({ thumbnails }: { thumbnails: string[] }) {
  const shown = thumbnails.slice(0, 4);
  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
      {shown.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={url}
          alt={`Age result ${i + 1}`}
          className="h-full w-full object-cover"
          draggable={false}
          loading="lazy"
        />
      ))}
    </div>
  );
}

// ============================================
// OVERLAYS
// ============================================

function FailedOverlay() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
      <div className="flex size-12 items-center justify-center rounded-full bg-[#E8B4B8]/15">
        <AlertCircle className="size-5 text-[#E8B4B8]" strokeWidth={2.25} />
      </div>
      <p className="text-[11px] font-bold text-[#8B8478] dark:text-[#B5B0A5]">
        Generation failed
      </p>
      <p className="text-[10px] font-medium text-[#8B8478]/70 dark:text-[#B5B0A5]/70">
        Credits refunded
      </p>
    </div>
  );
}

function ProcessingOverlay() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
      <Loader2 className="size-8 animate-spin text-[#D18A4A] dark:text-[#D99A5B]" strokeWidth={2} />
      <p className="text-[11px] font-bold text-[#8B8478] dark:text-[#B5B0A5]">
        Processing...
      </p>
    </div>
  );
}

// ============================================
// ACTION BUTTON
// ============================================

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1.5",
        "text-[10.5px] font-bold tracking-tight transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
        danger
          ? [
              "text-[#C97A7A] hover:bg-[#E8B4B8]/10",
              "dark:text-[#E8B4B8] dark:hover:bg-[#E8B4B8]/10",
            ]
          : [
              "text-[#8B8478] hover:bg-[#F7F7F2] hover:text-[#2E2A24]",
              "dark:text-[#B5B0A5] dark:hover:bg-[#33312D] dark:hover:text-[#F7F5F0]",
            ],
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent dark:hover:bg-transparent"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ============================================
// CREATION LIST ROW
// ============================================

function CreationListRow({
  creation,
  index,
  now,
}: {
  creation: CreationItem;
  index: number;
  now: number;
}) {
  const thumbnails = getThumbnails(creation);
  const meta = FEATURE_META[creation.feature];
  const Icon = meta?.icon ?? Sparkles;
  const title = getCreationTitle(creation);
  const subtitle = getCreationSubtitle(creation);
  const isMulti = thumbnails.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border p-2.5 sm:gap-4 sm:p-3",
        "border-[#E5E0D5] bg-[#FCFBF7]",
        "dark:border-[#4A473F] dark:bg-[#262421]",
        "transition-all duration-200",
        "hover:border-[#D18A4A]/50 dark:hover:border-[#D99A5B]/50"
      )}
    >
      <div
        className={cn(
          "relative size-16 shrink-0 overflow-hidden rounded-xl sm:size-20",
          "bg-gradient-to-br from-[#FDF4EB] to-[#F7F7F2]",
          "dark:from-[#33312D] dark:to-[#2A2825]"
        )}
      >
        {thumbnails[0] ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnails[0]}
              alt={title}
              className="h-full w-full object-cover"
              draggable={false}
              loading="lazy"
            />
            {isMulti && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-black/60 py-0.5">
                <Layers className="size-2.5 text-white" strokeWidth={2.5} />
                <span className="text-[8.5px] font-extrabold text-white">
                  {thumbnails.length}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="size-5 text-[#8B8478]/40 dark:text-[#B5B0A5]/40" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Icon className="size-3 shrink-0 text-[#D18A4A] dark:text-[#D99A5B]" strokeWidth={2.5} />
          <span className="truncate text-[10px] font-extrabold uppercase tracking-wide text-[#D18A4A] dark:text-[#D99A5B]">
            {meta?.title ?? creation.feature}
          </span>
        </div>
        <h3 className="mt-0.5 truncate text-[13px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
          {title}
        </h3>
        <p className="truncate text-[10.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
          {subtitle}
        </p>
      </div>

      <div className="hidden items-center gap-3 shrink-0 sm:flex">
        <span className="text-[11px] font-semibold text-[#8B8478] dark:text-[#B5B0A5]">
          {formatRelativeDate(creation.createdAt, now)}
        </span>
        {creation.creditsUsed > 0 && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
              "bg-[#D99A5B]/15 text-[10.5px] font-bold text-[#D18A4A] dark:text-[#D99A5B]"
            )}
          >
            <Zap className="size-2.5" strokeWidth={3} fill="currentColor" />
            {creation.creditsUsed}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <IconAction icon={<Download className="size-3.5" strokeWidth={2.5} />} label="Download" />
        <IconAction icon={<Share2 className="size-3.5" strokeWidth={2.5} />} label="Share" />
        <IconAction
          icon={<Trash2 className="size-3.5" strokeWidth={2.5} />}
          label="Delete"
          danger
        />
      </div>
    </motion.div>
  );
}

function IconAction({
  icon,
  label,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-full transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
        danger
          ? "text-[#C97A7A] hover:bg-[#E8B4B8]/15 dark:text-[#E8B4B8]"
          : "text-[#8B8478] hover:bg-[#F7F7F2] hover:text-[#2E2A24] dark:text-[#B5B0A5] dark:hover:bg-[#33312D] dark:hover:text-[#F7F5F0]"
      )}
    >
      {icon}
    </button>
  );
}

// ============================================
// CREATE NEW CARD
// ============================================

function CreateNewCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "group flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-6",
        "border-[#D18A4A]/30 bg-[#FCFBF7]/50",
        "dark:border-[#D99A5B]/30 dark:bg-[#262421]/50",
        "min-h-[280px]",
        "transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-[#D18A4A]/60 hover:bg-[#FDF4EB]/60",
        "dark:hover:border-[#D99A5B]/60 dark:hover:bg-[#33312D]/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]"
      )}
    >
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-full",
          "bg-gradient-to-br from-[#D99A5B] to-[#B86F32]",
          "shadow-[0_12px_32px_-8px_rgba(217,154,91,0.55)]",
          "transition-transform duration-300 group-hover:scale-110"
        )}
      >
        <Sparkles className="size-6 text-white" strokeWidth={2.25} fill="currentColor" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
          Create something new
        </p>
        <p className="mt-1 text-[11.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
          Pick a tool and start transforming
        </p>
      </div>
      <span
        className={cn(
          "mt-1 inline-flex items-center gap-1.5 rounded-full px-4 py-2",
          "bg-gradient-to-r from-[#D99A5B] to-[#B86F32]",
          "text-[11.5px] font-bold tracking-tight text-white",
          "shadow-[0_8px_20px_-4px_rgba(217,154,91,0.5)]"
        )}
      >
        Explore Tools
        <ArrowRight className="size-3.5" strokeWidth={2.5} />
      </span>
    </motion.button>
  );
}

// ============================================
// SKELETON
// ============================================

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col overflow-hidden rounded-3xl border p-2.5",
            "border-[#E5E0D5] bg-[#FCFBF7]",
            "dark:border-[#4A473F] dark:bg-[#262421]"
          )}
        >
          <div className="flex items-center justify-between px-1.5 pt-1 pb-2">
            <div className="h-4 w-24 animate-pulse rounded-full bg-[#E5E0D5] dark:bg-[#33312D]" />
            <div className="h-3 w-12 animate-pulse rounded-full bg-[#E5E0D5]/70 dark:bg-[#33312D]/70" />
          </div>
          <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-[#F7F7F2] dark:bg-[#1A1918]" />
          <div className="mt-3 flex flex-col gap-1.5 px-1.5">
            <div className="h-3.5 w-2/3 animate-pulse rounded-md bg-[#E5E0D5] dark:bg-[#33312D]" />
            <div className="h-3 w-1/2 animate-pulse rounded-md bg-[#E5E0D5]/70 dark:bg-[#33312D]/70" />
          </div>
          <div className="mt-3 flex gap-1 px-0.5">
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="h-7 flex-1 animate-pulse rounded-full bg-[#E5E0D5]/50 dark:bg-[#33312D]/50"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({
  isFiltered,
  onExplore,
  onReset,
}: {
  isFiltered: boolean;
  onExplore: () => void;
  onReset: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed py-16",
        "border-[#E5E0D5] dark:border-[#4A473F]"
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-[#D99A5B]/10">
        <Sparkles
          className="size-7 text-[#D18A4A] dark:text-[#D99A5B]"
          strokeWidth={2}
        />
      </div>
      <div className="max-w-sm text-center">
        <p className="text-[16px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
          {isFiltered ? "No creations match" : "No creations yet"}
        </p>
        <p className="mt-1.5 text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
          {isFiltered
            ? "Try changing filters or start fresh with a new creation."
            : "Your AI transformations will appear here once you start creating."}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className={cn(
              "rounded-full border px-4 py-2 text-[11.5px] font-bold tracking-tight",
              "border-[#E5E0D5] text-[#2E2A24] hover:bg-[#F7F7F2]",
              "dark:border-[#4A473F] dark:text-[#F7F5F0] dark:hover:bg-[#33312D]"
            )}
          >
            Clear filters
          </button>
        )}
        <button
          type="button"
          onClick={onExplore}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2",
            "bg-gradient-to-r from-[#D99A5B] to-[#B86F32]",
            "text-[11.5px] font-bold tracking-tight text-white",
            "shadow-[0_8px_20px_-4px_rgba(217,154,91,0.5)]",
            "transition-all hover:-translate-y-0.5"
          )}
        >
          Explore Tools
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ============================================
// ERROR STATE
// ============================================

function ErrorState({ message }: { message: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed py-16",
        "border-[#E8B4B8]/40 bg-[#E8B4B8]/5"
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-[#E8B4B8]/15">
        <AlertCircle className="size-6 text-[#E8B4B8]" strokeWidth={2.25} />
      </div>
      <p className="text-[14px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
        Couldn't load your creations
      </p>
      <p className="max-w-xs text-center text-[11.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
        {message}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className={cn(
          "mt-2 inline-flex items-center gap-1.5 rounded-full px-4 py-2",
          "bg-gradient-to-r from-[#D99A5B] to-[#B86F32]",
          "text-[11.5px] font-bold tracking-tight text-white"
        )}
      >
        <RefreshCw className="size-3.5" strokeWidth={2.5} />
        Try again
      </button>
    </div>
  );
}

// ============================================
// TRUST STRIP
// ============================================

function TrustStrip() {
  const items = [
    { icon: Sparkles, title: "Unlimited Looks", sub: "Explore every decade" },
    { icon: Zap, title: "Instant Results", sub: "Ready in ~30 seconds" },
    { icon: CheckCircle2, title: "Premium Quality", sub: "Lifelike aging detail" },
    { icon: UserIcon, title: "For Everyone", sub: "Private & secure" },
  ];

  return (
    <div className="mt-auto border-t border-[#E5E0D5]/60 dark:border-[#4A473F]/60">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 py-6 sm:grid-cols-4">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#D99A5B]/10 text-[#D18A4A] dark:text-[#D99A5B]">
                <Icon className="size-4" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
                  {item.title}
                </p>
                <p className="truncate text-[10.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
                  {item.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}