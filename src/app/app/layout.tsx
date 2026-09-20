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
      {/* ============================================
          DASHBOARD NAVBAR — Fixed at top, z-50
          ============================================ */}
 <React.Suspense fallback={<DashboardNavbarFallback />}>
        <DashboardNavbar />
      </React.Suspense>
      {/* ============================================
          MAIN — pt-16 offsets the fixed navbar (64px)
          Flex column layout keeps footer stuck at bottom
          even when content is short.
          ============================================ */}
      <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col pt-16">
        <div className="flex-1">{children}</div>
      </main>
    </>
  );
}