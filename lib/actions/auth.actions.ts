"use server";

import { db } from "@/lib/db";
import { admins } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { signOut } from "@/auth";
import { adminAction, firstIssue } from "@/lib/actions/helpers";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string().min(1, "يرجى تأكيد كلمة المرور"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

export async function changePassword(formData: FormData) {
  return adminAction("changePassword", async (session) => {
    const validatedFields = changePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
      return { error: firstIssue(validatedFields.error) };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    // Get current admin
    const admin = await db.query.admins.findFirst({
      where: eq(admins.id, session.user.id),
    });

    if (!admin) {
      return { error: "المسؤول غير موجود" };
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      return { error: "كلمة المرور الحالية غير صحيحة" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(admins)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(admins.id, session.user.id));

    revalidatePath("/admin/settings/password");
    return { success: "تم تغيير كلمة المرور بنجاح" };
  });
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
