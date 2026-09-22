// src/lib/youcam/feature-costs.ts

export const FEATURE_COSTS = {
  HAIRSTYLE: 2,
  BEARD: 2,
  OUTFIT: 3,

  // ─── Age Simulator ────────────────────────────────────
  // 🎯 FLAT cost per generation — NOT per age
  AGE: 2,

  HAIRCOLOR: 1,
  IMAGEGEN: 1,
} as const;

export type FeatureKey = keyof typeof FEATURE_COSTS;

export function getFeatureCost(feature: FeatureKey): number {
  return FEATURE_COSTS[feature];
}