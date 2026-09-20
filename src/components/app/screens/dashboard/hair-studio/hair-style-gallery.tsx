// src/components/app/screens/hair-studio/hair-style-gallery.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, List, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { HairStyleImage } from "./hair-style-image";
import { HairTemplate } from "@/data/hair-templetes";

// ============================================
// TYPES
// ============================================

interface HairStyleGalleryProps {
  templates: HairTemplate[];
  selectedId: string | null;
  onSelect: (template: HairTemplate) => void;
}

type ViewMode = "grid" | "list";
type GenderFilter = "all" | "male" | "female";

// ============================================
// TAB CONFIG
// ============================================

const CATEGORY_TABS = [
  { id: "all", label: "All" },
  { id: "short", label: "Short" },
  { id: "medium", label: "Medium" },
  { id: "long", label: "Long" },
] as const;

type CategoryTabId = (typeof CATEGORY_TABS)[number]["id"];

// ============================================
// GENDER ICONS (custom SVG)
// ============================================

function AllGenderIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8.5" cy="12" r="4.5" />
      <circle cx="15.5" cy="12" r="4.5" />
    </svg>
  );
}

function MaleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="10" cy="14" r="5.5" />
      <path d="M14 10l5.5-5.5" />
      <path d="M14.5 4.5h5v5" />
    </svg>
  );
}

function FemaleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="9" r="5.5" />
      <path d="M12 14.5v6" />
      <path d="M9 18h6" />
    </svg>
  );
}

// ============================================
// GENDER OPTIONS
// ============================================

const GENDER_OPTIONS: {
  id: GenderFilter;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "all", label: "All", Icon: AllGenderIcon },
  { id: "male", label: "Male", Icon: MaleIcon },
  { id: "female", label: "Female", Icon: FemaleIcon },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function HairStyleGallery({
  templates,
  selectedId,
  onSelect,
}: HairStyleGalleryProps) {
  const [activeTab, setActiveTab] = React.useState<CategoryTabId>("all");
  const [genderFilter, setGenderFilter] = React.useState<GenderFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");

  // ─── Filter logic ──────────────────────────
  const filteredTemplates = React.useMemo(() => {
    return templates.filter((t) => {
      const matchesTab =
        activeTab === "all" || t.styleCategory === activeTab;

      const matchesGender =
        genderFilter === "all" || t.category === genderFilter;

      const matchesSearch =
        searchQuery.trim() === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesGender && matchesSearch;
    });
  }, [templates, activeTab, genderFilter, searchQuery]);

  return (
    <section className="flex w-full flex-col gap-5">
      {/* ═══════════════════════════════════════════
          TOP ROW — Tabs + Gender + Search + View
          ═══════════════════════════════════════════ */}
      <div className="flex flex-col gap-3">
        {/* Row 1 — Category tabs + Gender filter */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Category tabs */}
          <div
            className={cn(
              "flex flex-wrap items-center gap-1.5",
              "rounded-2xl border p-1.5 sm:rounded-full",
              "border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-sm",
              "dark:border-[#4A473F] dark:bg-[#262421]/80",
              "w-full sm:w-fit"
            )}
          >
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative shrink-0 rounded-full px-4 py-2",
                    "text-[12.5px] font-semibold tracking-tight",
                    "transition-all duration-300 whitespace-nowrap",
                    "flex-1 sm:flex-initial",
                    isActive
                      ? "text-white"
                      : "text-[#8B8478] hover:text-[#2E2A24] dark:text-[#B5B0A5] dark:hover:text-[#F7F5F0]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="hair-gallery-tab"
                      className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r from-[#D99A5B] to-[#B86F32]",
                        "shadow-[0_4px_12px_rgba(217,154,91,0.3)]"
                      )}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Gender filter — segmented control with icons */}
          <div
            className={cn(
              "flex items-center gap-0.5 rounded-full p-0.5",
              "border border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-sm",
              "dark:border-[#4A473F] dark:bg-[#262421]/80",
              "w-fit self-start sm:self-auto"
            )}
          >
            {GENDER_OPTIONS.map(({ id, label, Icon }) => {
              const isActive = genderFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGenderFilter(id)}
                  aria-label={`Filter: ${label}`}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-3 py-2",
                    "text-[12px] font-semibold tracking-tight",
                    "transition-colors duration-300 whitespace-nowrap",
                    isActive
                      ? "text-white"
                      : "text-[#8B8478] hover:text-[#2E2A24] dark:text-[#B5B0A5] dark:hover:text-[#F7F5F0]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="hair-gallery-gender"
                      className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r from-[#D99A5B] to-[#B86F32]",
                        "shadow-[0_4px_12px_rgba(217,154,91,0.3)]"
                      )}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon className="relative z-10 size-3.5" />
                  <span className="relative z-10 hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2 — Search + View toggle */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div
            className={cn(
              "relative flex-1",
              "rounded-full border border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-sm",
              "dark:border-[#4A473F] dark:bg-[#262421]/80"
            )}
          >
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-[#8B8478] dark:text-[#B5B0A5]"
              strokeWidth={2.5}
            />
            <input
              type="text"
              placeholder="Search hairstyles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full bg-transparent py-2.5 pl-10 pr-4",
                "text-[13px] font-medium tracking-tight",
                "text-[#2E2A24] placeholder:text-[#8B8478]",
                "dark:text-[#F7F5F0] dark:placeholder:text-[#B5B0A5]",
                "outline-none"
              )}
            />
          </div>

          {/* View toggle */}
          <div
            className={cn(
              "flex shrink-0 items-center gap-0.5 rounded-full",
              "border border-[#E5E0D5] bg-[#FCFBF7]/80 p-0.5 backdrop-blur-sm",
              "dark:border-[#4A473F] dark:bg-[#262421]/80"
            )}
          >
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-all duration-200",
                viewMode === "grid"
                  ? "bg-gradient-to-br from-[#D99A5B] to-[#B86F32] text-white shadow-sm"
                  : "text-[#8B8478] hover:text-[#2E2A24] dark:text-[#B5B0A5] dark:hover:text-[#F7F5F0]"
              )}
            >
              <LayoutGrid className="size-3.5" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-all duration-200",
                viewMode === "list"
                  ? "bg-gradient-to-br from-[#D99A5B] to-[#B86F32] text-white shadow-sm"
                  : "text-[#8B8478] hover:text-[#2E2A24] dark:text-[#B5B0A5] dark:hover:text-[#F7F5F0]"
              )}
            >
              <List className="size-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          COUNT ROW
          ═══════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.15em]",
            "text-[#8B8478] dark:text-[#B5B0A5]"
          )}
        >
          {filteredTemplates.length}{" "}
          {filteredTemplates.length === 1 ? "style" : "styles"} available
        </p>

        {selectedId && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1",
              "bg-[#FDF4EB] dark:bg-[#33312D]",
              "border border-[#D18A4A]/30 dark:border-[#D99A5B]/40"
            )}
          >
            <Check
              className="size-3 text-[#D18A4A] dark:text-[#D99A5B]"
              strokeWidth={3}
            />
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wide",
                "text-[#D18A4A] dark:text-[#D99A5B]"
              )}
            >
              Selected
            </span>
          </motion.div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          EMPTY STATE
          ═══════════════════════════════════════════ */}
      {filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex flex-col items-center justify-center gap-3",
            "rounded-3xl border border-dashed border-[#E5E0D5]",
            "dark:border-[#4A473F]",
            "px-6 py-16 text-center"
          )}
        >
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl",
              "bg-[#FDF4EB] text-[#D18A4A]",
              "dark:bg-[#33312D] dark:text-[#D99A5B]"
            )}
          >
            <Sparkles className="size-6" strokeWidth={2} />
          </div>
          <p
            className={cn(
              "text-[15px] font-bold tracking-tight",
              "text-[#2E2A24] dark:text-[#F7F5F0]"
            )}
          >
            No styles found
          </p>
          <p
            className={cn(
              "max-w-[280px] text-[13px] leading-relaxed",
              "text-[#8B8478] dark:text-[#B5B0A5]"
            )}
          >
            Try a different category, gender, or clear your search.
          </p>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════
          GRID VIEW
          ═══════════════════════════════════════════ */}
      {viewMode === "grid" && filteredTemplates.length > 0 && (
        <div
          className={cn(
            "grid gap-4 sm:gap-5",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => (
              <HairStyleGridCard
                key={template.id}
                template={template}
                isSelected={selectedId === template.id}
                onSelect={() => onSelect(template)}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          LIST VIEW
          ═══════════════════════════════════════════ */}
      {viewMode === "list" && filteredTemplates.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => (
              <HairStyleListCard
                key={template.id}
                template={template}
                isSelected={selectedId === template.id}
                onSelect={() => onSelect(template)}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════
// GRID CARD
// ═══════════════════════════════════════════

function HairStyleGridCard({
  template,
  isSelected,
  onSelect,
  index,
}: {
  template: HairTemplate;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const subtitle = template.styleCategory
    ? template.styleCategory.charAt(0).toUpperCase() + template.styleCategory.slice(1)
    : "Style";

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.03, 0.25),
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onSelect}
      className={cn(
        "group relative aspect-[4/5] w-full overflow-hidden text-left",
        "rounded-3xl border",
        "transition-all duration-300",
        "hover:-translate-y-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F7F2]",
        "dark:focus-visible:ring-offset-[#2B2B28]",
        isSelected
          ? [
              "border-[#D18A4A] dark:border-[#D99A5B]",
              "shadow-[0_16px_48px_-8px_rgba(217,154,91,0.55)]",
              "dark:shadow-[0_16px_48px_-8px_rgba(217,154,91,0.4)]",
            ]
          : [
              "border-[#E5E0D5] dark:border-[#4A473F]",
              "shadow-[0_4px_16px_rgba(0,0,0,0.04)]",
              "hover:border-[#D18A4A]/50 dark:hover:border-[#D99A5B]/50",
              "hover:shadow-[0_16px_40px_-8px_rgba(217,154,91,0.3)]",
            ]
      )}
    >
      <HairStyleImage src={template.thumb} alt={template.title} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="line-clamp-1 text-[15px] font-bold leading-tight text-white">
          {template.title}
        </p>
        <p className="mt-1 line-clamp-1 text-[11.5px] font-medium capitalize text-white/80">
          {subtitle}
        </p>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-inset ring-[#D18A4A] dark:ring-[#D99A5B]"
        />
      )}

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={cn(
              "absolute right-3 top-3 z-10",
              "flex size-7 items-center justify-center rounded-full",
              "bg-gradient-to-br from-[#D99A5B] to-[#B86F32]",
              "shadow-[0_4px_16px_rgba(217,154,91,0.6)]"
            )}
          >
            <Check className="size-4 text-white" strokeWidth={3.5} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ═══════════════════════════════════════════
// LIST CARD
// ═══════════════════════════════════════════

function HairStyleListCard({
  template,
  isSelected,
  onSelect,
  index,
}: {
  template: HairTemplate;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const subtitle = template.styleCategory
    ? template.styleCategory.charAt(0).toUpperCase() + template.styleCategory.slice(1)
    : "Style";

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.25,
        delay: Math.min(index * 0.02, 0.15),
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-4 rounded-2xl border p-3 text-left",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F7F2]",
        "dark:focus-visible:ring-offset-[#2B2B28]",
        isSelected
          ? [
              "border-[#D18A4A] dark:border-[#D99A5B]",
              "bg-[#FDF4EB]/60 dark:bg-[#33312D]/60",
              "shadow-[0_8px_24px_-8px_rgba(217,154,91,0.35)]",
            ]
          : [
              "border-[#E5E0D5] dark:border-[#4A473F]",
              "bg-[#FCFBF7]/60 dark:bg-[#262421]/60",
              "hover:border-[#D18A4A]/40 dark:hover:border-[#D99A5B]/40",
              "hover:bg-[#FDF4EB]/40 dark:hover:bg-[#33312D]/40",
            ]
      )}
    >
      <div
        className={cn(
          "relative size-20 shrink-0 overflow-hidden rounded-2xl",
          "border border-[#E5E0D5] dark:border-[#4A473F]"
        )}
      >
        <HairStyleImage src={template.thumb} alt={template.title} />
      </div>

      <div className="flex flex-1 flex-col">
        <p
          className={cn(
            "line-clamp-1 text-[15px] font-bold tracking-tight",
            "text-[#2E2A24] dark:text-[#F7F5F0]"
          )}
        >
          {template.title}
        </p>
        <p
          className={cn(
            "mt-1 line-clamp-1 text-[12px] font-medium capitalize",
            "text-[#8B8478] dark:text-[#B5B0A5]"
          )}
        >
          {subtitle} · {template.category}
        </p>
      </div>

      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-200",
          isSelected
            ? "bg-gradient-to-br from-[#D99A5B] to-[#B86F32] text-white shadow-[0_4px_12px_rgba(217,154,91,0.4)]"
            : "border border-[#E5E0D5] text-transparent dark:border-[#4A473F]"
        )}
      >
        <Check className="size-4" strokeWidth={3.5} />
      </div>
    </motion.button>
  );
}