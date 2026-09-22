// src/components/app/screens/dashboard/mainpage/your-stats.tsx
"use client";

import React from "react";
import { Zap, Image as ImageIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserAction } from "@/actions/users/get-user-action";

// ============================================
// TYPES
// ============================================

interface StatItem {
  id: string;
  label: string;
  value: number | null; // null = loading
  sub: string;
  icon: React.ReactNode;
}

// ============================================
// SKELETON NUMBER
// ============================================

function ShimmerNumber() {
  return (
    <span
      className={cn(
        "mt-0.5 inline-block h-[18px] w-8 rounded-md",
        "animate-pulse bg-gradient-to-r from-[#E5E0D5] via-[#EFEAE0] to-[#E5E0D5]",
        "dark:from-[#33312D] dark:via-[#3A3835] dark:to-[#33312D]"
      )}
    />
  );
}

// ============================================
// STAT CARD
// ============================================

function StatCard({ stat }: { stat: StatItem }) {
  const isLoading = stat.value === null;

  return (
    <div
      className={cn(
        "group flex flex-col justify-between rounded-[18px] border p-2.5 sm:p-3",
        "border-[#E5E0D5] bg-[#FCFBF7] shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
        "dark:border-[#4A473F] dark:bg-[#262421]",
        "transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-[#D18A4A]/40",
        "hover:shadow-[0_8px_20px_rgba(217,154,91,0.08)]",
        "dark:hover:border-[#D99A5B]/40"
      )}
    >
      {/* Icon */}
      <div className="mb-2 flex items-start justify-between">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            "bg-[#FDF4EB] text-[#D18A4A]",
            "dark:bg-[#33312D] dark:text-[#D99A5B]",
            "transition-transform duration-300 group-hover:scale-110"
          )}
        >
          {stat.icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[8px] font-bold uppercase tracking-wider text-[#8B8478] dark:text-[#B5B0A5]">
          {stat.label}
        </span>

        {isLoading ? (
          <ShimmerNumber />
        ) : (
          <span className="mt-0.5 text-[18px] font-extrabold leading-none tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
            {stat.value}
          </span>
        )}

        <span className="mt-1 truncate text-[8px] font-medium text-[#8B8478]/80 dark:text-[#B5B0A5]/80">
          {stat.sub}
        </span>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function YourStats() {
  const [credits, setCredits] = React.useState<number | null>(null);
  const [totalGenerations, setTotalGenerations] = React.useState<number | null>(null);
  const [savedCreations, setSavedCreations] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        // 🎯 Pull user + up to 100 creations to count saved ones
        const result = await getUserAction({ creationsLimit: 100 });
        if (cancelled) return;

        if (result.success) {
          setCredits(result.user.credits);
          setTotalGenerations(result.user.totalGenerations ?? 0);
          setSavedCreations(result.creations.length);
        } else {
          setCredits(0);
          setTotalGenerations(0);
          setSavedCreations(0);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[YourStats] fetch failed:", err);
        setCredits(0);
        setTotalGenerations(0);
        setSavedCreations(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const statsData: StatItem[] = [
    {
      id: "credits",
      label: "TOTAL CREDITS",
      value: loading ? null : credits,
      sub: "Available credits",
      icon: <Zap className="h-4 w-4" strokeWidth={2.25} />,
    },
    {
      id: "creations",
      label: "TOTAL CREATIONS",
      value: loading ? null : totalGenerations,
      sub: "All time",
      icon: <ImageIcon className="h-4 w-4" strokeWidth={2.25} />,
    },
    {
      id: "history",
      label: "HISTORY",
      value: loading ? null : savedCreations,
      sub: "Saved creations",
      icon: <Clock className="h-4 w-4" strokeWidth={2.25} />,
    },
  ];

  return (
    <section className="w-full px-0 py-6">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between">
        <h2 className="text-[20px] font-extrabold tracking-tight text-[#2E2A24] dark:text-[#F7F5F0]">
          Your Stats
        </h2>
        <p className="mt-1 text-[12px] font-medium text-[#8B8478] dark:text-[#B5B0A5]">
          Track your creative journey
        </p>
      </div>

      {/* Grid */}
      <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
        {statsData.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
}