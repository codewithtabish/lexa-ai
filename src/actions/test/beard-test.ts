// src/actions/beard/beard-test.ts
"use server";

import OpenAI, { toFile } from "openai";

// ═══════════════════════════════════════════════════════════
// OPENAI CLIENT
// ═══════════════════════════════════════════════════════════

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not configured.");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB

// ═══════════════════════════════════════════════════════════
// 🎯 QUALITY TIER — controls cost per image
// ═══════════════════════════════════════════════════════════
//
// low    → $0.009 / image  (~111 images per $1)   ⭐ TESTING NOW
// medium → $0.034 / image  (~29 images per $1)
// high   → $0.133 / image  (~7 images per $1)
//
// ═══════════════════════════════════════════════════════════

const IMAGE_QUALITY: "low" | "medium" | "high" = "low";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface BeardTestInput {
  userImageUrl: string;
  beardReferenceUrl: string;
}

interface BeardTestSuccess {
  success: true;
  resultImageUrl: string;
  analysis: string;
  taskId: null;
  model: string;
  error: null;
}

interface BeardTestError {
  success: false;
  resultImageUrl: null;
  analysis: null;
  taskId: null;
  model: string;
  error: string;
}

export type BeardTestResult = BeardTestSuccess | BeardTestError;

// ═══════════════════════════════════════════════════════════
// IMAGE DOWNLOAD HELPER
// ═══════════════════════════════════════════════════════════

async function downloadImage(
  imageUrl: string,
  label: string
): Promise<{
  buffer: Buffer;
  contentType: string;
  extension: string;
}> {
  const response = await fetch(imageUrl, {
    cache: "no-store",
    headers: {
      Accept: "image/jpeg,image/png,image/webp,image/*",
    },
  });

  if (!response.ok) {
    throw new Error(
      `${label} could not be downloaded. HTTP ${response.status}.`
    );
  }

  const contentType =
    response.headers.get("content-type")?.split(";")[0].trim() || "";

  if (!contentType.startsWith("image/")) {
    throw new Error(`${label} URL did not return an image.`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    throw new Error(`${label} is empty.`);
  }

  if (buffer.length > MAX_IMAGE_SIZE) {
    throw new Error(`${label} is larger than 50MB.`);
  }

  let extension = "jpg";
  if (contentType === "image/png") extension = "png";
  if (contentType === "image/webp") extension = "webp";

  return {
    buffer,
    contentType,
    extension,
  };
}

// ═══════════════════════════════════════════════════════════
// BEARD TEST — MAIN ACTION
// ═══════════════════════════════════════════════════════════

export async function beardTest({
  userImageUrl,
  beardReferenceUrl,
}: BeardTestInput): Promise<BeardTestResult> {
  const MODEL_ANALYSIS = "gpt-4o";
  const MODEL_IMAGE_EDIT = "gpt-image-1.5";

  try {
    // ─── 1. VALIDATE INPUT ───
    if (!userImageUrl) {
      throw new Error("User image URL is required.");
    }
    if (!beardReferenceUrl) {
      throw new Error("Beard reference URL is required.");
    }

    console.log("");
    console.log("══════════════════════════════════════════════");
    console.log("🧔 LEXA AI — BEARD TEST");
    console.log("══════════════════════════════════════════════");
    console.log("👤 User image:", userImageUrl);
    console.log("🧔 Beard reference:", beardReferenceUrl);
    console.log(`⚙️  Quality: ${IMAGE_QUALITY} ($${
      IMAGE_QUALITY === "low"
        ? "0.009"
        : IMAGE_QUALITY === "medium"
          ? "0.034"
          : "0.133"
    }/image)`);

    // ─── 2. DOWNLOAD IMAGES ───
    console.log("");
    console.log("⬇️  Downloading images...");

    const [userImage, beardReference] = await Promise.all([
      downloadImage(userImageUrl, "User image"),
      downloadImage(beardReferenceUrl, "Beard reference"),
    ]);

    console.log("✅ Images downloaded.");

    // ─── 3. ANALYZE WITH OPENAI ───
    console.log("");
    console.log("🧠 Analyzing images with OpenAI...");

    const analysisResponse = await openai.responses.create({
      model: MODEL_ANALYSIS,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `You are LEXA AI's professional facial-hair analysis engine.

IMAGE 1 = USER SELFIE.
IMAGE 2 = DESIRED BEARD REFERENCE.

Analyze both images and create a precise beard transformation specification.

Analyze:
- face orientation
- camera angle
- head position
- lighting
- skin tone
- skin texture
- existing facial hair
- beard density
- mustache
- jawline
- chin structure
- cheek line
- neckline
- sideburn connection
- beard length
- beard shape
- beard fullness
- beard texture
- beard color
- reference beard characteristics

Explain exactly how the reference beard should be adapted to the user's actual face.

IDENTITY PRESERVATION IS CRITICAL.

The final image must preserve:
- identity
- face shape
- facial proportions
- eyes
- eyebrows
- nose
- lips
- ears
- skin tone
- skin texture
- hairstyle
- hairline
- expression
- head position
- camera perspective
- lighting
- background
- clothing

ONLY THE FACIAL HAIR SHOULD CHANGE.

Do not redesign the face.
Do not beautify the person.
Do not change age.
Do not change hairstyle.
Do not change skin.
Do not change clothing.
Do not change background.
Do not change camera angle.
Do not create a different person.

Return a concise technical beard transformation specification.`,
            },
            {
              type: "input_image",
              image_url: userImageUrl,
              detail: "high",
            },
            {
              type: "input_image",
              image_url: beardReferenceUrl,
              detail: "high",
            },
          ],
        },
      ],
      max_output_tokens: 1800,
    });

    const analysis = analysisResponse.output_text;

    if (!analysis || typeof analysis !== "string" || analysis.length === 0) {
      throw new Error("OpenAI returned no beard transformation analysis.");
    }

    console.log("");
    console.log("🧠 OPENAI ANALYSIS:");
    console.log(analysis);

    // ─── 4. PREPARE USER IMAGE FILE ───
    console.log("");
    console.log("🖼️  Preparing user selfie...");

    const userImageFile = await toFile(
      userImage.buffer,
      `lexa-user-selfie.${userImage.extension}`,
      {
        type: userImage.contentType,
      }
    );

    // ═══════════════════════════════════════════════════════════
    // 🎯 OPTIMIZED FOR LOW QUALITY
    // ═══════════════════════════════════════════════════════════
    //
    // At low quality (272 visual tokens), the model has less
    // bandwidth for instructions. So we make the prompt:
    //   1. SHORTER — fewer tokens on text = more on image
    //   2. FRONT-LOADED — key rules first
    //   3. FOCUSED — only the essential beard instructions
    //
    // ═══════════════════════════════════════════════════════════

    const editPrompt = `Edit this photo. Change ONLY the facial hair to match the specified beard style. Keep everything else IDENTICAL.

CRITICAL RULES:
- Same person, same face, same identity
- Same eyes, nose, lips, ears, skin, hairstyle, expression
- Same lighting, background, clothing, camera angle
- Do NOT regenerate the face
- Do NOT beautify or change age
- ONLY modify facial hair

BEARD SPECIFICATION:
${analysis}

The beard must look natural — real individual hairs, correct direction, natural edge transitions on cheeks and neckline. Realistic density, texture, and color that matches the user's existing hair. The result must look like an authentic photo of the same person.

No stickers. No pasted look. No artificial overlay.`;

    // ─── 6. EDIT IMAGE ───
    console.log("");
    console.log("🎨 Editing user selfie...");
    console.log(`🤖 Model: ${MODEL_IMAGE_EDIT}`);
    console.log(`⚙️  Quality: ${IMAGE_QUALITY}`);

    const editResponse = await openai.images.edit({
      model: MODEL_IMAGE_EDIT,
      image: userImageFile,
      prompt: editPrompt,
      input_fidelity: "high", // 🎯 critical — keeps face preserved at any quality
      size: "1024x1024",
      quality: IMAGE_QUALITY,
      n: 1,
    });

    const img = editResponse.data?.[0];
    const resultBase64 = img?.b64_json;

    if (!resultBase64 || typeof resultBase64 !== "string") {
      throw new Error("OpenAI image editing returned no image.");
    }

    const resultImageUrl = `data:image/png;base64,${resultBase64}`;

    // ─── 7. RETURN SUCCESS ───
    console.log("");
    console.log("══════════════════════════════════════════════");
    console.log("✅ BEARD TRANSFORMATION COMPLETE");
    console.log("══════════════════════════════════════════════");

    return {
      success: true,
      resultImageUrl,
      analysis,
      taskId: null,
      model: MODEL_IMAGE_EDIT,
      error: null,
    };
  } catch (error) {
    console.error("");
    console.error("══════════════════════════════════════════════");
    console.error("❌ LEXA BEARD TEST FAILED");
    console.error("══════════════════════════════════════════════");
    console.error(error);

    return {
      success: false,
      resultImageUrl: null,
      analysis: null,
      taskId: null,
      model: MODEL_IMAGE_EDIT,
      error:
        error instanceof Error
          ? error.message
          : "Unknown beard transformation error.",
    };
  }
}