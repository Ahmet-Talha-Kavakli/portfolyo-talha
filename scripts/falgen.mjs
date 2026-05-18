#!/usr/bin/env node
/**
 * falgen.mjs — fal.ai ile Home sahne kliplerini üretir (image-to-video).
 *
 * Sahne 1 yüz fotoğrafından; sonraki sahneler bir öncekinin SON KARESİNDEN
 * devam eder (süreklilik). Çıktı: _source-assets/home-<id>.mp4
 *
 * NOT: fal.ai video üretimi ÜCRETLİDİR (kullanıcının fal kredisi). Bu script
 * yalnız açıkça çağrılınca üretir. `--list` sadece prompt'ları gösterir.
 *
 * Kullanım:
 *   node scripts/falgen.mjs --list
 *   node scripts/falgen.mjs --image _source-assets/talha-cutout.png \
 *     [--model fal-ai/kling-video/v1.6/standard/image-to-video]
 *
 * FAL_KEY .env.local'dan okunur.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { HOME_SCENES } from "./fal-scenes.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "_source-assets");

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

function loadFalKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY;
  const envPath = join(ROOT, ".env.local");
  if (existsSync(envPath)) {
    const m = readFileSync(envPath, "utf8").match(/^FAL_KEY=(.+)$/m);
    if (m) return m[1].trim();
  }
  return null;
}

if (arg("list", false)) {
  console.log("Home sahne klipleri (fal.ai image-to-video):\n");
  for (const s of HOME_SCENES) {
    console.log(
      `• ${s.id}${s.useFacePhoto ? " (yüz fotoğrafı)" : ""} ~${s.seconds}s`,
    );
    console.log(`  "${s.prompt}"\n`);
  }
  process.exit(0);
}

const FAL_KEY = loadFalKey();
if (!FAL_KEY) {
  console.error("FAL_KEY yok (.env.local). Çıkılıyor.");
  process.exit(2);
}

const imagePath = arg("image", null);
if (!imagePath || imagePath === true) {
  console.error(
    "Kullanım: node scripts/falgen.mjs --image _source-assets/<foto>",
  );
  process.exit(2);
}
const absImage = join(ROOT, imagePath);
if (!existsSync(absImage)) {
  console.error(`Fotoğraf yok: ${absImage}`);
  process.exit(2);
}

const MODEL = String(
  arg("model", "fal-ai/kling-video/v1.6/standard/image-to-video"),
);
const FAL = "https://queue.fal.run";
const headers = {
  Authorization: `Key ${FAL_KEY}`,
  "Content-Type": "application/json",
};

const mime = (p) =>
  ({ ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" })[
    extname(p).toLowerCase()
  ] || "image/png";

async function dataUri(p) {
  const buf = await readFile(p);
  return `data:${mime(p)};base64,${buf.toString("base64")}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** fal queue: submit → poll → result.video.url */
async function genClip(prompt, imageUri) {
  const sub = await fetch(`${FAL}/${MODEL}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt, image_url: imageUri }),
  });
  if (!sub.ok) {
    throw new Error(
      `submit ${sub.status}: ${(await sub.text()).slice(0, 400)}`,
    );
  }
  const { request_id } = await sub.json();
  if (!request_id) throw new Error("request_id yok (model şeması farklı?)");

  // poll
  for (let i = 0; i < 150; i++) {
    await sleep(4000);
    const st = await fetch(
      `${FAL}/${MODEL}/requests/${request_id}/status`,
      { headers },
    );
    const sj = await st.json();
    if (sj.status === "COMPLETED") break;
    if (sj.status === "FAILED" || sj.status === "ERROR")
      throw new Error(`fal FAILED: ${JSON.stringify(sj).slice(0, 400)}`);
    process.stdout.write(".");
  }
  const res = await fetch(`${FAL}/${MODEL}/requests/${request_id}`, {
    headers,
  });
  const rj = await res.json();
  // Model şemaları değişir — yaygın alanları dene.
  const url =
    rj?.video?.url ||
    rj?.video ||
    rj?.output?.url ||
    rj?.url ||
    (Array.isArray(rj?.videos) && rj.videos[0]?.url);
  if (!url || typeof url !== "string")
    throw new Error(
      `video url bulunamadı. Yanıt: ${JSON.stringify(rj).slice(0, 500)}`,
    );
  return url;
}

async function download(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`indirme ${r.status}`);
  await writeFile(dest, Buffer.from(await r.arrayBuffer()));
}

/** Bir klibin son karesini png olarak çıkar (sonraki sahne girişi). */
function lastFrame(mp4, outPng) {
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-sseof", "-0.1", "-i", mp4, "-frames:v", "1", outPng],
    { stdio: "ignore" },
  );
  return r.status === 0 && existsSync(outPng);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log(`Model: ${MODEL}`);
  let chainImage = await dataUri(absImage);
  const produced = [];

  for (const scene of HOME_SCENES) {
    console.log(`\n▶ ${scene.id}: üretiliyor...`);
    const url = await genClip(scene.prompt, chainImage);
    const dest = join(OUT, `home-${scene.id}.mp4`);
    await download(url, dest);
    produced.push(dest);
    console.log(`  ✓ ${dest}`);

    const lf = join(OUT, `_last-${scene.id}.png`);
    if (lastFrame(dest, lf)) chainImage = await dataUri(lf);
  }

  const inputs = produced.join(",");
  console.log(`\nTüm klipler hazır. Şimdi gerçek kareleri üret:\n`);
  console.log(
    `  node scripts/frames.mjs --build --page home --inputs ${inputs}\n`,
  );
}

main().catch((e) => {
  console.error("\nHATA:", e.message);
  console.error(
    "Model şeması farklı olabilir; --model ile başka bir fal i2v " +
      "modeli dene (örn. fal-ai/minimax/video-01/image-to-video).",
  );
  process.exit(1);
});
