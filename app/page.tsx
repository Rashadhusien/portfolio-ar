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
import { isSafeImageSrc, isSafeLink, isSafeMediaSrc } from "@/lib/validation/url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const [siteSettings, hero, about, services, works, pricing, contact, social] =
    await Promise.all([
      getSiteSettings(),
      getHeroContent(),
      getAboutContent(),
      getServices(),
      getPreviousWorks(),
      getPricingPackages(),
      getContactInfo(),
      getSocialLinks(),
    ]);

  // Defence in depth: drop rows saved before URL validation existed that
  // next/image can't render (would crash the page) or that carry unsafe links.
  const safeSocial = social.filter(
    (s) => isSafeLink(s.url) && isSafeImageSrc(s.iconUrl),
  );
  const safeWorks = works.filter(
    (w) => isSafeMediaSrc(w.videoUrl) && isSafeLink(w.externalSourceUrl),
  );
  const safeHref = (href: string) => (isSafeLink(href) ? href : "#");

  // Map DB -> UI shapes with fallback to hardcoded if DB empty (allows build even without DB connection)
  const heroProps = hero
    ? {
        title: hero.title,
        subtitle: hero.subtitle,
        ctaButtons: [
          {
            text: hero.ctaButtonText1,
            href: safeHref(hero.ctaButtonLink1),
            variant: hero.ctaButtonVariant1 as any,
          },
          {
            text: hero.ctaButtonText2,
            href: safeHref(hero.ctaButtonLink2),
            variant: hero.ctaButtonVariant2 as any,
          },
        ],
        profileImage: {
          url: isSafeImageSrc(hero.profileImageUrl) ? hero.profileImageUrl : "",
          alt: hero.profileImageAlt,
        },
        socialLinks:
          safeSocial.map((s: any) => ({
            platform: s.platform,
            url: s.url,
            icon: s.iconUrl,
          })) ?? undefined,
      }
    : undefined;

  const aboutProps = about?.content
    ? {
        title: about.content.title,
        content: about.content.content,
        features: about.features?.map((f: any) => f.feature) ?? [],
        stats:
          about.stats?.map((s: any) => ({
            title: s.title,
            description: { followers: s.followers },
          })) ?? [],
      }
    : undefined;

  const servicesProps = services?.length
    ? {
        title: "الخدمات",
        items: services.map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          icon: s.icon,
        })),
      }
    : undefined;

  const portfolioProps = safeWorks.length
    ? {
        title: "أعمالي السابقة",
        items: safeWorks.map((w: any) => ({
          id: w.id,
          title: w.title,
          video: { url: w.videoUrl, alt: w.videoAlt },
          link: w.externalSourceUrl,
        })),
      }
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

  const contactProps =
    contact || safeSocial.length
      ? {
          email: contact?.email,
          whatsapp: contact?.whatsappNumber,
          socialLinks:
            safeSocial.map((s: any) => ({
              platform: s.platform,
              url: s.url,
              icon: s.iconUrl,
            })) ?? undefined,
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
      <Footer
        brandName={siteSettings?.brandName}
        description={siteSettings?.metaDescription}
        contact={contact ?? undefined}
        socialLinks={safeSocial.length ? safeSocial : undefined}
      />
    </main>
  );
}
