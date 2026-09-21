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
  {
    id: "long-wavy-flow-02",
    title: "Long Wavy Flow",
    thumb: "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/two.png",
    imageUrl: "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/two.png",
    category: "male",
    styleCategory: "long",
  },
  {
    id: "curly-top-knot-03",
    title: "Curly Top Knot",
    thumb: "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/3.png",
    imageUrl: "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/3.png",
    category: "male",
    styleCategory: "medium",
  },
];