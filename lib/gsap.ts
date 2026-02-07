import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const animateOnScroll = (
  element: HTMLElement,
  options?: gsap.TweenVars,
) => {
  if (!element) return;
  gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      start: "top center+=100",
      end: "center center",
      markers: false,
    },
    ...options,
  });
};

export const createHeroAnimation = (scope: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    const tl = gsap.timeline();

    tl.from(
      ".hero-title",
      {
        opacity: 0,
        y: 30,
        duration: 0.8,
      },
      0,
    );

    tl.from(
      ".hero-subtitle",
      {
        opacity: 0,
        y: 20,
        duration: 0.8,
      },
      0.2,
    );

    tl.from(
      ".hero-button",
      {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
      },
      0.4,
    );
  }, scope);

  return ctx;
};

export const createScrollReveal = (
  selector: string | HTMLElement,
  scope?: React.RefObject<HTMLElement>,
) => {
  const ctx = gsap.context(() => {
    const elements =
      typeof selector === "string"
        ? document.querySelectorAll(selector)
        : [selector];

    // Convert NodeList to Array to avoid issues
    const els = Array.from(elements);

    els.forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 85%", // Adjusted to be more visible sooner
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power2.out",
      });
    });
  }, scope); // Optional scope

  return ctx;
};
