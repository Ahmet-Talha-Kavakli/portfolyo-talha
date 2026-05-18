"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { progressToFrame, markerAt, pickFrame } from "@/lib/frameMath";
import type { Marker } from "@/lib/markers";
import { useLenis } from "@/components/LenisProvider";
import SignalThread from "@/components/SignalThread";
import styles from "./ScrollFilm.module.css";

gsap.registerPlugin(ScrollTrigger);

type Manifest = {
  count: number;
  ext: string;
  pattern: string; // "frame-%04d"
  width: number;
  height: number;
};

export type FilmState = {
  progress: number;
  frameIndex: number;
  marker: string;
  buffering: boolean;
  ready: boolean;
};

// Film state Context ile sunulur (render-prop DEĞİL): Server Component
// olan sayfa, fonksiyon geçmeden serileştirilebilir JSX children verebilir;
// client overlay'ler (SceneText) useFilmState() ile okur.
const FilmStateContext = createContext<FilmState | null>(null);

export function useFilmState(): FilmState {
  const s = useContext(FilmStateContext);
  if (!s) throw new Error("useFilmState must be used within <ScrollFilm>");
  return s;
}

type Props = {
  /** public/ altındaki kare klasörü, örn. "/frames/home". */
  framesDir: string;
  markers: Marker[];
  /** Overlay JSX (SceneText vb.) — useFilmState() ile state okur. */
  children?: ReactNode;
  /** Kare başına scroll mesafesi (px). Daha büyük = daha yavaş film. */
  scrollPerFrame?: number;
  className?: string;
};

function frameUrl(dir: string, m: Manifest, i: number): string {
  const pad = m.pattern.match(/%0(\d+)d/);
  const width = pad ? parseInt(pad[1], 10) : 4;
  const n = String(i + 1).padStart(width, "0");
  return `${dir}/${m.pattern.replace(/%0\d+d/, n)}.${m.ext}`;
}

export default function ScrollFilm({
  framesDir,
  markers,
  children,
  scrollPerFrame = 14,
  className,
}: Props) {
  const wrapRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const imgsRef = useRef<HTMLImageElement[]>([]);
  const decodedRef = useRef<boolean[]>([]);
  const manifestRef = useRef<Manifest | null>(null);
  const lastDrawnRef = useRef<number>(-1);
  const targetRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const readyFiredRef = useRef<boolean>(false);

  const { stop, start } = useLenis();

  const [ready, setReady] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [state, setState] = useState<FilmState>({
    progress: 0,
    frameIndex: 0,
    marker: markers[0]?.name ?? "",
    buffering: false,
    ready: false,
  });

  /** Kareyi canvas'a "cover" ölçekle çizer (DPR'a duyarlı). */
  const paint = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !img.complete || img.naturalWidth === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = Math.max(
      canvas.width / img.naturalWidth,
      canvas.height / img.naturalHeight,
    );
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      (canvas.width - dw) / 2,
      (canvas.height - dh) / 2,
      dw,
      dh,
    );
  }, []);

  /** Hedef kareyi çiz; decode olmadıysa son çizileni tut + buffering. */
  const render = useCallback(
    (progress: number) => {
      const m = manifestRef.current;
      if (!m) return;
      const idx = progressToFrame(progress, m.count);
      targetRef.current = idx;
      progressRef.current = progress;

      // Buffering kararı saf + test edilmiş pickFrame'de (DRY, spec §10.3).
      const { drawIndex, buffering } = pickFrame(
        idx,
        decodedRef.current,
        lastDrawnRef.current,
      );
      if (drawIndex >= 0) {
        paint(imgsRef.current[drawIndex]);
        lastDrawnRef.current = drawIndex;
      }

      setState({
        progress,
        frameIndex: idx,
        marker: markerAt(progress, markers),
        buffering,
        ready: true,
      });
    },
    [markers, paint],
  );

  // Manifest + preload.
  useEffect(() => {
    let alive = true;
    stop(); // yükleme bitene kadar scroll kilitli (spec §10.3).

    (async () => {
      const res = await fetch(`${framesDir}/manifest.json`, {
        cache: "force-cache",
      });
      const m: Manifest = await res.json();
      if (!alive) return;
      manifestRef.current = m;
      decodedRef.current = new Array(m.count).fill(false);
      imgsRef.current = new Array(m.count);

      const firstN = Math.min(30, m.count);
      const half = Math.ceil(m.count / 2);
      let decodedCount = 0;

      const checkReady = () => {
        let firstOk = true;
        for (let i = 0; i < firstN; i++)
          if (!decodedRef.current[i]) {
            firstOk = false;
            break;
          }
        setLoadPct(Math.round((decodedCount / m.count) * 100));
        if (firstOk && decodedCount >= half && alive && !readyFiredRef.current) {
          readyFiredRef.current = true;
          setReady(true);
        }
      };

      for (let i = 0; i < m.count; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = frameUrl(framesDir, m, i);
        img.onload = () => {
          decodedRef.current[i] = true;
          decodedCount++;
          // Buffering'i bekleyen kare bu ise hemen çiz (güncel progress ref).
          if (targetRef.current === i) render(progressRef.current);
          checkReady();
        };
        img.onerror = () => {
          decodedCount++; // ilerlemeyi tıkamasın
          checkReady();
        };
        imgsRef.current[i] = img;
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framesDir]);

  // Hazır olunca scroll kilidini aç + ilk kareyi çiz.
  useEffect(() => {
    if (!ready) return;
    start();
    render(0);
  }, [ready, start, render]);

  // ScrollTrigger pin + scrub (yalnız hazır olunca).
  useGSAP(
    () => {
      if (!ready || !manifestRef.current || !pinRef.current) return;
      const dist = manifestRef.current.count * scrollPerFrame;
      // gsap.context (useGSAP) bu ScrollTrigger'ı kaydeder; dep değişimi/
      // unmount'ta context.revert() otomatik kill eder — manuel cleanup yok.
      ScrollTrigger.create({
        trigger: pinRef.current,
        start: "top top",
        end: `+=${dist}`,
        pin: pinRef.current,
        pinSpacing: true,
        scrub: true,
        onUpdate: (self) => render(self.progress),
      });
    },
    { dependencies: [ready, scrollPerFrame], scope: wrapRef },
  );

  // Resize → canvas backing store + son kareyi yeniden çiz.
  useEffect(() => {
    const onResize = () => {
      const i = lastDrawnRef.current;
      if (i >= 0 && decodedRef.current[i]) paint(imgsRef.current[i]);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [paint]);

  return (
    <section
      ref={wrapRef}
      className={`${styles.wrap} ${className ?? ""}`}
      aria-label="Intro film"
    >
      <div ref={pinRef} className={styles.pin}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

        <div className={styles.overlay}>
          <FilmStateContext.Provider value={state}>
            {children}
          </FilmStateContext.Provider>
        </div>

        <SignalThread
          className={styles.thread}
          progress={state.progress}
          state={state.buffering ? "buffering" : "draw"}
          tone={state.progress}
        />

        <div
          className={`${styles.loading} ${ready ? styles.loadingGone : ""}`}
          aria-hidden={ready}
        >
          <div className={styles.dot} />
          <div className={styles.bar}>
            <div
              className={styles.barFill}
              style={{ width: `${loadPct}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
