// src/app/app/setup-pending.tsx
// 🌐 CLIENT COMPONENT — has "use client"

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function SetupPending() {
  const router = useRouter();

  useEffect(() => {
    console.log("[SetupPending] 🔄 Auto-refresh started");

    const interval = setInterval(() => {
      console.log("[SetupPending] 🔄 Refreshing...");
      router.refresh();
    }, 2000);

    return () => {
      console.log("[SetupPending] ✅ Auto-refresh stopped");
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Setting up your account
        </h2>
        <p className="text-sm text-muted-foreground">
          Just a moment — we&apos;re preparing everything for you.
        </p>
      </div>
    </div>
  );
}