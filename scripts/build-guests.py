#!/usr/bin/env python3
"""Build public guest/room plans from the privacy-safe tracker snapshot."""
from pathlib import Path
from html import escape
from datetime import datetime, timedelta
import argparse
import json

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'scripts/guest-plan.json').read_text())
bride, groom = data['bride'], data['groom']
rows = groom + bride
groups = list(dict.fromkeys(r['group'] for r in rows))
def totals(items):
    return [sum(r[k] for r in items) for k in ('suites','premium','extras','guests')]
suites, premium, extras, guests = totals(rows)
assert suites == 4
assert sum(r['suites'] for r in bride) == sum(r['suites'] for r in groom) == 2
assert len({r['id'] for r in rows}) == len(rows)
assert all(r['guests'] <= r['suites']*4 + r['premium']*2+r['extras'] for r in rows)
md, html = [], []
def para(s):
    md.append(s+'\n'); html.append('<p>'+escape(s)+'</p>')
def heading(s,level=2):
    md.append('#'*level+' '+s+'\n'); html.append(f'<h{level}>'+escape(s)+f'</h{level}>')
def table(headers, values):
    md.append('| '+' | '.join(headers)+' |\n| '+' | '.join(['---']*len(headers))+' |\n'+'\n'.join('| '+' | '.join(map(str,r))+' |' for r in values)+'\n')
    html.append('<div class="table-wrap"><table><thead><tr>'+''.join('<th scope="col">'+escape(h)+'</th>' for h in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+escape(str(v))+'</td>' for v in r)+'</tr>' for r in values)+'</tbody></table></div>')
def planned_stay(r):
    return (r['arrival'] or (46443 if r['group']=='Sidharth family' else 46444), r['departure'] or 46446)
heading('The Ummed, Ahmedabad',1)
para('Guest & room plan · 25–27 February 2027')
para(f'{guests} guests listed · {suites+premium} rooms for the full list.')
heading('Nightly room plan')
nightly=[]
for day in (25,26,27):
    serial=46443+day-25
    active=[r for r in rows if planned_stay(r)[0]<=serial<planned_stay(r)[1]]
    s,p,e,g=totals(active)
    nightly.append([f'{day} February',f'{s} suites + {p} Premium Rooms = {s+p} rooms',f'{e} extra beds',g])
table(['Night','Rooms required','Extra beds required','Total guests'],nightly)
html[-1]=html[-1].replace('class="table-wrap"','class="table-wrap nightly"')
para('Planning scenario, not confirmed bookings: tracker dates where supplied; Sidharth family assumed 25–28 February, other undated guests 26–28 February. Two suites per family. Each extra bed is in a separate Premium Room.')
html.append('<details><summary>Room breakdown and planning assumptions</summary>')
md.append('### Room breakdown and planning assumptions\n')
table(['Group','Suites','Premium Rooms','Extra beds','Guests'],[[group,*totals([r for r in rows if r['group']==group])] for group in groups]+[['TOTAL',suites,premium,extras,guests]])
para('Kalyani’s tracker is the complete replacement for her old estimate: 73 bride-side guests plus 8 common vendors. Meehika & Rochak are counted only on her side. Phone numbers are not published.')
para('The tracker has 32 confirmed guests, 22 marked “No” and 27 with blank RSVP. All 81 remain in this planning scenario while “No” is clarified. Groom RSVPs are unconfirmed; Saurav’s team remains approximately 6.')
para('Proposed suites: Mamu and Mausi; Kanchan/Kalyani/Akshay and Tushar Puranik family. Other family accommodation is Premium. Four-person Premium parties use two rooms; children count in capacity until the hotel confirms infant/bed rules. All sharing is proposed.')
html.append('</details>')
heading('Guest list and room groups')
para('Sidharth’s rows are proposed room groups. Kalyani’s parties are reproduced from her tracker without changing her sheet; room counts below are planning allocations.')
for group in groups:
    items=[r for r in rows if r['group']==group]
    s,p,e,g=totals(items)
    label=f'{group} · {g} guests · {s+p} rooms'
    html.append('<details><summary>'+escape(label)+'</summary>'); md.append('### '+label+'\n')
    table(['Group ID','Guests / party','Guests','Suites','Premium Rooms','Extra beds'],[[r['id'],r['name'],r['guests'],r['suites'],r['premium'],r['extras']] for r in items])
    if group=='Sidharth family':
        para('Abhishek/Ritesh: 3 + 2 across two rooms. Latika Aunty (1) shares provisionally with Khuku Badama’s party (2).')
    elif group=="Sourav's Friends":
        para('10 unnamed guests split provisionally 3 + 3 + 2 + 2. Names and sharing compatibility to confirm.')
    elif group=="Saurav's team":
        para('Approximately 6 unnamed guests split provisionally 3 + 3. Names, count and sharing compatibility to confirm.')
    elif group=='Kalyani family':
        para('Sanjay Patil family (3 adults + 1 child): two Premium Rooms, provisionally 2 + 2. Tushar Puranik family (3 adults + 1 child): proposed second suite.')
    elif group=='Kalyani friends':
        para('Divya, Varsha, Amey, Aditi: two Premium Rooms, provisionally 2 + 2. Their tracker party stays intact.')
    html.append('</details>')
heading('To confirm')
para('Missing stays and RSVPs; meaning of tracker RSVP “No”; suite assignments and hotel capacity for children; sharing compatibility and unnamed guests. Room totals are exact for this scenario, not a confirmed booking count.')
parser=argparse.ArgumentParser();parser.add_argument('--wiki',type=Path);args=parser.parse_args()
out=ROOT/'guest-estimation';out.mkdir(exist_ok=True)
doc='\n'.join(md)
(out/'guest-estimation.md').write_text(doc)
if args.wiki:
    for name in ('guest-estimation.md','guest-estimation-ahmedabad.md'): (args.wiki/name).write_text(doc)
css='''body{margin:0;background:#f7f4ec;color:#293629;font:16px/1.65 system-ui,sans-serif}main,nav{max-width:1120px;margin:auto;padding:24px}nav{display:flex;flex-wrap:wrap;gap:20px;border-bottom:1px solid #d6dacd}a{color:#40513b}h1,h2,h3{font-family:Georgia,serif;line-height:1.2}h1{font-size:clamp(32px,5vw,54px)}h2{font-size:26px;margin-top:32px}details{margin:10px 0;border-bottom:1px solid #d6dacd;padding:10px 0}summary{cursor:pointer;font-weight:600}p{max-width:920px}.table-wrap{overflow-x:auto;margin:20px 0;background:#fffdf7;border:1px solid #d6dacd;border-radius:8px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{padding:12px 15px;text-align:left;border-bottom:1px solid #e2e5db;vertical-align:top;min-width:80px}th{background:#40513b;color:white}td:first-child{font-weight:600}tr:last-child td{border-bottom:0}@media(max-width:600px){main,nav{padding:18px}th,td{padding:10px;min-width:80px}}@media print{nav{display:none}.table-wrap{overflow:visible}th{color:#000;background:#eee}body{font-size:11px}table{font-size:10px}th,td{min-width:0;padding:5px}}'''
css+='@media(max-width:600px){.nightly table{table-layout:fixed;font-size:12px}.nightly th,.nightly td{min-width:0;padding:10px 6px;box-sizing:border-box;overflow-wrap:break-word}.nightly th:nth-child(1){width:20%}.nightly th:nth-child(2){width:36%}.nightly th:nth-child(3){width:24%}.nightly th:nth-child(4){width:20%}}'
(out/'index.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Guest & room estimation · Sidharth & Kalyani</title><style>'+css+'</style></head><body><nav aria-label="Main"><a href="/">Wedding brief</a><a href="/venues/">Venue study</a><a href="guest-estimation.md" download>Download Markdown</a></nav><main>'+''.join(html)+'</main></body></html>')
print({'guests':guests,'suites':suites,'premium':premium,'extra_beds':extras,'nightly':nightly})
