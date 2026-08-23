"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { previousWorks } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const workSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  videoUrl: z.string().min(1, "رابط الفيديو مطلوب"),
  videoAlt: z.string().min(1, "وصف الفيديو مطلوب"),
  externalSourceUrl: z.string().min(1, "الرابط الخارجي مطلوب"),
  platform: z.string().min(1, "المنصة مطلوبة"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.coerce.boolean().default(true),
});

export async function getWorks() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  try {
    return await db.query.previousWorks.findMany({ orderBy: [asc(previousWorks.displayOrder)] });
  } catch (e) {
    console.error("getWorks DB error:", e);
    return [];
  }
}

export async function createWork(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = workSchema.safeParse({
    title: formData.get("title"),
    videoUrl: formData.get("videoUrl"),
    videoAlt: formData.get("videoAlt"),
    externalSourceUrl: formData.get("externalSourceUrl"),
    platform: formData.get("platform"),
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "false" ? false : true,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  await db.insert(previousWorks).values(parsed.data);
  revalidatePath("/admin/works");
  revalidatePath("/");
  return { success: "تمت إضافة العمل" };
}

export async function updateWork(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = workSchema.safeParse({
    title: formData.get("title"),
    videoUrl: formData.get("videoUrl"),
    videoAlt: formData.get("videoAlt"),
    externalSourceUrl: formData.get("externalSourceUrl"),
    platform: formData.get("platform"),
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "false" ? false : true,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  await db.update(previousWorks).set({ ...parsed.data, updatedAt: new Date() }).where(eq(previousWorks.id, id));
  revalidatePath("/admin/works");
  revalidatePath("/");
  return { success: "تم تحديث العمل" };
}

export async function deleteWork(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await db.delete(previousWorks).where(eq(previousWorks.id, id));
  revalidatePath("/admin/works");
  revalidatePath("/");
  return { success: "تم حذف العمل" };
}
