"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import styles from "./fx.module.css";

type Props = {
  children: ReactNode;
  /** İmlece yaslanma oranı (0..1). */
  strength?: number;
  /** Maksimum kayma (px) — taşmayı sınırlar. */
  max?: number;
  className?: string;
};

/**
 * İmlece hafif yaslanan etkileşim (CTA/link). Dokunmatik / kaba
 * işaretçi / reduced-motion'da DEVRE DIŞI (sadece ince fare cilası).
 * Tek çocuğu sarar, layout'u bozmaz (inline-flex).
 */
export default function Magnetic({
  children,
  strength = 0.3,
  max = 14,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    const xTo = gsap.quickTo(el, "x", {
      duration: 0.5,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(el, "y", {
      duration: 0.5,
      ease: "power3.out",
    });
    const clamp = (v: number) => Math.max(-max, Math.min(max, v));

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo(clamp((e.clientX - (r.left + r.width / 2)) * strength));
      yTo(clamp((e.clientY - (r.top + r.height / 2)) * strength));
    };
    const reset = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
      gsap.killTweensOf(el);
    };
  }, [strength, max]);

  return (
    <span ref={ref} className={`${styles.magnetic} ${className ?? ""}`}>
      {children}
    </span>
  );
}
