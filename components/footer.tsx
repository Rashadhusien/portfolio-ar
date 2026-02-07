import Link from "next/link";
import { Mail, MessageCircle, Heart } from "lucide-react";
import { siteSettings } from "@/lib/data";
import Image from "next/image";

export function Footer() {
  const { socialLinks, description } = siteSettings;

  return (
    <footer className="bg-card border-t border-border/50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              شكراً جزيلاً
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              الروابط السريعة
            </h3>
            <ul className="space-y-2">
              {["الرئيسية", "الخدمات", "الأسعار", "التواصل"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-accent transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              التواصل
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:info@booktoker.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                info@booktoker.com
              </a>
              <a
                href="https://wa.me/201150153088"
                className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                واتساب
              </a>
            </div>
          </div>
        </div>

        {/* Social media */}
        <div className="flex justify-center gap-6 mb-8 pb-8 border-b border-border/50">
          {socialLinks.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              className="w-10 h-10 rounded-full bg-primary/10 hover:bg-accent/20 flex items-center justify-center transition-colors text-lg"
              aria-label={social.platform}
            >
              <Image
                src={social.icon}
                alt={social.platform}
                width={24}
                height={24}
                className=" mx-auto rounded-2xl shadow-2xl w-[24px] h-[24px]"
                priority
              />
            </a>
          ))}
        </div>

        {/* Bottom footer */}
        <div className="flex flex-col md:flex-row items-center justify-center text-xs text-muted-foreground">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} </p>
        </div>
      </div>
    </footer>
  );
}
