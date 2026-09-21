// src/app/api/history/route.ts
import { NextResponse } from "next/server";
import { getCreationsAction } from "@/actions/creations/get-creations-action";

// ═══════════════════════════════════════════════════════════
// GET /api/history
// ═══════════════════════════════════════════════════════════
// Returns the authenticated user's creations (history).
//
// Query params (all optional):
//   ?feature=HAIRSTYLE   → filter by feature type
//   ?limit=20            → limit number of results
//
// Examples:
//   /api/history                           → all creations
//   /api/history?limit=10                  → latest 10
//   /api/history?feature=IMAGEGEN          → only AI images
//   /api/history?feature=HAIRSTYLE&limit=5 → latest 5 hairstyles
//
// Feature values (must match Prisma FeatureType enum):
//   HAIRSTYLE | BEARD | OUTFIT | AGE | HAIRCOLOR | IMAGEGEN
// ═══════════════════════════════════════════════════════════

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // ─── Parse query params ───
    const feature = searchParams.get("feature") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // ─── Validate limit ───
    if (limitParam && (isNaN(limit!) || limit! < 1 || limit! > 100)) {
      return NextResponse.json(
        { success: false, error: "Limit must be between 1 and 100." },
        { status: 400 }
      );
    }

    // ─── Validate feature ───
    const validFeatures = [
      "HAIRSTYLE",
      "BEARD",
      "OUTFIT",
      "AGE",
      "HAIRCOLOR",
      "IMAGEGEN",
    ];

    if (feature && !validFeatures.includes(feature)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid feature. Must be one of: ${validFeatures.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ─── Call the server action ───
    const result = await getCreationsAction({ feature, limit });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[GET /api/history]", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}