"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { revealList } from "@/lib/gsap";
import { BookOpen, Sparkles, Camera, TrendingUp } from "lucide-react";
import { services as fallbackServices } from "@/lib/data";

const iconMap = {
  book: BookOpen,
  sparkles: Sparkles,
  camera: Camera,
  trending: TrendingUp,
};

type ServicesData = {
  title: string;
  items: { id: string; name: string; description: string; icon: keyof typeof iconMap }[];
};

export function Services({ data }: { data?: ServicesData }) {
  const container = useRef<HTMLElement>(null);
  const { title, items } = data ?? fallbackServices;

  useGSAP(() => {
    revealList(container, "[data-service]");
  }, { scope: container });

  return (
    <section id="services" ref={container} className="section-space bg-card">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="type-h2">{title}</h2>
            <p className="type-body mt-5 text-muted-foreground">
              أقدّم أيضًا خدمات مخصصة تناسب احتياجات علامتك التجارية أو دار نشرك.{" "}
              <Link href="#contact" className="link">
                تواصلي معي
              </Link>{" "}
              لنتحدث عن فكرتك.
            </p>
          </div>
        </div>

        <ul className="lg:col-span-8 grid gap-x-12 gap-y-14 sm:grid-cols-2">
          {items.map((service) => {
            const Icon = iconMap[service.icon] ?? BookOpen;
            return (
              <li key={service.id} data-service>
                <h3 className="type-h3 flex items-center gap-3">
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} />
                  {service.name}
                </h3>
                <p className="type-body mt-3 text-muted-foreground">
                  {service.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
