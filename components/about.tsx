"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { fadeIn } from "@/lib/gsap";
import { about as fallbackAbout } from "@/lib/data";

type AboutData = {
  title: string;
  content: string;
  features: string[];
  stats: { title: string; description: { followers: string } }[];
};

export function About({ data }: { data?: AboutData }) {
  const container = useRef<HTMLElement>(null);
  const title = data?.title ?? fallbackAbout.title;
  const content = (data?.content ?? fallbackAbout.content).trim();
  const features = data?.features ?? fallbackAbout.features;
  const stats = data?.stats ?? fallbackAbout.stats;

  useGSAP(() => {
    fadeIn(container, "[data-fade]");
  }, { scope: container });

  return (
    <section id="about" ref={container} className="section-space">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
        <h2 className="type-h2 lg:col-span-4">{title}</h2>

        <div className="lg:col-span-8" data-fade>
          <p className="type-body measure whitespace-pre-line text-foreground">
            {content}
          </p>

          {features.length > 0 && (
            <div className="mt-14">
              <h3 className="type-h3">ما الذي أقدمه</h3>
              <ul className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {features.map((item) => (
                  <li key={item} className="type-body flex gap-4">
                    <span
                      aria-hidden="true"
                      className="mt-[0.95em] h-px w-5 shrink-0 bg-primary"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {stats.length > 0 && (
            <div className="mt-16 rounded-[14px] bg-card px-6 py-8 sm:px-10">
              <h3 className="type-small text-muted-foreground">
                جمهوري على المنصات
              </h3>
              <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.title}>
                    <dt className="type-small text-muted-foreground">{item.title}</dt>
                    <dd className="mt-1 font-display text-[2rem] font-bold leading-tight text-foreground">
                      <bdi>{item.description.followers}</bdi>
                      <span className="ms-2 font-sans text-base font-normal text-muted-foreground">
                        متابع
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
