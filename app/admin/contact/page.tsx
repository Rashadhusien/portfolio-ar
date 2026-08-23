import { getContactInfo } from "@/lib/actions/settings.actions";
import { ContactForm } from "@/components/admin/contact/contact-form";

export default async function ContactPage() {
  const contactInfo = await getContactInfo();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">معلومات التواصل</h1>
        <p className="text-muted-foreground">إدارة معلومات التواصل الأساسية</p>
      </div>

      <ContactForm initialData={contactInfo ?? {}} />
    </div>
  );
}