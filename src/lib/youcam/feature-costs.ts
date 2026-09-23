// src/lib/youcam/feature-costs.ts

export const FEATURE_COSTS = {
  HAIRSTYLE: 1,
  BEARD: 1,
  OUTFIT: 1,
  AGE: 2,       // 🎯 set to 3
  HAIRCOLOR: 1,
  IMAGEGEN: 1,
} as const;

export type FeatureKey = keyof typeof FEATURE_COSTS;

export function getFeatureCost(feature: FeatureKey): number {
  return FEATURE_COSTS[feature];
}