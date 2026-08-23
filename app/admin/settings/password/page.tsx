"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { changePassword } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

export default function PasswordChangePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    try {
      const result = await changePassword(formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(result.success);
        // Reset form
        const form = document.getElementById(
          "password-form",
        ) as HTMLFormElement;
        form?.reset();
      }
    } catch (error) {
      setError("حدث خطأ أثناء تحديث كلمة المرور");
      toast.error("حدث خطأ أثناء تحديث كلمة المرور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>تغيير كلمة المرور</CardTitle>
            <CardDescription>
              قم بتحديث كلمة المرور الخاصة بحساب المسؤول
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="password-form"
              action={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-right">
                  كلمة المرور الحالية
                </Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-right">
                  كلمة المرور الجديدة
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-right">
                  تأكيد كلمة المرور الجديدة
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
