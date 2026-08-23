import { getServices } from "@/lib/actions/services.actions";
import { ServicesManager } from "@/components/admin/services/services-manager";

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">إدارة الخدمات</h1>
        <p className="text-muted-foreground">أضف، عدّل أو احذف الخدمات المعروضة</p>
      </div>
      <ServicesManager initialServices={services} />
    </div>
  );
}
