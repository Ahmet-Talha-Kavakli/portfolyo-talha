#!/usr/bin/env node
/**
 * verify-quality.mjs — Faz 8 kalite kapısı.
 *  A) Kare bütçesi (§10.2): Home toplam ≤6MB, kare ≤120KB
 *  B) Her route: <title>/description, <html lang>, canvas aria-hidden,
 *     img alt, tek h1, menü butonu aria-label
 *  C) Tek SignalThread bileşeni (kopya thread SVG yok — §10.12)
 *  D) Mobil viewport (375px): yatay taşma yok, konsol hatası yok
 */
import puppeteer from "puppeteer-core";
import { readdir, stat, readFile } from "node:fs/promises";
import { join } from "node:path";

const URL = process.argv[2] || "http://localhost:3000";
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ROOT = process.cwd();
const fail = (m) => {
  console.error("FAIL:", m);
  process.exitCode = 1;
};

// --- A) Kare bütçesi ---
{
  const base = join(ROOT, "public", "frames");
  let worst = "";
  let ok = true;
  for (const page of ["home", "projects", "about", "contact"]) {
    const dir = join(base, page);
    let total = 0;
    let max = 0;
    for (const f of await readdir(dir)) {
      if (!f.startsWith("frame-")) continue;
      const sz = (await stat(join(dir, f))).size;
      total += sz;
      max = Math.max(max, sz);
    }
    const totalMB = total / 1e6;
    const maxKB = max / 1e3;
    if (maxKB > 120 || (page === "home" && totalMB > 6)) {
      ok = false;
      worst += ` ${page}(${totalMB.toFixed(2)}MB,max ${maxKB.toFixed(0)}KB)`;
    }
  }
  ok
    ? console.log("OK A    kare bütçesi içinde (Home ≤6MB, kare ≤120KB)")
    : fail(`bütçe aşıldı:${worst}`);
}

// --- C) Tek SignalThread (kopya thread path yok) ---
{
  const grepThreadPath = async (dir) => {
    let hits = [];
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) hits = hits.concat(await grepThreadPath(p));
      else if (/\.(tsx?|jsx?)$/.test(e.name)) {
        const src = await readFile(p, "utf8");
        // SignalThread.tsx dışında ham <path ... pathLength sinyal-ipliği var mı?
        if (
          !p.endsWith("SignalThread.tsx") &&
          /pathLength=\{?1\}?/.test(src)
        )
          hits.push(p);
      }
    }
    return hits;
  };
  const dupes = await grepThreadPath(join(ROOT, "src"));
  dupes.length === 0
    ? console.log("OK C    tek SignalThread bileşeni (kopya yok)")
    : fail(`kopya thread path: ${dupes.join(", ")}`);
}

const ROUTES = [
  "/",
  "/projects",
  "/projects/meta-world",
  "/about",
  "/contact",
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
try {
  // --- B) SEO/a11y her route ---
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  for (const route of ROUTES) {
    await page.goto(`${URL}${route}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await new Promise((r) => setTimeout(r, 400));
    const q = await page.evaluate(() => {
      const desc = document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content");
      const canvases = [...document.querySelectorAll("canvas")];
      const imgs = [...document.querySelectorAll("img")];
      return {
        title: document.title,
        lang: document.documentElement.getAttribute("lang"),
        desc: desc || "",
        h1: document.querySelectorAll("h1").length,
        canvasAriaOk: canvases.every(
          (c) => c.getAttribute("aria-hidden") === "true",
        ),
        imgAltOk: imgs.every((i) => (i.getAttribute("alt") || "") !== ""),
        menuLabel: document
          .querySelector('button[aria-controls="site-menu"]')
          ?.getAttribute("aria-label"),
      };
    });
    const okRoute =
      /Talha/.test(q.title) &&
      q.lang === "en" &&
      q.desc.length > 10 &&
      q.h1 === 1 &&
      q.canvasAriaOk &&
      q.imgAltOk &&
      !!q.menuLabel;
    okRoute
      ? console.log(`OK B ${route}  seo/a11y`)
      : fail(`${route}: ${JSON.stringify(q)}`);
  }

  // --- D) Mobil viewport: taşma + hata yok ---
  const m = await browser.newPage();
  await m.setViewport({ width: 375, height: 760, isMobile: true });
  const merr = [];
  m.on("pageerror", (e) => merr.push(e.message));
  for (const route of ROUTES) {
    await m.goto(`${URL}${route}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await new Promise((r) => setTimeout(r, 500));
    const overflow = await m.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    if (overflow > 2) fail(`mobil yatay taşma ${route}: ${overflow}px`);
  }
  merr.length === 0
    ? console.log("OK D    mobil 375px: taşma yok, JS hatası yok")
    : fail("mobil JS hatası: " + merr.slice(0, 4).join(" | "));
} finally {
  await browser.close();
}
process.exit(process.exitCode || 0);
