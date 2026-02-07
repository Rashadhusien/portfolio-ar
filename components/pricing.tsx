"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { createScrollReveal } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { pricing as pricingData } from "@/lib/data";

export function Pricing() {
  const container = useRef<HTMLElement>(null);
  const { title, packages, note } = pricingData;

  useGSAP(
    () => {
      createScrollReveal(".pricing-card", container);
    },
    { scope: container },
  );

  return (
    <section id="pricing" ref={container} className="py-20 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            {title}
          </h2>
          <div className="w-12 h-1 bg-accent rounded-full"></div>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`pricing-card rounded-xl overflow-hidden transition-all duration-300 ${
                pkg.highlighted
                  ? "md:scale-105 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-accent shadow-lg"
                  : "bg-background border border-border hover:border-accent"
              }`}
            >
              <div className="p-8">
                {pkg.highlighted && (
                  <div className="mb-4 absolute top-5 left-5 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                    الأكثر شهرة
                  </div>
                )}

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {pkg.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {pkg.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {pkg.price}
                    </span>
                    <span className="text-muted-foreground">جنية</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href="#contact" className="block mb-8">
                  <Button
                    className="w-full"
                    variant={pkg.highlighted ? "default" : "outline"}
                  >
                    اطلب الخدمة
                  </Button>
                </Link>

                {/* Features list */}
                <ul className="space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Note section */}
        {note && (
          <div className="p-6 bg-secondary/10 rounded-lg border border-secondary/20">
            <p className="text-center text-muted-foreground">
              <span className="font-semibold text-foreground">ملاحظة: </span>
              {note}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
