import "dotenv/config";
import { db } from "@/lib/db";
import {
  admins,
  siteSettings,
  heroContent,
  aboutContent,
  aboutFeatures,
  aboutStats,
  services,
  previousWorks,
  pricingPackages,
  pricingFeatures,
  contactInfo,
  socialLinks,
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }

  // 1. Seed admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await db.query.admins.findFirst({
    where: eq(admins.email, adminEmail),
  });

  if (!existingAdmin) {
    await db.insert(admins).values({
      name: "Admin User",
      email: adminEmail,
      password: hashedPassword,
    });
    console.log(`✅ Admin user created with email: ${adminEmail}`);
  } else {
    console.log("✅ Admin user already exists");
  }

  // 2. Seed site settings (singleton) - brand is editable via /admin/settings
  const existingSettings = await db.query.siteSettings.findFirst();
  if (!existingSettings) {
    await db.insert(siteSettings).values({
      brandName: "Books With Arwa",
      metaTitle: "Books With Arwa | مراجعات كتب وصناعة محتوى ثقافي",
      metaDescription:
        "منصة متخصصة في مراجعات الكتب والتسويق الثقافي على وسائل التواصل الاجتماعي",
      ogLocale: "ar_EG",
    });
    console.log("✅ Site settings seeded");
  } else {
    console.log("✅ Site settings already exist");
  }

  // 3. Seed hero content (singleton)
  const existingHero = await db.query.heroContent.findFirst();
  if (!existingHero) {
    await db.insert(heroContent).values({
      profileImageUrl: "/hero-image.jpeg",
      profileImageAlt: "Profile Image",
      title: "مراجِحة كتب وصانعة محتوى",
      subtitle:
        "المزيج المثالي بين التسويق الإبداعي وعمق المراجعة في عالم الكتب",
      ctaButtonText1: "تواصل معي",
      ctaButtonLink1: "#contact",
      ctaButtonVariant1: "default",
      ctaButtonText2: "اعرف الأسعار",
      ctaButtonLink2: "#pricing",
      ctaButtonVariant2: "outline",
    });
    console.log("✅ Hero content seeded");
  } else {
    console.log("✅ Hero content already exists");
  }

  // 4. Seed about content (singleton)
  const existingAbout = await db.query.aboutContent.findFirst();
  if (!existingAbout) {
    await db.insert(aboutContent).values({
      title: "عني",
      content: `أنا أروى محمود، قارئة نَهِمة وصانعة محتوى أدبي. شغفي بالكتب بدأ من زمان جدًا، وخصوصًا الروايات اللي تقدر تشدّك من أول صفحة لآخر سطر.
المساحة دي بشارك فيها حبي للقراءة، وبقدّم مراجعات تساعد القارئ يختار الكتاب المناسب، وفي نفس الوقت تدّي الكاتب عرض محترف ومنصف لشغله.
كل مراجعة عندي مبنيّة على قراءة حقيقية:
تحليل، ملاحظات، نقاط قوة، ومناطق ممكن تتطوّر — وكل ده بروح داعمة وصادقة.`,
    });
    console.log("✅ About content seeded");
  } else {
    console.log("✅ About content already exists");
  }

  // 5. Seed about features
  const existingFeatures = await db.query.aboutFeatures.findMany();
  if (existingFeatures.length === 0) {
    await db.insert(aboutFeatures).values([
      { feature: "مراجعات كتب عميقة وجذابة", displayOrder: 0 },
      { feature: "محتوى تسويقي احترافي للمؤلفين والناشرين", displayOrder: 1 },
      { feature: "تعاونات استراتيجية مع العلامات التجارية", displayOrder: 2 },
      { feature: "استراتيجيات تسويق ثقافية مبتكرة", displayOrder: 3 },
    ]);
    console.log("✅ About features seeded");
  } else {
    console.log("✅ About features already exist");
  }

  // 6. Seed about stats
  const existingStats = await db.query.aboutStats.findMany();
  if (existingStats.length === 0) {
    await db.insert(aboutStats).values([
      { title: "تيك توك", followers: "7K+", displayOrder: 0, isVisible: true },
      {
        title: "انستاجرام",
        followers: "3K+",
        displayOrder: 1,
        isVisible: true,
      },
      {
        title: "بينتيرست",
        followers: "350K+",
        displayOrder: 2,
        isVisible: true,
      },
    ]);
    console.log("✅ About stats seeded");
  } else {
    console.log("✅ About stats already exist");
  }

  // 7. Seed services
  const existingServices = await db.query.services.findMany();
  if (existingServices.length === 0) {
    await db.insert(services).values([
      {
        name: "مراجعة الكتب",
        description:
          "مراجعات كتب احترافية وجذابة عبر الفيديو والصور، تركز على أهم المحتوى",
        icon: "book",
        displayOrder: 0,
        isVisible: true,
      },
      {
        name: "الترويج على وسائل التواصل",
        description:
          "محتوى تسويقي مخصص لتطبيقات TikTok و Instagram بصيغ جذابة وفعالة",
        icon: "sparkles",
        displayOrder: 1,
        isVisible: true,
      },
      {
        name: "تصوير Reels",
        description: "محتوى فيديو عالي الجودة مخصص للكتب والعلامات التجارية",
        icon: "camera",
        displayOrder: 2,
        isVisible: true,
      },
      {
        name: "التسويق الثقافي",
        description: "استراتيجيات تسويق متكاملة لتعزيز المحتوى الثقافي والكتب",
        icon: "trending",
        displayOrder: 3,
        isVisible: true,
      },
    ]);
    console.log("✅ Services seeded");
  } else {
    console.log("✅ Services already exist");
  }

  // 8. Seed previous works
  const existingWorks = await db.query.previousWorks.findMany();
  if (existingWorks.length === 0) {
    await db.insert(previousWorks).values([
      {
        title: `مراجعة رواية "لأنها كيارا"`,
        videoUrl: "/videos/video1.mp4",
        videoAlt: "Book review",
        externalSourceUrl: "https://www.tiktok.com/@bookswitharwa",
        platform: "TikTok",
        displayOrder: 0,
        isVisible: true,
      },
      {
        title: `مراجعة رواية "صديقي السيكوباتي"`,
        videoUrl: "/videos/video2.mp4",
        videoAlt: "Publishing collaboration",
        externalSourceUrl: "https://www.tiktok.com/@bookswitharwa",
        platform: "TikTok",
        displayOrder: 1,
        isVisible: true,
      },
      {
        title: `مراجعة رواية "جريمه علي لوح الشطرنج"`,
        videoUrl: "/videos/video3.mp4",
        videoAlt: "Viral reels",
        externalSourceUrl: "https://www.tiktok.com/@bookswitharwa",
        platform: "TikTok",
        displayOrder: 2,
        isVisible: true,
      },
    ]);
    console.log("✅ Previous works seeded");
  } else {
    console.log("✅ Previous works already exist");
  }

  // 9. Seed pricing packages
  const existingPackages = await db.query.pricingPackages.findMany();
  let packageIds: string[] = [];
  if (existingPackages.length === 0) {
    const packages = await db
      .insert(pricingPackages)
      .values([
        {
          name: "باقة التجربة المركزة",
          description: "مراجعة كتاب واحد احترافية",
          price: 1000,
          isPopular: false,
          displayOrder: 0,
          isVisible: true,
        },
        {
          name: "باقة الانطلاق",
          description: "محتوى دوري ومستمر",
          price: 1500,
          isPopular: true,
          displayOrder: 1,
          isVisible: true,
        },
        {
          name: "باقة الانتشار الكامل",
          description: "حزمة متكاملة للناشرين",
          price: 2000,
          isPopular: false,
          displayOrder: 2,
          isVisible: true,
        },
      ])
      .returning();
    packageIds = packages.map((p) => p.id);
    console.log("✅ Pricing packages seeded");
  } else {
    packageIds = existingPackages.map((p) => p.id);
    console.log("✅ Pricing packages already exist");
  }

  // 10. Seed pricing features
  if (packageIds.length > 0) {
    const existingFeatures = await db.query.pricingFeatures.findMany();
    if (existingFeatures.length === 0) {
      await db.insert(pricingFeatures).values([
        {
          packageId: packageIds[0],
          feature: "إنستجرام: 1 ريلز",
          displayOrder: 0,
        },
        {
          packageId: packageIds[0],
          feature: "إنستجرام: 1 ستوري",
          displayOrder: 1,
        },
        {
          packageId: packageIds[0],
          feature: "تيك توك: 1 فيديو",
          displayOrder: 2,
        },
        {
          packageId: packageIds[1],
          feature: "إنستجرام: 2 ريلز",
          displayOrder: 0,
        },
        {
          packageId: packageIds[1],
          feature: "إنستجرام: 3 ستوري",
          displayOrder: 1,
        },
        {
          packageId: packageIds[1],
          feature: "تيك توك: 2 فيديو",
          displayOrder: 2,
        },
        {
          packageId: packageIds[2],
          feature: "ريفيو علي fabel و Goodreads",
          displayOrder: 0,
        },
        {
          packageId: packageIds[2],
          feature: "إنستجرام: 3 ريلز",
          displayOrder: 1,
        },
        {
          packageId: packageIds[2],
          feature: "إنستجرام: 6 ستوري",
          displayOrder: 2,
        },
        {
          packageId: packageIds[2],
          feature: "تيك توك: 3 فيديوهات",
          displayOrder: 3,
        },
        {
          packageId: packageIds[2],
          feature: "بينترست: 10 بينات (Aesthetic Pins)",
          displayOrder: 4,
        },
      ]);
      console.log("✅ Pricing features seeded");
    } else {
      console.log("✅ Pricing features already exist");
    }
  }

  // 11. Seed contact info (singleton)
  const existingContact = await db.query.contactInfo.findFirst();
  if (!existingContact) {
    await db.insert(contactInfo).values({
      email: "berrydeniz0@gmail.com",
      whatsappNumber: "+201150153088",
    });
    console.log("✅ Contact info seeded");
  } else {
    console.log("✅ Contact info already exists");
  }

  // 12. Seed social links
  const existingSocial = await db.query.socialLinks.findMany();
  if (existingSocial.length === 0) {
    await db.insert(socialLinks).values([
      {
        platform: "TikTok",
        url: "https://www.tiktok.com/@bookswitharwa",
        iconUrl: "/tiktok.svg",
        isVisible: true,
        displayOrder: 0,
      },
      {
        platform: "Instagram",
        url: "https://www.instagram.com/bookswitharwa/",
        iconUrl: "/instagram.svg",
        isVisible: true,
        displayOrder: 1,
      },
      {
        platform: "YouTube",
        url: "https://www.youtube.com/@bookswitharwa",
        iconUrl: "/youtube.svg",
        isVisible: true,
        displayOrder: 2,
      },
      {
        platform: "Pinterest",
        url: "https://www.pinterest.com/bookswitharwa",
        iconUrl: "/pinterest.svg",
        isVisible: true,
        displayOrder: 3,
      },
    ]);
    console.log("✅ Social links seeded");
  } else {
    console.log("✅ Social links already exist");
  }

  console.log("🎉 Seeding completed successfully!");
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
