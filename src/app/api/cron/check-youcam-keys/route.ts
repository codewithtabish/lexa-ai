// src/app/api/cron/check-youcam-keys/route.ts
import { NextResponse } from "next/server";
import {
  getAllKeysForDiagnostics,
  fetchCreditForDiagnostics,
  getActiveKeyFromDBForDiagnostics,
} from "@/lib/youcam/key-manager-diagnostics";

// ═══════════════════════════════════════════════════════════
// YOucam KEY DIAGNOSTICS
// ═══════════════════════════════════════════════════════════
//
// Usage:
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//        http://localhost:3000/api/cron/check-youcam-keys
// ═══════════════════════════════════════════════════════════

export async function GET(request: Request) {
  const startedAt = Date.now();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[KEY-CHECK] 🔔 Triggered at", new Date().toISOString());

  // ─── Auth ───
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    console.error("[KEY-CHECK] ❌ Unauthorized");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  console.log("[KEY-CHECK] ✅ Auth verified");

  try {
    // 🎯 Use helper: get all keys from env
    const keys = getAllKeysForDiagnostics();

    if (keys.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No YOUCAM_API_KEYS in env" },
        { status: 500 }
      );
    }

    console.log(`[KEY-CHECK] 📋 Found ${keys.length} key(s) in env`);

    // 🎯 Use helper: fetch credits in parallel
    const keyStatuses = await Promise.all(
      keys.map(async (key, index) => {
        const credits = await fetchCreditForDiagnostics(key);

        let status: "ACTIVE" | "EXHAUSTED" | "INVALID" | "ERROR" = "ACTIVE";
        if (credits === -1) status = "INVALID";
        else if (credits === -2) status = "ERROR";
        else if (credits < 3) status = "EXHAUSTED";

        return {
          index,
          keyPreview: `${key.slice(0, 14)}...${key.slice(-6)}`,
          credits: credits >= 0 ? credits : null,
          status,
        };
      })
    );

    // 🎯 Use helper: read active key from DynamoDB
    const activeKey = await getActiveKeyFromDBForDiagnostics();

    // ─── Summary ───
    const totalCredits = keyStatuses.reduce(
      (s, k) => s + (k.credits && k.credits > 0 ? k.credits : 0),
      0
    );
    const activeCount = keyStatuses.filter((k) => k.status === "ACTIVE").length;
    const exhaustedCount = keyStatuses.filter(
      (k) => k.status === "EXHAUSTED"
    ).length;
    const invalidCount = keyStatuses.filter(
      (k) => k.status === "INVALID"
    ).length;
    const errorCount = keyStatuses.filter((k) => k.status === "ERROR").length;

    const duration = Date.now() - startedAt;

    console.log(
      `[KEY-CHECK] ✅ Checked ${keys.length} keys in ${duration}ms`
    );
    console.log(
      `[KEY-CHECK] 📊 Active: ${activeCount} | Exhausted: ${exhaustedCount} | Invalid: ${invalidCount} | Errors: ${errorCount}`
    );
    console.log(`[KEY-CHECK] 💰 Total credits: ${totalCredits}`);

    if (activeKey) {
      console.log(
        `[KEY-CHECK] 🎯 Active key (DynamoDB): #${activeKey.index} (${activeKey.remaining} credits)`
      );
    } else {
      console.log(`[KEY-CHECK] 🎯 No active key in DynamoDB`);
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // ─── Response ───
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,

      summary: {
        totalKeys: keys.length,
        active: activeCount,
        exhausted: exhaustedCount,
        invalid: invalidCount,
        errors: errorCount,
        totalCredits,
      },

      activeKey: activeKey
        ? {
            index: activeKey.index,
            keyPreview: `${activeKey.apiKey.slice(0, 14)}...${activeKey.apiKey.slice(-6)}`,
            remaining: activeKey.remaining,
            updatedAt: activeKey.updatedAt,
          }
        : null,

      keys: keyStatuses,

      warnings: [
        ...(activeCount === 0
          ? ["🚨 NO ACTIVE KEYS — all exhausted or invalid"]
          : []),
        ...(totalCredits < 20
          ? [`⚠️ Low total credits (${totalCredits}) — top up soon`]
          : []),
        ...(invalidCount > 0
          ? [`🗑️ ${invalidCount} invalid/revoked keys in env — remove them`]
          : []),
      ],
    });
  } catch (err: any) {
    const duration = Date.now() - startedAt;
    console.error(`[KEY-CHECK] 💥 Error:`, err.message);
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