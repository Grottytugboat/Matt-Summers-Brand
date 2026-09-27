# Mountain Fruit Tingle: campaign redesign

Date: 27 September 2026

The Mountain page is rebuilt as a product-led, scroll-linked brand experience inspired by the visual approach of the user-supplied Jim Beam News reference. It does not reuse Jim Beam branding, copy or campaign assets.

## Scope

- Replaces mountain/index.html; adds mountain/experience.css and mountain/experience.js.
- Uses the existing mountain-original.webp image and repository font definitions. The SVG silhouette is derived from the supplied can artwork.
- Leaves the company, Benson's, Nightbird, collection, shared navigation and studio files unchanged relative to brand-showcase commit 64c3d47f1153013989f26da40a1027ed224dc027.
- Uses the existing spirits-age-confirmed session key for compatibility with the portfolio.
- The existing build recursively copies the mountain directory, so no build configuration change is required.

## Interaction and accessibility

Responsive sticky product reveal; pause control and system reduced-motion support; keyboard mobile menu; native age, enquiry and privacy dialogs; close-up product view; native product accordions; original inbound #discover, #details and #the-serve anchors retained.

Trade enquiries remain a clearly labelled copy-only prototype with a selectable-text fallback. No form backend, checkout, payment processing or tracking pixels have been added. No unconfirmed flavours, prices, stock levels or pack sizes have been introduced.

## Validation

36 local Chromium checks passed, including 13 viewport sizes from 320 to 2560 pixels, mobile landscape, age acceptance/denial, keyboard closing and focus return, menu states, reduced motion, manual motion controls, scroll scene progression, product views, form validation, safe text handling, clearing personal fields, internal anchors, loaded images and horizontal overflow. JavaScript syntax checked with node --check.

Tests ran against the authored HTML/CSS/JS in an offline browser. Repository Bebas Neue was loaded into the test browser in memory, not added as a new downloadable font asset. The full existing portfolio npm build was not run locally; production status should be verified against the resulting Git commit in Vercel.
