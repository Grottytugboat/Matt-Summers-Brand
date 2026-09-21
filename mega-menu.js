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
    desktopTrigger.innerHTML =
      'Explore the brands <span aria-hidden="true">＋</span>';
    collectionLink?.replaceWith(desktopTrigger);
    document.getElementById("mobile-nav")?.remove();

    const brands = [
      {
        id: "mountain",
        name: "Mountain",
        detail: "Fruit Tingle · Vodka premix",
        line: "A brighter perspective.",
        href: "/",
        image: "/assets/mountain-campaign.webp",
      },
      {
        id: "bensons",
        name: "Benson’s",
        detail: "Bourbon with cola",
        line: "Real bourbon. No compromise.",
        href: "/bensons/",
        image: "/assets/bensons-campaign.webp",
      },
      {
        id: "nightbird",
        name: "Nightbird",
        detail: "Vodka · 40% alc/vol · 700ml",
        line: "A spirit of distinction.",
        href: "/nightbird/",
        image: "/assets/nightbird-campaign.webp",
      },
    ];
    const currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
    const currentBrand = brands.find((brand) => brand.href === currentPath);
    const initialBrand = currentBrand || brands[2];
    const dialog = document.createElement("dialog");
    dialog.id = "brand-menu";
    dialog.className = "mega-menu";
    dialog.setAttribute("aria-labelledby", "brand-menu-title");
    dialog.innerHTML = `
      <div class="mega-menu-inner">
        <div class="mega-menu-top">
          <p class="mega-menu-kicker"><span class="mega-menu-spark" aria-hidden="true">✳</span> The collection</p>
          <button class="mega-menu-close" type="button" aria-label="Close brand menu" autofocus>
            <span>Close</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div class="mega-menu-main">
          <div class="mega-menu-directory">
            <div class="mega-menu-intro">
              <h2 id="brand-menu-title">A collection<br>of <em>character.</em></h2>
              <p>Three distinct spirits. Find your perspective.</p>
            </div>
            <nav aria-label="Explore our brands">
              <ol class="mega-menu-brands"></ol>
            </nav>
          </div>
          <figure class="mega-menu-preview" aria-hidden="true">
            <div class="mega-menu-preview-art"></div>
            <div class="mega-menu-preview-shade"></div>
            <span class="mega-menu-preview-label">Discover a different spirit</span>
            <figcaption><p class="mega-menu-preview-name"></p><p class="mega-menu-preview-line"></p></figcaption>
            <span class="mega-menu-preview-arrow" aria-hidden="true">↗</span>
          </figure>
        </div>
        <nav class="mega-menu-local" aria-label="On this page" hidden><span>On this page</span></nav>
        <div class="mega-menu-bottom">
          <a class="mega-menu-collection" href="/collection/">Explore the full collection <span aria-hidden="true">↗</span></a>
          <p>Distinct in character. Shared in spirit.<span>18+ · Please enjoy responsibly.</span></p>
        </div>
      </div>`;
    document.body.append(dialog);

    const list = /** @type {HTMLOListElement} */ (
      dialog.querySelector(".mega-menu-brands")
    );
    const artwork = /** @type {HTMLDivElement} */ (
      dialog.querySelector(".mega-menu-preview-art")
    );
    const preview = /** @type {HTMLElement} */ (
      dialog.querySelector(".mega-menu-preview")
    );
    const previewName = /** @type {HTMLParagraphElement} */ (
      dialog.querySelector(".mega-menu-preview-name")
    );
    const previewLine = /** @type {HTMLParagraphElement} */ (
      dialog.querySelector(".mega-menu-preview-line")
    );
    const localNav = /** @type {HTMLElement} */ (
      dialog.querySelector(".mega-menu-local")
    );
    /** @type {Map<string, HTMLImageElement>} */
    const previewImages = new Map();
    /** @type {Map<string, HTMLImageElement>} */
    const thumbnails = new Map();
    /** @type {Map<string, HTMLAnchorElement>} */
    const brandLinks = new Map();
    const mobileLayout = window.matchMedia("(max-width: 760px)");
    let selectedBrand = initialBrand.id;

    /** @param {typeof brands[number]} brand */
    function selectPreview(brand) {
      selectedBrand = brand.id;
      brandLinks.forEach((link, id) =>
        link.classList.toggle("is-previewed", id === brand.id),
      );
      if (mobileLayout.matches) return;
      const image = previewImages.get(brand.id);
      if (!image) return;
      if (!image.getAttribute("src")) image.src = brand.image;
      if (image.complete && image.naturalWidth > 0) revealPreview(brand);
    }

    /** @param {typeof brands[number]} brand */
    function revealPreview(brand) {
      if (selectedBrand !== brand.id) return;
      previewImages.forEach((image, id) =>
        image.classList.toggle("is-visible", id === brand.id),
      );
      preview.dataset.brand = brand.id;
      previewName.textContent = brand.name;
      previewLine.textContent = brand.line;
    }

    brands.forEach((brand, index) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = brand.href;
      link.className = `mega-menu-brand mega-menu-brand-${brand.id}`;
      if (brand.href === currentPath) link.setAttribute("aria-current", "page");
      link.innerHTML = `
        <span class="mega-menu-number" aria-hidden="true">0${index + 1}</span>
        <span class="mega-menu-brand-copy"><span class="mega-menu-brand-name">${brand.name}</span><span class="mega-menu-brand-detail">${brand.detail}</span></span>
        <span class="mega-menu-brand-image" aria-hidden="true"></span>
        <span class="mega-menu-brand-arrow" aria-hidden="true">↗</span>`;
      const thumbnail = document.createElement("img");
      thumbnail.alt = "";
      thumbnail.width = 96;
      thumbnail.height = 112;
      thumbnail.decoding = "async";
      link.querySelector(".mega-menu-brand-image")?.append(thumbnail);
      thumbnails.set(brand.id, thumbnail);
      item.append(link);
      list.append(item);
      brandLinks.set(brand.id, link);
      link.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "touch") selectPreview(brand);
      });
      link.addEventListener("focus", () => selectPreview(brand));

      const image = document.createElement("img");
      image.alt = "";
      image.className = `mega-menu-campaign mega-menu-campaign-${brand.id}`;
      image.width = 1024;
      image.height = 1024;
      image.decoding = "async";
      image.addEventListener("load", () => revealPreview(brand));
      artwork.append(image);
      previewImages.set(brand.id, image);
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
    if (currentPath === "/collection/")
      fullCollection?.setAttribute("aria-current", "page");

    /** @type {HTMLElement[]} */
    const triggers = [desktopTrigger];
    if (mobileTrigger instanceof HTMLElement) triggers.push(mobileTrigger);
    /** @type {HTMLElement | null} */
    let returnFocus = null;

    function loadVisibleImages() {
      if (mobileLayout.matches) {
        brands.forEach((brand) => {
          const image = thumbnails.get(brand.id);
          if (image && !image.getAttribute("src")) image.src = brand.image;
        });
      } else {
        selectPreview(
          brands.find((brand) => brand.id === selectedBrand) || initialBrand,
        );
      }
    }

    triggers.forEach((trigger) => {
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-controls", dialog.id);
      trigger.setAttribute("aria-expanded", "false");
      trigger.addEventListener("click", () => {
        const shell = document.getElementById("site-shell");
        if (
          document.body.classList.contains("age-pending") ||
          shell?.inert ||
          document.querySelector("dialog[open]")
        )
          return;
        returnFocus = trigger;
        selectedBrand = initialBrand.id;
        brandLinks.forEach((link, id) =>
          link.classList.toggle("is-previewed", id === selectedBrand),
        );
        loadVisibleImages();
        dialog.showModal();
        dialog.scrollTop = 0;
        document.body.classList.add("dialog-open");
        triggers.forEach((button) =>
          button.setAttribute("aria-expanded", "true"),
        );
      });
    });

    dialog
      .querySelector(".mega-menu-close")
      ?.addEventListener("click", () => dialog.close());
    let backdropPress = false;
    /** @param {MouseEvent} event */
    function outsideDialog(event) {
      const bounds = dialog.getBoundingClientRect();
      return (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      );
    }
    dialog.addEventListener("pointerdown", (event) => {
      backdropPress = event.target === dialog && outsideDialog(event);
    });
    dialog.addEventListener("click", (event) => {
      if (backdropPress && event.target === dialog && outsideDialog(event))
        dialog.close();
      backdropPress = false;
    });
    dialog.addEventListener("close", () => {
      triggers.forEach((trigger) =>
        trigger.setAttribute("aria-expanded", "false"),
      );
      if (!document.querySelector("dialog[open]"))
        document.body.classList.remove("dialog-open");
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    });
    mobileLayout.addEventListener("change", () => {
      if (dialog.open) loadVisibleImages();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseBrandMenu, {
      once: true,
    });
  } else {
    initialiseBrandMenu();
  }
})();
