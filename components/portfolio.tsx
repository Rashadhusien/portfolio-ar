"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowUpLeft, Pause, Play } from "lucide-react";
import { revealFrames } from "@/lib/gsap";
import { portfolio as fallbackPortfolio, TIKTOK } from "@/lib/data";

type Work = { id: string; title: string; video: { url: string; alt: string }; link: string };

function videoType(url: string) {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  return "video/mp4";
}

/**
 * A vertical video that plays only while it is mostly on screen, never
 * downloads more than metadata until then, and always offers a pause
 * control. With reduced motion it never autoplays.
 */
function WorkVideo({ work }: { work: Work }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const userPausedRef = useRef(false);
  userPausedRef.current = userPaused;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPausedRef.current) {
          video.play().catch(() => {});
        } else if (!entry.isIntersecting) {
          video.pause();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      video.play().catch(() => {});
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  return (
    <div data-frame className="relative aspect-[9/16] overflow-hidden rounded-[14px] bg-night-surface">
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={work.video.alt || work.title}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="h-full w-full object-cover"
      >
        {/* #t=0.1 makes browsers paint the first frame as a poster without autoplaying */}
        <source src={`${work.video.url}#t=0.1`} type={videoType(work.video.url)} />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `إيقاف ${work.title}` : `تشغيل ${work.title}`}
        className="absolute bottom-3 start-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-night/70 text-night-ink transition-colors duration-200 hover:bg-night/90"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function Portfolio({ data }: { data?: { title: string; items: Work[] } }) {
  const container = useRef<HTMLElement>(null);
  const { title, items } = data ?? fallbackPortfolio;

  useGSAP(() => {
    revealFrames(container, "[data-frame]");
  }, { scope: container });

  return (
    <section id="portfolio" ref={container} className="section-space bg-night text-night-ink">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="type-h2">{title}</h2>
          <a
            href={TIKTOK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-night-muted underline decoration-1 underline-offset-[0.3em] transition-colors duration-200 hover:text-night-ink"
          >
            كل المراجعات على تيك توك
            <ArrowUpLeft aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>

        <ul className="-mx-4 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-8 sm:overflow-visible sm:px-0">
          {items.map((item) => (
            <li key={item.id} className="w-[72%] shrink-0 snap-start sm:w-auto">
              <WorkVideo work={item} />
              <h3 className="mt-5 text-lg font-semibold leading-relaxed">{item.title}</h3>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] text-night-muted underline decoration-1 underline-offset-[0.3em] transition-colors duration-200 hover:text-night-ink"
                >
                  شاهد المراجعة كاملة
                  <ArrowUpLeft aria-hidden="true" className="h-4 w-4" />
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
