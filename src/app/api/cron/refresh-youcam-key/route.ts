// src/app/api/cron/refresh-youcam-key/route.ts
import { NextResponse } from "next/server";
import { refreshActiveYouCamKey } from "@/lib/youcam/key-manager";

// 🚨 Removed: `export const runtime = "nodejs";`
// 🚨 Removed: `export const maxDuration = 60;`

export async function GET(request: Request) {
  const startedAt = Date.now();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[KEY-REFRESH] 🔔 Triggered at", new Date().toISOString());

  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    console.error("[KEY-REFRESH] ❌ Unauthorized");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  console.log("[KEY-REFRESH] ✅ Auth verified");

  try {
    const result = await refreshActiveYouCamKey();
    const duration = Date.now() - startedAt;

    if (result.success) {
      console.log(
        `[KEY-REFRESH] ✅ Active key → #${result.index} (${result.remaining} credits)`
      );
      console.log(`[KEY-REFRESH] ⏱️  Duration: ${duration}ms`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return NextResponse.json({
        ok: true,
        message: "YouCam keys refreshed",
        index: result.index,
        remaining: result.remaining,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }

    console.error(`[KEY-REFRESH] ❌ ${result.error}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } catch (err: any) {
    const duration = Date.now() - startedAt;
    console.error(`[KEY-REFRESH] 💥 Error:`, err.message);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json(
      { ok: false, error: err.message, duration: `${duration}ms` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}