# kadheechawal4life.com

Static site for Sidharth & Kalyani's wedding, 27–28 February 2027, with a two-night Puri/Ahmedabad
stay. Served by GitHub Pages from `main`.

It is a **working brief**, not an invitation — the page a venue, planner or decorator is sent so they
know what is being asked for before they quote.

## Pages

| Path | What it is |
|---|---|
| `/` | The facts, the two-function-day/two-night programme, the six things the space has to do, and the Sacred Grove mood board |
| `/venues/` | The venue study — 66 properties across 12 regions, with verified facts, quote-backed cost analysis, outreach messages, and 613 photographs |

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
- Commercial documents marked confidential, agent-only or not for public distribution are represented
  only by a redacted applicability/status summary unless the user explicitly confirms that the
  label is erroneous and the data public; that override must be recorded in the private notes wiki.
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
