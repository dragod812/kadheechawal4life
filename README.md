# kadheechawal4life.com

Static site for Sidharth & Kalyani's wedding. Served by GitHub Pages from `main`.

## Layout

- `index.html` — the Sacred Grove mood board (single page, no build step, no dependencies)
- `images/` — optimized WebP, max 1600px, quality 82
- `CNAME` — custom domain for GitHub Pages
- `robots.txt` + `<meta name="robots" content="noindex">` — keeps the site out of search results
- `.nojekyll` — skip Jekyll processing

## Source of truth

Authored in the notes wiki at `personal/family/marriage/wedding/`. Originals live in
`../images/` (multi-MB PNG screenshots) and are deliberately not committed here.

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
