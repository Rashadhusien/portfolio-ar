import { getPricingPackages } from "@/lib/actions/pricing.actions";
import { PricingManager } from "@/components/admin/pricing/pricing-manager";

export default async function PricingPage() {
  const packages = await getPricingPackages();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">إدارة الأسعار</h1>
        <p className="text-muted-foreground">الباقات والميزات – باقة واحدة فقط يمكن أن تكون مميزة ⭐</p>
      </div>
      <PricingManager initialPackages={packages} />
    </div>
  );
}
