"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import { revealList } from "@/lib/gsap";
import { pricing as fallbackPricing } from "@/lib/data";
import { cn } from "@/lib/utils";

type PricingData = {
  title: string;
  note?: string;
  packages: {
    id: string;
    name: string;
    description: string;
    price: number;
    features: string[];
    highlighted: boolean;
  }[];
};

const priceFormat = new Intl.NumberFormat("en-US");

export function Pricing({ data }: { data?: PricingData }) {
  const container = useRef<HTMLElement>(null);
  const { title, packages, note } = data ?? fallbackPricing;

  useGSAP(() => {
    revealList(container, "[data-plan]", { y: 24, stagger: 0.09 });
  }, { scope: container });

  return (
    <section id="pricing" ref={container} className="section-space">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-16">
          <h2 className="type-h2 lg:col-span-4">{title}</h2>
          {note && (
            <p className="type-body measure text-muted-foreground lg:col-span-8 lg:pt-3">
              {note}
            </p>
          )}
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-3 md:gap-6">
          {packages.map((pkg) => (
            <li
              key={pkg.id}
              data-plan
              className={cn(
                "flex flex-col rounded-[14px] p-7 sm:p-8",
                pkg.highlighted
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="type-h3">{pkg.name}</h3>
                {pkg.highlighted && (
                  <span className="type-small text-primary-foreground/80">
                    الأكثر طلبًا
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "type-small mt-2",
                  pkg.highlighted ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                {pkg.description}
              </p>

              <p className="mt-8 flex items-baseline gap-2">
                <bdi className="font-display text-5xl font-bold leading-none">
                  {priceFormat.format(pkg.price)}
                </bdi>
                <span
                  className={pkg.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}
                >
                  جنيه
                </span>
              </p>

              <ul className="mt-8 grid gap-3">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed">
                    <Check
                      aria-hidden="true"
                      className={cn(
                        "mt-1 h-4 w-4 shrink-0",
                        pkg.highlighted ? "text-primary-foreground" : "text-primary",
                      )}
                      strokeWidth={2.25}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                <Link
                  href="#contact"
                  className={cn("btn w-full", pkg.highlighted ? "btn-inverse" : "btn-primary")}
                >
                  اطلب هذه الباقة
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
