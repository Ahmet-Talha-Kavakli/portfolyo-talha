# Talha — Kişisel Marka / Showcase Portfolyo Sitesi · Tasarım Dokümanı

- **Tarih:** 2026-05-18
- **Konum:** `portfolyo/talha/`
- **Durum:** Tasarım onayı bekliyor (kod yazılmadı)
- **Dil:** Site içeriği **İngilizce**; bu doküman Türkçe (onay kolaylığı için)

---

## 1. Amaç ve Hedef

Talha için **kişisel marka / showcase** sitesi. Amaç iş başvurusu veya freelance satış değil; **deneysel, sanatsal, akılda kalıcı bir dijital imza** bırakmak. Başarı ölçütü: ziyaretçi siteyi gezdiğinde "bu sıradan/AI şablonu bir site değil, bunu yapan kişi gerçekten yetenekli" hissine kapılmalı.

**Talha kimdir:** Software · 3D · AI · backend · frontend — uçtan uca her şeyi yapan bir builder. Anlatının çekirdeği bu: *fikir zihinde doğar → sinir sinyaline döner → kabloyla makineye akar → ekranda canlanır.*

---

## 2. Kapsam

**Dahil:**
- 4 ayrı sayfa (one-page DEĞİL): `Home`, `Projects`, `About`, `Contact`
- Her sayfada kendine ait scroll-video intro + altında içerik
- Gizli (köşe butonu → tam ekran tipografik) gezinme
- Frame-sequence scrubbing motoru (Apple yöntemi)
- Karanlık→aydınlık renk anlatısı
- Contact form (Resend + Next.js API route ile gerçek mail gönderimi)
- fal.ai video → kare üretim pipeline'ı

**Hariç (sonraya / placeholder):**
- Gerçek proje isimleri/görselleri, bio metni, sosyal linkler — placeholder ile kurulur, Talha hazır oldukça gerçeği konur
- Diğer sayfaların videoları için fal.ai gerçek üretimleri (önce Home)
- Blog, çok dillilik, CMS

---

## 3. Teknik Stack

| Katman | Seçim | Gerekçe |
|---|---|---|
| Framework | **Next.js (App Router)** | Çok sayfalı yapı, routing, SEO, performans |
| Scroll | **Lenis** | Yumuşak (inertial) scroll |
| Animasyon | **GSAP + ScrollTrigger** | Scroll'a kilitli sahne ilerlemesi |
| Font | **Sora** (tüm site, zorunlu) | Marka tipografisi; başlık tight, gövde havadar |
| Scroll-video | **Frame-sequence scrubbing** | mp4 scrub takılır; kareler iPhone dahil akıcı |
| Form gönderimi | **Resend + Next.js API route** | Mesaj doğrudan maile; kendi altyapı, görünmez |
| Görsel | fal.ai / gerçek görseller | Stok/emoji yok |

**API anahtarları** (fal.ai, Resend) koda yazılmaz; `.env` dosyasında tutulur.

---

## 4. Genel İskelet (onaylandı — Bölüm A)

### Gezinme — gizli menü
Sağ üst köşede minik sabit buton (üç çizgi değil, ince "index" işareti: iki kısa çizgi). Tıklayınca tüm ekran yavaşça kararır, dev tipografiyle dört kelime gelir: **Home / Projects / About / Contact**. Üstüne gelince kelime hafif kayar, yanında tek kelimelik özet belirir (örn. "Projects → built"). Video oynarken bile her an açılır.

### Renk anlatısı
Her sayfa **karanlıkta başlar** (derin lacivert-siyah, parlayan ince sinyal iplikleri), scroll ilerledikçe **aydınlanır** (kâğıt beyazı, ince gri çizgiler). Scroll = "sistemi açmak". Home'da en dramatik; diğer sayfalarda aynı dil, daha sakin. Contact istisna: karanlık kalır (kapanış tonu).

### Tipografi
Her şey **Sora**. Başlıklar çok iri + sıkışık tracking; gövde havadar; etiket/sayılar Sora'nın mono hissi veren ince kullanımı. **Emoji yok**; ikonlar **inline SVG**, çizgisel, ince.

### "AI şablonu olmama" 4 kuralı
1. Hazır component kiti görüntüsü yok — her bölüm kendine özel (asimetri, ızgara kırılmaları).
2. "fade-in" klişesi yok — scroll'a kilitli gerçek sahne ilerlemesi (kareler).
3. Tek imza detay her sayfada tekrar eder: **parlayan sinyal ipliği** (marka hissi).
4. Stok his yok: görseller fal.ai/gerçek, boşluk ve tipografi cesur.

### Teknik kalp — kare motoru
fal.ai videosu → `ffmpeg` ile ~240 kareye bölünür → optimize edilir → tarayıcı önden yükler → scroll pozisyonuna karşılık gelen kare `<canvas>`'a çizilir. Belirli karelerde (örn. kare 90) yazı/efekt tetiklenir. iPhone dahil her cihazda akıcı.

---

## 5. Home — Scroll-Filmi (onaylandı — Bölüm B)

Sayfa açılınca tam ekran karanlık, scroll çubuğu yok. ~240 kare, 6 sahne. Sahne sınırlarındaki kare numaraları yaklaşıktır (üretimde ince ayar).

| Sahne | Kare | Renk | Olay | Ekrandaki yazı |
|---|---|---|---|---|
| 1 — Açılış | 0–30 | Zifiri siyah | Nefes alan tek nokta; scroll'la nokta büyür, **Talha'nın yüzü** karanlıktan belirir | `scroll to begin` (sönük) |
| 2 — Beyne giriş | 30–80 | Lacivert-mor | Yüze zoom → beyne dalış; sinir hücreleri parlayan iplik, sinyaller çakar | `THINK` (dev, sönük, kenarda) |
| 3 — Sinyal→kablo | 80–140 | Elektrik mavisi | Sinyaller tek parlak **kabloya** dönüşür, içeri uzar; **imza ipliği doğar** | `BUILD` |
| 4 — Makineye varış | 140–185 | Mavi→ilk ışık | Kablo bilgisayara/ekrana girer, kıvılcımla yanar; arka plan aydınlanmaya başlar | `SHIP` |
| 5 — Sistem açıldı | 185–230 | Hızla beyaza | Ekran yumuşakça beyaza patlar; sakin iri tipografi belirir | bkz. aşağıda |
| 6 — Yere iniş | 230–240 | Tam beyaz, sabit | Film kilidi açılır, normal sayfaya yumuşak geçiş | `keep scrolling` (sönük) |

**Sahne 5 metni (İngilizce, sitede):**
> **Talha**
> *Software · 3D · AI — I build the whole thing.*

İmza ipliği bu noktada ince gri çizgi olarak yazının altına yerleşir.

### Film bittikten sonra Home (aydınlık bölüm)
1. **Kısa kimlik:** 2 cümle, iri Sora; kelimeler scroll'la tek tek belirir (ritimle anlatır).
2. **Üç kapı:** Projects / About / Contact'a giden 3 büyük tipografik **satır** (kart değil); hover'da imza ipliği o satırın altında akar.
3. **Mini vitrin:** En güçlü **tek** projenin büyük görseli + adı; tıklayınca Projects'e gider.
4. **Sessiz footer:** İsim, yıl, GitHub/LinkedIn/mail (ince SVG); zemin hafif kararır (döngü hissi).

---

## 6. Projects · About · Contact (onaylandı — Bölüm C, Contact revize)

### Projects
- **Mini film (~60 kare):** İmza ipliği yalnız akar, çoğalır, bir **ızgaraya** örülür → beyaza açılır. Başlık: **Built.**
- **İçerik:** Proje kartı değil — her proje tam genişlikte **şerit**: solda dev numara (01, 02…), ortada büyük görsel, sağda ad + tek cümle + teknoloji etiketleri (Sora mono). Hover'da görsel canlanır, imza ipliği şeridin altından geçer.
- Tıklayınca proje **detay alt-sayfası:** büyük görseller + kısa anlatı + link.

### About
- **Mini film (~50 kare):** Home'un tersi — beyaza yakın başlar, kısa an Talha'nın yüzü (fal.ai'den sakin kare) belirir, sabit aydınlık portreye oturur ("insana iniş").
- **İçerik:** Uzun CV değil, anlatı. Sol: iri tipografiyle 3-4 kısa paragraf (kim / nasıl çalışıyor / neyle anılmak istiyor). Sağ: dikey **yetenek hattı** — Software / Backend / Frontend / 3D / AI; her biri scroll'la dolan ince çizgi (yüzde değil ritim). Altta: araç/stack listesi, mono.

### Contact (form + direkt linkler — revize)
- **Mini film (~40 kare):** İmza ipliği ortaya gelir, yanıp sönen **imleç** olur ("hat açık"). Karanlık kalır (tek "gece biten" sayfa).
- **Sol — Form (kutu değil, konuşma gibi):** Kutucuk yok; sorular tek tek, büyük Sora, alttan ince çizgili satır. Biri dolunca sonraki belirir:
  1. `What's your name?`
  2. `How do I reach you?` (e-posta)
  3. `What are we building?` (kısa mesaj)
  Buton yok; son satır bitince altta **`Send →`** belirir. Basınca imza ipliği ekranı boydan boya çizer, imleç "uçar", `Message sent.` yazısına döner.
- **Sağ — Direkt yol:** Büyük tıklanır satırlar: **Email · GitHub · LinkedIn · X**; hover'da imza ipliği çizer.
- Köşede sönük: şehir + canlı yerel saat.
- **Gönderim:** Form verisi Next.js API route'a gider, **Resend** ile Talha'nın mailine düşer. Spam/doğrulama: basit honeypot + e-posta format kontrolü.

---

## 7. fal.ai Video Pipeline

1. Talha fal.ai erişimini + yüz fotoğrafını sağlar (mevcut).
2. Konsept prompt birlikte yazılır: yüz karanlıktan belirir → beyne zoom → sinir sinyalleri → kablo → bilgisayar → sistem açılır.
3. fal.ai mp4 üretir (Home için öncelikli; diğer sayfalar sonra).
4. `ffmpeg` ile ~240 JPG/WebP kareye bölünür, boyut optimize edilir (responsive: mobil için daha düşük çözünürlük seti).
5. Kareler `public/` altında sıralı isimle; motor scroll oranına göre `<canvas>`'a çizer.
6. Gerçek video gelene kadar geliştirme placeholder kare setiyle ilerleyebilir (mimari videoya takılmaz).

---

## 8. Açık Kalemler (placeholder ile kurulur, sonra gerçeği)

- Gerçek proje isimleri / görselleri / teknoloji etiketleri (Projects)
- About bio paragrafları, şehir bilgisi
- Sosyal linkler: Email, GitHub, LinkedIn, X (gerçek adresler)
- fal.ai final prompt + üretilen video (Home öncelikli)
- Resend API anahtarı + alıcı e-posta
- Sahne kare numaralarının üretimde ince ayarı

---

## 10. Mühendislik Sağlamlaştırması (bağımsız spec review sonrası)

Aşağıdaki kararlar varsayılan olarak kabul edilir (kullanıcı onayı bekleyen tek madde 10.1'de işaretli).

### 10.1 Mobil/dokunmatik scroll-film davranışı — KARAR VERİLDİ
Mobilde **scrub YOK** (Seçenek 2). Telefonda film, görünür olunca **bir kez otomatik oynayan hafif video** olarak gösterilir (poster karesiyle), bittiğinde sayfa içeriğine yumuşak geçer. Canvas/kare motoru ve touch-drag eşlemesi mobilde devre dışı; bu, garantili pürüzsüzlük + düşük varlık ağırlığı sağlar. Scroll-scrub büyüsü yalnız desktop/işaretçili cihazlara özgüdür.

### 10.2 Varlık bütçesi (sabit tavan)
- Desktop kare: WebP, **≤120 KB/kare**, hedef ~240 kare → Home intro toplam decode ≤ ~6 MB.
- Mobil kare: WebP, **≤55 KB/kare**, ~120 kare seti.
- ffmpeg bu hedeflere göre kare sayısı/kalite ayarlar; aşılırsa kare sayısı düşürülür.

### 10.3 Yükleme durumu ve preload
- Marka tutarlı **loading ekranı** (karanlık zemin, nefes alan nokta + ince ilerleme).
- Scroll **kilidi açılır:** ilk 30 kare + toplam karelerin ≥%50'si decode edildiğinde.
- Sonraki kareler tembel (lazy) yüklenir; scroll preload'un önüne geçerse ipliğe "buffering" mikro-duraklaması.

### 10.4 Erişilebilirlik ve reduced-motion
- `prefers-reduced-motion: reduce`: film atlanır → **statik hero karesi + içerik** doğrudan gösterilir.
- Tüm sahne metinleri **DOM'da gerçek metin** (canvas'a gömülü DEĞİL); canvas `aria-hidden`.
- Gizli menü: köşe butonu gerçek `<button>`, tam ekran menü focus-trap, `Esc` ile kapanır, klavye ile gezilebilir, ARIA etiketli.

### 10.5 Metin = DOM overlay (video metin taşımaz)
fal.ai videosu/kareleri **okunabilir yazı içermez**. THINK/BUILD/SHIP, isim, kimlik cümlesi vb. tümü canvas üstüne **HTML overlay**; kare indeksine değil **ilerleme oranına / adlandırılmış marker'lara** senkronize (örn. `scene3.enter` ≈ %33). Bu, fal.ai'nin kesin kare üretememesini tolere eder.

### 10.6 fal.ai üretim stratejisi
Tek sürekli video yerine **sahne başına kısa klip** üretilir (face-reveal, brain, signal→cable, machine, white-burst). Engine klipleri birleştirip kareye böler; sahne sınırları kayarsa marker oranları ayarlanır. Video **yaklaşıktır**, bu kabul edilmiştir.

### 10.7 Lenis + ScrollTrigger + pinned canvas
Bilinen kırılgan üçlü. Karar: **Lenis'i ScrollTrigger'a scroller olarak bağla** (scrollerProxy + `ScrollTrigger.refresh()` on resize/orientation). normalizeScroll bu kurulumda kullanılmaz. Bu, planlamada ayrı bir görev olarak ele alınır.

### 10.8 Routing ve SEO
- Sayfalar: `/` (Home), `/projects`, `/about`, `/contact`. Proje detayı: `/projects/[slug]` — SSR, doğrudan linklenebilir, **intro filmi yok** (hız), sadece imza ipliği geçişi.
- Her route'ta gerçek **semantik HTML içerik + metadata** (title/description/OG). Film dekoratif, `aria-hidden`. Canvas asla tek içerik kaynağı değil.

### 10.9 Form sağlamlaştırma
- Sunucu tarafı doğrulama + alan uzunluk limitleri (name ≤80, email format, message ≤2000).
- Honeypot + basit **IP/edge rate limit** (örn. 5 istek/10 dk).
- Hata UI'si tanımlı: Resend hata verirse `Couldn't send — try email directly` + direkt mail satırına yönlendirme.

### 10.10 İçerik şeması (placeholder→gerçek ayrımı)
Tüm değişken içerik tek kaynak dosyada: `content/site.ts` (veya `.json`) — projects[], about paragrafları, sosyal linkler, şehir/timezone. Kod bu şemayı okur; gerçeği koymak = sadece bu dosyayı düzenlemek.

### 10.11 Tarayıcı matrisi ve dağıtım
- Hedef: son 2 sürüm Chrome/Safari/Firefox, **iOS 15+**. WebP zorunlu, AVIF opsiyonel.
- Dağıtım: **Vercel**; kare varlıkları `public/` (bütçe içinde) veya Vercel statik CDN. `.env`: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, fal.ai anahtarı (yalnız üretim scripti).
- Resize/orientation: pinned film yeniden hesaplanır (`ScrollTrigger.refresh`), kare ölçeği reflow.

### 10.12 v1 teslim kapsamı (net)
- **Home filmi: gerçek** fal.ai kareleriyle.
- Projects/About/Contact: engine bağlı + **placeholder kare setleri**, içerik canlı, gerçek videolar sonra.
- İmza ipliği: tek paylaşılan tanım — ince SVG path, ~1.5px, elektrik mavisi→gri; tüm sayfalarda aynı bileşen.

---

## 11. Başarı Ölçütleri

- Scroll-video iPhone dahil **takılmadan** akıyor.
- Site "AI şablonu" gibi durmuyor (4 kural sağlanıyor).
- Karanlık→aydınlık anlatısı her sayfada hissediliyor.
- Tüm tipografi Sora; emoji yok; ikonlar inline SVG.
- 4 sayfa ayrı, gizli menü her an çalışıyor.
- Contact formu gerçekten mail gönderiyor.
- Placeholder içerik gerçeğiyle kolayca değiştirilebiliyor (içerik koddan ayrık).
