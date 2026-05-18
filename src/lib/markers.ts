/**
 * Sahne marker'ları — spec §10.5/§10.6: tetikler kare NUMARASINA değil
 * ilerleme ORANINA bağlı. fal.ai çıktısı yaklaşık olduğundan sahne
 * sınırları kayarsa yalnız bu oranlar ayarlanır.
 */
export type Marker = {
  /** Sahne adı (SceneText bu ada göre içerik gösterir). */
  name: string;
  /** Bu sahnenin başladığı ilerleme oranı [0..1]. Artan sırada. */
  at: number;
};

/** Projects filmi — kısa: iplik ızgaraya örülür → beyaza açılır (spec §6). */
export const PROJECTS_MARKERS: Marker[] = [
  { name: "weave", at: 0 }, // iplik tek, çoğalır, ızgaraya örülür
  { name: "built", at: 0.65 }, // beyaza açılır — "Built."
];

/** Home filmi — 6 sahne (spec §5). */
export const HOME_MARKERS: Marker[] = [
  { name: "face", at: 0 }, // S1 açılış: nokta → yüz
  { name: "brain", at: 0.15 }, // S2 beyne giriş — THINK
  { name: "cable", at: 0.33 }, // S3 sinyal → kablo — BUILD (iplik doğar)
  { name: "machine", at: 0.6 }, // S4 makineye varış — SHIP
  { name: "white", at: 0.8 }, // S5 sistem açıldı — isim + kimlik
  { name: "land", at: 0.96 }, // S6 yere iniş — keep scrolling
];
