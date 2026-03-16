import { db } from "@/lib/db";
import { admins } from "@/lib/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await db.query.admins.findFirst({
    where: (admins, { eq }) => eq(admins.email, adminEmail),
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

  console.log("Seeding completed!");
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
