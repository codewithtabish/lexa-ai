// src/app/app/hair-studio/page.tsx
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
  Download,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HairStudioBack } from "./hair-studio-back";
import { HairStudioHeader } from "./hair-studio-header";
import { HairStyleGallery } from "./hair-style-gallery";
import { HairTemplate, hairTemplates } from "@/data/hair-templetes";
import { uploadHairStyleAction } from "@/actions/images/uplaod-hair-style-action";
import { checkHairStyleStatus, startHairStyle } from "@/actions/youcam/hair-studio";

// ============================================
// LOADING MESSAGES
// ============================================

const LOADING_MESSAGES = [
  "Analyzing your face...",
  "Applying hairstyle...",
  "Perfecting details...",
  "Adding finishing touches...",
  "Almost done...",
];

// ============================================
// DOWNLOAD HELPER
// ============================================

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

export default function HairStudioPage() {
  const router = useRouter();

  const [selectedStyle, setSelectedStyle] = React.useState<HairTemplate | null>(null);

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = React.useState<string | null>(null);
  const [uploadedSize, setUploadedSize] = React.useState<number | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatingStatus, setGeneratingStatus] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const [resultImage, setResultImage] = React.useState<string | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const [userDataRefreshKey, setUserDataRefreshKey] = React.useState(0);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  React.useEffect(() => {
    if (!isGenerating) {
      setGeneratingStatus("");
      return;
    }

    let idx = 0;
    setGeneratingStatus(LOADING_MESSAGES[0]);

    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setGeneratingStatus(LOADING_MESSAGES[idx]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleFileSelect = async (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const newPreviewUrl = URL.createObjectURL(file);
    setUploadedFile(file);
    setPreviewUrl(newPreviewUrl);
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
    } catch (err: any) {
      console.error("[HairStudio] Upload error:", err);
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
    if (!uploadedUrl || !selectedStyle) return;

    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      const startResult = await startHairStyle({
        imageUrl: uploadedUrl,
        referenceImageUrl: selectedStyle.imageUrl,
      });

      if (!startResult.success) {
        setError(startResult.error);
        setIsGenerating(false);
        return;
      }

      const { creationId } = startResult;

      let attempts = 0;
      const MAX_ATTEMPTS = 90;

      const interval = setInterval(async () => {
        attempts++;

        if (attempts > MAX_ATTEMPTS) {
          clearInterval(interval);
          setError("Taking too long. Please try again.");
          setIsGenerating(false);
          return;
        }

        try {
          const statusResult = await checkHairStyleStatus({ creationId });

          if (!statusResult.success) return;

          if (statusResult.status === "COMPLETED") {
            clearInterval(interval);
            setResultImage(statusResult.imageUrl);
            setIsGenerating(false);
            setUserDataRefreshKey((k) => k + 1);
            router.refresh();
          } else if (statusResult.status === "FAILED") {
            clearInterval(interval);
            setError("Generation failed. Your credit was not charged.");
            setIsGenerating(false);
            setUserDataRefreshKey((k) => k + 1);
            router.refresh();
          }
        } catch (pollErr) {
          console.error("[HairStudio] Poll error:", pollErr);
        }
      }, 1000);
    } catch (err: any) {
      console.error("[HairStudio] Generate error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;

    setIsDownloading(true);

    const ext = resultImage.match(/\.(png|jpg|jpeg|webp)(\?|$)/i)?.[1] || "jpg";
    const filename = `lexa-hairstyle-${Date.now()}.${ext}`;

    const result = await downloadImage(resultImage, filename);

    setIsDownloading(false);

    if (result.success) {
      setTimeout(() => {
        setResultImage(null);
      }, 500);
    }
  };

  const canGenerate =
    !!uploadedUrl &&
    !!selectedStyle &&
    uploadSuccess &&
    !isUploading &&
    !isGenerating;

  return (
    <div className="flex min-h-screen flex-col">
      <HairStudioBack refreshKey={userDataRefreshKey} />
      <HairStudioHeader />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-8">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
            <StepCard step="1" title="Your Photo">
              <PhotoUploadZone
                file={uploadedFile}
                previewUrl={previewUrl}
                isUploading={isUploading}
                uploadSuccess={uploadSuccess}
                uploadError={uploadError}
                uploadedSize={uploadedSize}
                onFileSelect={handleFileSelect}
                onRemove={handleRemoveFile}
              />
            </StepCard>

            {/* GENERATE BUTTON */}
            <div className="flex flex-col gap-3">
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
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F7F2]",
                  "dark:focus-visible:ring-offset-[#2B2B28]",
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
                      "bg-gradient-to-r from-transparent via-white/30 to-transparent",
                      "-translate-x-full",
                      "group-hover:translate-x-full",
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
                        ? "Generate Hairstyle · 1 credit"
                        : isUploading
                          ? "Uploading photo..."
                          : "Select photo & style"}
                    </span>
                  </>
                )}
              </button>

              <div
                className={cn(
                  "flex items-center justify-center gap-1.5",
                  "text-[11px] font-medium",
                  "text-[#8B8478] dark:text-[#B5B0A5]"
                )}
              >
                <Lock className="size-3" strokeWidth={2.5} />
                <span>Your photos are safe and private</span>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className={cn(
                      "flex items-start gap-2 rounded-2xl border p-3",
                      "border-[#E8B4B8]/40 bg-[#E8B4B8]/10",
                      "dark:border-[#E8B4B8]/30 dark:bg-[#E8B4B8]/5"
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
          </div>

          {/* RIGHT COLUMN — Gallery */}
          <div className="min-w-0">
            <HairStyleGallery
              templates={hairTemplates}
              selectedId={selectedStyle?.id ?? null}
              onSelect={setSelectedStyle}
            />
          </div>
        </div>
      </div>

      {/* GENERATING OVERLAY */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl"
          >
            <div className="flex flex-col items-center gap-6 px-6 text-center">
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
                  <Sparkles className="size-9 animate-pulse text-white" strokeWidth={2} fill="currentColor" />
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

              <p className="text-[13px] font-medium text-white/60">
                This usually takes 10–20 seconds
              </p>

              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                    className="size-1.5 rounded-full bg-[#D99A5B]"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULT OVERLAY */}
      <AnimatePresence>
        {resultImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex w-full max-w-lg flex-col"
            >
              <button
                type="button"
                onClick={() => setResultImage(null)}
                aria-label="Close"
                className={cn(
                  "absolute -right-2 -top-2 z-10 flex size-10 items-center justify-center rounded-full",
                  "bg-white/10 text-white backdrop-blur-md",
                  "transition-all duration-200",
                  "hover:bg-white/20 hover:scale-105",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                )}
              >
                <X className="size-5" strokeWidth={2.5} />
              </button>

              <div className="mb-3 flex justify-center">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-1.5",
                    "bg-gradient-to-r from-[#4CAF50]/20 to-[#2E7D32]/15",
                    "border border-[#4CAF50]/40",
                    "backdrop-blur-sm"
                  )}
                >
                  <CheckCircle2 className="size-3.5 text-[#4CAF50]" strokeWidth={3} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#7ED881]">
                    Your new look is ready
                  </span>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultImage}
                  alt="Your new hairstyle"
                  className="h-auto w-full object-contain"
                />
              </div>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={cn(
                    "group inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5",
                    "bg-gradient-to-r from-[#D99A5B] to-[#B86F32]",
                    "text-[14px] font-bold tracking-tight text-white",
                    "shadow-[0_12px_32px_-8px_rgba(217,154,91,0.6)]",
                    "transition-all duration-300",
                    "hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-8px_rgba(217,154,91,0.7)]",
                    "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  )}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download
                        className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
                        strokeWidth={2.5}
                      />
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

              <p className="mt-3 text-center text-[11px] font-medium text-white/50">
                Saved to your history · 1 credit used
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════
// STEP CARD
// ═══════════════════════════════════════════

function StepCard({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col rounded-3xl border p-4 sm:p-5",
        "border-[#E5E0D5] bg-[#FCFBF7]",
        "dark:border-[#4A473F] dark:bg-[#262421]",
        "shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      )}
    >
      <div className="mb-3 flex items-center gap-2.5 sm:mb-4">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full",
            "bg-[#FDF4EB] text-[#D18A4A]",
            "dark:bg-[#33312D] dark:text-[#D99A5B]"
          )}
        >
          <span className="text-[11px] font-extrabold">{step}</span>
        </div>
        <h3
          className={cn(
            "text-[12px] font-extrabold uppercase tracking-[0.12em]",
            "text-[#2E2A24] dark:text-[#F7F5F0]"
          )}
        >
          Step {step} · {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// PHOTO UPLOAD ZONE — COMPACT, LAYOUT-SAFE
// ═══════════════════════════════════════════

function PhotoUploadZone({
  file,
  previewUrl,
  isUploading,
  uploadSuccess,
  uploadError,
  uploadedSize,
  onFileSelect,
  onRemove,
}: {
  file: File | null;
  previewUrl: string | null;
  isUploading: boolean;
  uploadSuccess: boolean;
  uploadError: string | null;
  uploadedSize: number | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile?.type.startsWith("image/")) {
      onFileSelect(droppedFile);
    }
  };

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) onFileSelect(selectedFile);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ─── EMPTY STATE ──────────────────────────
  if (!previewUrl) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handleChange}
          className="hidden"
        />

        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleClick()}
          className={cn(
            "group flex cursor-pointer flex-col items-center justify-center gap-3",
            "rounded-2xl border-2 border-dashed p-5 sm:p-6 text-center",
            "transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D18A4A]",
            isDragging
              ? [
                  "border-[#D18A4A] bg-[#FDF4EB]/60",
                  "dark:border-[#D99A5B] dark:bg-[#33312D]/60",
                ]
              : [
                  "border-[#D18A4A]/40 bg-transparent",
                  "hover:border-[#D18A4A] hover:bg-[#FDF4EB]/40",
                  "dark:border-[#D99A5B]/40 dark:hover:border-[#D99A5B] dark:hover:bg-[#33312D]/40",
                ]
          )}
        >
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-2xl",
              "bg-[#FDF4EB] text-[#D18A4A]",
              "dark:bg-[#33312D] dark:text-[#D99A5B]",
              "transition-transform duration-300",
              "group-hover:scale-110"
            )}
          >
            <Upload className="size-5" strokeWidth={2.5} />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[14px] font-bold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
              Upload your photo
            </p>
            <p className="text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
              Drag and drop or click to browse
            </p>
          </div>

          <p
            className={cn(
              "text-[10.5px] font-semibold uppercase tracking-[0.1em]",
              "text-[#8B8478]/70 dark:text-[#B5B0A5]/70"
            )}
          >
            JPG · PNG · HEIC · Max 10MB
          </p>

          <div
            className={cn(
              "mt-1 inline-flex items-center gap-1.5 rounded-full px-4 py-2",
              "bg-[#FDF4EB] text-[#D18A4A]",
              "dark:bg-[#33312D] dark:text-[#D99A5B]",
              "text-[12px] font-bold",
              "transition-all duration-300",
              "group-hover:shadow-[0_4px_12px_rgba(217,154,91,0.25)]"
            )}
          >
            <ImageIcon className="size-3.5" strokeWidth={2.5} />
            <span>Choose Photo</span>
          </div>
        </div>
      </>
    );
  }

  // ─── FILLED STATE — COMPACT with FIXED 180px height ────
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
      {/* 🔒 Compact fixed-height container — NEVER stretches */}
      <div
        className={cn(
          "relative w-full flex items-center justify-center overflow-hidden",
          "bg-gradient-to-br from-[#FDF4EB] via-[#F7F7F2] to-[#FDF4EB]",
          "dark:from-[#33312D] dark:via-[#2A2825] dark:to-[#33312D]"
        )}
        style={{ height: "180px" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Your uploaded photo"
          draggable={false}
          className="block max-h-full max-w-full object-contain p-2 select-none pointer-events-none"
          style={{ width: "auto", height: "auto" }}
        />

        {/* UPLOADING OVERLAY */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "absolute inset-0 z-20 flex flex-col items-center justify-center gap-2",
                "bg-black/60 backdrop-blur-md"
              )}
            >
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full",
                  "bg-gradient-to-br from-[#D99A5B] to-[#B86F32]",
                  "shadow-[0_8px_24px_rgba(217,154,91,0.6)]"
                )}
              >
                <Loader2 className="size-5 animate-spin text-white" strokeWidth={2.5} />
              </div>
              <p className="text-[11px] font-bold text-white">Uploading...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SUCCESS BADGE */}
        <AnimatePresence>
          {uploadSuccess && !isUploading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-2 top-2 z-10"
            >
              <div
                className={cn(
                  "flex size-6 items-center justify-center rounded-full",
                  "bg-gradient-to-br from-[#4CAF50] to-[#2E7D32]",
                  "shadow-[0_4px_16px_rgba(76,175,80,0.5)]"
                )}
              >
                <CheckCircle2 className="size-3.5 text-white" strokeWidth={3} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REMOVE BUTTON */}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove photo"
          disabled={isUploading}
          className={cn(
            "absolute right-2 top-2 z-30 flex size-7 items-center justify-center rounded-full",
            "bg-black/60 text-white backdrop-blur-md",
            "transition-all duration-200",
            "hover:bg-black/80 hover:scale-105",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            isUploading && "cursor-not-allowed opacity-50"
          )}
        >
          <X className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Compact info bar */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-t px-3 py-2",
          "border-[#E5E0D5] bg-[#FCFBF7]",
          "dark:border-[#4A473F] dark:bg-[#262421]"
        )}
      >
        <p
          className={cn(
            "min-w-0 flex-1 truncate text-[11px] font-bold tracking-tight",
            "text-[#2E2A24] dark:text-[#F7F5F0]"
          )}
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
              {formatSize(file.size)}
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
              {formatSize(uploadedSize)}
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