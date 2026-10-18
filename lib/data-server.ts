import { db } from "@/lib/db";
import { 
  siteSettings, heroContent, aboutContent, aboutFeatures, aboutStats,
  services, previousWorks, pricingPackages, pricingFeatures, 
  contactInfo, socialLinks 
} from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

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
      orderBy: [asc(aboutFeatures.displayOrder), asc(aboutFeatures.createdAt)],
    });
    const stats = await db.query.aboutStats.findMany({
      where: eq(aboutStats.isVisible, true),
      orderBy: [asc(aboutStats.displayOrder), asc(aboutStats.createdAt)],
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
      orderBy: [asc(services.displayOrder), asc(services.createdAt)],
    });
  } catch {
    return [];
  }
}

export async function getPreviousWorks() {
  try {
    return await db.query.previousWorks.findMany({
      where: eq(previousWorks.isVisible, true),
      orderBy: [asc(previousWorks.displayOrder), asc(previousWorks.createdAt)],
    });
  } catch {
    return [];
  }
}

export async function getPricingPackages() {
  try {
    const packages = await db.query.pricingPackages.findMany({
      where: eq(pricingPackages.isVisible, true),
      orderBy: [asc(pricingPackages.displayOrder), asc(pricingPackages.createdAt)],
      with: {
        features: {
          orderBy: [asc(pricingFeatures.displayOrder), asc(pricingFeatures.createdAt)],
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
      orderBy: [asc(socialLinks.displayOrder), asc(socialLinks.createdAt)],
    });
  } catch {
    return [];
  }
}