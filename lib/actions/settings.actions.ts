"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { siteSettings, contactInfo } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const siteSettingsSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  metaTitle: z.string().min(1, "Meta title is required"),
  metaDescription: z.string().min(1, "Meta description is required"),
  ogLocale: z.string().min(1, "Locale is required"),
  faviconUrl: z.string().url("Invalid URL").optional(),
  logoUrl: z.string().url("Invalid URL").optional(),
});

const contactInfoSchema = z.object({
  email: z.string().email("Invalid email"),
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
});

export async function getSiteSettings() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  try {
    return await db.query.siteSettings.findFirst();
  } catch (e) {
    console.error("getSiteSettings DB error:", e);
    return null;
  }
}

export async function updateSiteSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = siteSettingsSchema.safeParse({
    brandName: formData.get("brandName"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    ogLocale: formData.get("ogLocale"),
    faviconUrl: formData.get("faviconUrl") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const existingSettings = await db.query.siteSettings.findFirst();
  
  if (existingSettings) {
    await db.update(siteSettings)
      .set({
        ...validatedFields.data,
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.id, existingSettings.id));
  } else {
    await db.insert(siteSettings).values({
      ...validatedFields.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: "Site settings updated successfully" };
}

export async function getContactInfo() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  try {
    return await db.query.contactInfo.findFirst();
  } catch (e) {
    console.error("getContactInfo DB error:", e);
    return null;
  }
}

export async function updateContactInfo(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = contactInfoSchema.safeParse({
    email: formData.get("email"),
    whatsappNumber: formData.get("whatsappNumber"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const existingContact = await db.query.contactInfo.findFirst();
  
  if (existingContact) {
    await db.update(contactInfo)
      .set({
        ...validatedFields.data,
        updatedAt: new Date(),
      })
      .where(eq(contactInfo.id, existingContact.id));
  } else {
    await db.insert(contactInfo).values({
      ...validatedFields.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  revalidatePath("/admin/contact");
  revalidatePath("/");
  return { success: "Contact info updated successfully" };
}