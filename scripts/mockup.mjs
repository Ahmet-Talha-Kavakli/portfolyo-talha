#!/usr/bin/env node
/**
 * mockup.mjs — bir URL'in canlı ekran görüntüsünü alıp şık bir MacBook
 * çerçevesine (site paletinde koyu, mavi parıltılı zemin) yerleştirir.
 * Profesyonel proje kapak görseli üretir.
 *
 * Kullanım: node scripts/mockup.mjs <url> <çıktıAdı>
 *   node scripts/mockup.mjs https://replara.com replara
 * Çıktı: public/projects/<çıktıAdı>.png
 */
import puppeteer from "puppeteer-core";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const url = process.argv[2];
const outName = process.argv[3];
if (!url || !outName) {
  console.error("Kullanım: node scripts/mockup.mjs <url> <çıktıAdı>");
  process.exit(2);
}

const b = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--hide-scrollbars"],
});
try {
  // 1) Canlı siteden temiz bir desktop ekran görüntüsü.
  const shot = await b.newPage();
  await shot.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await shot.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 3500)); // animasyon/fontlar otursun
  const screenB64 = await shot.screenshot({ encoding: "base64", type: "png" });
  await shot.close();

  // 2) MacBook çerçevesi + site paletinde koyu zemin → kompozisyon.
  const mk = await b.newPage();
  await mk.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:1600px;height:1000px}
    .stage{width:1600px;height:1000px;display:grid;place-items:center;
      background:radial-gradient(120% 90% at 50% 30%,#0c1330 0%,#070b16 60%,#05070e 100%);
      position:relative;overflow:hidden;font-family:system-ui,sans-serif}
    .glow{position:absolute;width:1100px;height:620px;border-radius:50%;
      background:radial-gradient(closest-side,rgba(47,107,255,.30),rgba(47,107,255,0));
      filter:blur(40px);top:18%}
    .laptop{position:relative;width:1180px;z-index:2}
    .screen{background:#0b0e16;border:10px solid #14171f;border-radius:18px;
      padding:14px 14px 0;box-shadow:0 40px 90px rgba(0,0,0,.55),
      0 0 0 1px rgba(255,255,255,.04)}
    .screen img{display:block;width:100%;height:620px;object-fit:cover;
      object-position:top;border-radius:6px;background:#fff}
    .base{width:1320px;height:26px;margin:0 auto;
      background:linear-gradient(#1c2027,#0e1015);border-radius:0 0 16px 16px;
      box-shadow:0 24px 40px rgba(0,0,0,.5)}
    .notch{width:120px;height:14px;margin:8px auto 0;
      background:#0e1015;border-radius:0 0 10px 10px}
  </style></head><body>
    <div class="stage">
      <div class="glow"></div>
      <div class="laptop">
        <div class="screen"><img src="data:image/png;base64,${screenB64}"></div>
        <div class="base"></div><div class="notch"></div>
      </div>
    </div>
  </body></html>`;
  await mk.setContent(html, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 300));
  const out = join(ROOT, "public", "projects", `${outName}.png`);
  await mk.screenshot({ path: out, type: "png" });
  console.log(`✓ ${out}`);
} finally {
  await b.close();
}
