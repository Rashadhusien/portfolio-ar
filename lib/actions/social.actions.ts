"use server";

import { db } from "@/lib/db";
import { socialLinks } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { safeImageSrc, safeLink } from "@/lib/validation/url";
import {
  adminAction,
  firstIssue,
  isUuid,
  MESSAGES,
  requireAdmin,
} from "@/lib/actions/helpers";

const socialSchema = z.object({
  platform: z.string().min(1, "المنصة مطلوبة"),
  url: safeLink("رابط غير صالح"),
  iconUrl: safeImageSrc("رابط الأيقونة مطلوب"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.coerce.boolean().default(true),
});

function parseSocial(formData: FormData) {
  return socialSchema.safeParse({
    platform: formData.get("platform"),
    url: formData.get("url"),
    iconUrl: formData.get("iconUrl"),
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "false" ? false : true,
  });
}

function revalidate() {
  revalidatePath("/admin/social");
  revalidatePath("/");
}

export async function getSocialLinks() {
  await requireAdmin();
  try {
    return await db.query.socialLinks.findMany({ orderBy: [asc(socialLinks.displayOrder), asc(socialLinks.createdAt)] });
  } catch (e) {
    console.error("getSocialLinks DB error:", e);
    return [];
  }
}

export async function createSocialLink(formData: FormData) {
  return adminAction("createSocialLink", async () => {
    const parsed = parseSocial(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    await db.insert(socialLinks).values(parsed.data);
    revalidate();
    return { success: "تمت إضافة الرابط" };
  });
}

export async function updateSocialLink(id: string, formData: FormData) {
  return adminAction("updateSocialLink", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const parsed = parseSocial(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const rows = await db
      .update(socialLinks)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(socialLinks.id, id))
      .returning({ id: socialLinks.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم التحديث" };
  });
}

export async function deleteSocialLink(id: string) {
  return adminAction("deleteSocialLink", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const rows = await db.delete(socialLinks).where(eq(socialLinks.id, id)).returning({ id: socialLinks.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم الحذف" };
  });
}
