# Campaign image provenance

These campaign assets are AI-generated, reference-led product mockup photographs made with the built-in image generation tool. Product packaging references were supplied by the client. They are intended as website campaign artwork, not documentary photographs.

## Mountain — `mountain-campaign.png`

- Mode: built-in `image_gen`.
- Reference: client-provided `image.jpg` showing the black Mountain Vodka Fruit Tingle can.
- Output: 1672 × 941 landscape PNG.
- Visual check: Mountain, Vodka, Fruit Tingle, and 7% ALC/VOL labels are legible; complete can and dark left-hand copy space are present. The image uses the supplied artwork as a reference rather than guaranteeing pixel-identical packaging reproduction.

### Final prompt

```text
Use case: product-mockup
Asset type: wide premium drinks website hero photograph, landscape 16:9.
Primary request: Create an exceptionally polished photographic campaign scene using the supplied black Mountain Vodka Fruit Tingle can as the exact product reference.
Input images: Image 1 is the exact product and label reference. Preserve its can silhouette and label artwork faithfully.
Scene/backdrop: Black wet volcanic stone tabletop fading into a deep black, subtly forest-toned studio backdrop. Elegant real orange and lime segments and a few raspberries and blackberries sit beside the can, physically separate from the fruit depicted on its label.
Subject: One upright Mountain Vodka Fruit Tingle can in the right third of the image, completely visible including both rims; can fills roughly 78 percent of image height. Keep actual black can, intricate citrus and gold leaf artwork, silver angular Mountain emblem, understated gold MOUNTAIN VODKA lettering, vivid pink and blue Fruit Tingle script, and precise 7% ALC/VOL marking. The product branding must be legible.
Style/medium: Hyper-real luxury beverage advertising photography, highly art-directed, restrained, tactile and premium. Crisp metallic highlights and sharply resolved condensation droplets, realistic fruit skin and pulp.
Composition/framing: Wide landscape framing. Can at x=72 percent, with supporting fruit low and to its right. Leftmost 45 percent must remain clean, dark, quiet negative space for website typography, with no object or bright highlight there. Fine reflection below the can, low viewpoint, generous upper breathing room.
Lighting/mood: Low-key studio lighting, precise pale rim light and warm citrus highlight, very subtle natural lime-green reflection on the wet stone. Backdrop stays almost black.
Constraints: The supplied product identity is invariant. Preserve exact brand names and 7% ALC/VOL label. No added text or headlines outside the existing can. No people. No new logos. No invented awards or certification. No cheesy neon glow, smoke, fantasy splash effects, or excessive props. No extra cans. No borders or watermarks.
```

## Benson’s — `bensons-campaign.png`

- Mode: built-in `image_gen`.
- References: client-provided `IMG_0442.jpg` campaign poster and `IMG_0444.jpg` photograph of the actual can and carton.
- Output: 1672 × 941 landscape PNG.
- Visual check: Benson’s Original, Double Black, Bourbon with Cola, 6.5% ABV and 375ml are legible. Complete can and clean dark left-hand headline space are present. Label uses the supplied artwork as a reference rather than guaranteeing pixel-identical packaging reproduction.

### Final prompt

```text
Use case: product-mockup
Asset type: Wide 16:9 luxury beverage brand website hero photograph.
Primary request: Create a new photorealistic, ultra-premium Benson's Original Double Black Bourbon with Cola campaign product photograph based faithfully on the supplied actual can references.
Input images: Image 1 is a reference for the black Benson's can front label, old-gold palette and warm studio mood; Image 2 is the authoritative actual product reference for can proportions, cream Benson's lettering, ornamental gold lines, red 6.5% seal and 375ml label.
Scene/backdrop: Deep black studio setting on dark timber, with one softly blurred oak barrel far behind the can on the right.
Subject: Exactly one upright unopened black Benson's 375ml can with crisp realistic condensation. One elegant smoked-glass low tumbler with cola and sculptural clear ice beside the can.
Composition/framing: Cinematic landscape 16:9 composition. Complete can including top and base occupies the right third and about 78% of frame height; tumbler close beside it to the right without obscuring the front label. Entire left half is quiet clean deep-black negative space for a website headline. Preserve generous breathing room. Eye-level product camera, exquisitely sharp can front, soft-background depth.
Lighting/mood: Refined low-key commercial studio lighting, restrained warm old-gold edge highlights, subtle cream label light, beautifully natural silver rim specularity, rich black with detail.
Materials/textures: Black lacquered aluminum can, gold filigree, cream vintage serif lettering, red seal, real fine water droplets, dark oak timber grain, amber liquid and clear ice.
Text on can only, faithful to reference: "BENSON'S" "ORIGINAL" "DOUBLE" "BLACK" "BOURBON" "with Cola" "6.5%" "ABV" "375ml". Preserve actual label spelling, cream lettering, gold ornament, red seal and can shape accurately.
Constraints: The only text is the printed actual product label. Absolutely no added poster typography, no slogans, no overlay lettering, no watermarks, no invented brands, no people, no hands, no bottle caps, no packaging boxes. Product photography, never a poster or illustration.
```

## Mountain mobile — `mountain-campaign-mobile.png`

- Mode: built-in `image_gen`, reference edit.
- Reference: `mountain-campaign.png` generated above.
- Output: 1024 × 1536 portrait PNG.
- Visual check: Can begins at approximately 46% image height. Generous dark top space, full can, and legible Mountain Vodka Fruit Tingle / 7% ALC/VOL label.

### Final prompt

```text
Use case: compositing
Asset type: Portrait 2:3 aspect-ratio mobile website hero photograph.
Primary request: Recompose the supplied campaign photograph into a portrait mobile hero, preserving the exact Mountain Vodka Fruit Tingle can, same premium realistic style and black wet stone scene, but put ALL the product scene in the LOWER HALF of this new portrait canvas.
Input image: This is the edit target, containing the exact can and product scene to preserve.
Critical composition: Portrait 2:3. The TOP 46% of the entire image must be COMPLETELY EMPTY deep almost-black studio negative space. Not a single object, leaf, fruit, bright reflection, or can rim may enter this top area. The whole can starts at y=48% and ends at y=95% of the image height, centered horizontally around x=50%. This makes it about 47% of image height. Place citrus, raspberries and blackberries beside the can in the lower-right corner, ending at the same stone tabletop base. The lower scene may occupy 54% maximum of total image height. Need generous mobile headline space: on a displayed 860px tall hero the first 395px are plain dark space before any product appears. This empty area is intentional and essential; do not enlarge the can to fill the canvas.
Scene: Dark wet volcanic stone in bottom 15%, almost-black forest-toned backdrop. Restrained low-key lighting, elegant pale metallic highlights, crisp condensation. Same real fruit skin and pulp from source.
Invariants: Preserve exact black can shape, silver Mountain emblem, gold MOUNTAIN VODKA label, pink and blue Fruit Tingle script, and 7% ALC/VOL round label. Full can with top and base visible and unchanged. Same high-end advertising photography.
Constraints: Absolutely no added text, no in-image headings, slogans, people, extra products, watermarks, borders, neon effects or smoke. Change only the layout and canvas proportions; preserve product branding and scene identity.
```

## Benson’s mobile — `bensons-campaign-mobile.png`

- Mode: built-in `image_gen`, reference edit.
- Reference: `bensons-campaign.png` generated above.
- Output: 1024 × 1536 portrait PNG.
- Visual check: Can begins at approximately 47% image height. Dark top copy space, complete can and glass, legible Benson’s Original / Double Black / Bourbon with Cola / 6.5% ABV / 375ml.

### Final prompt

```text
Use case: compositing
Asset type: Portrait 2:3 mobile website hero photograph.
Primary request: Recompose the supplied Benson's campaign photograph into a portrait mobile hero. Preserve exactly the same Benson's black can, label, gold/cream/red branding, proportions, 6.5% ABV, 375ml, condensation, amber cola glass, dark wood and lighting.
Input images: Image 1 is the edit target. Keep the actual product appearance unchanged.
Composition/framing: Portrait aspect ratio 2:3. The entire TOP 48% of the frame MUST be clean empty deep black negative space for the website headline, with no can, glass, barrel or highlights above that point. Product appears only in the LOWER half. Complete unopened can from rim to base is centered horizontally near x=43%, with top at 49% image height and base near 93% image height. Tumbler beside it on lower right, smaller than can, fully within image. Dark timber forms the bottom 8% foreground. Softly blurred barrel may be visible only in lower half behind glass. This means when shown as an 860px-tall hero, its top 390px or more will be empty black. Keep generous black space above all objects.
Lighting/mood: Match source's premium warm old-gold studio edge light, restrained cream label highlights and rich blacks. Sharp photorealistic can and glass, subtle background.
Text: Preserve only the existing product label verbatim, including "BENSON'S", "ORIGINAL", "DOUBLE", "BLACK", "BOURBON", "with Cola", "6.5%", "ABV", "375ml".
Constraints: Change composition and aspect ratio only. Do not redesign can or label. No headings, poster typography, added text, slogans, people, hands, new objects or watermarks.
```

## Nightbird — `nightbird-campaign.png`

- Mode: built-in `image_gen`.
- References: client-provided `IMG_3767.jpg` bottle comparison and `IMG_3727.jpg` single crystal-stopper bottle. The latter was authoritative for product appearance.
- Output: 1672 × 941 landscape PNG.
- Visual check: Clear tall cylindrical bottle, proportional neck, faceted clear stopper, gold Art Deco geometry and flying bird retained. Nightbird, VODKA, 40% | 700ml and standard-drinks label present. Dark midnight-blue copy space on the left. Generated packaging artwork is reference-led, not guaranteed pixel-identical.

### Final prompt

```text
Use case: product-mockup
Asset type: Wide 16:9 premium Nightbird Vodka website hero photograph.
Primary request: Create an elegant photorealistic campaign image using the EXACT Nightbird Vodka bottle from the supplied photographs. Make this a premium studio product photograph without changing the product.
Input images: Image 1 IMG_3767.jpg is supporting reference of the gold printed label and bottle family, specifically its RIGHT crystal-stopper bottle. Image 2 IMG_3727.jpg is the AUTHORITATIVE single-bottle reference for shape, length, glass, label placement, gold Art Deco geometry, flying-bird logo and clear faceted stopper. Preserve that second image's product faithfully.
Subject: Exactly one tall clear cylindrical glass bottle containing clear vodka, straight narrow cylindrical body with gently rounded shoulder, long narrow neck, broad low transparent faceted crystal stopper, heavy clear base. Keep the exact relative height and width, neck about one quarter of total bottle height and stopper proportional to neck as shown. Thin muted champagne gold geometric Art Deco lines and panels appear across upper and lower body, same central ascending flying-bird silhouette and exact centered Nightbird serif logotype with small VODKA below.
Text on the bottle, verbatim and legible: "Nightbird" / "VODKA" / "40% | 700ml" / "22 STANDARD DRINKS". Preserve the small outlined standard-drinks rectangle.
Scene/backdrop: Quiet luxury midnight blue studio with almost-black blue background. Smoked mirrored tabletop with subtle convincing reflection beneath bottle. Understated architectural shadow lines only on the right, never distracting or geometric neon effects. No bar props, fruit, ice or glasses.
Composition/framing: Landscape 16:9. Whole bottle at x=72 percent, fully visible including stopper and base, approximately 80 percent of canvas height, carefully lit to remain luminous and readable. Leftmost 45 percent remains deep midnight-blue clean negative space for a website headline, no bright objects or reflections there. Camera at bottle mid-height, verticals straight.
Lighting/mood: Extremely refined luxury perfume-style glass product photography, precise long white edge reflections to define the transparent glass, faint cool midnight-blue reflections, softly glowing muted champagne-gold printed details, a warm subtle rim highlight. Product remains clear glass, never blue opaque glass. Rich darkness, restrained high-end art direction.
Constraints: Preserve real bottle structure and printed design; no neck elongation, no new typography, no invented awards or certifications, no extra bottles, no people, no watermarks, no text outside the product, no fantasy levitation or splashes. Avoid exaggerated decorative gold or label redesign.
```

## Nightbird mobile — `nightbird-campaign-mobile.png`

- Mode: built-in `image_gen`, reference edit.
- Reference: `nightbird-campaign.png` generated above.
- Output: 1024 × 1536 portrait PNG.
- Visual check: Complete bottle centered below generous dark top space, stopper begins at approximately 45% image height. Product design and printed labeling retained.

### Final prompt

```text
Use case: compositing
Asset type: Portrait 2:3 mobile website hero photograph.
Primary request: Recompose the supplied Nightbird Vodka campaign photograph into a portrait mobile hero, preserving this exact bottle, printed artwork, stopper, proportions, glass and midnight-blue / champagne-gold studio style.
Input image: Image 1 is the edit target and exact product to preserve.
Critical composition: Portrait 2:3 aspect ratio. The ENTIRE TOP 47% must be EMPTY deep midnight blue almost-black negative space, no bottle, stopper, architecture, reflection, or bright highlight. The bottle must be wholly contained in the LOWER HALF, centered horizontally x=50%, stopper top at y=49% and base at y=93% of overall canvas height. Keep the same long bottle proportions by scaling the entire bottle down uniformly, never stretching. On an 860px-tall website hero the first 400px should be blank dark headline space before product begins. Do not enlarge the bottle to fill this deliberate empty space.
Scene/backdrop: Preserve smoked mirrored tabletop in the bottom 10% with elegant reflection directly below the bottle. Almost-black midnight blue above. Restrained architecture shadows and champagne light visible only low on the right behind the bottle. Fine white glass edge lighting and muted gold printed detail. No other objects.
Invariants: Keep exact clear cylindrical body, proportional narrow long neck and clear low faceted crystal stopper, gold angular Art Deco linework and flying-bird silhouette. Preserve exact printed text on bottle "Nightbird", "VODKA", "40% | 700ml", "22 STANDARD DRINKS". Do not redesign packaging, exaggerate neck, change logo or invent awards.
Constraints: Change composition and aspect ratio only. No additional text or headings, no people, fruit, ice, glasses, bar props, extra bottles, watermarks, haze, smoke or special effects. The bottle should remain beautifully transparent and realistic, not blue or opaque.
```

## Supplied age-gate film — `age-bird-film.mp4` and `age-bird-poster.jpg`

- Source: user-supplied `4073696-hd_1280_720_30fps.mp4` from Downloads, a bird perched in silhouette against a grey sky.
- Processing: trimmed from the clean keyframe at 3.003 seconds to avoid the opening black/fade, excluded the ending fade, removed the audio track and enabled MP4 fast-start. The H.264 video stream was copied without re-encoding.
- Deployed film: 1280 × 720, approximately 14.58 seconds and 1.3 MB, with no audio track. The JPEG poster is a nonblack frame extracted three seconds into the trimmed film.
- This footage and poster are derived from the supplied video; no new image or video content was generated. The original download remains unchanged.
