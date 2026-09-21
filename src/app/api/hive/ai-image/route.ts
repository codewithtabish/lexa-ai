// src/app/api/hive/ai-image/route.ts
import { generateAIImage } from "@/actions/aiimage/ai-image";
import { NextResponse } from "next/server";

// export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, style, aspect } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required." },
        { status: 400 }
      );
    }

    const result = await generateAIImage({ prompt, style, aspect });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[POST /api/hive/ai-image]", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Invalid request" },
      { status: 500 }
    );
  }
}