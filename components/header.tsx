"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/data";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export function Header({ brandName }: { brandName?: string }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const displayBrand = brandName || "Books With Arwa";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const links = session
    ? [{ label: "إدارة الموقع", href: "/admin" }, ...navLinks]
    : navLinks;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background transition-shadow duration-300",
        scrolled && "shadow-[0_1px_0_hsl(var(--border))]",
      )}
    >
      <div className="container-page flex h-16 md:h-20 items-center justify-between gap-6">
        <Link
          href="/"
          className="font-display text-2xl md:text-[1.75rem] font-bold leading-none text-foreground"
          onClick={() => setIsOpen(false)}
        >
          {displayBrand}
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative py-2 text-[0.9375rem] text-muted-foreground transition-colors duration-200 hover:text-foreground after:absolute after:bottom-0 after:start-0 after:h-px after:w-full after:origin-[right] after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="#contact" className="btn btn-primary hidden sm:inline-flex !min-h-[2.75rem] !px-5 !text-[0.9375rem]">
            اطلب تعاونًا
          </Link>
          <button
            type="button"
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-foreground/5"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="التنقل الرئيسي"
        className="lg:hidden"
        hidden={!isOpen}
      >
        <ul className="container-page pb-6">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex min-h-12 items-center text-lg text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-3 sm:hidden">
            <Link href="#contact" className="btn btn-primary w-full" onClick={() => setIsOpen(false)}>
              اطلب تعاونًا
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
