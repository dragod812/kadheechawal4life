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
    chanakya = page.locator('details.vdet').filter(has=page.locator('summary', has_text='The Chanakya BNR Hotel'))
    assert chanakya.count() == 1 and chanakya.get_attribute('data-rooms') == 'no'
    for phrase in ['₹15,09,800', '₹16,71,800', '₹7,000 + tax', '₹1,900', '₹2,400', '34 onsite + 20 provisional offsite rooms', 'food taxes unknown', 'approximately ₹5,000']:
        assert phrase in chanakya.text_content(), phrase
    for phrase in ['₹22,40,000', '₹25,00,000', '₹6,00,000', '49 rooms', 'Inventory unresolved']:
        assert phrase not in chanakya.text_content(), phrase
    assert '₹15,09,800' in page.locator('table.costcmp tr').filter(has_text='The Chanakya BNR Hotel').text_content()
    oleander = page.locator('details.vdet').filter(has=page.locator('summary', has_text='Oleander Farms Luxury Resort, Karjat'))
    assert oleander.count() == 1
    assert oleander.get_attribute('data-rooms') == 'ok'
    oleander_text = oleander.text_content()
    for phrase in ['120+', '250 seated', '350 seated', 'snm@oleanderfarms.com', '26 February–1 March 2027']:
        assert phrase in oleander_text, phrase
    assert 'Awaiting quote' in page.locator('table.costcmp tr').filter(has_text='Oleander Farms Luxury Resort, Karjat').text_content()
    # Email-only commercial records must remain separate from ranked venues.
    extras = page.locator('#additional-quotes details.msgdet')
    assert extras.count() == 4
    extra_text = page.locator('#additional-quotes').text_content()
    for name in ['Club Mahindra Virajpet', 'AmitaRasa', 'Porcupine Castle Resort', 'Indo Asia Hotel, Madikeri']:
        assert name in extra_text, name
    assert '₹30,40,000' in extra_text and '₹15,000 + tax' in extra_text
    body = page.locator('body').text_content()
    for phrase in ['₹23,56,000', '₹21,55,500', '₹24,96,902', '29 February 2027 does not exist', '94, not 100']:
        assert phrase in body, phrase
    assert 'BANK DETAILS' not in body
    fortune_text = page.locator('details.vdet').filter(has=page.locator('summary', has_text='Fortune Beachfront, Puri')).first.text_content()
    for phrase in ['₹11,800', '₹1,770–2,655', '₹17–18 lakh', '₹12,98,000', '80 guests / 2 nights', 'feedback is mixed']:
        assert phrase in fortune_text, phrase
    assert 'rooms only' in page.locator('table.costcmp tr').filter(has_text='Fortune Beachfront, Puri').text_content()
    ummed = page.locator('details.vdet').filter(has=page.locator('summary', has_text='The Ummed Ahmedabad')).first
    ummed_text = ummed.text_content()
    for phrase in ['₹21,26,950', '₹12,77,350', '₹8,49,600', '150 × ₹1,750', '30 rooms × ₹8,000 × 3 nights', 'cleaning and maintenance']:
        assert phrase in ummed_text, phrase
    assert '₹21,26,950' in page.locator('table.costcmp tr').filter(has_text='The Ummed Ahmedabad').text_content()
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
