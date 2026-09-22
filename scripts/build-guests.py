#!/usr/bin/env python3
"""Build the guest planning Markdown and static page from the supplied party list."""
from pathlib import Path
from html import escape
import argparse

rows = []
def add(group, name, lo=1, hi=None, kind='single', tentative=False, note=''):
    rows.append(dict(id=f'G{len(rows)+1:03}', group=group, name=name, lo=lo,
                     hi=lo if hi is None else hi, kind=kind, tentative=tentative, note=note))
for name,n in [('Sidharth fam',3),('Mamu',4),('Mausi',4),('Debanshu Mamu',2),('Abhishek Ritesh',5)]:
    add('Sidharth family',name,n,kind='family')
for name in ['Shivang','Murtuza','Akshat','Aditya','Kanupriya','Mansi','Saikia','Meehika','Tarun','Priyanshu','Manish']:
    add('Sidharth friends',name,2,kind='pair',note='Possible cross-list duplicate' if name=='Meehika' else '')
for name in ['Vikram','Vaibhav','Nilay','Nishant','Vibhor','Mantek','Felipe','Mrinal','Jha','Goyal','Singhal','Nishil','Nishchay','Darshil','Sagar Rusia','Rivu','Aditya VT','Kriti']:
    add('Sidharth friends',name)
for name in ['Maa friends','Sourav Friends']:
    add('Sidharth group blocks',name,10,kind='block',note='Composition unknown; keep each block separate')
for name,lo,hi in [('Kalyani Close fam',5,5),('Rani Aatya',3,4),('Akshay fam',3,3),('Kumthekar fam',3,4),('Mama mami mai aai',3,3),('Tushar Trisha Baby Himanshu',4,4)]:
    add('Kalyani family',name,lo,hi,'family',note='Baby included in headcount; bed/age needs TBD' if 'Baby' in name else '')
for name,n,t in [('Divya',2,False),('Varsha',1,False),('Vineeth',2,False),('Vinit',1,False),('Rohit',2,False),('Aditi',1,False),('Arpita',2,False),('Dimri',1,False),('Lakshya shreya',2,False),('Meehika',2,False),('Ankur',1,False),('Tirth',2,False),('Shreeja',1,True),('Prithvi',2,True),('Sonia',1,True),('Shrijan',2,False),('Akshata',2,False),('Anshika',1,False),('Stuti',1,False),('Ayush',1,False),('Niyati',1,False),('VT',2,False),('Geetika',1,False),('Gouri',1,False),('Noorul',1,False),('Kashmala',1,False)]:
    if name != 'Meehika':
        add('Kalyani friends',name,n,kind='pair' if n==2 else 'single',tentative=t)
for name in ['Anand','Zeel','pt','raag','snigi','tanvee','disha','rowena','priti']:
    add('Kanch friends',name,note='Assumed one person; confirm spelling/count' + ('; Mumbai group' if name in ['tanvee','disha','rowena','priti'] else ''))

# Append new parties before retiring old IDs; never reuse a published ID.
for name,n in [('Susmita Mausi',1),('Latika Aunty',1),('Khuku Badama',2),('Manisha Nani family',4)]:
    add('Sidharth family',name,n,kind='single' if n==1 else 'family',
        note='Family singles pool; sharing subject to agreement' if n==1 else '')
for name,n in [('Meenati',2),('Sujata',2),('Anjana',2),('Trupti',2),('Sabita',2),('Sarita',1)]:
    add("Maa's Friends",name,n,kind='pair' if n==2 else 'single',note='Puri only; overnight stay TBD')
add("Saurav's team", "Saurav's team", 6, kind='block', note='Approximately 6; names, exact count and sharing preferences TBD. Separate from Sourav’s Friends.')

# Retire IDs after initial assignment so remaining parties retain their published IDs.
removed_ids = {'G045','G046','G047','G054','G055','G056','G063','G067','G068',
               'G034','G022','G018','G016','G011','G015','G031','G030','G035'}
rows = [r for r in rows if r['id'] not in removed_ids]
rows = [r for r in rows if r['name'] not in {'Debanshu Mamu', 'Manisha Nani family', 'Susmita Mausi'} and r['group'] != "Maa's Friends"]
for r in rows:
    if r['id'] in {'G035','G036'}:
        r['name'] = "Maa's Friends" if r['id'] == 'G035' else "Sourav's Friends"
        r['group'] = r['name']

def span(a,b): return str(a) if a==b else f'{a}–{b}'
for r in rows:
    if r['name']=='Meehika': r['note']='Shared by both sides; counted once here, per Sidharth’s confirmation'
groups=['Sidharth family','Sidharth friends',"Sourav's Friends","Saurav's team",'Kalyani family','Kalyani friends','Kanch friends']
def total(rs,field): return sum(r[field] for r in rs)
md=[]; html=[]
def para(s): md.append(s+'\n'); html.append('<p>'+escape(s)+'</p>')
def heading(s,level=2): md.append('#'*level+' '+s+'\n'); html.append(f'<h{level}>'+escape(s)+f'</h{level}>')
def table(headers,data):
    md.append('| '+' | '.join(headers)+' |\n| '+' | '.join(['---']*len(headers))+' |\n'+'\n'.join('| '+' | '.join(map(str,row))+' |' for row in data)+'\n')
    html.append('<div class="table-wrap"><table><thead><tr>'+''.join('<th scope="col">'+escape(x)+'</th>' for x in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+escape(str(x))+'</td>' for x in row)+'</tr>' for row in data)+'</tbody></table></div>')

heading('The Ummed, Ahmedabad',1)
para('Guest & room plan · 25–27 February 2027')
para('116–118 guests listed · Planning target: 120 on 26–27 February · 25 February: mainly close family, around 26 guests.')

heading('Proposed nightly room plan')
night_plan=[
    ['25 February','Mainly close family','4 suites + 6 Premium = 10 rooms',6,26],
    ['26 February','Main guest group','4 suites + 46 Premium = 50 rooms',20,120],
    ['27 February','Main guest group','4 suites + 46 Premium = 50 rooms',20,120],
]
table(['Night','Who stays','Rooms','Extra beds','Planned guests'],night_plan)
para('One extra bed in each selected Premium Room. This is a proposed allocation, not a confirmed booking.')

heading('Room types')
table(['Type','Guest capacity','Use'],[
    ['Suite — 4 available','Up to 4 each','Mainly bride, groom and close family'],
    ['Premium Room','2','Couples, families or two sharing guests'],
    ['Premium + extra bed','3','Families or three compatible sharing guests'],
])
para('No standard four-person rooms. Only the four suites can accommodate four guests each.')
para('At full occupancy, the proposed mix has capacity for 34 / 128 / 128 guests, leaving 8 spare places each night. Extra-bed needs depend on actual suite occupancy and room assignments.')

heading('Guest count')
summary=[]
for group in groups:
    rs=[r for r in rows if r['group']==group]
    summary.append([group,span(total(rs,'lo'),total(rs,'hi'))])
summary.append(['TOTAL',span(total(rows,'lo'),total(rows,'hi'))])
table(['Group','Guests'],summary)
para('Rani Aatya and Kumthekar family are 3–4 each. Saurav’s team is approximately 6. The 120-person target allows 2–4 additional guests beyond the listed count.')

heading('Guest list')
para('33 individual guests can be grouped by friendship and sharing preference; gender is not assumed. Group blocks need a breakdown.')
for group in groups:
    rs=[r for r in rows if r['group']==group]
    html.append('<details><summary>'+escape(group)+' · '+span(total(rs,'lo'),total(rs,'hi'))+' guests</summary>')
    md.append('### '+group+'\n')
    table(['ID','Party / person','Guests'],[[r['id'],r['name'],span(r['lo'],r['hi'])] for r in rs])
    html.append('</details>')

heading('To confirm')
para('Names staying on 25 February; suite assignments; final sharing groups and extra beds; individual arrival/checkout dates; hotel availability and charges.')

parser=argparse.ArgumentParser(); parser.add_argument('--wiki',type=Path); args=parser.parse_args()
out=Path(__file__).resolve().parents[1]/'guest-estimation'; out.mkdir(exist_ok=True)
doc='\n'.join(md)
(out/'guest-estimation.md').write_text(doc)
if args.wiki:
    wiki_doc=doc
    (args.wiki/'guest-estimation.md').write_text(wiki_doc)
    (args.wiki/'guest-estimation-ahmedabad.md').write_text(wiki_doc)
css='''body{margin:0;background:#f7f4ec;color:#293629;font:16px/1.65 system-ui,sans-serif}main,nav{max-width:1120px;margin:auto;padding:24px}nav{display:flex;flex-wrap:wrap;gap:20px;border-bottom:1px solid #d6dacd}a{color:#40513b}h1,h2,h3{font-family:Georgia,serif;line-height:1.2}h1{font-size:clamp(32px,5vw,54px)}h2{font-size:26px;margin-top:32px}details{margin:10px 0;border-bottom:1px solid #d6dacd;padding:10px 0}summary{cursor:pointer;font-weight:600}h3{font-size:23px;margin-top:32px}p{max-width:920px}.table-wrap{overflow-x:auto;margin:20px 0;background:#fffdf7;border:1px solid #d6dacd;border-radius:8px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{padding:12px 15px;text-align:left;border-bottom:1px solid #e2e5db;vertical-align:top;min-width:95px}th{background:#40513b;color:white}td:first-child{font-weight:600}tr:last-child td{border-bottom:0}@media(max-width:600px){main,nav{padding:18px}th,td{padding:10px;min-width:90px}}@media print{nav{display:none}.table-wrap{overflow:visible}th{color:#000;background:#eee}body{font-size:11px}h2{margin-top:24px}table{font-size:10px}th,td{min-width:0;padding:5px}}'''
(out/'index.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Guest & room estimation · Sidharth & Kalyani</title><style>'+css+'</style></head><body><nav aria-label="Main"><a href="/">Wedding brief</a><a href="/venues/">Venue study</a><a href="guest-estimation.md" download>Download Markdown</a></nav><main>'+''.join(html)+'</main></body></html>')
print(summary[-1]); print(night_plan)
