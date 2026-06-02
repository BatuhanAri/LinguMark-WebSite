/**
 * LinguMark Landing Page Main JS
 * 
 * In this file, we handle:
 * 1. Word clicks in the sandbox (left-click) using Event Delegation.
 * 2. Sentence-level right-click context menu (translateSentence) using Event Delegation.
 * 3. Feature showcase tab panel switcher (Web Röntgen, translation, collocations, SM2, FastPath).
 * 4. FAQ Accordion panel collapse animations.
 * 5. Lemon Squeezy payment popup initialization.
 * 6. Global toast system for UX feedback.
 */

// Global object to cache original HTML content of sentences before they are translated
// This lets us revert the translated Turkish sentences back to original English (including the interactive word spans)
const originalSentencesCache = {};

// Dictionary of Turkish translations for the sandbox sentences
const sentenceTranslations = {
  s1: "Dil öğrenimi devrim niteliğinde bir döneme girdi.",
  s2: "Yabancı bir dilde dijital makaleler okurken, genellikle kavrayışınızı durduran yabancı terimlerle karşılaşırsınız.",
  s3: "LinguMark ile bir kelimeye tıklamak, onun çevirisini anında ortaya çıkaracak, Oxford sözlük tanımlarını kontrol edecek ve yerel telaffuzunu çalacaktır.",
  s4: "Bu kelimeleri listenize ekleyerek, sistem kalıcı bellek depolaması sağlamak için aralıklı tekrar aralıklarından yararlanır."
};

// State variables to track currently active context items
let activeSentenceElForTranslation = null;
let savedWordsCount = 0;
const savedWordsList = new Set();

document.addEventListener("DOMContentLoaded", () => {
  console.log("LinguMark website scripts initializing...");

  // 1. Setup Sandbox Interactive Systems (Words left-click & Sentence right-click)
  initSandboxInteractiveSystem();

  // 2. Setup Feature Showcase Tab Panel switcher
  initFeatureShowcaseTabs();

  // 3. Setup FAQ Accordions
  initFaqAccordion();

  // 4. Setup Lemon Squeezy billing triggers
  initLemonSqueezy();

  // 5. Setup smooth scroll behavior for anchors
  setupSmoothScrolling();
});

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
    // 1. Check if the user clicked a translated Turkish sentence (revert it to English)
    const sentenceEl = event.target.closest(".demo-sentence");
    if (sentenceEl && sentenceEl.classList.contains("translated")) {
      event.preventDefault();
      
      const sentenceId = sentenceEl.getAttribute("data-sentence-id");
      if (originalSentencesCache[sentenceId]) {
        // Restore the cached original English HTML (which brings back interactive words)
        sentenceEl.innerHTML = originalSentencesCache[sentenceId];
        sentenceEl.classList.remove("translated");
        showToast("Cümle orijinal İngilizce haline döndürüldü.", "info");
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
        saveWordToLibrary(wordVal, wordEl);
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

      if (activeSentenceElForTranslation) {
        const sentenceId = activeSentenceElForTranslation.getAttribute("data-sentence-id");
        const translationText = sentenceTranslations[sentenceId];

        if (translationText) {
          // Cache the current English HTML layout (so we can restore word clicks later)
          originalSentencesCache[sentenceId] = activeSentenceElForTranslation.innerHTML;

          // Replace text with Turkish translation in-place
          activeSentenceElForTranslation.textContent = translationText;
          activeSentenceElForTranslation.classList.add("translated");

          showToast("Cümle yerinde çevrildi! Orijinal metne dönmek için üzerine sol tıklayın.", "success");
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
          showToast("Cümle seslendiriliyor...", "info");
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
  function saveWordToLibrary(word, element) {
    if (savedWordsList.has(word)) {
      showToast(`"${word}" zaten kütüphanenizde kayıtlı!`, "info");
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

    showToast(`"${word}" hafızaya eklendi! (SM-2 Algoritması ile 24 saat sonra hatırlatılacak)`, "success");
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
 * 4. LEMON SQUEEZY OVERLAY CONFIG
 */
function initLemonSqueezy() {
  if (window.LemonSqueezy) {
    try {
      window.LemonSqueezy.Setup({
        eventHandler: (event) => {
          if (event.event === "Checkout.Success") {
            showToast("Ödeme başarıyla gerçekleşti! Hoş geldiniz.", "success");
          }
        }
      });
    } catch (e) {
      console.error("Lemon Squeezy error:", e);
    }
  }
}

/**
 * 5. WEB SPEECH TTS UTILITY
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
