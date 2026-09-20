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
    <>
      <React.Suspense fallback={<DashboardNavbarFallback />}>
        <DashboardNavbar />
      </React.Suspense>

      <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col">
        {/* 🆕 Explicit spacer — guaranteed to prevent navbar overlap */}
        <div className="h-16 shrink-0" aria-hidden="true" />

        <div className="flex-1 px-4 sm:px-6 lg:px-8">
          {children}
        </div>

        <Footer />
      </main>
    </>
  );
}