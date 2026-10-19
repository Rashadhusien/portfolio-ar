"use server";

import { db } from "@/lib/db";
import { heroContent } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { safeImageSrc, safeLink } from "@/lib/validation/url";
import { adminAction, firstIssue, requireAdmin } from "@/lib/actions/helpers";

const heroSchema = z.object({
  profileImageUrl: safeImageSrc("الصورة الشخصية مطلوبة"),
  profileImageAlt: z.string().min(1, "النص البديل للصورة مطلوب"),
  title: z.string().min(1, "العنوان الرئيسي مطلوب"),
  subtitle: z.string().min(1, "العنوان الفرعي مطلوب"),
  ctaButtonText1: z.string().min(1, "نص الزر الأول مطلوب"),
  ctaButtonLink1: safeLink("رابط الزر الأول مطلوب"),
  ctaButtonVariant1: z.string().min(1, "نمط الزر الأول مطلوب"),
  ctaButtonText2: z.string().min(1, "نص الزر الثاني مطلوب"),
  ctaButtonLink2: safeLink("رابط الزر الثاني مطلوب"),
  ctaButtonVariant2: z.string().min(1, "نمط الزر الثاني مطلوب"),
});

export async function getHeroContent() {
  await requireAdmin();
  try {
    return await db.query.heroContent.findFirst();
  } catch (e) {
    console.error("getHeroContent DB error:", e);
    return null;
  }
}

export async function updateHeroContent(formData: FormData) {
  return adminAction("updateHeroContent", async () => {
    const validatedFields = heroSchema.safeParse({
      profileImageUrl: formData.get("profileImageUrl"),
      profileImageAlt: formData.get("profileImageAlt"),
      title: formData.get("title"),
      subtitle: formData.get("subtitle"),
      ctaButtonText1: formData.get("ctaButtonText1"),
      ctaButtonLink1: formData.get("ctaButtonLink1"),
      ctaButtonVariant1: formData.get("ctaButtonVariant1"),
      ctaButtonText2: formData.get("ctaButtonText2"),
      ctaButtonLink2: formData.get("ctaButtonLink2"),
      ctaButtonVariant2: formData.get("ctaButtonVariant2"),
    });

    if (!validatedFields.success) {
      return { error: firstIssue(validatedFields.error) };
    }

    const existingHero = await db.query.heroContent.findFirst();

    if (existingHero) {
      await db.update(heroContent)
        .set({
          ...validatedFields.data,
          updatedAt: new Date(),
        })
        .where(eq(heroContent.id, existingHero.id));
    } else {
      await db.insert(heroContent).values({
        ...validatedFields.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath("/admin/hero");
    revalidatePath("/");
    return { success: "تم تحديث القسم الرئيسي بنجاح" };
  });
}
