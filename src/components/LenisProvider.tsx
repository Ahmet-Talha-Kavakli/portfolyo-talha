"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type LenisCtx = {
  /** Aktif Lenis örneği (Menu vb. scroll kilidi için). */
  lenisRef: React.RefObject<Lenis | null>;
  /** Scroll'u durdur/başlat (tam ekran menü açılınca kilitle). */
  stop: () => void;
  start: () => void;
};

const Ctx = createContext<LenisCtx | null>(null);

export function useLenis(): LenisCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLenis must be used within <LenisProvider>");
  return c;
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Lenis default: pencere scroll'unu yumuşatır (gerçek scrollTop'u günceller).
    // Bu yüzden ScrollTrigger.scrollerProxy GEREKMEZ (yalnız custom container'da
    // gerekir). normalizeScroll de KULLANILMAZ — bu kurulumla çakışır
    // (spec §10.7; debug sırasında geri eklenmemeli).
    const lenis = new Lenis();
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);
    window.addEventListener("orientationchange", refresh);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("orientationchange", refresh);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const stop = () => lenisRef.current?.stop();
  const start = () => lenisRef.current?.start();

  return (
    <Ctx.Provider value={{ lenisRef, stop, start }}>{children}</Ctx.Provider>
  );
}
