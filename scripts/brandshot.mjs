#!/usr/bin/env node
/**
 * brandshot.mjs — canlı sitesi olmayan proje için DÜRÜST markalı telefon
 * mockup'ı (sahte UI ekranı uydurmaz; şık bir tanıtım/başlık kartı).
 * Replara mockup'ıyla aynı sahne/ölçü → şeritler tutarlı görünür.
 *
 * Kullanım: node scripts/brandshot.mjs
 * Çıktı: public/projects/meta-world.png
 */
import puppeteer from "puppeteer-core";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const b = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--hide-scrollbars"],
});
try {
  const p = await b.newPage();
  await p.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
  const html = `<!doctype html><html><head><meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:1600px;height:1000px;font-family:'Sora',system-ui,sans-serif}
    .stage{width:1600px;height:1000px;display:grid;place-items:center;position:relative;overflow:hidden;
      background:radial-gradient(120% 90% at 50% 30%,#0c1330 0%,#070b16 60%,#05070e 100%)}
    .glow{position:absolute;width:900px;height:560px;border-radius:50%;top:20%;
      background:radial-gradient(closest-side,rgba(47,107,255,.30),rgba(47,107,255,0));filter:blur(40px)}
    .phone{position:relative;z-index:2;width:360px;height:740px;border-radius:54px;
      background:#0a0d15;border:12px solid #14171f;
      box-shadow:0 50px 110px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.05)}
    .scr{position:absolute;inset:12px;border-radius:42px;overflow:hidden;
      background:radial-gradient(120% 80% at 50% 22%,#0e1538 0%,#070b16 70%);
      display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 34px;text-align:center}
    .dot{width:14px;height:14px;border-radius:50%;background:#2f6bff;
      box-shadow:0 0 26px 6px rgba(47,107,255,.65);margin-bottom:34px}
    .name{color:#fff;font-weight:700;font-size:40px;letter-spacing:-.03em;white-space:nowrap}
    .sub{color:rgba(255,255,255,.62);font-size:16px;margin-top:14px;line-height:1.5}
    .line{width:70%;height:2px;margin:34px 0;
      background:linear-gradient(90deg,rgba(47,107,255,0),#2f6bff,rgba(47,107,255,0))}
    .chips{display:flex;gap:10px}
    .chip{color:rgba(255,255,255,.7);font-size:12px;letter-spacing:.18em;
      text-transform:uppercase;border:1px solid rgba(255,255,255,.15);
      padding:7px 13px;border-radius:999px}
    .notch{position:absolute;top:14px;left:50%;transform:translateX(-50%);
      width:120px;height:26px;background:#0a0d15;border-radius:0 0 16px 16px;z-index:3}
  </style></head><body>
    <div class="stage"><div class="glow"></div>
      <div class="phone"><div class="notch"></div>
        <div class="scr">
          <div class="dot"></div>
          <div class="name">Meta-World</div>
          <div class="sub">AI fitness coach<br>voice · real-time 3D · end&nbsp;to&nbsp;end</div>
          <div class="line"></div>
          <div class="chips"><span class="chip">AI</span><span class="chip">3D</span><span class="chip">Mobile</span></div>
        </div>
      </div>
    </div>
  </body></html>`;
  await p.setContent(html, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800)); // font yüklensin
  const out = join(ROOT, "public", "projects", "meta-world.png");
  await p.screenshot({ path: out, type: "png" });
  console.log(`✓ ${out}`);
} finally {
  await b.close();
}
