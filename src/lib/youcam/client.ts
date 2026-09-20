// src/lib/youcam/client.ts
"use server";

import {
  getActiveYouCamKey,
  consumeCredit,
  markKeyExhausted,
} from "./key-manager";

const BASE_URL = "https://yce-api-01.makeupar.com/s2s/v2.0/task";
const MIN_KEY_CREDITS = 3;

// ═══════════════════════════════════════════════════════════
// PRE-VALIDATE
// ═══════════════════════════════════════════════════════════

async function getRealCredits(apiKey: string): Promise<number> {
  try {
    const res = await fetch(
      "https://yce-api-01.makeupar.com/s2s/v1.0/client/credit",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      }
    );

    const data = await res.json();
    if (!res.ok) return 0;

    return (
      data?.results?.[0]?.amount ??
      data?.data?.results?.[0]?.amount ??
      data?.amount ??
      0
    );
  } catch {
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════
// START TASK
// ═══════════════════════════════════════════════════════════

export async function startTask(
  endpoint: string,
  body: Record<string, unknown>,
  creditCost: number = 1
): Promise<string> {
  const MAX_RETRIES = 3;
  const requiredCredits = Math.max(creditCost, MIN_KEY_CREDITS);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(
      `[startTask] Attempt ${attempt}/${MAX_RETRIES} (cost=${creditCost})`
    );

    const keyResult = await getActiveYouCamKey();
    if (!keyResult.success) {
      // ✅ TypeScript now knows `error` exists here
      throw new Error(keyResult.error || "No available YouCam API key");
    }

    const realCredits = await getRealCredits(keyResult.apiKey);
    console.log(
      `[startTask] Real credits: ${realCredits} (need ${requiredCredits})`
    );

    if (realCredits < requiredCredits) {
      console.warn(
        `[startTask] ⚠️ Insufficient credits — pre-rotating (no waste)`
      );
      await markKeyExhausted();
      continue;
    }

    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keyResult.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      const taskId = data?.data?.task_id;
      if (!taskId) throw new Error("task_id not found");

      await consumeCredit(creditCost);
      console.log(
        `[startTask] ✅ Task started: ${taskId} (deducted ${creditCost})`
      );
      return taskId;
    }

    if (
      data?.error_code === "CreditInsufficiency" ||
      (typeof data?.error === "string" &&
        data.error.toLowerCase().includes("credit"))
    ) {
      console.warn(`[startTask] ⚠️ CreditInsufficiency — rotating`);
      await markKeyExhausted();
      continue;
    }

    console.error("Start Task Failed:", data);
    throw new Error(
      data?.message || data?.error || `Failed to start task (${response.status})`
    );
  }

  throw new Error("All YouCam API keys are exhausted.");
}

// ═══════════════════════════════════════════════════════════
// CHECK TASK STATUS
// ═══════════════════════════════════════════════════════════

export async function checkTaskStatus(
  endpoint: string,
  taskId: string
): Promise<{ status: string; results?: any }> {
  const result = await getActiveYouCamKey();
  if (!result.success) {
    // ✅ TypeScript now knows `error` exists here
    throw new Error(result.error || "No available YouCam API key");
  }

  const response = await fetch(`${BASE_URL}/${endpoint}/${taskId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${result.apiKey}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to check task status");
  }

  return {
    status: data?.data?.task_status,
    results: data?.data?.results,
  };
}