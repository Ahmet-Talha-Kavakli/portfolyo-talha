"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@content";
import styles from "@/app/home.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Kısa kimlik — kelimeler scroll'la tek tek belirir (ritimle anlatır). */
export default function IdentityLines() {
  const ref = useRef<HTMLDivElement | null>(null);
  const words = site.identity.join(" ").split(" ");

  useGSAP(
    () => {
      const spans = ref.current?.querySelectorAll("span");
      if (!spans || !spans.length) return;
      gsap.fromTo(
        spans,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 78%",
            end: "bottom 55%",
            scrub: true,
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <section className={styles.identity}>
      <p ref={ref} className={styles.identityInner}>
        {words.map((w, i) => (
          <span key={i}>{w} </span>
        ))}
      </p>
    </section>
  );
}
