"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateSiteSettings } from "@/lib/actions/settings.actions";
import { toast } from "sonner";

interface SettingsFormProps {
  initialData: {
    brandName?: string;
    metaTitle?: string;
    metaDescription?: string;
    ogLocale?: string;
    faviconUrl?: string;
    logoUrl?: string;
  };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await updateSiteSettings(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الموقع</CardTitle>
        <CardDescription>
          قم بتحديث المعلومات الأساسية لموقعك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="brandName">اسم العلامة التجارية</Label>
            <Input
              id="brandName"
              name="brandName"
              defaultValue={initialData.brandName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaTitle">عنوان الميتا</Label>
            <Input
              id="metaTitle"
              name="metaTitle"
              defaultValue={initialData.metaTitle}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">وصف الميتا</Label>
            <Textarea
              id="metaDescription"
              name="metaDescription"
              defaultValue={initialData.metaDescription}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ogLocale">اللغة</Label>
            <Input
              id="ogLocale"
              name="ogLocale"
              defaultValue={initialData.ogLocale}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faviconUrl">رابط أيقونة الموقع (اختياري)</Label>
            <Input
              id="faviconUrl"
              name="faviconUrl"
              defaultValue={initialData.faviconUrl}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">رابط الشعار (اختياري)</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              defaultValue={initialData.logoUrl}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}