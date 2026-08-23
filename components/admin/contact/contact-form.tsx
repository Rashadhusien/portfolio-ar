"use client";

import { useState } from "react";
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
import { updateContactInfo } from "@/lib/actions/settings.actions";
import { toast } from "sonner";

interface ContactFormProps {
  initialData: {
    email?: string;
    whatsappNumber?: string;
  };
}

export function ContactForm({ initialData }: ContactFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await updateContactInfo(formData);
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
        <CardTitle>معلومات التواصل</CardTitle>
        <CardDescription>
          هذه المعلومات ستظهر في جميع أقسام الموقع
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initialData.email}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">رقم الواتساب</Label>
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              defaultValue={initialData.whatsappNumber}
              required
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