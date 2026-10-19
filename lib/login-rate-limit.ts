import { db } from "@/lib/db";
import { loginAttempts } from "@/lib/schema";
import { inArray, sql } from "drizzle-orm";

// Failures allowed per window before the key is locked.
const EMAIL_MAX_FAILURES = 5;
const IP_MAX_FAILURES = 20;
const WINDOW_MINUTES = 15;
const LOCK_MINUTES = 15;

export function rateLimitKeys(email: string, request?: Request) {
  const ip =
    request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request?.headers.get("x-real-ip") ||
    "unknown";
  return { emailKey: `email:${email}`, ipKey: `ip:${ip}` };
}

// Returns true when any of the keys is currently locked.
// Fails open (returns false) if the store is unavailable, e.g. before the
// login_attempts migration has been applied, so the admin is never locked
// out by an infrastructure problem.
export async function isLocked(keys: string[]): Promise<boolean> {
  try {
    const rows = await db
      .select({ lockedUntil: loginAttempts.lockedUntil })
      .from(loginAttempts)
      .where(inArray(loginAttempts.key, keys));
    const now = Date.now();
    return rows.some((r) => r.lockedUntil && r.lockedUntil.getTime() > now);
  } catch (e) {
    console.error("[login-rate-limit] isLocked failed:", e);
    return false;
  }
}

async function recordFailureFor(key: string, maxFailures: number) {
  // Single atomic upsert: reset the counter when the window has expired,
  // otherwise increment, and set a lock once the limit is reached.
  await db.execute(sql`
    INSERT INTO login_attempts (key, failures, window_start, locked_until)
    VALUES (${key}, 1, now(), NULL)
    ON CONFLICT (key) DO UPDATE SET
      failures = CASE
        WHEN login_attempts.window_start < now() - make_interval(mins => ${WINDOW_MINUTES})
          THEN 1
        ELSE login_attempts.failures + 1
      END,
      window_start = CASE
        WHEN login_attempts.window_start < now() - make_interval(mins => ${WINDOW_MINUTES})
          THEN now()
        ELSE login_attempts.window_start
      END,
      locked_until = CASE
        WHEN login_attempts.window_start >= now() - make_interval(mins => ${WINDOW_MINUTES})
          AND login_attempts.failures + 1 >= ${maxFailures}
          THEN now() + make_interval(mins => ${LOCK_MINUTES})
        ELSE login_attempts.locked_until
      END
  `);
}

export async function recordFailure(emailKey: string, ipKey: string) {
  try {
    await Promise.all([
      recordFailureFor(emailKey, EMAIL_MAX_FAILURES),
      recordFailureFor(ipKey, IP_MAX_FAILURES),
    ]);
  } catch (e) {
    console.error("[login-rate-limit] recordFailure failed:", e);
  }
}

export async function clearFailures(emailKey: string) {
  try {
    await db.delete(loginAttempts).where(inArray(loginAttempts.key, [emailKey]));
  } catch (e) {
    console.error("[login-rate-limit] clearFailures failed:", e);
  }
}
