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

/** About filmi — beyaza yakın başlar → kısa yüz → sabit portre (spec §6). */
export const ABOUT_MARKERS: Marker[] = [
  { name: "open", at: 0 }, // beyaza yakın açılış
  { name: "face", at: 0.45 }, // kısa yüz karesi
  { name: "rest", at: 0.8 }, // sabit aydınlık portre ("insana iniş")
];

/** Contact filmi — iplik ortaya gelir → yanıp sönen imleç; karanlık kalır. */
export const CONTACT_MARKERS: Marker[] = [
  { name: "line", at: 0 }, // iplik ortaya gelir
  { name: "cursor", at: 0.65 }, // yanıp sönen imleç — "hat açık"
];

/**
 * Home filmi — 6 sahne. Oranlar kullanıcının TEK videosunun hikâyesine
 * hizalandı (10sn: silüet → beyin/nöron → nöron ağı → kablo örgüsü →
 * zoom out → MacBook + ışık patlaması).
 */
export const HOME_MARKERS: Marker[] = [
  { name: "face", at: 0 }, // karanlıkta yüzsüz silüet — scroll to begin
  { name: "brain", at: 0.12 }, // kafaya zoom, beyin nöronları — THINK
  { name: "cable", at: 0.58 }, // nöronlar kabloya örülüyor — BUILD
  { name: "machine", at: 0.82 }, // zoom out → MacBook — SHIP
  { name: "white", at: 0.92 }, // ekran ışıkla açılıyor — isim + kimlik
  { name: "land", at: 0.98 }, // doruk parlaklık — keep scrolling
];
