"use server";

import { db } from "@/lib/db";
import { aboutContent, aboutFeatures, aboutStats } from "@/lib/schema";
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

function parseFeature(formData: FormData) {
  return featureSchema.safeParse({
    feature: formData.get("feature"),
    displayOrder: formData.get("displayOrder") ?? 0,
  });
}

function parseStat(formData: FormData) {
  const isVisibleRaw = formData.get("isVisible");
  return statSchema.safeParse({
    title: formData.get("title"),
    followers: formData.get("followers"),
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: isVisibleRaw === "true" || isVisibleRaw === "on" ? true : isVisibleRaw === "false" ? false : true,
  });
}

function revalidate() {
  revalidatePath("/admin/about");
  revalidatePath("/");
}

// About Content
export async function getAboutContent() {
  await requireAdmin();
  try {
    return await db.query.aboutContent.findFirst();
  } catch (e) {
    console.error("getAboutContent DB error:", e);
    return null;
  }
}

export async function updateAboutContent(formData: FormData) {
  return adminAction("updateAboutContent", async () => {
    const parsed = aboutContentSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
    });
    if (!parsed.success) return { error: firstIssue(parsed.error) };

    const existing = await db.query.aboutContent.findFirst();
    if (existing) {
      await db.update(aboutContent).set({ ...parsed.data, updatedAt: new Date() }).where(eq(aboutContent.id, existing.id));
    } else {
      await db.insert(aboutContent).values({ ...parsed.data });
    }
    revalidate();
    return { success: "تم تحديث قسم عني" };
  });
}

// Features
export async function getAboutFeatures() {
  await requireAdmin();
  try {
    return await db.query.aboutFeatures.findMany({ orderBy: [asc(aboutFeatures.displayOrder), asc(aboutFeatures.createdAt)] });
  } catch (e) {
    console.error("getAboutFeatures DB error:", e);
    return [];
  }
}

export async function createAboutFeature(formData: FormData) {
  return adminAction("createAboutFeature", async () => {
    const parsed = parseFeature(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    await db.insert(aboutFeatures).values(parsed.data);
    revalidate();
    return { success: "تمت الإضافة" };
  });
}

export async function updateAboutFeature(id: string, formData: FormData) {
  return adminAction("updateAboutFeature", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const parsed = parseFeature(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const rows = await db
      .update(aboutFeatures)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(aboutFeatures.id, id))
      .returning({ id: aboutFeatures.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم التحديث" };
  });
}

export async function deleteAboutFeature(id: string) {
  return adminAction("deleteAboutFeature", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const rows = await db.delete(aboutFeatures).where(eq(aboutFeatures.id, id)).returning({ id: aboutFeatures.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم الحذف" };
  });
}

// Stats
export async function getAboutStats() {
  await requireAdmin();
  try {
    return await db.query.aboutStats.findMany({ orderBy: [asc(aboutStats.displayOrder), asc(aboutStats.createdAt)] });
  } catch (e) {
    console.error("getAboutStats DB error:", e);
    return [];
  }
}

export async function createAboutStat(formData: FormData) {
  return adminAction("createAboutStat", async () => {
    const parsed = parseStat(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    await db.insert(aboutStats).values(parsed.data);
    revalidate();
    return { success: "تمت الإضافة" };
  });
}

export async function updateAboutStat(id: string, formData: FormData) {
  return adminAction("updateAboutStat", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const parsed = parseStat(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const rows = await db
      .update(aboutStats)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(aboutStats.id, id))
      .returning({ id: aboutStats.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم التحديث" };
  });
}

export async function deleteAboutStat(id: string) {
  return adminAction("deleteAboutStat", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const rows = await db.delete(aboutStats).where(eq(aboutStats.id, id)).returning({ id: aboutStats.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم الحذف" };
  });
}
