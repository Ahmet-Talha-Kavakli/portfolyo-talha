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
  { name: "weave", at: 0 }, // karanlıkta mavi iplikler ızgaraya örülür
  { name: "built", at: 0.84 }, // ızgara tamamlanır, beyaza açılır — "Built."
];

/** About filmi — kullanıcı videosu: karanlık odada omuz-üstü bir yazılımcı,
 *  ekran kodla aydınlanır, eller klavyede; sonra sıcak ışık yükselir ve kare
 *  temiz aydınlığa açılır (sitenin dark→light imzası). "Talha" yalnız karanlık
 *  kodlama fazında görünür (beyaz metin orada okunur), sıcak bloom başlamadan
 *  kaybolur — sahne home'daki gibi metinsiz trailing marker'la sayfaya
 *  devreder. fal.ai çıktısı yaklaşık → sınır kayarsa yalnız bu oranlar ayarlanır. */
export const ABOUT_MARKERS: Marker[] = [
  { name: "open", at: 0 }, // karanlıkta omuz-üstü kodlama — establish beat
  { name: "rest", at: 0.15 }, // karanlık kodlama üstünde "Talha" (okunur)
  { name: "bright", at: 0.6 }, // sıcak ışık yükseldi — "Talha" söner, film açılır
];

/** Contact filmi — kullanıcı videosu: iki ışık noktası karanlıkta
 *  birbirine yaklaşıp bağlanır; karanlık kalır (kapanış tonu). */
export const CONTACT_MARKERS: Marker[] = [
  { name: "line", at: 0 }, // iki nokta ayrı, birbirine süzülüyor
  { name: "cursor", at: 0.6 }, // bağlantı kuruldu — "let's build something"
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
