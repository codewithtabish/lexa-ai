// src/app/app/age-studio/page.tsx
"use client";

import * as React from "react";
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
  Calendar,
  Zap,
  Crown,
  Download,
  History as HistoryIcon,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { getUserAction, type CreationItem } from "@/actions/users/get-user-action";
import { uploadHairStyleAction } from "@/actions/images/uplaod-hair-style-action";
import { getFeatureCost } from "@/lib/youcam/feature-costs";
import { startAgeSimulator } from "@/actions/agestudio/age-studio-action";

// ============================================
// CONFIG
// ============================================

const ALL_AGES = [10, 20, 30, 40, 50, 60, 70, 80];
const MAX_AGES = 6;

// 🎯 FLAT COST — 2 credits no matter how many ages selected
const FLAT_COST = getFeatureCost("AGE"); // → 2

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
  "Aging gracefully...",
  "Adding fine details...",
  "Almost there...",
];

const FILTERS = ["All", "20s", "30s", "40s", "50s", "60s+"] as const;
type Filter = (typeof FILTERS)[number];

// ============================================
// HELPERS
// ============================================

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function matchesFilter(age: number | null, filter: Filter): boolean {
  if (filter === "All") return true;
  if (age == null) return false;
  if (filter === "60s+") return age >= 60;
  const decade = parseInt(filter.replace("s", ""), 10);
  return age >= decade && age < decade + 10;
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

export default function AgeStudioPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  // 🎯 Ref for reliable scroll to results
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Credits + latest creation (ONLY ONE)
  const [credits, setCredits] = React.useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = React.useState(true);
  const [recentCreations, setRecentCreations] = React.useState<CreationItem[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Track freshly generated creation
  const [latestCreationId, setLatestCreationId] = React.useState<string | null>(null);

  // Selection
  const [selectedAges, setSelectedAges] = React.useState<number[]>([]);
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
  const [resultImages, setResultImages] = React.useState<string[]>([]);
  const [freshAges, setFreshAges] = React.useState<number[]>([]);

  // ─── Fetch credits + LATEST creation only ───
  React.useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      if (!isLoaded || !isSignedIn) {
        setCreditsLoading(false);
        return;
      }
      setCreditsLoading(true);
      try {
        // 🎯 Only need the latest creation → limit 1
        const result = await getUserAction({ creationsLimit: 1 });
        if (cancelled) return;
        if (result.success) {
          setCredits(result.user.credits);
          setRecentCreations(result.creations);
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

  // ─── Cleanup object URL ───
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ─── Rotating loading messages + progress ───
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
      setProgress((p) => (p >= 95 ? 95 : p + Math.random() * 6));
    }, 400);
    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, [isGenerating]);

  // ─── Handlers ───

  const toggleAge = (age: number) => {
    setSelectedAges((prev) => {
      if (prev.includes(age)) return prev.filter((a) => a !== age);
      if (prev.length >= MAX_AGES) return prev;
      return [...prev, age].sort((a, b) => a - b);
    });
  };

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
      console.error("[AgeStudio] Upload error:", err);
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

  const handleGenerate = async () => {
    if (!uploadedUrl || selectedAges.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setResultImages([]);
    setFreshAges([]);
    setLatestCreationId(null);

    try {
      const result = await startAgeSimulator({
        imageUrl: uploadedUrl,
        ages: selectedAges,
        aspectRatio,
      });

      if (result.success) {
        setResultImages(result.images);
        setFreshAges(selectedAges);
        setLatestCreationId(result.creationId);

        // Wait for DOM update, then scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 500);

        // Refresh credits in background
        setRefreshKey((k) => k + 1);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("[AgeStudio] Generation error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Derived ───
  const totalCost = FLAT_COST;
  const userCredits = credits ?? 0;
  const canAfford = userCredits >= totalCost;

  const canGenerate =
    !!uploadedUrl &&
    uploadSuccess &&
    selectedAges.length > 0 &&
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
            "relative overflow-hidden rounded-3xl border p-5 sm:p-6 md:p-7",
            "border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-xl",
            "dark:border-[#4A473F] dark:bg-[#262421]/80",
            "shadow-[0_8px_40px_-12px_rgba(217,154,91,0.15)]"
          )}
        >
          {/* PHOTO */}
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

          {/* SELECT AGES */}
          <div className="mt-6">
            <SectionLabel
              label="SELECT AGES"
              right={`${selectedAges.length} / ${MAX_AGES} selected · ${totalCost} credit${totalCost !== 1 ? "s" : ""}`}
              rightAccent={selectedAges.length === MAX_AGES}
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
              {ALL_AGES.map((age) => {
                const active = selectedAges.includes(age);
                const disabled = !active && selectedAges.length >= MAX_AGES;
                return (
                  <button
                    key={age}
                    type="button"
                    onClick={() => toggleAge(age)}
                    disabled={disabled}
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
                            "dark:hover:border-[#D99A5B]/40 dark:hover:bg-[#33312D]/60",
                            disabled &&
                              "cursor-not-allowed opacity-40 hover:border-[#E5E0D5] hover:bg-[#FCFBF7]/60 dark:hover:border-[#4A473F] dark:hover:bg-[#262421]/60",
                          ]
                    )}
                  >
                    <Calendar
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        active
                          ? "text-[#D18A4A] dark:text-[#D99A5B]"
                          : "text-[#8B8478] dark:text-[#B5B0A5]"
                      )}
                      strokeWidth={2.25}
                    />
                    <span
                      className={cn(
                        "text-[15px] font-bold tracking-tight",
                        active
                          ? "text-[#2E2A24] dark:text-[#F7F5F0]"
                          : "text-[#8B8478] dark:text-[#B5B0A5]"
                      )}
                    >
                      {age}
                    </span>

                    {active && (
                      <span
                        className={cn(
                          "ml-auto flex size-4 items-center justify-center rounded-full",
                          "bg-gradient-to-br from-[#D99A5B] to-[#B86F32] text-white"
                        )}
                      >
                        <CheckCircle2 className="size-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-[#E5E0D5]/70 dark:bg-[#4A473F]/70">
                <motion.div
                  initial={false}
                  animate={{ width: `${(selectedAges.length / MAX_AGES) * 100}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#D99A5B] to-[#B86F32]"
                />
              </div>
              <span className="text-[11px] font-semibold text-[#8B8478] dark:text-[#B5B0A5]">
                {selectedAges.length} / {MAX_AGES} selected
              </span>
            </div>
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
                            "dark:hover:border-[#D99A5B]/40 dark:hover:bg-[#33312D]/60",
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
                      <span
                        className={cn(
                          "text-[10px] font-medium",
                          active
                            ? "text-[#8B8478] dark:text-[#B5B0A5]"
                            : "text-[#8B8478]/70 dark:text-[#B5B0A5]/70"
                        )}
                      >
                        {ar.label}
                      </span>
                    </div>
                    {active && (
                      <span
                        className={cn(
                          "ml-auto flex size-4 items-center justify-center rounded-full",
                          "bg-gradient-to-br from-[#D99A5B] to-[#B86F32] text-white"
                        )}
                      >
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
                  <Sparkles className="size-4" strokeWidth={2.5} fill="currentColor" />
                  <span>
                    {canGenerate
                      ? `Generate ${selectedAges.length} Age${selectedAges.length > 1 ? "s" : ""} — ${totalCost} credit${totalCost > 1 ? "s" : ""}`
                      : !uploadedUrl
                        ? "Upload a photo to start"
                        : !uploadSuccess
                          ? "Uploading photo..."
                          : selectedAges.length === 0
                            ? "Select at least one age"
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

            {!canAfford &&
              uploadedUrl &&
              uploadSuccess &&
              selectedAges.length > 0 && (
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

      {/* RESULTS — with ref for reliable scroll */}
      <div ref={resultsRef}>
        <ResultsSection
          freshImages={resultImages}
          freshAges={freshAges}
          recentCreations={recentCreations}
          latestCreationId={latestCreationId}
          onViewAll={() => router.push("/app/history")}
        />
      </div>

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
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
                This usually takes 20–40 seconds
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
          "group inline-flex items-center gap-2",
          "rounded-full",
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

      {showCredits && (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full",
            "bg-gradient-to-r from-[#D99A5B]/15 to-[#B86F32]/10",
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
      )}
    </motion.div>
  );
}

// ============================================
// HERO
// ============================================

function HeroSection() {
  return (
    <div className="relative mx-auto w-full max-w-6xl pb-2 pt-6 sm:pt-8">
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
              Age Simulator
            </span>
          </div>

          <h1 className="text-[40px] font-extrabold leading-[1.05] tracking-tight text-[#2E2A24] dark:text-[#F7F5F0] sm:text-[52px] md:text-[60px]">
            See Yourself
            <br />
            <span className="bg-gradient-to-r from-[#D99A5B] to-[#B86F32] bg-clip-text text-transparent">
              At Every Age
            </span>
          </h1>

          <p className="mt-4 max-w-md text-[14px] font-medium leading-relaxed text-[#8B8478] dark:text-[#B5B0A5] sm:text-[15px]">
            Upload one photo. Pick the decades.
            <br />
            Watch AI reveal the you of every era.
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 mx-auto h-full w-[85%] rounded-full bg-[#D99A5B]/25 blur-3xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/age-studio/age-studio.png"
            alt="See yourself at every age"
            className="mx-auto h-auto w-full max-w-[560px] select-none object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>
      </div>
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
              <Upload className="size-3" strokeWidth={2.5} />
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
              <Loader2 className="size-6 animate-spin text-white" strokeWidth={2.5} />
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
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
                "bg-red-100 text-red-700",
                "dark:bg-red-900/30 dark:text-red-400"
              )}
            >
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
    return <div className={cn(base, "h-3.5 w-6 rounded-[4px] border-2", color)} />;
  return <div className={cn(base, "h-6 w-3.5 rounded-[4px] border-2", color)} />;
}

// ============================================
// RESULTS
// ============================================

type ResultCard = {
  key: string;
  url: string;
  age: number | null;
  isFresh: boolean;
};

function ResultsSection({
  freshImages,
  freshAges,
  recentCreations,
  latestCreationId,
  onViewAll,
}: {
  freshImages: string[];
  freshAges: number[];
  recentCreations: CreationItem[];
  latestCreationId: string | null;
  onViewAll: () => void;
}) {
  const [filter, setFilter] = React.useState<Filter>("All");
  const [downloadingKey, setDownloadingKey] = React.useState<string | null>(null);

  // 🎯 Build a flat list of cards — DEDUPLICATED, LATEST ONLY
  const allCards = React.useMemo<ResultCard[]>(() => {
    const cards: ResultCard[] = [];

    // 1. Fresh results first (just generated)
    freshImages.forEach((url, i) => {
      cards.push({
        key: `fresh-${i}`,
        url,
        age: freshAges[i] ?? null,
        isFresh: true,
      });
    });

    // 2. Latest creation from DB — EXCLUDE the one we just generated
    recentCreations.forEach((c) => {
      // Skip the freshly generated creation (already shown above)
      if (latestCreationId && c.id === latestCreationId) return;

      // Multi-image (AGE)
      if (c.images && c.images.length > 0) {
        const ages: number[] = Array.isArray(c.metadata?.ages)
          ? c.metadata.ages
          : [];
        c.images.forEach((url, i) => {
          cards.push({
            key: `${c.id}-${i}`,
            url,
            age: ages[i] ?? null,
            isFresh: false,
          });
        });
      }
      // Single-image (HAIRSTYLE, HAIRCOLOR, etc.)
      else if (c.imageUrl) {
        cards.push({
          key: c.id,
          url: c.imageUrl,
          age: null,
          isFresh: false,
        });
      }
    });

    return cards;
  }, [freshImages, freshAges, recentCreations, latestCreationId]);

  // Apply filter
  const filtered = React.useMemo(() => {
    if (filter === "All") return allCards;
    return allCards.filter((c) => matchesFilter(c.age, filter));
  }, [allCards, filter]);

  const hasAny = allCards.length > 0;

  const handleDownload = async (card: ResultCard) => {
    setDownloadingKey(card.key);

    const ext = card.url.match(/\.(png|jpg|jpeg|webp)(\?|$)/i)?.[1] || "png";
    const filename = card.age
      ? `lexa-age-${card.age}-${Date.now()}.${ext}`
      : `lexa-age-${Date.now()}.${ext}`;

    await downloadImage(card.url, filename);
    setDownloadingKey(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      <div
        className={cn(
          "rounded-3xl border p-5 sm:p-6",
          "border-[#E5E0D5] bg-[#FCFBF7]/80 backdrop-blur-xl",
          "dark:border-[#4A473F] dark:bg-[#262421]/80"
        )}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0] sm:text-[22px]">
              Your Ages, Revealed
            </h2>
            <p className="mt-0.5 text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
              {freshImages.length > 0
                ? "Just generated — scroll to explore"
                : "Your latest generation"}
            </p>
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[#8B8478] transition-colors hover:text-[#D18A4A] dark:text-[#B5B0A5] dark:hover:text-[#D99A5B]"
          >
            <HistoryIcon className="size-3.5" strokeWidth={2.5} />
            View all
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const count =
              f === "All"
                ? allCards.length
                : allCards.filter((c) => matchesFilter(c.age, f)).length;
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                disabled={count === 0 && f !== "All"}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11.5px] font-bold tracking-tight transition-all",
                  active
                    ? "bg-[#D99A5B]/15 text-[#D18A4A] ring-1 ring-[#D18A4A]/40 dark:text-[#D99A5B]"
                    : "bg-[#FCFBF7]/50 text-[#8B8478] hover:bg-[#FDF4EB]/60 hover:text-[#2E2A24] dark:bg-[#262421]/50 dark:text-[#B5B0A5] dark:hover:text-[#F7F5F0]",
                  count === 0 &&
                    f !== "All" &&
                    "cursor-not-allowed opacity-40 hover:bg-[#FCFBF7]/50 dark:hover:bg-[#262421]/50"
                )}
              >
                {f}
                {count > 0 && (
                  <span className="ml-1.5 text-[10px] opacity-60">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {filtered.map((card, i) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.5) }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border",
                  "border-[#E5E0D5] bg-[#FCFBF7] dark:border-[#4A473F] dark:bg-[#262421]",
                  "transition-all duration-300 hover:border-[#D18A4A]/50 dark:hover:border-[#D99A5B]/50"
                )}
              >
                <div className="aspect-[4/5] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.url}
                    alt={card.age ? `Age ${card.age}` : "Creation"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    draggable={false}
                    loading="lazy"
                  />
                </div>

                {/* Age badge */}
                {card.age != null && (
                  <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-md">
                    Age {card.age}
                  </div>
                )}

                {/* New badge */}
                {card.isFresh && (
                  <div
                    className={cn(
                      "absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5",
                      "bg-gradient-to-r from-[#4CAF50] to-[#2E7D32]",
                      "text-[9.5px] font-extrabold uppercase tracking-wide text-white",
                      "shadow-[0_4px_12px_rgba(76,175,80,0.5)]"
                    )}
                  >
                    <Sparkles className="size-2.5" strokeWidth={3} fill="currentColor" />
                    New
                  </div>
                )}

                {/* Download button — blob, no new tab */}
                <button
                  type="button"
                  onClick={() => handleDownload(card)}
                  disabled={downloadingKey === card.key}
                  aria-label="Download"
                  className={cn(
                    "absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-full",
                    "bg-black/60 text-white backdrop-blur-md",
                    "opacity-0 transition-all duration-200 group-hover:opacity-100",
                    "hover:bg-black/80 hover:scale-105",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {downloadingKey === card.key ? (
                    <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
                  ) : (
                    <Download className="size-3.5" strokeWidth={2.5} />
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        ) : hasAny ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E5E0D5] dark:border-[#4A473F] py-10">
            <p className="text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
              No creations in this age range yet
            </p>
            <button
              type="button"
              onClick={() => setFilter("All")}
              className="text-[11px] font-bold text-[#D18A4A] dark:text-[#D99A5B] hover:underline"
            >
              Show all
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#E5E0D5] dark:border-[#4A473F] py-12">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#D99A5B]/10">
              <Sparkles className="size-5 text-[#D18A4A] dark:text-[#D99A5B]" strokeWidth={2.25} />
            </div>
            <p className="text-[12.5px] font-bold text-[#2E2A24] dark:text-[#F7F5F0]">
              No creations yet
            </p>
            <p className="max-w-xs text-center text-[11.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
              Upload a photo, pick your decades, and watch the magic happen.
            </p>
          </div>
        )}
      </div>
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
    { icon: Sparkles, title: "Premium Quality", sub: "Lifelike aging detail" },
    { icon: Lock, title: "For Everyone", sub: "Private & secure" },
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