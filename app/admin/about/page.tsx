import { getAboutContent, getAboutFeatures, getAboutStats } from "@/lib/actions/about.actions";
import { AboutManager } from "@/components/admin/about/about-manager";

export default async function AboutPage() {
  const [content, features, stats] = await Promise.all([
    getAboutContent(),
    getAboutFeatures(),
    getAboutStats(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">إدارة قسم عني</h1>
        <p className="text-muted-foreground">المحتوى، المميزات والإحصائيات</p>
      </div>
      <AboutManager initialContent={content} initialFeatures={features} initialStats={stats} />
    </div>
  );
}
