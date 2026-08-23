import { getWorks } from "@/lib/actions/works.actions";
import { WorksManager } from "@/components/admin/works/works-manager";

export default async function WorksPage() {
  const works = await getWorks();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">أعمالي السابقة</h1>
        <p className="text-muted-foreground">إدارة معرض الفيديوهات (Cloudinary أو روابط محلية)</p>
      </div>
      <WorksManager initialWorks={works} />
    </div>
  );
}
