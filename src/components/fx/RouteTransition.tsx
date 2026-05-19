"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import styles from "./fx.module.css";

/**
 * Sayfalar arası sinematik perde. Her rota değişiminde karanlık katman
 * anında kapanır, sonra yumuşak açılır (her sayfa zaten karanlıkta
 * başladığından bütünlüklü). İlk yükleme atlanır (film girişi yapar).
 * pointer-events YOK → tıklamayı engellemez. reduced-motion: perde yok.
 */
export default function RouteTransition() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement | null>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.killTweensOf(el);
    gsap.set(el, { autoAlpha: 1 });
    gsap.to(el, {
      autoAlpha: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  }, [pathname]);

  return <div ref={ref} className={styles.routeOverlay} aria-hidden="true" />;
}
