"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================
// SHIMMER BLOCK
// ============================================

function Shimmer({
  width = "w-6",
  height = "h-3.5",
  className,
  rounded = "rounded-full",
}: {
  width?: string;
  height?: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0.35 }}
      animate={{ opacity: [0.35, 0.85, 0.35] }}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(
        "inline-block",
        "bg-linear-to-r from-primary/15 via-primary/35 to-primary/15",
        width,
        height,
        rounded,
        className,
      )}
    />
  );
}

// ============================================
// MAIN FALLBACK
// ============================================

export function APPHEROContentFallback() {
  return (
    <div className="flex flex-col gap-6 py-6 sm:py-8">
      {/* ============================================
          GREETING SKELETON
          ============================================ */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* LEFT — Greeting */}
        <div className="flex flex-col items-start gap-2.5">
          {/* Date */}
          <Shimmer width="w-32" height="h-3" />

          {/* Hi, Name */}
          <Shimmer
            width="w-48 sm:w-56"
            height="h-8 sm:h-10"
            rounded="rounded-lg"
          />

          {/* Subtitle */}
          <Shimmer
            width="w-56 sm:w-64"
            height="h-4"
            className="mt-0.5"
          />
        </div>

        {/* RIGHT — Buttons */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <Shimmer
            width="w-full sm:w-44"
            height="h-11"
            rounded="rounded-full"
          />
          <Shimmer
            width="w-full sm:w-40"
            height="h-11"
            rounded="rounded-full"
          />
        </div>
      </div>

      {/* ============================================
          UPGRADE BANNER SKELETON
          ============================================ */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "border border-primary/20 bg-primary/5",
          "px-5 py-5 sm:px-8 sm:py-6",
        )}
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT — Icon + Text */}
          <div className="flex items-center gap-4">
            {/* Icon */}
            <Shimmer
              width="size-12 sm:size-14"
              height="size-12 sm:size-14"
              rounded="rounded-2xl"
            />

            {/* Text */}
            <div className="flex flex-col gap-2">
              <Shimmer width="w-24" height="h-2.5" />
              <Shimmer
                width="w-56 sm:w-72"
                height="h-5 sm:h-6"
                rounded="rounded-md"
              />
              <Shimmer width="w-64 sm:w-80" height="h-3" />
            </div>
          </div>

          {/* RIGHT — CTA */}
          <Shimmer
            width="w-full sm:w-36"
            height="h-10"
            rounded="rounded-full"
            className="sm:shrink-0"
          />
        </div>
      </div>
    </div>
  );
}