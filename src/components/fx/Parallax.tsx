"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./fx.module.css";

type Props = {
  children: ReactNode;
  /** Maksimum kayma (px). Negatif = ters yön. */
  amount?: number;
  className?: string;
};

/**
 * Scroll'da hafif derinlik — görsel, viewport içindeki konumuna göre
 * dikey kayar. Robust desen (SkillLines gibi): window 'scroll' + rAF +
 * getBoundingClientRect; ScrollTrigger YOK (pinli film ile çakışmaz).
 * İç görsel hafif ölçeklenir → kenarda boşluk görünmez.
 * reduced-motion: hareket yok.
 */
export default function Parallax({
  children,
  amount = 26,
  className,
}: Props) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const w = wrap.current;
    const el = inner.current;
    if (!w || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = w.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      // Eleman merkezi viewport merkezine göre [-1..1].
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      el.style.transform = `translate3d(0, ${(-p * amount).toFixed(
        2,
      )}px, 0) scale(1.08)`;
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
  }, [amount]);

  return (
    <div ref={wrap} className={`${styles.pxWrap} ${className ?? ""}`}>
      <div ref={inner} className={styles.pxInner}>
        {children}
      </div>
    </div>
  );
}
