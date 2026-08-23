import "dotenv/config";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function applyConstraints() {
  console.log("Applying database constraints...");

  try {
    // Business rule: Only one pricing package can be popular
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_popular_package 
      ON pricing_packages (is_popular) 
      WHERE is_popular = true
    `);
    console.log("✅ unique_popular_package index created");

    // Singleton enforcement
    await db.execute(
      sql`CREATE UNIQUE INDEX IF NOT EXISTS singleton_site_settings ON site_settings ((1))`,
    );
    console.log("✅ singleton_site_settings index created");

    await db.execute(
      sql`CREATE UNIQUE INDEX IF NOT EXISTS singleton_hero_content ON hero_content ((1))`,
    );
    console.log("✅ singleton_hero_content index created");

    await db.execute(
      sql`CREATE UNIQUE INDEX IF NOT EXISTS singleton_about_content ON about_content ((1))`,
    );
    console.log("✅ singleton_about_content index created");

    await db.execute(
      sql`CREATE UNIQUE INDEX IF NOT EXISTS singleton_contact_info ON contact_info ((1))`,
    );
    console.log("✅ singleton_contact_info index created");

    // Performance indexes
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order)`,
    );
    console.log("✅ idx_services_display_order index created");

    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_previous_works_display_order ON previous_works(display_order)`,
    );
    console.log("✅ idx_previous_works_display_order index created");

    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_pricing_packages_display_order ON pricing_packages(display_order)`,
    );
    console.log("✅ idx_pricing_packages_display_order index created");

    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_pricing_features_package_id ON pricing_features(package_id)`,
    );
    console.log("✅ idx_pricing_features_package_id index created");

    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_social_links_display_order ON social_links(display_order)`,
    );
    console.log("✅ idx_social_links_display_order index created");

    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_about_features_display_order ON about_features(display_order)`,
    );
    console.log("✅ idx_about_features_display_order index created");

    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_about_stats_display_order ON about_stats(display_order)`,
    );
    console.log("✅ idx_about_stats_display_order index created");

    // Visibility indexes
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_services_visible ON services(is_visible) WHERE is_visible = true`,
    );
    console.log("✅ idx_services_visible index created");

    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_previous_works_visible ON previous_works(is_visible) WHERE is_visible = true`,
    );
    console.log("✅ idx_previous_works_visible index created");

    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_pricing_packages_visible ON pricing_packages(is_visible) WHERE is_visible = true`,
    );
    console.log("✅ idx_pricing_packages_visible index created");

    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_social_links_visible ON social_links(is_visible) WHERE is_visible = true`,
    );
    console.log("✅ idx_social_links_visible index created");

    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_about_stats_visible ON about_stats(is_visible) WHERE is_visible = true`,
    );
    console.log("✅ idx_about_stats_visible index created");

    console.log("🎉 All constraints applied successfully!");
  } catch (error) {
    console.error("Error applying constraints:", error);
    process.exit(1);
  }
}

applyConstraints();
