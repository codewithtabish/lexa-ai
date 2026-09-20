import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "./cache-key";


// ============================================
// REVALIDATE USER DATA
// ============================================
// Call this utility after any mutation that changes user data:
//   - Credits deducted (after generation)
//   - Credits added (subscription / purchase)
//   - Plan upgraded / downgraded
//   - Profile updated
//
// ✅ Clears the "users" cache tag
// ✅ Refreshes the /app route render
//
// Example:
//   import { revalidateUserData } from "@/lib/revalidate-user";
//   ...
//   await prisma.user.update({ ... });
//   revalidateUserData();
//

export function revalidateUserData() {
revalidateTag(CACHE_TAGS.users, { expire: 0 });
  revalidatePath("/app");
  revalidatePath("/app", "layout");
}