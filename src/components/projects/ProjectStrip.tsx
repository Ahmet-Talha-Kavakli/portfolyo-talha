import Link from "next/link";
import SignalThread from "@/components/SignalThread";
import type { Project } from "@content";
import styles from "@/app/projects/projects.module.css";

/** Tek proje şeridi (kart değil): numara | görsel + ad/cümle/tech. */
export default function ProjectStrip({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className={styles.strip}>
      <div className={styles.index}>{project.index}</div>
      <div className={styles.body}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.cover}
          alt={project.name}
          className={styles.cover}
          loading="lazy"
        />
        <div>
          <div className={styles.name}>{project.name}</div>
          <p className={styles.tagline}>{project.tagline}</p>
          <div className={styles.tech}>
            {project.tech.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <SignalThread
        className={styles.thread}
        progress={1}
        state="idle"
        tone={0.15}
      />
    </Link>
  );
}
