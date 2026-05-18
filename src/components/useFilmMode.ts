"use client";

import { useEffect, useState } from "react";

export type FilmMode = "scrub" | "autoplay" | "static";

/**
 * Film yolu seçimi (spec §10.1 / §10.4):
 *  - prefers-reduced-motion: reduce  -> "static" (film atlanır)
 *  - dokunmatik / dar viewport        -> "autoplay" (bir kez oynar)
 *  - aksi (işaretçili, geniş ekran)   -> "scrub"
 *
 * SSR/hydration uyumu: çözülene kadar `null` döner; ScrollFilm bu sürede
 * nötr (karanlık) ekranı gösterir, mismatch olmaz.
 */
export function useFilmMode(): FilmMode | null {
  const [mode, setMode] = useState<FilmMode | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    const resolve = () => {
      if (reduce.matches) return setMode("static");
      if (coarse.matches || window.innerWidth < 768)
        return setMode("autoplay");
      setMode("scrub");
    };

    resolve();
    reduce.addEventListener("change", resolve);
    coarse.addEventListener("change", resolve);
    window.addEventListener("resize", resolve);
    return () => {
      reduce.removeEventListener("change", resolve);
      coarse.removeEventListener("change", resolve);
      window.removeEventListener("resize", resolve);
    };
  }, []);

  return mode;
}
