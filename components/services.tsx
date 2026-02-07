"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createScrollReveal } from "@/lib/gsap";
import { BookOpen, Sparkles, Camera, TrendingUp } from "lucide-react";
import { services as servicesData } from "@/lib/data";

const iconMap = {
  book: BookOpen,
  sparkles: Sparkles,
  camera: Camera,
  trending: TrendingUp,
};

export function Services() {
  const container = useRef<HTMLElement>(null);
  const { title, items } = servicesData;

  useGSAP(
    () => {
      createScrollReveal(".service-card", container);
    },
    { scope: container },
  );

  return (
    <section id="services" ref={container} className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            {title}
          </h2>
          <div className="w-12 h-1 bg-accent rounded-full"></div>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((service) => {
            const Icon = iconMap[service.icon];
            return (
              <div
                key={service.id}
                className="service-card group p-8 bg-background rounded-lg border border-border hover:border-accent hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-accent/20 group-hover:to-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground pt-2">
                    {service.name}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional services note */}
        <div className="mt-12 p-6 bg-secondary/10 rounded-lg border border-secondary/20">
          <p className="text-center text-muted-foreground">
            نقدم خدمات إضافية مخصصة تناسب احتياجات علامتك التجارية أو دار نشرك.
            تواصلي معي لمعرفة المزيد.
          </p>
        </div>
      </div>
    </section>
  );
}
