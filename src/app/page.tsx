import type { Metadata } from "next";
import ScrollFilm from "@/components/ScrollFilm";
import SceneText from "@/components/SceneText";
import IdentityLines from "@/components/home/IdentityLines";
import Doors from "@/components/home/Doors";
import MiniShowcase from "@/components/home/MiniShowcase";
import Footer from "@/components/Footer";
import { HOME_MARKERS } from "@/lib/markers";
import { site } from "@content";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: `${site.name} — Software · 3D · AI`,
  description: site.tagline,
  openGraph: {
    title: `${site.name} — Software · 3D · AI`,
    description: site.tagline,
    type: "website",
  },
};

export default function Home() {
  return (
    <main>
      <ScrollFilm framesDir="/frames/home" markers={HOME_MARKERS}>
        <SceneText name="face" className={styles.dim}>
          <span>scroll to begin</span>
        </SceneText>
        <SceneText name="brain" className={styles.huge}>
          <span>THINK</span>
        </SceneText>
        <SceneText name="cable" className={styles.huge}>
          <span>BUILD</span>
        </SceneText>
        <SceneText name="machine" className={styles.huge}>
          <span>SHIP</span>
        </SceneText>
        <SceneText name="white" className={styles.name}>
          <div>
            <h1>{site.name}</h1>
            <p>{site.tagline}</p>
          </div>
        </SceneText>
        <SceneText name="land" className={`${styles.dim} ${styles.onLight}`}>
          <span>keep scrolling</span>
        </SceneText>
      </ScrollFilm>

      <div className={styles.after}>
        <IdentityLines />
        <Doors />
        <MiniShowcase />
        <Footer />
      </div>
    </main>
  );
}
