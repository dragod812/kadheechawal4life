# Invitation revision design QA — 2026-10-04

This report supersedes the earlier passed baseline review for commit 57ea678. The current font/photo/film/scroll revision is implemented locally. Final visual re-capture is blocked by native Chrome window access, not by a build or asset failure.

## Findings

- [P2, fixed and captured] Pinyon Script’s r forms did not suit the couple’s names. Allura now renders the full names in bride-first order. Verified actual computed `Allura, cursive` and a loaded Allura FontFace in Chrome, not just a fallback font-check result.
- [P2, fixed and captured] Added childhood snapshots initially covered the school/formalwear captions. Increased collage spacing, kept the two added photos small and cropped to the couple. Final v3 desktop and phone captures show all four captions clearly.
- [P2, changed; final recapture pending] The café photo partly hid “Together again” in the Mumbai album. Increased album height and lowered both small companion photos at desktop, tablet and phone breakpoints. This final v4 change needs visual recapture.
- [P2, changed; final recapture pending] The proposal crop devoted too much room to the floor. Rebuilt the poster and silent excerpt with a tighter 620 × 720 crop at (160, 750); reviewed the resulting upright poster at full size. A final in-page capture remains necessary.
- [Verification issue, fixed] Normal Chrome reload reused the old CSS/JS. Added versioned static references; actual font family, CSS version and motion behavior were then checked. Current CSS/JS version is `20261004-4`; refreshed proposal URLs carry the same version.
- [Blocking verification issue] Native Chrome controls repeatedly return `cgWindowNotFound`, including after resetting the computer-use session. The inventory sees Chrome running, but no controlled Chrome browser provider is available. Final v4 capture, 320/768 checks and phone motion review cannot be completed until window access returns.

## Reference and comparison evidence

The user’s illustrated invitation is aesthetic direction, with explicitly incorrect sample dates. This is an authorized story-site adaptation, not a literal poster clone. Full names and bride-first order supersede the poster.

- Source: `qa/source-aesthetic-reference.jpeg`, 1024 × 1536.
- Supplied eight-photo review: `qa/revision/supplied-photos.jpg`.
- Lettering comparison: `qa/revision/lettering.jpg`.
- Combined source/desktop/phone opening: `qa/revision/comparison-revision.jpg`, reviewed in one input.
- Combined archive/young-chapter crop comparison: `qa/revision/comparison-photo-revision.jpg`, reviewed in one input.
- Latest completed desktop capture: `qa/revision/desktop-full-final.png`, 1440 × 12039, viewport 1440 × 900, DPR 1, **v3**. Opening, young, Mumbai, music, proposal and future details were inspected. It predates the last Mumbai spacing/proposal crop refinement.
- Latest completed phone capture: `qa/revision/mobile-full-final.png`, 390 × 13239, viewport 390 × 844, DPR 1, **v3**. Opening and readable detail crops inspected. It predates the same two refinements.
- Proposal review: coarse full-duration samples and nearby 235/237/239/241-second frames, plus the latest `invite/assets/photos/proposal-960.webp` full-size derivative. Final poster preserves the embrace, candlelit table and fairy lights.
- State: still composition, closed gallery, photos decoded before capture. Cold screenshots with offscreen lazy images unpainted are excluded.

## Five fidelity surfaces

1. **Fonts/typography:** Allura replaces name calligraphy; Cormorant Garamond and Manrope are retained. Captured full names fit at 1440 and 390. Initials, supporting labels and story text remain selectable HTML. The earlier baseline checked 320/768; those widths have not yet been rechecked for this revision.
2. **Spacing/layout:** Four-photo childhood composition, three-photo Mumbai album, two musical frames and expanded travel montage are implemented. The future portrait is capped at 390 px CSS width on desktop and 280 px on phones. No horizontal overflow at 1440/390 in the reviewed v3 state. Mumbai’s final spacing refinement needs capture; no claim is made that all current responsive widths have passed.
3. **Colors/tokens:** Ivory, leaf green, honey stone, brass and burgundy preserve the approved garden language. The proposal chapter uses a quieter deep green. Existing generated art is reused; no stage imagery or placeholder art has been added.
4. **Images:** Eight supplied photos were added. The two older snapshots are deliberately small and have no enlargement action. Both faces are visible in the reviewed crops. HEIC sources were orientation-corrected for WebP derivatives. Six short silent H.264 clips are used; proposal and porch footage are tone-mapped from HDR. Raw originals remain untouched and are not served.
5. **Copy/content:** Childhood affection → continued calls → Mumbai/Marine Drive and the broken leg → two cities/shared life → songs/covers/original writing → adventures → proposal → future → celebration. Exact proposal song/form is not invented. Kalyani Supekar is first, then Sidharth Padhee. Dates remain 25–27 February 2027 at The Ummed Ahmedabad. The programme and calendar contain no precise ceremony hours.

## Motion and interactions actually checked

- Desktop Enable/Pause toggled correctly despite the device’s reduced-motion preference. Pause produced a complete still composition and paused every clip. Save-Data/default handling was reviewed in source; no live Save-Data device was exercised.
- An instrumented desktop scroll showed the young blue photo easing from 20.37 px of horizontal drift to 0 px over approximately 476 ms. The app made zero additional RAF callbacks while idle. This is local desktop evidence, not a physical-phone frame-rate guarantee.
- New proposal playback was muted, advancing, visible in its frame, and active at approximately 0.92 seconds. New porch duet was muted, advancing, visible at approximately 1.54 seconds; proposal was paused offscreen. These checks used the earlier proposal crop, with unchanged playback code.
- Smaller mobile motion amplitude and absent touch-pointer parallax are implemented. **Final phone animation review remains pending.**
- The baseline native photo dialog, Escape/focus return, copy-address success and calendar download passed earlier review. New asset targets are verified structurally; a new-photo dialog action remains to be exercised in the restored browser.

## Technical checks

- All 67 local HTML references, CSS/font targets, 13 gallery targets and section anchors exist.
- JS syntax and Python asset-builder compilation pass.
- All six public MP4 files are H.264 with zero audio streams and no source location metadata: another-song 3.83 s; garden 3.83 s; her/his umbrella 2.83 s each; our-song 3.83 s; proposal 4.21 s.
- Silent clips have muted/playsinline attributes, no controls and no loop.
- All-day calendar preserves CRLF/folding and 25 February start / exclusive 28 February end. Formal names/order and the omission of exact ceremony times are preserved.
- The running local server serves the exact current HTML/CSS/JS bytes. Both 1440/390 v3 captures reported all rendered images decoded. Current v4 static targets pass; these checks do not replace browser review.
- A Chrome asynchronous listener/channel warning appeared during review; the invitation code has no message listeners. One intentional QA query used a nonexistent selector and caused a TypeError; it was corrected, and subsequent page checks succeeded. Neither is an observed application-code failure.

## Remaining local gate

- Restore Chrome window control and capture v4 at 1440 and 390.
- Recheck Mumbai captions, the tighter proposal crop, 320/768 overflow/full names, and phone scroll motion.
- Open one new gallery photo and verify Escape/focus return.
- Compare current captures to source; record passed only after those checks complete.

Mobile Safari, WhatsApp webviews and live social previews remain outside the local review. No deployment or remote push occurred. The local preview server is still running.

final result: blocked
