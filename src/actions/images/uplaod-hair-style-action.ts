// src/actions/upload/upload-hair-style.ts
"use server";

import { uploadHairStyleImage } from "@/lib/images/upload-hair-style";


// ============================================
// TYPES
// ============================================

type UploadHairStyleSuccess = {
  success: true;
  data: {
    url: string;
    key: string;
    width: number;
    height: number;
    format: "png";
    size: number;
  };
};

type UploadHairStyleError = {
  success: false;
  error: string;
};

export type UploadHairStyleResult =
  | UploadHairStyleSuccess
  | UploadHairStyleError;

// ============================================
// CONFIG
// ============================================

// 10 MB maximum
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed input types (Sharp will convert to PNG)
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
]);

// ============================================
// SERVER ACTION
// ============================================

export async function uploadHairStyleAction(
  formData: FormData
): Promise<UploadHairStyleResult> {
  try {
    // ───────────────────────────────────────
    // 1. Extract file from FormData
    // ───────────────────────────────────────
    const value = formData.get("file");

    if (!(value instanceof File)) {
      return {
        success: false,
        error: "No valid image was provided.",
      };
    }

    // ───────────────────────────────────────
    // 2. Validate size
    // ───────────────────────────────────────
    if (value.size === 0) {
      return {
        success: false,
        error: "The selected image is empty.",
      };
    }

    if (value.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Image must be smaller than 10 MB.",
      };
    }

    // ───────────────────────────────────────
    // 3. Validate MIME type
    // ───────────────────────────────────────
    if (!ALLOWED_TYPES.has(value.type)) {
      return {
        success: false,
        error:
          "Unsupported image type. Please upload JPEG, PNG, WebP, HEIC, or AVIF.",
      };
    }

    // ───────────────────────────────────────
    // 4. Convert File → Buffer
    // ───────────────────────────────────────
    const arrayBuffer = await value.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return {
        success: false,
        error: "The uploaded image contains no data.",
      };
    }

    // ───────────────────────────────────────
    // 5. Debug info
    // ───────────────────────────────────────
    console.log("[uploadHairStyleAction] Received:", {
      name: value.name,
      type: value.type,
      size: value.size,
      bufferSize: buffer.length,
    });

    // ───────────────────────────────────────
    // 6. Process + upload to S3
    // ───────────────────────────────────────
    const result = await uploadHairStyleImage({
      file: buffer,
      fileName: value.name,
    });

    // ───────────────────────────────────────
    // 7. Success
    // ───────────────────────────────────────
    console.log("[uploadHairStyleAction] ✅ Uploaded:", result.url);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[uploadHairStyleAction] ❌ Failed:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload image. Please try again.",
    };
  }
}