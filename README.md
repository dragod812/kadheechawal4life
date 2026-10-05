# kadheechawal4life.com

Static site for Kalyani Supekar & Sidharth Padhee’s wedding, 25–27 February 2027 at The Ummed, Ahmedabad.
Served by GitHub Pages from `main`. The guest invitation is `/invite/`; the root page remains the
Sacred Grove planning and décor brief.

## Pages

| Path | What it is |
|---|---|
| `/invite/` | Illustrated garden invitation, chronological story, silent memories, celebrations, directions and calendar download |
| `/` | The facts, the two-function-day/two-night programme, the six things the space has to do, and the Sacred Grove mood board |
| `/venues/` | The venue study — 67 properties across 13 regions, with verified facts, quote-backed cost analysis, outreach messages, and 618 photographs |
| `/guest-estimation/` | Tracker-based plan, updated 25 September 2026: 143 listed guests (81 bride/common + 62 groom), 4 suites + 53 Premium Rooms / 22 extra beds for the full list. Nightly scenario clearly labels missing stays, RSVP interpretation, suite assignments and proposed sharing. |
| `/guest-estimation/archive/pre-ahmedabad-2026-09-21/` | Exact backup of the preceding Puri/elsewhere guest estimate, Markdown and generator; historical only. |

The guest page and its downloadable Markdown are generated together by `python3 scripts/build-guests.py` from `scripts/guest-plan.json`, a phone-free snapshot of the tracker and proposed groom room groups. Do not publish the XLSX: it contains private contact details. Kalyani’s source sheet is immutable; groom room groups live on the separate Sidharth guests tab. Pass `--wiki <wedding-folder>` to refresh both wiki guest-estimation files.
This page is publicly accessible,
with `noindex, nofollow`; it has no authentication. Its newer guest estimate is not a revision of the
existing venue brief: overnight attendance and final rooming remain to be decided.

`/venues/index.html` is **generated**, not hand-edited. It comes from `build-lookbook.py` in the notes
wiki, which emits the same catalogue three ways from one set of data:

```sh
# in the notes wiki, personal/family/marriage/wedding/
./build-web-images.sh                     # downsize venue-images/ into /tmp/web
python3 build-lookbook.py                 # -> venue-lookbook.md + .html (self-contained, offline)
LOOKBOOK_MODE=site LOOKBOOK_SITE_OUT=<repo>/venues python3 build-lookbook.py
```

Site mode writes real image files to `venues/img/` instead of inlining base64, so the page is ~1.1 MB
rather than 8.8 MB, and skins it to this site's palette and type. The photographs sit inside collapsed
`<details>`, so a browser does not fetch them until a venue is opened.

## Cost-data boundary

- **No whole-wedding budget or private ceiling.** Venues can read this public repository.
- `/venues/` does include **venue-specific rates supplied by the family**, normalized calculations and
  explicitly labeled counter-request scenarios. Those values are evidence for comparison, not accepted
  contract prices; unknown tax and unquoted components remain blank.
- On 5 September 2026 the user explicitly directed publication of the exact received commercial
  figures, including Virajpet and Indo Asia Madikeri despite their restrictive footers. This exception
  is recorded in the notes source ledger and LOG; it does not imply the senders withdrew restrictions.
  Bank details, personal contact blocks and raw correspondence are not published.
- The generator loads `received-email-prices.json` for the mailbox extraction. Four additional
  commercial-only properties are shown separately from the ranked catalogue.
- Old modelled estimates are still removed from the public build. Only the new quote-backed cost schema
  is allowed through the generator's public-site scrub.

The photographs in `/venues/` are each property's own promotional images, retained as planning
references and **not licensed for reuse**. Both pages carry `noindex` and `robots.txt` disallows
everything; these discourage indexing but do not make the public site private or grant image rights.

## Layout

- `index.html` — the home page (single page, no build step, no dependencies)
- `images/` — mood-board WebP, max 1600px, quality 82
- `venues/index.html` + `venues/img/` — the generated venue study (see above; do not hand-edit)
- `CNAME` — custom domain for GitHub Pages
- `robots.txt` + `<meta name="robots" content="noindex">` — keeps the site out of search results
- `.nojekyll` — skip Jekyll processing

## Source of truth

Authored in the notes wiki at `personal/family/marriage/wedding/`, which holds the constraints, the
schedule, the venue study and the catalogue built from it. When a fact on this page changes, it changed
there first. Mood-board originals live in `../images/` (multi-MB PNG screenshots) and are deliberately
not committed here.

## Regenerating images

```sh
magick "<original>.png" -resize '1600x1600>' -strip -quality 82 "images/<slug>.webp"
```

## Local preview

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Verification

With the local server running and Python Playwright/Chromium installed:

```sh
python3 scripts/verify-site.py http://localhost:8000
```

Checks both comparison tables against the catalogue, all image files, homepage totals, sorting on
every table, room-filter consistency, and 390px/1440px layouts. The 5 September 2026 content audit
also corrected composite room totals, current Gateway Coorg branding, unsupported capacity passes,
the historical March climate labels and the sound-permission wording. A verified property total
does not establish availability for the wedding dates; dated inventory and 100-seat layouts remain
venue-confirmation items.

## Deploy

Push to `main`. GitHub Pages publishes within a minute or two.

## Invitation

`invite/index.html`, `invite/invite.css`, `invite/chapters.css` and `invite/invite.js` are a dependency-free static addition.
The page uses self-hosted fonts, responsive WebP photographs, generated garden artwork and five
2.8–4.0-second H.264 excerpts with **no audio streams**. Each silent film plays once when its memory enters
the viewport; reduced-motion and Save-Data begin with stills. The guest can pause or explicitly
enable motion. Nearby photo scenes follow native scroll with eased translations and slight turns,
chapter backgrounds open gently, and the two-city image halves join. Layout measurements are
cached, mobile amplitude is reduced, and drawing stops when settled. Selected photos open in
a keyboard-accessible native dialog; the two small older snapshots stay small. Names use
self-hosted Allura, with Cormorant Garamond headings and Manrope supporting text.

The date-range `.ics` saves 25–27 February as all-day dates, with 28 February as the exclusive end.
The invitation and calendar give dates and celebrations without precise ceremony hours. RSVP collection remains unconfigured.
Venue address source: [The Ummed’s official contact page](https://www.ummedhotels.com/hotel-in-ahmedabad/contact-us).

Build selected derivatives with Python, Pillow, fonttools[woff] and imageio-ffmpeg installed:

```sh
python3 scripts/build-invite-assets.py --wiki "/path/to/private/wedding/wiki"
# Rebuild only new/changed assets while retaining the rest of the manifest:
python3 scripts/build-invite-assets.py --wiki "/path/to/private/wedding/wiki" --only proposal-restored-v2 his-umbrella
```

The builder leaves sources untouched, tone-maps HLG footage to SDR, strips metadata and audio,
and records selected sources/timestamps in `invite/assets/manifest.json`. Upstream font source
URLs and OFL licenses are preserved. Generated artwork provenance and exact prompts live in
`invite/assets/art/*-prompt.md`; the PNG originals are retained alongside WebP derivatives.

The 4 October revision adds eight archive photos, a second duet, and a dedicated proposal
chapter. The proposal now uses a brighter AI-assisted restoration of the 235-second proposal
frame, displayed upright and cropped inside its arched frame; it contains no video. The original
photo and footage remain untouched. [Selected output, prompt and provenance](source-assets/proposal/README.md)
record the gentle restoration and rejected over-reconstructed trial. The later umbrella excerpt (6.8–10.8 seconds) shows Sidharth
stepping toward the camera and gesturing with the umbrella, with a 9.9-second still. The shared-future
desktop portrait is limited to 390 px. Raw footage is not part of this repo.

Flowers, brass bells, the architectural garden/pillars, closing background, photographs and copy
respond at different depths to scroll and mouse movement. Text movement stays very small;
phone and tablet lateral movement is restrained to preserve the layout. Touch movement does not
act as a mouse pointer. Motion starts automatically on page load, with no Enable/Pause button.
Videos remain muted, play once and pause offscreen; the animation loop stops when settled.

Visual review and interaction evidence, including the current browser-access status:
[design-qa.md](design-qa.md).


The latest opening separates the former combined illustration into a clean architectural base,
sparse canopy vines, fine jasmine strands, light lower foliage and two individual brass bells.
Six botanical wings and both bells move at different depths; tablet/phone layouts keep the
corner artwork visible without crowding names or navigation. Exact built-in generation prompts,
originals and asset paths are recorded in [the layer manifest](invite/assets/art/hero-layers.md).
