"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pricingPackages, pricingFeatures } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

export async function getPricingPackages() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  try {
    return await db.query.pricingPackages.findMany({
      orderBy: [asc(pricingPackages.displayOrder)],
      with: { features: { orderBy: [asc(pricingFeatures.displayOrder)] } },
    });
  } catch (e) {
    console.error("getPricingPackages DB error:", e);
    return [];
  }
}

export async function createPricingPackage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = packageSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    isPopular: formData.get("isPopular") === "true" || formData.get("isPopular") === "on",
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "false" ? false : true,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  if (parsed.data.isPopular) {
    await db.update(pricingPackages).set({ isPopular: false }).where(eq(pricingPackages.isPopular, true));
  }
  await db.insert(pricingPackages).values(parsed.data);
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  return { success: "تمت إضافة الباقة" };
}

export async function updatePricingPackage(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = packageSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    isPopular: formData.get("isPopular") === "true" || formData.get("isPopular") === "on",
    displayOrder: formData.get("displayOrder") ?? 0,
    isVisible: formData.get("isVisible") === "false" ? false : true,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  if (parsed.data.isPopular) {
    await db.update(pricingPackages).set({ isPopular: false }).where(eq(pricingPackages.isPopular, true));
  }
  await db.update(pricingPackages).set({ ...parsed.data, updatedAt: new Date() }).where(eq(pricingPackages.id, id));
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  return { success: "تم تحديث الباقة" };
}

export async function deletePricingPackage(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await db.delete(pricingPackages).where(eq(pricingPackages.id, id));
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  return { success: "تم حذف الباقة" };
}

export async function setPopularPackage(packageId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await db.update(pricingPackages).set({ isPopular: false }).where(eq(pricingPackages.isPopular, true));
  await db.update(pricingPackages).set({ isPopular: true, updatedAt: new Date() }).where(eq(pricingPackages.id, packageId));
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  return { success: "تم تحديث الباقة المميزة" };
}

// Features nested under package
export async function getPricingFeatures(packageId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  try {
    return await db.query.pricingFeatures.findMany({
      where: eq(pricingFeatures.packageId, packageId),
      orderBy: [asc(pricingFeatures.displayOrder)],
    });
  } catch (e) {
    console.error("getPricingFeatures DB error:", e);
    return [];
  }
}

export async function createPricingFeature(packageId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = featureSchema.safeParse({
    feature: formData.get("feature"),
    displayOrder: formData.get("displayOrder") ?? 0,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  await db.insert(pricingFeatures).values({ ...parsed.data, packageId });
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  return { success: "تمت إضافة الميزة" };
}

export async function updatePricingFeature(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const parsed = featureSchema.safeParse({
    feature: formData.get("feature"),
    displayOrder: formData.get("displayOrder") ?? 0,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  await db.update(pricingFeatures).set({ ...parsed.data, updatedAt: new Date() }).where(eq(pricingFeatures.id, id));
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  return { success: "تم تحديث الميزة" };
}

export async function deletePricingFeature(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  await db.delete(pricingFeatures).where(eq(pricingFeatures.id, id));
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  return { success: "تم حذف الميزة" };
}
