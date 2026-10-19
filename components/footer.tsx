import Link from "next/link";
import { navLinks, siteSettings as fallbackSettings } from "@/lib/data";

type FooterProps = {
  brandName?: string;
  description?: string;
  contact?: { email: string; whatsappNumber: string };
  socialLinks?: { platform: string; url: string; iconUrl: string }[];
};

function displayPhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  return digits.startsWith("+20") ? `0${digits.slice(3)}` : digits;
}

export function Footer({ brandName, description, contact, socialLinks: propLinks }: FooterProps) {
  const socialLinks = propLinks
    ? propLinks.map((s) => ({ platform: s.platform, url: s.url }))
    : fallbackSettings.socialLinks;
  const desc = description ?? fallbackSettings.description;
  const email = contact?.email || "berrydeniz0@gmail.com";
  const whatsapp = contact?.whatsappNumber || "+201150153088";
  const brand = brandName || "Books With Arwa";

  return (
    <footer className="bg-background">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-2xl font-bold">{brand}</p>
            <p className="type-small mt-4 max-w-[26rem] text-muted-foreground">{desc}</p>
          </div>

          <nav aria-label="روابط التذييل" className="md:col-span-3">
            <h2 className="type-small font-semibold">الأقسام</h2>
            <ul className="mt-4 grid gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-10 items-center text-[0.9375rem] text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="type-small font-semibold">التواصل</h2>
            <ul className="mt-4 grid gap-1 text-[0.9375rem]">
              <li>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex min-h-10 items-center text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  <bdi>{email}</bdi>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  واتساب&nbsp;<bdi dir="ltr">{displayPhone(whatsapp)}</bdi>
                </a>
              </li>
              {socialLinks.map((social) => (
                <li key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {social.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="type-small mt-16 text-muted-foreground">
          <bdi>{brand}</bdi> © {new Date().getFullYear()} — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
