# Invitation design QA — 2026-10-04

Current local reference version: `20261004-15`. The latest revision replaces the opening's painted-in plants/bells with sparse independent image planes. No unresolved P0/P1/P2 issues remain in the reviewed local surfaces.

## Final design and resolved findings

- The architectural base now contains only the warm ivory/honey arch, bare pillars, terrace and neutral distant light. Plants, flowers, garlands, bells/chains and their shadows were removed with the built-in image generation tool.
- Three separate transparent botanical assets provide high canopy vines, fine hanging jasmine and light low-corner foliage/flowers. Each is split through its empty centre into left/right wings: six botanical elements at different depths, plus two independent brass bells. The page has 29 parallax groups in total; existing photo/story movement remains.
- The first full-frame extraction was too dense for the refined request. It was superseded by sparse v3 assets and two smaller bells. The larger four-bell trial crowded the first name; it is not used.
- Tablet framing initially cropped away most hanging decoration. Top/bottom planes now retain their natural aspect ratio at widths up to 1000 px. Mobile navigation has an ivory backing so fine greenery cannot reduce its contrast. Names and portrait keep generous clear space.
- All generated originals and exact prompts are linked in [the artwork manifest](invite/assets/art/hero-layers.md). Botanicals and bells have genuine alpha; checked against ivory with no visible haze or rectangular backgrounds. Personal photographs and original source artwork remain unchanged.

## Reference and capture evidence

The original supplied invitation is aesthetic direction with explicitly incorrect sample dates. The latest user direction intentionally makes its botanical density lighter; this is not a literal poster clone.

- Source: `qa/source-aesthetic-reference.jpeg`, 1024 × 1536.
- Final desktop: `qa/layers/desktop-final.png`, 1440 × 844, DPR 1, v15.
- Final tablet: `qa/layers/tablet-final.png`, 768 × 844, DPR 1, v15.
- Final phone: `qa/layers/phone-final.png`, 390 × 1070 opening crop from the refreshed 390 × 13319 full capture, viewport 390 × 844, DPR 1, v15. Only the opening crop is evidence for this revision; offscreen chapters were not re-reviewed from this lazy-loaded capture.
- `qa/layers/comparison-final.jpg`: source and final desktop/phone openings were viewed together in one input. Tablet was separately inspected at full size.
- State: decoded opening images, loaded fonts, complete paused composition and closed gallery. An incorrectly scaled DevTools phone screenshot following a temporary 1 px viewport was discarded; refreshed capture and DOM scale=1 measurements resolved it.

## Five fidelity surfaces

1. **Typography:** Self-hosted Allura, Cormorant Garamond and Manrope retained. Full formal names remain Kalyani Supekar first, then Sidharth Padhee. Names fit at 320, 390, 768 and 1440 px; no ornament covers them in reviewed compositions.
2. **Layout:** Layer registration preserves the architectural opening and portrait position. Botanical corners stay visible at tablet/phone widths without stretching. 320/390/768/1440 checks showed zero horizontal overflow; 320 navigation fits. On the 390 phone, bells end at y117/y145 and the names begin at y219, leaving clear space.
3. **Color:** Luminous ivory, warm carved stone, muted mature greenery, cream jasmine, subdued blush and aged brass preserve the established art direction. More bare architecture and negative space make the opening calmer.
4. **Imagery:** Architecture, canopy, jasmine, low foliage and bells are separate assets. The denser v2 botanical frame is unconsumed provenance. The revised umbrella excerpt and exact proposal still from the previous passed review remain unchanged.
5. **Content:** Bride-first full names, 25–27 February 2027 at The Ummed Ahmedabad, date-only programme/calendar and chronological story are unchanged. No precise ceremony hours were introduced.

## Motion and interactions

- Desktop pointer at 80%/30% of viewport plus 150 px scrolling produced distinct positions: architecture x−2.40/y6.28 px; left canopy x3.00/y−5.05 px; right canopy x4.20/y−6.61 px. Jasmine, lower foliage and bells use successively different depth coefficients, verified from the active scene variables and visible composition. Small bell rotation is anchored at the chain top.
- In the 390 phone viewport at 350 px scroll, measured y offsets were architecture +6.73 px, canopy −4.81/−6.16, jasmine −10.58/−13.08, low foliage −15.39/−17.32 and bells −11.55/−14.43. Horizontal overflow remained zero.
- Pause restored `transform: none` on every opening scenery/decorative element. Reduced-motion still state remains complete; explicit Enable/Pause works. Native scrolling, touch-pointer exclusion and the existing damped idle-stopping engine are retained.
- Previous passed v11 evidence remains in `qa/layers/pre-layer-qa.md` and `qa/parallax/`: full journey captures, nine-position phone/tablet motion sweeps, zero idle RAF calls, gallery focus return, calendar/address actions, new umbrella clip playing muted then ending once at four seconds. Those unchanged features were not redundantly retested in full.

## Technical checks and limits

- All 75 local HTML references, CSS/font references, 13 gallery targets and anchors resolve. Current local HTTP HTML/CSS/JS match disk.
- JavaScript syntax and Python asset-builder parsing pass; `git diff --check` passes.
- Five public H.264 clips still contain zero audio streams and have muted/playsinline attributes, no controls and no loop. The proposal contains no video.
- No application-code error was observed during the review. Browser screenshot scaling/viewport-control issues were corrected and excluded from evidence.
- Physical Mobile Safari, WhatsApp webviews and live social previews remain untested. These are browser-emulated responsive checks, not a physical-device performance guarantee.

The preview is local; no deployment or remote push occurred.

final result: passed
