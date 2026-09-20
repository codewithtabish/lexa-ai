"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Mapping your exact featurepage images to the recent creations
const creations = [
  { id: 1, title: "Face Swap", subtitle: "Modern Look", date: "Sep 17", image: "/images/featurepage/ai.png" },
  { id: 2, title: "Age Simulator", subtitle: "Future You", date: "Sep 16", image: "/images/featurepage/age.png" },
  { id: 3, title: "Style Transfer", subtitle: "Anime Style", date: "Sep 15", image: "/images/featurepage/ai-highlight.png" },
  { id: 4, title: "Hair Makeover", subtitle: "Short Bob", date: "Sep 14", image: "/images/featurepage/hair.png" },
  { id: 5, title: "Fashion Try-On", subtitle: "Evening Dress", date: "Sep 13", image: "/images/featurepage/outfits.png" },
  { id: 6, title: "Makeup Try-On", subtitle: "Natural Glam", date: "Sep 12", image: "/images/featurepage/color.png" },
];

export default function RecentCreations() {
  return (
    <section className="w-full px-0 py-6 relative group/section">
      {/* Section Header */}
      <div className="mb-4 flex items-end justify-between w-full">
        <div className="flex flex-col items-start">
          <h2 className="text-[20px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
            Recent Creations
          </h2>
          <p className="mt-1 text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
            Your latest AI transformations
          </p>
        </div>
        <Link 
          href="/app/history" 
          className="flex items-center gap-1 text-[12px] font-bold text-[#D18A4A] hover:text-[#B86F32] transition-colors dark:text-[#D99A5B]"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {creations.map((item) => (
          <Link
            key={item.id}
            href={`/app/history/${item.id}`}
            className="group relative flex min-w-[150px] w-[150px] flex-col rounded-[20px] border border-[#E5E0D5] bg-[#FCFBF7] p-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(217,154,91,0.12)] dark:border-[#4A473F] dark:bg-[#262421] dark:hover:shadow-[0_8px_20px_rgba(217,154,91,0.08)]"
          >
            {/* Image Container */}
            <div className="relative h-[180px] w-full overflow-hidden rounded-[14px] bg-[#F7F7F2] dark:bg-[#1A1918]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="150px"
              />
              {/* Date Pill */}
              <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-1 backdrop-blur-md">
                <span className="text-[9px] font-bold tracking-wider text-white uppercase">
                  {item.date}
                </span>
              </div>
            </div>

            {/* Text Content */}
            <div className="mt-3 flex flex-col px-1 pb-1">
              <h3 className="text-[13px] font-bold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
                {item.title}
              </h3>
              <p className="mt-0.5 text-[10.5px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
                {item.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}