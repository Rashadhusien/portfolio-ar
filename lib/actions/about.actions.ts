"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { aboutContent, aboutFeatures, aboutStats } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const aboutContentSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  content: z.string().min(1, "المحتوى مطلوب"),
});

const featureSchema = z.object({
  feature: z.string().min(1, "الميزة مطلوبة"),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

const statSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  followers: z.string().min(1, "عدد المتابعين مطلوب"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.coerce.boolean().default(true),
});

// About Content
export async function getAboutContent() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  try {
    return await db.query.aboutContent.findFirst();
  } catch (e) {
    console.error("getAboutContent DB error:", e);
    return null;
  }
}

export async function updateAboutContent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = aboutContentSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const existing = await db.query.aboutContent.findFirst();
  if (existing) {
    await db.update(aboutContent).set({ ...parsed.data, updatedAt: new Date() }).where(eq(aboutContent.id, existing.id));
  } else {
    await db.insert(aboutContent).values({ ...parsed.data });
  }
  revalidatePath("/admin/about");
  revalidatePath("/");
  return { success: "تم تحديث قسم عني" };
}

// Features
export async function getAboutFeatures() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  try {
    return await db.query.aboutFeatures.findMany({ orderBy: [asc(aboutFeatures.displayOrder)] });
  } catch (e) {
    console.error("getAboutFeatures DB error:", e);
    return [];
  }
}

export async function createAboutFeature(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = featureSchema.safeParse({
    feature: formData.get("feature"),
    displayOrder: formData.get("displayOrder") ?? 0,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  await db.insert(aboutFeatures).values(parsed.data);
  revalidatePath("/admin/about");
  revalidatePath("/");
  return { success: "تمت الإضافة" };
}

export async function updateAboutFeature(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = featureSchema.safeParse({
    feature: formData.get("feature"),
    displayOrder: formData.get("displayOrder") ?? 0,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  await db.update(aboutFeatures).set({ ...parsed.data, updatedAt: new Date() }).where(eq(aboutFeatures.id, id));
  revalidatePath("/admin/about");
  revalidatePath("/");
  return { success: "تم التحديث" };
}

export async function deleteAboutFeature(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await db.delete(aboutFeatures).where(eq(aboutFeatures.id, id));
  revalidatePath("/admin/about");
  revalidatePath("/");
  return { success: "تم الحذف" };
}

// Stats
export async function getAboutStats() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  try {
    return await db.query.aboutStats.findMany({ orderBy: [asc(aboutStats.displayOrder)] });
  } catch (e) {
    console.error("getAboutStats DB error:", e);
    return [];
  }
}

export async function createAboutStat(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = statSchema.safeParse({
    title: formData.get("title"),
    followers: formData.get("followers"),
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "true" || formData.get("isVisible") === "on" ? true : formData.get("isVisible") === "false" ? false : true,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  await db.insert(aboutStats).values(parsed.data);
  revalidatePath("/admin/about");
  revalidatePath("/");
  return { success: "تمت الإضافة" };
}

export async function updateAboutStat(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const isVisibleRaw = formData.get("isVisible");
  const parsed = statSchema.safeParse({
    title: formData.get("title"),
    followers: formData.get("followers"),
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: isVisibleRaw === "true" || isVisibleRaw === "on" ? true : isVisibleRaw === "false" ? false : true,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  await db.update(aboutStats).set({ ...parsed.data, updatedAt: new Date() }).where(eq(aboutStats.id, id));
  revalidatePath("/admin/about");
  revalidatePath("/");
  return { success: "تم التحديث" };
}

export async function deleteAboutStat(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await db.delete(aboutStats).where(eq(aboutStats.id, id));
  revalidatePath("/admin/about");
  revalidatePath("/");
  return { success: "تم الحذف" };
}
