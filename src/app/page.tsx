import ScrollFilm from "@/components/ScrollFilm";
import SceneText from "@/components/SceneText";
import { HOME_MARKERS } from "@/lib/markers";

// Faz 1.8: SceneText mekanizması (marker'a senkron overlay). Faz 2.1
// tüm 6 sahneyi (yerleşim/tipografi) + film sonrası içeriği kuracak.
export default function Home() {
  return (
    <main>
      <ScrollFilm framesDir="/frames/home" markers={HOME_MARKERS}>
        <SceneText name="brain">
          <span style={{ fontSize: "12vw", opacity: 0.5 }}>THINK</span>
        </SceneText>
        <SceneText name="cable">
          <span style={{ fontSize: "12vw", opacity: 0.5 }}>BUILD</span>
        </SceneText>
        <SceneText name="machine">
          <span style={{ fontSize: "12vw", opacity: 0.5 }}>SHIP</span>
        </SceneText>
        <SceneText name="white">
          <span style={{ fontSize: "8vw" }}>Talha</span>
        </SceneText>
      </ScrollFilm>

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
