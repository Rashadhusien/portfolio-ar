"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { heroContent } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const heroSchema = z.object({
  profileImageUrl: z.string().min(1, "Image URL is required"),
  profileImageAlt: z.string().min(1, "Alt text is required"),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  ctaButtonText1: z.string().min(1, "CTA button text is required"),
  ctaButtonLink1: z.string().min(1, "CTA link is required"),
  ctaButtonVariant1: z.string().min(1, "Variant is required"),
  ctaButtonText2: z.string().min(1, "CTA button text is required"),
  ctaButtonLink2: z.string().min(1, "CTA link is required"),
  ctaButtonVariant2: z.string().min(1, "Variant is required"),
});

export async function getHeroContent() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  try {
    return await db.query.heroContent.findFirst();
  } catch (e) {
    console.error("getHeroContent DB error:", e);
    return null;
  }
}

export async function updateHeroContent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

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
    return { error: validatedFields.error.errors[0].message };
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
  return { success: "Hero content updated successfully" };
}