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
} from "lucide-react";

// Mapping your exact images + routes for each tool
const quickTools = [
  {
    id: "age-simulator",
    title: "Age Simulator",
    subtitle: "See how you'll look at different ages",
    image: "/images/feat/age.jpg",
    icon: <Hourglass className="w-5 h-5" />,
    href: "/app/age-simulator",
  },
  {
    id: "hair-styling",
    title: "Hair Makeover",
    subtitle: "Explore new hairstyles instantly",
    image: "/images/feat/hairs.jpg",
    icon: <Scissors className="w-5 h-5" />,
    href: "/app/hair-studio",
  },
  {
    id: "beard-styling",
    title: "Beard Styling",
    subtitle: "Try different beard styles and lengths",
    image: "/images/feat/beard.jpg",
    icon: <User className="w-5 h-5" />,
    href: "/app/beard-studio",
  },
  {
    id: "fashion-try-on",
    title: "Fashion Try-On",
    subtitle: "See how outfits look on you",
    image: "/images/feat/outfit.jpg",
    icon: <Shirt className="w-5 h-5" />,
    href: "/app/fashion-studio",
  },
  {
    id: "color-adjustment",
    title: "Color Adjuster",
    subtitle: "Try different colors and vibes",
    image: "/images/feat/color.jpg",
    icon: <Palette className="w-5 h-5" />,
    href: "/app/color-studio",
  },
  {
    id: "ai-generate",
    title: "AI Generate",
    subtitle: "Create anything you imagine",
    image: "/images/feat/ai.png",
    icon: <Sparkles className="w-5 h-5" />,
    href: "/app/create",
  },
];

export default function QuickTools() {
  return (
    <section className="w-full px-0 py-6">
      {/* Section Header */}
      <div className="mb-5 flex flex-col items-start justify-between">
        <h2 className="text-[22px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
          Quick Tools
        </h2>
        <p className="mt-1 text-[13px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
          Choose what you&apos;d like to create today
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickTools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}   // ✅ Uses each tool's own href
            className="group relative flex h-[130px] w-full overflow-hidden rounded-[24px] border border-[#E5E0D5] bg-[#FCFBF7] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(217,154,91,0.12)] dark:border-[#4A473F] dark:bg-[#262421] dark:hover:shadow-[0_8px_24px_rgba(217,154,91,0.08)]"
          >
            {/* IMAGE */}
            <div className="absolute right-0 top-0 h-full w-[100px] sm:w-[120px] overflow-hidden">
              <Image
                src={tool.image}
                alt={tool.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100px, 120px"
              />
              {/* Premium Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-r from-[#FCFBF7] via-[#FCFBF7]/40 to-transparent dark:from-[#262421] dark:via-[#262421]/40" />
            </div>

            {/* CONTENT */}
            <div className="relative z-10 flex h-full w-[65%] flex-col justify-between p-4">
              {/* Icon Circle */}
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDF4EB] text-[#D18A4A] dark:bg-[#33312D] dark:text-[#D99A5B]">
                  {tool.icon}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col mt-1">
                <h3 className="text-[14px] font-bold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
                  {tool.title}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-[10.5px] font-medium leading-[1.3] text-[#8B8478] dark:text-[#B5B0A5]">
                  {tool.subtitle}
                </p>
              </div>

              {/* Arrow Button */}
              <div className="mt-2 flex justify-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FDF4EB] text-[#D18A4A] transition-all duration-300 group-hover:bg-[#D18A4A] group-hover:text-white dark:bg-[#33312D] dark:text-[#D99A5B] dark:group-hover:bg-[#D99A5B] dark:group-hover:text-[#2B2B28]">
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CENTERED CTA Button */}
      <div className="mt-8 flex w-full justify-center">
        <Link
          href="/app/features"
          className="group/btn inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#D99A5B] to-[#B86F32] px-8 py-3.5 text-[14px] font-bold tracking-wide text-white shadow-[0_8px_20px_rgba(217,154,91,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(217,154,91,0.35)] dark:shadow-[0_8px_20px_rgba(217,154,91,0.15)] dark:hover:shadow-[0_12px_30px_rgba(217,154,91,0.25)]"
        >
          Explore All Features
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}