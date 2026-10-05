# Invitation design QA — 2026-10-05

Current local reference version: `20261004-16`. The latest revision improves the proposal still; the passed v15 opening and story/motion implementation are retained. No unresolved P0/P1/P2 issues remain in the reviewed local surfaces.

## Latest proposal revision

- Inspected the exact supplied dim/sideways photo, the prior timestamped proposal review and a fresh native-resolution extraction at 235 seconds. Selected the kneeling proposal moment with Kalyani smiling.
- A first AI upscale recreated faces and scenery too aggressively and was rejected. A second, gentler built-in image_gen pass improves exposure, shadows and colour while retaining facial softness more closely. This is AI-assisted restoration, not a claim of recovered original facial detail.
- Preserved the selected 1106 × 1422 PNG, exact 640 × 822 edit input, prompt and hashes in [proposal source assets](source-assets/proposal/README.md). The original supplied still and raw video SHA-256 hashes match their existing archive records.
- The image is now upright in the asset. Removed the old CSS 90-degree rotation and fitted a 1.5× crop within the same arched ivory frame. Both people, the kneeling gesture and candlelit context remain visible. Updated alt text to describe this frame truthfully.
- The proposal remains photo-only. Its frame, caption, text and gentle existing motion are preserved. The asset builder reads the selected restoration so full rebuilds retain it.

## Visual evidence and fidelity

All captures are local Chrome at DPR 1, version 16, with the selected image decoded. Static captures use the complete paused composition.

- `qa/proposal-enhancement/invite-proposal-desktop-v16.png`: 1440 × 844; full side-by-side chapter reviewed. Frame width is 360 px.
- `qa/proposal-enhancement/invite-proposal-phone-v16.png`: 390 × 844; chapter heading/copy and photo reviewed.
- `qa/proposal-enhancement/invite-proposal-phone-photo-v16.png`: 390 × 844; complete photo/caption reviewed. Both faces and bodies fit within the arch.
- `qa/proposal-enhancement/comparison.jpg`: source crop, selected restoration and rendered phone composition inspected together. The warmer/brighter result is visibly clearer while remaining softly photographic.

Five fidelity surfaces: **typography** remains the existing Allura/Cormorant Garamond/Manrope system; **layout** retains the compact 360 px desktop / 295 px phone frame and clear caption; **colour** improves the dim green-yellow source toward warm candlelight against the forest-green chapter; **imagery** keeps a static authentic proposal moment with a restrained restoration; **content** preserves the bride-first full names, factual proposal writing, date-only programme and story chronology.

DOM checks at 320, 390 and 1440 px show zero horizontal overflow. At 320 px with motion enabled, the photo window stays within the viewport (x43.4–289.6). There is no proposal video. The page requests the 480 or 960 px derivative according to display size; assets are approximately 44/98 KB.

## Carried-forward review and technical checks

The opening was not changed in this revision. Passed v15 desktop/tablet/phone botanical-depth, bell-clearance and pause checks are preserved in `qa/proposal-enhancement/pre-proposal-qa.md` and `qa/layers/`. Earlier full journey, gallery, calendar, address, idle RAF and silent-video checks remain in `qa/layers/pre-layer-qa.md` and `qa/parallax/`.

All 74 local HTML references, CSS/font references, 13 gallery targets and anchors resolve. Current local HTTP HTML/CSS/JS match disk. JavaScript syntax, Python builder parsing and `git diff --check` pass. Five existing H.264 excerpts remain muted/playsinline, without audio streams, controls or looping. No application-code error was observed; the previously seen Chrome extension asynchronous-listener warning is unrelated to the invitation code.

Physical Mobile Safari, WhatsApp webviews and live social previews remain untested. No deployment or remote push occurred. The local preview remains open with normal desktop mode restored and motion enabled.

final result: passed
