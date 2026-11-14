"use client";

import { useEffect, useRef } from "react";

/**
 * One large statement that rests at half ink and turns to ink word by word as
 * it crosses the middle of the screen; it runs back on the way up. Under
 * reduced motion every word is at full ink (CSS).
 */
export function WordHighlight({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-w]"));
    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the statement's top reaches 75% of the screen, 1 when its foot passes 40%.
      const start = vh * 0.75;
      const end = vh * 0.4;
      const p = Math.min(1, Math.max(0, (start - r.top) / Math.max(1, start - end + r.height * 0.6)));
      const lit = Math.round(p * spans.length);
      if (lit === last) return;
      last = lit;
      spans.forEach((s, i) => {
        if (i < lit) s.dataset.on = "";
        else delete s.dataset.on;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <h2 ref={ref} className={className} data-moment="word-highlight">
      {words.map((w, i) => (
        <span key={`${w}-${i}`} data-w className="wh-word">
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h2>
  );
}
