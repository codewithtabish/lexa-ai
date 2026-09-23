// src/actions/beard/get-beard-templates.ts
"use server";

import { cacheLife, cacheTag } from "next/cache";
import {
  getActiveYouCamKey,
  markKeyExhausted,
} from "@/lib/youcam/key-manager";
import { CACHE_TAGS } from "@/lib/cache-key";

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const BASE_URL =
  "https://yce-api-01.makeupar.com/s2s/v2.0/task/template/beard-style";
const PAGE_SIZE = 20;
const CACHE_TAG = CACHE_TAGS.beardTemplates;
const MAX_RETRIES = 3;
const MAX_PAGES = 50;
const PAGE_CACHE_PREFIX = "beard-page";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface YouCamBeardTemplate {
  id: string;
  title: string;
  thumb: string;
  categoryName: string;
  categoryId?: string;
}

export type GetBeardTemplatesResult =
  | { success: true; data: YouCamBeardTemplate[]; count: number }
  | { success: false; error: string };

interface RawTemplate {
  id: string;
  title: string;
  thumb: string;
  category_name?: string;
  category_id?: string;
}

interface PagePayload {
  templates: RawTemplate[];
  nextToken: string | null;
}

// ═══════════════════════════════════════════════════════════
// 🔑 STABLE PAGE KEY
// Derive a stable cache key for a "page slot" instead of the
// raw token (which changes per response).
// Page 0 = first page. Page 1 = second, etc.
// ═══════════════════════════════════════════════════════════

function pageSlotKey(pageIndex: number): string {
  return `${PAGE_CACHE_PREFIX}-${pageIndex}`;
}

// ═══════════════════════════════════════════════════════════
// 🎯 FETCH ONE PAGE — CACHED per page slot
// Each page slot has its own cache entry, all under the same
// CACHE_TAG so `revalidateTag` clears them all at once.
// ═══════════════════════════════════════════════════════════

async function fetchCachedPage(
  pageIndex: number,
  tokenForThisPage: string | null
): Promise<PagePayload> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAG);
  // 👆 Optional: also tag with the slot for granular invalidation
  cacheTag(pageSlotKey(pageIndex));

  const payload = await fetchPageWithRetry(tokenForThisPage);
  return payload;
}

// ═══════════════════════════════════════════════════════════
// 🎯 RAW FETCH (no cache) — key rotation + retry live here
// ═══════════════════════════════════════════════════════════

async function fetchPageWithRetry(
  startingToken: string | null
): Promise<PagePayload> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(
      `[fetchBeardTemplates] attempt ${attempt}/${MAX_RETRIES} (token: ${startingToken ? "yes" : "no"})`
    );

    const keyResult = await getActiveYouCamKey();
    if (!keyResult.success) {
      throw new Error(keyResult.error || "No available YouCam API key");
    }

    const url = new URL(BASE_URL);
    url.searchParams.set("page_size", String(PAGE_SIZE));
    if (startingToken) {
      url.searchParams.set("starting_token", startingToken);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keyResult.apiKey}`,
      },
      cache: "no-store", // 👈 outer function is what's cached
    });

    const data = await response.json();

    // ─── Success ───
    if (response.ok) {
      const templates: RawTemplate[] =
        data?.data?.templates ?? data?.templates ?? [];
      const nextToken: string | null =
        data?.data?.next_token ?? data?.next_token ?? null;

      console.log(
        `[fetchBeardTemplates] ✅ ${templates.length} templates, next: ${nextToken ? "yes" : "no"}`
      );

      return { templates, nextToken };
    }

    // ─── Credit issue → rotate key, retry same page ───
    if (
      data?.error_code === "CreditInsufficiency" ||
      (typeof data?.error === "string" &&
        data.error.toLowerCase().includes("credit"))
    ) {
      console.warn(`[fetchBeardTemplates] ⚠️ rotating key`);
      await markKeyExhausted();
      continue;
    }

    // ─── Other error → fail fast ───
    console.error("[fetchBeardTemplates] failed:", data);
    throw new Error(
      data?.message ||
        data?.error ||
        `Failed to fetch beard templates (${response.status})`
    );
  }

  throw new Error("All YouCam API keys are exhausted.");
}

// ═══════════════════════════════════════════════════════════
// 🎯 WALK ALL PAGES (cached per slot, sequential token chain)
// ═══════════════════════════════════════════════════════════
//
// Why this is fast:
//  • Page 1 cached → token for page 2 stored inside cached payload
//  • Page 2 cached → token for page 3 stored inside cached payload
//  • Warm cache = zero YouCam calls, instant merge
//  • Cold cache = one pass, then frozen forever (cacheLife max)
//  • revalidateTag(beardTemplates) → all slots wiped in one shot
//
// ═══════════════════════════════════════════════════════════

async function getAllBeardTemplates(): Promise<YouCamBeardTemplate[]> {
  const allTemplates: YouCamBeardTemplate[] = [];
  let nextToken: string | null = null;
  let pageIndex = 0;

  while (pageIndex < MAX_PAGES) {
    const payload = await fetchCachedPage(pageIndex, nextToken);

    for (const t of payload.templates) {
      if (!t?.id || !t?.thumb) continue;
      allTemplates.push({
        id: t.id,
        title: t.title || "Beard Style",
        thumb: t.thumb,
        categoryName: t.category_name || "Other",
        categoryId: t.category_id,
      });
    }

    // Stop conditions
    if (!payload.nextToken) break;
    if (payload.templates.length < PAGE_SIZE) break;

    nextToken = payload.nextToken;
    pageIndex++;
  }

  console.log(
    `[getBeardTemplates] ✅ total: ${allTemplates.length} (pages: ${pageIndex + 1})`
  );

  return allTemplates;
}

// ═══════════════════════════════════════════════════════════
// 🎯 MAIN SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function getBeardTemplates(): Promise<GetBeardTemplatesResult> {
  try {
    const templates = await getAllBeardTemplates();

    return {
      success: true,
      data: templates,
      count: templates.length,
    };
  } catch (error: unknown) {
    console.error("[getBeardTemplates] error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching beard templates",
    };
  }
}