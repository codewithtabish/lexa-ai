// src/lib/images/prepare-youcam-input.ts
"use server";

import sharp from "sharp";

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const OUTPUT_SIZE = 1024; // Square 1024×1024
const MAX_SIZE = 1024;

// ═══════════════════════════════════════════════════════════
// PREPARE INPUT FOR YOUCAM
// ═══════════════════════════════════════════════════════════
// 1. Auto-orient (EXIF)
// 2. Resize to fit 1024×1024 (contain)
// 3. Add transparent/white padding to square
// 4. Sharpen slightly
// 5. Convert to high-quality JPEG
// 6. Return buffer ready for YouCam

export async function prepareYouCamInput(
  inputBuffer: Buffer
): Promise<Buffer> {
  try {
    const metadata = await sharp(inputBuffer).metadata();

    console.log("[prepareYouCamInput] Input:", {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      hasAlpha: metadata.hasAlpha,
    });

    // ─── Process ───
    const processed = await sharp(inputBuffer)
      // Respect EXIF orientation
      .rotate()

      // Resize to fit within 1024×1024 (keep aspect, no crop)
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
        fit: "contain",
        position: "center",
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // white bg
      })

      // Slight sharpen for better AI detection
      .sharpen({ sigma: 0.5 })

      // Output JPEG (YouCam prefers JPEG)
      .jpeg({
        quality: 92,
        progressive: true,
        mozjpeg: true,
      })

      .toBuffer();

    console.log(
      `[prepareYouCamInput] ✅ Prepared: ${(processed.length / 1024).toFixed(0)} KB`
    );

    return processed;
  } catch (err: any) {
    console.error("[prepareYouCamInput] Error:", err.message);
    throw new Error("Failed to prepare image for YouCam.");
  }
}