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
import { updateHeroContent } from "@/lib/actions/hero.actions";
import { toast } from "sonner";
import { MediaUpload } from "@/components/admin/shared/media-upload";

interface HeroFormProps {
  initialData: {
    profileImageUrl?: string;
    profileImageAlt?: string;
    title?: string;
    subtitle?: string;
    ctaButtonText1?: string;
    ctaButtonLink1?: string;
    ctaButtonVariant1?: string;
    ctaButtonText2?: string;
    ctaButtonLink2?: string;
    ctaButtonVariant2?: string;
  };
}

export function HeroForm({ initialData }: HeroFormProps) {
  const [loading, setLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(initialData.profileImageUrl || "");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      // Add the current profile image URL to form data
      formData.set("profileImageUrl", profileImageUrl);
      
      const result = await updateHeroContent(formData);
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
        <CardTitle>القسم الرئيسي</CardTitle>
        <CardDescription>
          قم بتحديث محتوى القسم الرئيسي والصورة الشخصية
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>صورة الملف الشخصي</Label>
            <div className="space-y-2">
              {profileImageUrl && (
                <div className="relative w-48 h-48 rounded-lg overflow-hidden border">
                  <img
                    src={profileImageUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <MediaUpload
                type="image"
                onUpload={(url) => setProfileImageUrl(url)}
              />
            </div>
            <Input
              name="profileImageAlt"
              defaultValue={initialData.profileImageAlt}
              placeholder="وصف الصورة البديل"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">العنوان الرئيسي</Label>
            <Input
              id="title"
              name="title"
              defaultValue={initialData.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">العنوان الفرعي</Label>
            <Textarea
              id="subtitle"
              name="subtitle"
              defaultValue={initialData.subtitle}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaButtonText1">نص الزر الأول</Label>
              <Input
                id="ctaButtonText1"
                name="ctaButtonText1"
                defaultValue={initialData.ctaButtonText1}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaButtonLink1">رابط الزر الأول</Label>
              <Input
                id="ctaButtonLink1"
                name="ctaButtonLink1"
                defaultValue={initialData.ctaButtonLink1}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaButtonVariant1">نمط الزر الأول</Label>
              <Input
                id="ctaButtonVariant1"
                name="ctaButtonVariant1"
                defaultValue={initialData.ctaButtonVariant1}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaButtonText2">نص الزر الثاني</Label>
              <Input
                id="ctaButtonText2"
                name="ctaButtonText2"
                defaultValue={initialData.ctaButtonText2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaButtonLink2">رابط الزر الثاني</Label>
              <Input
                id="ctaButtonLink2"
                name="ctaButtonLink2"
                defaultValue={initialData.ctaButtonLink2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaButtonVariant2">نمط الزر الثاني</Label>
              <Input
                id="ctaButtonVariant2"
                name="ctaButtonVariant2"
                defaultValue={initialData.ctaButtonVariant2}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}