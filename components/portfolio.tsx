"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { createScrollReveal } from "@/lib/gsap";
import { ExternalLink } from "lucide-react";
import { portfolio as portfolioData, TIKTOK } from "@/lib/data";

export function Portfolio() {
  const container = useRef<HTMLElement>(null);
  const { title, items } = portfolioData;

  useGSAP(
    () => {
      createScrollReveal(".portfolio-item", container);
    },
    { scope: container },
  );

  return (
    <section ref={container} className="py-20 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            {title}
          </h2>
          <div className="w-12 h-1 bg-accent rounded-full"></div>
        </div>

        {/* Portfolio grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.link || "#"}
              className="portfolio-item group rounded-lg overflow-hidden bg-background border border-border hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative w-full h-[600px] overflow-hidden">
                <video
                  autoPlay
                  muted
                  loop
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                >
                  <source src={item.video.url} type="video/mp4" />
                </video>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View more note */}
        <div className="mt-12 text-center p-6 bg-secondary/10 rounded-lg">
          <p className="text-muted-foreground">
            اطلعي على{" "}
            <a
              href={TIKTOK}
              className="text-accent hover:underline font-semibold"
            >
              جميع أعمالي
            </a>{" "}
            على وسائل التواصل الاجتماعي
          </p>
        </div>
      </div>
    </section>
  );
}
