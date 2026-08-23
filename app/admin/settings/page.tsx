import { getSiteSettings } from "@/lib/actions/settings.actions";
import { SettingsForm } from "@/components/admin/settings/settings-form";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  // Map DB nulls to undefined for form props
  const formData = settings
    ? {
        brandName: settings.brandName,
        metaTitle: settings.metaTitle,
        metaDescription: settings.metaDescription,
        ogLocale: settings.ogLocale,
        faviconUrl: settings.faviconUrl ?? undefined,
        logoUrl: settings.logoUrl ?? undefined,
      }
    : {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">إعدادات الموقع</h1>
        <p className="text-muted-foreground">إدارة إعدادات ومعلومات الموقع الأساسية</p>
      </div>

      <SettingsForm initialData={formData} />
    </div>
  );
}