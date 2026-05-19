#!/usr/bin/env node
/**
 * gen-about.mjs — About için TEK minimal atmosferik klip üretir (fal.ai
 * text-to-video). Nesne/metafor/insan YOK: karanlıkta yavaş sıcak ışık
 * doğuşu → sakin temiz beyaz. Portre/bio ile yarışmaz, tamamlar.
 *
 * Çıktı: _source-assets/about.mp4   (eskisinin üstüne)
 * FAL_KEY .env.local'dan okunur.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "_source-assets");

function falKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY;
  const p = join(ROOT, ".env.local");
  if (existsSync(p)) {
    const m = readFileSync(p, "utf8").match(/^FAL_KEY=(.+)$/m);
    if (m) return m[1].trim();
  }
  return null;
}
const KEY = falKey();
if (!KEY) {
  console.error("FAL_KEY yok (.env.local).");
  process.exit(2);
}

const MODEL =
  process.argv[2] || "fal-ai/kling-video/v1.6/standard/text-to-video";
const FAL = "https://queue.fal.run";
const headers = {
  Authorization: `Key ${KEY}`,
  "Content-Type": "application/json",
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROMPT =
  "Single continuous cinematic shot, no text, no logos, no faces, no objects. " +
  "Pure deep darkness. A soft, warm light slowly and gently rises and blooms " +
  "from below the center, like a calm quiet dawn, subtle volumetric glow and " +
  "the faintest electric-blue haze at the edges. The light expands smoothly " +
  "and fills the frame into a clean, calm, soft white. Extremely minimal, " +
  "premium, serene, very slow deliberate camera, cinematic film grain, 16:9.";

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log(`Model: ${MODEL}\nÜretiliyor (atmosferik, ~3-5 dk)...`);
  const sub = await fetch(`${FAL}/${MODEL}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt: PROMPT }),
  });
  if (!sub.ok) {
    console.error(`submit ${sub.status}: ${(await sub.text()).slice(0, 400)}`);
    process.exit(1);
  }
  const sj = await sub.json();
  const statusUrl = sj.status_url;
  const responseUrl = sj.response_url;
  if (!statusUrl || !responseUrl) {
    console.error(`URL yok: ${JSON.stringify(sj).slice(0, 400)}`);
    process.exit(1);
  }
  for (let i = 0; i < 150; i++) {
    await sleep(4000);
    const st = await fetch(statusUrl, { headers });
    if (!st.ok) continue;
    const j = await st.json();
    if (j.status === "COMPLETED") break;
    if (j.status === "FAILED" || j.status === "ERROR") {
      console.error(`fal FAILED: ${JSON.stringify(j).slice(0, 400)}`);
      process.exit(1);
    }
    process.stdout.write(".");
  }
  const res = await fetch(responseUrl, { headers });
  const rj = await res.json();
  const url =
    rj?.video?.url ||
    rj?.video ||
    rj?.output?.url ||
    rj?.url ||
    (Array.isArray(rj?.videos) && rj.videos[0]?.url);
  if (!url || typeof url !== "string") {
    console.error(`video url yok: ${JSON.stringify(rj).slice(0, 500)}`);
    process.exit(1);
  }
  const dl = await fetch(url);
  await writeFile(
    join(OUT, "about.mp4"),
    Buffer.from(await dl.arrayBuffer()),
  );
  console.log(`\n✓ _source-assets/about.mp4`);
}
main().catch((e) => {
  console.error("\nHATA:", e.message);
  process.exit(1);
});
