// src/lib/upload/upload-hair-style.ts
import s3Client from "@/lib/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import sharp from "sharp";

// ============================================
// CONFIG
// ============================================

const OUTPUT_SIZE = 1024;         // 1024 × 1024 square canvas
const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10 MB max input
const SUBFOLDER = "hair-styles";  // files go to lexa/hair-styles/...

// ============================================
// TYPES
// ============================================

interface UploadHairStyleOptions {
  file: Buffer;
  fileName?: string;
}

interface UploadHairStyleResult {
  url: string;
  key: string;
  width: number;
  height: number;
  format: "png";
  size: number;
}

// ============================================
// MAIN UPLOAD FUNCTION
// ============================================

export async function uploadHairStyleImage({
  file,
  fileName,
}: UploadHairStyleOptions): Promise<UploadHairStyleResult> {
  // ─────────────────────────────────────────
  // 1. Validate buffer
  // ─────────────────────────────────────────
  if (!Buffer.isBuffer(file)) {
    throw new Error("Uploaded image is not a valid Buffer.");
  }

  if (file.length === 0) {
    throw new Error("Uploaded image is empty.");
  }

  if (file.length > MAX_INPUT_BYTES) {
    throw new Error(
      `Image is too large. Maximum ${MAX_INPUT_BYTES / (1024 * 1024)} MB allowed.`
    );
  }

  // ─────────────────────────────────────────
  // 2. Verify image with sharp
  // ─────────────────────────────────────────
  let metadata;
  try {
    metadata = await sharp(file).metadata();
  } catch (error) {
    console.error("Sharp could not read hair style image:", error);
    throw new Error("The uploaded file is not a valid or supported image.");
  }

  if (!metadata.format) {
    throw new Error("Unable to detect the hair style image format.");
  }

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to detect the image dimensions.");
  }

  console.log("Hair style image detected:", {
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    size: file.length,
    hasAlpha: metadata.hasAlpha,
  });

  // ─────────────────────────────────────────
  // 3. Process image
  //
  // - Preserve aspect ratio (fit: contain)
  // - Transparent background padding
  // - Output: 1024 × 1024 PNG
  // - Optimized for small file size
  // ─────────────────────────────────────────
  let processedImage: Buffer;

  try {
    processedImage = await sharp(file)
      // Respect EXIF orientation (auto-rotate portrait photos)
      .rotate()

      // Resize to 1024 × 1024 canvas, keep aspect ratio,
      // pad the shorter side with TRANSPARENT pixels
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
        fit: "contain",
        position: "center",
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent
      })

      // Output as PNG with max compression
      // palette:true + quality:90 → huge file size reduction
      // while preserving transparency & visual quality
      .png({
        compressionLevel: 9,       // max compression (0–9)
        adaptiveFiltering: true,   // better compression for photos
        palette: true,             // indexed color → much smaller files
        quality: 90,               // palette quantization quality
        effort: 10,                // max effort (slower but smallest)
      })

      .toBuffer();
  } catch (error) {
    console.error("Hair style image processing failed:", error);
    throw new Error("Failed to process the hair style image.");
  }

  if (!processedImage || processedImage.length === 0) {
    throw new Error("Image processing produced an empty image.");
  }

  const sizeKB = (processedImage.length / 1024).toFixed(1);
  console.log(`Hair style image processed: ${sizeKB} KB`);

  // ─────────────────────────────────────────
  // 4. Generate unique filename
  // ─────────────────────────────────────────
  const uniqueId = randomUUID().split("-")[0];

  const cleanFileName = fileName
    ? fileName
        .replace(/\.[^/.]+$/, "")              // strip extension
        .replace(/[^a-zA-Z0-9-_]/g, "-")       // sanitize
        .replace(/-+/g, "-")                   // collapse dashes
        .replace(/^-|-$/g, "")                 // trim dashes
        .slice(0, 60)                          // limit length
    : "hair-style";

  const finalFileName = `${cleanFileName}-${uniqueId}.png`;

  // ─────────────────────────────────────────
  // 5. Build S3 key
  //    Path: lexa/hair-styles/<name>-<id>.png
  // ─────────────────────────────────────────
  const projectFolder = process.env.AWS_S3_PROJECT_FOLDER || "lexa";
  const key = `${projectFolder}/${SUBFOLDER}/${finalFileName}`;

  // ─────────────────────────────────────────
  // 6. Upload to S3
  // ─────────────────────────────────────────
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: processedImage,
        ContentType: "image/png",
        // Immutable because filename has unique ID
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
  } catch (error) {
    console.error("Hair style S3 upload failed:", error);
    throw new Error("Failed to upload the hair style image to storage.");
  }

  // ─────────────────────────────────────────
  // 7. Build CloudFront URL
  // ─────────────────────────────────────────
  const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL?.replace(/\/$/, "");

  if (!cloudFrontUrl) {
    throw new Error("AWS_CLOUDFRONT_URL is not configured.");
  }

  const url = `${cloudFrontUrl}/${key}`;

  // ─────────────────────────────────────────
  // 8. Return result
  // ─────────────────────────────────────────
  return {
    url,
    key,
    width: OUTPUT_SIZE,
    height: OUTPUT_SIZE,
    format: "png",
    size: processedImage.length,
  };
}