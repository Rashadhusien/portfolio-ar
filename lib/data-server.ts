import { db } from "@/lib/db";
import { 
  siteSettings, heroContent, aboutContent, aboutFeatures, aboutStats,
  services, previousWorks, pricingPackages, pricingFeatures, 
  contactInfo, socialLinks 
} from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

const fallbackSiteSettings = {
  brandName: "Books With Arwa",
  metaTitle: "Books With Arwa | مراجعات كتب وصناعة محتوى ثقافي",
  metaDescription: "منصة متخصصة في مراجعات الكتب والتسويق الثقافي على وسائل التواصل الاجتماعي",
  ogLocale: "ar_EG",
};

export async function getSiteSettings() {
  try {
    const settings = await db.query.siteSettings.findFirst();
    return settings || fallbackSiteSettings;
  } catch {
    return fallbackSiteSettings;
  }
}

export async function getHeroContent() {
  try {
    return await db.query.heroContent.findFirst();
  } catch {
    return null;
  }
}

export async function getAboutContent() {
  try {
    const content = await db.query.aboutContent.findFirst();
    const features = await db.query.aboutFeatures.findMany({
      orderBy: [desc(aboutFeatures.displayOrder)],
    });
    const stats = await db.query.aboutStats.findMany({
      where: eq(aboutStats.isVisible, true),
      orderBy: [desc(aboutStats.displayOrder)],
    });
    return { content, features, stats };
  } catch {
    return { content: null, features: [], stats: [] };
  }
}

export async function getServices() {
  try {
    return await db.query.services.findMany({
      where: eq(services.isVisible, true),
      orderBy: [desc(services.displayOrder)],
    });
  } catch {
    return [];
  }
}

export async function getPreviousWorks() {
  try {
    return await db.query.previousWorks.findMany({
      where: eq(previousWorks.isVisible, true),
      orderBy: [desc(previousWorks.displayOrder)],
    });
  } catch {
    return [];
  }
}

export async function getPricingPackages() {
  try {
    const packages = await db.query.pricingPackages.findMany({
      where: eq(pricingPackages.isVisible, true),
      orderBy: [desc(pricingPackages.displayOrder)],
      with: {
        features: {
          orderBy: [desc(pricingFeatures.displayOrder)],
        },
      },
    });
    return packages;
  } catch {
    return [];
  }
}

export async function getContactInfo() {
  try {
    return await db.query.contactInfo.findFirst();
  } catch {
    return null;
  }
}

export async function getSocialLinks() {
  try {
    return await db.query.socialLinks.findMany({
      where: eq(socialLinks.isVisible, true),
      orderBy: [desc(socialLinks.displayOrder)],
    });
  } catch {
    return [];
  }
}