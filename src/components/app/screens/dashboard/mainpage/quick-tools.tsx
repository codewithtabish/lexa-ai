// src/components/app/screens/dashboard/mainpage/quick-tools.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Hourglass,
  Scissors,
  Shirt,
  Palette,
  Sparkles,
  ArrowRight,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface QuickTool {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  icon: React.ReactNode;
  href: string;
  isNew?: boolean;
}

// ============================================
// CONFIG
// ============================================

const quickTools: QuickTool[] = [
  {
    id: "age-simulator",
    title: "Age Simulator",
    subtitle: "See how you'll look at different ages",
    image: "/images/feat/age.jpg",
    icon: <Hourglass className="h-5 w-5" />,
    href: "/app/age-studio",
  },
  {
    id: "hair-styling",
    title: "Hair Makeover",
    subtitle: "Explore new hairstyles instantly",
    image: "/images/feat/hairs.jpg",
    icon: <Scissors className="h-5 w-5" />,
    href: "/app/hair-studio",
  },
  {
    id: "beard-styling",
    title: "Beard Styling",
    subtitle: "Try different beard styles and lengths",
    image: "/images/feat/beard.jpg",
    icon: <User className="h-5 w-5" />,
    href: "/app/beard-studio",
  },
  {
    id: "fashion-try-on",
    title: "Fashion Try-On",
    subtitle: "See how outfits look on you",
    image: "/images/feat/outfit.jpg",
    icon: <Shirt className="h-5 w-5" />,
    href: "/app/fashion-studio",
  },
  {
    id: "color-adjustment",
    title: "Color Adjuster",
    subtitle: "Try different colors and vibes",
    image: "/images/feat/color.jpg",
    icon: <Palette className="h-5 w-5" />,
    href: "/app/color-studio",
  },
  {
    id: "ai-generate",
    title: "AI Image Generator",
    subtitle: "Turn any idea into a stunning image",
    image: "/images/feat/aigen.png",
    icon: <Sparkles className="h-5 w-5" />,
    href: "/app/create",
  },
  {
    id: "emoji-generator",
    title: "Emoji Generator",
    subtitle: "Turn anything into custom emojis",
    image: "/images/feat/emoji.png",
    icon: <Smile className="h-5 w-5" />,
    href: "/app/emoji-studio",
    isNew: true,
  },
];

// ============================================
// COMPONENT
// ============================================

export default function QuickTools() {
  return (
    <section className="w-full px-0 py-6">
      {/* Header */}
      <div className="mb-5 flex flex-col items-start justify-between">
        <h2 className="text-[22px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
          Quick Tools
        </h2>
        <p className="mt-1 text-[13px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
          Choose what you&apos;d like to create today
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickTools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className={cn(
              "group relative flex h-[130px] w-full overflow-hidden rounded-[24px] border",
              "border-[#E5E0D5] bg-[#FCFBF7] shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
              "dark:border-[#4A473F] dark:bg-[#262421]",
              "transition-all duration-300",
              "hover:-translate-y-0.5 hover:border-[#D18A4A]/40",
              "hover:shadow-[0_8px_24px_rgba(217,154,91,0.12)]",
              "dark:hover:border-[#D99A5B]/40",
              "dark:hover:shadow-[0_8px_24px_rgba(217,154,91,0.08)]"
            )}
          >
            {/* Image */}
            <div className="absolute right-0 top-0 h-full w-[100px] overflow-hidden sm:w-[120px]">
              <Image
                src={tool.image}
                alt={tool.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100px, 120px"
                unoptimized
              />
              {/* Gradient overlay */}
              <div
                className={cn(
                  "absolute inset-0",
                  "bg-gradient-to-r from-[#FCFBF7] via-[#FCFBF7]/40 to-transparent",
                  "dark:from-[#262421] dark:via-[#262421]/40"
                )}
              />
            </div>

            {/* NEW badge */}
            {tool.isNew && (
              <div
                className={cn(
                  "absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full px-2 py-0.5",
                  "bg-gradient-to-r from-[#4CAF50] to-[#2E7D32]",
                  "text-[9px] font-extrabold uppercase tracking-wider text-white",
                  "shadow-[0_4px_12px_rgba(76,175,80,0.5)]"
                )}
              >
                <Sparkles className="h-2.5 w-2.5" strokeWidth={3} fill="currentColor" />
                New
              </div>
            )}

            {/* Content */}
            <div className="relative z-10 flex h-full w-[65%] flex-col justify-between p-4">
              {/* Icon */}
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    "bg-[#FDF4EB] text-[#D18A4A]",
                    "dark:bg-[#33312D] dark:text-[#D99A5B]",
                    "transition-transform duration-300 group-hover:scale-110"
                  )}
                >
                  {tool.icon}
                </div>
              </div>

              {/* Text */}
              <div className="mt-1 flex flex-col">
                <h3 className="text-[14px] font-bold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
                  {tool.title}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-[10.5px] font-medium leading-[1.3] text-[#8B8478] dark:text-[#B5B0A5]">
                  {tool.subtitle}
                </p>
              </div>

              {/* Arrow */}
              <div className="mt-2 flex justify-start">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full",
                    "bg-[#FDF4EB] text-[#D18A4A]",
                    "dark:bg-[#33312D] dark:text-[#D99A5B]",
                    "transition-all duration-300",
                    "group-hover:bg-[#D18A4A] group-hover:text-white",
                    "dark:group-hover:bg-[#D99A5B] dark:group-hover:text-[#2B2B28]"
                  )}
                >
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 flex w-full justify-center">
        <Link
          href="/app/features"
          className={cn(
            "group/btn inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5",
            "bg-gradient-to-r from-[#D99A5B] to-[#B86F32]",
            "text-[14px] font-bold tracking-wide text-white",
            "shadow-[0_8px_20px_rgba(217,154,91,0.25)]",
            "transition-all duration-300",
            "hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(217,154,91,0.35)]",
            "dark:shadow-[0_8px_20px_rgba(217,154,91,0.15)]",
            "dark:hover:shadow-[0_12px_30px_rgba(217,154,91,0.25)]"
          )}
        >
          Explore All Features
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}