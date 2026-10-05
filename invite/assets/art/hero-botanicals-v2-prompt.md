# Hero botanical foreground v2

Generated using the built-in `image_gen` tool with `transparent_background: true`. Final selected output: `hero-botanicals-v2-original.png`; optimized web asset: `hero-botanicals-v2.webp`.

The original `hero-garden-original.png` was the extraction/edit reference. Two targeted follow-up edits cleaned the negative space and widened the independent left/right split. Final format conversion retained alpha exactly (0 differing alpha pixels).

## Original extraction prompt

```text
Use case: background-extraction
Asset type: transparent floating botanical foreground layer for the same wedding website hero.
Input image: the supplied landscape wedding garden illustration is the EDIT TARGET. Its flowers and foliage determine style, placement, scale and lighting.
Primary request: Extract and sensitively recreate ONLY its richly detailed botanical framing. Keep the same landscape 3:2 canvas, top-corner jasmine swags, top and side hanging green vines, strings of ivory jasmine, cream flowers, a few soft blush pink flower buds, warm green leaves, and lower left and lower right botanical arrangements. Maintain the approximate original relative positions, botanical scale, delicate painterly realism and warm gentle highlights, so this cutout can be overlaid on the original arch layout.
Change only: Remove every non-botanical part. Remove ALL stone and architecture, arch, columns, floor, landscape, distant trees, skyline and planters. Remove ALL brass bells and their chains. No metal items remain.
Composition/framing: Same 3:2 landscape framing, 1536x1024 target. Botany hangs from the top corners and softly cascades along outer side edges. The lower foliage remains close to the outer low corners. Keep the central vertical 10 percent empty all the way from top to bottom. There must be NO connecting vines, continuous strand, garland, flower chain or objects crossing the centre midpoint; the left and right botanical halves must be separable for independent movement. The broad central 65 percent is clear, genuinely transparent space. Do not let lower corner foliage spread across the lower centre.
Background: actual alpha transparency everywhere between and behind the botanicals. Exact transparent cutout including fine stem edges and open gaps between leaves; no opaque backdrop or coloured fill.
Style/medium: Preserve exquisite softly sunlit Indian botanical illustration from reference, dimensional jasmine petals and delicately textured natural foliage.
Constraints: Only botanicals. No people, words, text, logos, watermark, arches, stone, bells, chains, vases, planters, scenery, ground shadows, background, gradient or baked checkerboard. Actual transparency mandatory.
```

## Transparency cleanup prompt

```text
Use case: background-extraction
Asset type: transparent botanical foreground cutout layer.
Edit target: the supplied 1536x1024 botanical frame image.
Primary request: Keep the current botanical frame's flowers, foliage, exact landscape 3:2 canvas, positions, scales and lighting. Change ONLY the transparency cleanup: remove all the blurry olive green haze, translucent background shading and background glow everywhere between and behind foliage. Produce isolated botanical objects with accurate clean alpha edges and absolutely transparent empty gaps. The central clear space must be pure alpha 0, not semitransparent green. Small antialiasing on actual botanical edges is fine, broad hazy alpha gradients are not.
Critical central split: from x=691 to x=845 (45%-55% of canvas width), the entire stripe top to bottom must contain NO objects and be absolutely transparent alpha 0. Remove any stray leaves or buds at that stripe; do not move the rest of the foliage. Preserve open centre; no objects crossing from left to right. Top swags anchored at left/right corners; side cascades; lower corner foliage remain.
Avoid: background, gradient, backdrop, shadows cast into empty space, haze, glow, fog, coloured transparency, stone, architecture, scenery, landscape, planters, brass, bells, chains, people, text, logos, watermark, baked checkerboard.
Output: actual RGBA transparent PNG, botanicals only.
```

## Final selected edit prompt

```text
Use case: background-extraction
Asset type: Indian wedding botanical foreground cutout, transparent RGBA.
Edit target: the supplied botanical frame, which already has transparent alpha around the objects. Preserve its 1536x1024 landscape 3:2 dimensions, photorealistic painted jasmine, leaf texture, side cascades and lower corner foliage.
One targeted change: WIDEN THE EMPTY CENTRAL SPLIT. Remove the innermost upper vines and leaves on both sides of the upper-centre opening. From horizontal pixel x=600 to x=936, there must be NOTHING whatsoever: no leaf, stem, flower, bud, colour or shading. That entire 22 percent vertical stripe must be completely alpha=0 from the very top row to the very bottom row. Keep all remaining botanicals at x<600 or x>936, and keep the current side cascades and low corner bouquets intact. Do not redraw or add any objects within the stripe.
Background: Only crisp botanical cutouts and accurate alpha. Fully transparent gaps including fine stem gaps. No background, haze, shadow, glow, gradient, arch, stone, landscape, metal, bells, chains, planter, text, people, watermarks, baked checkerboard. Output alpha transparency mandatory.
```

## Validation

- 1536 × 1024 pixels, 3:2 landscape.
- RGBA with alpha ranging from 0 to 254/255.
- Mean opacity: 0.288096. Broad centre open; no architecture, planters, scenery, brass bells or chains.
- Central 10% vertical stripe has no visible objects; maximum residual alpha is 1/255 and mean alpha 0.0000171837. This is near-zero raster alpha noise, not visible foliage.
- The RGB values of fully transparent pixels retain green edge colors; these are invisible with alpha compositing. Composite over warm ivory inspected with no visible background gradient or haze.
- WebP alpha is identical to original PNG alpha.

