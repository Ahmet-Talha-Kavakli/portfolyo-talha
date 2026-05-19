"use client";

import {
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import styles from "./fx.module.css";

type Props = {
  children: ReactNode;
  /** Sarmalayıcı etiket (varsayılan div). */
  as?: ElementType;
  /** Stagger için gecikme (sn). */
  delay?: number;
  className?: string;
};

/**
 * Scroll'da aşağıdan yumuşak beliriş. IntersectionObserver tabanlı
 * (ScrollTrigger DEĞİL → pinli film ile çakışmaz, deterministik).
 * İçerik HER ZAMAN DOM'da (SSR/erişilebilirlik) — yalnız görünürlük
 * sınıfı değişir. reduced-motion: CSS iskelete indirir.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      el.classList.add(styles.in);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add(styles.in);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${className ?? ""}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
