// src/lib/youcam/key-manager-diagnostics.ts

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const TABLE_NAME = "youcam-keys";
const ACTIVE_KEY_ID = "active";
const KEY_TIMEOUT_MS = 3500;

// ═══════════════════════════════════════════════════════════
// DYNAMODB
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
});

const docClient = DynamoDBDocumentClient.from(client);

// ═══════════════════════════════════════════════════════════
// PUBLIC HELPERS FOR DIAGNOSTICS
// ═══════════════════════════════════════════════════════════

export function getAllKeysForDiagnostics(): string[] {
  const raw = process.env.YOUCAM_API_KEYS || "";
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

/**
 * Fetch credit — same logic as key-manager but exposes -1/-2 to caller
 *   >= 0 → valid credit count
 *   -1   → invalid key (401/403)
 *   -2   → network/timeout error
 */
export async function fetchCreditForDiagnostics(
  apiKey: string
): Promise<number> {
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

/**
 * Read the currently active key from DynamoDB (no side effects).
 */
export async function getActiveKeyFromDBForDiagnostics(): Promise<{
  index: number;
  apiKey: string;
  remaining: number;
  updatedAt: string;
} | null> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: ACTIVE_KEY_ID },
      })
    );

    if (!result.Item) return null;

    const item = result.Item as {
      apiKey: string;
      remaining: number;
      index: number;
      updatedAt: string;
    };

    return {
      index: item.index,
      apiKey: item.apiKey,
      remaining: item.remaining,
      updatedAt: item.updatedAt,
    };
  } catch (err: any) {
    console.warn(
      "[KeyManagerDiagnostics] Failed to read active key:",
      err.message
    );
    return null;
  }
}