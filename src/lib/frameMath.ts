import type { Marker } from "@/lib/markers";

const clamp = (n: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, n));

/**
 * İlerleme oranını [0..1] kare indeksine çevirir.
 * total <= 1 ise tek kare vardır → her zaman 0.
 */
export function progressToFrame(progress: number, total: number): number {
  if (!Number.isFinite(total) || total <= 1) return 0;
  const p = clamp(progress, 0, 1);
  return clamp(Math.round(p * (total - 1)), 0, total - 1);
}

/**
 * Verilen ilerlemede aktif sahnenin adını döner = `at <= progress`
 * olan SON marker. Hiçbiri geçilmediyse ilk marker'a kelepçelenir.
 * markers'ın `at`'e göre artan sıralı olduğu varsayılır.
 */
export function markerAt(progress: number, markers: Marker[]): string {
  let active = markers[0]?.name ?? "";
  for (const m of markers) {
    if (m.at <= progress) active = m.name;
  }
  return active;
}

/**
 * Buffering kararı (spec §10.3): hedef kare decode edilmediyse, çizilecek
 * en yakın hazır kareyi (<= hedef, lastDrawn'dan aşağı tarayarak) ve
 * buffering durumunu döner. Hiç hazır kare yoksa drawIndex = -1.
 */
export function pickFrame(
  target: number,
  decoded: boolean[],
  lastDrawn: number,
): { drawIndex: number; buffering: boolean } {
  if (decoded[target]) return { drawIndex: target, buffering: false };
  let j = Math.min(target, lastDrawn);
  while (j > 0 && !decoded[j]) j--;
  if (j >= 0 && decoded[j]) return { drawIndex: j, buffering: true };
  return { drawIndex: -1, buffering: true };
}
