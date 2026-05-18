#!/usr/bin/env node
/**
 * verify-projects.mjs — Projects sayfası + detay alt-sayfaları.
 * Kontroller:
 *  1) /projects: film hazır (canvas non-blank), 3 şerit SSR'da
 *  2) /projects: "Built." sahnesi scroll'da beliriyor
 *  3) /projects/<slug>: SSR'da ad + body + back link + <title>
 *  4) /projects/bilinmeyen: HTTP 404 (dynamicParams=false)
 *  5) Konsol/sayfa hatası yok
 */
import puppeteer from "puppeteer-core";

const URL = process.argv[2] || "http://localhost:3000";
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const fail = (m) => {
  console.error("FAIL:", m);
  process.exitCode = 1;
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  // (1) /projects film + şeritler
  await page.goto(`${URL}/projects`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  let nonBlank = false;
  for (let i = 0; i < 40; i++) {
    const s = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      if (!c?.getContext) return "x";
      const d = c
        .getContext("2d")
        .getImageData(c.width >> 1, c.height >> 1, 1, 1).data;
      return `${d[0]},${d[1]},${d[2]}`;
    });
    if (/[1-9]/.test(s)) {
      nonBlank = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  const stripNames = await page.evaluate(() =>
    [...document.querySelectorAll("a[href^='/projects/']")].map((a) =>
      a.textContent.replace(/\s+/g, " ").trim(),
    ),
  );
  nonBlank && stripNames.length >= 3
    ? console.log(`OK 1    /projects film + ${stripNames.length} şerit`)
    : fail(`projects: nonBlank=${nonBlank} strips=${stripNames.length}`);

  // (2) "Built." sahnesi scroll'da görünür
  const dist = await page.evaluate(async () => {
    const r = await fetch("/frames/projects/manifest.json");
    return (await r.json()).count * 16;
  });
  // built marker .84 (markers.ts) → parlak/çözülmüş bölgeden örnekle
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(dist * 0.92));
  await new Promise((r) => setTimeout(r, 900));
  const built = await page.evaluate(() => {
    const sp = [...document.querySelectorAll("span")].find(
      (s) => s.textContent.trim() === "Built.",
    );
    const box = sp?.closest("[aria-hidden]");
    return box
      ? {
          ah: box.getAttribute("aria-hidden"),
          op: parseFloat(getComputedStyle(box).opacity),
        }
      : null;
  });
  built && built.ah === "false" && built.op > 0.5
    ? console.log("OK 2    'Built.' sahnesi beliriyor")
    : fail(`built: ${JSON.stringify(built)}`);

  // (3) detay SSR
  const dRes = await page.goto(`${URL}/projects/placeholder-one`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  const dHtml = await dRes.text();
  const title = await page.title();
  dHtml.includes("[Placeholder Project One]") &&
  dHtml.includes("Short narrative") &&
  /Projects/.test(dHtml) &&
  /Placeholder Project One/.test(title)
    ? console.log(`OK 3    detay SSR + <title>="${title}"`)
    : fail(`detay SSR eksik (title="${title}")`);

  // (4) bilinmeyen slug 404
  const nf = await page.goto(`${URL}/projects/does-not-exist`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  nf.status() === 404
    ? console.log("OK 4    bilinmeyen slug → 404")
    : fail(`bilinmeyen slug status=${nf.status()}`);

  // (5) hatalar (404 sayfası kaynak 404'ü hariç)
  const real = errors.filter(
    (e) => !/Failed to load resource.*404/.test(e),
  );
  real.length === 0
    ? console.log("OK 5    konsol/sayfa hatası yok")
    : fail("hatalar:\n  " + real.slice(0, 6).join("\n  "));
} finally {
  await browser.close();
}
process.exit(process.exitCode || 0);
