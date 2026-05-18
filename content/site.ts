/**
 * TEK içerik kaynağı (spec §10.10).
 * Placeholder → gerçek: yalnızca BU dosyayı düzenle. Kod bu şemayı okur.
 * Görseller `public/` altına konur, yol buradan referanslanır.
 */

export type Social = {
  /** Görünen etiket (İngilizce). */
  label: "Email" | "GitHub" | "LinkedIn" | "X";
  /** Tam URL veya mailto:. */
  href: string;
};

export type Project = {
  /** URL'de kullanılır: /projects/<slug> */
  slug: string;
  /** Şerit/listede dev numara (01, 02...). */
  index: string;
  name: string;
  /** Tek cümle özet (İngilizce). */
  tagline: string;
  /** Kullanılan teknolojiler — Sora mono etiketler. */
  tech: string[];
  /** Liste/şerit ana görseli (public/ yolu). */
  cover: string;
  /** Detay sayfası büyük görselleri. */
  gallery: string[];
  /** Detay sayfası kısa anlatı (İngilizce). */
  body: string;
  /** Opsiyonel dış link (canlı/repo). */
  link?: string;
};

export type SiteContent = {
  name: string;
  /** Home sahne 5 + genel kimlik cümlesi. */
  tagline: string;
  /** Home aydınlık bölüm kısa kimlik (2 cümle). */
  identity: string[];
  /** About sol sütun anlatı paragrafları (3-4). */
  about: string[];
  /** About yetenek hattı. */
  skills: string[];
  /** About alt: araç/stack listesi (mono). */
  stack: string[];
  projects: Project[];
  socials: Social[];
  /** Contact köşe: şehir + canlı saat. */
  city: string;
  /** IANA timezone (canlı saat için). */
  timezone: string;
};

export const site: SiteContent = {
  name: "Talha",
  tagline: "Software · 3D · AI — I build the whole product.",
  identity: [
    "I design and engineer complete products — backend, frontend, 3D and AI.",
    "One person, the entire stack, shipped to production.",
  ],
  about: [
    "I'm Talha — a product engineer. I take an idea from a blank screen to a running product people actually use.",
    "I work across the whole stack: backend architecture, frontend craft, real-time 3D and applied AI. I've designed and shipped entire platforms end to end, on my own.",
    "I care about how a product feels — how it moves, how it reads, and how it holds up under real load and real users, not just in a demo.",
    "What I want to be known for: ambitious products, built well, all the way through.",
  ],
  skills: ["Software", "Backend", "Frontend", "3D", "AI"],
  stack: [
    "TypeScript",
    "Next.js",
    "Node",
    "Python",
    "Three.js",
    "WebGL",
    "PostgreSQL",
    "Docker",
  ],
  projects: [
    {
      slug: "meta-world",
      index: "01",
      name: "Meta-World",
      tagline:
        "An AI fitness platform with a voice coach and real-time 3D characters — designed and engineered end to end.",
      tech: [
        "React Native",
        "Expo",
        "TypeScript",
        "Node",
        "Three.js",
        "AI",
        "ElevenLabs",
      ],
      cover: "/projects/meta-world.png",
      gallery: ["/projects/meta-world.png"],
      body: "Meta-World is an AI fitness and body-coaching platform built as a complete monorepo — mobile app, backend, dashboard and marketing web. It pairs a voice-driven AI coach with real-time 3D characters and an adaptive nutrition system, designed to feel less like an app and more like a trainer who actually knows you. Architecture, product, 3D and AI — all built and shipped by one person.",
    },
    {
      slug: "replara",
      index: "02",
      name: "Replara",
      tagline:
        "AI-powered reputation management — on-brand review responses across every channel, in production.",
      tech: ["AI", "Next.js", "TypeScript", "Node", "PostgreSQL"],
      cover: "/projects/replara.png",
      gallery: ["/projects/replara.png"],
      body: "Replara is an AI-driven reputation platform that turns customer reviews into an advantage. It centralizes Google, Trustpilot, app stores and social into a single dashboard, then uses context-aware AI to draft responses that hold each brand's voice — with sentiment analysis, crisis detection and competitor intelligence. Live in production at replara.com.",
      link: "https://replara.com",
    },
  ],
  // İletişim: gerçek e-posta. GitHub/LinkedIn/X için kullanıcıdan gerçek
  // adres alınacak (uydurma link konmaz) — geldiğinde eklenecek.
  socials: [
    { label: "Email", href: "mailto:carreinaofficial@gmail.com" },
  ],
  city: "Istanbul",
  timezone: "Europe/Istanbul",
};
