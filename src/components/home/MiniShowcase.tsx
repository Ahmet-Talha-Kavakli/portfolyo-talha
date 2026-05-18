import Link from "next/link";
import { site } from "@content";
import styles from "@/app/home.module.css";

/** Mini vitrin — en güçlü TEK proje (özet); tıklayınca /projects. */
export default function MiniShowcase() {
  const p = site.projects[0];
  if (!p) return null;
  return (
    <section className={styles.showcase}>
      <Link href="/projects" className={styles.showcaseLink} prefetch={false}>
        {/* Placeholder görsel — gerçek fal.ai/üretim görseli sonra
            content/site.ts'ten gelir (next/image değil: placeholder SVG). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.cover}
          alt={p.name}
          className={styles.showcaseImg}
          loading="lazy"
        />
        <div className={styles.showcaseMeta}>
          <span className={styles.showcaseName}>{p.name}</span>
          <span className={styles.showcaseGo}>view projects</span>
        </div>
      </Link>
    </section>
  );
}
