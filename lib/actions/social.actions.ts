"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { socialLinks } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const socialSchema = z.object({
  platform: z.string().min(1, "المنصة مطلوبة"),
  url: z.string().url("رابط غير صالح"),
  iconUrl: z.string().min(1, "رابط الأيقونة مطلوب"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.coerce.boolean().default(true),
});

export async function getSocialLinks() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  try {
    return await db.query.socialLinks.findMany({ orderBy: [asc(socialLinks.displayOrder)] });
  } catch (e) {
    console.error("getSocialLinks DB error:", e);
    return [];
  }
}

export async function createSocialLink(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = socialSchema.safeParse({
    platform: formData.get("platform"),
    url: formData.get("url"),
    iconUrl: formData.get("iconUrl"),
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "false" ? false : true,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  await db.insert(socialLinks).values(parsed.data);
  revalidatePath("/admin/social");
  revalidatePath("/");
  return { success: "تمت إضافة الرابط" };
}

export async function updateSocialLink(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = socialSchema.safeParse({
    platform: formData.get("platform"),
    url: formData.get("url"),
    iconUrl: formData.get("iconUrl"),
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "false" ? false : true,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  await db.update(socialLinks).set({ ...parsed.data, updatedAt: new Date() }).where(eq(socialLinks.id, id));
  revalidatePath("/admin/social");
  revalidatePath("/");
  return { success: "تم التحديث" };
}

export async function deleteSocialLink(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await db.delete(socialLinks).where(eq(socialLinks.id, id));
  revalidatePath("/admin/social");
  revalidatePath("/");
  return { success: "تم الحذف" };
}
