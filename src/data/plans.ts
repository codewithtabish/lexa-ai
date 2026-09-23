// src/data/plans.ts

export type PlanId = "BASIC" | "PRO";

export type Plan = {
  id: PlanId;
  name: string;
  priceUSD: number;
  priceCents: number;
  creditsPerMonth: number;
  tagline: string;
  features: string[];
  popular?: boolean;
  safepayPlanId: string; // 🎯 Safepay's real Plan ID (plan_...)
};

export const PLANS: Plan[] = [
  {
    id: "BASIC",
    name: "Basic",
    priceUSD: 4.99,
    priceCents: 499,
    creditsPerMonth: 40,
    tagline: "Perfect for regular creators",
    safepayPlanId: "plan_aec3858a-9783-456f-a515-12b5c0f34143", // 🎯
    features: [
      "40 credits every month",
      "All AI tools",
      "HD image output",
      "Priority processing",
      "Cancel anytime",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    priceUSD: 7.99,
    priceCents: 799,
    creditsPerMonth: 80,
    tagline: "For power users & creators",
    safepayPlanId: "plan_7fb52f9d-bd95-4987-930e-4921e71075cb", // 🎯
    popular: true,
    features: [
      "80 credits every month",
      "All AI tools",
      "4K image output",
      "Fastest processing",
      "Early access to new tools",
      "Cancel anytime",
    ],
  },
];

export function getPlan(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}