(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const shell = $("#site-shell");
  const gate = $("#age-gate");
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
    });
  }
  if (ageConfirmed) {
    shell.inert = false;
    document.body.classList.remove("age-pending");
  }
  const menuButton = $(".menu-toggle");
  const menu = $("#mobile-nav");
  function closeMenu(restoreFocus = false) {
    menuButton?.setAttribute("aria-expanded", "false");
    if (menu) menu.hidden = true;
    document.body.classList.remove("menu-open");
    if (restoreFocus) menuButton.focus();
  }
  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
  });
  $$("#mobile-nav a").forEach((link) =>
    link.addEventListener("click", () => closeMenu()),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu?.hidden) closeMenu(true);
  });
  window
    .matchMedia("(min-width: 901px)")
    .addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
  $$('[role="tablist"]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    const select = (tab) =>
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
        document.getElementById(item.getAttribute("aria-controls")).hidden =
          !active;
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
  const privacy = $("#privacy-dialog");
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
    el.textContent = new Date().getFullYear();
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
