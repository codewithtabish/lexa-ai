// src/lib/youcam/key-manager.ts
"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const TABLE_NAME = "youcam-keys";
const ACTIVE_KEY_ID = "active";
const MIN_CREDITS = 3; // 🔺 Raised to 3 (covers max feature cost)
const MEMORY_CACHE_TTL = 60 * 1000;

// ═══════════════════════════════════════════════════════════
// DYNAMODB CLIENT
// ═══════════════════════════════════════════════════════════

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

// ═══════════════════════════════════════════════════════════
// IN-MEMORY CACHE
// ═══════════════════════════════════════════════════════════

let cachedKey: {
  apiKey: string;
  remaining: number;
  index: number;
  fetchedAt: number;
} | null = null;

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type ActiveKeyData = {
  id: string;
  apiKey: string;
  remaining: number;
  index: number;
  updatedAt: string;
};

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function getAllKeys(): string[] {
  const raw = process.env.YOUCAM_API_KEYS || "";
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

async function fetchCredit(apiKey: string): Promise<number> {
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
// GET ACTIVE KEY
// ═══════════════════════════════════════════════════════════

export async function getActiveYouCamKey() {
  // Memory cache hit
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

  // Cache miss → DynamoDB
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: ACTIVE_KEY_ID },
      })
    );

    if (!result.Item) {
      return await refreshActiveYouCamKey();
    }

    const item = result.Item as ActiveKeyData;

    if (item.remaining < MIN_CREDITS) {
      console.log(
        `[KeyManager] ⚠️ Key has ${item.remaining} credits — refreshing`
      );
      return await refreshActiveYouCamKey();
    }

    cachedKey = {
      apiKey: item.apiKey,
      remaining: item.remaining,
      index: item.index,
      fetchedAt: Date.now(),
    };

    return {
      success: true,
      apiKey: item.apiKey,
      remaining: item.remaining,
      index: item.index,
      updatedAt: item.updatedAt,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get active key",
    };
  }
}

// ═══════════════════════════════════════════════════════════
// CONSUME CREDIT — supports any cost
// ═══════════════════════════════════════════════════════════

export async function consumeCredit(cost: number = 1) {
  console.log(`[KeyManager] 🎯 Consuming ${cost} credit(s)`);

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: ACTIVE_KEY_ID },
        UpdateExpression: "SET remaining = remaining - :cost, updatedAt = :now",
        ExpressionAttributeValues: {
          ":cost": cost,
          ":now": new Date().toISOString(),
        },
        ConditionExpression: "remaining >= :cost",
        ReturnValues: "ALL_NEW",
      })
    );

    const newRemaining = result.Attributes?.remaining ?? null;
    console.log(`[KeyManager] ✅ DynamoDB: remaining → ${newRemaining}`);

    if (cachedKey) {
      cachedKey.remaining = Math.max(0, cachedKey.remaining - cost);
    }

    return { success: true, remaining: newRemaining };
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      console.log(`[KeyManager] ⚠️ Not enough credits — rotating`);
      cachedKey = null;
      await refreshActiveYouCamKey();
      return { success: false, error: "KEY_EXHAUSTED" };
    }
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════
// MARK EXHAUSTED
// ═══════════════════════════════════════════════════════════

export async function markKeyExhausted() {
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
    console.log("[KeyManager] 🚫 Marked current key as exhausted");

    return await refreshActiveYouCamKey();
  } catch (error: any) {
    console.error("[KeyManager] Failed to mark exhausted:", error.message);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════
// REFRESH
// ═══════════════════════════════════════════════════════════

export async function refreshActiveYouCamKey() {
  try {
    const keys = getAllKeys();

    if (keys.length === 0) {
      return {
        success: false,
        error: "No YOUCAM_API_KEYS found in environment",
      };
    }

    console.log(`[KeyManager] 🔄 Checking ${keys.length} key(s)...`);

    for (let i = 0; i < keys.length; i++) {
      const remaining = await fetchCredit(keys[i]);
      console.log(`[KeyManager] Key #${i}: ${remaining} credits`);

      if (remaining >= MIN_CREDITS) {
        const data: ActiveKeyData = {
          id: ACTIVE_KEY_ID,
          apiKey: keys[i],
          remaining,
          index: i,
          updatedAt: new Date().toISOString(),
        };

        await docClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: data,
          })
        );

        cachedKey = {
          apiKey: keys[i],
          remaining,
          index: i,
          fetchedAt: Date.now(),
        };

        console.log(
          `[KeyManager] ✅ Active key → #${i} (${remaining} credits)`
        );

        return {
          success: true,
          apiKey: keys[i],
          remaining,
          index: i,
          updatedAt: data.updatedAt,
        };
      }
    }

    console.error("[KeyManager] ❌ All keys have low credits");
    cachedKey = null;

    return {
      success: false,
      error: "All API keys have low credits",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to refresh active key",
    };
  }
}