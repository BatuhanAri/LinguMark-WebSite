/**
 * LinguMark Landing Page Main JS
 * 
 * In this file, we handle:
 * 1. 5-Language Translation System (tr, en, es, fr, de)
 * 2. Word clicks in the sandbox (left-click) using Event Delegation.
 * 3. Sentence-level right-click context menu (translateSentence) using Event Delegation.
 * 4. Feature showcase tab panel switcher (Web Röntgen, translation, collocations, SM2, FastPath).
 * 5. FAQ Accordion panel collapse animations.
 * 6. Global toast system for UX feedback.
 */

// Global object to cache original HTML content of sentences before they are translated
// This lets us revert the translated sentences back to original English (including the interactive word spans)
const originalSentencesCache = {};

// Active sentence translation database, dynamically updated by the selected language
let sentenceTranslations = {
  s1: "Dil öğrenimi devrim niteliğinde bir döneme girdi.",
  s2: "Yabancı bir dilde dijital makaleler okurken, genellikle kavrayışınızı durduran yabancı terimlerle karşılaşırsınız.",
  s3: "LinguMark ile bir kelimeye tıklamak, onun çevirisini anında ortaya çıkaracak, Oxford sözlük tanımlarını kontrol edecek ve yerel telaffuzunu çalacaktır.",
  s4: "Bu kelimeleri listenize ekleyerek, sistem kalıcı bellek depolaması sağlamak için aralıklı tekrar aralıklarından yararlanır."
};

// State variables to track currently active context items
let activeSentenceElForTranslation = null;
let savedWordsCount = 0;
const savedWordsList = new Set();

// Interactive words dictionary for sandbox span attributes
const interactiveWords = {
  revolutionary: {
    tr: "devrim niteliğinde, yenilikçi",
    en: "revolutionary, groundbreaking",
    es: "revolucionario, innovador",
    fr: "révolutionnaire, novateur",
    de: "revolutionär, bahnbrechend"
  },
  encounter: {
    tr: "karşılaşmak, rast gelmek",
    en: "encounter, come across",
    es: "encontrar, tropezar con",
    fr: "rencontrer, faire face",
    de: "begegnen, stoßen auf"
  },
  instantly: {
    tr: "anında, hemen",
    en: "instantly, immediately",
    es: "al instante, inmediatamente",
    fr: "instantanément, immédiatement",
    de: "sofort, augenblicklich"
  },
  pronunciation: {
    tr: "telaffuz, söyleyiş",
    en: "pronunciation, articulation",
    es: "pronunciación, articulación",
    fr: "prononciation, élocution",
    de: "Aussprache, Artikulation"
  },
  repetition: {
    tr: "tekrar",
    en: "repetition, reiteration",
    es: "repetición, reiteración",
    fr: "répétition, réitération",
    de: "Wiederholung"
  }
};

// 5-Language Dictionary
const websiteI18n = {
  tr: {
    doc_title: "LinguMark - İnternetteki Her Kelime Artık Senin Kütüphanen",
    nav_features: "Özellikler",
    nav_how_it_works: "Nasıl Çalışır?",
    nav_demo: "Canlı Deneyim",
    nav_pricing: "Ücretsiz",
    nav_faq: "Sıkça Sorulan Sorular",
    add_to_chrome: "Chrome'a Ekle (Ücretsiz)",
    hero_badge: `<span class="flex w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span> %100 Ücretsiz & Açık Kaynak Eklenti!`,
    hero_title: `İnternetteki Her Kelime <br class="hidden sm:inline"> Artık Senin <span class="text-teal-600">Kütüphanen.</span>`,
    hero_desc: `Makale okurken, haber izlerken veya araştırma yaparken bilmediğiniz bir kelime mi gördün? Sadece seç, sağ tıkla ve LinguMark'a ekle. Bilimsel <span class="text-teal-600 font-bold">SM-2 Aralıklı Tekrar</span> yöntemiyle bir daha hiç unutma.`,
    hero_cta_download: "Chrome Web Store'dan İndir",
    hero_cta_demo: "Canlı Demoyu Dene",
    context_menu_copy: "Kopyala",
    context_menu_search: "Google ile Ara",
    context_menu_add: "LinguMark'a Ekle",
    demo_ephemeral_translation: "geçici, kısa ömürlü",
    demo_title: "Eklentiyi Kurmadan Önce Canlı Deneyimle",
    demo_desc: `Aşağıdaki İngilizce paragrafta yer alan kelimelere <span class="text-teal-600 font-bold">Sol Tıklayarak</span> kelime anlamını görebilir; cümlelerin herhangi bir yerine <span class="text-teal-600 font-bold">Sağ Tıklayarak</span> tüm cümleyi sayfayı bozmadan yerinde (in-place) Türkçe karşılığıyla değiştirebilirsiniz.`,
    demo_saved_words_label: "Kayıtlı Kelimeler",
    tooltip_meaning_label: "Seçilen Dildeki Anlamı",
    tooltip_def_label: "Tanım (Oxford)",
    tooltip_save_btn: "Kelime Kitaplığıma Ekle",
    tooltip_speak_title: "Telaffuzu Dinle",
    context_translate_btn: "LinguMark ile Cümleyi Çevir",
    context_speak_btn: "Cümleyi Sesli Oku",
    context_helper_label: "LinguMark Yardımcı",
    feat_head_title: "LinguMark'ın Güçlü Özellikleri",
    feat_head_desc: "LinguMark eklentisi, dil öğrenimini sadece kelime ezberlemekten çıkarıp web'de gezinirken doğal ve bilimsel metotlarla kalıcı hale getiren komple bir platformdur.",
    feat1_title: "Akıllı Web Röntgeni",
    feat1_desc: "Web sitelerindeki bilmediğiniz kelimelerin üzerine gelerek veya tıklayarak anında algılayın. Okuma akışınız asla sekteye uğramaz.",
    feat2_title: "Yerinde Cümle Çevirisi",
    feat2_desc: "Herhangi bir metin bloğunu seçip sağ tıklayarak tüm cümleyi sayfada orijinal biçimini bozmadan anında çeviri karşılığıyla yer değiştirin. Tekrar tıklayarak orijinaline geri dönün.",
    feat3_title: "Oxford Sözlük & IPA",
    feat3_desc: "Sözlük tanımları, isim/fiil rolleri (Part of Speech) ve IPA fonetik yazılışlarıyla kelimeleri en doğru şekilde öğrenip telaffuz edin.",
    feat4_title: "Gerçekçi Ses Telaffuzları",
    feat4_desc: "Kelimelerin Amerikan ve İngiliz aksanlarındaki doğru telaffuzlarını tarayıcının yerel ses motoru (TTS) ile gecikmesiz olarak dinleyin.",
    feat5_title: "Collocation (Birlikte Kullanım)",
    feat5_desc: "Datamuse API sorguları ile kelimenin en sık birlikte kullanıldığı kelime gruplarını listeleyerek, kelimeleri kalıplarıyla öğrenin.",
    feat6_title: "Görsel Bellek Araması",
    feat6_desc: "Hızlı Google Görseller butonları ile kelimeleri resimlerle ilişkilendirerek görsel hafızada kalıcılığı artırın.",
    feat7_title: "Aralıklı Tekrar (SM-2)",
    feat7_desc: "SuperMemo-2 (SM-2) aralıklı tekrar algoritmasıyla kelimeleri unutmaya en yakın olduğunuz zamanlarda karşınıza getirir.",
    feat8_title: "FastPath Seviye Patikası",
    feat8_desc: "Matematiksel eğrilerle tasarlanmış kilitli seviye haritasında (A2-C1 arası) quizler ve yazma egzersizleriyle öğrenin.",
    feat9_title: "Isı Haritası & Seri (Streak)",
    feat9_desc: "GitHub benzeri 90 günlük aktivite ısı haritası ve çalışma serinizi gösteren streak sayacıyla motivasyonunuzu koruyun.",
    how_badge: "Eklenti Arayüzü",
    how_title: "Nasıl Çalışır?",
    how_desc: "LinguMark eklentisinin her bir özelliğinin tarayıcınızda nasıl çalıştığını interaktif olarak inceleyin.",
    tab1_title: "1. Akıllı Web Röntgeni",
    tab1_badge: "Röntgen",
    tab1_desc: "Kelimenin üzerine gelince anında önizleme kartı açılır.",
    tab2_title: "2. Sağ Tık Yerinde Cümle Çevirisi",
    tab2_desc: "Cümleleri sayfa düzenini bozmadan yerinde çevirir.",
    tab3_title: "3. Oxford Tanımları & TTS Telaffuz",
    tab3_desc: "Ses dalgalı gerçekçi seslendirmeler ve kelime kökenleri.",
    tab4_title: "4. Collocation (Birlikte Kullanım)",
    tab4_desc: "Kelimenin en sık beraber kullanıldığı kalıpları gösterir.",
    tab5_title: "5. SM-2 Aralıklı Tekrar Kartları",
    tab5_desc: "Hatırlama derecenize göre kelimeleri tekrar listeler.",
    tab6_title: "6. FastPath Seviye Patikası",
    tab6_desc: "Gamification destekli seviye ilerleme haritası.",
    mockup_oxford_wave_label: "Ses Dalgaları (Pronunciation Wave)",
    mockup_collocation_title: "Birlikte Kullanılan Kelimeler (Collocations)",
    score_label: "puan",
    mockup_sm2_front_label: "Hatırla? (Flashcard)",
    mockup_sm2_front_click: "Tıklayıp Çevir",
    mockup_sm2_back_label: "Anlamı",
    mockup_sm2_back_translation: "geçici, kısa ömürlü",
    mockup_sm2_again: "Tekrar",
    mockup_sm2_hard: "Zor",
    mockup_sm2_good: "İyi",
    mockup_fp_title: "FastPath Patika İlerlemesi",
    pricing_title: "%100 Ücretsiz & Açık Kaynak",
    pricing_subtitle: "Hiçbir gizli ücret, abonelik veya maliyet yok. Her özellik tamamen açık kaynak kodlu ve ücretsizdir.",
    pricing_badge_free: "AÇIK KAYNAK",
    pricing_plan_label: "Sınırsız Paket",
    pricing_plan_name: "LinguMark Full",
    pricing_plan_desc: "Limitsiz kelime kütüphanesi, SM-2 algoritması ve Oxford veritabanıyla dilde tamamen ücretsiz ustalaşın.",
    pricing_price: "0₺",
    pricing_price_suffix: "/ sonsuza kadar",
    pricing_feat_1: "Sınırsız kelime çeviri ve arama",
    pricing_feat_2: "Limitsiz kütüphane kapasitesi",
    pricing_feat_3: "Oxford Gelişmiş Sözlük & IPA",
    pricing_feat_4: "SM-2 Akıllı Aralıklı Tekrar algoritması",
    pricing_feat_5: "Cihazlar arası Firebase bulut senkronizasyonu (İsteğe Bağlı)",
    pricing_feat_6: "Akıllı Web Röntgeni ve FastPath Seviye Patikası",
    pricing_btn: "Chrome'a Ekle (Ücretsiz)",
    roadmap_badge: "Yol Haritası",
    roadmap_title: "Geliştirilen ve Planlanan Özellikler",
    roadmap_desc: "LinguMark'ı sadece bir eklenti değil, yapay zeka destekli tam kapsamlı bir dil asistanı haline getirmek için üzerinde çalıştığımız yenilikler.",
    roadmap_status_dev: "Geliştiriliyor",
    roadmap_status_planned: "Planlandı",
    roadmap1_title: "LinguMark AI Chat Assistant",
    roadmap1_desc: "Bir kelime veya cümleyi seçtiğinizde, sadece çeviri yapmakla kalmayıp, o kelimenin anlamını, alternatif kullanımlarını ve kültürel bağlamını sizinle tartışabileceğiniz, tarayıcı içinde açılan mini bir AI sohbet paneli.",
    roadmap2_title: "Akıllı PDF & Doküman Desteği",
    roadmap2_desc: "Sadece standart web sayfalarında değil, tarayıcınızda açtığınız yabancı dildeki yerel PDF dosyalarında, e-kitaplarda ve Google Docs dökümanlarında da tek tıkla kelime kaydetme, telaffuz ve cümle analizi yapabilme özelliği.",
    roadmap3_title: "Yapay Zeka Cümle Üretici",
    roadmap3_desc: "Kaydettiğiniz kelimeleri kalıcı hafızanıza aktarmak için, yapay zekanın o kelimeleri harmanlayarak size özel kısa hikayeler, diyaloglar ve okuma pratikleri hazırlaması ve sizi bu metinler üzerinden test etmesi.",
    roadmap4_title: "Mobil Destek ve Eşitleme",
    roadmap4_desc: "Tarayıcıda biriktirdiğiniz kelime kütüphanenizi ve cümle bağlamlarını mobil cihazınızla eşitleyerek; yolda, metroda veya gün içinde kısa flashcard egzersizleri ve bildirimlerle tekrar edebileceğiniz iOS/Android uygulaması.",
    roadmap5_title: "Unutma Eğrisi Takibi & Analitik",
    roadmap5_desc: "Bilişsel bilimdeki Spaced Repetition (Aralıklı Tekrar) verilerini analiz ederek, öğrendiğiniz kelimeleri tam unutmak üzere olduğunuz kritik zaman dilimlerini hesaplayan ve o anda hatırlatan akıllı bildirim ve gelişmiş analitik modülü.",
    roadmap6_title: "Konuşma & Telaffuz Geri Bildirimi",
    roadmap6_desc: "Kelimeleri sadece okuyarak değil, sesli telaffuz ederek öğrenmeniz için mikrofon desteğiyle çalışan yapay zeka analizörümüz. Telaffuz doğruluğunuzu ölçer, tonlama ve heceleme hatalarınıza anlık sesli geri dönüşler sağlar.",
    faq_badge: "Öğrenme Bilimi",
    faq_title: "Bilimsel Metodolojimiz ve Merak Edilenler",
    faq_desc: "LinguMark'ın arkasındaki bilişsel psikoloji metotları ve çalışma prensipleri.",
    faq1_q: "LinguMark sadece bir dil öğrenme programı mıdır?",
    faq1_a: `<p>Hayır. LinguMark statik, günde 15 dakika okuyup kelime ezberlemeye çalıştığınız geleneksel dil programlarından tamamen farklıdır. LinguMark, günlük internet gezinme akışınızla (okuduğunuz makaleler, yazılım dökümanları, bloglar) bütünleşen aktif bir <strong>"Dil Okuma ve Öğrenme Asistanıdır"</strong>.</p><p>Uygulama siz işinizi yaparken tarayıcınızda sessizce çalışır, bilmediğiniz terimlerde yerinde yardım sunarak okuma akışınızı bölmeden kelimeleri dağarcığınıza katar. Sizi kelime listeleriyle boğmak yerine, okuma alışkanlıklarınızı doğrudan bir öğrenme sürecine dönüştürür.</p>`,
    faq2_q: "Neden kartlara otomatik resim koymak yerine Google Görseller'de \"Araştır\" butonu sunuyoruz?",
    faq2_a: `<p>Bilişsel psikolojide <strong>Aktif Geri Çağırma (Active Recall)</strong> ve <strong>Görsel Eşleştirme (Active Visual Mapping)</strong> süreçleri, belleğin kalıcılığında en belirleyici faktörlerdir. Kelime kartlarına eklenti tarafından otomatik yerleştirilmiş tek bir sabit resim koymak, kullanıcıda <strong>"Pasif Tanıma" (Passive Recognition)</strong> yanılgısına yol açar; beyin kelimeyi sadece o özel resimle eşleştirir ve gerçek hayatta karşılaştığında hatırlamakta zorlanır.</p><p>LinguMark, kullanıcının Google Görseller butonu ile kelimeyi aktif olarak aratarak, kendi zihninde kelimenin anlamını en iyi temsil eden görsel sonuçları (birden çok varyasyonla) bizzat filtreleyip incelemesine olanak tanır. Bu aktif arama ve görsel seçme süreci, beyindeki görsel korteks yollarını uyararak kelimenin kalıcı olarak hafızaya kazınmasını sağlar.</p>`,
    faq3_q: "Kelimeleri neden ilk karşılaşılan cümle bağlamları (Context) ile birlikte kaydediyoruz?",
    faq3_a: `<p>Hafıza biliminde <strong>Bağlama Duyarlı Bellek (Context-Dependent Memory)</strong> ve dil ediniminde <strong>Sentaktik İpuçları (Syntactic Bootstrapping)</strong> kavramları, yeni bilgilerin yerleşmesini doğrudan etkiler. Bir kelimeyi soyut bir liste halinde tek başına ezberlemek, beynin "ilişkilendirme" (association) mekanizmasını devre dışı bırakır.</p><p>LinguMark, kaydettiğiniz her kelimeyi, o kelimeyle ilk karşılaştığınız cümlenin tamamı ve bulunduğunuz sayfanın URL'si ile birlikte kaydeder. Kelimeyi tekrar ederken, kelimenin ilk geçtiği orijinal cümleyi ve kaynağı görmek, beynin o anki okuma deneyimini ve bağlamı yeniden canlandırmasını sağlar. Bu sayede kelime kalıcı hafızaya çok daha hızlı aktarılır ve cümle içindeki gramer rolüyle doğru şekilde öğrenilir.</p>`,
    faq4_q: "LinguMark neden tamamen ücretsizdir? Herhangi bir gizli ücret var mı?",
    faq4_a: `<p>LinguMark, dil öğrenimini herkes için erişilebilir kılmak amacıyla açık kaynak kodlu olarak geliştirilmiştir. Verilerinizi kendi tarayıcınızda veya kişisel Firebase hesabınızda saklayarak sunucu işletim maliyetlerini sıfırlıyoruz. Bu sayede hiçbir gizli ücret, abonelik veya reklam olmadan LinguMark'ın tüm özelliklerini ömür boyu tamamen ücretsiz olarak kullanabilirsiniz.</p>`,
    faq5_q: "SM-2 (SuperMemo-2) Aralıklı Tekrar algoritması nasıl çalışır?",
    faq5_a: `<p>SM-2, hafıza bilimindeki "Unutma Eğrisi" (Forgetting Curve) araştırmalarına dayalı olarak geliştirilmiş matematiksel bir formüldür. Kütüphanenizdeki kelimeleri gözden geçirirken sistem size 4 hatırlama derecesi sunar: <strong>Tekrar (Again)</strong>, <strong>Zor (Hard)</strong>, <strong>İyi (Good)</strong> ve <strong>Kolay (Easy)</strong>.</p><p>Algoritma her geri bildiriminizde kelimenin kolaylık katsayısını (Ease Factor - EF) ve bir sonraki gösterim aralığını (Interval) günceller. Bu sayede, iyi bildiğiniz kelimeleri haftalarca görmezken, zorlandığınız kelimeleri sıklıkla tekrar ederek beyninizin kalıcı nöral bağlantılar kurması sağlanır.</p>`,
    faq6_q: "Verilerim nerede depolanıyor? Eklenti sekmeleri yavaşlatır mı?",
    faq6_a: `<p>LinguMark, Chrome Manifest V3 standartlarında geliştirilmiş ultra hafif bir uzantıdır. Web sayfalarını tararken performans kaybına veya yavaşlamaya neden olmaması için özel bir <strong>"TreeWalker Tarama Algoritması"</strong> kullanır. Bu sayede sayfalardaki script, style veya kod etiketleri elenerek yalnızca okunabilir metin düğümleri (TextNodes) taranır.</p><p>Tüm verileriniz tarayıcınızın yerel belleğinde (IndexedDB) saklanır. Dilerseniz eklenti ayarlarından verilerinizi Google Firebase bulut veritabanında şifreli olarak yedekleyip cihazlarınız arasında eşitleyebilirsiniz. Tarama geçmişiniz asla sunucularımıza gönderilmez veya üçüncü şahıslara satılmaz.</p>`,
    faq7_q: "LinguMark açık kaynak kodlarına nereden erişebilirim veya katkıda bulunabilirim?",
    faq7_a: `<p>LinguMark kodları GitHub üzerinde barındırılmaktadır. Projeye katkıda bulunmak, hata bildirmek veya kendi tarayıcınız için derlemek istiyorsanız GitHub depomuzu ziyaret edebilirsiniz. Her türlü geri bildirim ve katkı projenin gelişimine büyük destek sağlayacaktır.</p>`,
    cta_bottom_title: "Okurken Öğrenmeye Bugün Başlayın",
    cta_bottom_desc: "LinguMark uzantısını tarayıcınıza ekleyin, internetteki İngilizce makaleleri okurken takıldığınız kelimeleri bilimsel aralıklarla hafızanıza kazıyın.",
    cta_bottom_btn: "Hemen Chrome'a Ekle (Ücretsiz)",
    footer_copyright: "© 2026 LinguMark. Tüm hakları saklıdır.",
    footer_privacy: "Gizlilik Politikası",
    footer_terms: "Kullanım Koşulları",
    footer_support: "Destek (Support)",
    mockup_sentence_orig: "unfamiliar terms that stall your comprehension.",
    mockup_sentence_trans: "kavrayışınızı durduran yabancı terimlerle.",
    word_saved_toast: "kütüphaneye kaydedildi!",
    word_already_saved_toast: "zaten kütüphanede kayıtlı!",
    sentence_reverted_toast: "Cümle orijinal İngilizce haline döndürüldü.",
    sentence_translated_toast: "Cümle yerinde çevrildi! Orijinal metne dönmek için üzerine sol tıklayın."
  },
  en: {
    doc_title: "LinguMark - Every Word on the Web Is Now Your Library",
    nav_features: "Features",
    nav_how_it_works: "How it Works?",
    nav_demo: "Live Demo",
    nav_pricing: "Free",
    nav_faq: "FAQ",
    add_to_chrome: "Add to Chrome (Free)",
    hero_badge: `<span class="flex w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span> 100% Free & Open Source Extension!`,
    hero_title: `Every Word on the Web <br class="hidden sm:inline"> Is Now Your <span class="text-teal-600">Library.</span>`,
    hero_desc: `Encountered an unfamiliar word while reading articles, watching news, or researching? Just select, right-click, and add it to LinguMark. Never forget it again with the scientific <span class="text-teal-600 font-bold">SM-2 Spaced Repetition</span> method.`,
    hero_cta_download: "Download from Chrome Web Store",
    hero_cta_demo: "Try Live Demo",
    context_menu_copy: "Copy",
    context_menu_search: "Search with Google",
    context_menu_add: "Add to LinguMark",
    demo_ephemeral_translation: "transitory, short-lived",
    demo_title: "Experience Live Before Installing the Extension",
    demo_desc: `Left-click on the words in the English paragraph below to view their meanings; right-click anywhere in the sentences to translate the entire sentence in-place with its translation.`,
    demo_saved_words_label: "Saved Words",
    tooltip_meaning_label: "Meaning in Selected Language",
    tooltip_def_label: "Definition (Oxford)",
    tooltip_save_btn: "Add to My Word Library",
    tooltip_speak_title: "Listen to Pronunciation",
    context_translate_btn: "Translate Sentence with LinguMark",
    context_speak_btn: "Read Sentence Aloud",
    context_helper_label: "LinguMark Assistant",
    feat_head_title: "Powerful Features of LinguMark",
    feat_head_desc: "LinguMark extension is a complete platform that makes language learning natural and permanent through scientific methods while browsing the web.",
    feat1_title: "Smart Web Röntgen",
    feat1_desc: "Instantly detect unfamiliar words on websites by hovering or clicking. Your reading flow is never disrupted.",
    feat2_title: "In-Place Sentence Translation",
    feat2_desc: "Select any text block and right-click to instantly replace the entire sentence with its translation in-place without breaking page formatting. Click again to revert.",
    feat3_title: "Oxford Dictionary & IPA",
    feat3_desc: "Learn and pronounce words correctly with dictionary definitions, part of speech roles, and IPA phonetic notations.",
    feat4_title: "Realistic Pronunciations",
    feat4_desc: "Listen to correct pronunciations of words in American and British accents with the browser's native speech engine (TTS) without delay.",
    feat5_title: "Collocation Explorer",
    feat5_desc: "List the most common word combinations using Datamuse API queries to learn words in natural patterns.",
    feat6_title: "Visual Memory Search",
    feat6_desc: "Associate words with images using quick Google Images buttons to increase retention in visual memory.",
    feat7_title: "Spaced Repetition (SM-2)",
    feat7_desc: "Brings words back to you just when you are closest to forgetting them using the SuperMemo-2 (SM-2) spaced repetition algorithm.",
    feat8_title: "FastPath Level Path",
    feat8_desc: "Advance on a locked level map (A2-C1) designed with mathematical curves, complete with quizzes and writing exercises.",
    feat9_title: "Heatmap & Streak",
    feat9_desc: "Maintain your motivation with a GitHub-like 90-day activity heatmap and a streak counter showing your study consistency.",
    how_badge: "Extension Interface",
    how_title: "How it Works?",
    how_desc: "Interactively explore how each feature of the LinguMark extension works in your browser.",
    tab1_title: "1. Smart Web Röntgen",
    tab1_badge: "Röntgen",
    tab1_desc: "Hovering over a word instantly opens a preview card.",
    tab2_title: "2. Right-Click Sentence Translation",
    tab2_desc: "Translates sentences in-place without breaking page layout.",
    tab3_title: "3. Oxford Definitions & TTS",
    tab3_desc: "Realistic pronunciations with sound waves and word origins.",
    tab4_title: "4. Collocation (Joint Use)",
    tab4_desc: "Shows the most frequent word patterns used with the word.",
    tab5_title: "5. SM-2 Spaced Repetition Cards",
    tab5_desc: "Lists words again according to your recall strength.",
    tab6_title: "6. FastPath Level Path",
    tab6_desc: "Gamified progress map to level up your vocabulary.",
    mockup_oxford_wave_label: "Sound Waves (Pronunciation Wave)",
    mockup_collocation_title: "Common Word Combinations (Collocations)",
    score_label: "score",
    mockup_sm2_front_label: "Recall? (Flashcard)",
    mockup_sm2_front_click: "Click to Translate",
    mockup_sm2_back_label: "Meaning",
    mockup_sm2_back_translation: "transitory, short-lived",
    mockup_sm2_again: "Again",
    mockup_sm2_hard: "Hard",
    mockup_sm2_good: "Good",
    mockup_fp_title: "FastPath Path Progress",
    pricing_title: "100% Free & Open Source",
    pricing_subtitle: "No hidden fees, subscriptions, or costs. Every feature is completely open-source and free.",
    pricing_badge_free: "OPEN SOURCE",
    pricing_plan_label: "Unlimited Pack",
    pricing_plan_name: "LinguMark Full",
    pricing_plan_desc: "Master languages completely free of charge with unlimited vocabulary library, SM-2 algorithm, and Oxford database.",
    pricing_price: "$0",
    pricing_price_suffix: "/ forever",
    pricing_feat_1: "Unlimited word translations and searches",
    pricing_feat_2: "Unlimited library capacity",
    pricing_feat_3: "Oxford Advanced Dictionary & IPA",
    pricing_feat_4: "SM-2 Spaced Repetition algorithm",
    pricing_feat_5: "Cross-device Firebase cloud synchronization (Optional)",
    pricing_feat_6: "Smart Web Röntgen and FastPath Level Path",
    pricing_btn: "Add to Chrome (Free)",
    roadmap_badge: "Roadmap",
    roadmap_title: "Developed and Planned Features",
    roadmap_desc: "Innovations we are working on to make LinguMark not just an extension, but a full-featured AI-powered language assistant.",
    roadmap_status_dev: "In Development",
    roadmap_status_planned: "Planned",
    roadmap1_title: "LinguMark AI Chat Assistant",
    roadmap1_desc: "A mini AI chat panel opening inside the browser that translates and discusses word meaning, alternative uses, and context with you.",
    roadmap2_title: "Smart PDF & Document Support",
    roadmap2_desc: "Word saving, pronunciation, and sentence analysis on local PDF files, e-books, and Google Docs opened in your browser.",
    roadmap3_title: "AI Sentence Generator",
    roadmap3_desc: "AI-generated short stories, dialogues, and reading practices using your saved words to test you and move them to permanent memory.",
    roadmap4_title: "Mobile Support & Sync",
    roadmap4_desc: "iOS/Android application to sync your vocabulary library and review on the go with flashcard exercises and notifications.",
    roadmap5_title: "Forgetting Curve Tracking & Analytics",
    roadmap5_desc: "An analytics module calculating critical forgetfulness intervals to send smart notifications just when you need a review.",
    roadmap6_title: "Speech & Pronunciation Feedback",
    roadmap6_desc: "Microphone support analyzing your pronunciation accuracy, offering immediate feedback on intonation and spelling errors.",
    faq_badge: "Science of Learning",
    faq_title: "Our Scientific Methodology and FAQ",
    faq_desc: "Cognitive psychology methods and working principles behind LinguMark.",
    faq1_q: "Is LinguMark just a language learning application?",
    faq1_a: `<p>No. LinguMark is entirely different from traditional language programs where you open a static app for 15 minutes a day. It is an active <strong>"Language Reading and Learning Assistant"</strong> integrated directly with your daily internet browsing flow (articles, coding docs, blogs).</p><p>The extension runs silently in your browser, helping you in-place on unfamiliar terms without breaking your flow. Rather than burying you under vocabulary lists, it turns your reading habits directly into learning.</p>`,
    faq2_q: "Why do we offer a Google Images \"Research\" button instead of auto-attaching pictures?",
    faq2_a: `<p>In cognitive psychology, <strong>Active Recall</strong> and <strong>Active Visual Mapping</strong> are key to memory permanence. Putting a single, static pre-set image on flashcards creates a false sense of <strong>"Passive Recognition"</strong>, where the brain only links the word to that specific photo.</p><p>LinguMark lets you actively search on Google Images, filtering and scanning visual representations yourself. This active search process stimulates visual cortex pathways, cementing the word permanently in memory.</p>`,
    faq3_q: "Why do we save words along with their original sentence context?",
    faq3_a: `<p>Memory science shows that <strong>Context-Dependent Memory</strong> and <strong>Syntactic Bootstrapping</strong> are critical for acquiring new data. Memorizing an abstract word alone disables the brain's associative mechanisms.</p><p>LinguMark saves every word along with the complete sentence you first encountered it in and the source URL. Seeing the original context during reviews helps trigger memory recall, easing permanent storage.</p>`,
    faq4_q: "Why is LinguMark completely free? Are there any hidden fees?",
    faq4_a: `<p>LinguMark is developed as an open-source project to make language learning accessible to everyone. By storing your data locally in your browser or on your personal Firebase account, we eliminate server operating costs. This allows you to use all LinguMark features completely free for lifetime without any hidden fees, subscriptions, or ads.</p>`,
    faq5_q: "How does the SM-2 (SuperMemo-2) Spaced Repetition algorithm work?",
    faq5_a: `<p>SM-2 is a mathematical formula based on "Forgetting Curve" research. When reviewing your vocabulary, the system offers 4 recall levels: <strong>Again</strong>, <strong>Hard</strong>, <strong>Good</strong>, and <strong>Easy</strong>.</p><p>The algorithm updates the Ease Factor (EF) and display Interval after each feedback. This ensures that well-known words are hidden for weeks, while challenging words are repeated frequently to build neural pathways.</p>`,
    faq6_q: "Where is my data stored? Does the extension slow down tabs?",
    faq6_a: `<p>LinguMark is an ultra-lightweight extension developed under Chrome Manifest V3 standards. To avoid slow-downs, it utilizes a custom <strong>"TreeWalker Scan Algorithm"</strong> that skips script, style, and code elements, scanning readable text nodes only.</p><p>All your data is stored in the browser's local memory (IndexedDB). You can optionally sync it securely via Google Firebase database across devices. Your history is never sent to our servers or sold to third parties.</p>`,
    faq7_q: "Where can I access the open source code or contribute?",
    faq7_a: `<p>LinguMark source code is hosted on GitHub. If you want to contribute, report bugs, or build it for your own browser, you can visit our GitHub repository. Any feedback or contribution is highly appreciated and supports the project.</p>`,
    cta_bottom_title: "Start Learning While Reading Today",
    cta_bottom_desc: "Add LinguMark extension to your browser and cement unfamiliar words in your memory while reading English articles on the web.",
    cta_bottom_btn: "Add to Chrome Now (Free)",
    footer_copyright: "© 2026 LinguMark. All rights reserved.",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Use",
    footer_support: "Support",
    mockup_sentence_orig: "unfamiliar terms that stall your comprehension.",
    mockup_sentence_trans: "unfamiliar terms that stall your comprehension.",
    word_saved_toast: "saved to library!",
    word_already_saved_toast: "already in library!",
    sentence_reverted_toast: "Sentence reverted to original English.",
    sentence_translated_toast: "Sentence translated in-place! Left-click it to revert back to English."
  },
  es: {
    doc_title: "LinguMark - Cada palabra en la web es ahora tu biblioteca",
    nav_features: "Características",
    nav_how_it_works: "¿Cómo funciona?",
    nav_demo: "Práctica en vivo",
    nav_pricing: "Gratis",
    nav_faq: "Preguntas frecuentes",
    add_to_chrome: "Agregar a Chrome (Gratis)",
    hero_badge: `<span class="flex w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span> ¡Extensión 100% gratis y de código abierto!`,
    hero_title: `Cada palabra en la web <br class="hidden sm:inline"> ahora es tu <span class="text-teal-600">biblioteca.</span>`,
    hero_desc: `¿Encontraste una palabra desconocida al leer artículos, ver noticias o investigar? Simplemente selecciona, haz clic derecho y agrégala a LinguMark. Nunca la olvides con el método científico <span class="text-teal-600 font-bold">SM-2 Repetición Espaciada</span>.`,
    hero_cta_download: "Descargar de Chrome Web Store",
    hero_cta_demo: "Probar demo en vivo",
    context_menu_copy: "Copiar",
    context_menu_search: "Buscar con Google",
    context_menu_add: "Agregar a LinguMark",
    demo_ephemeral_translation: "efímero, transitorio",
    demo_title: "Prueba en vivo antes de instalar la extensión",
    demo_desc: `Haz clic izquierdo en las palabras del párrafo en inglés a continuación para ver sus significados; haz clic derecho en cualquier parte de las oraciones para traducir toda la oración en su lugar sin alterar el diseño.`,
    demo_saved_words_label: "Palabras guardadas",
    tooltip_meaning_label: "Significado en el idioma elegido",
    tooltip_def_label: "Definición (Oxford)",
    tooltip_save_btn: "Agregar a mi biblioteca",
    tooltip_speak_title: "Escuchar pronunciación",
    context_translate_btn: "Traducir frase con LinguMark",
    context_speak_btn: "Leer frase en voz alta",
    context_helper_label: "Asistente de LinguMark",
    feat_head_title: "Características potentes de LinguMark",
    feat_head_desc: "La extensión LinguMark es una plataforma completa que convierte la lectura en una experiencia de aprendizaje natural y permanente mediante métodos científicos.",
    feat1_title: "Web Röntgen inteligente",
    feat1_desc: "Detecta instantáneamente palabras desconocidas al pasar el cursor o hacer clic. Tu flujo de lectura nunca se interrumpe.",
    feat2_title: "Traducción de frases en su lugar",
    feat2_desc: "Selecciona cualquier bloque de texto y haz clic derecho para reemplazar la frase con su traducción en su lugar sin alterar el formato. Haz clic de nuevo para revertir.",
    feat3_title: "Diccionario Oxford e IPA",
    feat3_desc: "Aprende y pronuncia palabras correctamente con definiciones del diccionario, roles gramaticales y transcripciones fonéticas IPA.",
    feat4_title: "Pronunciaciones realistas",
    feat4_desc: "Escucha pronunciaciones de palabras con el motor de voz nativo (TTS) del navegador en acentos americano y británico sin retraso.",
    feat5_title: "Explorador de colocaciones",
    feat5_desc: "Lista las combinaciones de palabras más frecuentes usando la API Datamuse para aprender palabras en sus patrones naturales.",
    feat6_title: "Búsqueda visual de memoria",
    feat6_desc: "Asocia palabras con imágenes usando botones de Google Imágenes para aumentar la retención en la memoria visual.",
    feat7_title: "Repetición espaciada (SM-2)",
    feat7_desc: "Te devuelve las palabras justo cuando estás más cerca de olvidarlas utilizando el algoritmo SuperMemo-2 (SM-2).",
    feat8_title: "Ruta de aprendizaje FastPath",
    feat8_desc: "Avanza en un mapa de niveles bloqueados (A2-C1) diseñado con curvas matemáticas, con cuestionarios y ejercicios de escritura.",
    feat9_title: "Mapa de calor y racha (Streak)",
    feat9_desc: "Mantén tu motivación con un mapa de calor de actividad de 90 días y un contador de racha que muestra tu constancia.",
    how_badge: "Interfaz de la extensión",
    how_title: "¿Cómo funciona?",
    how_desc: "Explora de forma interactiva cómo funciona cada función de la extensión LinguMark en tu navegador.",
    tab1_title: "1. Web Röntgen inteligente",
    tab1_badge: "Röntgen",
    tab1_desc: "Al pasar el cursor sobre una palabra, se abre una tarjeta de vista previa.",
    tab2_title: "2. Traducción de frase con clic derecho",
    tab2_desc: "Traduce frases en su lugar sin alterar el diseño de la página.",
    tab3_title: "3. Definiciones de Oxford y TTS",
    tab3_desc: "Pronunciaciones realistas con ondas de sonido y orígenes de palabras.",
    tab4_title: "4. Colocación (Uso conjunto)",
    tab4_desc: "Muestra los patrones de palabras más frecuentes utilizados con la palabra.",
    tab5_title: "5. Tarjetas de repetición espaciada SM-2",
    tab5_desc: "Lista palabras de nuevo según tu nivel de recuerdo.",
    tab6_title: "6. Ruta de aprendizaje FastPath",
    tab6_desc: "Mapa de progreso interactivo para subir el nivel de tu vocabulario.",
    mockup_oxford_wave_label: "Ondas de sonido (Pronunciation Wave)",
    mockup_collocation_title: "Combinaciones de palabras (Collocations)",
    score_label: "puntuación",
    mockup_sm2_front_label: "¿Recordar? (Ficha)",
    mockup_sm2_front_click: "Clic para traducir",
    mockup_sm2_back_label: "Significado",
    mockup_sm2_back_translation: "efímero, transitorio",
    mockup_sm2_again: "Repetir",
    mockup_sm2_hard: "Difícil",
    mockup_sm2_good: "Bien",
    mockup_fp_title: "Progreso de la ruta FastPath",
    pricing_title: "100% gratis y de código abierto",
    pricing_subtitle: "Sin cargos ocultos, suscripciones ni costes. Todas las funciones son completamente gratis y de código abierto.",
    pricing_badge_free: "CÓDIGO ABIERTO",
    pricing_plan_label: "Paquete ilimitado",
    pricing_plan_name: "LinguMark Full",
    pricing_plan_desc: "Domina idiomas gratis con biblioteca ilimitada, algoritmo SM-2 y base de datos Oxford.",
    pricing_price: "0€",
    pricing_price_suffix: "/ para siempre",
    pricing_feat_1: "Traducciones y búsquedas ilimitadas",
    pricing_feat_2: "Capacidad de biblioteca ilimitada",
    pricing_feat_3: "Diccionario Oxford avanzado e IPA",
    pricing_feat_4: "Algoritmo de repetición espaciada SM-2",
    pricing_feat_5: "Sincronización en la nube con Firebase (Opcional)",
    pricing_feat_6: "Web Röntgen y ruta de aprendizaje FastPath",
    pricing_btn: "Agregar a Chrome (Gratis)",
    roadmap_badge: "Mapa de ruta",
    roadmap_title: "Funciones en desarrollo y planeadas",
    roadmap_desc: "Innovaciones en las que trabajamos para hacer de LinguMark un asistente de idiomas completo con IA.",
    roadmap_status_dev: "En desarrollo",
    roadmap_status_planned: "Planeado",
    roadmap1_title: "Asistente de chat LinguMark AI",
    roadmap1_desc: "Un mini panel de chat con IA en el navegador para traducir y debatir el significado de las palabras y su contexto.",
    roadmap2_title: "Soporte inteligente para PDF",
    roadmap2_desc: "Guardado de palabras y análisis en archivos PDF locales, libros electrónicos y Google Docs.",
    roadmap3_title: "Generador de frases con IA",
    roadmap3_desc: "Historias cortas y diálogos creados por IA utilizando tus palabras guardadas para moverlas a la memoria permanente.",
    roadmap4_title: "Soporte móvil y sincronización",
    roadmap4_desc: "Aplicación iOS/Android para sincronizar tu biblioteca y repasar sobre la marcha con fichas y notificaciones.",
    roadmap5_title: "Seguimiento de la curva del olvido",
    roadmap5_desc: "Módulo de análisis que calcula intervalos críticos para enviar notificaciones de repaso justo a tiempo.",
    roadmap6_title: "Comentarios sobre pronunciación",
    roadmap6_desc: "Soporte de micrófono que analiza tu pronunciación y ofrece retroalimentación inmediata sobre errores de entonación.",
    faq_badge: "Ciencia del aprendizaje",
    faq_title: "Nuestra metodología científica y preguntas frecuentes",
    faq_desc: "Métodos de psicología cognitiva y principios de funcionamiento detrás de LinguMark.",
    faq1_q: "¿Es LinguMark solo una aplicación de aprendizaje de idiomas?",
    faq1_a: `<p>No. LinguMark es diferente de los programas tradicionales de idiomas. Es un <strong>"Asistente activo de lectura y aprendizaje de idiomas"</strong> integrado con tu navegación diaria (artículos, blogs, código).</p><p>La extensión funciona silenciosamente en tu navegador, ayudándote en su lugar con términos desconocidos sin romper tu flujo de lectura.</p>`,
    faq2_q: "¿Por qué ofrecemos un botón de Google Imágenes \"Investigar\" en lugar de imágenes automáticas?",
    faq2_a: `<p>El <strong>Recuerdo Activo</strong> y el <strong>Mapeo Visual Activo</strong> son clave para la permanencia de la memoria. Poner una sola imagen fija crea un <strong>"Reconocimiento Pasivo"</strong> incorrecto.</p><p>LinguMark te permite buscar de forma activa en Google Imágenes, filtrando las representaciones visuales tú mismo para consolidar la palabra en la memoria.</p>`,
    faq3_q: "¿Por qué guardamos palabras junto con su contexto original?",
    faq3_a: `<p>La ciencia demuestra que la <strong>Memoria Dependiente del Contexto</strong> es crítica. Memorizar palabras de forma aislada desactiva los mecanismos asociativos.</p><p>LinguMark guarda cada palabra junto con la frase completa donde la encontraste por primera vez.</p>`,
    faq4_q: "¿Por qué LinguMark es completamente gratis? ¿Hay algún cargo oculto?",
    faq4_a: `<p>LinguMark se ha desarrollado como un proyecto de código abierto para que el aprendizaje de idiomas sea accesible para todos. Al almacenar sus datos localmente en su navegador o en su cuenta personal de Firebase, eliminamos los costes de funcionamiento del servidor. Esto le permite utilizar todas las funciones de LinguMark de forma totalmente gratuita de por vida, sin cargos ocultos, suscripciones ni anuncios.</p>`,
    faq5_q: "¿Cómo funciona el algoritmo de repetición espaciada SM-2?",
    faq5_a: `<p>SM-2 es una fórmula matemática basada en la curva del olvido. Ofrece 4 niveles: <strong>Repetir</strong>, <strong>Difícil</strong>, <strong>Bien</strong> y <strong>Fácil</strong>. Actualiza el intervalo para repetir las palabras más difíciles con más frecuencia.</p>`,
    faq6_q: "¿Dónde se guardan mis datos? ¿Ralentiza el navegador?",
    faq6_a: `<p>LinguMark es una extensión ultraligera bajo Manifest V3. Utiliza un algoritmo <strong>"TreeWalker"</strong> que solo escanea nodos de texto legibles, evitando ralentizaciones.</p><p>Todos tus datos se guardan de forma local en IndexedDB. Puedes sincronizarlos de forma segura con tu cuenta de Firebase.</p>`,
    faq7_q: "¿Dónde puedo acceder al código de código abierto o contribuir?",
    faq7_a: `<p>El código de LinguMark está en GitHub. Si quieres contribuir, reportar errores o compilarlo, puedes visitar nuestro repositorio en GitHub. Cualquier contribución es bienvenida.</p>`,
    cta_bottom_title: "Empieza a aprender leyendo hoy",
    cta_bottom_desc: "Agrega la extensión LinguMark a tu navegador y consolida palabras desconocidas en tu memoria mientras lees artículos en la web.",
    cta_bottom_btn: "Agregar a Chrome ahora (Gratis)",
    footer_copyright: "© 2026 LinguMark. Todos los derechos reservados.",
    footer_privacy: "Política de privacidad",
    footer_terms: "Términos de uso",
    footer_support: "Soporte",
    mockup_sentence_orig: "unfamiliar terms that stall your comprehension.",
    mockup_sentence_trans: "unfamiliar terms that stall your comprehension.",
    word_saved_toast: "¡guardado en la biblioteca!",
    word_already_saved_toast: "¡ya está en la biblioteca!",
    sentence_reverted_toast: "La frase ha vuelto al inglés original.",
    sentence_translated_toast: "¡Frase traducida! Haz clic izquierdo para volver al inglés."
  },
  fr: {
    doc_title: "LinguMark - Chaque mot sur le web est désormais votre bibliothèque",
    nav_features: "Fonctionnalités",
    nav_how_it_works: "Comment ça marche ?",
    nav_demo: "Démo en direct",
    nav_pricing: "Gratuit",
    nav_faq: "FAQ",
    add_to_chrome: "Ajouter à Chrome (Gratuit)",
    hero_badge: `<span class="flex w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span> Extension 100% gratuite & open-source !`,
    hero_title: `Chaque mot sur le web <br class="hidden sm:inline"> est désormais votre <span class="text-teal-600">bibliothèque.</span>`,
    hero_desc: `Vous avez rencontré un mot inconnu en lisant des articles, en regardant les actualités ou en faisant des recherches ? Sélectionnez-le, faites un clic droit et ajoutez-le à LinguMark. Ne l'oubliez plus jamais avec la méthode scientifique de <span class="text-teal-600 font-bold">Répétition Espacée SM-2</span>.`,
    hero_cta_download: "Télécharger sur Chrome Web Store",
    hero_cta_demo: "Essayer la démo en direct",
    context_menu_copy: "Copier",
    context_menu_search: "Rechercher avec Google",
    context_menu_add: "Ajouter à LinguMark",
    demo_ephemeral_translation: "éphémère, transitoire",
    demo_title: "Testez en direct avant d'installer l'extension",
    demo_desc: `Faites un clic gauche sur les mots du paragraphe en anglais ci-dessous pour voir leur signification ; faites un clic droit n'importe où dans les phrases pour traduire toute la phrase sur place sans modifier la mise en page.`,
    demo_saved_words_label: "Mots enregistrés",
    tooltip_meaning_label: "Signification dans la langue choisie",
    tooltip_def_label: "Définition (Oxford)",
    tooltip_save_btn: "Ajouter à ma bibliothèque",
    tooltip_speak_title: "Écouter la prononciation",
    context_translate_btn: "Traduire la phrase avec LinguMark",
    context_speak_btn: "Lire la phrase à haute voix",
    context_helper_label: "Assistant LinguMark",
    feat_head_title: "Fonctionnalités puissantes de LinguMark",
    feat_head_desc: "L'extension LinguMark est une plateforme complète qui transforme la lecture sur le web en une expérience d'apprentissage naturelle et durable.",
    feat1_title: "Web Röntgen intelligent",
    feat1_desc: "Détectez instantanément les mots inconnus sur les sites web en survolant ou en cliquant. Votre flux de lecture n'est jamais interrompu.",
    feat2_title: "Traduction de phrases sur place",
    feat2_desc: "Sélectionnez n'importe quel bloc de texte et faites un clic droit pour remplacer la phrase par sa traduction sur place sans altérer le format. Cliquez à nouveau pour rétablir.",
    feat3_title: "Dictionnaire Oxford & IPA",
    feat3_desc: "Apprenez et prononcez les mots correctement grâce aux définitions, aux catégories grammaticales et à la phonétique IPA.",
    feat4_title: "Prononciations réalistes",
    feat4_desc: "Écoutez les prononciations correctes des mots avec des accents américain et britannique via le moteur vocal (TTS) natif du navigateur.",
    feat5_title: "Explorateur de collocations",
    feat5_desc: "Listez les combinaisons de mots les plus fréquentes à l'aide de l'API Datamuse pour apprendre les mots dans leurs structures naturelles.",
    feat6_title: "Recherche visuelle de mémoire",
    feat6_desc: "Associez les mots à des images via les boutons Google Images pour augmenter la rétention dans la mémoire visuelle.",
    feat7_title: "Répétition espacée (SM-2)",
    feat7_desc: "Représente les mots juste au moment où vous êtes sur le point de les oublier en utilisant l'algorithme SuperMemo-2 (SM-2).",
    feat8_title: "Chemin d'apprentissage FastPath",
    feat8_desc: "Progressez sur une carte interactive de niveaux verrouillés (A2-C1) avec des quiz et des exercices d'écriture.",
    feat9_title: "Carte d'activité & Racha (Streak)",
    feat9_desc: "Maintenez votre motivation grâce à une carte d'activité de 90 jours inspirée de GitHub et un compteur de régularité.",
    how_badge: "Interface de l'extension",
    how_title: "Comment ça marche ?",
    how_desc: "Explorez de manière interactive le fonctionnement de chaque fonctionnalité de l'extension LinguMark.",
    tab1_title: "1. Web Röntgen intelligent",
    tab1_badge: "Röntgen",
    tab1_desc: "Survoler un mot ouvre instantanément une carte d'aperçu.",
    tab2_title: "2. Traduction de phrase par clic droit",
    tab2_desc: "Traduit les phrases sur place sans altérer la mise en page.",
    tab3_title: "3. Définitions Oxford et TTS",
    tab3_desc: "Prononciations réalistes avec ondes sonores et étymologie des mots.",
    tab4_title: "4. Collocation (Usage conjoint)",
    tab4_desc: "Affiche les structures de mots les plus fréquentes utilisées avec le mot.",
    tab5_title: "5. Cartes de répétition espacée SM-2",
    tab5_desc: "Répertorie à nouveau les mots en fonction de votre force de rappel.",
    tab6_title: "6. Chemin d'apprentissage FastPath",
    tab6_desc: "Carte de progression ludique pour enrichir votre vocabulaire.",
    mockup_oxford_wave_label: "Ondes sonores (Pronunciation Wave)",
    mockup_collocation_title: "Combinaisons de mots (Collocations)",
    score_label: "score",
    mockup_sm2_front_label: "Se souvenir ? (Flashcard)",
    mockup_sm2_front_click: "Cliquez pour traduire",
    mockup_sm2_back_label: "Signification",
    mockup_sm2_back_translation: "éphémère, transitoire",
    mockup_sm2_again: "Répéter",
    mockup_sm2_hard: "Difficile",
    mockup_sm2_good: "Bien",
    mockup_fp_title: "Progression du chemin FastPath",
    pricing_title: "100% gratuit & open-source",
    pricing_subtitle: "Aucun frais caché, abonnement ou coût. Chaque fonctionnalité est entièrement gratuite et open-source.",
    pricing_badge_free: "OPEN SOURCE",
    pricing_plan_label: "Pack Illimité",
    pricing_plan_name: "LinguMark Full",
    pricing_plan_desc: "Maîtrisez les langues gratuitement avec une bibliothèque illimitée, l'algorithme SM-2 et la base de données Oxford.",
    pricing_price: "0€",
    pricing_price_suffix: "/ à vie",
    pricing_feat_1: "Traductions et recherches de mots illimitées",
    pricing_feat_2: "Capacité de bibliothèque illimitée",
    pricing_feat_3: "Dictionnaire Oxford avancé & IPA",
    pricing_feat_4: "Algorithme de répétition espacée SM-2",
    pricing_feat_5: "Synchronisation cloud Firebase (Optionnelle)",
    pricing_feat_6: "Web Röntgen et chemin d'apprentissage FastPath",
    pricing_btn: "Ajouter à Chrome (Gratuit)",
    roadmap_badge: "Feuille de route",
    roadmap_title: "Fonctionnalités en cours et planifiées",
    roadmap_desc: "Innovations sur lesquelles nous travaillons pour faire de LinguMark un assistant linguistique complet alimenté par l'IA.",
    roadmap_status_dev: "En cours",
    roadmap_status_planned: "Planifié",
    roadmap1_title: "Assistant de chat LinguMark AI",
    roadmap1_desc: "Un mini panneau de chat avec IA dans le navigateur pour traduire et discuter du sens des mots et du contexte.",
    roadmap2_title: "Support intelligent pour PDF",
    roadmap2_desc: "Enregistrement de mots et analyse dans les fichiers PDF locaux, les livres électroniques et Google Docs.",
    roadmap3_title: "Générateur de phrases par IA",
    roadmap3_desc: "Courtes histoires et dialogues créés par l'IA avec vos mots enregistrés pour les fixer dans la mémoire permanente.",
    roadmap4_title: "Support mobile et synchronisation",
    roadmap4_desc: "Application iOS/Android pour synchroniser votre bibliothèque et réviser avec des flashcards et des notifications.",
    roadmap5_title: "Suivi de la courbe de l'oubli",
    roadmap5_desc: "Module d'analyse calculant les intervalles critiques pour envoyer des notifications de révision au bon moment.",
    roadmap6_title: "Retours sur la prononciation",
    roadmap6_desc: "Support micro analysant l'exactitude de votre prononciation et offrant des retours sur l'intonation.",
    faq_badge: "Science de l'apprentissage",
    faq_title: "Notre méthodologie scientifique et FAQ",
    faq_desc: "Méthodes de psychologie cognitive et principes de fonctionnement derrière LinguMark.",
    faq1_q: "LinguMark est-il simplement une application linguistique ?",
    faq1_a: `<p>Non. LinguMark est différent des programmes traditionnels. C'est un <strong>"Assistant actif de lecture et d'apprentissage"</strong> intégré à votre navigation quotidienne (articles, blogs, code).</p><p>L'extension fonctionne silencieusement dans le navigateur, vous aidant sur les termes inconnus sans rompre votre flux de lecture.</p>`,
    faq2_q: "Pourquoi proposer un bouton Google Images \"Rechercher\" au lieu d'images automatiques ?",
    faq2_a: `<p>Le <strong>Rappel Actif</strong> et la <strong>Cartographie Visuelle Active</strong> sont essentiels pour fixer la mémoire. Mettre une image fixe crée une fausse impression de <strong>"Reconnaissance Passive"</strong>.</p><p>LinguMark vous permet de chercher activement dans Google Images, filtrant les représentations visuelles pour fixer le mot.</p>`,
    faq3_q: "Pourquoi enregistrer les mots avec leur contexte d'origine ?",
    faq3_a: `<p>La science montre que la <strong>Mémoire Dépendante du Contexte</strong> est critique. Mémoriser des mots isolés désactive les mécanismes d'association.</p><p>LinguMark enregistre chaque mot avec la phrase complète où vous l'avez rencontré.</p>`,
    faq4_q: "Pourquoi LinguMark est-il entièrement gratuit ? Y a-t-il des frais cachés ?",
    faq4_a: `<p>LinguMark est développé en tant que projet open-source pour rendre l'apprentissage des langues accessible à tous. En stockant vos données localement dans votre navigateur ou sur votre compte Firebase personnel, nous éliminons les coûts d'exploitation du serveur. Cela vous permet d'utiliser toutes les fonctionnalités de LinguMark gratuitement à vie, sans aucun frais caché, abonnement ou publicité.</p>`,
    faq5_q: "Comment fonctionne l'algorithme de répétition espacée SM-2 ?",
    faq5_a: `<p>SM-2 est une formule mathématique basée sur la courbe de l'oubli. Elle propose 4 niveaux : <strong>Répéter</strong>, <strong>Difficile</strong>, <strong>Bien</strong> et <strong>Facile</strong>. Elle met à jour les intervalles pour réviser plus souvent les mots difficiles.</p>`,
    faq6_q: "Où sont stockées mes données ? L'extension ralentit-elle les onglets ?",
    faq6_a: `<p>LinguMark est une extension ultra-légère sous Manifest V3. Elle utilise un algorithme <strong>"TreeWalker"</strong> qui scanne uniquement les nœuds de texte lisibles pour éviter les ralentissements.</p><p>Toutes vos données sont stockées localement dans IndexedDB. Vous pouvez les synchroniser de manière sécurisée avec Firebase.</p>`,
    faq7_q: "Où puis-je accéder au code open-source ou contribuer ?",
    faq7_a: `<p>Le code source de LinguMark est hébergé sur GitHub. Si vous souhaitez contribuer, signaler des bogues ou le compiler, vous pouvez visiter notre dépôt GitHub. Toute contribution est la bienvenue.</p>`,
    cta_bottom_title: "Commencez à apprendre en lisant dès aujourd'hui",
    cta_bottom_desc: "Ajoutez l'extension LinguMark à votre navigateur et fixez les mots inconnus dans votre mémoire tout en lisant des articles en anglais.",
    cta_bottom_btn: "Ajouter à Chrome maintenant (Gratuit)",
    footer_copyright: "© 2026 LinguMark. Tous droits réservés.",
    footer_privacy: "Politique de confidentialité",
    footer_terms: "Conditions d'utilisation",
    footer_support: "Support",
    mockup_sentence_orig: "unfamiliar terms that stall your comprehension.",
    mockup_sentence_trans: "unfamiliar terms that stall your comprehension.",
    word_saved_toast: "enregistré dans la bibliothèque !",
    word_already_saved_toast: "déjà dans la bibliothèque !",
    sentence_reverted_toast: "La phrase a été rétablie en anglais d'origine.",
    sentence_translated_toast: "Phrase traduite ! Faites un clic gauche pour revenir à l'anglais."
  },
  de: {
    doc_title: "LinguMark - Jedes Wort im Web ist jetzt deine Bibliothek",
    nav_features: "Features",
    nav_how_it_works: "Wie funktioniert es?",
    nav_demo: "Live-Demo",
    nav_pricing: "Kostenlos",
    nav_faq: "FAQ",
    add_to_chrome: "Zu Chrome hinzufügen (Kostenlos)",
    hero_badge: `<span class="flex w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span> 100% kostenlose & Open-Source-Erweiterung!`,
    hero_title: `Jedes Wort im Web <br class="hidden sm:inline"> ist jetzt deine <span class="text-teal-600">Bibliothek.</span>`,
    hero_desc: `Ein unbekanntes Wort beim Lesen von Artikeln, Anschauen von Nachrichten oder Recherchieren entdeckt? Einfach auswählen, rechtsklicken und zu LinguMark hinzufügen. Nie wieder vergessen mit der wissenschaftlichen <span class="text-teal-600 font-bold">SM-2 Spaced Repetition</span> Methode.`,
    hero_cta_download: "Aus dem Chrome Web Store herunterladen",
    hero_cta_demo: "Live-Demo ausprobieren",
    context_menu_copy: "Kopieren",
    context_menu_search: "Mit Google suchen",
    context_menu_add: "Zu LinguMark hinzufügen",
    demo_ephemeral_translation: "vergänglich, kurzlebig",
    demo_title: "Probieren Sie es live aus, bevor Sie die Erweiterung installieren",
    demo_desc: `Klicke mit der linken Maustaste auf die Wörter im folgenden englischen Absatz, um deren Bedeutung anzuzeigen. Klicke mit der rechten Maustaste auf eine beliebige Stelle der Sätze, um den gesamten Satz direkt zu übersetzen.`,
    demo_saved_words_label: "Gespeicherte Wörter",
    tooltip_meaning_label: "Bedeutung in der ausgewählten Sprache",
    tooltip_def_label: "Definition (Oxford)",
    tooltip_save_btn: "Wortbibliothek hinzufügen",
    tooltip_speak_title: "Aussprache anhören",
    context_translate_btn: "Satz mit LinguMark übersetzen",
    context_speak_btn: "Satz laut vorlesen",
    context_helper_label: "LinguMark Assistent",
    feat_head_title: "Leistungsstarke Funktionen von LinguMark",
    feat_head_desc: "LinguMark ist eine komplette Plattform, die das Lesen im Web durch wissenschaftliche Methoden in ein natürliches Sprachlernerlebnis verwandelt.",
    feat1_title: "Intelligentes Web Röntgen",
    feat1_desc: "Erkennen Sie unbekannte Wörter auf Websites sofort durch Zeigen oder Klicken. Ihr Lesefluss wird nie unterbrochen.",
    feat2_title: "In-Place Satzübersetzung",
    feat2_desc: "Wählen Sie einen Textblock aus und klicken Sie mit der rechten Maustaste, um den Satz direkt an Ort und Stelle durch seine Übersetzung zu ersetzen. Klicken Sie erneut, um zurückzukehren.",
    feat3_title: "Oxford Dictionary & IPA",
    feat3_desc: "Lernen und sprechen Sie Wörter richtig aus mit Definitionen, Wortarten und IPA-Lautschrift.",
    feat4_title: "Realistische Aussprachen",
    feat4_desc: "Hören Sie sich die korrekte Aussprache von Wörtern in amerikanischem und britischem Englisch über die native Sprachausgabe (TTS) an.",
    feat5_title: "Kollokations-Explorer",
    feat5_desc: "Listen Sie die häufigsten Wortkombinationen mithilfe von Datamuse API-Abfragen auf, um Wörter in Mustern zu lernen.",
    feat6_title: "Visuelle Gedächtnissuche",
    feat6_desc: "Verknüpfen Sie Wörter mit Bildern über Google Bilder-Schaltflächen, um die Merkfähigkeit im visuellen Gedächtnis zu erhöhen.",
    feat7_title: "Spaced Repetition (SM-2)",
    feat7_desc: "Zeigt Wörter mit dem SuperMemo-2 (SM-2) Algorithmus genau dann wieder an, wenn Sie sie fast vergessen haben.",
    feat8_title: "FastPath Level-Pfad",
    feat8_desc: "Steigen Sie auf einer interaktiven Karte aus niveaubasierten Einheiten (A2-C1) mit Quizzes und Schreibübungen auf.",
    feat9_title: "Aktivitäts-Heatmap & Streak",
    feat9_desc: "Bleiben Sie motiviert mit einer 90-tägigen Heatmap und einem Streak-Zähler für Ihr kontinuierliches Lernen.",
    how_badge: "Erweiterungsoberfläche",
    how_title: "Wie funktioniert es?",
    how_desc: "Erkunden Sie interaktiv, wie jede Funktion der LinguMark-Erweiterung in Ihrem Browser funktioniert.",
    tab1_title: "1. Intelligentes Web Röntgen",
    tab1_badge: "Röntgen",
    tab1_desc: "Zeigen auf ein Wort öffnet sofort eine Vorschaukarte.",
    tab2_title: "2. Satzübersetzung per Rechtsklick",
    tab2_desc: "Übersetzt Sätze direkt, ohne das Seitenlayout zu beschädigen.",
    tab3_title: "3. Oxford Definitionen & TTS",
    tab3_desc: "Realistische Aussprachen mit Schallwellen und Wortursprüngen.",
    tab4_title: "4. Kollokation (Gemeinsame Nutzung)",
    tab4_desc: "Zeigt die häufigsten Wortmuster, die mit dem Wort verwendet werden.",
    tab5_title: "5. SM-2 Spaced Repetition Karten",
    tab5_desc: "Listet Wörter basierend auf Ihrer Erinnerungsstärke erneut auf.",
    tab6_title: "6. FastPath Level-Pfad",
    tab6_desc: "Spielerischer Fortschrittspfad zur Erweiterung Ihres Wortschatzes.",
    mockup_oxford_wave_label: "Schallwellen (Pronunciation Wave)",
    mockup_collocation_title: "Häufige Wortverbindungen (Collocations)",
    score_label: "Punktzahl",
    mockup_sm2_front_label: "Erinnern? (Karte)",
    mockup_sm2_front_click: "Klicken zum Übersetzen",
    mockup_sm2_back_label: "Bedeutung",
    mockup_sm2_back_translation: "vergänglich, kurzlebig",
    mockup_sm2_again: "Wiederholen",
    mockup_sm2_hard: "Schwer",
    mockup_sm2_good: "Gut",
    mockup_fp_title: "FastPath Pfadfortschritt",
    pricing_title: "100% Kostenlos & Open-Source",
    pricing_subtitle: "Keine versteckten Gebühren, Abonnements oder Kosten. Jede Funktion ist völlig kostenlos und Open-Source.",
    pricing_badge_free: "OPEN SOURCE",
    pricing_plan_label: "Unbegrenztes Paket",
    pricing_plan_name: "LinguMark Full",
    pricing_plan_desc: "Meistern Sie Sprachen völlig kostenlos mit unbegrenzter Wortbibliothek, SM-2 Algorithmus und Oxford Datenbank.",
    pricing_price: "0€",
    pricing_price_suffix: "/ lebenslang",
    pricing_feat_1: "Unbegrenzte Wortübersetzungen und Suchen",
    pricing_feat_2: "Unbegrenzte Bibliothekskapazität",
    pricing_feat_3: "Oxford Advanced Dictionary & IPA Lautschrift",
    pricing_feat_4: "Formel zur arithmetischen SM-2 Wiederholung",
    pricing_feat_5: "Firebase Cloud Sync (Optional)",
    pricing_feat_6: "Web Röntgen und FastPath Level-Pfad",
    pricing_btn: "Zu Chrome hinzufügen (Kostenlos)",
    roadmap_badge: "Roadmap",
    roadmap_title: "Geplante und in Entwicklung befindliche Features",
    roadmap_desc: "Innovationen, an denen wir arbeiten, um LinguMark zu einem voll ausgestatteten KI-Sprachassistenten zu machen.",
    roadmap_status_dev: "In Arbeit",
    roadmap_status_planned: "Geplant",
    roadmap1_title: "LinguMark AI Chat Assistant",
    roadmap1_desc: "Ein Mini KI-Chat-Panel im Browser, das die Wortbedeutung und den Kontext mit Ihnen diskutiert.",
    roadmap2_title: "Intelligenter PDF Support",
    roadmap2_desc: "Wortspeicherung und Analyse in lokalen PDF-Dateien, E-Books und Google Docs.",
    roadmap3_title: "KI-Satzgenerator",
    roadmap3_desc: "Kurzgeschichten und Dialoge, die von KI unter Verwendung Ihrer gespeicherten Wörter erstellt werden, um Sie zu testen.",
    roadmap4_title: "Mobilgerätesupport & Sync",
    roadmap4_desc: "iOS/Android App zur Synchronisierung Ihrer Wortbibliothek für das Lernen unterwegs mit Karteikarten.",
    roadmap5_title: "Vergessenskurven Tracking & Analytik",
    roadmap5_desc: "Ein Analysemodul, das kritische Vergessensintervalle berechnet, um rechtzeitige Wiederholungserinnerungen zu senden.",
    roadmap6_title: "Aussprachefeedback",
    roadmap6_desc: "Mikrofonsupport, der Ihre Aussprachegenauigkeit analysiert und sofortiges Feedback zu Intonationsfehlern gibt.",
    faq_badge: "Wissenschaft des Lernens",
    faq_title: "Unsere wissenschaftliche Methodik und FAQ",
    faq_desc: "Kognitionspsychologische Methoden und Arbeitsprinzipien hinter LinguMark.",
    faq1_q: "Ist LinguMark nur eine Sprachlernanwendung?",
    faq1_a: `<p>Nein. LinguMark unterscheidet sich von traditionellen Programmen. Es ist ein aktiver <strong>"Lese- und Lernassistent"</strong>, der direkt in Ihren täglichen Lesefluss (Artikel, Programmier-Dokumente, Blogs) integriert ist.</p><p>Die Erweiterung läuft leise im Hintergrund und hilft Ihnen bei unbekannten Begriffen, ohne Ihren Lesefluss zu stören.</p>`,
    faq2_q: "Warum bieten wir eine Google Bilder \"Recherchieren\"-Schaltfläche anstelle von automatischen Bildern?",
    faq2_a: `<p>Aktives Abrufen und visuelle Zuordnung sind entscheidend für die Gedächtnisbildung. Das Platzieren eines voreingestellten Bildes erzeugt ein falsches Gefühl des <strong>"passiven Erkennens"</strong>.</p><p>LinguMark ermöglicht die aktive Suche in Google Bilder, um visuelle Darstellungen selbst zu filtern und das Wort einzuprägen.</p>`,
    faq3_q: "Warum speichern wir Wörter zusammen mit ihrem ursprünglichen Satzkontext?",
    faq3_a: `<p>Die Wissenschaft zeigt, dass das kontextabhängige Gedächtnis entscheidend ist. Das isolierte Auswendiglernen von Wörtern deaktiviert die Assoziationsmechanismen des Gehirns.</p><p>LinguMark speichert jedes Wort zusammen mit dem gesamten Satz, in dem Sie es zum ersten Mal gefunden haben.</p>`,
    faq4_q: "Warum ist LinguMark völlig kostenlos? Gibt es versteckte Gebühren?",
    faq4_a: `<p>LinguMark wurde als Open-Source-Projekt entwickelt, um das Sprachenlernen für alle zugänglich zu machen. Durch die lokale Speicherung Ihrer Daten in Ihrem Browser oder in Ihrem persönlichen Firebase-Konto entfallen die Serverbetriebskosten. Dadurch können Sie alle LinguMark-Funktionen lebenslang völlig kostenlos nutzen – ohne versteckte Gebühren, Abonnements oder Werbung.</p>`,
    faq5_q: "Wie funktioniert der SM-2 Spaced Repetition Algorithmus?",
    faq5_a: `<p>SM-2 ist eine mathematische Formel, die auf der Vergessenskurve basiert. Sie bietet 4 Stufen: <strong>Wiederholen</strong>, <strong>Schwer</strong>, <strong>Gut</strong> und <strong>Einfach</strong>. Der Algorithmus passt das Intervall an, um schwerere Wörter häufiger anzuzeigen.</p>`,
    faq6_q: "Wo werden meine Daten gespeichert? Verlangsamt die Erweiterung Tabs?",
    faq6_a: `<p>LinguMark ist eine ultraleichte Erweiterung unter Manifest V3. Sie nutzt einen <strong>"TreeWalker"</strong> Algorithmus, der nur lesbare Textknoten scannt, um Leistungseinbußen zu vermeiden.</p><p>Alle Ihre Daten werden lokal in IndexedDB gespeichert. Sie können sie optional sicher über Firebase synchronisieren.</p>`,
    faq7_q: "Wo kann ich auf den Open-Source-Code zugreifen oder beitragen?",
    faq7_a: `<p>Der LinguMark Quellcode wird auf GitHub gehostet. Wenn Sie beitragen, Fehler melden oder ihn für Ihren eigenen Browser kompilieren möchten, besuchen Sie unser GitHub Repository. Jede Unterstützung ist willkommen.</p>`,
    cta_bottom_title: "Beginnen Sie noch heute mit dem Lernen beim Lesen",
    cta_bottom_desc: "Fügen Sie die LinguMark-Erweiterung Ihrem Browser hinzu und prägen Sie sich unbekannte Wörter beim Lesen von englischen Artikeln im Web ein.",
    cta_bottom_btn: "Jetzt zu Chrome hinzufügen (Kostenlos)",
    footer_copyright: "© 2026 LinguMark. Alle Rechte vorbehalten.",
    footer_privacy: "Datenschutzerklärung",
    footer_terms: "Nutzungsbedingungen",
    footer_support: "Support",
    mockup_sentence_orig: "unfamiliar terms that stall your comprehension.",
    mockup_sentence_trans: "unfamiliar terms that stall your comprehension.",
    word_saved_toast: "in Bibliothek gespeichert!",
    word_already_saved_toast: "bereits in der Bibliothek!",
    sentence_reverted_toast: "Satz auf Originalenglisch zurückgesetzt.",
    sentence_translated_toast: "Satz direkt übersetzt! Linksklick, um zum Englischen zurückzukehren."
  }
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("LinguMark website scripts initializing...");

  // 1. Setup Sandbox Interactive Systems (Words left-click & Sentence right-click)
  initSandboxInteractiveSystem();

  // 2. Setup Feature Showcase Tab Panel switcher
  initFeatureShowcaseTabs();

  // 3. Setup FAQ Accordions
  initFaqAccordion();

  // 4. Setup smooth scroll behavior for anchors
  setupSmoothScrolling();

  // 5. Setup Language Translation system
  initLanguageTranslation();
});

/**
 * 5. LANGUAGE TRANSLATION SYSTEM
 */
function initLanguageTranslation() {
  const selectEl = document.getElementById("websiteLangSelect");
  if (!selectEl) return;

  // Read saved language from localStorage or default to Turkish ('tr')
  const savedLang = localStorage.getItem("websiteLang") || "tr";
  selectEl.value = savedLang;
  updateWebsiteLanguage(savedLang);

  selectEl.addEventListener("change", (e) => {
    const lang = e.target.value;
    localStorage.setItem("websiteLang", lang);
    updateWebsiteLanguage(lang);
  });
}

function updateWebsiteLanguage(lang) {
  const texts = websiteI18n[lang] || websiteI18n["tr"];

  // Update HTML document lang attribute
  document.documentElement.lang = lang;

  // 1. Update all standard [data-i18n] nodes
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (texts[key]) {
      if (key === "doc_title") {
        document.title = texts[key];
      } else {
        el.innerHTML = texts[key];
      }
    }
  });

  // 2. Update Speak button title attribute
  const speakBtn = document.getElementById("tooltip-speak-btn");
  if (speakBtn && texts.tooltip_speak_title) {
    speakBtn.title = texts.tooltip_speak_title;
  }

  // 3. Update CSS custom property variables for Mockup 2 sentence translation animation
  if (texts.mockup_sentence_orig && texts.mockup_sentence_trans) {
    document.documentElement.style.setProperty("--mockup-sentence-orig", `"${texts.mockup_sentence_orig}"`);
    document.documentElement.style.setProperty("--mockup-sentence-trans", `"${texts.mockup_sentence_trans}"`);
  }

  // 4. Update sentenceTranslations dictionary with current language values
  sentenceTranslations = {
    s1: lang === "tr" ? "Dil öğrenimi devrim niteliğinde bir döneme girdi." :
        lang === "en" ? "Language learning has entered a revolutionary era." :
        lang === "es" ? "El aprendizaje de idiomas ha entrado en una era revolucionaria." :
        lang === "fr" ? "L'apprentissage des langues est entré dans une ère révolutionnaire." :
        "Das Sprachenlernen ist in eine revolutionäre Ära eingetreten.",

    s2: lang === "tr" ? "Yabancı bir dilde dijital makaleler okurken, genellikle kavrayışınızı durduran yabancı terimlerle karşılaşırsınız." :
        lang === "en" ? "When you read digital articles in a foreign tongue, you often encounter unfamiliar terms that stall your comprehension." :
        lang === "es" ? "Cuando lees artículos digitales en una lengua extranjera, a menudo te encuentras con términos desconocidos que dificultan tu comprensión." :
        lang === "fr" ? "Lorsque vous lisez des articles numériques dans une langue étrangère, vous rencontrez souvent des termes inconnus qui bloquent votre compréhension." :
        "Wenn Sie digitale Artikel in einer Fremdsprache lesen, stoßen Sie häufig auf unbekannte Begriffe, die Ihr Verständnis blockieren.",

    s3: lang === "tr" ? "LinguMark ile bir kelimeye tıklamak, onun çevirisini anında ortaya çıkaracak, Oxford sözlük tanımlarını kontrol edecek ve yerel telaffuzunu çalacaktır." :
        lang === "en" ? "With LinguMark, clicking on a word will instantly reveal its translation, check its Oxford dictionary definitions, and playback its native pronunciation." :
        lang === "es" ? "Con LinguMark, hacer clic en una palabra revelará instantáneamente su traducción, comprobará sus definiciones del diccionario Oxford y reproducirá su pronunciación nativa." :
        lang === "fr" ? "Avec LinguMark, cliquer sur un mot révèle instantanément sa traduction, vérifie ses définitions dans le dictionnaire Oxford et lit sa prononciation native." :
        "Mit LinguMark zeigt ein Klick auf ein Wort sofort seine Übersetzung an, überprüft seine Definitionen im Oxford-Wörterbuch und spielt seine muttersprachliche Aussprache ab.",

    s4: lang === "tr" ? "Bu kelimeleri listenize ekleyerek, sistem kalıcı bellek depolaması sağlamak için aralıklı tekrar aralıklarından yararlanır." :
        lang === "en" ? "By adding these words to your list, the system leverages spaced repetition intervals to ensure permanent memory storage." :
        lang === "es" ? "Al agregar estas palabras a su lista, el sistema aprovecha los intervalos de repetición espaciada para garantizar un almacenamiento de memoria permanente." :
        lang === "fr" ? "En ajoutant ces mots à votre liste, le système utilise des intervalles de répétition espacés pour assurer un stockage permanent en mémoire." :
        "Durch das Hinzufügen dieser Wörter zu Ihrer Liste nutzt das System Abstände zur Wiederholung, um eine dauerhafte Speicherung im Gedächtnis zu gewährleisten."
  };

  // 5. Update data-translation attributes dynamically on active word spans in sandbox text
  document.querySelectorAll(".demo-sentence").forEach((sentenceEl) => {
    const sentenceId = sentenceEl.getAttribute("data-sentence-id");
    
    // If the sentence is currently translated, update its translated text content directly
    if (sentenceEl.classList.contains("translated")) {
      sentenceEl.textContent = sentenceTranslations[sentenceId];
    } else {
      // If it is original English, find interactive words inside and update their translation tooltips
      sentenceEl.querySelectorAll(".demo-word-interactive").forEach((wordEl) => {
        const wordText = wordEl.textContent.trim().toLowerCase();
        const matchKey = Object.keys(interactiveWords).find((k) => k.toLowerCase() === wordText);
        if (matchKey && interactiveWords[matchKey][lang]) {
          wordEl.setAttribute("data-translation", interactiveWords[matchKey][lang]);
        }
      });
    }
  });

  // Re-translate cached original sentences if language changed while sentences were cached
  for (let sId in originalSentencesCache) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${originalSentencesCache[sId]}</div>`, "text/html");
    doc.querySelectorAll(".demo-word-interactive").forEach((wordEl) => {
      const wordText = wordEl.textContent.trim().toLowerCase();
      const matchKey = Object.keys(interactiveWords).find((k) => k.toLowerCase() === wordText);
      if (matchKey && interactiveWords[matchKey][lang]) {
        wordEl.setAttribute("data-translation", interactiveWords[matchKey][lang]);
      }
    });
    originalSentencesCache[sId] = doc.querySelector("div").innerHTML;
  }
}

/**
 * 1. SANDBOX INTERACTIVE SYSTEM (Event Delegation based)
 * By listening to events on the parent wrapper (#sandbox-text-content),
 * we ensure that clicking/right-clicking works perfectly even after the inner HTML is dynamically changed or restored.
 */
function initSandboxInteractiveSystem() {
  const sandboxWrapper = document.getElementById("sandbox-text-content");
  const demoContainer = document.getElementById("demo-sandbox-container");
  
  // Word tooltip references
  const tooltip = document.getElementById("demo-translation-tooltip");
  const tooltipWordText = document.getElementById("tooltip-word");
  const tooltipIpaText = document.getElementById("tooltip-ipa");
  const tooltipTranslationText = document.getElementById("tooltip-translation");
  const tooltipDefinitionText = document.getElementById("tooltip-definition");
  const tooltipSpeakBtn = document.getElementById("tooltip-speak-btn");
  const tooltipSaveBtn = document.getElementById("tooltip-save-btn");
  const savedCountBadge = document.getElementById("demo-saved-count");

  // Custom context menu references
  const customContextMenu = document.getElementById("demo-context-menu");
  const contextTranslateBtn = document.getElementById("context-translate-btn");
  const contextSpeakBtn = document.getElementById("context-speak-btn");

  if (!sandboxWrapper || !demoContainer) {
    console.error("Required Sandbox DOM nodes are missing!");
    return;
  }

  // --- A. LEFT CLICK EVENTS (Word highlights or Reverting sentences) ---
  sandboxWrapper.addEventListener("click", (event) => {
    const selectEl = document.getElementById("websiteLangSelect");
    const currentLang = selectEl ? selectEl.value : "tr";
    const texts = websiteI18n[currentLang] || websiteI18n["tr"];

    // 1. Check if the user clicked a translated sentence (revert it to English)
    const sentenceEl = event.target.closest(".demo-sentence");
    if (sentenceEl && sentenceEl.classList.contains("translated")) {
      event.preventDefault();
      
      const sentenceId = sentenceEl.getAttribute("data-sentence-id");
      if (originalSentencesCache[sentenceId]) {
        // Restore the cached original English HTML (which brings back interactive words)
        sentenceEl.innerHTML = originalSentencesCache[sentenceId];
        sentenceEl.classList.remove("translated");

        // Dynamically make sure restored interactive words use the updated language translation tooltip
        sentenceEl.querySelectorAll(".demo-word-interactive").forEach((wordEl) => {
          const wordText = wordEl.textContent.trim().toLowerCase();
          const matchKey = Object.keys(interactiveWords).find((k) => k.toLowerCase() === wordText);
          if (matchKey && interactiveWords[matchKey][currentLang]) {
            wordEl.setAttribute("data-translation", interactiveWords[matchKey][currentLang]);
          }
        });

        showToast(texts.sentence_reverted_toast || "Cümle orijinal İngilizce haline döndürüldü.", "info");
      }
      return;
    }

    // 2. Check if the user clicked an interactive word span
    const wordEl = event.target.closest(".demo-word-interactive");
    if (wordEl) {
      event.preventDefault();
      event.stopPropagation();

      // Deactivate other active words inside the sandbox
      document.querySelectorAll(".demo-word-interactive").forEach(w => w.classList.remove("active"));
      wordEl.classList.add("active");

      // Load parameters from span data-attributes
      const wordVal = wordEl.textContent.trim();
      const ipa = wordEl.getAttribute("data-ipa");
      const translation = wordEl.getAttribute("data-translation");
      const definition = wordEl.getAttribute("data-definition");

      // Bind data to word tooltip
      tooltipWordText.textContent = wordVal;
      tooltipIpaText.textContent = ipa;
      tooltipTranslationText.textContent = translation;
      tooltipDefinitionText.textContent = definition;

      // Update speaker action
      tooltipSpeakBtn.onclick = () => {
        playTextSpeech(wordVal, "en-US", 0.85);
      };

      // Update save action
      tooltipSaveBtn.onclick = () => {
        saveWordToLibrary(wordVal, wordEl, texts);
      };

      // Make the tooltip visible first so the browser can calculate its layout dimensions (width/height)
      tooltip.classList.remove("hidden");
      tooltip.classList.add("animate-tooltip");

      // Position tooltip above word elements
      positionElementAboveTarget(wordEl, tooltip, demoContainer);
      
      // Hide right-click context menu if open
      customContextMenu.classList.add("hidden");
    }
  });

  // --- B. RIGHT CLICK EVENTS (Custom context menu for sentence translation) ---
  sandboxWrapper.addEventListener("contextmenu", (event) => {
    // Find closest sentence parent node
    const sentenceEl = event.target.closest(".demo-sentence");
    
    // Check if it is a valid sentence and not already translated
    if (sentenceEl && !sentenceEl.classList.contains("translated")) {
      event.preventDefault(); // Stop native browser right-click menu from opening
      event.stopPropagation();

      // Store globally which sentence is being right-clicked
      activeSentenceElForTranslation = sentenceEl;

      // Position custom context menu directly at cursor coordinates relative to sandbox
      const containerRect = demoContainer.getBoundingClientRect();
      const leftCoord = event.clientX - containerRect.left;
      const topCoord = event.clientY - containerRect.top;

      customContextMenu.style.left = `${leftCoord}px`;
      customContextMenu.style.top = `${topCoord}px`;
      customContextMenu.classList.remove("hidden");

      // Deactivate active word highlights to clean layout view
      document.querySelectorAll(".demo-word-interactive").forEach(w => w.classList.remove("active"));
      tooltip.classList.add("hidden");
    }
  });

  // --- C. CONTEXT MENU ACTIONS HANDLERS ---
  
  // 1. Cümle Çeviri seçeneği tıklandığında
  if (contextTranslateBtn) {
    contextTranslateBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const selectEl = document.getElementById("websiteLangSelect");
      const currentLang = selectEl ? selectEl.value : "tr";
      const texts = websiteI18n[currentLang] || websiteI18n["tr"];

      if (activeSentenceElForTranslation) {
        const sentenceId = activeSentenceElForTranslation.getAttribute("data-sentence-id");
        const translationText = sentenceTranslations[sentenceId];

        if (translationText) {
          // Cache the current English HTML layout (so we can restore word clicks later)
          originalSentencesCache[sentenceId] = activeSentenceElForTranslation.innerHTML;

          // Replace text with translation in-place
          activeSentenceElForTranslation.textContent = translationText;
          activeSentenceElForTranslation.classList.add("translated");

          showToast(texts.sentence_translated_toast || "Cümle yerinde çevrildi! Orijinal metne dönmek için üzerine sol tıklayın.", "success");
        }
        
        customContextMenu.classList.add("hidden");
        activeSentenceElForTranslation = null;
      }
    });
  }

  // 2. Cümle Seslendirme seçeneği tıklandığında
  if (contextSpeakBtn) {
    contextSpeakBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (activeSentenceElForTranslation) {
        const originalText = activeSentenceElForTranslation.getAttribute("data-original");
        if (originalText) {
          playTextSpeech(originalText, "en-US", 0.95);
          showToast(currentLang === "tr" ? "Cümle seslendiriliyor..." : "Playing sentence audio...", "info");
        }
        customContextMenu.classList.add("hidden");
        activeSentenceElForTranslation = null;
      }
    });
  }

  // --- D. GLOBAL CLICKS TO HIDE FLOATING WINDOWS ---
  document.addEventListener("click", (event) => {
    // If clicked outside context menu, hide it
    if (customContextMenu && !customContextMenu.contains(event.target)) {
      customContextMenu.classList.add("hidden");
    }
    
    // If clicked outside word tooltip and not on interactive words, hide tooltip
    if (tooltip && !tooltip.contains(event.target) && !event.target.classList.contains("demo-word-interactive")) {
      tooltip.classList.add("hidden");
      document.querySelectorAll(".demo-word-interactive").forEach(w => w.classList.remove("active"));
    }
  });

  /**
   * Helper: Absolute positioning above target element
   */
  function positionElementAboveTarget(targetEl, floatEl, relativeContainer) {
    const targetRect = targetEl.getBoundingClientRect();
    const containerRect = relativeContainer.getBoundingClientRect();

    const floatHeight = floatEl.offsetHeight || 190;
    const relativeTop = (targetRect.top - containerRect.top) - floatHeight - 10;

    const floatWidth = floatEl.offsetWidth || 280;
    const centerPoint = (targetRect.left - containerRect.left) + (targetRect.width / 2);
    let relativeLeft = centerPoint - (floatWidth / 2);

    // Keep horizontally inside container bounds
    if (relativeLeft < 10) {
      relativeLeft = 10;
    } else if (relativeLeft + floatWidth > containerRect.width - 10) {
      relativeLeft = containerRect.width - floatWidth - 10;
    }

    floatEl.style.top = `${relativeTop}px`;
    floatEl.style.left = `${relativeLeft}px`;
  }

  /**
   * Helper: Saves word into simulated spaced repetition deck
   */
  function saveWordToLibrary(word, element, texts) {
    if (savedWordsList.has(word)) {
      showToast(`"${word}" ${texts.word_already_saved_toast || "zaten kütüphanede kayıtlı!"}`, "info");
      return;
    }

    savedWordsList.add(word);
    savedWordsCount++;

    if (savedCountBadge) {
      savedCountBadge.textContent = savedWordsCount;
      savedCountBadge.classList.add("scale-125");
      setTimeout(() => savedCountBadge.classList.remove("scale-125"), 300);
    }

    // Color code the saved word in text to showcase persistence
    element.style.borderBottomColor = "#D4A017";
    element.style.color = "#D4A017";

    tooltip.classList.add("hidden");
    element.classList.remove("active");

    showToast(`"${word}" ${texts.word_saved_toast || "kütüphaneye kaydedildi!"}`, "success");
  }
}

/**
 * 2. FEATURE SHOWCASE TABS PANEL
 * Changes active classes on tab buttons and displays corresponding loop mockup animations on click or hover.
 */
function initFeatureShowcaseTabs() {
  const tabs = document.querySelectorAll("[data-mockup-tab]");
  const viewPort = document.getElementById("feature-showcase-viewport");

  if (tabs.length === 0 || !viewPort) return;

  tabs.forEach((tab) => {
    // We bind to both mouseenter (hover) and click for an extremely responsive Stripe-like feel!
    const triggerEvents = ["mouseenter", "click"];
    
    triggerEvents.forEach(evtName => {
      tab.addEventListener(evtName, (event) => {
        event.preventDefault();

        // Get target key from dataset attribute (roentgen, sentence, oxford, collocation, sm2, fp)
        const tabKey = tab.getAttribute("data-mockup-tab");

        // 1. Reset all tabs styling to inactive state
        tabs.forEach((t) => {
          t.classList.remove("active-showcase-tab", "bg-white", "shadow-sm", "border-teal-500/20", "border-l-teal-600");
          t.classList.add("border-slate-200/60", "border-l-transparent");
          const h3 = t.querySelector("h3");
          if (h3) h3.classList.replace("text-slate-900", "text-slate-700");
        });

        // 2. Set current tab as active
        tab.classList.add("active-showcase-tab", "bg-white", "shadow-sm", "border-teal-500/20", "border-l-teal-600");
        tab.classList.remove("border-slate-200/60", "border-l-transparent");
        const activeH3 = tab.querySelector("h3");
        if (activeH3) activeH3.classList.replace("text-slate-700", "text-slate-900");

        // 3. Toggle visibility of child mockups inside viewport container
        const mockups = viewPort.children;
        for (let mockup of mockups) {
          // Hide all mockups
          mockup.classList.add("hidden");
        }

        // Show target mockup by mapping the key to its ID
        const targetId = `mockup-${tabKey === "fp" ? "fastpath" : tabKey}`;
        const targetMockup = document.getElementById(targetId);
        if (targetMockup) {
          targetMockup.classList.remove("hidden");
        }
      });
    });
  });
}

/**
 * 3. FAQ ACCORDION COLLAPSE SYSTEM
 */
function initFaqAccordion() {
  const headers = document.querySelectorAll(".faq-header");

  headers.forEach((header) => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const arrow = header.querySelector(".faq-arrow");

      const isActive = item.classList.contains("faq-active");

      // Reset other accordion items (Single accordion mode)
      document.querySelectorAll(".faq-item").forEach((it) => {
        it.classList.remove("faq-active");
        const c = it.querySelector(".faq-content");
        if (c) {
          c.style.maxHeight = "0px";
          c.style.opacity = "0";
        }
        const a = it.querySelector(".faq-arrow");
        if (a) a.style.transform = "rotate(0deg)";
      });

      // Expand clicked if it wasn't active
      if (!isActive) {
        item.classList.add("faq-active");
        content.style.maxHeight = `${content.scrollHeight + 15}px`;
        content.style.opacity = "1";
        if (arrow) arrow.style.transform = "rotate(180deg)";
      }
    });
  });
}

/**
 * 4. WEB SPEECH TTS UTILITY
 */
function playTextSpeech(text, lang = "en-US", rate = 0.85) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * 6. TOAST GLOBAL SYSTEM
 */
function showToast(message, type = "success") {
  let container = document.getElementById("toast-global-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-global-container";
    container.className = "fixed bottom-5 right-5 flex flex-col gap-3 z-50 max-w-sm pointer-events-none";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "pointer-events-auto px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border transition-all duration-300 transform translate-y-10 opacity-0 bg-white border-slate-200 text-slate-800";
  
  if (type === "success") {
    toast.classList.add("border-l-4", "border-l-emerald-500");
  } else if (type === "warning") {
    toast.classList.add("border-l-4", "border-l-amber-500");
  } else if (type === "info") {
    toast.classList.add("border-l-4", "border-l-teal-500");
  }

  let iconHtml = `<svg class="w-5 h-5 text-teal-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  if (type === "success") {
    iconHtml = `<svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  }

  toast.innerHTML = `
    ${iconHtml}
    <span class="text-sm font-semibold text-slate-700 leading-normal">${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
  });

  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-10", "opacity-0");
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) container.remove();
    }, 300);
  }, 4000);
}

/**
 * 7. SMOOTH SCROLLING
 */
function setupSmoothScrolling() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
}
