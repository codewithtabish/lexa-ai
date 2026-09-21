// src/lib/revalidate-creations.ts
import { revalidateTag, revalidatePath } from "next/cache";
import { CACHE_TAGS } from "./cache-key";

export function revalidateCreations() {
  revalidateTag(CACHE_TAGS.creations, "max");
  revalidatePath("/app");
  revalidatePath("/app", "layout");
}