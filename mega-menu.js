(() => {
  "use strict";

  function initialiseBrandMenu() {
    const header = document.querySelector(".site-header");
    if (!header || document.getElementById("brand-menu")) return;

    const collectionLink = header.querySelector(".desktop-nav a:last-child");
    const mobileTrigger = header.querySelector(".menu-toggle");
    const desktopTrigger = document.createElement("button");
    desktopTrigger.type = "button";
    desktopTrigger.className = "mega-menu-trigger";
    desktopTrigger.innerHTML = 'Explore the brands <span aria-hidden="true">＋</span>';
    collectionLink?.replaceWith(desktopTrigger);
    document.getElementById("mobile-nav")?.remove();

    const brands = [
      {
        id: "mountain",
        name: "Mountain",
        category: "Vodka premix",
        detail: "Fruit Tingle",
        line: "A brighter perspective.",
        href: "/",
        image: "/assets/mountain-campaign.webp",
      },
      {
        id: "bensons",
        name: "Benson’s",
        category: "Bourbon & cola",
        detail: "The original. Double Black.",
        line: "Real bourbon. No compromise.",
        href: "/bensons/",
        image: "/assets/bensons-campaign.webp",
      },
      {
        id: "nightbird",
        name: "Nightbird",
        category: "Vodka",
        detail: "40% alc/vol · 700ml",
        line: "A spirit less ordinary.",
        href: "/nightbird/",
        image: "/assets/nightbird-campaign.webp",
      },
    ];
    const currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
    const dialog = document.createElement("dialog");
    dialog.id = "brand-menu";
    dialog.className = "mega-menu";
    dialog.setAttribute("aria-labelledby", "brand-menu-title");
    dialog.innerHTML = `
      <div class="mega-menu-inner">
        <div class="mega-menu-top">
          <p class="mega-menu-kicker"><span class="mega-menu-symbol" aria-hidden="true"><i></i><i></i><i></i></span> The collection <span class="mega-menu-count">01 — 03</span></p>
          <button class="mega-menu-close" type="button" aria-label="Close brand menu" autofocus>
            <span>Close</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div class="mega-menu-intro">
          <h2 id="brand-menu-title">Choose your <em>spirit.</em></h2>
          <p>Three brands.<br> Distinctly their own.</p>
        </div>
        <nav aria-label="Explore our brands">
          <ol class="mega-menu-brands"></ol>
        </nav>
        <div class="mega-menu-bottom">
          <a class="mega-menu-collection" href="/collection/"><span>See the whole collection</span><span aria-hidden="true">↗</span></a>
          <nav class="mega-menu-local" aria-label="On this page" hidden><span>On this page</span></nav>
        </div>
        <p class="mega-menu-responsible"><span>Distinct in character. Shared in spirit.</span><span>18+ · Please enjoy responsibly.</span></p>
      </div>`;
    document.body.append(dialog);

    const list = /** @type {HTMLOListElement} */ (dialog.querySelector(".mega-menu-brands"));
    const localNav = /** @type {HTMLElement} */ (dialog.querySelector(".mega-menu-local"));
    /** @type {Map<string, HTMLImageElement>} */
    const brandImages = new Map();

    brands.forEach((brand, index) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = brand.href;
      link.className = `mega-menu-brand mega-menu-brand-${brand.id}`;
      const isCurrent = brand.href === currentPath;
      if (isCurrent) link.setAttribute("aria-current", "page");
      link.innerHTML = `
        <span class="mega-menu-card-meta"><span>0${index + 1} / ${brand.category}</span>${isCurrent ? '<span class="mega-menu-current">You’re here</span>' : ""}</span>
        <span class="mega-menu-brand-heading"><span class="mega-menu-brand-name">${brand.name}</span><span class="mega-menu-brand-line">${brand.line}</span></span>
        <span class="mega-menu-brand-image" aria-hidden="true"></span>
        <span class="mega-menu-card-bottom"><span class="mega-menu-brand-copy"><span class="mega-menu-brand-detail">${brand.detail}</span><span class="mega-menu-brand-action">Enter ${brand.name}</span></span><span class="mega-menu-brand-arrow" aria-hidden="true">↗</span></span>`;
      const image = document.createElement("img");
      image.alt = "";
      image.width = 1672;
      image.height = 941;
      image.decoding = "async";
      // Fetch only when the menu is opened; all three images are then visible.
      image.addEventListener("load", () => image.classList.add("is-loaded"));
      link.querySelector(".mega-menu-brand-image")?.append(image);
      brandImages.set(brand.id, image);
      item.append(link);
      list.append(item);
    });

    header.querySelectorAll('.desktop-nav a[href^="#"]').forEach((anchor) => {
      const shortcut = document.createElement("a");
      shortcut.href = anchor.getAttribute("href") || "#main";
      shortcut.textContent = anchor.textContent;
      shortcut.addEventListener("click", () => dialog.close());
      localNav.append(shortcut);
      localNav.hidden = false;
    });
    const fullCollection = dialog.querySelector(".mega-menu-collection");
    if (currentPath === "/collection/") fullCollection?.setAttribute("aria-current", "page");

    /** @type {HTMLElement[]} */
    const triggers = [desktopTrigger];
    if (mobileTrigger instanceof HTMLElement) triggers.push(mobileTrigger);
    /** @type {HTMLElement | null} */
    let returnFocus = null;

    triggers.forEach((trigger) => {
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-controls", dialog.id);
      trigger.setAttribute("aria-expanded", "false");
      trigger.addEventListener("click", () => {
        const shell = document.getElementById("site-shell");
        if (document.body.classList.contains("age-pending") || shell?.inert || document.querySelector("dialog[open]")) return;
        returnFocus = trigger;
        brands.forEach((brand) => {
          const image = brandImages.get(brand.id);
          if (image && !image.getAttribute("src")) image.src = brand.image;
        });
        dialog.showModal();
        dialog.scrollTop = 0;
        document.body.classList.add("dialog-open");
        triggers.forEach((button) => button.setAttribute("aria-expanded", "true"));
      });
    });

    dialog.querySelector(".mega-menu-close")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = [.../** @type {NodeListOf<HTMLElement>} */ (
        dialog.querySelectorAll('a[href], button:not([disabled])')
      )].filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    let backdropPress = false;
    /** @param {MouseEvent} event */
    function outsideDialog(event) {
      const bounds = dialog.getBoundingClientRect();
      return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    }
    dialog.addEventListener("pointerdown", (event) => {
      backdropPress = event.target === dialog && outsideDialog(event);
    });
    dialog.addEventListener("click", (event) => {
      if (backdropPress && event.target === dialog && outsideDialog(event)) dialog.close();
      backdropPress = false;
    });
    dialog.addEventListener("close", () => {
      triggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
      if (!document.querySelector("dialog[open]")) document.body.classList.remove("dialog-open");
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseBrandMenu, { once: true });
  } else {
    initialiseBrandMenu();
  }
})();
