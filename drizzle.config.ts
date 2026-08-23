import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");
if (!dbUrl) {
  throw new Error("DATABASE_URL is not set in .env.local file");
}

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
