# Mountain & Benson’s — Brand Showcase

Three responsive brand experiences built from the existing Matt Summers project:

- `/` — Mountain Fruit Tingle, with a contemporary black, ivory and citrus-green identity.
- `/bensons/` — Benson’s Original Double Black, in warm black, cream and antique gold.
- `/collection/` — a neutral portfolio page connecting the brands without inventing a parent company.

This version is a presentation showcase. There are no prices, cart, checkout, orders or newsletter collection. A public contact destination can be added when approved details are supplied. Pages request no search indexing while the showcase is under review.

## Preview

No dependencies or build step are needed. Serve this folder using a static web server, for example:

```sh
python3 -m http.server 4173
```

Open http://localhost:4173. Root-relative asset links mean the site should be served, rather than opened directly as a file.

## Deployment

Import this repository into Vercel using the **Other** framework preset and repository root. No build command or output-directory override is required. `vercel.json` supplies clean routes, preview indexing headers and basic response headers.

## Behaviour and accessibility

- An 18+ confirmation dialog appears once per browser session, shared between the three routes.
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

Browser checks cover all three routes at 320, 390, 768 and 1440 px, image loading, layout overflow, age acceptance/rejection, session navigation, product tabs and keyboard controls, mobile menus, and the privacy dialog. Generated imagery and desktop/mobile screenshots are visually reviewed before deployment.
