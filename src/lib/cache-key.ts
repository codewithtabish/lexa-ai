// src/lib/cache-key.ts
// ============================================
// CENTRAL CACHE TAGS
// Used with `use cache` + `revalidateTag`
// ============================================

export const CACHE_TAGS = {
  users: "users",
  creations: "creations",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];