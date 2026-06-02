# 🌍 LinguMark - Chrome Uzantısı Lansman & Tanıtım Web Sitesi

LinguMark, web sayfalarında gezinirken kelimeleri akıllı bir şekilde tarayan, otomatik vurgulama (Web Röntgen) yapan, Oxford kelime kütüphanesini barındıran ve SuperMemo-2 (SM-2) bilimsel aralıklı tekrar algoritması ile öğrenimi destekleyen modern bir **Chrome Uzantısı** yardımcı dil asistanıdır.

Bu depo, LinguMark Chrome eklentisinin özelliklerini tanıtan, kullanıcıların canlı olarak eklentiyi deneyimlemesini sağlayan (Aha-Moment) ve Lemon Squeezy ödeme sistemi entegrasyonu barındıran yasal/kurumsal lansman web sitesini içermektedir.

---

## 🎨 Tasarım Yaklaşımı (Stripe-Style Clean Mode)

Web sitesi, modern SaaS platformlarının (Stripe, Linear vb.) kullandığı sade, profesyonel ve yüksek performanslı **açık tema** tasarım diliyle hazırlanmıştır.
* **Arka Plan:** Sade off-white (`#FAFAFA`) rengi.
* **Bileşenler:** İnce sınırlara (`border-slate-200`) ve yumuşak gölgelere (`shadow-sm` / `shadow-lg`) sahip bembeyaz kartlar.
* **Renk Paleti:** LinguMark'ın kurumsal kimliği olan **Teal (#0D9488)** ve **Slate** renk tonları birincil vurgu renkleri olarak konumlandırılmıştır.
* **Tipografi:** Başlıklar için modern ve çarpıcı **Outfit**, gövde metinleri için yüksek okunabilirliğe sahip **Inter** font çifti kullanılmıştır.

---

## 🛠️ Temel Bölümler ve Etkileşimler

### 1. Hero & Sağ Tık Simülasyonu (welcome.html Loop)
Giriş ekranında, eklentinin sağ tık davranışını simüle eden bir tarayıcı mockup'ı yer alır. Metindeki `ephemeral` kelimesinin otomatik olarak fareyle seçilip yeşil renkle vurgulanması, imlecin sağ tık menüsüne kayarak eklenti seçeneğini tıklaması ve hemen ardından yeşil onaylı bir çeviri pop-up'ının belirmesi döngüsel (loop) CSS animasyonlarıyla canlandırılır.

### 2. Canlı Deneyim Alanı (Sandbox Demo)
Uzantıyı tarayıcıya kurmadan önce test etmenizi sağlayan etkileşimli bir kutudur:
* **Sol Tıklama (Kelime Çevirisi):** Altı çizili İngilizce kelimelere sol tıkladığınızda kelimenin üzerinde milimetrik olarak ortalanmış bir eklenti tooltip'i açılır. Oxford sözlük tanımları gösterilir ve hoparlör butonuyla kelimenin Amerikan İngilizcesi ses telaffuzu (Text-to-Speech) çalınır.
* **Sağ Tıklama (Cümle Çevirisi - `translateSentence`):** Cümlelerin herhangi bir yerine sağ tıklandığında özel bir bağlam menüsü açılır. "Cümleyi Çevir" seçildiğinde cümle yapısı bozulmadan Türkçe karşılığı enjekte edilir. Cümleye sol tıklanıldığında ise orijinal İngilizce haline geri döner. Bu özellik Javascript'te **Event Delegation (Olay Delegasyonu)** yöntemiyle tasarlanmıştır.

### 3. Nasıl Çalışır? (İnteraktif Özellikler Paneli)
Eklentinin en önemli 6 işlevi için (Röntgen, Çeviri, Oxford, Collocation, SM-2, FastPath) hazırlanmış interaktif sekmelerdir. Sekmelerin üzerine gelindiğinde veya tıklandığında, tarayıcı mockup'ı güncellenerek ilgili özelliğe ait özel CSS döngü animasyonu oynatılır.

### 4. Bilimsel Yaklaşım ve SSS (Metodoloji)
Tanıtım sayfasında klasik soru-cevap formatı yerine, platformun arkasındaki bilimsel öğrenme yaklaşımları detaylandırılmıştır:
* **Google Görseller'de Araştır Butonu (Active Visual Mapping):** Kelime kartlarına hazır resim eklemek yerine kullanıcının görseli bizzat kendi süzüp seçmesinin, beyindeki görsel korteks yollarını (Active Visual Mapping) uyararak kalıcılığı artırdığı açıklanmıştır.
* **Cümle Bağlamı Kaydı (Context-Dependent Memory):** Kelimeleri liste ezberinden uzaklaştırıp ilk karşılaşılan bağlam cümlesiyle saklamanın, bağlama duyarlı belleği (Context-Dependent Memory) tetiklediği bilimsel gerekçeleriyle belirtilmiştir.
* **Dil Yardımcı Asistanı Vurgusu:** LinguMark'ın statik bir dil programı değil, günlük internet gezinme akışınızla bütünleşen bir okuma ortağı olduğu vurgulanmıştır.

### 5. Lemon Squeezy Ödeme Entegrasyonu
Stripe'ın Türkiye'deki satıcı hesabı kısıtlamaları nedeniyle, yasal fatura, vergi (KDV) ve abonelik yönetimini üstlenen **Lemon Squeezy SDK** sisteme entegre edilmiştir. Kredi kartı ödemeleri siteyi terk etmeden bir overlay modal penceresi olarak açılır. Premium paket için **1 Ay Ücretsiz Deneme** imkanı sunulmaktadır.

---

## 💻 Teknik Kurulum ve Çalıştırma

Proje **Vite + Tailwind CSS + Vanilla JS** üzerine inşa edilmiştir.

### 1. Bağımlılıkların Kurulması
```bash
npm install
```

### 2. Yerel Sunucuyu Başlatma (Geliştirme Ortamı)
```bash
npm run dev
```
Sunucu başladığında tarayıcınızdan **`http://localhost:5173/`** adresine giderek sitenin canlı halini görüntüleyebilirsiniz.

### 3. Yayına Hazır Üretim Sürümü Oluşturma (Production Build)
```bash
npm run build
```
Bu komut, statik HTML, CSS ve JavaScript dosyalarını en optimum şekilde derleyerek sıkıştırır ve **`dist/`** klasörü içerisine çıkartır.

---

## 🔒 Yasal Belgeler
Chrome Web Store ve Lemon Squeezy onay süreçlerinden sorunsuz geçebilmek adına:
* **Gizlilik Politikası:** `/privacy.html`
* **Kullanım Koşulları:** `/terms.html`
Sayfaları projenin Stripe tarzı açık temasıyla uyumlu şekilde entegre edilmiştir.
