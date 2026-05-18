# Talha Portfolyo — Uygulama Planı

- **Tarih:** 2026-05-18
- **Onaylı spec:** [../specs/2026-05-18-talha-portfolio-design.md](../specs/2026-05-18-talha-portfolio-design.md)
- **Çalışma dizini:** `/Users/aysegulcadircioglu/Desktop/Meta-World/portfolyo/talha`
- **Durum:** Plan onayı bekliyor (kod yazılmadı)

## Hedef
Spec'te tanımlı 4 sayfalık (Home/Projects/About/Contact) sinematik portfolyo sitesini, desktop'ta scroll-scrub eden Apple-tipi kare motoru, mobilde autoplay fallback, karanlık→aydınlık anlatısı, gizli tam-ekran menü, Sora tipografisi ve Resend Contact formu ile kurmak.

## Mimari özet
- **Next.js (App Router)** — `/`, `/projects`, `/projects/[slug]`, `/about`, `/contact`. Her route SSR semantik HTML + metadata; canvas dekoratif/`aria-hidden`.
- **Frame engine** — tek paylaşılan `<ScrollFilm>` bileşeni: `<canvas>` + RAF kare çizimi + ScrollTrigger pin; Lenis ScrollTrigger'a scroller olarak bağlı. Desktop scrub, mobil `<video>` autoplay, reduced-motion statik poster.
- **İçerik** — tüm değişken veri `content/site.ts` tek dosyada (placeholder→gerçek tek noktadan).
- **Form** — `/api/contact` route handler → Resend; server validation + edge rate limit.
- **Varlıklar** — fal.ai sahne klipleri → `scripts/frames.mjs` (ffmpeg) → `public/frames/<page>/` bütçe dahilinde WebP.

## Tech stack
| Alan | Seçim |
|---|---|
| Paket yöneticisi | pnpm 11 (mevcut), Node 24 |
| Framework | Next.js App Router + TypeScript |
| Animasyon | gsap + @gsap/react, ScrollTrigger |
| Smooth scroll | lenis |
| Font | Sora (next/font/local veya fontsource) |
| Mail | resend |
| Test | vitest (saf mantık: kare matematiği, form doğrulama, rate limit) |
| Lint/format | eslint (next) + prettier |
| Dağıtım | Vercel |

## Dosya yapısı (oluştur = +, değiştir = ~)
```
portfolyo/talha/
+ package.json, tsconfig.json, next.config.mjs, .eslintrc, .prettierrc
+ .env.example                      # RESEND_API_KEY, CONTACT_TO_EMAIL, FAL_KEY
+ .gitignore
+ content/site.ts                   # projects[], about, socials, city/tz  (TEK içerik kaynağı)
+ src/app/layout.tsx                # Sora font, Lenis provider, <html lang="en">
+ src/app/globals.css               # renk tokenları, Sora, reduced-motion
+ src/app/page.tsx                  # Home
+ src/app/projects/page.tsx
+ src/app/projects/[slug]/page.tsx
+ src/app/about/page.tsx
+ src/app/contact/page.tsx
+ src/app/api/contact/route.ts      # Resend + validation + rate limit
+ src/lib/frameMath.ts              # progress→frame index, marker eşlemesi (saf)
+ src/lib/contact.ts               # zod şema + sanitize (saf)
+ src/lib/rateLimit.ts             # IP token-bucket (saf)
+ src/lib/markers.ts               # sahne marker oranları (HOME_MARKERS vb.)
+ src/components/ScrollFilm.tsx     # ÇEKİRDEK kare motoru bileşeni
+ src/components/SceneText.tsx      # marker'a senkron DOM overlay metin
+ src/components/LenisProvider.tsx  # Lenis + ScrollTrigger scroller bağlama
+ src/components/SignalThread.tsx   # paylaşılan imza ipliği (SVG)
+ src/components/Menu.tsx           # köşe buton + tam ekran menü (focus-trap, Esc)
+ src/components/ReducedMotion.tsx  # prefers-reduced-motion hook/guard
+ src/components/projects/ProjectStrip.tsx
+ scripts/frames.mjs                # ffmpeg: klip→WebP kare + bütçe kontrol
+ tests/frameMath.test.ts, tests/contact.test.ts, tests/rateLimit.test.ts
+ public/frames/<home|projects|about|contact>/  # placeholder sonra gerçek
```

---

## Faz 0 — İskelet ve temeller

- [ ] **0.1** Toolchain doğrula: `node -v` (≥24 bekleniyor), `pnpm -v` (≥11). `portfolyo/talha` içinde `git init`. `.gitignore`: `node_modules`, `.next`, `.env*`, **`public/frames/`** (kareler script ile yeniden üretilir / ayrı deploy edilir — git'e girmez, böylece LFS gereksiz). Commit: `chore: init repo`.
- [ ] **0.2** docs/ koru: `mv docs ../_docs_tmp` → `pnpm dlx create-next-app@latest . --ts --app --eslint --no-tailwind --src-dir --import-alias "@/*"` → `mv ../_docs_tmp docs`. Doğrula: `git status` docs/ sağlam + `pnpm dev` açılıyor. Commit.
- [ ] **0.3** Bağımlılıklar: `pnpm add gsap @gsap/react lenis resend zod @fontsource/sora` ; `pnpm add -D vitest @vitejs/plugin-react jsdom prettier`. `vitest.config.ts` ekle. Doğrula: `pnpm vitest run` (0 test) yeşil. Commit.
- [ ] **0.4** `.env.example` oluştur (RESEND_API_KEY, CONTACT_TO_EMAIL, FAL_KEY). `next.config.mjs`: images/webp, strict mode. Commit.
- [ ] **0.5** `globals.css`: CSS değişkenleri — `--bg-dark`, `--bg-light`, `--ink`, `--signal` (electric blue), `--thread`. `@media (prefers-reduced-motion: reduce)` global geçişleri kıs. Sora `@fontsource/sora` import + `--font-sora`. `layout.tsx`: `<html lang="en">`, body Sora. Doğrula: `pnpm dev`, sayfada Sora görünür. Commit: `feat: base styles + Sora`.
- [ ] **0.6** `content/site.ts`: tip + placeholder veri (3 proje, about 3 paragraf, socials Email/GitHub/LinkedIn/X, city `"Istanbul"`, tz `"Europe/Istanbul"`). `export type SiteContent`. Commit.

## Faz 1 — Kare motoru (çekirdek, placeholder karelerle)

- [ ] **1.1 (TDD)** `tests/frameMath.test.ts`: `progressToFrame(p, total)` (0→0, 1→total-1, clamp), `markerAt(p, markers)` (oran→aktif sahne adı). Çalıştır → KIRMIZI.
- [ ] **1.2** `src/lib/frameMath.ts` + `src/lib/markers.ts` (HOME_MARKERS: `{ name, at }` oranları: face .0, brain .15, cable .33, machine .60, white .80, land .96). Çalıştır → YEŞİL. Commit: `feat: frame math + scene markers`.
- [ ] **1.3** `SignalThread.tsx` (bağımsız, saf SVG — ScrollFilm'den ÖNCE): paylaşılan SVG path, ~1.5px, `--signal`→`--thread` renk geçişli; props: `progress`, `state: 'idle'|'draw'|'buffering'`. `buffering` = ince nabız. Doğrula: Storybook yok; geçici test sayfasında üç state görünür. Commit: `feat: signature signal thread`.
- [ ] **1.4** Placeholder kare seti: `scripts/frames.mjs` ile bir örnek mp4'ten (yoksa düz renk geçişli 60 kare üret) `public/frames/home/` doldur. Doğrula: dosyalar var. Commit.
- [ ] **1.5** `LenisProvider.tsx`: Lenis başlat, `ScrollTrigger.scrollerProxy` + `lenis.on('scroll', ScrollTrigger.update)`, RAF gsap.ticker'a bağlı, resize/orientation→`ScrollTrigger.refresh()`. **`ScrollTrigger.normalizeScroll` KULLANMA** (bu kurulumda çakışır — debug sırasında geri eklenmesin). `layout.tsx`'e sar. Doğrula: smooth scroll çalışıyor, konsol temiz. Commit: `feat: Lenis+ScrollTrigger wiring`.
- [ ] **1.6** `ScrollFilm.tsx` — props: `framesDir`, `frameCount`, `markers`, `children(overlay)`. (a) Preload: ilk 30 kare + ≥%50 decode olunca scroll kilidi açılır; yükleme ekranı (karanlık + nefes alan nokta + ince ilerleme). (b) Pinned section yüksekliği = `frameCount * k`; ScrollTrigger `onUpdate`→`progressToFrame`→canvas `drawImage`. (c) **Buffering mikro-duraklaması:** scroll talep edilen kare henüz decode edilmediyse o karede beklet + `SignalThread state="buffering"`, kare hazır olunca devam. Doğrula: Home placeholder'da scrub ediyor, ilk frame'de boş canvas yok, decode'u hızlı geçerken buffering tetikleniyor (yapay throttle ile test). Commit: `feat: ScrollFilm engine (desktop scrub + buffering)`.
- [ ] **1.7** `ReducedMotion.tsx` + mobil dal: `prefers-reduced-motion` → film yerine statik poster + içerik; pointer:coarse / dar viewport → `<video autoplay muted playsinline>` bir kez oynar, biter, içerik. `ScrollFilm` bu üç yolu içeride seçer. Doğrula: DevTools mobil emülasyon + reduce flag ile üç yol da çalışıyor. Commit: `feat: mobile autoplay + reduced-motion fallbacks`.
- [ ] **1.8** `SceneText.tsx`: aktif marker'a göre DOM overlay metin (gerçek `<h>/<p>`, canvas aria-hidden). Giriş/çıkış gsap opacity/translate. Doğrula: placeholder'da marker'larda yazı beliriyor. Commit.

## Faz 2 — Home sayfası

- [ ] **2.1** `app/page.tsx`: `<ScrollFilm framesDir="/frames/home" markers={HOME_MARKERS}>` + 6 sahne `SceneText` (S1 `scroll to begin`, S2 `THINK`, S3 `BUILD`+thread doğar, S4 `SHIP`, S5 isim+`Software · 3D · AI — I build the whole thing.`, S6 `keep scrolling`). Renk arka planı progress'e bağlı dark→light tween. Doğrula: placeholder ile sahne **sıra/marker hizası** doğrulanır; görsel anlatı (nokta→yüz, beyne zoom) gerçek kliplerle 7.2'de değerlendirilir. Commit: `feat: Home scroll-film`.
- [ ] **2.2** Film sonrası içerik: kısa kimlik (kelimeler scroll'la tek tek), 3 tipografik kapı satırı (Projects/About/Contact, hover'da thread), mini vitrin (content.projects[0] büyük görsel→/projects), sessiz footer (socials inline SVG, zemin hafif kararır). Doğrula: lighthouse'ta DOM metni mevcut. Commit.
- [ ] **2.3** Home `metadata` (title/description/OG). Commit.

## Faz 3 — Gizli menü

- [ ] **3.1** `Menu.tsx`: sağ üst sabit gerçek `<button aria-label="Open menu">` (iki kısa çizgi). Açılınca full-screen overlay, dev tipografiyle 4 link + tek kelime özet, hover kaydırma. Focus-trap, `Esc` kapatır, Tab döngüsü, `aria-expanded`. Doğrula: klavye-only test + her sayfada açılıyor + **ScrollFilm pin'liyken / Lenis aktifken** menü aç-`Esc`, menü açıkken Lenis scroll kilitli, kapanınca geri geliyor. Commit: `feat: hidden fullscreen menu`.

## Faz 4 — Projects

- [ ] **4.1** `app/projects/page.tsx`: kısa ScrollFilm (`/frames/projects` placeholder, ipliğin ızgaraya örülmesi → beyaz, başlık `Built.`). Commit.
- [ ] **4.2** `ProjectStrip.tsx` + listeleme: content.projects map; sol dev numara, orta görsel, sağ ad+cümle+tech etiketleri (Sora mono), hover thread. Doğrula: 3 placeholder şerit. Commit.
- [ ] **4.3** `app/projects/[slug]/page.tsx`: SSR, `generateStaticParams` content.slug'lardan, `generateMetadata`. İntro filmi yok, sadece thread geçişi; büyük görseller + anlatı + link. 404 bilinmeyen slug. Doğrula: `/projects/<slug>` doğrudan açılıyor + paylaşılınca metadata. Commit: `feat: project detail pages`.

## Faz 5 — About

- [ ] **5.1** `app/about/page.tsx`: kısa ScrollFilm (`/frames/about`, beyaza yakın→kısa yüz karesi→sabit portre). Commit.
- [ ] **5.2** İçerik: sol iri tipografi 3-4 paragraf (content.about), sağ dikey yetenek hattı (Software/Backend/Frontend/3D/AI, scroll'la dolan ince çizgi), altta stack listesi mono. `metadata`. Doğrula: scroll'da hatlar doluyor. Commit.

## Faz 6 — Contact + form backend

- [ ] **6.1 (TDD)** `tests/contact.test.ts`: zod şema (name ≤80, email format, message ≤2000, honeypot boş olmalı). `tests/rateLimit.test.ts`: token-bucket 5/10dk, taşınca red. KIRMIZI.
- [ ] **6.2** `src/lib/contact.ts` (zod + sanitize) + `src/lib/rateLimit.ts` (IP map token-bucket). YEŞİL. Commit: `feat: contact validation + rate limit`.
- [ ] **6.3** `app/api/contact/route.ts`: POST, rate limit (IP `x-forwarded-for`), zod parse, Resend `emails.send` → `CONTACT_TO_EMAIL`. Hata→4xx/5xx + mesaj. **Not:** in-memory token-bucket Vercel'de instance/cold-start başına sıfırlanır → best-effort spam yavaşlatma; kalıcı garanti gerekirse Vercel KV'ye geçilir (8.4'te değerlendir). Doğrula: `curl` ile geçerli/geçersiz/limit senaryoları. Commit.
- [ ] **6.4a** `app/contact/page.tsx` UI: kısa ScrollFilm (`/frames/contact`, iplik→yanıp sönen imleç, karanlık kalır) + sol konuşma-formu (3 soru sırayla beliren reveal mantığı, son satırda `Send →`) + sağ direkt satırlar (Email/GitHub/LinkedIn/X, hover thread) + köşe city + canlı yerel saat (content.tz). `metadata`. Doğrula: form reveal akışı + sahne + saat görsel doğru (gönderim henüz bağlı değil). Commit.
- [ ] **6.4b** Gönderim entegrasyonu: form → `/api/contact`; başarı→thread çizilir → `Message sent.`; hata→`Couldn't send — try email directly` + direkt satıra yönlendir. Doğrula: gerçek RESEND_API_KEY (.env.local) ile test maili düşüyor; hata yolu (anahtar bozuk + rate limit) doğru UI veriyor. Commit: `feat: Contact form submit`.

## Faz 7 — fal.ai pipeline + gerçek Home videosu

- [ ] **7.1** `scripts/frames.mjs` tamamla: girdi klip(ler) → ffmpeg WebP kareler, desktop ≤120KB/kare ~240, mobil ≤55KB/kare ~120, ek olarak mobil için tek hafif `home.mp4` + `poster.webp`. Çıktı **yalnız WebP** (AVIF fallback varsayılmaz — iOS15 tabanı için WebP zorunlu). Script sonunda **otomatik bütçe kontrolü:** toplam bayt + kare/bayt; desktop toplam decode >~6MB veya kare >120KB ise hata fırlatır (build'i durdurur), kare sayısını/kaliteyi düşürmeyi önerir. Doğrula: örnek klip üzerinde çalışır, aşımda script kırmızı, bütçe içinde yeşil. Commit: `feat: frame extraction pipeline`.
- [ ] **7.2** Talha fal.ai sahne kliplerini sağlar (face/brain/signal-cable/machine/white-burst). `scripts/frames.mjs` ile `public/frames/home/` (+ mobil video/poster) üretilir, placeholder'lar değiştirilir. Marker oranları gerçek kliple ince ayarlanır (`markers.ts`). Doğrula: Home filmi gerçek görüntüyle akıcı, sahneler metinlerle hizalı. Commit: `feat: real Home film assets`.

## Faz 8 — Cila ve doğrulama

- [ ] **8.1** Performans: Home intro toplam decode ≤~6MB, mobil ≤ bütçe; Lighthouse perf/a11y/SEO ölç, gerekirse kare sayısı/kalite düşür. Commit.
- [ ] **8.2** Erişilebilirlik + tutarlılık QA: klavye ile tüm site, reduced-motion yolu, ekran okuyucu sahne metinleri okuyor, canvas aria-hidden; **tüm sayfalar tek `SignalThread` bileşenini kullanıyor** (kopya/divergent implementasyon yok) doğrula. Düzelt. Commit.
- [ ] **8.3** Tarayıcı matrisi: son 2 Chrome/Safari/Firefox + iOS 15+ (Safari TP / cihaz). Düzelt. Commit.
- [ ] **8.4** Vercel dağıtımı: env değişkenleri, build, preview URL. README'ye "gerçek içerik = `content/site.ts`" notu + .env kurulumu. Commit: `docs: deploy + content guide`.

## Doğrulama stratejisi
- **Saf mantık (TDD):** frameMath, contact şema, rateLimit → vitest kırmızı→yeşil.
- **UI/animasyon:** her fazda `pnpm dev` ile manuel görsel kontrol + (mobil/reduce) DevTools emülasyonu; bütçe ve Lighthouse Faz 8'de.
- **Form:** curl + gerçek anahtarla canlı mail testi.
- Her görev sonunda commit; faz sonunda `pnpm build` + `pnpm vitest run` yeşil.

## Riskler / notlar
- ScrollTrigger+Lenis+pin kırılgan → 1.4/1.5 ayrı görev, resize refresh şart.
- fal.ai çıktı yaklaşık → metinler kare no değil **marker oranına** bağlı (10.5/10.6).
- Büyük kare seti → bütçe tavanı zorunlu (7.1), aşılırsa kare azalt.
- `public/frames` git boyutu → gerekirse Git LFS / .gitignore + ayrı asset adımı (0.1 notu).

## Açık (kullanıcının sağlayacağı, plan akışını durdurmaz)
- Faz 7.2: fal.ai sahne klipleri + yüz prompt'u.
- Faz 6.4: RESEND_API_KEY + alıcı e-posta.
- Faz 2/4/5: gerçek proje/bio/sosyal içerik (`content/site.ts`).
