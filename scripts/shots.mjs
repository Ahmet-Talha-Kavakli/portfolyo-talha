#!/usr/bin/env node
/**
 * shots.mjs — proje başına ÇOK çekimli, farklı cihaz/açılı mockup seti.
 *  - Replara: canlı siteden gerçek ekran görüntüleri (desktop hero,
 *    derin bölüm açılı, mobil telefonda) → vaka çalışması seti.
 *  - Meta-World: canlı site yok → DÜRÜST markalı feature kartları
 *    (sahte UI uydurmaz) farklı cihaz çerçevelerinde.
 *
 * Çıktı: public/projects/<slug>-1..N.png  (1600x1000, @2x)
 * Kullanım: node scripts/shots.mjs [replara|meta-world|all]
 */
import puppeteer from "puppeteer-core";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const which = process.argv[2] || "all";

const STAGE = (inner, extra = "") => `<!doctype html><html><head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
<style>
 *{margin:0;padding:0;box-sizing:border-box}
 html,body{width:1600px;height:1000px;font-family:'Sora',system-ui,sans-serif}
 .stage{width:1600px;height:1000px;display:grid;place-items:center;position:relative;overflow:hidden;
  background:radial-gradient(120% 90% at 50% 30%,#0c1330 0%,#070b16 60%,#05070e 100%)}
 .glow{position:absolute;width:1000px;height:560px;border-radius:50%;top:18%;
  background:radial-gradient(closest-side,rgba(47,107,255,.28),rgba(47,107,255,0));filter:blur(40px)}
 /* laptop */
 .laptop{position:relative;z-index:2;width:1180px}
 .laptop .screen{background:#0b0e16;border:10px solid #14171f;border-radius:18px;padding:14px 14px 0;
  box-shadow:0 40px 90px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.04)}
 .laptop .screen img{display:block;width:100%;height:618px;object-fit:cover;object-position:top;border-radius:6px;background:#fff}
 .laptop .base{width:1320px;height:24px;margin:0 auto;background:linear-gradient(#1c2027,#0e1015);border-radius:0 0 16px 16px;box-shadow:0 24px 40px rgba(0,0,0,.5)}
 .laptop .notch{width:120px;height:13px;margin:8px auto 0;background:#0e1015;border-radius:0 0 10px 10px}
 .angled{transform:perspective(2200px) rotateY(-19deg) rotateX(5deg) scale(.96);transform-origin:center}
 /* phone */
 .phone{position:relative;z-index:2;width:368px;height:756px;border-radius:54px;background:#0a0d15;border:12px solid #14171f;
  box-shadow:0 50px 110px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.05)}
 .phone .pscr{position:absolute;inset:12px;border-radius:42px;overflow:hidden;background:#070b16}
 .phone .pscr img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
 .phone .pnotch{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:118px;height:26px;background:#0a0d15;border-radius:0 0 16px 16px;z-index:3}
 .tilt{transform:perspective(2400px) rotateY(16deg) rotateX(4deg)}
 /* markalı ekran (Meta-World) */
 .brand{position:absolute;inset:12px;border-radius:42px;overflow:hidden;
  background:radial-gradient(120% 80% at 50% 22%,#0e1538 0%,#070b16 70%);
  display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 34px;text-align:center}
 .brand .dot{width:13px;height:13px;border-radius:50%;background:#2f6bff;box-shadow:0 0 24px 6px rgba(47,107,255,.6);margin-bottom:30px}
 .brand h2{color:#fff;font-weight:700;font-size:34px;letter-spacing:-.03em;white-space:nowrap}
 .brand p{color:rgba(255,255,255,.6);font-size:15px;margin-top:12px;line-height:1.5}
 .brand .ln{width:66%;height:2px;margin:30px 0;background:linear-gradient(90deg,rgba(47,107,255,0),#2f6bff,rgba(47,107,255,0))}
 .brand .chips{display:flex;gap:9px;flex-wrap:wrap;justify-content:center}
 .brand .chip{color:rgba(255,255,255,.7);font-size:11px;letter-spacing:.16em;text-transform:uppercase;border:1px solid rgba(255,255,255,.15);padding:6px 12px;border-radius:999px}
 .brandL{position:relative;width:100%;height:100%;background:radial-gradient(120% 90% at 50% 25%,#0e1538,#070b16 70%);
  display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;text-align:center}
 .brandL h2{font-size:64px;font-weight:700;letter-spacing:-.04em}
 .brandL p{color:rgba(255,255,255,.6);font-size:22px;margin-top:18px}
 .brandL .ln{width:340px;height:2px;margin:34px 0;background:linear-gradient(90deg,rgba(47,107,255,0),#2f6bff,rgba(47,107,255,0))}
 .brandL .chips{display:flex;gap:12px}
 .brandL .chip{font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.16);padding:8px 16px;border-radius:999px}
</style></head><body><div class="stage"><div class="glow"></div>${inner}</div>${extra}</body></html>`;

const laptop = (img, angled) => `<div class="laptop ${angled ? "angled" : ""}">
 <div class="screen"><img src="${img}"></div><div class="base"></div><div class="notch"></div></div>`;
const phoneImg = (img, tilt) => `<div class="phone ${tilt ? "tilt" : ""}">
 <div class="pnotch"></div><div class="pscr"><img src="${img}"></div></div>`;
const phoneBrand = (h, p, chips, tilt) => `<div class="phone ${tilt ? "tilt" : ""}">
 <div class="pnotch"></div><div class="brand"><div class="dot"></div><h2>${h}</h2><p>${p}</p>
 <div class="ln"></div><div class="chips">${chips.map((c) => `<span class="chip">${c}</span>`).join("")}</div></div></div>`;
const laptopBrand = (h, p, chips) => `<div class="laptop"><div class="screen">
 <div style="height:618px;border-radius:6px;overflow:hidden"><div class="brandL"><h2>${h}</h2><p>${p}</p>
 <div class="ln"></div><div class="chips">${chips.map((c) => `<span class="chip">${c}</span>`).join("")}</div></div></div>
 </div><div class="base"></div><div class="notch"></div></div>`;

const b = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--hide-scrollbars"],
});

async function capture(url, vp, scrollY = 0) {
  const pg = await b.newPage();
  await pg.setViewport({ ...vp, deviceScaleFactor: 2 });
  try {
    await pg.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  } catch {
    /* networkidle yerine domcontentloaded; analytics takılırsa yine devam */
  }
  await new Promise((r) => setTimeout(r, 8500)); // preloader/animasyon bitsin
  if (scrollY) {
    await pg.evaluate((y) => window.scrollTo(0, y), scrollY);
    await new Promise((r) => setTimeout(r, 1500));
  }
  const d = await pg.screenshot({ encoding: "base64", type: "png" });
  await pg.close();
  return `data:image/png;base64,${d}`;
}

async function render(inner, outName) {
  const pg = await b.newPage();
  await pg.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
  await pg.setContent(STAGE(inner), { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 700));
  const out = join(ROOT, "public", "projects", `${outName}.png`);
  await pg.screenshot({ path: out, type: "png" });
  await pg.close();
  console.log(`✓ ${outName}.png`);
}

try {
  if (which === "replara" || which === "all") {
    const desk = { width: 1440, height: 900 };
    const hero = await capture("https://replara.com", desk, 0);
    const deep = await capture("https://replara.com", desk, 1100);
    const mob = await capture("https://replara.com", {
      width: 414,
      height: 896,
      isMobile: true,
    });
    await render(laptop(hero, false), "replara-1");
    await render(laptop(deep, true), "replara-2");
    await render(phoneImg(mob, true), "replara-3");
    await render(laptop(deep, false), "replara-4");
  }
  if (which === "meta-world" || which === "all") {
    await render(
      phoneBrand(
        "Meta-World",
        "AI fitness coach<br>voice · real-time 3D",
        ["AI", "3D", "Mobile"],
        false,
      ),
      "meta-world-1",
    );
    await render(
      phoneBrand(
        "Voice coach",
        "A trainer that talks back —<br>real-time, adaptive",
        ["ElevenLabs", "AI"],
        true,
      ),
      "meta-world-2",
    );
    await render(
      phoneBrand(
        "Live 3D",
        "Real-time 3D characters<br>react as you move",
        ["Three.js", "WebGL"],
        true,
      ),
      "meta-world-3",
    );
    await render(
      laptopBrand(
        "One platform",
        "Mobile · backend · dashboard · web — built end to end",
        ["Monorepo", "TypeScript", "Node"],
      ),
      "meta-world-4",
    );
  }
} finally {
  await b.close();
}
