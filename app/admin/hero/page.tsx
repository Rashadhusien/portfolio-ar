import { getHeroContent } from "@/lib/actions/hero.actions";
import { HeroForm } from "@/components/admin/hero/hero-form";

export default async function HeroPage() {
  const heroContent = await getHeroContent();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">القسم الرئيسي</h1>
        <p className="text-muted-foreground">إدارة محتوى القسم الرئيسي للموقع</p>
      </div>

      <HeroForm initialData={heroContent ?? {}} />
    </div>
  );
}