import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
 * Motion system.
 *
 * - One signature moment: the hero picture "opens" and the headline rises
 *   out of a mask. Other sections get different, quieter treatments (or
 *   none) instead of one identical fade-up everywhere.
 * - Everything runs once. Content is never re-hidden on scroll, and it is
 *   fully visible without JS (states are only set from script).
 * - prefers-reduced-motion: no travel, clip or scale — the page is simply
 *   shown (the hero is not pre-hidden in CSS for these users either).
 *
 * Easing: expo.out ≈ cubic-bezier(0.16, 1, 0.3, 1); power4.out ≈
 * cubic-bezier(0.22, 1, 0.36, 1) — the --ease-expo / --ease-out tokens.
 */

const MOTION_OK = "(prefers-reduced-motion: no-preference)";
const REVEAL_START = "top 88%";

type Scope = React.RefObject<HTMLElement | null>;

function within(scope: Scope, selector: string) {
  return scope.current
    ? Array.from(scope.current.querySelectorAll<HTMLElement>(selector))
    : [];
}

/** Signature hero intro. Targets elements marked with data-hero="…". */
export function heroIntro(scope: Scope) {
  const mm = gsap.matchMedia();
  mm.add(MOTION_OK, () => {
    const q = (name: string) => within(scope, `[data-hero="${name}"]`);
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    tl.fromTo(
      q("image"),
      { opacity: 1, clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, clearProps: "clipPath" },
      0,
    )
      .fromTo(
        within(scope, '[data-hero="image"] img'),
        { scale: 1.08 },
        { scale: 1, duration: 1.4 },
        0,
      )
      .fromTo(
        q("headline"),
        { opacity: 1, y: 28, clipPath: "inset(0% 0% 100% 0%)" },
        { y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, clearProps: "clipPath" },
        0.15,
      )
      .fromTo(
        [...q("sub"), ...q("actions"), ...q("social")],
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.09, ease: "power4.out" },
        0.45,
      );
  });
  return mm;
}

/** List items rise into place as a group, once, staggered ~70ms. */
export function revealList(
  scope: Scope,
  selector: string,
  { y = 20, stagger = 0.07 }: { y?: number; stagger?: number } = {},
) {
  const mm = gsap.matchMedia();
  mm.add(MOTION_OK, () => {
    const items = within(scope, selector);
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y });
    ScrollTrigger.batch(items, {
      start: REVEAL_START,
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger,
          ease: "power4.out",
          overwrite: true,
        }),
    });
  });
  return mm;
}

/** Pictures/videos open with a vertical wipe, once. */
export function revealFrames(scope: Scope, selector: string) {
  const mm = gsap.matchMedia();
  mm.add(MOTION_OK, () => {
    const frames = within(scope, selector);
    if (!frames.length) return;
    gsap.set(frames, { clipPath: "inset(100% 0% 0% 0%)" });
    ScrollTrigger.batch(frames, {
      start: REVEAL_START,
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          clipPath: "inset(0% 0% 0% 0%)",
          clearProps: "clipPath",
          duration: 1.1,
          stagger: 0.1,
          ease: "expo.out",
          overwrite: true,
        }),
    });
  });
  return mm;
}

/** Plain opacity fade for text blocks — no travel. */
export function fadeIn(scope: Scope, selector: string) {
  const mm = gsap.matchMedia();
  mm.add(MOTION_OK, () => {
    const els = within(scope, selector);
    if (!els.length) return;
    gsap.set(els, { opacity: 0 });
    ScrollTrigger.batch(els, {
      start: REVEAL_START,
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { opacity: 1, duration: 0.9, ease: "power2.out", overwrite: true }),
    });
  });
  return mm;
}
