"use client";

import { toast } from "sonner";
import type { ActionResult } from "@/lib/actions/helpers";

/**
 * Calls an admin Server Action and always gives the admin feedback:
 * a toast for the returned success/error, or a connection error if the
 * request itself failed (offline, server crash, deploy in progress).
 */
export async function runAction(
  action: () => Promise<ActionResult>,
  onSuccess?: () => void,
): Promise<ActionResult | undefined> {
  try {
    const res = await action();
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success);
      onSuccess?.();
    }
    return res;
  } catch (e) {
    console.error("Server action failed:", e);
    toast.error("تعذر الاتصال بالخادم، حاول مرة أخرى");
    return undefined;
  }
}
