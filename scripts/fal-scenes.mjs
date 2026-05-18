/**
 * Home filmi — YÜZSÜZ soyut sinematik (spec §10.6 revize).
 *
 * Mantık: AI image-to-video bir portreyi beyne dönüştüremez; ama soyut
 * sinematik harekette (karanlık, nöron lifleri, enerji kablosu, ışık) çok
 * iyidir. Yüz YOK — kişisel marka tipografiyle veriliyor (beyazda "Talha").
 *
 * Sahne 1 = text-to-video (görüntü girişi yok). Sonraki sahneler önceki
 * klibin SON KARESİNDEN devam eder (image-to-video) → tek akışkan film.
 *
 * Prompt'lar İngilizce. Düzenlemekten çekinme.
 */
export const HOME_SCENES = [
  {
    id: "01-void",
    t2v: true, // text-to-video (foto yok)
    prompt:
      "Cinematic, pure black void. A single faint point of electric-blue light begins to pulse and breathe in the center, slow, minimal, premium, deep darkness, subtle film grain, slow push-in.",
    seconds: 4,
  },
  {
    id: "02-neurons",
    prompt:
      "The point of light blooms into a dark neural space: glowing electric-blue and violet neuron filaments stretch and branch, synapses firing softly, drifting particles, deep navy-black background, cinematic, slow camera drift.",
    seconds: 4,
  },
  {
    id: "03-cable",
    prompt:
      "The scattered glowing filaments converge and braid into ONE bright electric-blue energy cable that races forward through the darkness, energy pulsing along its length, sparks trailing, high contrast, cinematic speed.",
    seconds: 4,
  },
  {
    id: "04-screen-white",
    prompt:
      "The glowing cable drives into a sleek dark screen; the screen ignites with a spark and light blooms outward, flooding the whole frame smoothly into soft warm white, calm, premium, gentle bloom, no text.",
    seconds: 4,
  },
];

export const SCENES = { home: HOME_SCENES };
