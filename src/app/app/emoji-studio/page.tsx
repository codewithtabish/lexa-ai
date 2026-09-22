// src/app/app/emoji-studio/page.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Smile,
  Zap,
  Heart,
  Dices,
  ChevronDown,
  Palette,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { generateEmojis } from "@/actions/emojistudio/emoji-studio-action";
import {
  getUserAction,
  type CreationItem,
} from "@/actions/users/get-user-action";

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const PRESETS = [
  { id: "all", label: "All" },
  { id: "animals", label: "Animals & Nature" },
  { id: "objects", label: "Objects & Symbols" },
  { id: "food", label: "Food & Travel" },
];

const COUNTS = [1, 2, 3, 4, 5, 6];

const EXAMPLE_PROMPTS = [
  "A cute fuzzy otter holding a heart",
  "A happy sun wearing sunglasses",
  "A cool avocado with headphones",
  "A dancing banana with sparkles",
];

const LOADING_MESSAGES = [
  "Crafting your emojis...",
  "Adding glossy details...",
  "Polishing the shine...",
  "Almost ready...",
];

const MAX_RECENT = 8;
const EMOJI_SIZE = { width: 1024, height: 1024 };

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function isEmojiCreation(item: CreationItem): boolean {
  if (item.metadata?.type === "emoji") return true;
  if (item.metadata?.model === "hive/flux-schnell-emoji") return true;
  return false;
}

function getThumbnails(item: CreationItem): string[] {
  if (item.images && item.images.length > 0) return item.images;
  if (item.imageUrl) return [item.imageUrl];
  return [];
}

function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

export default function EmojiStudioPage() {
  const router = useRouter();

  const [prompt, setPrompt] = React.useState("");
  const [preset, setPreset] = React.useState("all");
  const [count, setCount] = React.useState(2);
  const [steps, setSteps] = React.useState(4);
  const [seed, setSeed] = React.useState<string>("");
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [resultImages, setResultImages] = React.useState<string[]>([]);
  const [downloadingAll, setDownloadingAll] = React.useState(false);
  const [downloadingIndex, setDownloadingIndex] = React.useState<number | null>(null);

  const [recent, setRecent] = React.useState<CreationItem[]>([]);
  const [recentLoading, setRecentLoading] = React.useState(true);

  const loadRecent = React.useCallback(async () => {
    setRecentLoading(true);
    try {
      const res = await getUserAction({ creationsLimit: 100 });
      if (!res.success) {
        setRecent([]);
        return;
      }
      const emojiOnly = (res.creations ?? [])
        .filter(isEmojiCreation)
        .slice(0, MAX_RECENT);
      setRecent(emojiOnly);
    } catch {
      setRecent([]);
    } finally {
      setRecentLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  React.useEffect(() => {
    if (!isGenerating) {
      setStatusMessage("");
      return;
    }
    let idx = 0;
    setStatusMessage(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setStatusMessage(LOADING_MESSAGES[idx]);
    }, 1800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (prompt.trim().length < 3) {
      setError("Please enter at least 3 characters.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setResultImages([]);

    const parsedSeed = seed.trim() ? parseInt(seed.trim(), 10) : undefined;

    try {
      const result = await generateEmojis({
        prompt: prompt.trim(),
        count,
        width: EMOJI_SIZE.width,
        height: EMOJI_SIZE.height,
        steps,
        seed: Number.isFinite(parsedSeed) ? parsedSeed : undefined,
      });

      if (!result.success) {
        setError(result.error);
      } else {
        setResultImages(result.imageUrls);
        void loadRecent();
      }
    } catch (err: any) {
      console.error("[EmojiStudio] Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadOne = async (url: string, idx: number) => {
    setDownloadingIndex(idx);
    await downloadImage(url, `lexa-emoji-${idx + 1}-${Date.now()}.png`);
    setDownloadingIndex(null);
  };

  const handleDownloadAll = async () => {
    if (resultImages.length === 0) return;
    setDownloadingAll(true);
    for (let i = 0; i < resultImages.length; i++) {
      await downloadImage(resultImages[i], `lexa-emoji-${i + 1}-${Date.now()}.png`);
      await new Promise((r) => setTimeout(r, 250));
    }
    setDownloadingAll(false);
  };

  const canGenerate = prompt.trim().length >= 3 && !isGenerating;

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-40 top-1/3 size-[500px] rounded-full bg-[#B86F32]/8 blur-[140px] dark:bg-[#B86F32]/10" />
        <div className="absolute bottom-0 left-1/2 size-[400px] -translate-x-1/2 rounded-full bg-[#D99A5B]/6 blur-[120px] dark:bg-[#D99A5B]/8" />
      </div>

      <TopBar onBack={() => router.push("/app")} />
      <HeroSection />

      <div className="relative mx-auto w-full max-w-4xl pb-10 pt-4 sm:pt-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl sm:p-6 lg:p-8",
            "border-[#E5E0D5]/60 dark:border-[#4A473F]/60",
            "shadow-[0_20px_60px_-30px_rgba(217,154,91,0.2)]",
            "dark:shadow-[0_20px_60px_-30px_rgba(217,154,91,0.3)]"
          )}
        >
          <div className="mb-5">
            <Label>Presets</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESETS.map((p) => {
                const active = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[11.5px] font-bold tracking-tight transition-all",
                      active
                        ? "bg-gradient-to-r from-[#D99A5B] to-[#B86F32] text-white shadow-[0_6px_16px_-4px_rgba(217,154,91,0.55)]"
                        : "bg-[#F7F7F2] text-[#8B8478] hover:bg-[#FDF4EB] hover:text-[#2E2A24] dark:bg-[#1A1918] dark:text-[#B5B0A5] dark:hover:bg-[#33312D] dark:hover:text-[#F7F5F0]"
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <Label>Prompt</Label>
              <span className="text-[10px] font-semibold text-[#8B8478] dark:text-[#B5B0A5]">
                {prompt.length}/200
              </span>
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, 200))}
                placeholder="Create an emoji of a cute fuzzy otter..."
                rows={3}
                className={cn(
                  "w-full resize-none rounded-2xl border p-3.5 pr-12 text-[14px] leading-relaxed",
                  "border-[#E5E0D5] bg-transparent",
                  "dark:border-[#4A473F]",
                  "text-[#2E2A24] placeholder:text-[#8B8478]",
                  "dark:text-[#F7F5F0] dark:placeholder:text-[#B5B0A5]",
                  "focus:border-[#D18A4A] focus:outline-none focus:ring-2 focus:ring-[#D18A4A]/20",
                  "dark:focus:border-[#D99A5B] dark:focus:ring-[#D99A5B]/20",
                  "transition-colors"
                )}
              />
              <div
                className={cn(
                  "absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-lg",
                  "border border-[#D18A4A]/30 bg-[#FDF4EB]",
                  "dark:border-[#D99A5B]/30 dark:bg-[#D99A5B]/10"
                )}
              >
                <Wand2
                  className="size-4 text-[#D18A4A] dark:text-[#D99A5B]"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8B8478] dark:text-[#B5B0A5]">
                Try:
              </span>
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setPrompt(ex.slice(0, 200));
                    setError(null);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[10.5px] font-semibold transition-colors",
                    "border-[#E5E0D5] text-[#8B8478]",
                    "dark:border-[#4A473F] dark:text-[#B5B0A5]",
                    "hover:border-[#D18A4A]/50 hover:text-[#D18A4A]",
                    "dark:hover:border-[#D99A5B]/50 dark:hover:text-[#D99A5B]"
                  )}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <Label>Number of Images</Label>
              <span className="text-[11px] font-bold text-[#D18A4A] dark:text-[#D99A5B]">
                {count} {count === 1 ? "emoji" : "emojis"}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {COUNTS.map((n) => {
                const active = count === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={cn(
                      "rounded-xl border py-2 text-[13px] font-extrabold transition-all",
                      active
                        ? "border-[#D18A4A] bg-gradient-to-br from-[#D99A5B] to-[#B86F32] text-white shadow-[0_4px_12px_-4px_rgba(217,154,91,0.55)] dark:border-[#D99A5B]"
                        : "border-[#E5E0D5] text-[#8B8478] hover:border-[#D18A4A]/40 hover:text-[#D18A4A] dark:border-[#4A473F] dark:text-[#B5B0A5] dark:hover:border-[#D99A5B]/40 dark:hover:text-[#D99A5B]"
                    )}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <Label>Quality</Label>
              <span className="text-[11px] font-bold text-[#D18A4A] dark:text-[#D99A5B]">
                {steps} steps · {steps <= 6 ? "Fast" : steps <= 12 ? "Balanced" : "Best"}
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={20}
              step={1}
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value, 10))}
              className={cn(
                "h-1.5 w-full cursor-pointer appearance-none rounded-full",
                "bg-[#E5E0D5] dark:bg-[#4A473F]",
                "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[#D99A5B] [&::-webkit-slider-thumb]:to-[#B86F32] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(217,154,91,0.5)]",
                "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#D18A4A]"
              )}
            />
            <div className="mt-1.5 flex justify-between text-[9.5px] font-semibold text-[#8B8478]/70 dark:text-[#B5B0A5]/70">
              <span>Fast (4)</span>
              <span>Balanced (10)</span>
              <span>Best (20)</span>
            </div>
          </div>

          <div className="mb-5">
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border px-3 py-2.5",
                "border-[#E5E0D5] bg-transparent",
                "dark:border-[#4A473F]",
                "transition-colors hover:border-[#D18A4A]/40 dark:hover:border-[#D99A5B]/40"
              )}
            >
              <span className="flex items-center gap-2 text-[11.5px] font-bold text-[#2E2A24] dark:text-[#F7F5F0]">
                <Dices className="size-3.5 text-[#D18A4A] dark:text-[#D99A5B]" strokeWidth={2.5} />
                Advanced — Lock Seed
              </span>
              <ChevronDown
                className={cn(
                  "size-4 text-[#8B8478] transition-transform dark:text-[#B5B0A5]",
                  advancedOpen && "rotate-180"
                )}
                strokeWidth={2.5}
              />
            </button>

            <AnimatePresence initial={false}>
              {advancedOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3">
                    <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#8B8478] dark:text-[#B5B0A5]">
                      Seed
                    </span>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={seed}
                        onChange={(e) =>
                          setSeed(e.target.value.replace(/[^0-9]/g, ""))
                        }
                        placeholder="Random"
                        className={cn(
                          "w-full rounded-xl border px-3 py-2.5 pr-10 text-[13px] font-semibold",
                          "border-[#E5E0D5] bg-transparent text-[#2E2A24]",
                          "dark:border-[#4A473F] dark:text-[#F7F5F0]",
                          "placeholder:text-[#8B8478] dark:placeholder:text-[#B5B0A5]",
                          "focus:border-[#D18A4A] focus:outline-none focus:ring-2 focus:ring-[#D18A4A]/20"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSeed(String(Math.floor(Math.random() * 1e9)))
                        }
                        aria-label="Randomize seed"
                        className={cn(
                          "absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg",
                          "text-[#D18A4A] hover:bg-[#FDF4EB] dark:text-[#D99A5B] dark:hover:bg-[#D99A5B]/10"
                        )}
                      >
                        <Dices className="size-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                    <p className="mt-1 text-[9.5px] font-medium text-[#8B8478]/80 dark:text-[#B5B0A5]/80">
                      Lock the seed for consistent results
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={cn(
              "group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 py-4",
              "text-[15px] font-bold tracking-tight transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
              canGenerate
                ? [
                    "bg-gradient-to-r from-[#D99A5B] to-[#B86F32] text-white",
                    "shadow-[0_12px_32px_-8px_rgba(217,154,91,0.55)]",
                    "hover:-translate-y-0.5",
                    "hover:shadow-[0_16px_40px_-8px_rgba(217,154,91,0.7)]",
                  ]
                : [
                    "bg-[#E5E0D5]/60 text-[#8B8478] cursor-not-allowed",
                    "dark:bg-[#33312D]/60 dark:text-[#B5B0A5]",
                  ]
            )}
          >
            {canGenerate && (
              <span
                className={cn(
                  "pointer-events-none absolute inset-0",
                  "bg-gradient-to-r from-transparent via-white/25 to-transparent",
                  "-translate-x-full group-hover:translate-x-full",
                  "transition-transform duration-1000"
                )}
              />
            )}
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
                <span>{statusMessage || "Generating..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4" strokeWidth={2.5} fill="currentColor" />
                <span>
                  Generate {count} {count === 1 ? "Emoji" : "Emojis"}
                </span>
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </>
            )}
          </button>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={cn(
                  "mt-4 flex items-start gap-2 rounded-2xl border p-3",
                  "border-[#E8B4B8]/40 bg-[#E8B4B8]/10 dark:border-[#E8B4B8]/35"
                )}
              >
                <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-[#E8B4B8]" strokeWidth={2.5} />
                <span className="text-[12px] font-medium text-[#8B8478] dark:text-[#E8B4B8]">
                  {error}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <ResultsSection
          images={resultImages}
          onDownloadOne={handleDownloadOne}
          onDownloadAll={handleDownloadAll}
          onRegenerate={handleGenerate}
          downloadingAll={downloadingAll}
          downloadingIndex={downloadingIndex}
          generating={isGenerating}
        />

        <RecentPacksSection
          packs={recent}
          loading={recentLoading}
          onViewAll={() => router.push("/app/history")}
        />

        <FeatureStrip />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TOP BAR
// ═══════════════════════════════════════════════════════════

function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-1 pt-3 sm:pt-4"
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className={cn(
          "group inline-flex items-center gap-2 rounded-full border px-3.5 py-2 sm:px-4 sm:py-2.5",
          "border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-sm",
          "dark:border-[#4A473F] dark:bg-[#262421]/80",
          "text-[13px] font-bold tracking-tight sm:text-[14px]",
          "text-[#2E2A24] dark:text-[#F7F5F0]",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
          "transition-all duration-300 hover:-translate-y-0.5",
          "hover:border-[#D18A4A]/50 hover:bg-[#FDF4EB]",
          "dark:hover:border-[#D99A5B]/50 dark:hover:bg-[#33312D]"
        )}
      >
        <ArrowLeft
          className="size-4 text-[#D18A4A] transition-transform duration-300 group-hover:-translate-x-0.5 dark:text-[#D99A5B] sm:size-[18px]"
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
          Emoji Studio
        </span>
      </div>

      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 sm:px-3.5 sm:py-2",
          "bg-gradient-to-r from-[#D99A5B]/15 to-[#B86F32]/10",
          "border-[#D18A4A]/30 dark:border-[#D99A5B]/40"
        )}
      >
        <Sparkles
          className="size-3.5 text-[#D18A4A] dark:text-[#D99A5B]"
          strokeWidth={2.5}
          fill="currentColor"
        />
        <span className="text-[11px] font-bold text-[#D18A4A] dark:text-[#D99A5B]">
          Free
        </span>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// 🎯 HERO — Fixed mask that crops the baked-in red/yellow edges
// ═══════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <div className="relative mx-auto w-full max-w-6xl px-1 pt-4 sm:pt-6 lg:pt-8">
      <div className="relative flex min-h-[320px] items-center sm:min-h-[380px] lg:min-h-[440px]">
        {/* 🎯 Hero image — aggressively masked to remove red/yellow halo */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] select-none sm:block lg:w-[50%]">
          <div className="relative h-full w-full">
            <Image
              src="/images/feat/emoji.png"
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 100vw, 55vw"
              className={cn(
                "object-contain object-center",
                // 🎯 Radial mask — crops 30% inset on all sides, fades to transparent at 70%
                "[mask-image:radial-gradient(ellipse_65%_65%_at_50%_50%,black_35%,transparent_72%)]",
                "[-webkit-mask-image:radial-gradient(ellipse_65%_65%_at_50%_50%,black_35%,transparent_72%)]"
              )}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 max-w-xl"
        >
          <div
            className={cn(
              "mb-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5",
              "border-[#D18A4A]/35 bg-[#FDF4EB]/80 backdrop-blur-sm",
              "dark:border-[#D99A5B]/35 dark:bg-[#D99A5B]/8"
            )}
          >
            <Smile
              className="size-3.5 text-[#D18A4A] dark:text-[#D99A5B]"
              strokeWidth={2.5}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D18A4A] dark:text-[#D99A5B] sm:text-[11px]">
              Emoji Generator
            </span>
          </div>

          <h1
            className={cn(
              "text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[42px] lg:text-[52px]",
              "text-[#2E2A24] dark:text-[#F7F5F0]"
            )}
          >
            Turn Anything Into{" "}
            <span className="block bg-gradient-to-r from-[#D18A4A] via-[#D99A5B] to-[#B86F32] bg-clip-text text-transparent dark:from-[#D99A5B] dark:via-[#E0A268] dark:to-[#B86F32]">
              Emoji Magic
            </span>
          </h1>

          <p
            className={cn(
              "mt-4 max-w-md text-[14px] leading-[1.55] sm:text-[15px]",
              "text-[#8B8478] dark:text-[#B5B0A5]"
            )}
          >
            Describe any idea. Watch AI craft custom, transparent-background emojis in seconds.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <HeroPill icon={<Sparkles className="size-3" strokeWidth={2.5} fill="currentColor" />} label="Free" />
            <HeroPill icon={<Zap className="size-3" strokeWidth={2.5} fill="currentColor" />} label="Instant" />
            <HeroPill icon={<Palette className="size-3" strokeWidth={2.5} />} label="Transparent PNG" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function HeroPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5",
        "border-[#E5E0D5] bg-[#FCFBF7]",
        "dark:border-[#4A473F] dark:bg-[#262421]",
        "text-[11px] font-bold tracking-tight",
        "text-[#2E2A24] dark:text-[#F7F5F0]"
      )}
    >
      <span className="text-[#D18A4A] dark:text-[#D99A5B]">{icon}</span>
      {label}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#2E2A24] dark:text-[#F7F5F0]">
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// RESULTS
// ═══════════════════════════════════════════════════════════

function ResultsSection({
  images,
  onDownloadOne,
  onDownloadAll,
  onRegenerate,
  downloadingAll,
  downloadingIndex,
  generating,
}: {
  images: string[];
  onDownloadOne: (url: string, idx: number) => void;
  onDownloadAll: () => void;
  onRegenerate: () => void;
  downloadingAll: boolean;
  downloadingIndex: number | null;
  generating: boolean;
}) {
  if (generating && images.length === 0) {
    return (
      <div className="mt-6">
        <div
          className={cn(
            "rounded-3xl border p-5 sm:p-6",
            "border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-xl",
            "dark:border-[#4A473F] dark:bg-[#262421]/80"
          )}
        >
          <h2 className="text-[20px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
            Generating State
          </h2>
          <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E0D5]/60 dark:bg-[#4A473F]/60">
            <motion.div
              animate={{ width: ["10%", "65%", "85%", "95%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#D99A5B] to-[#B86F32]"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square w-full animate-pulse rounded-2xl bg-[#F7F7F2] dark:bg-[#1A1918]"
              />
            ))}
          </div>
          <p className="mt-4 text-center text-[11.5px] font-semibold text-[#8B8478] dark:text-[#B5B0A5]">
            Crafting your emojis...
          </p>
        </div>
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <div className="mt-6">
      <div
        className={cn(
          "rounded-3xl border p-5 sm:p-6",
          "border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-xl",
          "dark:border-[#4A473F] dark:bg-[#262421]/80"
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0] sm:text-[22px]">
              Your Emojis
            </h2>
            <p className="mt-0.5 text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
              Tap to download
            </p>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
              "border-[#4CAF50]/30 bg-[#4CAF50]/10"
            )}
          >
            <CheckCircle2 className="size-3 text-[#4CAF50]" strokeWidth={3} />
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#2E7D32] dark:text-[#7ED881]">
              Ready
            </span>
          </div>
        </div>

        <div className={cn("grid gap-3", images.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
          {images.map((url, i) => (
            <motion.button
              key={url + i}
              type="button"
              onClick={() => onDownloadOne(url, i)}
              disabled={downloadingIndex === i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-2xl border",
                "border-[#E5E0D5] bg-[#FCFBF7] dark:border-[#4A473F] dark:bg-[#262421]",
                "transition-all duration-300 hover:border-[#D18A4A]/50 dark:hover:border-[#D99A5B]/50",
                "cursor-pointer",
                "disabled:opacity-60 disabled:cursor-wait"
              )}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #E5E0D5 25%, transparent 25%), linear-gradient(-45deg, #E5E0D5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E5E0D5 75%), linear-gradient(-45deg, transparent 75%, #E5E0D5 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                }}
              />

              <div className="relative flex h-full w-full items-center justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Emoji ${i + 1}`}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />
              </div>

              <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9.5px] font-extrabold tracking-wide text-white backdrop-blur-md">
                PNG · 1024×1024
              </div>

              <div
                className={cn(
                  "absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full",
                  "bg-black/60 text-white backdrop-blur-md",
                  "transition-all duration-200 hover:bg-black/80 hover:scale-105",
                  downloadingIndex === i && "opacity-60"
                )}
              >
                {downloadingIndex === i ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
                ) : (
                  <Download className="size-3.5" strokeWidth={2.5} />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onDownloadAll}
            disabled={downloadingAll}
            className={cn(
              "group inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3",
              "bg-gradient-to-r from-[#D99A5B] to-[#B86F32] text-white",
              "text-[13px] font-bold tracking-tight",
              "shadow-[0_10px_24px_-8px_rgba(217,154,91,0.6)]",
              "transition-all duration-300 hover:-translate-y-0.5",
              "disabled:opacity-70 disabled:cursor-not-allowed"
            )}
          >
            {downloadingAll ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="size-4" strokeWidth={2.5} />
                <span>Download All</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            className={cn(
              "group inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-6 py-3",
              "border-[#E5E0D5] bg-transparent text-[#2E2A24]",
              "dark:border-[#4A473F] dark:text-[#F7F5F0]",
              "text-[13px] font-bold tracking-tight",
              "transition-all duration-300 hover:-translate-y-0.5",
              "hover:border-[#D18A4A]/50 hover:bg-[#FDF4EB]",
              "dark:hover:border-[#D99A5B]/50 dark:hover:bg-[#33312D]"
            )}
          >
            <RefreshCw
              className="size-4 transition-transform duration-500 group-hover:rotate-180"
              strokeWidth={2.5}
            />
            <span>Regenerate</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// RECENT PACKS
// ═══════════════════════════════════════════════════════════

function RecentPacksSection({
  packs,
  loading,
  onViewAll,
}: {
  packs: CreationItem[];
  loading: boolean;
  onViewAll: () => void;
}) {
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const handleDownloadEmoji = async (
    e: React.MouseEvent,
    url: string,
    packId: string,
    idx: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setDownloading(`${packId}-${idx}`);
    await downloadImage(url, `lexa-emoji-${Date.now()}-${idx + 1}.png`);
    setDownloading(null);
  };

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-[18px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0] sm:text-[20px]">
            Recent Emoji Packs
          </h2>
          <p className="mt-0.5 text-[11.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
            Your latest creations
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-[12px] font-bold text-[#D18A4A] transition-colors hover:text-[#B86F32] dark:text-[#D99A5B]"
        >
          View all <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex w-[170px] shrink-0 flex-col rounded-2xl border p-2.5",
                "border-[#E5E0D5] bg-[#FCFBF7] dark:border-[#4A473F] dark:bg-[#262421]"
              )}
            >
              <div className="h-[110px] w-full animate-pulse rounded-xl bg-[#F7F7F2] dark:bg-[#1A1918]" />
              <div className="mt-2 h-3 w-2/3 animate-pulse rounded-md bg-[#E5E0D5]/70 dark:bg-[#33312D]/70" />
            </div>
          ))}
        </div>
      ) : packs.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed py-10",
            "border-[#E5E0D5] dark:border-[#4A473F]"
          )}
        >
          <Smile className="size-6 text-[#8B8478]/60 dark:text-[#B5B0A5]/60" strokeWidth={1.75} />
          <p className="text-[12px] font-semibold text-[#8B8478] dark:text-[#B5B0A5]">
            No emoji packs yet — generate your first one!
          </p>
        </div>
      ) : (
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {packs.map((pack) => {
            const thumbs = getThumbnails(pack);
            const meta = pack.metadata as any;
            const count = meta?.count ?? thumbs.length;
            const createdAt = new Date(pack.createdAt);

            return (
              <PackCard
                key={pack.id}
                packId={pack.id}
                thumbs={thumbs}
                count={count}
                createdAt={createdAt}
                downloading={downloading}
                onDownload={handleDownloadEmoji}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function PackCard({
  packId,
  thumbs,
  count,
  createdAt,
  downloading,
  onDownload,
}: {
  packId: string;
  thumbs: string[];
  count: number;
  createdAt: Date;
  downloading: string | null;
  onDownload: (
    e: React.MouseEvent,
    url: string,
    packId: string,
    idx: number
  ) => void;
}) {
  const visible = thumbs.slice(0, 4);
  const n = visible.length;

  const gridClass = React.useMemo(() => {
    if (n === 1) return "grid-cols-1 grid-rows-1";
    if (n === 2) return "grid-cols-2 grid-rows-1";
    if (n === 3) return "grid-cols-3 grid-rows-1";
    return "grid-cols-2 grid-rows-2";
  }, [n]);

  const tileHeight = n === 4 ? "h-[140px]" : "h-[110px]";

  return (
    <div
      className={cn(
        "group flex w-[170px] shrink-0 flex-col rounded-2xl border p-2.5",
        "border-[#E5E0D5] bg-[#FCFBF7] shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
        "dark:border-[#4A473F] dark:bg-[#262421]",
        "transition-all duration-300 hover:-translate-y-0.5",
        "hover:border-[#D18A4A]/50 hover:shadow-[0_8px_20px_rgba(217,154,91,0.12)]",
        "dark:hover:border-[#D99A5B]/50"
      )}
    >
      <div className={cn("grid w-full gap-1", gridClass, tileHeight)}>
        {visible.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => onDownload(e, url, packId, i)}
            disabled={downloading === `${packId}-${i}`}
            aria-label={`Download emoji ${i + 1}`}
            className={cn(
              "group/tile relative overflow-hidden rounded-xl border",
              "border-[#E5E0D5] bg-[#FCFBF7] dark:border-[#4A473F] dark:bg-[#262421]",
              "transition-all duration-200 hover:border-[#D18A4A]/60 dark:hover:border-[#D99A5B]/60",
              "cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            )}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #E5E0D5 25%, transparent 25%), linear-gradient(-45deg, #E5E0D5 25%, transparent 25%)",
                backgroundSize: "8px 8px",
              }}
            />

            <div className="relative flex h-full w-full items-center justify-center p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/tile:scale-110"
                draggable={false}
              />
            </div>

            <div
              className={cn(
                "absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full",
                "bg-black/60 text-white backdrop-blur-md",
                "opacity-0 transition-opacity duration-200 group-hover/tile:opacity-100"
              )}
            >
              {downloading === `${packId}-${i}` ? (
                <Loader2 className="size-2.5 animate-spin" strokeWidth={3} />
              ) : (
                <Download className="size-2.5" strokeWidth={3} />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-2.5 flex flex-col px-0.5">
        <span className="text-[11px] font-bold text-[#2E2A24] dark:text-[#F7F5F0]">
          {count} {count === 1 ? "emoji" : "emojis"}
        </span>
        <span className="text-[9.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
          {formatRelative(createdAt)}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FEATURE STRIP
// ═══════════════════════════════════════════════════════════

function FeatureStrip() {
  const features = [
    { Icon: Sparkles, label: "Unlimited", sub: "No credits, no limits" },
    { Icon: Zap, label: "Instant", sub: "Results in seconds" },
    { Icon: Palette, label: "Transparent PNG", sub: "Perfect for any app" },
    { Icon: Heart, label: "For Everyone", sub: "Turn ideas into fun" },
  ];

  return (
    <div className="mt-10 border-t border-[#E5E0D5]/60 pt-8 dark:border-[#4A473F]/50">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {features.map(({ Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full border",
                "border-[#D18A4A]/20 bg-[#FDF4EB]",
                "dark:border-[#D99A5B]/20 dark:bg-[#D99A5B]/10"
              )}
            >
              <Icon
                className="size-4 text-[#D18A4A] dark:text-[#D99A5B]"
                strokeWidth={2.5}
              />
            </div>
            <p className="mt-2 text-[11.5px] font-bold text-[#2E2A24] dark:text-[#F7F5F0]">
              {label}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
              {sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}