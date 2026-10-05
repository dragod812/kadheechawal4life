# Invitation design QA — 2026-10-04

**Findings**
- No open P0, P1 or P2 visual findings remain in the reviewed local implementation.
- [P2, fixed] The initial two-city crop cut off parts of both faces. Changed the vertical focal point from 36% to 76%. Both halves now clip an identical full-size image canvas, preventing differing crop calculations. Evidence: `qa/comparison-crop-fix.jpg`, combining the actual source photo, original desktop crop and final desktop/phone crops. Both faces and the continuous composition are preserved at 1440px and 390px.
- [Verification recovered] Chrome computer-use temporarily returned `cgWindowNotFound` while saving evidence. The native window later became available; the final 1440px capture was saved and reviewed against the source. This no longer blocks the visual gate.
- [P2, fixed] The wordmark lost contrast over jasmine. Added an ivory backing. Evidence: `qa/comparison-before.jpg` and `qa/comparison-final.jpg`.
- [P2, fixed] Phone controls had small tap areas and supporting text was too small. Actions now have a 44px minimum height; mobile body text is 14px, brass text is #896333. Evidence: `qa/mobile-full-final.png` and the browser overflow checks.
- [P2, fixed] Overlapping childhood photographs obscured part of the school caption. Replaced it with the short left-aligned “School days.” caption. Final phone sequence preserves the caption and both young-years photographs.

**Comparison target and evidence**
- Source visual truth: `qa/source-aesthetic-reference.jpeg`, 1024 × 1536 pixels. The user supplied this as an aesthetic reference and explicitly said its dates were wrong. The written brief requests a new story website; this is an authorized adaptation, not a literal poster clone. Full names and bride-first order supersede the sample.
- Additional visual truth for the photo crop: `invite/assets/photos/embrace-1440.webp`.
- Implementation: `http://127.0.0.1:4173/invite/`.
- Full-view combined input: `qa/comparison-final.jpg`, containing the source poster, desktop opening and final phone opening in one image.
- Focused combined input: `qa/comparison-crop-fix.jpg`; names, captions, programme and closing also inspected at readable scale.
- Desktop opening: `qa/desktop-opening-final.png`, 1440 × 900 CSS/pixel dimensions, DPR 1. Final full desktop file `qa/desktop-full-final.png` is 1440 × 10533 pixels, captured after the clipping refinement with all photographs loaded. The complete chapter sequence and focused two-city crop were inspected at readable scale.
- Final phone: `qa/mobile-full-final.png`, 390 × 11152 pixels, viewport 390 × 844 CSS px, DPR 1, captured after scrolling through every chapter. `qa/mobile-opening-final.png` is its 390 × 844 opening crop.
- Tablet opening: `qa/tablet-opening-final.png`, 768 × 844 CSS/pixel dimensions, DPR 1, latest code.
- Original desktop evidence was 2880 × 1688 at 1440 × 844 CSS px, DPR 2. Initial phone evidence was 780 × 1688 at 390 × 844, DPR 2. These were proportionally downsampled for the earlier comparison; source poster scaling is independent because its composition differs intentionally.
- State: device reduced-motion preference, complete still composition, closed gallery. Generated art preserves the botanical/stone/brass language; real photography replaces the illustrative couple as requested.

**Required fidelity surfaces**
- Fonts/typography: self-hosted Pinyon Script for names, Cormorant Garamond for headings and captions, Manrope for supporting text. Browser font check passed; full names are untruncated at 320, 390, 768 and 1440px. Formal names read Kalyani Supekar, then Sidharth Padhee. Display scales intentionally differ from the poster to accommodate both full names.
- Spacing/layout: ornate opening alternates with open story chapters. Phone stacks, tablet two-column opening and three-day programme are legible. Browser horizontal-overflow checks passed at 320, 390, 768 and 1440px. The final desktop capture has consistent chapter spacing, complete photographs and no visible crop seam.
- Colors/tokens: ivory, deep leaf, honey stone, brass and burgundy retain the supplied art direction. Ivory behind initials fixes the floral contrast collision; darkened brass supports small type. The closing uses matching candlelit garden art.
- Image quality: correct school and young formalwear photographs stay in the young chapter. Authentic photo colors are retained; HDR clips are tone-mapped to SDR. Real raster artwork and transparent botanical/Ganesha assets are used. No placeholder drawings substitute for the source art. Desktop/phone subject crops and the final continuous two-city composition were inspected against source.
- Copy/content: childhood affection → continued WhatsApp/video contact → Mumbai/Marine Drive and the broken leg → shared life across cities → recurring music and songwriting → adventures → proposal callback → invitation. No unsupported milestone dates or proposal-performance claims. Programme is 25–27 February 2027, The Ummed Ahmedabad, with close-family Mehendi identified. Precise ceremony times are omitted at the user’s direction.

**Interactions and technical checks**
- Motion toggle changes Enable/Pause, respects reduced-motion and Save-Data initially, and supports explicit user enablement. Four short H.264 excerpts are 2.83–3.83 seconds and contain zero audio streams; full source videos are not served.
- Childhood viewer opened in a native modal. Escape closed it and restored focus to the original photo button.
- Copy address displayed “Address copied. See you there!”
- Calendar download was exercised; its renamed final file and final contents are verified separately. All-day dates start 25 February and end exclusively 28 February. UTF-8 line folding/CRLF, full names/order, date-only programme and weekday labels checked.
- Local image, source-set, motion, gallery and anchor targets checked. JS syntax and asset-builder compilation passed. Git whitespace checks preserve required calendar CRLF/folding and downloaded upstream license text through file-specific attributes.
- Last refreshed page and tablet/phone captures had zero console errors. The recovered desktop session showed an asynchronous listener/channel warning consistent with a browser extension; the invitation code has no messaging listeners. After clearing that warning, the desktop readiness/capture checks produced no application console errors. Early preview-server connection resets were resolved by increasing its request backlog; redundant font preloads were removed after a deep-link warning.
- Lazy photos must be scrolled into view before full-page capture. Cold full-page captures contain unpainted offscreen images and were excluded from the final verdict. The browser reported zero unloaded rendered images at 390, 768 and 1440px before the accepted captures.

**Open questions / residual gaps**
- Mobile Safari/WhatsApp webview and live social-link previews have not been tested. The implementation is local; no publish or remote push occurred.
- RSVP collection and finer guest arrangements remain unconfigured, as established in the brief.

**Implementation checklist**
- [x] Build /invite/ and link it from the existing root brief.
- [x] Preserve original photo/video sources; serve optimized derivatives.
- [x] Apply full names, bride-first order and date-only programme/calendar.
- [x] Check phone/tablet layouts, primary actions and silent assets.
- [x] Restore Chrome and capture the final 1440 × 900 desktop state with every photograph loaded.
- [x] Compare that capture to the source and recheck the two-city crop; update this report.

**Follow-up polish**
- Optional original musical line/song title can replace generic music captions once supplied.
- Full WebGL is unnecessary for this version; layered raster art and clipped photo transforms provide depth without a large runtime.

The local visual gate covers the supplied aesthetic adaptation, responsive desktop/phone compositions, tablet opening, confirmed copy and primary interactions. The residual platform/live-preview checks above remain outside this local review.

final result: passed
