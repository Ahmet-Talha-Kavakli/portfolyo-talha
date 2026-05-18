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

  // Anlatı paragraflarıyla galeri görsellerini dönüşümlü ör (vaka çalışması).
  const shots = p.gallery;

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

        {/* Künye / hero */}
        <header className={styles.caseHead}>
          <div className={styles.caseIndex}>{p.index}</div>
          <h1 className={styles.detailName}>{p.name}</h1>
          <p className={styles.caseTagline}>{p.tagline}</p>
          <dl className={styles.caseMeta}>
            {p.meta.map((m) => (
              <dd key={m}>{m}</dd>
            ))}
          </dl>
          <div className={styles.detailMeta}>
            {p.tech.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>
          {p.link && (
            <a
              href={p.link}
              className={styles.detailLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit live ↗
            </a>
          )}
        </header>

        {/* Lead görsel */}
        {shots[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shots[0]}
            alt={`${p.name} — overview`}
            className={styles.leadImg}
          />
        )}

        {/* Anlatı paragrafları, aralarına tam-genişlik galeri görselleri */}
        <div className={styles.caseBody}>
          {p.body.map((para, i) => (
            <div key={i} className={styles.caseBlock}>
              <p>{para}</p>
              {shots[i + 1] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shots[i + 1]}
                  alt={`${p.name} — ${i + 2}`}
                  className={styles.galleryImg}
                  loading="lazy"
                />
              )}
            </div>
          ))}
          {/* Anlatıdan fazla görsel kaldıysa sona ekle */}
          {shots.slice(p.body.length + 1).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`extra-${i}`}
              src={src}
              alt={`${p.name} — ${p.body.length + 2 + i}`}
              className={styles.galleryImg}
              loading="lazy"
            />
          ))}
        </div>

        <Link href="/projects" className={styles.back}>
          ← All projects
        </Link>
      </article>
      <Footer />
    </main>
  );
}
