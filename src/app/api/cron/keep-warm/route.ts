import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

// ============================================
// KEEP-WARM CRON ROUTE
// ============================================
// Purpose: Ping Neon DB to prevent cold starts.
// Security: Requires Authorization: Bearer ${CRON_SECRET}
// Called by: cron-job.org, Vercel Cron, or manual fetch
// ============================================

export async function GET(request: Request) {
  const startedAt = Date.now();

  // ------------------------------------------------
  // 1. Log incoming request
  // ------------------------------------------------
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[KEEP-WARM] 🔔 Cron job triggered");
  console.log("[KEEP-WARM] ⏰ Time:", new Date().toISOString());
  console.log("[KEEP-WARM] 🌐 User-Agent:", request.headers.get("user-agent") || "unknown");
  console.log("[KEEP-WARM] 📍 From:", request.headers.get("x-forwarded-for") || "unknown");

  // ------------------------------------------------
  // 2. Verify auth
  // ------------------------------------------------
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  console.log("[KEEP-WARM] 🔑 Auth header present:", authHeader ? "yes" : "no");
  console.log("[KEEP-WARM] 🔑 CRON_SECRET set:", process.env.CRON_SECRET ? "yes" : "NO — MISSING!");

  if (authHeader !== expectedAuth) {
    console.error("[KEEP-WARM] ❌ Unauthorized — auth mismatch");
    console.error("[KEEP-WARM]    Received:", authHeader ? `${authHeader.slice(0, 15)}...` : "null");
    console.error("[KEEP-WARM]    Expected:", expectedAuth ? `${expectedAuth.slice(0, 15)}...` : "null");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  console.log("[KEEP-WARM] ✅ Auth verified");

  // ------------------------------------------------
  // 3. Ping the database
  // ------------------------------------------------
  try {
    console.log("[KEEP-WARM] 🗄️  Pinging database with SELECT 1...");

    const dbStart = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as ping`;
    const dbDuration = Date.now() - dbStart;

    console.log("[KEEP-WARM] ✅ Database responded in", `${dbDuration}ms`);
    console.log("[KEEP-WARM] 📦 Result:", result);

    const totalDuration = Date.now() - startedAt;
    console.log("[KEEP-WARM] 🎉 Total duration:", `${totalDuration}ms`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json({
      ok: true,
      message: "Database pinged successfully",
      duration: `${totalDuration}ms`,
      dbDuration: `${dbDuration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const totalDuration = Date.now() - startedAt;

    console.error("[KEEP-WARM] ❌ Database ping FAILED");
    console.error("[KEEP-WARM] ⏱️  Failed after", `${totalDuration}ms`);
    console.error("[KEEP-WARM] 💥 Error:", error);
    console.error("[KEEP-WARM] 💥 Error message:", error instanceof Error ? error.message : "Unknown");
    console.error("[KEEP-WARM] 💥 Error stack:", error instanceof Error ? error.stack : "N/A");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${totalDuration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// ============================================
// SUPPORT POST (some cron services use POST)
// ============================================
export async function POST(request: Request) {
  return GET(request);
}