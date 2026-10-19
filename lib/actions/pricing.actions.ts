"use server";

import { db } from "@/lib/db";
import { pricingPackages, pricingFeatures } from "@/lib/schema";
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

const packageSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  description: z.string().min(1, "الوصف مطلوب"),
  price: z.coerce.number().int().min(0, "السعر غير صالح"),
  isPopular: z.coerce.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.coerce.boolean().default(true),
});

const featureSchema = z.object({
  feature: z.string().min(1, "الميزة مطلوبة"),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

function parsePackage(formData: FormData) {
  return packageSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    isPopular: formData.get("isPopular") === "true" || formData.get("isPopular") === "on",
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "false" ? false : true,
  });
}

function parseFeature(formData: FormData) {
  return featureSchema.safeParse({
    feature: formData.get("feature"),
    displayOrder: formData.get("displayOrder") ?? 0,
  });
}

function revalidate() {
  revalidatePath("/admin/pricing");
  revalidatePath("/");
}

export async function getPricingPackages() {
  await requireAdmin();
  try {
    return await db.query.pricingPackages.findMany({
      orderBy: [asc(pricingPackages.displayOrder), asc(pricingPackages.createdAt)],
      with: { features: { orderBy: [asc(pricingFeatures.displayOrder), asc(pricingFeatures.createdAt)] } },
    });
  } catch (e) {
    console.error("getPricingPackages DB error:", e);
    return [];
  }
}

export async function createPricingPackage(formData: FormData) {
  return adminAction("createPricingPackage", async () => {
    const parsed = parsePackage(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };

    if (parsed.data.isPopular) {
      await db.update(pricingPackages).set({ isPopular: false }).where(eq(pricingPackages.isPopular, true));
    }
    await db.insert(pricingPackages).values(parsed.data);
    revalidate();
    return { success: "تمت إضافة الباقة" };
  });
}

export async function updatePricingPackage(id: string, formData: FormData) {
  return adminAction("updatePricingPackage", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const parsed = parsePackage(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };

    if (parsed.data.isPopular) {
      await db.update(pricingPackages).set({ isPopular: false }).where(eq(pricingPackages.isPopular, true));
    }
    const rows = await db
      .update(pricingPackages)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(pricingPackages.id, id))
      .returning({ id: pricingPackages.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم تحديث الباقة" };
  });
}

export async function deletePricingPackage(id: string) {
  return adminAction("deletePricingPackage", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const rows = await db
      .delete(pricingPackages)
      .where(eq(pricingPackages.id, id))
      .returning({ id: pricingPackages.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم حذف الباقة" };
  });
}

export async function setPopularPackage(packageId: string) {
  return adminAction("setPopularPackage", async () => {
    if (!isUuid(packageId)) return { error: MESSAGES.invalidId };
    const target = await db.query.pricingPackages.findFirst({
      where: eq(pricingPackages.id, packageId),
      columns: { id: true },
    });
    if (!target) return { error: MESSAGES.notFound };

    await db.update(pricingPackages).set({ isPopular: false }).where(eq(pricingPackages.isPopular, true));
    await db.update(pricingPackages).set({ isPopular: true, updatedAt: new Date() }).where(eq(pricingPackages.id, packageId));
    revalidate();
    return { success: "تم تحديث الباقة المميزة" };
  });
}

// Features nested under package
export async function getPricingFeatures(packageId: string) {
  await requireAdmin();
  if (!isUuid(packageId)) return [];
  try {
    return await db.query.pricingFeatures.findMany({
      where: eq(pricingFeatures.packageId, packageId),
      orderBy: [asc(pricingFeatures.displayOrder), asc(pricingFeatures.createdAt)],
    });
  } catch (e) {
    console.error("getPricingFeatures DB error:", e);
    return [];
  }
}

export async function createPricingFeature(packageId: string, formData: FormData) {
  return adminAction("createPricingFeature", async () => {
    if (!isUuid(packageId)) return { error: MESSAGES.invalidId };
    const parsed = parseFeature(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };

    const pkg = await db.query.pricingPackages.findFirst({
      where: eq(pricingPackages.id, packageId),
      columns: { id: true },
    });
    if (!pkg) return { error: MESSAGES.notFound };

    await db.insert(pricingFeatures).values({ ...parsed.data, packageId });
    revalidate();
    return { success: "تمت إضافة الميزة" };
  });
}

export async function updatePricingFeature(id: string, formData: FormData) {
  return adminAction("updatePricingFeature", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const parsed = parseFeature(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const rows = await db
      .update(pricingFeatures)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(pricingFeatures.id, id))
      .returning({ id: pricingFeatures.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم تحديث الميزة" };
  });
}

export async function deletePricingFeature(id: string) {
  return adminAction("deletePricingFeature", async () => {
    if (!isUuid(id)) return { error: MESSAGES.invalidId };
    const rows = await db
      .delete(pricingFeatures)
      .where(eq(pricingFeatures.id, id))
      .returning({ id: pricingFeatures.id });
    if (!rows.length) return { error: MESSAGES.notFound };
    revalidate();
    return { success: "تم حذف الميزة" };
  });
}
