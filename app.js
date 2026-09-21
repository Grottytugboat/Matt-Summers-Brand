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
  if (gate) {
    gate.innerHTML = `
      <div class="age-experience">
        <div class="age-atmosphere" aria-hidden="true">
          <div class="age-orbit"></div>
          <div class="age-flight">
            <svg class="age-bird" viewBox="0 0 240 140" focusable="false" aria-hidden="true">
              <g class="age-bird-left"><path d="M120 79C97 65 83 28 17 18c20 15 36 35 52 49-17-8-34-19-48-18 28 16 48 29 76 37l21 9Z"/></g>
              <g class="age-bird-right"><path d="M120 79c23-14 37-51 103-61-20 15-36 35-52 49 17-8 34-19 48-18-28 16-48 29-76 37l-21 9Z"/></g>
              <path d="M117 74c-2-8-1-15 3-19 3 4 5 11 3 19l6 18-2 18 11 20-18-10-18 10 11-20-2-18Z"/>
            </svg>
          </div>
        </div>
        <div class="age-masthead"><span>THE COLLECTION</span><span>DISTINCTIVE SPIRITS</span></div>
        <div class="age-card">
          <p class="eyebrow">A COLLECTION OF CHARACTER</p>
          <h2 id="age-title">Before we<br><em>take flight.</em></h2>
          <div class="age-rule" aria-hidden="true"></div>
          <p id="age-description">Are you 18 or over and of legal drinking age in your location?</p>
          <div class="age-actions">
            <button class="button button-lime" id="gate-yes" type="button">Yes, I’m 18+ <span aria-hidden="true">↗</span></button>
            <button class="age-no" id="gate-no" type="button">I’m under 18</button>
          </div>
          <div class="age-denied" id="age-denied" role="status" tabindex="-1" hidden><p>We’ll save the discovery for another time.</p><p>This collection is for adults 18 and over who are of legal drinking age in their location.</p></div>
          <p class="age-note">GOOD SPIRITS. GROWN-UP COMPANY.</p>
        </div>
        <div class="age-bottom"><p>PLEASE ENJOY RESPONSIBLY.</p><button class="age-motion" id="age-motion" type="button" aria-pressed="false">Pause motion</button></div>
      </div>`;
    const motionButton = /** @type {HTMLButtonElement} */ ($("#age-motion"));
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let motionPaused = false;
    const updateMotion = () => {
      const stopped = motionPaused || motionPreference.matches;
      gate.classList.toggle("age-motion-paused", stopped);
      motionButton.setAttribute("aria-pressed", String(stopped));
      motionButton.disabled = motionPreference.matches;
      motionButton.textContent = motionPreference.matches
        ? "Reduced motion"
        : motionPaused
          ? "Resume motion"
          : "Pause motion";
    };
    motionButton.addEventListener("click", () => {
      motionPaused = !motionPaused;
      updateMotion();
    });
    motionPreference.addEventListener("change", updateMotion);
    updateMotion();
  }
  let ageConfirmed = false;
  try {
    ageConfirmed = sessionStorage.getItem("spirits-age-confirmed") === "yes";
  } catch {
    /* Session storage may be disabled. */
  }
  if (gate && !ageConfirmed) {
    shell.inert = true;
    document.body.classList.add("dialog-open");
    gate.showModal();
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
