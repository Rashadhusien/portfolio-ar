"use server";

import { db } from "@/lib/db";
import { previousWorks } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { safeLink, safeMediaSrc } from "@/lib/validation/url";
import {
  adminAction,
  firstIssue,
  isUuid,
  MESSAGES,
  requireAdmin,
} from "@/lib/actions/helpers";

const workSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  videoUrl: safeMediaSrc("رابط الفيديو مطلوب"),
  videoAlt: z.string().min(1, "وصف الفيديو مطلوب"),
  externalSourceUrl: safeLink("الرابط الخارجي مطلوب"),
  platform: z.string().min(1, "المنصة مطلوبة"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.coerce.boolean().default(true),
});

function parseWork(formData: FormData) {
  return workSchema.safeParse({
    title: formData.get("title"),
    videoUrl: formData.get("videoUrl"),
    videoAlt: formData.get("videoAlt"),
    externalSourceUrl: formData.get("externalSourceUrl"),
    platform: formData.get("platform"),
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "false" ? false : true,
  });
}

function revalidate() {
  revalidatePath("/admin/works");
  revalidatePath("/");
}

export async function getWorks() {
  await requireAdmin();
  try {
    return await db.query.previousWorks.findMany({ orderBy: [asc(previousWorks.displayOrder), asc(previousWorks.createdAt)] });
  } catch (e) {
    console.error("getWorks DB error:", e);
    return [];
  }
}

export async function createWork(formData: FormData) {
  return adminAction("createWork", async () => {
    const parsed = parseWork(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    await db.insert(previousWorks).values(parsed.data);
    revalidate();
    return { success: "تمت إضافة العمل" };
  });
}

export async function updateWork(id: string, formData: FormData) {
  return adminAction("updateWork", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const parsed = parseWork(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const rows = await db
      .update(previousWorks)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(previousWorks.id, id))
      .returning({ id: previousWorks.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم تحديث العمل" };
  });
}

export async function deleteWork(id: string) {
  return adminAction("deleteWork", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const rows = await db.delete(previousWorks).where(eq(previousWorks.id, id)).returning({ id: previousWorks.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم حذف العمل" };
  });
}
