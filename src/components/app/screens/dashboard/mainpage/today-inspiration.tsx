"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lightbulb } from "lucide-react";

export default function TodaysInspiration() {
  return (
    <section className="w-full px-0 py-6">
      {/* Card Container */}
      <div className="group relative flex h-[200px] w-full overflow-hidden rounded-[24px] border border-[#E5E0D5] bg-[#FCFBF7] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(217,154,91,0.08)] dark:border-[#4A473F] dark:bg-[#262421]">
        
        {/* LEFT: The Generated Image */}
        <div className="absolute left-0 top-0 h-full w-[45%] overflow-hidden">
          <Image
            src="/images/woman/woman.png"
            alt="Today's Inspiration"
            fill
            className="object-cover object-left transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 40vw"
          />
          {/* Premium Gradient Overlay: Fades the image into the card background */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#FCFBF7]/60 to-[#FCFBF7] dark:via-[#262421]/60 dark:to-[#262421]" />
        </div>

        {/* RIGHT: Content */}
        <div className="relative z-10 ml-auto flex h-full w-[55%] flex-col justify-center p-5 md:p-6">
          
          {/* Top Label */}
          <div className="flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-[#D18A4A] dark:text-[#D99A5B]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8B8478] dark:text-[#B5B0A5]">
              Today's Inspiration
            </span>
          </div>

          {/* Headline */}
          <h3 className="mt-2.5 text-[18px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
            New look, new confidence
          </h3>

          {/* Description */}
          <p className="mt-1.5 max-w-[280px] text-[11.5px] font-medium leading-normal text-[#8B8478] dark:text-[#B5B0A5]">
            You don't need to be perfect. You just need to try. Let LEXA AI help you discover a version of yourself you'll love.
          </p>

          {/* CTA Button */}
          <div className="mt-4 flex justify-start">
            <Link
              href="/app/generate"
              className="group/btn inline-flex items-center justify-center gap-2 rounded-full border border-[#D18A4A] px-5 py-2.5 text-[12px] font-bold text-[#D18A4A] transition-all duration-300 hover:bg-[#D18A4A]/10 hover:shadow-[0_4px_12px_rgba(217,154,91,0.15)] dark:border-[#D99A5B] dark:text-[#D99A5B] dark:hover:bg-[#D99A5B]/10 dark:hover:shadow-[0_4px_12px_rgba(217,154,91,0.08)]"
            >
              Generate Now
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}