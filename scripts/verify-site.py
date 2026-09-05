#!/usr/bin/env python3
"""Check catalogue consistency and interactions; requires Python Playwright.

Run against a local server: python3 scripts/verify-site.py http://localhost:8000
"""
import re
import sys
from playwright.sync_api import sync_playwright

base = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000").rstrip("/")
with sync_playwright() as pw:
    browser = pw.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    assert page.goto(base + "/venues/").status == 200
    page.wait_for_load_state("networkidle")
    venues = page.locator("details.vdet").count()
    regions = page.locator("details.region").count()
    tables = page.locator("table.cmp")
    assert tables.count() == 3
    assert tables.nth(0).locator("tbody tr").count() == regions
    for table in [tables.nth(1), tables.nth(2)]:
        assert table.locator("tbody tr").count() == venues
        # Exercise every column on every table, including the formerly broken
        # second/third tables, in both directions.
    for table in tables.all():
        for th in table.locator("th").all():
            th.evaluate("el => el.click()")
            th.evaluate("el => el.click()")
    table = tables.nth(1)
    table.locator("th").nth(0).evaluate("el => el.click()")
    names = table.locator("tbody tr td:first-child").all_text_contents()
    assert len(set(names)) == venues
    # Unknown/conflicting counts must not be promoted by regional totals.
    verified = page.locator('details.vdet[data-rooms="ok"]').count()
    regional = sum(int(t.split(" of ")[0]) for t in tables.nth(0).locator("tbody tr td:nth-child(4)").all_text_contents())
    assert regional == verified
    page.locator('[data-f="rooms"]').click()
    assert page.locator("details.vdet:not(.hide)").count() == verified
    page.locator('[data-f="rooms"]').click()
    page.locator("#xall").click()
    assert page.locator("details.vdet[open]").count() == venues
    page.locator("#call").click()
    assert page.locator("details.vdet[open]").count() == 0
    # All image URLs, including CSS backgrounds in closed details, must exist.
    images = page.evaluate("""() => [...new Set([...document.styleSheets].flatMap(s => {
      try {return [...s.cssRules].flatMap(r => [...r.cssText.matchAll(/url\\([\"']?([^\"')]+)[\"']?\\)/g)].map(m => m[1]))}
      catch {return []}
    }).filter(u => u.startsWith('img/'))) ]""")
    for url in images:
        assert page.request.get(base + "/venues/" + url).status == 200, url
    assert page.goto(base + "/").status == 200
    tally = [int(v) for v in page.locator(".tally b").all_text_contents()]
    assert tally[:3] == [venues, regions, len(images)], (tally, venues, regions, len(images))
    assert page.locator(".needs .need").count() == 6
    for width in [390, 1440]:
        page.set_viewport_size({"width": width, "height": 844})
        for path in ["/", "/venues/"]:
            page.goto(base + path)
            assert page.locator('meta[name="robots"]').get_attribute("content") == "noindex, nofollow"
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), (path, width)
            if path == "/venues/" and width == 390:
                assert page.locator("table.cmp th").first.evaluate("e => getComputedStyle(e).position") == "static"
    assert not errors, errors
    browser.close()
    print(f"PASS: {venues} venues, {regions} regions, {len(images)} images; tables, filters, links and 390/1440px layouts")
