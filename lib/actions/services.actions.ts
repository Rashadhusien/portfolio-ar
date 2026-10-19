"use server";

import { db } from "@/lib/db";
import { services } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  adminAction,
  firstIssue,
  isUuid,
  MESSAGES,
  requireAdmin,
} from "@/lib/actions/helpers";

const serviceSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  description: z.string().min(1, "الوصف مطلوب"),
  icon: z.enum(["book", "sparkles", "camera", "trending"], { errorMap: () => ({ message: "الأيقونة غير صالحة" }) }),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.coerce.boolean().default(true),
});

function parseService(formData: FormData) {
  return serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "false" ? false : true,
  });
}

function revalidate() {
  revalidatePath("/admin/services");
  revalidatePath("/");
}

export async function getServices() {
  await requireAdmin();
  try {
    return await db.query.services.findMany({ orderBy: [asc(services.displayOrder), asc(services.createdAt)] });
  } catch (e) {
    console.error("getServices DB error:", e);
    return [];
  }
}

export async function createService(formData: FormData) {
  return adminAction("createService", async () => {
    const parsed = parseService(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    await db.insert(services).values(parsed.data);
    revalidate();
    return { success: "تمت إضافة الخدمة" };
  });
}

export async function updateService(id: string, formData: FormData) {
  return adminAction("updateService", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const parsed = parseService(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const rows = await db
      .update(services)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning({ id: services.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم تحديث الخدمة" };
  });
}

export async function deleteService(id: string) {
  return adminAction("deleteService", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const rows = await db.delete(services).where(eq(services.id, id)).returning({ id: services.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم حذف الخدمة" };
  });
}

export async function toggleServiceVisibility(id: string, isVisible: boolean) {
  return adminAction("toggleServiceVisibility", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const rows = await db
      .update(services)
      .set({ isVisible: Boolean(isVisible), updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning({ id: services.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم التحديث" };
  });
}
