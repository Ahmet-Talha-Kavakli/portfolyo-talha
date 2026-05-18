#!/usr/bin/env node
/**
 * frames.mjs — kare üretimi.
 *
 * İki mod:
 *  1) --placeholder : bağımlılıksız (BMP) düz renk geçişli kare seti üretir.
 *     Faz 1 için: ScrollFilm motoru gerçek video gelmeden çalışsın diye.
 *  2) (Faz 7.1'de tamamlanacak) gerçek mod: fal.ai klip(ler) -> ffmpeg ->
 *     WebP kareler + mobil video/poster + BÜTÇE KONTROLÜ. ffmpeg gerektirir.
 *
 * Kullanım:
 *   node scripts/frames.mjs --placeholder --page home --count 60
 *
 * Çıktı: public/frames/<page>/frame-0001.bmp ... + manifest.json
 * (public/frames/ git'e GİRMEZ — .gitignore.)
 */
import {
  mkdir,
  writeFile,
  rm,
  readFile,
  readdir,
  stat,
  copyFile,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkBudget } from "./lib/frameBudget.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

const hex = (h) => {
  const n = parseInt(h.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};
const lerp = (a, b, t) => Math.round(a + (b - a) * t);

/** 24bpp, bottom-up, sıkıştırmasız BMP — tarayıcılar render eder. */
function solidBmp(w, h, c) {
  const rowSize = (w * 3 + 3) & ~3;
  const pad = rowSize - w * 3;
  const dataSize = rowSize * h;
  const buf = Buffer.alloc(54 + dataSize);
  buf.write("BM", 0);
  buf.writeUInt32LE(54 + dataSize, 2);
  buf.writeUInt32LE(54, 10);
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(w, 18);
  buf.writeInt32LE(h, 22);
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(24, 28);
  buf.writeUInt32LE(0, 30);
  buf.writeUInt32LE(dataSize, 34);
  buf.writeInt32LE(2835, 38);
  buf.writeInt32LE(2835, 42);
  let o = 54;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      buf[o++] = c.b;
      buf[o++] = c.g;
      buf[o++] = c.r;
    }
    o += pad;
  }
  return buf;
}

// Sayfa başına placeholder kare sayısı (marker'larla uyumlu).
const PAGES = { home: 60, projects: 30, about: 24, contact: 16 };

async function placeholderFor(page, count) {
  // Kareler düz renk olduğundan minik çözünürlük yeter (cover-scale ile
  // tam ekran çizilince görsel AYNI). Perf: ~7KB/kare (bütçe içinde).
  const w = parseInt(arg("w", "64"), 10);
  const h = parseInt(arg("h", "36"), 10);
  const dark = hex("#070b16");
  const light = hex("#f7f6f2");
  const dir = join(ROOT, "public", "frames", page);

  // Gerçek asset koruması (Faz 7): manifest placeholder:false ise dokunma.
  const mpath = join(dir, "manifest.json");
  if (existsSync(mpath)) {
    try {
      const m = JSON.parse(await readFile(mpath, "utf8"));
      if (m && m.placeholder === false) {
        console.log(`skip: ${page} gerçek asset (placeholder:false) — korunur`);
        return;
      }
    } catch {
      /* bozuk manifest → yeniden üret */
    }
  }

  if (existsSync(dir)) await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const c = {
      r: lerp(dark.r, light.r, t),
      g: lerp(dark.g, light.g, t),
      b: lerp(dark.b, light.b, t),
    };
    const name = `frame-${String(i + 1).padStart(4, "0")}.bmp`;
    await writeFile(join(dir, name), solidBmp(w, h, c));
  }

  const manifest = {
    placeholder: true,
    count,
    ext: "bmp",
    pattern: "frame-%04d",
    width: w,
    height: h,
  };
  await writeFile(
    join(dir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log(
    `placeholder: ${count} kare -> public/frames/${page}/ (${w}x${h} bmp)`,
  );
}

async function placeholder() {
  if (arg("all", false)) {
    for (const [page, count] of Object.entries(PAGES)) {
      await placeholderFor(page, count);
    }
    return;
  }
  const page = arg("page", "home");
  const count = parseInt(arg("count", String(PAGES[page] ?? 60)), 10);
  await placeholderFor(page, count);
}

// --- Gerçek pipeline (Faz 7.1): ffmpeg → WebP kareler + mobil mp4/poster ---

const DESKTOP_MAX_FRAME = 120_000; // ≤120KB/kare (spec §10.2)
const DESKTOP_MAX_TOTAL = 6_000_000; // Home intro toplam ≤~6MB
const MOBILE_VIDEO_SOFT = 3_000_000; // mobil mp4 yumuşak tavan (uyarı)

function ff(bin, args) {
  return spawnSync(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
}
function ffmpegAvailable() {
  const r = ff("ffmpeg", ["-version"]);
  return r.status === 0;
}
function probeDuration(src) {
  const r = ff("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=nw=1:nk=1",
    src,
  ]);
  const d = parseFloat(String(r.stdout || "").trim());
  return Number.isFinite(d) && d > 0 ? d : null;
}

async function frameSizes(dir) {
  const files = (await readdir(dir))
    .filter((f) => /^frame-\d+\.webp$/.test(f))
    .sort();
  const sizes = [];
  for (const f of files) sizes.push((await stat(join(dir, f))).size);
  return { files, sizes };
}

async function buildReal() {
  const page = arg("page", "home");
  const inputsArg = arg("inputs", null);
  if (!inputsArg || inputsArg === true) {
    console.error(
      "Kullanım: node scripts/frames.mjs --build --page home " +
        "--inputs clip1.mp4[,clip2.mp4] [--count 240] [--width 1600] " +
        "[--quality 72]",
    );
    process.exit(2);
  }
  if (!ffmpegAvailable()) {
    console.error(
      "ffmpeg bulunamadı. Kur: `brew install ffmpeg` (ffprobe dahil).",
    );
    process.exit(2);
  }

  const inputs = String(inputsArg)
    .split(",")
    .map((p) => (isAbsolute(p) ? p : resolve(process.cwd(), p)));
  for (const p of inputs) {
    if (!existsSync(p)) {
      console.error(`Girdi yok: ${p}`);
      process.exit(2);
    }
  }

  const target = parseInt(arg("count", String(page === "home" ? 240 : 120)), 10);
  let quality = parseInt(arg("quality", "72"), 10);
  const width = parseInt(arg("width", "1600"), 10);
  const dir = join(ROOT, "public", "frames", page);
  if (existsSync(dir)) await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  // Çok klip → tek kaynağa birleştir (sahne klipleri sırayla).
  let src = inputs[0];
  if (inputs.length > 1) {
    const listFile = join(dir, "_concat.txt");
    await writeFile(
      listFile,
      inputs.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n"),
    );
    src = join(dir, "_src.mp4");
    const c = ff("ffmpeg", [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listFile,
      "-c:v",
      "libx264",
      "-crf",
      "18",
      "-an",
      src,
    ]);
    if (c.status !== 0) {
      console.error("ffmpeg concat hatası:", String(c.stderr).slice(-500));
      process.exit(1);
    }
  }

  const dur = probeDuration(src);
  const fps = dur ? Math.max(1, Math.round(target / dur)) : 24;

  // Kalite döngüsü: bütçeyi tutturana kadar kaliteyi düşür (≤3 deneme).
  let result = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    for (const f of await readdir(dir)) {
      if (/^frame-\d+\.webp$/.test(f)) await rm(join(dir, f));
    }
    const e = ff("ffmpeg", [
      "-y",
      "-i",
      src,
      "-vf",
      `fps=${fps},scale='min(${width},iw)':-2`,
      "-c:v",
      "libwebp",
      "-quality",
      String(quality),
      "-compression_level",
      "6",
      join(dir, "frame-%04d.webp"),
    ]);
    if (e.status !== 0) {
      console.error("ffmpeg kare hatası:", String(e.stderr).slice(-500));
      process.exit(1);
    }
    // Hedef sayıyı aşan fazla kareleri buda (bütçe kontrolü).
    const { files } = await frameSizes(dir);
    for (const extra of files.slice(target)) await rm(join(dir, extra));

    const { sizes } = await frameSizes(dir);
    result = checkBudget(sizes, {
      maxFrameBytes: DESKTOP_MAX_FRAME,
      maxTotalBytes: DESKTOP_MAX_TOTAL,
      label: "desktop",
    });
    if (result.ok) break;
    if (quality > 40) {
      quality -= 12;
      console.warn(
        `Bütçe aşıldı (${result.reason}). Kalite→${quality}, yeniden...`,
      );
    } else {
      break;
    }
  }
  if (!result || !result.ok) {
    console.error(`BÜTÇE HATASI: ${result?.reason}`);
    console.error(`Öneri: ${result?.suggestion}`);
    process.exit(1); // build'i durdur (reviewer SHOULD #4 / NICE #11)
  }

  // Mobil: hafif mp4 (autoplay) + poster (son kare temsili).
  const clip = join(dir, "clip.mp4");
  const mv = ff("ffmpeg", [
    "-y",
    "-i",
    src,
    "-vf",
    "scale=720:-2",
    "-c:v",
    "libx264",
    "-crf",
    "30",
    "-preset",
    "veryfast",
    "-an",
    "-movflags",
    "+faststart",
    clip,
  ]);
  if (mv.status !== 0) {
    console.error("ffmpeg mobil mp4 hatası:", String(mv.stderr).slice(-500));
    process.exit(1);
  }
  const mvSize = (await stat(clip)).size;
  if (mvSize > MOBILE_VIDEO_SOFT) {
    console.warn(
      `Uyarı: mobil clip ${Math.round(mvSize / 1000)}KB > yumuşak tavan ` +
        `${MOBILE_VIDEO_SOFT / 1000}KB (kabul edildi; --width düşürülebilir).`,
    );
  }
  const { files: webps } = await frameSizes(dir);
  const posterSrc = webps[Math.floor(webps.length * 0.85)] || webps.at(-1);
  if (posterSrc) await copyFile(join(dir, posterSrc), join(dir, "poster.webp"));

  // Temizlik + manifest.
  for (const tmp of ["_concat.txt", "_src.mp4"]) {
    if (existsSync(join(dir, tmp))) await rm(join(dir, tmp));
  }
  const manifest = {
    placeholder: false, // gen:frames bunu KORUR (üzerine yazmaz)
    count: result.count,
    ext: "webp",
    pattern: "frame-%04d",
    width,
    height: 0, // ScrollFilm runtime'da naturalWidth/Height kullanır
    video: `/frames/${page}/clip.mp4`,
    poster: `/frames/${page}/poster.webp`,
  };
  await writeFile(
    join(dir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log(
    `gerçek: ${result.count} WebP kare (max ${Math.round(
      result.max / 1000,
    )}KB, toplam ${Math.round(result.total / 1000)}KB) + mobil clip/poster ` +
      `-> public/frames/${page}/`,
  );
}

if (arg("placeholder", false)) {
  await placeholder();
} else if (arg("build", false)) {
  await buildReal();
} else {
  console.error(
    "Mod seç: --placeholder [--all|--page X] | --build --page X --inputs a.mp4",
  );
  process.exit(2);
}
