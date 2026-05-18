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
    "[placeholder] I'm Talha — a builder. I take an idea from the first sketch to a shipped, running system.",
    "[placeholder] I don't stop at one layer. Backend logic, frontend craft, 3D scenes and AI all live in the same head.",
    "[placeholder] I care about the feel of a thing — how it moves, how it reads, how it holds up under real load.",
    "[placeholder] What I want to be known for: the whole thing, done well, end to end.",
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
      slug: "placeholder-one",
      index: "01",
      name: "[Placeholder Project One]",
      tagline: "One line about what it does and why it matters.",
      tech: ["TypeScript", "Next.js", "WebGL"],
      cover: "/placeholder/project-01.svg",
      gallery: ["/placeholder/project-01.svg"],
      body: "[placeholder] Short narrative for the project detail page. Replace in content/site.ts.",
    },
    {
      slug: "placeholder-two",
      index: "02",
      name: "[Placeholder Project Two]",
      tagline: "One line about what it does and why it matters.",
      tech: ["Python", "AI", "Docker"],
      cover: "/placeholder/project-02.svg",
      gallery: ["/placeholder/project-02.svg"],
      body: "[placeholder] Short narrative for the project detail page. Replace in content/site.ts.",
    },
    {
      slug: "placeholder-three",
      index: "03",
      name: "[Placeholder Project Three]",
      tagline: "One line about what it does and why it matters.",
      tech: ["Three.js", "Node", "PostgreSQL"],
      cover: "/placeholder/project-03.svg",
      gallery: ["/placeholder/project-03.svg"],
      body: "[placeholder] Short narrative for the project detail page. Replace in content/site.ts.",
    },
  ],
  socials: [
    { label: "Email", href: "mailto:placeholder@example.com" },
    { label: "GitHub", href: "https://github.com/placeholder" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/placeholder" },
    { label: "X", href: "https://x.com/placeholder" },
  ],
  city: "Istanbul",
  timezone: "Europe/Istanbul",
};
