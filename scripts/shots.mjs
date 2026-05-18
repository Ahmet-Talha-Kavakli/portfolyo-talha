#!/usr/bin/env node
/**
 * shots.mjs — proje başına ÇOK çekimli mockup seti. Cihaza SIKI kırpılır
 * (dev boş siyah alan YOK — sadece cihaz + ince zarif kenar boşluğu).
 *  - Replara: canlı siteden gerçek ekran görüntüleri (laptop/açılı/mobil).
 *  - Meta-World: canlı yok → dürüst markalı kartlar (sahte UI uydurmaz).
 *
 * Çıktı: public/projects/<slug>-1..4.png  (cihaza göre boyut, @2x)
 * Kullanım: node scripts/shots.mjs [replara|meta-world|all]
 */
import puppeteer from "puppeteer-core";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const which = process.argv[2] || "all";

const DOC = (inner) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
<style>
 *{margin:0;padding:0;box-sizing:border-box}
 body{font-family:'Sora',system-ui,sans-serif;display:inline-block}
 /* SIKI kart: cihazın tam çevresi, ince kenar boşluğu, hafif parıltı */
 .card{padding:64px;display:inline-block;
  background:radial-gradient(120% 120% at 50% 35%,#0f1838 0%,#0a0f20 55%,#070b16 100%)}
 .laptop{width:1180px}
 .laptop .screen{background:#0b0e16;border:10px solid #14171f;border-radius:18px;padding:13px 13px 0;
  box-shadow:0 36px 80px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.04)}
 .laptop .screen img{display:block;width:100%;height:660px;object-fit:cover;object-position:top;border-radius:6px;background:#fff}
 .laptop .base{width:1300px;margin-left:-60px;height:22px;background:linear-gradient(#1c2027,#0e1015);border-radius:0 0 16px 16px;box-shadow:0 22px 36px rgba(0,0,0,.5)}
 .laptop .notch{width:120px;height:12px;margin:7px auto 0;background:#0e1015;border-radius:0 0 10px 10px}
 .angled{transform:perspective(2400px) rotateY(-17deg) rotateX(5deg)}
 .phone{width:392px;height:806px;border-radius:56px;background:#0a0d15;border:13px solid #14171f;position:relative;
  box-shadow:0 44px 90px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.05)}
 .phone .pscr{position:absolute;inset:13px;border-radius:43px;overflow:hidden;background:#070b16}
 .phone .pscr img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
 .phone .pnotch{position:absolute;top:13px;left:50%;transform:translateX(-50%);width:120px;height:27px;background:#0a0d15;border-radius:0 0 17px 17px;z-index:3}
 .brand{position:absolute;inset:13px;border-radius:43px;
  background:radial-gradient(120% 80% at 50% 24%,#10193f 0%,#070b16 70%);
  display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 40px;text-align:center}
 .brand .dot{width:14px;height:14px;border-radius:50%;background:#2f6bff;box-shadow:0 0 26px 7px rgba(47,107,255,.6);margin-bottom:34px}
 .brand h2{color:#fff;font-weight:700;font-size:38px;letter-spacing:-.03em;white-space:nowrap}
 .brand p{color:rgba(255,255,255,.62);font-size:17px;margin-top:14px;line-height:1.5}
 .brand .ln{width:64%;height:2px;margin:34px 0;background:linear-gradient(90deg,rgba(47,107,255,0),#2f6bff,rgba(47,107,255,0))}
 .brand .chips{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
 .brand .chip{color:rgba(255,255,255,.72);font-size:12px;letter-spacing:.16em;text-transform:uppercase;border:1px solid rgba(255,255,255,.16);padding:7px 13px;border-radius:999px}
 .brandL{width:100%;height:660px;border-radius:6px;overflow:hidden;
  background:radial-gradient(120% 90% at 50% 28%,#10193f,#070b16 72%);
  display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;text-align:center}
 .brandL h2{font-size:70px;font-weight:700;letter-spacing:-.04em}
 .brandL p{color:rgba(255,255,255,.62);font-size:24px;margin-top:20px}
 .brandL .ln{width:360px;height:2px;margin:38px 0;background:linear-gradient(90deg,rgba(47,107,255,0),#2f6bff,rgba(47,107,255,0))}
 .brandL .chips{display:flex;gap:13px}
 .brandL .chip{font-size:14px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.18);padding:9px 17px;border-radius:999px}
</style></head><body><div class="card" id="card">${inner}</div></body></html>`;

const laptop = (img, angled) => `<div class="laptop ${angled ? "angled" : ""}">
 <div class="screen"><img src="${img}"></div><div class="base"></div><div class="notch"></div></div>`;
const phoneImg = (img) => `<div class="phone">
 <div class="pnotch"></div><div class="pscr"><img src="${img}"></div></div>`;
const phoneBrand = (h, p, chips) => `<div class="phone">
 <div class="pnotch"></div><div class="brand"><div class="dot"></div><h2>${h}</h2><p>${p}</p>
 <div class="ln"></div><div class="chips">${chips.map((c) => `<span class="chip">${c}</span>`).join("")}</div></div></div>`;
const laptopBrand = (h, p, chips) => `<div class="laptop"><div class="screen">
 <div class="brandL"><h2>${h}</h2><p>${p}</p><div class="ln"></div>
 <div class="chips">${chips.map((c) => `<span class="chip">${c}</span>`).join("")}</div></div>
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
    /* analytics takılsa da devam */
  }
  await new Promise((r) => setTimeout(r, 8500));
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
  await pg.setViewport({ width: 2000, height: 1400, deviceScaleFactor: 2 });
  await pg.setContent(DOC(inner), { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 700));
  // Sadece kartı (cihaz + ince boşluk) çek — boş sahne YOK.
  const el = await pg.$("#card");
  const out = join(ROOT, "public", "projects", `${outName}.png`);
  await el.screenshot({ path: out, type: "png" });
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
    await render(phoneImg(mob), "replara-3");
    await render(laptop(deep, false), "replara-4");
  }
  if (which === "meta-world" || which === "all") {
    await render(
      phoneBrand("Meta-World", "AI fitness coach<br>voice · real-time 3D", [
        "AI",
        "3D",
        "Mobile",
      ]),
      "meta-world-1",
    );
    await render(
      phoneBrand(
        "Voice coach",
        "A trainer that talks back —<br>real-time, adaptive",
        ["ElevenLabs", "AI"],
      ),
      "meta-world-2",
    );
    await render(
      phoneBrand("Live 3D", "Real-time 3D characters<br>react as you move", [
        "Three.js",
        "WebGL",
      ]),
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
