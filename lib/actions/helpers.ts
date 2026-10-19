import { auth } from "@/auth";
import type { Session } from "next-auth";
import { z } from "zod";

// Shared plumbing for the admin Server Actions. This module is deliberately
// not "use server": nothing here should be callable from the client.

export type ActionResult =
  | { success: string; error?: undefined }
  | { error: string; success?: undefined };

export const MESSAGES = {
  unauthorized: "غير مصرح",
  invalidId: "معرّف غير صالح",
  notFound: "العنصر غير موجود، ربما تم حذفه",
  invalidData: "بيانات غير صالحة",
  unexpected: "حدث خطأ غير متوقع، حاول مرة أخرى",
} as const;

const uuid = z.string().uuid();

export function isUuid(id: unknown): id is string {
  return uuid.safeParse(id).success;
}

export function firstIssue(error: z.ZodError) {
  return error.errors[0]?.message ?? MESSAGES.invalidData;
}

/** For admin read helpers: throws so the admin error boundary handles it. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

/**
 * Runs an admin mutation. Never throws: auth failures, unexpected DB
 * errors (constraint violations, connectivity) and bugs are turned into
 * an { error } result so the admin UI can always show feedback. Details
 * are logged server-side only.
 */
export async function adminAction(
  name: string,
  fn: (session: Session) => Promise<ActionResult>,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: MESSAGES.unauthorized };
    return await fn(session);
  } catch (e) {
    console.error(`[action:${name}]`, e);
    return { error: MESSAGES.unexpected };
  }
}
