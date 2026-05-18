/**
 * Home filmi — fal.ai sahne klipleri (spec §10.6: tek sürekli video değil,
 * sahne sahne kısa klipler; frames.mjs --build bunları birleştirip kareler).
 *
 * Anlatı: yüz karanlıktan belirir → beyne zoom, sinir sinyalleri →
 * sinyaller kabloya dönüşür → kablo bilgisayara akar → sistem beyaza açılır.
 *
 * `image` ilk klipte yüz fotoğrafıdır (image-to-video); sonraki klipler
 * bir öncekinin son karesinden devam etmek için chain edilebilir.
 *
 * Prompt'lar İngilizce (model İngilizce daha iyi anlıyor). Düzenlemekten
 * çekinme — üretmeden önce sana göstereceğim.
 */
export const HOME_SCENES = [
  {
    id: "01-face",
    useFacePhoto: true,
    prompt:
      "A young man's face emerging slowly from pure black, faint cinematic rim light, calm, photoreal, subtle breathing, very dark background, slow push-in.",
    seconds: 4,
  },
  {
    id: "02-brain",
    prompt:
      "Camera pushes into the head, dissolving into a dark neural space; glowing blue-violet neuron filaments and synapses firing softly, electric sparks, deep navy background, cinematic.",
    seconds: 4,
  },
  {
    id: "03-cable",
    prompt:
      "The scattered neural signals converge into one bright electric-blue cable that stretches forward through darkness, energy flowing along it, sparks, high contrast.",
    seconds: 4,
  },
  {
    id: "04-machine",
    prompt:
      "The glowing cable plugs into a sleek computer; the screen ignites with a spark; the dark scene begins to brighten from the screen outward, cinematic.",
    seconds: 4,
  },
  {
    id: "05-white",
    prompt:
      "Light floods the frame smoothly until everything turns to soft warm white; clean, calm, premium, no text, gentle bloom.",
    seconds: 3,
  },
];

/** Diğer sayfa filmleri sonra (placeholder yeterli). */
export const SCENES = { home: HOME_SCENES };
