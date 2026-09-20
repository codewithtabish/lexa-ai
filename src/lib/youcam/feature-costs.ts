// src/lib/youcam/feature-costs.ts

// ═══════════════════════════════════════════════════════════
// FEATURE CREDIT COSTS
// ═══════════════════════════════════════════════════════════
// These match YouCam's actual API unit charges.
// Source: https://yce.makeupar.com pricing
//
// Change a value here → entire app updates automatically.
// ═══════════════════════════════════════════════════════════

export const FEATURE_COSTS = {
  // ─── Hairstyle ────────────────────────────────────────
  // Custom mode (ref_file_url) = 2 units
  // Preset mode (template_id)  = 1 unit
  HAIRSTYLE: 2,

  // ─── Beard Styling ────────────────────────────────────
  BEARD: 2,

  // ─── Outfit / Cloth Try-On ────────────────────────────
  OUTFIT: 3,

  // ─── Age Simulator ────────────────────────────────────
  AGE: 1,

  // ─── Hair Color ───────────────────────────────────────
  HAIRCOLOR: 1,

  // ─── AI Image Generation ──────────────────────────────
  IMAGEGEN: 1,
} as const;

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type FeatureKey = keyof typeof FEATURE_COSTS;

// ═══════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════

export function getFeatureCost(feature: FeatureKey): number {
  return FEATURE_COSTS[feature];
}