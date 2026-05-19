import Link from "next/link";
import { site } from "@content";
import Parallax from "@/components/fx/Parallax";
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
        <Parallax amount={30}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.cover}
            alt={p.name}
            className={styles.showcaseImg}
            loading="lazy"
          />
        </Parallax>
        <div className={styles.showcaseMeta}>
          <span className={styles.showcaseName}>{p.name}</span>
          <span className={styles.showcaseGo}>view projects</span>
        </div>
      </Link>
    </section>
  );
}
