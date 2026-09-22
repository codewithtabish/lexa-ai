// src/lib/hive/client.ts

const HIVE_BASE_URL = "https://api.thehive.ai/api/v3";

// ═══════════════════════════════════════════════════════════
// ALLOWED DIMENSIONS (Hive enforces these exact pairs)
// ═══════════════════════════════════════════════════════════

export const HIVE_ASPECT_DIMENSIONS = {
  "1:1":  { width: 1024, height: 1024 },
  "4:3":  { width: 1280, height: 960 },
  "16:9": { width: 1344, height: 768 },
  "3:4":  { width: 960,  height: 1280 },
  "9:16": { width: 768,  height: 1344 },
} as const;

type AspectKey = keyof typeof HIVE_ASPECT_DIMENSIONS;

export type HiveImageModel =
  | "black-forest-labs/flux-schnell"
  | "hive/flux-schnell-enhanced"
  | "hive/flux-schnell-emoji";

export interface GenerateImageOptions {
  prompt: string;
  model?: HiveImageModel;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
  outputFormat?: "png" | "jpeg";
}

export interface GenerateImageResult {
  imageUrl: string;
  model: HiveImageModel;
  taskId: string;
}

// ─── Ensure valid dimensions ─────────────────────────────────

function getValidDimensions(width: number, height: number) {
  const pairs = Object.values(HIVE_ASPECT_DIMENSIONS);

  const exact = pairs.find((p) => p.width === width && p.height === height);
  if (exact) return exact;

  const targetRatio = width / height;
  let closest = pairs[0];
  let diff = Infinity;

  for (const pair of pairs) {
    const d = Math.abs(pair.width / pair.height - targetRatio);
    if (d < diff) {
      diff = d;
      closest = pair;
    }
  }

  console.warn(
    `[Hive] Adjusted ${width}×${height} → ${closest.width}×${closest.height}`
  );

  return closest;
}

// ─── Headers ─────────────────────────────────────────────────

function getHeaders() {
  const apiKey = process.env.HIVE_API_KEY;
  if (!apiKey) throw new Error("HIVE_API_KEY is not configured.");

  return {
    "Content-Type": "application/json",
    authorization: `Bearer ${apiKey}`,
  };
}

// ─── Generate Image ──────────────────────────────────────────

export async function generateHiveImage({
  prompt,
  model = "hive/flux-schnell-enhanced",
  width = 1024,
  height = 1024,
  steps = 4,
  seed,
  outputFormat = "jpeg",
}: GenerateImageOptions): Promise<GenerateImageResult> {
  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    throw new Error("Prompt is required.");
  }

  const valid = getValidDimensions(width, height);

  // 🎯 Build input — output_format ONLY for non-emoji models
  const isEmojiModel = model === "hive/flux-schnell-emoji";

  const input: Record<string, unknown> = {
    prompt: prompt.trim(),
    image_size: { width: valid.width, height: valid.height },
    num_inference_steps: steps,
    num_images: 1, // ✅ Force single image
    ...(typeof seed === "number" ? { seed } : {}),
  };

  // 🎯 Emoji model: NO output_format, NO output_quality (always transparent PNG)
  // 🎯 Other models: include output_format + output_quality (only for jpeg)
  if (!isEmojiModel) {
    input.output_format = outputFormat;
    if (outputFormat === "jpeg") {
      input.output_quality = 90;
    }
  }

  const body = { input };

  console.log(`[Hive] Generating with ${model}:`, {
    prompt: prompt.slice(0, 60) + (prompt.length > 60 ? "..." : ""),
    size: `${valid.width}×${valid.height}`,
    format: isEmojiModel ? "png (forced)" : outputFormat,
    steps,
  });

  const response = await fetch(`${HIVE_BASE_URL}/${model}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error("[Hive] Error:", response.status, errText);
    throw new Error(
      `Hive API error (${response.status}). ${errText.slice(0, 200)}`
    );
  }

  const data = await response.json();

  const firstOutput = data?.output?.[0];
  const imageUrl = firstOutput?.url || firstOutput;

  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("Hive did not return an image.");
  }

  console.log("[Hive] ✅ Generated:", imageUrl.slice(0, 80) + "...");

  return {
    imageUrl,
    model,
    taskId: data?.id || "",
  };
}

// ─── Generate Emoji ──────────────────────────────────────────

export async function generateHiveEmoji({
  prompt,
  size = 1024,
  steps = 4,
  seed,
}: {
  prompt: string;
  size?: number;
  steps?: number;
  seed?: number;
}): Promise<GenerateImageResult> {
  return generateHiveImage({
    prompt,
    model: "hive/flux-schnell-emoji",
    width: size,
    height: size,
    steps,
    seed,
  });
}