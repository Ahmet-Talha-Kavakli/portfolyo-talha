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
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

async function realPipeline() {
  // Faz 7.1: ffmpeg ile fal.ai klip -> WebP kareler + mobil video/poster.
  // Bütçe: desktop <=120KB/kare ~240, mobil <=55KB/kare ~120; aşımda hata.
  console.error(
    "Gerçek pipeline Faz 7.1'de tamamlanacak (ffmpeg gerekir). " +
      "Şimdilik: node scripts/frames.mjs --placeholder --page home",
  );
  process.exit(2);
}

if (arg("placeholder", false)) {
  await placeholder();
} else {
  await realPipeline();
}
