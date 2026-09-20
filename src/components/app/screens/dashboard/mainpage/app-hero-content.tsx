// src/app/app/app-hero-content.tsx
// 🖥️ SERVER COMPONENT — no "use client"

import { getUserAction } from "@/actions/users/get-user-action";
import { DashboardMain } from "./dashboard-main";
import { SetupPending } from "./setup-pending";

export async function APPHEROCONTENT() {
  const result = await getUserAction();

  // Not authenticated → sign in message
  if (!result.success && result.error === "Not authenticated.") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          Please sign in to continue.
        </p>
      </div>
    );
  }

  // User not found → show auto-refresh spinner
  if (!result.success) {
    return <SetupPending />;
  }

  // Success → show dashboard
  return <DashboardMain user={result.user} />;
}