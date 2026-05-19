"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/home.module.css";

const LINE = "Welcome — I build the whole product.";

/**
 * Home ilk sahne — daktilo karşılama. Karanlık silüet üstünde harf harf
 * yazılır, biter, altında küçük "scroll to begin" ipucu belirir.
 * prefers-reduced-motion: anında tam metin + ipucu (animasyon yok).
 * SceneText name="face" içinde yaşar → sayfa açılışında bir kez mount olur.
 */
export default function Typewriter() {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const t = timers.current;
    if (reduce) {
      t.push(
        setTimeout(() => {
          setText(LINE);
          setDone(true);
        }, 0),
      );
      return () => {
        t.forEach(clearTimeout);
        t.length = 0;
      };
    }
    // Sahne fade-in'i yakalamak için kısa açılış gecikmesi.
    let i = 0;
    const step = () => {
      i += 1;
      setText(LINE.slice(0, i));
      if (i < LINE.length) {
        // Boşluk/tire'de hafif duraklama → daha "insan" ritim.
        const ch = LINE[i - 1];
        const d = ch === " " ? 70 : ch === "—" ? 230 : 42;
        t.push(setTimeout(step, d));
      } else {
        t.push(setTimeout(() => setDone(true), 420));
      }
    };
    t.push(setTimeout(step, 360));
    return () => {
      t.forEach(clearTimeout);
      t.length = 0;
    };
  }, []);

  return (
    <div className={styles.intro}>
      <p className={styles.welcomeLine} aria-label={LINE}>
        <span aria-hidden="true">{text}</span>
        <span
          className={`${styles.caret} ${done ? styles.caretDone : ""}`}
          aria-hidden="true"
        />
      </p>
      <span
        className={`${styles.scrollHint} ${done ? styles.scrollHintIn : ""}`}
      >
        scroll to begin
      </span>
    </div>
  );
}
