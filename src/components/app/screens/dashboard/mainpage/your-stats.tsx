"use client";

import React from "react";
import { Zap, Image as ImageIcon, Clock } from "lucide-react";

const statsData = [
  {
    id: 1,
    label: "TOTAL CREDITS",
    value: "4",
    sub: "Available credits",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: 2,
    label: "TOTAL CREATIONS",
    value: "12",
    sub: "This month",
    icon: <ImageIcon className="w-4 h-4" />,
  },
  {
    id: 3,
    label: "HISTORY",
    value: "12",
    sub: "Saved creations",
    icon: <Clock className="w-4 h-4" />,
  },
];

export default function YourStats() {
  return (
    <section className="w-full px-0 py-6">
      {/* Section Header */}
      <div className="mb-4 flex flex-col items-start justify-between">
        <h2 className="text-[20px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
          Your Stats
        </h2>
        <p className="mt-1 text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
          Track your creative journey
        </p>
      </div>

      {/* Grid Layout: 3 columns exactly like the screenshot */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
        {statsData.map((stat) => (
          <div
            key={stat.id}
            className="group flex flex-col justify-between rounded-[18px] border border-[#E5E0D5] bg-[#FCFBF7] p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(217,154,91,0.08)] dark:border-[#4A473F] dark:bg-[#262421] sm:p-3"
          >
            {/* Top Row: Icon Circle */}
            <div className="mb-2 flex items-start justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDF4EB] text-[#D18A4A] transition-transform duration-300 group-hover:scale-110 dark:bg-[#33312D] dark:text-[#D99A5B]">
                {stat.icon}
              </div>
            </div>
            
            {/* Text Content */}
            <div className="flex flex-col">
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#8B8478] dark:text-[#B5B0A5]">
                {stat.label}
              </span>
              <span className="mt-0.5 text-[18px] font-extrabold leading-none tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
                {stat.value}
              </span>
              <span className="mt-1 text-[8px] font-medium text-[#8B8478]/80 dark:text-[#B5B0A5]/80">
                {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}