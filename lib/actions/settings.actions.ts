"use server";

import { db } from "@/lib/db";
import { siteSettings, contactInfo } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { safeImageSrc } from "@/lib/validation/url";
import { adminAction, firstIssue, requireAdmin } from "@/lib/actions/helpers";

const siteSettingsSchema = z.object({
  brandName: z.string().min(1, "اسم العلامة التجارية مطلوب"),
  metaTitle: z.string().min(1, "عنوان الميتا مطلوب"),
  metaDescription: z.string().min(1, "وصف الميتا مطلوب"),
  ogLocale: z.string().min(1, "اللغة مطلوبة"),
  faviconUrl: safeImageSrc("رابط الأيقونة غير صالح").optional(),
  logoUrl: safeImageSrc("رابط الشعار غير صالح").optional(),
});

const contactInfoSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  whatsappNumber: z.string().min(1, "رقم الواتساب مطلوب"),
});

export async function getSiteSettings() {
  await requireAdmin();
  try {
    return await db.query.siteSettings.findFirst();
  } catch (e) {
    console.error("getSiteSettings DB error:", e);
    return null;
  }
}

export async function updateSiteSettings(formData: FormData) {
  return adminAction("updateSiteSettings", async () => {
    const validatedFields = siteSettingsSchema.safeParse({
      brandName: formData.get("brandName"),
      metaTitle: formData.get("metaTitle"),
      metaDescription: formData.get("metaDescription"),
      ogLocale: formData.get("ogLocale"),
      faviconUrl: formData.get("faviconUrl") || undefined,
      logoUrl: formData.get("logoUrl") || undefined,
    });

    if (!validatedFields.success) {
      return { error: firstIssue(validatedFields.error) };
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
    return { success: "تم تحديث إعدادات الموقع بنجاح" };
  });
}

export async function getContactInfo() {
  await requireAdmin();
  try {
    return await db.query.contactInfo.findFirst();
  } catch (e) {
    console.error("getContactInfo DB error:", e);
    return null;
  }
}

export async function updateContactInfo(formData: FormData) {
  return adminAction("updateContactInfo", async () => {
    const validatedFields = contactInfoSchema.safeParse({
      email: formData.get("email"),
      whatsappNumber: formData.get("whatsappNumber"),
    });

    if (!validatedFields.success) {
      return { error: firstIssue(validatedFields.error) };
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
    return { success: "تم تحديث معلومات التواصل بنجاح" };
  });
}
