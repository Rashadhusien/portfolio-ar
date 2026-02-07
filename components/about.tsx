"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createScrollReveal } from "@/lib/gsap";
import { about } from "@/lib/data";

export function About() {
  const container = useRef<HTMLElement>(null);
  const { title, content, highlights, features, stats } = about;

  useGSAP(
    () => {
      createScrollReveal(".about-card", container);
      createScrollReveal(".highlight-item", container);
    },
    { scope: container },
  );

  return (
    <section id="about" ref={container} className="py-20 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            {title}
          </h2>
          <div className="w-12 h-1 bg-accent rounded-full"></div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Content text */}
          <div className="lg:col-span-2 about-card">
            <p className="text-lg text-foreground leading-relaxed mb-6">
              {content}
            </p>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">
                ما الذي أقدمه:
              </h3>
              <ul className="space-y-3">
                {features.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0"></span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stats card */}
          <div className="about-card bg-gradient-to-br from-primary/10 to-secondary/10 p-8 rounded-xl border border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              الإحصائيات
            </h3>
            <div className="space-y-6">
              {highlights.map((highlight) => (
                <div key={highlight.title} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-accent mb-2">
                    {highlight.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {highlight.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* About grid items */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((item) => (
            <div
              key={item.title}
              className={`highlight-item p-6 bg-background rounded-lg border border-border hover:border-accent/50 transition-colors ${item.title === "بينتيرست" ? "col-span-2" : ""}`}
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <div className="text-muted-foreground">
                <span className="text-3xl text-accent font-bold">
                  {item.description.followers}
                </span>
                <span className="text-sm text-muted-foreground"> متابعين</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
