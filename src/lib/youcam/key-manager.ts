// src/lib/youcam/key-manager.ts
"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// ═══════════════════════════════════════════════════════════
// ⚙️ CONFIG
// ═══════════════════════════════════════════════════════════

const TABLE_NAME = "youcam-keys";
const ACTIVE_KEY_ID = "active";

/** 🎯 Only use keys with 3+ credits. Skip 2 or fewer. */
const MIN_CREDITS = 3;

/** 🎯 Memory cache TTL — 45s works well with serverless. */
const MEMORY_CACHE_TTL = 45 * 1000;

/** 🎯 Parallel batch size for checking keys. */
const BATCH_SIZE = 25;

/** 🎯 Per-key HTTP timeout. */
const KEY_TIMEOUT_MS = 3500;

/** 🎯 Retry config for transient failures. */
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 400;

/** 🎯 Circuit breaker — if YouCam is down, stop hammering. */
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_COOLDOWN_MS = 30 * 1000;

/** 🎯 Max time to spend finding a key (protects Vercel 60s limit). */
const MAX_SEARCH_MS = 45 * 1000;

// ═══════════════════════════════════════════════════════════
// 🔌 DYNAMODB CLIENT
// ═══════════════════════════════════════════════════════════

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  requestHandler: {
    requestTimeout: 5000,
    connectionTimeout: 3000,
  },
  maxAttempts: 3,
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// ═══════════════════════════════════════════════════════════
// 🧠 IN-MEMORY STATE (per serverless instance)
// ═══════════════════════════════════════════════════════════

let cachedKey: {
  apiKey: string;
  remaining: number;
  index: number;
  fetchedAt: number;
} | null = null;

/** Where the next rotation search starts. */
let nextSearchIndex = 0;

/** Prevent duplicate concurrent refreshes in the same instance. */
let refreshInFlight: Promise<KeyResult> | null = null;

/** Circuit breaker state. */
let circuitFailures = 0;
let circuitOpenUntil = 0;

// ═══════════════════════════════════════════════════════════
// 📐 TYPES
// ═══════════════════════════════════════════════════════════

type ActiveKeyData = {
  id: string;
  apiKey: string;
  remaining: number;
  index: number;
  updatedAt: string;
};

export type KeyResult =
  | {
      success: true;
      apiKey: string;
      remaining: number;
      index: number;
      updatedAt: string;
    }
  | {
      success: false;
      error: string;
      code?: KeyErrorCode;
    };

export type KeyErrorCode =
  | "NO_KEYS_IN_ENV"
  | "ALL_KEYS_EXHAUSTED"
  | "DYNAMODB_ERROR"
  | "CIRCUIT_OPEN"
  | "UNKNOWN";

// ═══════════════════════════════════════════════════════════
// 🪵 LOGGER — structured, easy to filter
// ═══════════════════════════════════════════════════════════

const LOG_PREFIX = "[KeyManager]";

function logInfo(msg: string, meta?: Record<string, unknown>) {
  if (meta) {
    console.log(`${LOG_PREFIX} ${msg}`, meta);
  } else {
    console.log(`${LOG_PREFIX} ${msg}`);
  }
}

function logWarn(msg: string, meta?: Record<string, unknown>) {
  if (meta) {
    console.warn(`${LOG_PREFIX} ⚠️ ${msg}`, meta);
  } else {
    console.warn(`${LOG_PREFIX} ⚠️ ${msg}`);
  }
}

function logError(msg: string, meta?: Record<string, unknown>) {
  if (meta) {
    console.error(`${LOG_PREFIX} ❌ ${msg}`, meta);
  } else {
    console.error(`${LOG_PREFIX} ❌ ${msg}`);
  }
}

// ═══════════════════════════════════════════════════════════
// 🔧 HELPERS
// ═══════════════════════════════════════════════════════════

function getAllKeys(): string[] {
  const raw = process.env.YOUCAM_API_KEYS || "";
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ═══════════════════════════════════════════════════════════
// 📡 FETCH CREDIT (with retry + timeout)
// ═══════════════════════════════════════════════════════════
//
// Returns:
//   >= 0 → valid credit count
//   -1   → invalid key (401/403) — blacklist
//   -2   → network/timeout/error — retry later

async function fetchCredit(apiKey: string): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), KEY_TIMEOUT_MS);

  try {
    const res = await fetch(
      "https://yce-api-01.makeupar.com/s2s/v1.0/client/credit",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
        signal: controller.signal,
      }
    );

    clearTimeout(timer);

    if (res.status === 401 || res.status === 403) return -1;
    if (!res.ok) return -2;

    const data = await res.json();
    const amount =
      data?.results?.[0]?.amount ??
      data?.data?.results?.[0]?.amount ??
      data?.amount ??
      0;

    return typeof amount === "number" ? amount : 0;
  } catch {
    clearTimeout(timer);
    return -2;
  }
}

async function fetchCreditWithRetry(apiKey: string): Promise<number> {
  let lastResult = -2;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    lastResult = await fetchCredit(apiKey);

    // Valid or blacklisted → don't retry
    if (lastResult >= 0 || lastResult === -1) return lastResult;

    if (attempt < MAX_RETRIES) {
      const backoff = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      await delay(backoff);
    }
  }

  return lastResult;
}

// ═══════════════════════════════════════════════════════════
// 🧹 CLEAR ACTIVE KEY FROM DYNAMODB
// ═══════════════════════════════════════════════════════════

async function clearActiveKeyFromDB(): Promise<void> {
  try {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id: ACTIVE_KEY_ID },
      })
    );
    logInfo("🧹 Cleared active key from DynamoDB");
  } catch (err: any) {
    logWarn("Failed to clear active key (non-critical)", {
      error: err.message,
    });
  }
}

// ═══════════════════════════════════════════════════════════
// 🔍 PARALLEL BATCH SEARCH — fast for 1000+ keys
// ═══════════════════════════════════════════════════════════

async function findBestKey(
  keys: string[],
  startIndex: number
): Promise<{ index: number; apiKey: string; remaining: number } | null> {
  const total = keys.length;
  if (total === 0) return null;

  const searchStart = Date.now();

  // 🎯 Build rotation order — start from startIndex, wrap around
  const orderedIndices: number[] = [];
  for (let i = 0; i < total; i++) {
    orderedIndices.push((startIndex + i) % total);
  }

  // 🎯 Process in parallel batches with early exit
  for (let b = 0; b < orderedIndices.length; b += BATCH_SIZE) {
    // 🎯 Guard: don't exceed max search time
    if (Date.now() - searchStart > MAX_SEARCH_MS) {
      logWarn(`Search timeout after ${Date.now() - searchStart}ms — aborting`, {
        checkedBatches: Math.floor(b / BATCH_SIZE),
        totalBatches: Math.ceil(total / BATCH_SIZE),
      });
      return null;
    }

    const batch = orderedIndices.slice(b, b + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (idx) => {
        const remaining = await fetchCreditWithRetry(keys[idx]);
        return { index: idx, remaining };
      })
    );

    // 🎯 Filter valid keys (>= MIN_CREDITS), sort best-first
    const valid = results
      .filter((r) => r.remaining >= MIN_CREDITS)
      .sort((a, b) => b.remaining - a.remaining);

    if (valid.length > 0) {
      const best = valid[0];
      return {
        index: best.index,
        apiKey: keys[best.index],
        remaining: best.remaining,
      };
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════
// 🎯 GET ACTIVE KEY
// ═══════════════════════════════════════════════════════════

export async function getActiveYouCamKey(): Promise<KeyResult> {
  // ─── Circuit breaker check ───
  if (Date.now() < circuitOpenUntil) {
    return {
      success: false,
      error: "YouCam API circuit open — try again shortly",
      code: "CIRCUIT_OPEN",
    };
  }

  // ─── Memory cache hit ───
  if (
    cachedKey &&
    Date.now() - cachedKey.fetchedAt < MEMORY_CACHE_TTL &&
    cachedKey.remaining >= MIN_CREDITS
  ) {
    return {
      success: true,
      apiKey: cachedKey.apiKey,
      remaining: cachedKey.remaining,
      index: cachedKey.index,
      updatedAt: new Date(cachedKey.fetchedAt).toISOString(),
    };
  }

  // ─── DynamoDB lookup ───
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: ACTIVE_KEY_ID },
      })
    );

    if (!result.Item) {
      logInfo("No stored active key — performing full refresh");
      return await refreshActiveYouCamKey(0);
    }

    const item = result.Item as ActiveKeyData;

    // 🎯 Reuse stored key if it still has >= MIN_CREDITS
    if (item.remaining >= MIN_CREDITS) {
      cachedKey = {
        apiKey: item.apiKey,
        remaining: item.remaining,
        index: item.index,
        fetchedAt: Date.now(),
      };
      nextSearchIndex = item.index;

      return {
        success: true,
        apiKey: item.apiKey,
        remaining: item.remaining,
        index: item.index,
        updatedAt: item.updatedAt,
      };
    }

    // 🎯 Key below MIN → rotate forward
    logInfo(
      `Key #${item.index} has ${item.remaining} credits (< ${MIN_CREDITS}) — rotating to next`
    );

    return await refreshActiveYouCamKey(item.index + 1);
  } catch (error: any) {
    logError("DynamoDB lookup failed", { error: error.message });
    return {
      success: false,
      error: error.message || "Failed to get active key",
      code: "DYNAMODB_ERROR",
    };
  }
}

// ═══════════════════════════════════════════════════════════
// 💳 CONSUME CREDIT
// ═══════════════════════════════════════════════════════════

export async function consumeCredit(cost: number = 1): Promise<{
  success: boolean;
  remaining?: number | null;
  error?: string;
}> {
  logInfo(`Consuming ${cost} credit(s)`);

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: ACTIVE_KEY_ID },
        UpdateExpression:
          "SET remaining = remaining - :cost, updatedAt = :now",
        ExpressionAttributeValues: {
          ":cost": cost,
          ":now": new Date().toISOString(),
        },
        ConditionExpression: "remaining >= :cost",
        ReturnValues: "ALL_NEW",
      })
    );

    const newRemaining = result.Attributes?.remaining ?? null;
    logInfo(`DynamoDB remaining → ${newRemaining}`);

    if (cachedKey) {
      cachedKey.remaining = Math.max(0, cachedKey.remaining - cost);
    }

    return { success: true, remaining: newRemaining };
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      logWarn("Not enough credits on active key — will rotate next");
      cachedKey = null;
      return { success: false, error: "KEY_EXHAUSTED" };
    }
    logError("consumeCredit failed", { error: error.message });
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════
// 🚫 MARK EXHAUSTED
// ═══════════════════════════════════════════════════════════

export async function markKeyExhausted(): Promise<KeyResult> {
  const current = cachedKey;

  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: ACTIVE_KEY_ID },
        UpdateExpression: "SET remaining = :zero, updatedAt = :now",
        ExpressionAttributeValues: {
          ":zero": 0,
          ":now": new Date().toISOString(),
        },
      })
    );

    cachedKey = null;
    logInfo("Marked current key as exhausted");

    const nextIndex = current ? current.index + 1 : nextSearchIndex;
    return await refreshActiveYouCamKey(nextIndex);
  } catch (error: any) {
    logError("Failed to mark key exhausted", { error: error.message });
    return {
      success: false,
      error: error.message,
      code: "DYNAMODB_ERROR",
    };
  }
}

// ═══════════════════════════════════════════════════════════
// 🔄 REFRESH — parallel, fast, resets on all-exhausted
// ═══════════════════════════════════════════════════════════

export async function refreshActiveYouCamKey(
  startIndex?: number
): Promise<KeyResult> {
  // 🎯 Deduplicate concurrent refreshes
  if (refreshInFlight) {
    logInfo("Refresh already in-flight — awaiting existing");
    return refreshInFlight;
  }

  refreshInFlight = (async (): Promise<KeyResult> => {
    try {
      const keys = getAllKeys();

      if (keys.length === 0) {
        return {
          success: false,
          error: "No YOUCAM_API_KEYS found in environment",
          code: "NO_KEYS_IN_ENV",
        };
      }

      const start =
        typeof startIndex === "number" ? startIndex : nextSearchIndex;

      const startNorm = ((start % keys.length) + keys.length) % keys.length;

      logInfo(
        `Searching ${keys.length} key(s) from #${startNorm} in batches of ${BATCH_SIZE}...`
      );

      const t0 = Date.now();
      const best = await findBestKey(keys, startNorm);
      const elapsed = Date.now() - t0;

      // ═══════════════════════════════════════════
      // 🎯 ALL KEYS EXHAUSTED — reset
      // ═══════════════════════════════════════════
      if (!best) {
        logError(
          `All ${keys.length} keys have < ${MIN_CREDITS} credits — checked in ${elapsed}ms`
        );

        await clearActiveKeyFromDB();

        cachedKey = null;
        nextSearchIndex = 0;

        // 🎯 Circuit breaker
        circuitFailures++;
        if (circuitFailures >= CIRCUIT_BREAKER_THRESHOLD) {
          circuitOpenUntil = Date.now() + CIRCUIT_BREAKER_COOLDOWN_MS;
          logWarn(
            `Circuit opened — cooling down for ${CIRCUIT_BREAKER_COOLDOWN_MS}ms`
          );
        }

        logInfo("Reset — next request will start from key #0");

        return {
          success: false,
          error: `All API keys have low credits (need ${MIN_CREDITS}+)`,
          code: "ALL_KEYS_EXHAUSTED",
        };
      }

      // ═══════════════════════════════════════════
      // ✅ FOUND KEY — persist + cache
      // ═══════════════════════════════════════════
      const data: ActiveKeyData = {
        id: ACTIVE_KEY_ID,
        apiKey: best.apiKey,
        remaining: best.remaining,
        index: best.index,
        updatedAt: new Date().toISOString(),
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: data,
        })
      );

      cachedKey = {
        apiKey: best.apiKey,
        remaining: best.remaining,
        index: best.index,
        fetchedAt: Date.now(),
      };

      nextSearchIndex = best.index;

      // 🎯 Reset circuit breaker on success
      circuitFailures = 0;
      circuitOpenUntil = 0;

      logInfo(
        `Active key → #${best.index} (${best.remaining} credits) — found in ${elapsed}ms`
      );

      return {
        success: true,
        apiKey: best.apiKey,
        remaining: best.remaining,
        index: best.index,
        updatedAt: data.updatedAt,
      };
    } catch (error: any) {
      logError("Refresh failed", { error: error.message });
      return {
        success: false,
        error: error.message || "Failed to refresh active key",
        code: "UNKNOWN",
      };
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

// ═══════════════════════════════════════════════════════════
// 🩺 DIAGNOSTICS — for admin/health endpoints
// ═══════════════════════════════════════════════════════════

export async function getKeyManagerDiagnostics(): Promise<{
  envKeys: number;
  cachedKeyIndex: number | null;
  cachedKeyRemaining: number | null;
  nextSearchIndex: number;
  circuitOpen: boolean;
  circuitFailures: number;
  minCredits: number;
}> {
  return {
    envKeys: getAllKeys().length,
    cachedKeyIndex: cachedKey?.index ?? null,
    cachedKeyRemaining: cachedKey?.remaining ?? null,
    nextSearchIndex,
    circuitOpen: Date.now() < circuitOpenUntil,
    circuitFailures,
    minCredits: MIN_CREDITS,
  };
}