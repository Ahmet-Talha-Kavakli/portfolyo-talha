import { useId } from "react";
import styles from "./SignalThread.module.css";

export type SignalThreadState = "idle" | "draw" | "buffering";

type Props = {
  /** Çizilen oran [0..1]. 1 = tam çizili. */
  progress?: number;
  state?: SignalThreadState;
  /** Konum/boyut için dış sınıf. */
  className?: string;
  /** Renk geçişi konumu [0..1]: 0 = signal (mavi), 1 = thread (gri).
   *  Verilmezse progress kullanılır (iplik doğdukça dinginleşir). */
  tone?: number;
};

/**
 * Paylaşılan imza ipliği. Tüm sayfalar BU bileşeni kullanır
 * (spec §10.12 — divergent kopya yok). Saf SVG, bağımlılıksız.
 */
export default function SignalThread({
  progress = 1,
  state = "idle",
  className,
  tone,
}: Props) {
  const gid = useId();
  const p = Math.min(1, Math.max(0, progress));
  const t = Math.min(1, Math.max(0, tone ?? p));

  return (
    <svg
      className={`${styles.wrap} ${className ?? ""}`}
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          {/* tone 0 -> tam signal; tone 1 -> tam thread */}
          <stop offset="0%" stopColor="var(--signal)" />
          <stop
            offset="100%"
            stopColor="var(--signal)"
            stopOpacity={1 - t}
          />
          <stop offset="100%" stopColor="var(--thread)" />
        </linearGradient>
      </defs>
      <path
        className={[styles.path, styles[state]].filter(Boolean).join(" ")}
        d="M0 5 C 20 1, 32 9, 50 5 S 80 1, 100 5"
        pathLength={1}
        stroke={`url(#${gid})`}
        strokeDashoffset={1 - p}
      />
    </svg>
  );
}
