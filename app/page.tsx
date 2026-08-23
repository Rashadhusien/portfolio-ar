import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Services } from "@/components/services";
import { Portfolio } from "@/components/portfolio";
import { Pricing } from "@/components/pricing";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import {
  getSiteSettings,
  getHeroContent,
  getAboutContent,
  getServices,
  getPreviousWorks,
  getPricingPackages,
  getContactInfo,
  getSocialLinks,
} from "@/lib/data-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const [siteSettings, hero, about, services, works, pricing, contact, social] = await Promise.all([
    getSiteSettings(),
    getHeroContent(),
    getAboutContent(),
    getServices(),
    getPreviousWorks(),
    getPricingPackages(),
    getContactInfo(),
    getSocialLinks(),
  ]);

  // Map DB -> UI shapes with fallback to hardcoded if DB empty (allows build even without DB connection)
  const heroProps = hero
    ? {
        title: hero.title,
        subtitle: hero.subtitle,
        ctaButtons: [
          { text: hero.ctaButtonText1, href: hero.ctaButtonLink1, variant: hero.ctaButtonVariant1 as any },
          { text: hero.ctaButtonText2, href: hero.ctaButtonLink2, variant: hero.ctaButtonVariant2 as any },
        ],
        profileImage: { url: hero.profileImageUrl, alt: hero.profileImageAlt },
        socialLinks: social?.map((s: any) => ({ platform: s.platform, url: s.url, icon: s.iconUrl })) ?? undefined,
      }
    : undefined;

  const aboutProps = about?.content
    ? {
        title: about.content.title,
        content: about.content.content,
        features: about.features?.map((f: any) => f.feature) ?? [],
        stats: about.stats?.map((s: any) => ({ title: s.title, description: { followers: s.followers } })) ?? [],
      }
    : undefined;

  const servicesProps = services?.length
    ? { title: "الخدمات", items: services.map((s: any) => ({ id: s.id, name: s.name, description: s.description, icon: s.icon })) }
    : undefined;

  const portfolioProps = works?.length
    ? { title: "أعمالي السابقة", items: works.map((w: any) => ({ id: w.id, title: w.title, video: { url: w.videoUrl, alt: w.videoAlt }, link: w.externalSourceUrl })) }
    : undefined;

  const pricingProps = pricing?.length
    ? {
        title: "الأسعار",
        note: "الأسعار قابلة للتفاوض حسب طبيعة التعاون والمتطلبات الخاصة",
        packages: pricing.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          features: p.features?.map((f: any) => f.feature) ?? [],
          highlighted: p.isPopular,
        })),
      }
    : undefined;

  const contactProps = contact || social
    ? {
        email: contact?.email,
        whatsapp: contact?.whatsappNumber,
        socialLinks: social?.map((s: any) => ({ platform: s.platform, url: s.url, icon: s.iconUrl })) ?? undefined,
      }
    : undefined;

  return (
    <main className="min-h-screen">
      <Header brandName={siteSettings?.brandName} />
      <Hero data={heroProps} />
      <About data={aboutProps} />
      <Services data={servicesProps} />
      <Portfolio data={portfolioProps} />
      <Pricing data={pricingProps} />
      <Contact data={contactProps} />
      <Footer brandName={siteSettings?.brandName} description={siteSettings?.metaDescription} contact={contact ?? undefined} socialLinks={social ?? undefined} />
    </main>
  );
}
