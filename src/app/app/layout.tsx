// src/app/app/layout.tsx
"use client";

import * as React from "react";
import { DashboardNavbar } from "@/components/app/screens/dashboard/dashboard-navbar";
import { Footer } from "@/components/app/screens/marketing/footer";
import { DashboardNavbarFallback } from "@/components/app/screens/dashboard/general/dashboard-navbar-fallback";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ✅ Sticky navbar container — only the navbar sticks */}
      <React.Suspense fallback={<DashboardNavbarFallback />}>
        <DashboardNavbar />
      </React.Suspense>

      {/* ✅ Spacer sits OUTSIDE main, right after navbar */}
      <div className="h-16 shrink-0" aria-hidden="true" />

      {/* ✅ Main content — flows naturally, scrolls with page */}
      <main className="flex flex-1 flex-col">
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}