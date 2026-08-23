"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { services } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  description: z.string().min(1, "الوصف مطلوب"),
  icon: z.enum(["book", "sparkles", "camera", "trending"], { errorMap: () => ({ message: "الأيقونة غير صالحة" }) }),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.coerce.boolean().default(true),
});

export async function getServices() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  try {
    return await db.query.services.findMany({ orderBy: [asc(services.displayOrder)] });
  } catch (e) {
    console.error("getServices DB error:", e);
    return [];
  }
}

export async function createService(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "false" ? false : true,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  await db.insert(services).values(parsed.data);
  revalidatePath("/admin/services");
  revalidatePath("/");
  return { success: "تمت إضافة الخدمة" };
}

export async function updateService(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "false" ? false : true,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  await db.update(services).set({ ...parsed.data, updatedAt: new Date() }).where(eq(services.id, id));
  revalidatePath("/admin/services");
  revalidatePath("/");
  return { success: "تم تحديث الخدمة" };
}

export async function deleteService(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await db.delete(services).where(eq(services.id, id));
  revalidatePath("/admin/services");
  revalidatePath("/");
  return { success: "تم حذف الخدمة" };
}

export async function toggleServiceVisibility(id: string, isVisible: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await db.update(services).set({ isVisible, updatedAt: new Date() }).where(eq(services.id, id));
  revalidatePath("/admin/services");
  revalidatePath("/");
  return { success: "تم التحديث" };
}
