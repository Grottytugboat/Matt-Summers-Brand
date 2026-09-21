(() => {
  "use strict";
  /**
   * The shared showcase markup supplies each required selector.
   * @param {string} selector
   * @param {ParentNode} [root]
   * @returns {HTMLElement}
   */
  const $ = (selector, root = document) =>
    /** @type {HTMLElement} */ (root.querySelector(selector));
  /**
   * @param {string} selector
   * @param {ParentNode} [root]
   * @returns {HTMLElement[]}
   */
  const $$ = (selector, root = document) => [
    .../** @type {NodeListOf<HTMLElement>} */ (root.querySelectorAll(selector)),
  ];
  const shell = $("#site-shell");
  const gate = /** @type {HTMLDialogElement} */ ($("#age-gate"));
  let ageConfirmed = false;
  try {
    ageConfirmed = sessionStorage.getItem("spirits-age-confirmed") === "yes";
  } catch {
    /* Session storage may be disabled. */
  }
  if (gate && !ageConfirmed) {
    /** @type {Record<string, {name: string, category: string, eyebrow: string, heading: string, note: string}>} */
    const gateBrands = {
      mountain: {
        name: "MOUNTAIN",
        category: "VODKA · FRUIT TINGLE",
        eyebrow: "SPIRIT. ELEVATED.",
        heading: "A brighter<br><em>perspective.</em>",
        note: "A LITTLE UNEXPECTED. ENTIRELY MOUNTAIN.",
      },
      bensons: {
        name: "Benson’s.",
        category: "ORIGINAL · DOUBLE BLACK",
        eyebrow: "REAL BOURBON. NO COMPROMISE.",
        heading: "A classic.<br><em>By nature.</em>",
        note: "GOOD SPIRITS. GROWN-UP COMPANY.",
      },
      nightbird: {
        name: "NIGHTBIRD",
        category: "VODKA",
        eyebrow: "A SPIRIT OF ITS OWN",
        heading: "Before we<br><em>take flight.</em>",
        note: "NIGHTBIRD. DISTINCTIVE BY NATURE.",
      },
      collection: {
        name: "THE COLLECTION",
        category: "DISTINCTIVE SPIRITS",
        eyebrow: "INDIVIDUAL BRANDS. DISTINCTIVE SPIRITS.",
        heading: "A collection<br><em>of character.</em>",
        note: "GOOD SPIRITS. GROWN-UP COMPANY.",
      },
    };
    const brandKey = document.body.dataset.brand || "collection";
    const brand = gateBrands[brandKey] || gateBrands.collection;
    gate.dataset.ageBrand = brandKey;
    gate.innerHTML = `
      <div class="age-experience">
        <div class="age-atmosphere" aria-hidden="true">
          <video class="age-film" id="age-film" muted loop playsinline preload="none" poster="/assets/age-bird-poster.jpg" tabindex="-1" aria-hidden="true"></video>
          <div class="age-film-shade"></div>
        </div>
        <div class="age-masthead"><span class="age-brand-name">${brand.name}</span><span>${brand.category}</span></div>
        <div class="age-card">
          <p class="eyebrow">${brand.eyebrow}</p>
          <h2 id="age-title">${brand.heading}</h2>
          <div class="age-rule" aria-hidden="true"></div>
          <p id="age-description">Are you 18 or over and of legal drinking age in your location?</p>
          <div class="age-actions">
            <button class="button button-lime" id="gate-yes" type="button" autofocus>Yes, I’m 18+ <span aria-hidden="true">↗</span></button>
            <button class="age-no" id="gate-no" type="button">I’m under 18</button>
          </div>
          <div class="age-denied" id="age-denied" role="status" tabindex="-1" hidden><p>We’ll save the discovery for another time.</p><p>This experience is for adults 18 and over who are of legal drinking age in their location.</p></div>
          <p class="age-note">${brand.note}</p>
        </div>
        <div class="age-bottom"><p>PLEASE ENJOY RESPONSIBLY.</p><button class="age-motion" id="age-motion" type="button" aria-pressed="false" aria-controls="age-film">Pause video</button></div>
      </div>`;
    const video = /** @type {HTMLVideoElement} */ ($("#age-film"));
    const motionButton = /** @type {HTMLButtonElement} */ ($("#age-motion"));
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let userPaused = false;
    let explicitPlay = false;
    let mediaFailed = false;
    video.muted = true;
    video.defaultMuted = true;
    const shouldPlay = () => gate.open && !document.hidden && !userPaused &&
      (!motionPreference.matches || explicitPlay) && !mediaFailed;
    const updateControl = () => {
      const paused = !shouldPlay() || video.paused;
      motionButton.setAttribute("aria-pressed", String(paused));
      motionButton.textContent = mediaFailed ? "Retry video" : paused ? "Play video" : "Pause video";
    };
    const updateMotion = () => {
      if (!shouldPlay()) {
        video.pause();
        updateControl();
        return;
      }
      if (!video.getAttribute("src")) video.src = "/assets/age-bird-film.mp4";
      void video.play().then(updateControl).catch(() => {
        /* A denied autoplay request never prevents age confirmation or manual playback. */
        if (shouldPlay()) userPaused = true;
        updateControl();
      });
      updateControl();
    };
    motionButton.addEventListener("click", () => {
      if (mediaFailed) {
        mediaFailed = false;
        video.load();
      }
      if (video.paused || !shouldPlay()) {
        userPaused = false;
        explicitPlay = true;
      } else {
        userPaused = true;
      }
      updateMotion();
    });
    video.addEventListener("play", updateControl);
    video.addEventListener("pause", updateControl);
    video.addEventListener("error", () => {
      mediaFailed = true;
      updateControl();
    });
    motionPreference.addEventListener("change", () => {
      explicitPlay = false;
      updateMotion();
    });
    document.addEventListener("visibilitychange", updateMotion);
    gate.addEventListener("close", () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    });
    shell.inert = true;
    document.body.classList.add("dialog-open");
    gate.showModal();
    updateMotion();
    gate.addEventListener("cancel", (event) => event.preventDefault());
    $("#gate-yes").addEventListener("click", () => {
      try {
        sessionStorage.setItem("spirits-age-confirmed", "yes");
      } catch {
        /* Still allow this page when storage is unavailable. */
      }
      gate.close();
      shell.inert = false;
      document.body.classList.remove("dialog-open", "age-pending");
      $(".wordmark")?.focus({ preventScroll: true });
    });
    $("#gate-no").addEventListener("click", () => {
      $(".age-actions").hidden = true;
      $("#age-denied").hidden = false;
      $("#age-denied").focus({ preventScroll: true });
    });
  }
  if (ageConfirmed) {
    shell.inert = false;
    document.body.classList.remove("age-pending");
  }
  $$('[role="tablist"]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    /** @param {HTMLElement} tab */
    const select = (tab) =>
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
        const panel = /** @type {HTMLElement} */ (
          document.getElementById(
            /** @type {string} */ (item.getAttribute("aria-controls")),
          )
        );
        panel.hidden = !active;
      });
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft")
          next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          select(tabs[next]);
          tabs[next].focus();
        }
      });
    });
  });
  const privacy = /** @type {HTMLDialogElement} */ ($("#privacy-dialog"));
  /** @type {HTMLElement | undefined} */
  let previousFocus;
  $$("[data-privacy]").forEach((button) =>
    button.addEventListener("click", () => {
      previousFocus = button;
      privacy.showModal();
      document.body.classList.add("dialog-open");
    }),
  );
  $("[data-close-dialog]")?.addEventListener("click", () => privacy.close());
  privacy?.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    previousFocus?.focus();
  });
  $$("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
  if (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    "IntersectionObserver" in window
  ) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    $$(".reveal").forEach((el) => {
      el.classList.add("will-reveal");
      observer.observe(el);
    });
  }
})();
