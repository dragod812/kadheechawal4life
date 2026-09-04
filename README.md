# kadheechawal4life.com

Static site for Sidharth & Kalyani's wedding, 26–28 February 2027. Served by GitHub Pages from `main`.

It is a **working brief**, not an invitation — the page a venue, planner or decorator is sent so they
know what is being asked for before they quote.

## Pages

| Path | What it is |
|---|---|
| `/` | The facts, the three-day programme, the six things the space has to do, and the Sacred Grove mood board |
| `/venues/` | The venue study — 60 properties across 10 regions, each with its case for and against, the verified facts, the messages to send them, and 576 photographs |

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

## Deliberately not here

- **Budget, in any form.** Venues read this. The numbers stay in the notes wiki, and the budget work is
  on hold until real quotations come back.
- **Anything that reads as a negotiating position.** The study says what is unresolved about each
  property; it does not say what we would pay.

The photographs in `/venues/` are each property's own promotional images, kept for private planning and
**not licensed for republication** — which is why both pages carry `noindex` and `robots.txt` disallows
everything.

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

## Deploy

Push to `main`. GitHub Pages publishes within a minute or two.
