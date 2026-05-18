"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@content";
import styles from "@/app/about/about.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Yetenek hattı — her çizgi scroll'la dolar (yüzde değil ritim: stagger). */
export default function SkillLines() {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const fills = ref.current?.querySelectorAll<HTMLElement>(
        `.${styles.fill}`,
      );
      if (!fills || !fills.length) return;
      gsap.fromTo(
        fills,
        { width: "0%" },
        {
          width: "100%",
          ease: "none",
          stagger: 0.35,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            end: "bottom 45%",
            scrub: true,
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={styles.skills}>
      {site.skills.map((s) => (
        <div key={s} className={styles.skillRow}>
          <span className={styles.skillLabel}>{s}</span>
          <span className={styles.track}>
            <span className={styles.fill} />
          </span>
        </div>
      ))}
    </div>
  );
}
