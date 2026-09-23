// src/data/outfit-templates.ts
// ============================================
// LEXA AI — OUTFIT TEMPLATE LIBRARY
// Full-body Pakistani traditional menswear
// Owned & hosted on our CloudFront
// ============================================

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type OutfitGender = "men" | "women" | "unisex";

export type OutfitCategory =
  | "full_body"      // complete outfit (top + bottom + shoes)
  | "upper_body"     // shirt / kurta / waistcoat only
  | "lower_body"     // trousers / shalwar only
  | "shoes";         // footwear only

export type OutfitTemplate = {
  /** Unique stable ID — never change once shipped */
  id: string;

  /** Display name shown in the gallery */
  name: string;

  /** Short tagline shown under the name */
  tagline?: string;

  /** 👤 Who this outfit is for — used for UI filtering */
  gender: OutfitGender;

  /** YouCam garment category — used for `garment_category` param */
  category: OutfitCategory;

  /** Main reference image URL (CloudFront) — passed as `ref_file_url` */
  imageUrl: string;

  /** Thumbnail URL for the gallery grid (can equal imageUrl) */
  thumbUrl: string;

  /** Search / filter tags */
  tags: string[];

  /** Featured templates show at the top of the gallery */
  featured?: boolean;

  /** Optional sort priority (lower = higher up). Default 100 */
  order?: number;
};

// ═══════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════

export const outfitTemplates: OutfitTemplate[] = [
  // ─────────────────────────────────────────────
  // 🖤 BLACK — MEN — FULL BODY
  // ─────────────────────────────────────────────
  {
    id: "mens-black-shalwar-kameez-waistcoat-001",
    name: "Black Shalwar Kameez + Waistcoat",
    tagline: "Formal · Traditional",
    gender: "men",
    category: "full_body",
    imageUrl:
      "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/beard_templates/outfit_templates/black_outfit.png",
    thumbUrl:
      "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/beard_templates/outfit_templates/black_outfit.png",
    tags: [
      "traditional",
      "pakistani",
      "shalwar-kameez",
      "waistcoat",
      "black",
      "formal",
      "wedding",
      "evening",
    ],
    featured: true,
    order: 1,
  },

  // ─────────────────────────────────────────────
  // 🤎 BROWN — MEN — FULL BODY
  // ─────────────────────────────────────────────
  {
    id: "mens-brown-shalwar-kameez-waistcoat-001",
    name: "Brown Shalwar Kameez + Waistcoat",
    tagline: "Warm · Elegant",
    gender: "men",
    category: "full_body",
    imageUrl:
      "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/beard_templates/outfit_templates/brown_outfit.png",
    thumbUrl:
      "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/beard_templates/outfit_templates/brown_outfit.png",
    tags: [
      "traditional",
      "pakistani",
      "shalwar-kameez",
      "waistcoat",
      "brown",
      "formal",
      "autumn",
      "wedding",
    ],
    featured: true,
    order: 2,
  },

  // ─────────────────────────────────────────────
  // 🤍 WHITE — MEN — FULL BODY
  // ─────────────────────────────────────────────
  {
    id: "mens-white-shalwar-kameez-waistcoat-001",
    name: "White Shalwar Kameez + Waistcoat",
    tagline: "Classic · Eid Ready",
    gender: "men",
    category: "full_body",
    imageUrl:
      "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/beard_templates/outfit_templates/white_outfit_hq.png",
    thumbUrl:
      "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/beard_templates/outfit_templates/white_outfit_hq.png",
    tags: [
      "traditional",
      "pakistani",
      "shalwar-kameez",
      "waistcoat",
      "white",
      "formal",
      "eid",
      "jumma",
      "wedding",
    ],
    featured: true,
    order: 3,
  },

  // ═════════════════════════════════════════════
  // 👇 ADD YOUR WOMEN'S TEMPLATES BELOW 👇
  // ═════════════════════════════════════════════
  //
  // Example:
  //
  // {
  //   id: "womens-red-embroidered-lawn-suit-001",
  //   name: "Red Embroidered Lawn Suit",
  //   tagline: "Festive · Summer",
  //   gender: "women",
  //   category: "full_body",
  //   imageUrl:
  //     "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/outfit_templates/womens-red-lawn-suit.png",
  //   thumbUrl:
  //     "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/outfit_templates/womens-red-lawn-suit.png",
  //   tags: ["traditional", "pakistani", "lawn", "red", "festive"],
  //   featured: true,
  //   order: 10,
  // },
];

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

/** Get a template by its ID */
export function getOutfitTemplateById(
  id: string
): OutfitTemplate | undefined {
  return outfitTemplates.find((t) => t.id === id);
}

/** Get all templates in a specific category */
export function getOutfitTemplatesByCategory(
  category: OutfitCategory
): OutfitTemplate[] {
  return outfitTemplates
    .filter((t) => t.category === category)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

/** 👤 Get templates filtered by gender */
export function getOutfitTemplatesByGender(
  gender: OutfitGender
): OutfitTemplate[] {
  return outfitTemplates
    .filter((t) => t.gender === gender)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

/** 👤 Get templates matching BOTH gender AND category */
export function getOutfitTemplatesByGenderAndCategory(
  gender: OutfitGender,
  category: OutfitCategory
): OutfitTemplate[] {
  return outfitTemplates
    .filter((t) => t.gender === gender && t.category === category)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

/** Get all featured templates */
export function getFeaturedOutfitTemplates(): OutfitTemplate[] {
  return outfitTemplates
    .filter((t) => t.featured)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

/** Get all unique categories that currently have templates */
export function getOutfitCategories(): OutfitCategory[] {
  const set = new Set<OutfitCategory>();
  outfitTemplates.forEach((t) => set.add(t.category));
  return Array.from(set);
}

/** 👤 Get all unique genders that currently have templates */
export function getOutfitGenders(): OutfitGender[] {
  const set = new Set<OutfitGender>();
  outfitTemplates.forEach((t) => set.add(t.gender));
  return Array.from(set);
}

/** Get all unique tags across templates */
export function getOutfitTags(): string[] {
  const set = new Set<string>();
  outfitTemplates.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
  return Array.from(set).sort();
}

/** Filter templates by a tag */
export function getOutfitTemplatesByTag(tag: string): OutfitTemplate[] {
  return outfitTemplates.filter((t) => t.tags.includes(tag));
}

// ═══════════════════════════════════════════════════════════
// LABELS (for UI display)
// ═══════════════════════════════════════════════════════════

export const OUTFIT_CATEGORY_LABELS: Record<OutfitCategory, string> = {
  full_body: "Full Body",
  upper_body: "Upper Body",
  lower_body: "Lower Body",
  shoes: "Shoes",
};

export const OUTFIT_GENDER_LABELS: Record<OutfitGender, string> = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

export default outfitTemplates;