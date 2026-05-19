import type { Metadata } from "next";
import ScrollFilm from "@/components/ScrollFilm";
import SceneText from "@/components/SceneText";
import SkillLines from "@/components/about/SkillLines";
import Footer from "@/components/Footer";
import { ABOUT_MARKERS } from "@/lib/markers";
import { site } from "@content";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: `About — ${site.name}`,
  description: site.about[0]?.replace(/^\[placeholder\]\s*/, ""),
  openGraph: {
    title: `About — ${site.name}`,
    description: `Who ${site.name} is and how the work gets made.`,
    type: "profile",
  },
};

export default function AboutPage() {
  return (
    <main>
      <ScrollFilm
        framesDir="/frames/about"
        markers={ABOUT_MARKERS}
        scrollPerFrame={16}
      >
        <SceneText name="rest" className={styles.rest}>
          <span>{site.name}</span>
        </SceneText>
      </ScrollFilm>

      <div className={styles.after}>
        <header className={styles.aboutHead}>
          <figure className={styles.portraitWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.portrait}
              alt={site.name}
              className={styles.portrait}
            />
            <span className={styles.portraitTint} aria-hidden="true" />
            <span className={styles.portraitGrain} aria-hidden="true" />
            <span className={styles.portraitLine} aria-hidden="true" />
          </figure>
          <div>
            <h1 className={styles.aboutName}>{site.name}</h1>
            <p className={styles.aboutRole}>{site.tagline}</p>
          </div>
        </header>
        <section className={styles.grid}>
          <div className={styles.bio}>
            {site.about.map((para, i) => (
              <p key={i}>{para.replace(/^\[placeholder\]\s*/, "")}</p>
            ))}
          </div>
          <SkillLines />
        </section>

        <section className={styles.stack} aria-label="Tools and stack">
          {site.stack.map((t) => (
            <span key={t} className={styles.stackItem}>
              {t}
            </span>
          ))}
        </section>

        <Footer />
      </div>
    </main>
  );
}
