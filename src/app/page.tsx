import ScrollFilm from "@/components/ScrollFilm";
import { HOME_MARKERS } from "@/lib/markers";

// Faz 1.6: ScrollFilm motoru placeholder karelerle (server component).
// Faz 2'de 6 sahne SceneText + film sonrası içerik bunun üstüne kurulacak.
export default function Home() {
  return (
    <main>
      <ScrollFilm framesDir="/frames/home" markers={HOME_MARKERS} />

      <section
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--bg-light)",
          color: "var(--ink)",
        }}
      >
        <p style={{ opacity: 0.5 }}>
          [Faz 2: film sonrası içerik buraya gelecek]
        </p>
      </section>
    </main>
  );
}
