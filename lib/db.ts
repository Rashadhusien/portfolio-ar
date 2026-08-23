import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Strip surrounding quotes that may be present in .env (Next.js vs dotenv handling)
databaseUrl = databaseUrl.trim().replace(/^['"]|['"]$/g, "");

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
