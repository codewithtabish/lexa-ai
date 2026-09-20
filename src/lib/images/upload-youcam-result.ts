// src/lib/images/upload-youcam-result.ts
"use server";

import s3Client from "@/lib/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const SUBFOLDER = "results";
const MAX_RESULT_BYTES = 15 * 1024 * 1024; // 15 MB safety limit

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface UploadYouCamResultOptions {
  /** The temporary YouCam URL (expires in ~2 hours) */
  youCamUrl: string;

  /** Optional filename prefix */
  fileName?: string;

  /** Feature name for folder organization (e.g., "hair-styles") */
  feature?: string;
}

interface UploadYouCamResultReturn {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

// ═══════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════

export async function uploadYouCamResult({
  youCamUrl,
  fileName,
  feature = "results",
}: UploadYouCamResultOptions): Promise<UploadYouCamResultReturn> {
  // ─────────────────────────────────────────
  // 1. Validate URL
  // ─────────────────────────────────────────
  if (!youCamUrl || typeof youCamUrl !== "string") {
    throw new Error("Invalid YouCam URL provided.");
  }

  console.log(
    "[uploadYouCamResult] Downloading:",
    youCamUrl.slice(0, 80) + "..."
  );

  // ─────────────────────────────────────────
  // 2. Download from YouCam (before URL expires)
  // ─────────────────────────────────────────
  let response: Response;
  try {
    response = await fetch(youCamUrl, {
      method: "GET",
      cache: "no-store",
    });
  } catch (err: any) {
    console.error("[uploadYouCamResult] Fetch failed:", err.message);
    throw new Error("Failed to download image from YouCam.");
  }

  if (!response.ok) {
    console.error(
      "[uploadYouCamResult] YouCam returned:",
      response.status,
      response.statusText
    );
    throw new Error(
      `YouCam download failed (${response.status}). URL may have expired.`
    );
  }

  // ─────────────────────────────────────────
  // 3. Read as buffer
  // ─────────────────────────────────────────
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    throw new Error("Downloaded image is empty.");
  }

  if (buffer.length > MAX_RESULT_BYTES) {
    throw new Error(
      `Result image is too large (${(buffer.length / 1024 / 1024).toFixed(1)} MB).`
    );
  }

  // Determine content type from response or URL
  const contentType =
    response.headers.get("content-type")?.split(";")[0] ||
    (youCamUrl.match(/\.png(\?|$)/i) ? "image/png" : "image/jpeg");

  const extension = contentType.includes("png") ? "png" : "jpg";

  console.log(
    `[uploadYouCamResult] Downloaded ${(buffer.length / 1024).toFixed(0)} KB (${contentType})`
  );

  // ─────────────────────────────────────────
  // 4. Generate unique filename
  // ─────────────────────────────────────────
  const uniqueId = randomUUID().split("-")[0];

  const cleanFileName = fileName
    ? fileName
        .replace(/\.[^/.]+$/, "") // strip extension
        .replace(/[^a-zA-Z0-9-_]/g, "-") // sanitize
        .replace(/-+/g, "-") // collapse dashes
        .replace(/^-|-$/g, "") // trim dashes
        .slice(0, 60) // limit length
    : "result";

  const finalFileName = `${cleanFileName}-${uniqueId}.${extension}`;

  // ─────────────────────────────────────────
  // 5. Build S3 key
  //    Path: lexa/<feature>/results/<name>-<id>.<ext>
  // ─────────────────────────────────────────
  const projectFolder = process.env.AWS_S3_PROJECT_FOLDER || "lexa";
  const key = `${projectFolder}/${feature}/${SUBFOLDER}/${finalFileName}`;

  // ─────────────────────────────────────────
  // 6. Upload to S3
  // ─────────────────────────────────────────
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
  } catch (err: any) {
    console.error("[uploadYouCamResult] S3 upload failed:", err.message);
    throw new Error("Failed to upload result to storage.");
  }

  // ─────────────────────────────────────────
  // 7. Build CloudFront URL
  // ─────────────────────────────────────────
  const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL?.replace(/\/$/, "");

  if (!cloudFrontUrl) {
    throw new Error("AWS_CLOUDFRONT_URL is not configured.");
  }

  const url = `${cloudFrontUrl}/${key}`;

  console.log("[uploadYouCamResult] ✅ Uploaded:", url);

  // ─────────────────────────────────────────
  // 8. Return
  // ─────────────────────────────────────────
  return {
    url,
    key,
    size: buffer.length,
    contentType,
  };
}