// src/components/app/screens/hair-studio/hair-style-image.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface HairStyleImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Priority load — for above-the-fold images */
  priority?: boolean;
  /** Called when the image fails to load */
  onError?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function HairStyleImage({
  src,
  alt,
  className,
  priority = false,
  onError,
}: HairStyleImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2",
          "bg-gradient-to-br from-[#FDF4EB] to-[#F7F7F2]",
          "dark:from-[#33312D] dark:to-[#262421]",
          className
        )}
      >
        <ImageOff
          className="size-6 text-[#D18A4A]/60 dark:text-[#D99A5B]/60"
          strokeWidth={1.8}
        />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8B8478] dark:text-[#B5B0A5]">
          Unavailable
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Loading shimmer */}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 z-10 animate-pulse",
            "bg-gradient-to-br from-[#FDF4EB] via-[#F7F7F2] to-[#FDF4EB]",
            "dark:from-[#33312D] dark:via-[#262421] dark:to-[#33312D]"
          )}
        />
      )}

      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={cn(
          "object-cover transition-all duration-700",
          isLoading ? "scale-105 opacity-0" : "scale-100 opacity-100",
          "group-hover:scale-110",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        }}
      />
    </>
  );
}