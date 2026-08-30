# kadheechawal4life.com

Static site for Sidharth & Kalyani's wedding, 27–29 March 2027. Served by GitHub Pages from `main`.

It is a **working brief**, not an invitation — the page a venue, planner or decorator is sent so they
know what is being asked for before they quote. Four things it carries:

1. **The facts** — dates, under 80 guests, and the ceremony at 00:44
2. **The programme** — the three days, hour by hour
3. **What the space has to do** — the six requirements that decide whether a property can host it at all
4. **The visual direction** — the Sacred Grove mood board

## Deliberately not here

- **Budget, in any form.** Venues read this.
- **The venue shortlist**, and the research behind it — the study is 39 properties across seven regions,
  and it is not something to publish while any of them is being negotiated with.
- **Venue photographs.** Everything in the study is a third-party promotional image, downloaded for
  private planning use and not licensed for republication. Only the mood references belong here, and
  none of them is the wedding venue.

Those all live in the notes wiki instead — see below.

## Layout

- `index.html` — the whole site (single page, no build step, no dependencies)
- `images/` — optimized WebP, max 1600px, quality 82
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
