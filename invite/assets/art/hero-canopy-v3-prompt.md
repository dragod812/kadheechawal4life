# Airy green canopy v3

Generated using the built-in `image_gen` tool, with `transparent_background: true` for both edit passes. Input reference: `hero-botanicals-v2-original.png`. This asset is only the midground green canopy. Original output is `hero-canopy-v3-original.png`; optimized asset is `hero-canopy-v3.webp`.

## Initial canopy extraction prompt

```text
Use case: background-extraction
Asset type: separate transparent MIDGROUND GREEN CANOPY plane for an intricate Indian wedding website; used behind independently layered jasmine flowers.
Input image: hero-botanicals-v2-original.png is the edit/style reference. Keep its softly sunlit painterly realism, natural warm green leaf texture, fine botanical edges, and exact full landscape 1536x1024 (3:2) canvas.
Primary request: Isolate and recreate ONLY a sparse airy selection of TOP-CORNER leafy green branches and slender trailing vines. Reduce leaf density to about 40 percent of the reference canopy. Leave delicate spaced clusters, graceful individually distinguishable fine vines and open negative space between leaves. A few varied green leaf shapes, naturally irregular, warm olive and fresh garden greens. More breathing room and depth, never a solid curtain.
Composition/framing: Two clearly disjoint groups, each attached to its own far upper corner. Left group confined to approximately x=0..280, right group to x=1256..1535. The top corners hold a modest leafy branch and 2-3 loose slim vines, some tapering down to about y=350. Far upper-side tips may reach about y=430 but ALL pixels below y=440 must be completely transparent. The central 60-65 percent of the canvas is completely empty and transparent; the central vertical 10 percent must be pure alpha 0 all the way top to bottom. Absolutely no connection across top-middle or midpoint.
Keep: subtle realistic 3D depth of leaves and fine organic stems, warm garden light, exquisite restrained natural detail consistent with the reference.
Remove: ALL flowers, flowerbuds, jasmine, garlands, blossoms, bells, brass, chains, bottom plants, floor, planters, scenery, architecture, stone, text, logos and people. No foreground bouquet. No central objects. No horizontal vine connecting left and right.
Background: Genuine alpha transparency. This is a crisp greenery cutout on nothing, with transparent gaps around and behind every vine. No backdrop, painted background, gradient, coloured haze, glow, blur, shadow on empty space, or baked checkerboard. Any green RGB outside plants is fully transparent.
```

## Selected final edit prompt

```text
Use case: precise-object-edit
Asset type: transparent green canopy foreground.
Edit target: supplied sparse leafy canopy image, 1536x1024 landscape 3:2.
One precise change: Shorten only the longest hanging vines on each upper corner so that their natural tapered tips end at or above y=360 pixels. The current longest vines descend too far; remove their lower portions and gracefully taper to a tiny final leaf near y=350. Preserve the current density, leaf sizes, botanical texture, top-corner framing, top branches and colour. Do not add leaves or stems, move or scale remaining branches, or extend any vine. Keep two disjoint botanical groups. All rows from y=400 through y=1023 must be completely transparent alpha 0. Entire central 60 percent remains empty and fully transparent.
Background/invariants: Keep exact 1536x1024 landscape canvas. Genuine alpha cutout only, no background, gradient, haze, shadows outside objects, coloured transparency, flowers, garlands, bells, brass, chains, bottom plants, text, logos, people or architecture. This is only the leaf canopy layer.
```

## Inspection and validation

- 1536 × 1024 pixels, 3:2 landscape, genuine RGBA.
- Mean opacity: 0.0619788. Open centre and full lower area; sparse independently separable corner groups.
- All flowers, garlands, buds, bells, chains, architecture and lower plants removed.
- Longest visible vine ends approximately y=390, with no visible foliage below y=440.
- Central vertical 10%: maximum residual alpha 1/255, mean 0.000000373019; no visible objects.
- Below y=440: maximum residual alpha 1/255, mean 0.000000279792; no visible objects. Tiny 1/255 alpha noise comes from generated source and was retained to preserve the original alpha.
- Ivory composite inspected: clean isolated leaf cutouts, no visible haze or background, delicate leaf depth and open spacing.
- WebP alpha exactly matches the PNG alpha, with 0 differing pixels.

