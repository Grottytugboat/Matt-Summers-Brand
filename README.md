# Mountain, Benson’s & Nightbird — Brand Showcase

Four responsive brand experiences built from the existing Matt Summers project:

- `/` — Mountain Fruit Tingle, with a contemporary black, ivory and citrus-green identity.
- `/bensons/` — Benson’s Original Double Black, in warm black, cream and antique gold.
- `/nightbird/` — Nightbird Vodka, with an Art Deco identity in midnight blue and champagne gold.
- `/collection/` — a neutral portfolio page connecting the brands without inventing a parent company.

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

- An 18+ confirmation dialog appears once per browser session, shared between the four routes.
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

Browser checks cover all four routes at 320, 390, 768 and 1440 px, image loading, layout overflow, age acceptance/rejection, session navigation, product tabs and keyboard controls, mobile menus, and the privacy dialog. Generated imagery and desktop/mobile screenshots are visually reviewed before deployment.

## Nightbird and the shared navigation

Nightbird uses supplied bottle references: vodka, 40% alc/vol, 700 mL, 22 standard drinks. Its campaign images have independent desktop and mobile compositions. The shared mega menu provides direct access to all three brands, a full-collection link, three cinematic brand cards and mobile page shortcuts. It supports keyboard focus, Escape, backdrop dismissal and focus restoration.

The full-screen age introduction uses the user-supplied bird film with route-specific branding, muted playback, pause/play and retry controls. The film is trimmed, stripped of audio and served locally with a nonblack poster. It is requested only for visitors who need age confirmation; reduced-motion visitors see the still poster until they explicitly choose playback. Playback pauses when the page is hidden and stops when the gate closes. The film does not replace or weaken age confirmation.

The home page introduces Mountain’s visual spirit before Fruit Tingle. Benson’s uses a warm, framed brand story and classic serving ritual. Nightbird includes keyboard-accessible bottle-detail exploration. A sticky main header keeps brand navigation available throughout the pages, while the collection provides an editorial introduction to each brand.
