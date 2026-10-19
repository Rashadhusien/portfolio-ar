"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { heroIntro } from "@/lib/gsap";
import { hero as fallbackHero } from "@/lib/data";
import { cn } from "@/lib/utils";

type HeroData = {
  title: string;
  subtitle: string;
  ctaButtons: { text: string; href: string; variant?: string }[];
  profileImage: { url: string; alt: string };
  socialLinks?: { icon: string; platform: string; url: string }[];
};

export function Hero({ data }: { data?: HeroData }) {
  const container = useRef<HTMLElement>(null);
  const { title, subtitle, ctaButtons, profileImage, socialLinks } =
    data ?? fallbackHero;

  useGSAP(() => {
    heroIntro(container);
  }, { scope: container });

  return (
    <section
      id="home"
      ref={container}
      className="container-page grid items-center gap-12 pt-10 pb-16 md:py-16 lg:grid-cols-12 lg:gap-16 lg:py-20"
    >
      <div className="lg:col-span-7">
        <h1 data-hero="headline" className="type-display text-foreground">
          {title}
        </h1>
        <p data-hero="sub" className="type-body mt-6 max-w-[34rem] text-muted-foreground">
          {subtitle}
        </p>

        <div data-hero="actions" className="mt-10 flex flex-wrap items-center gap-3">
          {ctaButtons.map((button, i) => (
            <Link
              key={`${button.href}-${i}`}
              href={button.href}
              className={cn(
                "btn",
                (button.variant ?? (i === 0 ? "default" : "outline")) === "default"
                  ? "btn-primary"
                  : "btn-quiet",
              )}
            >
              {button.text}
            </Link>
          ))}
        </div>

        {socialLinks && socialLinks.length > 0 && (
          <div data-hero="social" className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="type-small text-muted-foreground">تابعني على</span>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {socialLinks.map(({ icon, platform, url }) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-medium text-foreground"
                  >
                    <Image
                      src={icon}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 rounded-[5px]"
                    />
                    <span className="underline decoration-transparent decoration-1 underline-offset-[0.3em] transition-[text-decoration-color] duration-200 group-hover:decoration-current">
                      {platform}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="lg:col-span-5">
        <div
          data-hero="image"
          className="relative mx-auto aspect-[4/5] w-full max-w-[22rem] sm:max-w-[26rem] overflow-hidden rounded-[14px] bg-card lg:max-w-none"
        >
          <Image
            src={profileImage.url || "/placeholder.svg"}
            alt={profileImage.alt}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 26rem, 22rem"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
