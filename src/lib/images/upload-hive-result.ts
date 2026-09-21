// src/lib/images/upload-hive-result.ts
"use server";

import s3Client from "@/lib/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// ═══════════════════════════════════════════════════════════
// UPLOAD HIVE RESULT TO S3 (from URL)
// ═══════════════════════════════════════════════════════════

interface UploadHiveResultOptions {
  /** URL of the generated image (from Hive's CDN) */
  sourceUrl: string;

  /** Optional content type override */
  contentType?: string;

  /** Filename prefix */
  fileName?: string;

  /** Sub-folder (e.g., "ai-images" or "emojis") */
  feature?: string;
}

export async function uploadHiveResult({
  sourceUrl,
  contentType,
  fileName,
  feature = "hive",
}: UploadHiveResultOptions) {
  // ─── 1. Download from Hive's CDN ───
  if (!sourceUrl || typeof sourceUrl !== "string") {
    throw new Error("Invalid source URL.");
  }

  console.log(
    "[uploadHiveResult] Downloading:",
    sourceUrl.slice(0, 80) + "..."
  );

  let response: Response;
  try {
    response = await fetch(sourceUrl, { cache: "no-store" });
  } catch (err: any) {
    console.error("[uploadHiveResult] Fetch failed:", err.message);
    throw new Error("Failed to download image from Hive.");
  }

  if (!response.ok) {
    console.error(
      "[uploadHiveResult] Download failed:",
      response.status,
      response.statusText
    );
    throw new Error(
      `Download failed (${response.status}). URL may have expired.`
    );
  }

  // ─── 2. Read as buffer ───
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    throw new Error("Downloaded image is empty.");
  }

  console.log(
    `[uploadHiveResult] Buffer: ${(buffer.length / 1024).toFixed(0)} KB`
  );

  // ─── 3. Detect content type ───
  const detectedContentType =
    contentType ||
    response.headers.get("content-type")?.split(";")[0] ||
    (sourceUrl.match(/\.png(\?|$)/i) ? "image/png" : "image/jpeg");

  const extension = detectedContentType.includes("png") ? "png" : "jpg";

  // ─── 4. Filename + S3 key ───
  const uniqueId = randomUUID().split("-")[0];

  const cleanFileName = fileName
    ? fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60)
    : "hive";

  const finalFileName = `${cleanFileName}-${uniqueId}.${extension}`;

  const projectFolder = process.env.AWS_S3_PROJECT_FOLDER || "lexa";
  const key = `${projectFolder}/${feature}/${finalFileName}`;

  // ─── 5. Upload to your S3 ───
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: detectedContentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  // ─── 6. Build CloudFront URL ───
  const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL?.replace(/\/$/, "");

  if (!cloudFrontUrl) {
    throw new Error("AWS_CLOUDFRONT_URL is not configured.");
  }

  const url = `${cloudFrontUrl}/${key}`;

  console.log("[uploadHiveResult] ✅ Uploaded:", url);

  return {
    url,
    key,
    size: buffer.length,
    format: extension as "png" | "jpg",
  };
}