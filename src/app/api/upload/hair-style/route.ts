// src/app/api/upload/hair-style/route.ts
import { uploadHairStyleAction } from "@/actions/images/uplaod-hair-style-action";
import { NextResponse } from "next/server";

export const maxDuration = 30;
// export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════
// POST — Upload hair style image
// ═══════════════════════════════════════════

export async function POST(req: Request) {
  try {
    // 1. Parse FormData
    const formData = await req.formData();

    // 2. Check file exists
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file uploaded." },
        { status: 400 }
      );
    }

    // 3. Run the upload
    const result = await uploadHairStyleAction(formData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[POST /api/upload/hair-style]", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Upload failed." },
      { status: 500 }
    );
  }
}