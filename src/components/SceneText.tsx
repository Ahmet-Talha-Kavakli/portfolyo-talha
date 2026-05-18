"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useFilmState } from "@/components/ScrollFilm";
import styles from "./SceneText.module.css";

type Props = {
  /** Hangi marker/sahnede görünür (markers[].name ile eşleşir). */
  name: string;
  children: ReactNode;
  /** Konum/tipografi override (Faz 2 sahneye özel yerleşim verir). */
  className?: string;
};

/**
 * Aktif marker'a senkron DOM overlay metin. Canvas'a gömülü DEĞİL
 * (spec §10.5) — gerçek <div> içerik, SEO/erişilebilirlik için DOM'da.
 * Giriş/çıkış gsap autoAlpha + translate.
 */
export default function SceneText({ name, children, className }: Props) {
  const { marker } = useFilmState();
  const ref = useRef<HTMLDivElement | null>(null);
  const active = marker === name;

  useGSAP(
    () => {
      gsap.to(ref.current, {
        autoAlpha: active ? 1 : 0,
        y: active ? 0 : 28,
        duration: 0.7,
        ease: "power2.out",
      });
    },
    { dependencies: [active], scope: ref },
  );

  return (
    <div
      ref={ref}
      className={`${styles.scene} ${className ?? ""}`}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}
