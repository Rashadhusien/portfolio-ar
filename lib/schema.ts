import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const popularPackageEnum = pgEnum("popular_package", ["true", "false"]);

// Singleton tables (should only have one record)
export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandName: text("brand_name").notNull(),
  metaTitle: text("meta_title").notNull(),
  metaDescription: text("meta_description").notNull(),
  ogLocale: text("og_locale").notNull().default("ar_EG"),
  faviconUrl: text("favicon_url"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const heroContent = pgTable("hero_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileImageUrl: text("profile_image_url").notNull(),
  profileImageAlt: text("profile_image_alt").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  ctaButtonText1: text("cta_button_text_1").notNull(),
  ctaButtonLink1: text("cta_button_link_1").notNull(),
  ctaButtonVariant1: text("cta_button_variant_1").notNull(),
  ctaButtonText2: text("cta_button_text_2").notNull(),
  ctaButtonLink2: text("cta_button_link_2").notNull(),
  ctaButtonVariant2: text("cta_button_variant_2").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aboutContent = pgTable("about_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactInfo = pgTable("contact_info", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Multiple record tables
export const aboutFeatures = pgTable("about_features", {
  id: uuid("id").primaryKey().defaultRandom(),
  feature: text("feature").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aboutStats = pgTable("about_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  followers: text("followers").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const previousWorks = pgTable("previous_works", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  videoUrl: text("video_url").notNull(),
  videoAlt: text("video_alt").notNull(),
  externalSourceUrl: text("external_source_url").notNull(),
  platform: text("platform").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pricingPackages = pgTable("pricing_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  isPopular: boolean("is_popular").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pricingFeatures = pgTable("pricing_features", {
  id: uuid("id").primaryKey().defaultRandom(),
  packageId: uuid("package_id")
    .notNull()
    .references(() => pricingPackages.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const socialLinks = pgTable("social_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  iconUrl: text("icon_url").notNull(),
  isVisible: boolean("is_visible").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Keep existing admins table
export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const pricingPackagesRelations = relations(pricingPackages, ({ many }) => ({
  features: many(pricingFeatures),
}));

export const pricingFeaturesRelations = relations(pricingFeatures, ({ one }) => ({
  package: one(pricingPackages, {
    fields: [pricingFeatures.packageId],
    references: [pricingPackages.id],
  }),
}));

// Type exports
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;
export type HeroContent = typeof heroContent.$inferSelect;
export type NewHeroContent = typeof heroContent.$inferInsert;
export type AboutContent = typeof aboutContent.$inferSelect;
export type NewAboutContent = typeof aboutContent.$inferInsert;
export type ContactInfo = typeof contactInfo.$inferSelect;
export type NewContactInfo = typeof contactInfo.$inferInsert;
export type AboutFeature = typeof aboutFeatures.$inferSelect;
export type NewAboutFeature = typeof aboutFeatures.$inferInsert;
export type AboutStat = typeof aboutStats.$inferSelect;
export type NewAboutStat = typeof aboutStats.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type PreviousWork = typeof previousWorks.$inferSelect;
export type NewPreviousWork = typeof previousWorks.$inferInsert;
export type PricingPackage = typeof pricingPackages.$inferSelect;
export type NewPricingPackage = typeof pricingPackages.$inferInsert;
export type PricingPackageWithFeatures = PricingPackage & { features: PricingFeature[] };
export type PricingFeature = typeof pricingFeatures.$inferSelect;
export type NewPricingFeature = typeof pricingFeatures.$inferInsert;
export type SocialLink = typeof socialLinks.$inferSelect;
export type NewSocialLink = typeof socialLinks.$inferInsert;
