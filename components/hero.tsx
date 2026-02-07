"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { createHeroAnimation } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { hero } from "@/lib/data";

export function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const { title, subtitle, ctaButtons, profileImage, socialLinks } = hero;

  useGSAP(
    () => {
      createHeroAnimation(container);
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="relative min-h-screen flex items-center justify-center py-20 px-4 overflow-hidden"
    >
      {/* Background gradient decoration */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="space-y-8 order-2 md:order-1">
          <div className="space-y-4">
            <h1 className="hero-title text-2xl md:text-4xl lg:text-6xl font-bold text-foreground text-balance leading-10">
              {title}
            </h1>
            <p className="hero-subtitle text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {ctaButtons.map((button) => (
              <Link key={button.href} href={button.href}>
                <Button
                  className="hero-button w-full sm:w-auto px-8 py-6 text-base font-semibold"
                  variant={button.variant || "default"}
                  size="lg"
                >
                  {button.text}
                </Button>
              </Link>
            ))}
          </div>

          {/* Social links preview */}
          <div className="pt-6 flex items-center gap-6">
            <span className="text-sm text-muted-foreground">تابعيني على:</span>
            <div className="flex gap-4">
              {socialLinks.map(({ icon, platform, url }) => (
                <a
                  key={icon}
                  href={url}
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors text-primary"
                  aria-label={platform}
                >
                  <Image
                    src={icon}
                    alt={platform}
                    width={24}
                    height={24}
                    className=" rounded-2xl shadow-2xl w-[24px] h-[24px]"
                    priority
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right image */}
        <div className="order-1 flex justify-center md:justify-end">
          <div className="relative w-full max-w-md h-96  md:max-h-[900px]">
            <Image
              src={profileImage.url || "/placeholder.svg"}
              alt={profileImage.alt}
              fill
              className="object-cover rounded-2xl shadow-2xl w-full h-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
