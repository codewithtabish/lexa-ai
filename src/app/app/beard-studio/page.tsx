// src/app/app/beard-studio/page.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Zap,
  Crown,
  Download,
  History as HistoryIcon,
  RefreshCw,
  Share2,
  Camera,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  getUserAction,
  type CreationItem,
} from "@/actions/users/get-user-action";
import { uploadHairStyleAction } from "@/actions/images/uplaod-hair-style-action";
import { getFeatureCost } from "@/lib/youcam/feature-costs";
import {
  startBeardStyle,
  checkBeardStyleStatus,
} from "@/actions/beard/beard-action";
import { getBeardTemplates } from "@/actions/beard/get-beard-templates";

// ============================================
// CONFIG
// ============================================

const FLAT_COST = getFeatureCost("BEARD");

const ASPECT_RATIOS = [
  { id: "1:1", label: "Square", icon: "square" },
  { id: "4:3", label: "Classic", icon: "landscape" },
  { id: "16:9", label: "Wide", icon: "rectangle" },
  { id: "9:16", label: "Portrait", icon: "portrait" },
] as const;

type AspectRatio = (typeof ASPECT_RATIOS)[number]["id"];

const LOADING_MESSAGES = [
  "Analyzing your face...",
  "Preserving your features...",
  "Adding beard detail...",
  "Blending naturally...",
  "Almost there...",
];

const INITIAL_VISIBLE_TEMPLATES = 8;

const POLL_INTERVAL_MS = 3000; // 3s
const POLL_MAX_ATTEMPTS = 60; // 60 * 3s = 3 min max

// ============================================
// TYPES
// ============================================

type ServerBeardTemplate = {
  id: string;
  title: string;
  thumb: string;
  categoryName: string;
  categoryId?: string;
};

type UITemplate = {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
};

// ============================================
// HELPERS
// ============================================

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

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

// ============================================
// PAGE
// ============================================

export default function BeardStudioPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Credits + recent
  const [credits, setCredits] = React.useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = React.useState(true);
  const [recentCreations, setRecentCreations] = React.useState<CreationItem[]>(
    []
  );
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Templates (fetched from server action)
  const [templates, setTemplates] = React.useState<UITemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = React.useState(true);
  const [templatesError, setTemplatesError] = React.useState<string | null>(
    null
  );

  // Selection
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<UITemplate | null>(null);
  const [activeFilter, setActiveFilter] = React.useState<string>("all");
  const [showAllTemplates, setShowAllTemplates] = React.useState(false);
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatio>("1:1");

  // Upload
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = React.useState<string | null>(null);
  const [uploadedSize, setUploadedSize] = React.useState<number | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Generation
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatingStatus, setGeneratingStatus] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [resultImage, setResultImage] = React.useState<string | null>(null);
  const [originalImage, setOriginalImage] = React.useState<string | null>(null);
  const [downloading, setDownloading] = React.useState(false);

  // ─── Fetch credits + latest creations ───
  React.useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      if (!isLoaded || !isSignedIn) {
        setCreditsLoading(false);
        return;
      }
      setCreditsLoading(true);
      try {
        const result = await getUserAction({ creationsLimit: 6 });
        if (cancelled) return;
        if (result.success) {
          setCredits(result.user.credits);
          setRecentCreations(
            result.creations.filter((c) => c.feature === "BEARD")
          );
        } else {
          setCredits(0);
          setRecentCreations([]);
        }
      } catch {
        if (!cancelled) {
          setCredits(0);
          setRecentCreations([]);
        }
      } finally {
        if (!cancelled) setCreditsLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, refreshKey]);

  // ─── Fetch beard templates from server action ───
  React.useEffect(() => {
    let cancelled = false;
    async function loadTemplates() {
      setTemplatesLoading(true);
      setTemplatesError(null);
      try {
        const result = await getBeardTemplates();
        if (cancelled) return;

        if (result.success) {
          const mapped: UITemplate[] = result.data.map(
            (t: ServerBeardTemplate) => ({
              id: t.id,
              name: t.title || "Beard Style",
              imageUrl: t.thumb,
              category: t.categoryName || "Other",
            })
          );
          setTemplates(mapped);
        } else {
          setTemplatesError(result.error);
        }
      } catch (err: any) {
        console.error("[BeardStudio] Template fetch error:", err);
        if (!cancelled) setTemplatesError("Failed to load beard styles.");
      } finally {
        if (!cancelled) setTemplatesLoading(false);
      }
    }
    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cleanup preview URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 🎯 Scroll to results when result image appears
  React.useEffect(() => {
    if (!resultImage) return;

    const timer = setTimeout(() => {
      const el = resultsRef.current;
      if (!el) return;

      const NAVBAR_OFFSET = 80;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop || 0;
      const rect = el.getBoundingClientRect();
      const targetY = rect.top + scrollTop - NAVBAR_OFFSET;

      window.scrollTo({ top: targetY, behavior: "smooth" });
    }, 350);

    return () => clearTimeout(timer);
  }, [resultImage]);

  // Rotating loading messages + progress
  React.useEffect(() => {
    if (!isGenerating) {
      setGeneratingStatus("");
      setProgress(0);
      return;
    }
    let idx = 0;
    setGeneratingStatus(LOADING_MESSAGES[0]);
    const msgInterval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setGeneratingStatus(LOADING_MESSAGES[idx]);
    }, 2000);
    const progInterval = setInterval(() => {
      setProgress((p) => (p >= 95 ? 95 : p + Math.random() * 4));
    }, 400);
    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, [isGenerating]);

  // ─── Filter options derived from fetched templates ───
  const filterOptions = React.useMemo(() => {
    const cats = new Set<string>();
    templates.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return [
      { id: "all", label: "All" },
      ...Array.from(cats)
        .sort()
        .map((c) => ({ id: c, label: c })),
    ];
  }, [templates]);

  // ─── Filtered templates ───
  const filteredTemplates = React.useMemo(() => {
    if (activeFilter === "all") return templates;
    return templates.filter((t) => t.category === activeFilter);
  }, [templates, activeFilter]);

  const visibleTemplates = React.useMemo(() => {
    if (showAllTemplates) return filteredTemplates;
    return filteredTemplates.slice(0, INITIAL_VISIBLE_TEMPLATES);
  }, [filteredTemplates, showAllTemplates]);

  // ─── Handlers ───

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image must be under 10MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const newPreview = URL.createObjectURL(file);
    setUploadedFile(file);
    setPreviewUrl(newPreview);

    setUploadedUrl(null);
    setUploadedSize(null);
    setUploadSuccess(false);
    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadHairStyleAction(formData);

      if (result.success) {
        setUploadedUrl(result.data.url);
        setUploadedSize(result.data.size);
        setUploadSuccess(true);
      } else {
        setUploadError(result.error);
        setUploadSuccess(false);
      }
    } catch (err) {
      console.error("[BeardStudio] Upload error:", err);
      setUploadError("Failed to upload. Please try again.");
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadedUrl(null);
    setUploadedSize(null);
    setIsUploading(false);
    setUploadSuccess(false);
    setUploadError(null);
    setError(null);
  };

  // 🎯 Generate → start YouCam task → poll for result
  const handleGenerate = async () => {
    if (!uploadedUrl || !selectedTemplate) return;

    setIsGenerating(true);
    setError(null);
    setResultImage(null);
    setOriginalImage(null);

    try {
      // ─── 1. Start YouCam task ───
      const startResult = await startBeardStyle({
        imageUrl: uploadedUrl,
        beardTemplateId: selectedTemplate.id,
        beardTemplateName: selectedTemplate.name,
      });

      if (!startResult.success) {
        setError(startResult.error);
        return;
      }

      const { creationId } = startResult;

      // ─── 2. Poll for status until COMPLETED or FAILED ───
      for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

        const statusResult = await checkBeardStyleStatus({ creationId });

        if (!statusResult.success) {
          setError(statusResult.error);
          return;
        }

        if (statusResult.status === "COMPLETED") {
          setResultImage(statusResult.imageUrl);
          setOriginalImage(uploadedUrl);
          setProgress(100);
          setRefreshKey((k) => k + 1);
          return;
        }

        if (statusResult.status === "FAILED") {
          setError("Generation failed. Please try again.");
          return;
        }
        // else: PROCESSING — keep polling
      }

      // ─── 3. Timeout ───
      setError("Generation timed out. Please try again.");
    } catch (err: any) {
      console.error("[BeardStudio] Generation error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    setDownloading(true);
    await downloadImage(resultImage, `lexa-beard-${Date.now()}.png`);
    setDownloading(false);
  };

  const handleTryAnother = () => {
    setResultImage(null);
    setOriginalImage(null);
    setSelectedTemplate(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = async () => {
    if (!resultImage) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My LEXA Beard",
          text: "Check out my new beard look created with LEXA AI!",
          url: resultImage,
        });
      } else {
        await navigator.clipboard.writeText(resultImage);
      }
    } catch {
      // user cancelled
    }
  };

  // ─── Derived ───
  const totalCost = FLAT_COST;
  const userCredits = credits ?? 0;
  const canAfford = userCredits >= totalCost;

  const canGenerate =
    !!uploadedUrl &&
    uploadSuccess &&
    !!selectedTemplate &&
    !isUploading &&
    !isGenerating &&
    canAfford;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex min-h-screen flex-col">
      <BackButton
        backHref="/app"
        showCredits
        credits={credits}
        creditsLoading={creditsLoading}
      />

      <HeroSection />

      {/* CONTROL CARD */}
      <div className="mx-auto w-full max-w-6xl pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative overflow-hidden rounded-3xl border p-4 sm:p-6 md:p-7",
            "border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-xl",
            "dark:border-[#4A473F] dark:bg-[#262421]/80",
            "shadow-[0_8px_40px_-12px_rgba(217,154,91,0.15)]"
          )}
        >
          <SectionLabel label="PHOTO" right="Max 10MB" />
          <PhotoSection
            previewUrl={previewUrl}
            file={uploadedFile}
            isUploading={isUploading}
            uploadSuccess={uploadSuccess}
            uploadError={uploadError}
            uploadedSize={uploadedSize}
            onFileSelect={handleFileSelect}
            onRemove={handleRemoveFile}
          />

          {/* CHOOSE STYLE */}
          <div className="mt-6">
            <SectionLabel
              label="CHOOSE STYLE"
              right={
                templatesLoading
                  ? "Loading..."
                  : `${filteredTemplates.length} available`
              }
            />

            {!templatesLoading && templates.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {filterOptions.map((f) => {
                  const active = activeFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setActiveFilter(f.id);
                        setShowAllTemplates(false);
                      }}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[11.5px] font-bold tracking-tight transition-all",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
                        active
                          ? "bg-gradient-to-r from-[#D99A5B] to-[#B86F32] text-white shadow-[0_6px_16px_-4px_rgba(217,154,91,0.55)]"
                          : "bg-[#F7F7F2] text-[#8B8478] hover:bg-[#FDF4EB] hover:text-[#2E2A24] dark:bg-[#1A1918] dark:text-[#B5B0A5] dark:hover:bg-[#33312D] dark:hover:text-[#F7F5F0]"
                      )}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            )}

            {templatesLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col overflow-hidden rounded-2xl border p-1.5",
                      "border-[#E5E0D5] bg-[#FCFBF7]",
                      "dark:border-[#4A473F] dark:bg-[#262421]"
                    )}
                  >
                    <div className="aspect-square w-full animate-pulse rounded-xl bg-[#F7F7F2] dark:bg-[#1A1918]" />
                    <div className="px-0.5 pt-2 pb-1">
                      <div className="h-3 w-3/4 animate-pulse rounded-full bg-[#E5E0D5] dark:bg-[#4A473F]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : templatesError ? (
              <div
                className={cn(
                  "flex flex-col items-center gap-3 rounded-2xl border p-6 text-center",
                  "border-[#E8B4B8]/40 bg-[#E8B4B8]/10"
                )}
              >
                <AlertCircle
                  className="size-6 text-[#E8B4B8]"
                  strokeWidth={2.5}
                />
                <p className="text-[13px] font-semibold text-[#8B8478] dark:text-[#B5B0A5]">
                  {templatesError}
                </p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E0D5] bg-[#FCFBF7] p-6 text-center dark:border-[#4A473F] dark:bg-[#262421]">
                <p className="text-[13px] font-semibold text-[#8B8478] dark:text-[#B5B0A5]">
                  No styles in this category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {visibleTemplates.map((template) => {
                  const active = selectedTemplate?.id === template.id;
                  return (
                    <motion.button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplate(template)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "group relative flex flex-col overflow-hidden rounded-2xl border p-1.5 text-left",
                        "transition-all duration-300",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
                        active
                          ? [
                              "border-[#D18A4A] bg-[#FDF4EB]/60",
                              "shadow-[0_0_0_2px_rgba(217,154,91,0.35),0_8px_20px_-4px_rgba(217,154,91,0.35)]",
                              "dark:border-[#D99A5B] dark:bg-[#D99A5B]/12",
                            ]
                          : [
                              "border-[#E5E0D5] bg-[#FCFBF7] hover:border-[#D18A4A]/50 hover:bg-[#FDF4EB]/40",
                              "dark:border-[#4A473F] dark:bg-[#262421] dark:hover:border-[#D99A5B]/50",
                            ]
                      )}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F7F7F2] dark:bg-[#1A1918]">
                        <Image
                          src={template.imageUrl}
                          alt={template.name}
                          fill
                          className="object-contain transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          unoptimized
                        />

                        {active && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                              "absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full",
                              "bg-gradient-to-br from-[#D99A5B] to-[#B86F32] text-white",
                              "shadow-[0_4px_12px_rgba(217,154,91,0.5)]"
                            )}
                          >
                            <CheckCircle2
                              className="size-3.5"
                              strokeWidth={3}
                            />
                          </motion.div>
                        )}
                      </div>

                      <div className="px-0.5 pt-2 pb-1">
                        <p className="truncate text-[11.5px] font-bold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
                          {template.name}
                        </p>
                        <p className="mt-0.5 truncate text-[9.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
                          {template.category}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {!templatesLoading &&
              !templatesError &&
              !showAllTemplates &&
              filteredTemplates.length > INITIAL_VISIBLE_TEMPLATES && (
                <button
                  type="button"
                  onClick={() => setShowAllTemplates(true)}
                  className={cn(
                    "mx-auto mt-4 flex items-center gap-1 text-[12px] font-bold",
                    "text-[#D18A4A] transition-colors hover:text-[#B86F32]",
                    "dark:text-[#D99A5B] dark:hover:text-[#E0A268]"
                  )}
                >
                  See all {filteredTemplates.length} styles
                  <ArrowRight className="size-3.5" strokeWidth={2.5} />
                </button>
              )}
          </div>

          {/* ASPECT RATIO */}
          <div className="mt-6">
            <SectionLabel label="ASPECT RATIO" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
              {ASPECT_RATIOS.map((ar) => {
                const active = aspectRatio === ar.id;
                return (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => setAspectRatio(ar.id)}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5",
                      "text-left transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
                      active
                        ? [
                            "border-[#D18A4A]/60 bg-[#D99A5B]/10",
                            "shadow-[0_0_0_1px_rgba(217,154,91,0.4),0_4px_16px_-4px_rgba(217,154,91,0.45)]",
                          ]
                        : [
                            "border-[#E5E0D5] bg-[#FCFBF7]/60",
                            "dark:border-[#4A473F] dark:bg-[#262421]/60",
                            "hover:border-[#D18A4A]/40 hover:bg-[#FDF4EB]/60",
                          ]
                    )}
                  >
                    <AspectIcon type={ar.icon} active={active} />
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "text-[13px] font-bold tracking-tight",
                          active
                            ? "text-[#2E2A24] dark:text-[#F7F5F0]"
                            : "text-[#8B8478] dark:text-[#B5B0A5]"
                        )}
                      >
                        {ar.id}
                      </span>
                      <span className="text-[10px] font-medium text-[#8B8478]/70 dark:text-[#B5B0A5]/70">
                        {ar.label}
                      </span>
                    </div>
                    {active && (
                      <span className="ml-auto flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-[#D99A5B] to-[#B86F32] text-white">
                        <CheckCircle2 className="size-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GENERATE */}
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
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A] focus-visible:ring-offset-2",
                "focus-visible:ring-offset-[#F7F7F2] dark:focus-visible:ring-offset-[#2B2B28]",
                canGenerate
                  ? [
                      "bg-gradient-to-r from-[#D99A5B] to-[#B86F32]",
                      "text-white",
                      "shadow-[0_12px_32px_-8px_rgba(217,154,91,0.55)]",
                      "hover:-translate-y-0.5",
                      "hover:shadow-[0_16px_40px_-8px_rgba(217,154,91,0.65)]",
                    ]
                  : [
                      "bg-[#E5E0D5] dark:bg-[#33312D]",
                      "text-[#8B8478] dark:text-[#B5B0A5]",
                      "cursor-not-allowed",
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
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles
                    className="size-4"
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                  <span>
                    {canGenerate
                      ? `Generate Beard — ${totalCost} credit${totalCost > 1 ? "s" : ""}`
                      : !uploadedUrl
                        ? "Upload a photo to start"
                        : !uploadSuccess
                          ? "Uploading photo..."
                          : !selectedTemplate
                            ? "Select a beard style"
                            : !canAfford
                              ? `Not enough credits — need ${totalCost}`
                              : "Preparing..."}
                  </span>
                  {canGenerate && (
                    <ArrowRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={2.5}
                    />
                  )}
                </>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
              <Lock className="size-3" strokeWidth={2.5} />
              <span>Your photos are safe and private</span>
            </div>

            {!canAfford && uploadedUrl && uploadSuccess && selectedTemplate && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push("/pricing")}
                className={cn(
                  "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border p-3",
                  "border-[#D18A4A]/40 bg-[#D99A5B]/5",
                  "text-[12px] font-bold text-[#D18A4A] dark:text-[#D99A5B]",
                  "transition-all hover:bg-[#D99A5B]/10"
                )}
              >
                <Crown className="size-3.5" strokeWidth={2.5} />
                Upgrade to get more credits
              </motion.button>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={cn(
                    "mt-3 flex items-start gap-2 rounded-2xl border p-3",
                    "border-[#E8B4B8]/40 bg-[#E8B4B8]/10"
                  )}
                >
                  <AlertCircle
                    className="mt-0.5 size-3.5 shrink-0 text-[#E8B4B8]"
                    strokeWidth={2.5}
                  />
                  <span className="text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
                    {error}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* RESULTS */}
      <div ref={resultsRef}>
        <ResultsSection
          resultImage={resultImage}
          originalImage={originalImage}
          templateName={selectedTemplate?.name ?? null}
          onDownload={handleDownload}
          onTryAnother={handleTryAnother}
          onShare={handleShare}
          downloading={downloading}
        />
      </div>

      <RecentSection
        creations={recentCreations}
        onViewAll={() => router.push("/app/history")}
      />

      <TrustStrip />

      {/* GENERATING OVERLAY */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl"
          >
            <div className="flex w-full max-w-sm flex-col items-center gap-6 px-6 text-center">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full bg-[#D99A5B]/30 blur-2xl"
                />
                <div
                  className={cn(
                    "relative flex size-20 items-center justify-center rounded-full",
                    "bg-gradient-to-br from-[#D99A5B] to-[#B86F32]",
                    "shadow-[0_20px_60px_rgba(217,154,91,0.6)]"
                  )}
                >
                  <Sparkles
                    className="size-9 animate-pulse text-white"
                    strokeWidth={2}
                    fill="currentColor"
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={generatingStatus}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-[18px] font-extrabold tracking-tight text-white"
                >
                  {generatingStatus}
                </motion.p>
              </AnimatePresence>

              <div className="w-full">
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#D99A5B] to-[#B86F32]"
                  />
                </div>
                <p className="mt-2 text-[11px] font-semibold text-white/70">
                  {Math.round(progress)}% · Preserving your features
                </p>
              </div>

              <p className="text-[12px] font-medium text-white/50">
                This usually takes 15–30 seconds
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// BACK BUTTON
// ============================================

function BackButton({
  backHref = "/app",
  showCredits = true,
  credits,
  creditsLoading,
}: {
  backHref?: string;
  showCredits?: boolean;
  credits: number | null;
  creditsLoading: boolean;
}) {
  const router = useRouter();
  const showSkeleton = creditsLoading || credits === null;
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
        onClick={() => router.push(backHref)}
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
          "dark:hover:border-[#D99A5B]/50 dark:hover:bg-[#33312D]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F7F2] dark:focus-visible:ring-offset-[#2B2B28]"
        )}
      >
        <ArrowLeft
          className="size-4 text-[#D18A4A] transition-transform duration-300 group-hover:-translate-x-0.5 dark:text-[#D99A5B] sm:size-[18px]"
          strokeWidth={2.5}
        />
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden">Back</span>
      </button>

      {showCredits && (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 sm:px-3.5 sm:py-2",
            "bg-gradient-to-r from-[#D99A5B]/15 to-[#B86F32]/10",
            "border-[#D18A4A]/30",
            "dark:from-[#D99A5B]/20 dark:to-[#B86F32]/15 dark:border-[#D99A5B]/40",
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
            <motion.span
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
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
      )}
    </motion.div>
  );
}

// ============================================
// HERO
// ============================================

function HeroSection() {
  return (
    <div className="relative mx-auto w-full max-w-6xl px-1 pt-4 sm:pt-6 lg:pt-8">
      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
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
              Beard Styling
            </span>
          </div>

          <h1 className="text-[36px] font-extrabold leading-[1.05] tracking-tight text-[#2E2A24] dark:text-[#F7F5F0] sm:text-[48px] md:text-[56px]">
            Find Your
            <br />
            <span className="bg-gradient-to-r from-[#D99A5B] to-[#B86F32] bg-clip-text text-transparent">
              Perfect Beard
            </span>
          </h1>

          <p className="mt-4 max-w-md text-[14px] font-medium leading-relaxed text-[#8B8478] dark:text-[#B5B0A5] sm:text-[15px]">
            Upload one photo. Pick from 20 professional beard styles.
            <br />
            Watch AI craft it naturally onto your face.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <HeroPill
              icon={
                <Sparkles
                  className="size-3"
                  strokeWidth={2.5}
                  fill="currentColor"
                />
              }
              label="20 Styles"
            />
            <HeroPill
              icon={
                <Zap className="size-3" strokeWidth={2.5} fill="currentColor" />
              }
              label="Instant"
            />
            <HeroPill
              icon={<Lock className="size-3" strokeWidth={2.5} />}
              label="Private"
            />
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 mx-auto h-full w-[85%] rounded-full bg-[#D99A5B]/25 blur-3xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/beard/beard-hero.png"
            alt="Beard Studio"
            className="mx-auto h-auto w-full max-w-[560px] select-none object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>
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

// ============================================
// SECTION LABEL
// ============================================

function SectionLabel({
  label,
  right,
  rightAccent,
}: {
  label: string;
  right?: string;
  rightAccent?: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-[#8B8478] dark:text-[#B5B0A5]">
        {label}
      </span>
      {right && (
        <span
          className={cn(
            "text-[11px] font-bold tracking-tight",
            rightAccent
              ? "text-[#D18A4A] dark:text-[#D99A5B]"
              : "text-[#8B8478] dark:text-[#B5B0A5]"
          )}
        >
          {right}
        </span>
      )}
    </div>
  );
}

// ============================================
// PHOTO SECTION
// ============================================

function PhotoSection({
  previewUrl,
  file,
  isUploading,
  uploadSuccess,
  uploadError,
  uploadedSize,
  onFileSelect,
  onRemove,
}: {
  previewUrl: string | null;
  file: File | null;
  isUploading: boolean;
  uploadSuccess: boolean;
  uploadError: string | null;
  uploadedSize: number | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFileSelect(f);
  };

  if (!previewUrl) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileSelect(f);
          }}
          className="hidden"
        />

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={cn(
            "group grid cursor-pointer grid-cols-1 gap-4 rounded-2xl border-2 border-dashed p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-5 sm:p-5",
            "transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
            isDragging
              ? "border-[#D18A4A] bg-[#FDF4EB]/60 dark:bg-[#33312D]/60"
              : "border-[#D18A4A]/40 hover:border-[#D18A4A] hover:bg-[#FDF4EB]/40 dark:border-[#D99A5B]/40 dark:hover:border-[#D99A5B] dark:hover:bg-[#33312D]/40"
          )}
        >
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-full",
              "bg-[#FDF4EB] text-[#D18A4A] dark:bg-[#33312D] dark:text-[#D99A5B]",
              "transition-transform duration-300 group-hover:scale-110"
            )}
          >
            <ImageIcon className="size-6" strokeWidth={2.25} />
          </div>

          <div className="min-w-0">
            <p className="text-[15px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
              Drop your photo here
            </p>
            <p className="mt-0.5 text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
              JPG · PNG · WEBP — up to 10MB
            </p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#D18A4A] dark:text-[#D99A5B]">
              <Camera className="size-3" strokeWidth={2.5} />
              or take a selfie
            </p>
          </div>

          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#8B8478] dark:text-[#B5B0A5]">
              Try:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-[#E5E0D5] bg-[#FCFBF7]/60 px-2.5 py-1 text-[10.5px] font-semibold text-[#8B8478] dark:border-[#4A473F] dark:bg-[#262421]/60 dark:text-[#B5B0A5]">
                Front-facing selfie
              </span>
              <span className="rounded-full border border-[#E5E0D5] bg-[#FCFBF7]/60 px-2.5 py-1 text-[10.5px] font-semibold text-[#8B8478] dark:border-[#4A473F] dark:bg-[#262421]/60 dark:text-[#B5B0A5]">
                Good lighting
              </span>
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#E8B4B8]">
            <AlertCircle className="size-3" strokeWidth={2.5} />
            {uploadError}
          </div>
        )}
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-2xl",
        "border border-[#E5E0D5] dark:border-[#4A473F]",
        "bg-[#FCFBF7] dark:bg-[#262421]"
      )}
    >
      <div
        className={cn(
          "relative w-full flex items-center justify-center overflow-hidden",
          "bg-gradient-to-br from-[#FDF4EB] via-[#F7F7F2] to-[#FDF4EB]",
          "dark:from-[#33312D] dark:via-[#2A2825] dark:to-[#33312D]"
        )}
        style={{ height: 200 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Your uploaded photo"
          draggable={false}
          className="block max-h-full max-w-full object-contain p-2 select-none pointer-events-none"
        />

        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-md"
            >
              <Loader2
                className="size-6 animate-spin text-white"
                strokeWidth={2.5}
              />
              <p className="text-[11px] font-bold text-white">Uploading...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {uploadSuccess && !isUploading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute left-3 top-3 z-10 flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] shadow-lg"
          >
            <CheckCircle2 className="size-4 text-white" strokeWidth={3} />
          </motion.div>
        )}

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove photo"
          disabled={isUploading}
          className={cn(
            "absolute right-3 top-3 z-30 flex size-8 items-center justify-center rounded-full",
            "bg-black/60 text-white backdrop-blur-md",
            "transition-all hover:bg-black/80 hover:scale-105",
            isUploading && "cursor-not-allowed opacity-50"
          )}
        >
          <X className="size-4" strokeWidth={2.5} />
        </button>
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-2 border-t px-3 py-2",
          "border-[#E5E0D5] bg-[#FCFBF7]",
          "dark:border-[#4A473F] dark:bg-[#262421]"
        )}
      >
        <p
          className="min-w-0 flex-1 truncate text-[11px] font-bold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]"
          title={file?.name ?? "Your photo"}
        >
          {file?.name ?? "Your photo"}
        </p>

        <div className="flex shrink-0 items-center gap-1 text-[10px] font-semibold">
          {file && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5",
                "bg-[#E5E0D5] text-[#8B8478]",
                "dark:bg-[#4A473F] dark:text-[#B5B0A5]"
              )}
            >
              {formatBytes(file.size)}
            </span>
          )}

          {file && uploadedSize && uploadSuccess && (
            <span className="text-[#8B8478] dark:text-[#B5B0A5]">→</span>
          )}

          {uploadSuccess && uploadedSize && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
                "bg-[#4CAF50]/15 text-[#2E7D32]",
                "border border-[#4CAF50]/30",
                "dark:bg-[#4CAF50]/20 dark:text-[#7ED881]"
              )}
            >
              <CheckCircle2 className="size-2.5" strokeWidth={3} />
              {formatBytes(uploadedSize)}
            </span>
          )}

          {uploadError && !isUploading && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <AlertCircle className="size-2.5" strokeWidth={3} />
              Error
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// ASPECT ICON
// ============================================

function AspectIcon({ type, active }: { type: string; active: boolean }) {
  const color = active
    ? "border-[#D18A4A] dark:border-[#D99A5B]"
    : "border-[#8B8478]/60 dark:border-[#B5B0A5]/60";
  const base = "shrink-0 transition-colors";
  if (type === "square")
    return <div className={cn(base, "size-5 rounded-[4px] border-2", color)} />;
  if (type === "landscape")
    return <div className={cn(base, "h-4 w-5 rounded-[4px] border-2", color)} />;
  if (type === "rectangle")
    return (
      <div className={cn(base, "h-3.5 w-6 rounded-[4px] border-2", color)} />
    );
  return <div className={cn(base, "h-6 w-3.5 rounded-[4px] border-2", color)} />;
}

// ============================================
// RESULTS
// ============================================

function ResultsSection({
  resultImage,
  originalImage,
  templateName,
  onDownload,
  onTryAnother,
  onShare,
  downloading,
}: {
  resultImage: string | null;
  originalImage: string | null;
  templateName: string | null;
  onDownload: () => void;
  onTryAnother: () => void;
  onShare: () => void;
  downloading: boolean;
}) {
  if (!resultImage) return null;

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "rounded-3xl border p-4 sm:p-6",
          "border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-xl",
          "dark:border-[#4A473F] dark:bg-[#262421]/80"
        )}
      >
        <div className="mb-5">
          <h2 className="text-[20px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0] sm:text-[24px]">
            Your Beard Transformation
          </h2>
          <p className="mt-0.5 text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5] sm:text-[13px]">
            Same you. New beard.
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-5">
          <div className="relative">
            <span className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
              Before
            </span>
            <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[#E5E0D5] bg-[#F7F7F2] dark:border-[#4A473F] dark:bg-[#1A1918]">
              {originalImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={originalImage}
                  alt="Before"
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon
                    className="size-8 text-[#8B8478]/40"
                    strokeWidth={1.5}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-full",
                "bg-gradient-to-br from-[#D99A5B] to-[#B86F32] text-white",
                "shadow-[0_8px_20px_-4px_rgba(217,154,91,0.5)]"
              )}
            >
              <ArrowRight className="size-5" strokeWidth={2.5} />
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
              After
            </span>
            <span
              className={cn(
                "absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                "bg-gradient-to-r from-[#4CAF50] to-[#2E7D32]",
                "text-[10px] font-extrabold uppercase tracking-wider text-white",
                "shadow-[0_4px_12px_rgba(76,175,80,0.5)]"
              )}
            >
              <CheckCircle2 className="size-2.5" strokeWidth={3} />
              Ready
            </span>
            <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[#D18A4A]/50 bg-[#F7F7F2] dark:border-[#D99A5B]/50 dark:bg-[#1A1918]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultImage}
                alt="After"
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className={cn(
              "group inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3",
              "bg-gradient-to-r from-[#D99A5B] to-[#B86F32] text-white",
              "text-[13px] font-bold tracking-tight",
              "shadow-[0_10px_24px_-8px_rgba(217,154,91,0.6)]",
              "transition-all duration-300 hover:-translate-y-0.5",
              "disabled:opacity-70 disabled:cursor-not-allowed"
            )}
          >
            {downloading ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
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
            onClick={onTryAnother}
            className={cn(
              "group inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-5 py-3",
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
            <span>Try Another Beard</span>
          </button>

          <button
            type="button"
            onClick={onShare}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3",
              "border-[#E5E0D5] bg-transparent text-[#8B8478]",
              "dark:border-[#4A473F] dark:text-[#B5B0A5]",
              "text-[13px] font-bold tracking-tight",
              "transition-all duration-300 hover:-translate-y-0.5",
              "hover:border-[#D18A4A]/50 hover:text-[#D18A4A]",
              "dark:hover:border-[#D99A5B]/50 dark:hover:text-[#D99A5B]"
            )}
          >
            <Share2 className="size-4" strokeWidth={2.5} />
            <span>Share</span>
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
          Saved to your history · {templateName ? `"${templateName}" · ` : ""}
          {FLAT_COST} credit used
        </p>
      </motion.div>
    </div>
  );
}

// ============================================
// RECENT CREATIONS — click image to download
// ============================================

function RecentSection({
  creations,
  onViewAll,
}: {
  creations: CreationItem[];
  onViewAll: () => void;
}) {
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  if (creations.length === 0) return null;

  const handleDownloadCreation = async (c: CreationItem) => {
    const url = c.imageUrl;
    if (!url) return;

    setDownloadingId(c.id);

    const ext = url.match(/\.(png|jpg|jpeg|webp)(\?|$)/i)?.[1] || "png";
    const templateName =
      (c.metadata as any)?.beardTemplateName ?? "beard";
    const safeName = String(templateName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `lexa-${safeName || "beard"}-${Date.now()}.${ext}`;

    await downloadImage(url, filename);
    setDownloadingId(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl pb-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-[18px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0] sm:text-[20px]">
            Recent Beard Creations
          </h2>
          <p className="mt-0.5 text-[11.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
            Tap an image to download
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

      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {creations.map((c) => {
          const url = c.imageUrl;
          if (!url) return null;

          const isDownloading = downloadingId === c.id;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleDownloadCreation(c)}
              disabled={isDownloading}
              aria-label="Download this beard creation"
              className={cn(
                "group flex w-[150px] shrink-0 flex-col rounded-2xl border p-2 text-left sm:w-[170px]",
                "border-[#E5E0D5] bg-[#FCFBF7]",
                "dark:border-[#4A473F] dark:bg-[#262421]",
                "transition-all duration-300 hover:-translate-y-0.5",
                "hover:border-[#D18A4A]/50 hover:shadow-[0_8px_20px_rgba(217,154,91,0.12)]",
                "dark:hover:border-[#D99A5B]/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
                "disabled:cursor-not-allowed"
              )}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F7F7F2] dark:bg-[#1A1918]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Beard creation"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                  loading="lazy"
                />

                {/* Hover download overlay */}
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 flex items-center justify-center",
                    "bg-black/40 opacity-0 backdrop-blur-[1px]",
                    "transition-opacity duration-300 group-hover:opacity-100"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full",
                      "bg-gradient-to-br from-[#D99A5B] to-[#B86F32] text-white",
                      "shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                    )}
                  >
                    {isDownloading ? (
                      <Loader2
                        className="size-4 animate-spin"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Download className="size-4" strokeWidth={2.5} />
                    )}
                  </span>
                </div>

                {/* Persistent download pill while downloading */}
                {isDownloading && (
                  <div className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md">
                    <Loader2 className="size-3 animate-spin" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className="mt-2 px-0.5">
                <p className="text-[10px] font-bold text-[#2E2A24] dark:text-[#F7F5F0]">
                  {new Date(c.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="truncate text-[9.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
                  {(c.metadata as any)?.beardTemplateName ?? "Beard"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// TRUST STRIP
// ============================================

function TrustStrip() {
  const items = [
    { icon: Sparkles, title: "20 Styles", sub: "Professional beard looks" },
    { icon: Zap, title: "Instant", sub: "Ready in ~15 seconds" },
    { icon: Camera, title: "Custom", sub: "Applied to your face only" },
    { icon: Lock, title: "Private", sub: "Photos are never stored" },
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