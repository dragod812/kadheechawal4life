# Invitation design QA — 2026-10-04

The final local revision uses static-reference version `20261004-11`. Chrome window access recovered; this report supersedes the previous blocked review. No unresolved P0/P1/P2 issues were found in the reviewed local surfaces.

## Findings resolved

- Replaced the ornate name lettering with Allura; actual Chrome font loading was verified. Full names remain Kalyani Supekar first, then Sidharth Padhee.
- Kept the two older snapshots small and cropped to the couple. Increased childhood and Mumbai collage spacing so captions stay clear.
- Replaced the proposal video with the user's exact supplied photograph. CSS displays the sideways source upright and crops it inside the ivory arch. The former public video and extracted proposal posters were removed.
- Changed Sidharth's umbrella excerpt from the mostly stationary early passage to **6.8–10.8 seconds**, showing his approach and playful umbrella gesture toward the camera. The **9.9-second still** keeps his smiling face clear. Inspected fourteen source frames and eight encoded-selection frames; verified in-page playback.
- Extended parallax to flowers/bells, architectural garden/pillars, closing scenery, photos and copy. The pillars move with their garden raster; they are not separate 3D models. There are 22 parallax groups and 21 photo actors.
- Fixed a 1 px phone overflow and 14 px tablet overflow exposed by moving photo frames. Lateral translation and rotation are reduced at widths up to 1000 px; full-width text has room for its small pointer response.

## Reference and visual evidence

The supplied illustrated invitation is aesthetic direction, with explicitly incorrect sample dates. The website is an authorized story-site adaptation, not a literal poster clone.

- Source: `qa/source-aesthetic-reference.jpeg`, 1024 × 1536.
- Latest desktop: `qa/parallax/desktop-final.png`, **1440 × 12136**, viewport 1440 × 844, DPR 1, v11.
- Latest phone: `qa/parallax/mobile-final.png`, **390 × 13319**, viewport 390 × 844, DPR 1, v11.
- `qa/parallax/comparison-final.jpg`: source and final desktop/phone openings compared together in one input.
- `qa/parallax/phone-strip-final.jpg`: complete phone journey inspected in four readable strips.
- `qa/parallax/proposal-final.jpg` and `playful-final.jpg`: final desktop proposal photo and updated umbrella still inspected.
- `qa/parallax/his-umbrella-source-review.jpg` and `his-umbrella-final-review.jpg`: timestamped source/encoded-selection review.
- Captures use the complete paused composition, closed gallery, loaded fonts and decoded photographs. Animated behavior was checked separately. The final source and implementation comparisons were viewed before this report was written.

## Five fidelity surfaces

1. **Typography:** Allura names, Cormorant Garamond headings and Manrope supporting text are self-hosted. Full names fit without clipping at 320, 390, 768 and 1440 px. Names and narrative remain selectable HTML.
2. **Spacing/layout:** Childhood and Mumbai albums, two music frames and expanded travel montage retain clear captions. The future portrait is capped at 390 px on large desktops and 280 px on phones. Final 1440/390 still layouts have zero horizontal overflow. Phone and tablet animated sweeps each tested nine positions with zero overflow after fixes.
3. **Colors:** Ivory, leaf green, honey stone, brass and burgundy preserve the reference's garden language. The proposal sits in quiet deep green. Existing generated illustration is reused without stage props or placeholder art.
4. **Imagery:** Eight added archive photographs remain in their intended chapters. Older snapshots stay small and cannot be enlarged. The exact proposal photograph replaces video; its source pixels are unaltered, with orientation/framing applied in CSS. Five short H.264 clips have no audio streams; originals remain outside the public payload.
5. **Content:** Childhood affection → continued calls → Mumbai/Marine Drive and broken leg → two cities/shared life → songs/covers/original writing → adventures → proposal → future → celebrations. Exact proposal song/form is not invented. The dates are 25–27 February 2027 at The Ummed Ahmedabad. The invitation/calendar omit precise ceremony hours.

## Motion and interaction evidence

- Desktop mouse/scroll produced distinct measured transforms: foreground flowers/bells around x 8.39 / y −19.63 px, architectural garden around x −2.40 / y 8.03 px with 1.1 scale in the sampled state. Closing scenery also responded independently.
- The damped RAF loop made zero additional callbacks after settling. Nearby-only updates and cached measurements remain in place. This is local desktop evidence, not a physical-device frame-rate guarantee.
- Phone scrolling moved foreground/background at reduced depth. Touch-pointer input did not alter mouse parallax. Pausing removed movement and paused every video. The system reduced-motion preference began in the complete still composition; Enable motion worked explicitly. Save-Data defaults were source-reviewed, not exercised on a live limited-data connection.
- Phone animation sweep checked nine positions from y 400 through 12500; all had zero horizontal overflow. Tablet sweep checked y 0, 600, 1500, 2800, 4200, 5900, 7400, 9200 and page end; all had zero overflow after the lateral-motion fix.
- Updated umbrella playback in the 390 px viewport was muted, actively playing at 2.95 seconds, then ended paused at exactly 4.0 seconds with looping disabled. The final v11 change only refines its poster from 10.4 to 9.9 seconds; video selection/playback is unchanged.
- The new Mumbai café photograph opened in the native dialog; closing returned focus to its trigger. Baseline Escape, keyboard behavior, address copying and all-day calendar download passed earlier review; those code paths are unchanged.

## Technical checks

- All 68 HTML local references, CSS/font files, 13 gallery targets and section anchors resolve.
- JavaScript syntax and asset-builder Python parsing pass.
- Five public MP4s are H.264 with zero audio streams: garden 3.83 s, first duet 3.83 s, porch duet 3.83 s, Kalyani umbrella 2.83 s, Sidharth umbrella 4.00 s. Clips have muted/playsinline attributes, no controls and no loop.
- Current local HTTP HTML/CSS/JS bytes match the files on disk. All images were decoded for final captures.
- All-day calendar preserves 25 February start and exclusive 28 February end. Formal names/order and date-only programme are unchanged.
- No application-code error was observed. Chrome emitted an unrelated asynchronous message-listener warning; the invitation has no messaging listeners. QA helper/selector errors were corrected and are not application failures.

Physical Mobile Safari, WhatsApp webviews and live social previews remain outside this local review. The local preview remains running; no deployment or remote push occurred.

final result: passed
