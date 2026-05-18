import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SignalThread from "@/components/SignalThread";
import Footer from "@/components/Footer";
import { site } from "@content";
import styles from "../projects.module.css";

// Bilinmeyen slug → 404 (on-demand render YOK): yalnız üretilen paramlar.
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return site.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = site.projects.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${site.name}`,
    description: p.tagline,
    openGraph: { title: p.name, description: p.tagline, type: "article" },
  };
}

export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params;
  const p = site.projects.find((x) => x.slug === slug);
  if (!p) notFound();

  return (
    <main>
      <article className={styles.detail}>
        {/* İntro filmi YOK — sadece imza ipliği geçişi (spec §10.8). */}
        <SignalThread
          className={styles.detailThread}
          progress={1}
          state="idle"
          tone={0.1}
        />
        <Link href="/projects" className={styles.back}>
          ← Projects
        </Link>
        <h1 className={styles.detailName}>{p.name}</h1>
        <div className={styles.detailMeta}>
          {p.tech.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </div>

        <div className={styles.gallery}>
          {p.gallery.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`${p.name} — ${i + 1}`}
              className={styles.galleryImg}
              loading="lazy"
            />
          ))}
        </div>

        <p className={styles.detailBody}>{p.body}</p>

        {p.link && (
          <a
            href={p.link}
            className={styles.detailLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit ↗
          </a>
        )}
      </article>
      <Footer />
    </main>
  );
}
