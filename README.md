# Savage Spirits — Brand Showcase

Five responsive destinations built from the existing Matt Summers project. Savage Spirits is the working parent identity, pending name confirmation:

- `/` — the Savage Spirits parent showcase, introducing the portfolio.
- `/mountain/` — Mountain Fruit Tingle, with a contemporary black, ivory and citrus-green identity.
- `/bensons/` — Benson’s Original Double Black, in warm black, cream and antique gold.
- `/nightbird/` — Nightbird Vodka, with an Art Deco identity in midnight blue and champagne gold.
- `/collection/` — the editorial collection, with direct links to each brand.

This version is a presentation showcase. There are no prices, cart, checkout, orders or newsletter collection. A public contact destination can be added when approved details are supplied. Pages request no search indexing while the showcase is under review.

## Preview

The browser runtime has no dependencies. For a quick local preview, serve this folder using a static web server, for example:

```sh
python3 -m http.server 4173
```

Open http://localhost:4173. Root-relative asset links mean the site should be served, rather than opened directly as a file.

## Development validation

Use Node.js 22.13 or newer. Install the development tools, run the required checks, and prepare the public files:

```sh
npm ci
npm run lint
npm run typecheck
npm run build
```

ESLint checks the shared browser and mega-menu scripts, and TypeScript checks their JavaScript and JSDoc against browser DOM types without emitting code. These tools are development dependencies only. The build copies the public site into `dist/`; development tools and project configuration are excluded from deployment.

## Deployment

Import this repository into Vercel using the **Other** framework preset and repository root. `vercel.json` configures `npm run build`, the `dist/` output directory, clean routes, preview indexing headers and basic response headers. The deployed site remains static and dependency-free at runtime.

## Behaviour and accessibility

- An 18+ confirmation dialog appears once per browser session, shared between the five routes.
- The page stays unavailable until age confirmation; rejection leaves the gate in place.
- Session-storage restrictions are handled without breaking the current-page experience.
- Product tabs support arrow keys, Home and End; mobile menus support Escape.
- Native dialogs manage focus for age confirmation and privacy information.
- Reduced-motion preferences are respected. No animated 3D runtime is required.
- Fonts and images are served locally; campaign images have dedicated mobile compositions.

## Assets and copy

The original user-supplied Mountain image appears in the product detail section. Campaign imagery was generated from supplied Mountain and Benson’s references using the built-in image generation tool. See `assets/IMAGE-PROMPTS.md` for full prompts. Optimised `.webp` versions are committed and deployed; high-resolution PNG working originals remain local.

Product facts are limited to the supplied artwork: Mountain Fruit Tingle / vodka / 7% alc/vol; Benson’s Double Black / bourbon with cola / 6.5% ABV / 375 mL. No unconfirmed ranges, can sizes, stockists, awards, manufacturing claims or company-ownership relationships are published. Campaign visuals are presentation concepts, not approved final packaging photography.

## Verification

Browser verification covers all five routes at 320, 390, 768 and 1440 px, image loading, layout overflow, age acceptance/rejection, session navigation, product tabs and keyboard controls, mobile menus, and the privacy dialog. Generated imagery and desktop/mobile screenshots are visually reviewed before deployment.

## Nightbird and the shared navigation

Nightbird uses supplied bottle references: vodka, 40% alc/vol, 700 mL, 22 standard drinks. Its campaign images have independent desktop and mobile compositions. The shared mega menu provides direct access to all three brands, a full-collection link, three cinematic brand cards and mobile page shortcuts. It supports keyboard focus, Escape, backdrop dismissal and focus restoration.

The full-screen age introduction uses the user-supplied bird film with route-specific branding, muted playback, pause/play and retry controls. The film is trimmed, stripped of audio and served locally with a nonblack poster. It is requested only for visitors who need age confirmation; reduced-motion visitors see the still poster until they explicitly choose playback. Playback pauses when the page is hidden and stops when the gate closes. The film does not replace or weaken age confirmation.

The home page introduces the parent brand and its portfolio. The dedicated Mountain page introduces Mountain’s visual spirit before Fruit Tingle. Benson’s uses a warm, framed brand story and classic serving ritual. Nightbird includes keyboard-accessible bottle-detail exploration. A sticky main header keeps brand navigation available throughout the pages, while the collection provides an editorial introduction to each brand.

## Parent brand architecture

The homepage leads with Savage Spirits as the working parent identity, drawn from the supplied catalogue name. Mountain now has its own `/mountain/` product route, alongside Benson’s and Nightbird. The homepage includes a combined product still life, parent brand philosophy and accessible filters for spirits and ready-to-serve products. Shared navigation and breadcrumbs keep the parent home reachable from every brand. The brand name remains a presentation choice pending final confirmation; the site makes no claims about legal ownership or distribution coverage.

## Brand Studio demonstration

`/studio/` is a shareable, public planning demonstration, linked from the parent homepage footer. It is not an authenticated administration area. Do not use it for confidential information or real customer/creator records.

The six views cover portfolio overview, the planned Nightbird campaign, storyboard reviews, goals and readiness, illustrative results, and the parent-name shortlist. It includes three creator slots, three creative concepts, a relative four-week launch plan, editable dates and objectives, twelve milestones, estimates and a simple order-economics calculator. All commitments, fees, sample creators and performance remain explicitly proposed or unconnected. No outreach, publishing, media buying or enquiries are performed.

Changes are saved to this browser's local storage under `brand-studio-demo-v1`, with a visible fallback if storage is unavailable. They are not shared between Matt and Tim. The export button offers a formatted HTML plan (readable in a browser and printable to PDF) and a JSON backup of the full plan and local edits. Reset asks for confirmation and affects only the current browser's demo. Name selection previews the chosen name in the workspace without renaming the public site.

The build publishes only the two intended planning documents from `docs/`; source notes and tests are not copied. `/docs/nightbird-launch-plan.md` describes the proposed pilot and `/docs/parent-name-options.md` records creative naming options and preliminary research. Naming research is not a trademark or domain clearance.

To become a real private workspace, the next stage requires authentication, authorised roles, shared storage and an approval history tied to actual accounts. Personal-data capture and live attribution must be designed and connected before launching an enquiry campaign. Ecommerce remains outside this release.

Run `npm run test:studio` with the local server running on port 4173 and Google Chrome installed. Use `STUDIO_BASE_URL` to verify a deployed preview. The test uses an isolated browser context and never submits data to external services.
