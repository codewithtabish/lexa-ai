// src/app/api/youcam/hairstyle/route.ts
import { checkHairStyleStatus, startHairStyle } from "@/actions/youcam/hair-studio";
import { NextResponse } from "next/server";


// Fast route — no long-running waits
// (Frontend polls status separately)
export const maxDuration = 10;

// ============================================================
// POST — Start a new hairstyle task
// ============================================================
// Body: { imageUrl: string, referenceImageUrl: string }
// Returns: { success, creationId, taskId } or { success: false, error }
// ============================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, referenceImageUrl } = body;

    // Validate input
    if (!imageUrl || !referenceImageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "imageUrl and referenceImageUrl are required",
        },
        { status: 400 }
      );
    }

    // Call the server action
    const result = await startHairStyle({ imageUrl, referenceImageUrl });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[POST /api/youcam/hairstyle]", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Invalid request" },
      { status: 500 }
    );
  }
}

// ============================================================
// GET — Check status of an existing task
// ============================================================
// Query: ?creationId=xxx
// Returns: { success, status, imageUrl? } or { success: false, error }
// ============================================================

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const creationId = searchParams.get("creationId");

    // Validate input
    if (!creationId) {
      return NextResponse.json(
        { success: false, error: "creationId is required" },
        { status: 400 }
      );
    }

    // Call the server action
    const result = await checkHairStyleStatus({ creationId });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[GET /api/youcam/hairstyle]", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}