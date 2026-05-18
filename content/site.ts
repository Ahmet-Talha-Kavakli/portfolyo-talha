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
  tagline: "Software · 3D · AI — I build the whole thing.",
  identity: [
    "I design and build end-to-end — backend, frontend, 3D and AI.",
    "Whatever you're looking for, it's here.",
  ],
  about: [
    "I'm Talha — a builder. I take an idea from the first sketch to a shipped, running product.",
    "I don't stop at one layer. Backend logic, frontend craft, 3D scenes and AI all live in the same head — I've built whole platforms end to end, alone.",
    "I care about the feel of a thing — how it moves, how it reads, how it holds up under real load and real users.",
    "What I want to be known for: the whole thing, done well, end to end.",
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
        "An AI fitness platform — a voice AI coach with 3D characters, built end to end.",
      tech: [
        "React Native",
        "Expo",
        "TypeScript",
        "Node",
        "Three.js",
        "AI",
        "ElevenLabs",
      ],
      cover: "/placeholder/project-01.svg",
      gallery: ["/placeholder/project-01.svg"],
      body: "Meta-World is an AI fitness and body-coaching platform built as a full monorepo — mobile app, backend, dashboard and web. It pairs a voice-driven AI coach with real-time 3D characters and a nutrition system, designed to feel less like an app and more like a trainer who knows you. Backend, frontend, 3D and AI — all built end to end.",
    },
    {
      slug: "replara",
      index: "02",
      name: "Replara",
      tagline:
        "AI-powered reputation management — on-brand review responses across every channel.",
      tech: ["AI", "Next.js", "TypeScript", "Node", "PostgreSQL"],
      cover: "/placeholder/project-02.svg",
      gallery: ["/placeholder/project-02.svg"],
      body: "Replara is an AI-driven reputation platform that turns customer reviews into an advantage. It centralizes Google, Trustpilot, app stores and social into one dashboard, then uses context-aware AI to draft responses that hold the brand's voice — with sentiment analysis, crisis detection and competitor intelligence. Live in production at replara.com.",
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
