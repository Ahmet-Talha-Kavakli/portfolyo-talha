import type { Metadata } from "next";
import ScrollFilm from "@/components/ScrollFilm";
import SceneText from "@/components/SceneText";
import ProjectStrip from "@/components/projects/ProjectStrip";
import Footer from "@/components/Footer";
import { PROJECTS_MARKERS } from "@/lib/markers";
import { site } from "@content";
import styles from "./projects.module.css";

export const metadata: Metadata = {
  title: `Projects — ${site.name}`,
  description: `Selected work by ${site.name}: ${site.projects
    .map((p) => p.name)
    .join(", ")}.`,
  openGraph: {
    title: `Projects — ${site.name}`,
    description: `Selected work by ${site.name}.`,
    type: "website",
  },
};

export default function ProjectsPage() {
  return (
    <main>
      <ScrollFilm
        framesDir="/frames/projects"
        markers={PROJECTS_MARKERS}
        scrollPerFrame={16}
      >
        <SceneText name="built" className={styles.built}>
          <span>Built.</span>
        </SceneText>
      </ScrollFilm>

      <div className={styles.after}>
        <h1 className="sr-only">Projects — selected work by {site.name}</h1>
        <section className={styles.strips}>
          {site.projects.map((p) => (
            <ProjectStrip key={p.slug} project={p} />
          ))}
        </section>
        <Footer />
      </div>
    </main>
  );
}
