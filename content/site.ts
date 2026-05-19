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
  /** Detay sayfası büyük görselleri (farklı cihaz/açı mockup seti). */
  gallery: string[];
  /** Detay sayfası anlatı — çok paragraf (vaka çalışması). */
  body: string[];
  /** Kısa künye satırları (rol · yıl · durum). */
  meta: string[];
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
  /** About yetenek hattı — disiplin + kısa açıklama (skill-bar değil). */
  skills: { label: string; detail: string }[];
  /** About alt: araç/stack listesi (mono). */
  stack: string[];
  projects: Project[];
  socials: Social[];
  /** About portresi (public/ yolu). */
  portrait: string;
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
  skills: [
    {
      label: "Full-stack engineering",
      detail: "Backend architecture, APIs, web & mobile — in production",
    },
    {
      label: "Product & UI design",
      detail: "Interface, interaction, design systems, motion",
    },
    {
      label: "Real-time 3D",
      detail: "Three.js / WebGL — characters, scenes, performance",
    },
    {
      label: "Applied AI",
      detail: "LLMs, voice, generation pipelines in real products",
    },
    {
      label: "End-to-end delivery",
      detail: "From a blank screen to a shipped product — solo",
    },
  ],
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
      cover: "/projects/meta-world-1.png",
      gallery: [
        "/projects/meta-world-1.png",
        "/projects/meta-world-2.png",
        "/projects/meta-world-3.png",
        "/projects/meta-world-4.png",
      ],
      meta: ["Solo — design & engineering", "2024–2025", "In development"],
      body: [
        "Meta-World is an AI fitness and body-coaching platform built as a complete monorepo — mobile app, backend, dashboard and marketing web. The goal was a product that feels less like an app and more like a trainer who actually knows you.",
        "At its core is a voice-driven AI coach: it talks back in real time, adapts to how the session is going, and is paired with real-time 3D characters that react as you move. An adaptive nutrition system closes the loop between training and eating.",
        "I designed and engineered the whole thing alone — the backend architecture and APIs, the React Native app, the dashboard, the 3D layer and the AI/voice integration. Every layer was built to hold up under real users, not just a demo.",
        "It's the clearest example of how I work: take an ambitious, multi-disciplinary idea and carry it end to end, without handing any layer to someone else.",
      ],
    },
    {
      slug: "replara",
      index: "02",
      name: "Replara",
      tagline:
        "AI-powered reputation management — on-brand review responses across every channel, in production.",
      tech: ["AI", "Next.js", "TypeScript", "Node", "PostgreSQL"],
      cover: "/projects/replara-1.png",
      gallery: [
        "/projects/replara-1.png",
        "/projects/replara-2.png",
        "/projects/replara-3.png",
        "/projects/replara-4.png",
      ],
      meta: ["Product & engineering", "2025", "Live in production"],
      body: [
        "Replara is an AI-driven reputation platform that turns customer reviews into an advantage instead of a chore. It centralizes Google, Trustpilot, app stores and social into a single dashboard.",
        "Context-aware AI drafts responses that hold each brand's voice — backed by sentiment analysis, crisis detection and competitor intelligence, so teams can move fast without sounding like a bot.",
        "The product spans a marketing site, an authenticated dashboard and the AI response pipeline behind it — fully responsive, from desktop control room to phone. It is live and in production at replara.com.",
      ],
      link: "https://replara.com",
    },
  ],
  // İletişim: gerçek e-posta. GitHub/LinkedIn/X için kullanıcıdan gerçek
  // adres alınacak (uydurma link konmaz) — geldiğinde eklenecek.
  socials: [
    { label: "Email", href: "mailto:carreinaofficial@gmail.com" },
  ],
  portrait: "/portrait.jpg",
  city: "Istanbul",
  timezone: "Europe/Istanbul",
};
