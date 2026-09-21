# Matt Summers Brand

**MOUNTAIN — Fruit Tingle** · a bright, flavour-forward concept store for a 7% vodka soda with wild fruit. Single-page site with an age gate, parallax hero can, colour-blocked flavour panels, a sticky big-type moment, shop with a working concept cart, and a "Hello YES!" subscribe block.

## Run it

No build step, no dependencies, works offline.

```bash
# option 1 — just open it
open index.html

# option 2 — serve it
python3 -m http.server 8000
# → http://localhost:8000
```

## What's inside

- **`index.html`** — page structure (age gate, hero, marquee, flavours, PREMIX moment, shop, subscribe, footer, cart drawer)
- **`styles.css`** — light "paper + ink + flavour colour" design system, fully responsive
- **`app.js`** — everything visual is generated in code at runtime:
  - procedural canvas artwork for every can (one colourway per flavour), the poster, and all floating fruit
  - a lerped scroll-parallax engine (hero can lags/drifts/fades, flavour cans drift, floating fruit fly at different speeds, sticky PREMIX section scales/rotates the can while the type slides apart)
  - concept cart with drawer, quantities and toasts
- **`vendor/` + `fonts/`** — vendored locally so the site runs with zero network

## Notes

- Design concept inspired by the energy of kirinhyoketsu.com.au; all artwork, copy and code here are original and generated procedurally.
- Fonts: Bebas Neue, Kaushan Script, Space Grotesk (Google Fonts, vendored).
- Concept store only — no real checkout; please enjoy responsibly.
