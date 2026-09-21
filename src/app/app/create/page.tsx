// src/app/app/ai-generate/page.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Download,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Infinity as InfinityIcon,
  Zap,
  Heart,
  Camera,
  Palette,
  Film,
  Box,
  PartyPopper,
  Mountain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateAIImage } from "@/actions/aiimage/ai-image";
import { AIGenerateBack } from "@/components/app/screens/dashboard/create/ai-generate-back";
import {
  getUserAction,
  type CreationItem,
} from "@/actions/users/get-user-action";
import RecentCreationsGrid, { RecentCreationItem } from "@/components/app/screens/dashboard/create/recent-creations-images-grid";


// ═══════════════════════════════════════════════════════════
// TYPES & CONFIG
// ═══════════════════════════════════════════════════════════

interface StyleOption {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

interface AspectOption {
  id: string;
  label: string;
  desc: string;
  preview: string;
}

const STYLE_OPTIONS: StyleOption[] = [
  { id: "photorealistic", label: "Realistic", Icon: Camera },
  { id: "anime", label: "Anime", Icon: Palette },
  { id: "cinematic", label: "Cinematic", Icon: Film },
  { id: "cartoon", label: "Cartoon", Icon: PartyPopper },
  { id: "fantasy", label: "Fantasy", Icon: Mountain },
  { id: "3D render", label: "3D Render", Icon: Box },
];

const ASPECT_OPTIONS: AspectOption[] = [
  { id: "1:1", label: "1:1", desc: "Square", preview: "square" },
  { id: "4:3", label: "4:3", desc: "Classic", preview: "landscape" },
  { id: "16:9", label: "16:9", desc: "Wide", preview: "wide" },
  { id: "9:16", label: "9:16", desc: "Portrait", preview: "portrait" },
];

const EXAMPLE_PROMPTS = [
  "A majestic lion at golden hour",
  "Cyberpunk city at night",
  "A cozy coffee shop interior",
];

const LOADING_MESSAGES = [
  "Analyzing your prompt...",
  "Crafting your vision...",
  "Adding finishing touches...",
  "Almost ready...",
];

const MAX_RECENT = 8;

const AI_GENERATE_FEATURES = new Set([
  "imagegen",
  "aigenerate",
  "aiimage",
  "generate",
  "imagegeneration",
]);

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function normalizeFeature(raw: string | null | undefined): string {
  return (raw ?? "").toLowerCase().replace(/[\s_-]/g, "");
}

function inferStyleFromPrompt(prompt: string | null): string {
  if (!prompt) return "AI";
  const lower = prompt.toLowerCase();
  for (const s of STYLE_OPTIONS) {
    if (lower.includes(s.id.toLowerCase())) return s.label;
  }
  return "AI";
}

function mapCreationToRecent(item: CreationItem): RecentCreationItem | null {
  const url = item.imageUrl ?? item.originalImageUrl;
  if (!url) return null;

  return {
    id: item.id,
    url,
    prompt: item.prompt ?? "Untitled creation",
    style: inferStyleFromPrompt(item.prompt),
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
  };
}

// ═══════════════════════════════════════════════════════════
// DOWNLOAD HELPER
// ═══════════════════════════════════════════════════════════

async function downloadImage(imageUrl: string, filename: string) {
  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    if (!response.ok) throw new Error("Fetch failed");

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return { success: true };
  } catch (err) {
    console.error("[downloadImage] Blob download failed:", err);
    try {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
      return { success: true, fallback: true };
    } catch {
      return { success: false };
    }
  }
}

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

export default function AIGeneratePage() {
  const [prompt, setPrompt] = React.useState("");
  const [style, setStyle] = React.useState<string>("photorealistic");
  const [aspect, setAspect] = React.useState<string>("1:1");

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const [resultImage, setResultImage] = React.useState<string | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const [recent, setRecent] = React.useState<RecentCreationItem[]>([]);
  const [recentLoading, setRecentLoading] = React.useState(true);
  const [recentError, setRecentError] = React.useState<string | null>(null);

  const loadRecent = React.useCallback(async () => {
    setRecentLoading(true);
    setRecentError(null);

    try {
      const res = await getUserAction({ creationsLimit: 100 });

      if (!res.success) {
        setRecentError(res.error ?? "Could not load your creations.");
        setRecent([]);
        return;
      }

      const mapped = (res.creations ?? [])
        .filter((c) => {
          const feature = normalizeFeature(c.feature);
          return (
            AI_GENERATE_FEATURES.has(feature) ||
            feature.includes("imagegen") ||
            feature.includes("aiimage") ||
            feature.includes("generate")
          );
        })
        .map(mapCreationToRecent)
        .filter((x): x is RecentCreationItem => x !== null)
        .slice(0, MAX_RECENT);

      setRecent(mapped);
    } catch (err: any) {
      console.error("[AIGenerate] loadRecent failed:", err);
      setRecentError("Could not load your creations.");
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

  // Lock body scroll when modal open
  React.useEffect(() => {
    if (!resultImage) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [resultImage]);

  // Esc to close modal
  React.useEffect(() => {
    if (!resultImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setResultImage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resultImage]);

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 3) {
      setError("Please enter at least 3 characters.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      const result = await generateAIImage({
        prompt: prompt.trim(),
        style,
        aspect,
      });

      if (!result.success) {
        setError(result.error || "Generation failed. Please try again.");
        setIsGenerating(false);
        return;
      }

      setResultImage(result.imageUrl);

      setRecent((prev) =>
        [
          {
            id: `local-${Date.now()}`,
            url: result.imageUrl,
            prompt: prompt.trim(),
            style: STYLE_OPTIONS.find((s) => s.id === style)?.label ?? "AI",
            createdAt: new Date(),
          },
          ...prev,
        ].slice(0, MAX_RECENT)
      );

      setIsGenerating(false);

      void loadRecent();
    } catch (err: any) {
      console.error("[AIGenerate] Error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    setIsDownloading(true);

    const ext =
      resultImage.match(/\.(png|jpg|jpeg|webp)(\?|$)/i)?.[1] || "jpg";
    const filename = `lexa-ai-${Date.now()}.${ext}`;

    const result = await downloadImage(resultImage, filename);
    setIsDownloading(false);

    if (result.success) {
      setTimeout(() => setResultImage(null), 500);
    }
  };

  const canGenerate = prompt.trim().length >= 3 && !isGenerating;

  return (
    <div className="relative min-h-screen">
      {/* AMBIENT BACKGROUND */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-1/3 -right-40 size-[500px] rounded-full bg-[#B86F32]/8 blur-[140px] dark:bg-[#B86F32]/10" />
        <div className="absolute bottom-0 left-1/2 size-[400px] -translate-x-1/2 rounded-full bg-[#D99A5B]/6 blur-[120px] dark:bg-[#D99A5B]/8" />
      </div>

      <AIGenerateBack />

      {/* HERO */}
      <div className="relative mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        <div className="relative flex min-h-[340px] items-center sm:min-h-[400px] lg:min-h-[460px]">
          <div
            className={cn(
              "absolute inset-y-0 right-0 hidden w-[60%] sm:block lg:w-[55%]",
              "pointer-events-none select-none"
            )}
          >
            <div className="relative h-full w-full">
              <Image
                src="/images/aihero/ai_hero.png"
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 100vw, 60vw"
                className={cn(
                  "object-cover object-center",
                  "[mask-image:linear-gradient(to_right,transparent_0%,black_25%,black_80%,transparent_100%)]",
                  "[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_25%,black_80%,transparent_100%)]"
                )}
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, black 20%, black 75%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to right, transparent 0%, black 20%, black 75%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
                  WebkitMaskComposite: "source-in",
                  maskComposite: "intersect",
                }}
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
                "mb-4 inline-flex items-center gap-2 rounded-full",
                "border border-[#D18A4A]/35 bg-[#FDF4EB]/80 backdrop-blur-sm",
                "dark:border-[#D99A5B]/35 dark:bg-[#D99A5B]/8",
                "px-3.5 py-1.5"
              )}
            >
              <Sparkles
                className="size-3.5 text-[#D18A4A] dark:text-[#D99A5B]"
                strokeWidth={2.5}
                fill="currentColor"
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D18A4A] dark:text-[#D99A5B] sm:text-[11px]">
                AI Image Generation
              </span>
            </div>

            <h1
              className={cn(
                "text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em]",
                "text-[#2E2A24] dark:text-[#F7F5F0]",
                "sm:text-[42px]",
                "lg:text-[52px]"
              )}
            >
              Create Anything{" "}
              <span className="block bg-gradient-to-r from-[#D18A4A] via-[#D99A5B] to-[#B86F32] bg-clip-text text-transparent dark:from-[#D99A5B] dark:via-[#E0A268] dark:to-[#B86F32]">
                You Imagine
              </span>
            </h1>

            <p
              className={cn(
                "mt-4 max-w-md text-[14px] leading-[1.55]",
                "text-[#8B8478] dark:text-[#B5B0A5]",
                "sm:text-[15px]"
              )}
            >
              Type any idea and let AI turn it into a stunning image.{" "}
              <span className="font-semibold text-[#2E2A24] dark:text-[#F7F5F0]/90">
                Free, unlimited, no credits needed.
              </span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* GENERATION CARD */}
      <div className="relative mx-auto w-full max-w-4xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative overflow-hidden rounded-3xl",
            "border border-[#E5E0D5]/60 dark:border-[#4A473F]/60",
            "bg-transparent",
            "backdrop-blur-xl",
            "p-5 sm:p-6 lg:p-8",
            "shadow-[0_20px_60px_-30px_rgba(217,154,91,0.2)]",
            "dark:shadow-[0_20px_60px_-30px_rgba(217,154,91,0.3)]"
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#2E2A24] dark:text-[#F7F5F0]">
              Prompt
            </label>
            <span className="text-[10px] font-semibold text-[#8B8478] dark:text-[#B5B0A5]">
              {prompt.length}/500
            </span>
          </div>

          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
              placeholder="Describe what you want to create..."
              rows={3}
              className={cn(
                "w-full resize-none rounded-2xl border",
                "border-[#E5E0D5] bg-transparent",
                "dark:border-[#4A473F] dark:bg-transparent",
                "p-3.5 pr-12 text-[14px] leading-relaxed",
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
                  setPrompt(ex);
                  setError(null);
                }}
                className={cn(
                  "rounded-full border",
                  "border-[#E5E0D5] bg-transparent",
                  "dark:border-[#4A473F] dark:bg-transparent",
                  "px-3 py-1 text-[10.5px] font-semibold",
                  "text-[#8B8478] dark:text-[#B5B0A5]",
                  "transition-colors",
                  "hover:border-[#D18A4A]/50 hover:text-[#D18A4A]",
                  "dark:hover:border-[#D99A5B]/50 dark:hover:text-[#D99A5B]"
                )}
              >
                {ex}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#2E2A24] dark:text-[#F7F5F0]">
              Style
            </label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {STYLE_OPTIONS.map(({ id, label, Icon }) => {
                const isActive = style === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStyle(id)}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 rounded-2xl border p-2.5",
                      "transition-all duration-200",
                      isActive
                        ? [
                            "border-[#D18A4A] bg-[#FDF4EB]/60",
                            "dark:border-[#D99A5B] dark:bg-[#D99A5B]/12",
                            "shadow-[0_4px_16px_rgba(217,154,91,0.15)]",
                          ]
                        : [
                            "border-[#E5E0D5] bg-transparent",
                            "dark:border-[#4A473F] dark:bg-transparent",
                            "hover:border-[#D18A4A]/40 hover:bg-[#FDF4EB]/40",
                            "dark:hover:border-[#D99A5B]/40 dark:hover:bg-[#D99A5B]/5",
                          ]
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 transition-colors",
                        isActive
                          ? "text-[#D18A4A] dark:text-[#D99A5B]"
                          : "text-[#8B8478] group-hover:text-[#D18A4A] dark:text-[#B5B0A5] dark:group-hover:text-[#D99A5B]"
                      )}
                      strokeWidth={2.5}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-bold transition-colors",
                        isActive
                          ? "text-[#D18A4A] dark:text-[#D99A5B]"
                          : "text-[#8B8478] dark:text-[#B5B0A5]"
                      )}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#2E2A24] dark:text-[#F7F5F0]">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ASPECT_OPTIONS.map((opt) => {
                const isActive = aspect === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAspect(opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-2xl border p-2.5",
                      "transition-all duration-200",
                      isActive
                        ? "border-[#D18A4A] bg-[#FDF4EB]/60 dark:border-[#D99A5B] dark:bg-[#D99A5B]/12"
                        : "border-[#E5E0D5] bg-transparent dark:border-[#4A473F] dark:bg-transparent hover:border-[#D18A4A]/40 dark:hover:border-[#D99A5B]/40"
                    )}
                  >
                    <AspectPreview shape={opt.preview} active={isActive} />
                    <span
                      className={cn(
                        "text-[11px] font-extrabold",
                        isActive
                          ? "text-[#D18A4A] dark:text-[#D99A5B]"
                          : "text-[#2E2A24] dark:text-[#F7F5F0]"
                      )}
                    >
                      {opt.label}
                    </span>
                    <span className="text-[9px] font-semibold text-[#8B8478] dark:text-[#B5B0A5]">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={cn(
                "group relative flex w-full items-center justify-center gap-2.5 overflow-hidden",
                "rounded-full px-6 py-4",
                "text-[15px] font-bold tracking-tight",
                "transition-all duration-300",
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
                    "-translate-x-full",
                    "group-hover:translate-x-full",
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
                  <Sparkles
                    className="size-4"
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                  <span>Generate Image</span>
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={cn(
                  "mt-4 flex items-start gap-2 rounded-2xl border p-3",
                  "border-[#E8B4B8]/40 bg-[#E8B4B8]/10",
                  "dark:border-[#E8B4B8]/35 dark:bg-[#E8B4B8]/8"
                )}
              >
                <AlertCircle
                  className="mt-0.5 size-3.5 shrink-0 text-[#E8B4B8]"
                  strokeWidth={2.5}
                />
                <span className="text-[12px] font-medium text-[#8B8478] dark:text-[#E8B4B8]">
                  {error}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <RecentCreationsGrid
          items={recent}
          loading={recentLoading}
          error={recentError}
          onRetry={loadRecent}
          onSelect={(url) => setResultImage(url)}
        />

        <FeatureStrip />
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* RESULT MODAL — fixed to fit all viewports, no cut-off */}
      {/* ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {resultImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center",
              "bg-black/90 backdrop-blur-xl",
              "p-3 sm:p-6"
            )}
            onClick={() => setResultImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative flex w-full max-w-lg flex-col",
                "max-h-[100dvh] overflow-y-auto",
                "rounded-2xl"
              )}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setResultImage(null)}
                aria-label="Close"
                className={cn(
                  "absolute right-2 top-2 z-20 flex size-10 items-center justify-center rounded-full",
                  "bg-black/60 text-white backdrop-blur-md",
                  "transition-all duration-200",
                  "hover:bg-black/80 hover:scale-105"
                )}
              >
                <X className="size-5" strokeWidth={2.5} />
              </button>

              {/* Status pill */}
              <div className="mb-3 flex justify-center">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-1.5",
                    "border border-[#4CAF50]/40",
                    "bg-gradient-to-r from-[#4CAF50]/20 to-[#2E7D32]/15",
                    "backdrop-blur-sm"
                  )}
                >
                  <CheckCircle2
                    className="size-3.5 text-[#4CAF50]"
                    strokeWidth={3}
                  />
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-[#7ED881]">
                    Image Ready
                  </span>
                </div>
              </div>

              {/* Image */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultImage}
                  alt="AI generated"
                  className="mx-auto h-auto max-h-[55vh] w-auto max-w-full object-contain sm:max-h-[60vh]"
                />
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={cn(
                    "group inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5",
                    "bg-gradient-to-r from-[#D99A5B] to-[#B86F32] text-white",
                    "text-[14px] font-bold tracking-tight",
                    "shadow-[0_12px_32px_-8px_rgba(217,154,91,0.6)]",
                    "transition-all duration-300",
                    "hover:-translate-y-0.5",
                    "disabled:opacity-70 disabled:cursor-not-allowed"
                  )}
                >
                  {isDownloading ? (
                    <>
                      <Loader2
                        className="size-4 animate-spin"
                        strokeWidth={2.5}
                      />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="size-4" strokeWidth={2.5} />
                      <span>Download</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setResultImage(null)}
                  className={cn(
                    "group inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5",
                    "border border-white/20 bg-white/5 text-white backdrop-blur-md",
                    "text-[14px] font-bold tracking-tight",
                    "transition-all duration-300",
                    "hover:border-white/40 hover:bg-white/10"
                  )}
                >
                  <RefreshCw
                    className="size-4 transition-transform duration-500 group-hover:rotate-180"
                    strokeWidth={2.5}
                  />
                  <span>Try Another</span>
                </button>
              </div>

              <p className="mt-3 pb-2 text-center text-[11px] font-medium text-white/50">
                Saved to your history · Free
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AspectPreview
// ═══════════════════════════════════════════════════════════

function AspectPreview({ shape, active }: { shape: string; active: boolean }) {
  const baseClass = cn(
    "rounded-[4px] border-2 transition-colors",
    active
      ? "border-[#D18A4A] dark:border-[#D99A5B]"
      : "border-[#B5B0A5] dark:border-[#B5B0A5]"
  );

  if (shape === "square") return <div className={cn(baseClass, "size-5")} />;
  if (shape === "landscape")
    return <div className={cn(baseClass, "h-4 w-6")} />;
  if (shape === "wide") return <div className={cn(baseClass, "h-3 w-7")} />;
  if (shape === "portrait") return <div className={cn(baseClass, "h-6 w-4")} />;
  return <div className={cn(baseClass, "size-5")} />;
}

// ═══════════════════════════════════════════════════════════
// FeatureStrip
// ═══════════════════════════════════════════════════════════

function FeatureStrip() {
  const features = [
    { Icon: InfinityIcon, label: "Unlimited", sub: "No credits, no limits" },
    { Icon: Zap, label: "Instant", sub: "Results in seconds" },
    { Icon: Sparkles, label: "Premium Quality", sub: "Stunning, high-res" },
    { Icon: Heart, label: "For Everyone", sub: "Turn ideas into art" },
  ];

  return (
    <div className="mt-10 border-t border-[#E5E0D5]/60 pt-8 dark:border-[#4A473F]/50">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {features.map(({ Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full",
                "bg-[#FDF4EB] border border-[#D18A4A]/20",
                "dark:bg-[#D99A5B]/10 dark:border-[#D99A5B]/20"
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