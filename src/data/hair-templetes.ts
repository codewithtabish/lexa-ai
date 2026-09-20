export type HairCategory = "male" | "female";

export type HairStyleCategory = "short" | "medium" | "long";

export interface HairTemplate {
  id: string;
  title: string;
  thumb: string;
  imageUrl: string;
  category: HairCategory;
  styleCategory: HairStyleCategory;
}

export const hairTemplates: HairTemplate[] = [
  {
    id: "textured-crop-01",
    title: "Textured Crop",
    thumb: "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/one.png",
    imageUrl: "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/one.png",
    category: "male",
    styleCategory: "short",
  },
];