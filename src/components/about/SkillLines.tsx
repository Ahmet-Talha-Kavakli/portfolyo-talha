"use client";

import { useEffect, useRef } from "react";
import { site } from "@content";
import styles from "@/app/about/about.module.css";

/**
 * Yetenek hattı — her çizgi scroll'la dolar (ritim: stagger).
 *
 * ScrollTrigger KULLANMAZ: About filmi async/pinli olduğundan global
 * ScrollTrigger konumları kırılgan. Bunun yerine bileşen KENDİ viewport
 * konumundan ilerleme hesaplar (Lenis native scroll'u sürer → 'scroll'
 * + rAF). Pin/refresh sırasına bağımsız, deterministik.
 */
export default function SkillLines() {
  const ref = useRef<HTMLDivElement | null>(null);
  const fillsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    fillsRef.current = Array.from(
      root.querySelectorAll<HTMLElement>(`.${styles.fill}`),
    );
    const n = fillsRef.current.length;
    if (!n) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;
      // Bölüm altından (top = %85 vh) yukarı (%30 vh) gelene dek 0→1.
      const startY = vh * 0.85;
      const endY = vh * 0.3;
      const p = (startY - r.top) / (startY - endY);
      const prog = Math.min(1, Math.max(0, p));
      // Stagger: her çizgi sıraya göre biraz gecikmeli dolar.
      const span = 0.45; // toplam pencerenin stagger payı
      for (let i = 0; i < n; i++) {
        const d = (i / Math.max(1, n - 1)) * span;
        const w =
          Math.min(1, Math.max(0, (prog - d) / (1 - span))) * 100;
        fillsRef.current[i].style.width = `${w}%`;
      }
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
  }, []);

  return (
    <div ref={ref} className={styles.skills}>
      {site.skills.map((s) => (
        <div key={s.label} className={styles.skillRow}>
          <div className={styles.skillHead}>
            <span className={styles.skillLabel}>{s.label}</span>
            <span className={styles.skillDetail}>{s.detail}</span>
          </div>
          <span className={styles.track}>
            <span className={styles.fill} />
          </span>
        </div>
      ))}
    </div>
  );
}
