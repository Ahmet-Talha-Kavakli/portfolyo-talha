# Talha — Portfolyo

Sinematik, scroll-film tabanlı kişisel-marka portfolyo sitesi.
Tasarım/plan: [docs/superpowers/specs](docs/superpowers/specs) · [docs/superpowers/plans](docs/superpowers/plans).

Stack: Next.js (App Router) · GSAP/ScrollTrigger · Lenis · Sora · Resend.

## Geliştirme

```bash
pnpm install
cp .env.example .env.local   # değerleri doldur (aşağı bak)
pnpm dev                     # http://localhost:3000
```

`predev`/`prebuild` otomatik placeholder kareleri üretir (bkz. "Kareler").

Komutlar: `pnpm test:run` (unit) · `pnpm gen:frames` (kareler) ·
`node scripts/verify-*.mjs http://localhost:3000` (film/menu/projects/about/contact/quality tarayıcı doğrulamaları — kurulu Chrome gerekir).

## İçerik (tek kaynak)

**Tüm değişken içerik** `content/site.ts` içinde: isim, kimlik cümlesi,
about paragrafları, yetenekler, stack, projeler (slug/ad/cümle/tech/görsel/
galeri/anlatı/link), sosyal linkler, şehir, timezone. Placeholder'ı gerçeğiyle
değiştirmek = yalnız bu dosyayı düzenlemek. Proje görselleri `public/`'e konur,
yol `content/site.ts`'ten referanslanır.

## Ortam değişkenleri (`.env.local` — git'e GİRMEZ)

| Değişken | Ne için |
|---|---|
| `RESEND_API_KEY` | Contact formu maili (resend.com) |
| `CONTACT_TO_EMAIL` | Formun düşeceği **gerçek** alıcı adres |
| `CONTACT_FROM_EMAIL` | Resend "from" (doğrulanmış domain ya da `onboarding@resend.dev`) |
| `FAL_KEY` | Yalnız `scripts/frames.mjs` gerçek pipeline (Faz 7); tarayıcıya gitmez |

Not: `onboarding@resend.dev` test modunda yalnız Resend hesabı sahibinin
adresine gönderir. Kendi domainini doğrulayıp `CONTACT_FROM_EMAIL`'i güncelle.
`CONTACT_TO_EMAIL` placeholder kalırsa form "Couldn't send" gösterir (doğru
davranış).

## Kareler (scroll-film)

`public/frames/` **git'e girmez** (.gitignore). `predev`/`prebuild`
`pnpm gen:frames` ile düz-renk **placeholder** kareler üretir (~1MB toplam,
bütçe içinde) — yani local ve Vercel build'inde kareler otomatik oluşur.

**Gerçek video (Faz 7, beklemede):** fal.ai sahne klipleri → ffmpeg → WebP
kareler `scripts/frames.mjs` ile. Gerçek manifest `placeholder:false` taşır;
`gen:frames` o sayfayı **korur** (üzerine yazmaz). Gerçek kareler deploy'a
girmeli: ya `.gitignore`'dan `public/frames/<page>` çıkarılır ya da CI'da
üretilir (Faz 7'de netleşecek).

## Vercel'e deploy

1. Repo'yu Vercel'e bağla (framework: Next.js — otomatik algılanır).
2. **Environment Variables** ekle: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`,
   `CONTACT_FROM_EMAIL`.
3. Build komutu `vercel.json`'da: `pnpm gen:frames && next build`
   (kareler her build'de üretilir — `public/frames` git'te olmadığı için şart).
4. Deploy. Preview URL üzerinden `verify-*` scriptleri çalıştırılabilir.

## Bekleyen (kullanıcı aksiyonu)

- `CONTACT_TO_EMAIL` → gerçek adres (canlı mail testi için).
- Faz 7: `_source-assets/` yüz fotoğrafları + fal.ai klipleri + `ffmpeg`
  (`brew install ffmpeg`) → gerçek Home/diğer videolar.
