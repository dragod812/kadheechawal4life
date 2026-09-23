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

kalyani_allocations = [
    ('Supekar–Anand', 2, 2),
    ('Nani mama mami', 2, 2),
    ('Rani Aatya', 1, 1),
    ('Sudesh–Baby Aatya', 1, 1),
    ('Pramod', 1, 1),
    ('Anil–Sunil', 1, 1),
    ('Sanjay Patil', 1, 1),
    ('Kumthekar', 1, 1),
    ('Sanju–Tabu', 1, 1),
    ('Seema', 1, 1),
    ('Aparna', 1, 1),
    ('Nikhil', 1, 1),
    ('Pradeep', 1, 1),
    ('Sunita–Bapu', 1, 1),
    ('Shubhda', 1, 1),
    ('Ashish–Rahul', 1, 1),
    ('Akshay Mama', 3, 0),
    ('Manisha', 1, 1),
]
additional_allocations = [('Guruji', 1, 0, 1), ('Photographer', 1, 0, 1)]
for name, rooms, extra_beds in kalyani_allocations:
    add('Kalyani family', name, rooms * 2 + extra_beds, kind='family')
for name, rooms, extra_beds, guests in additional_allocations:
    add('Additional', name, guests, kind='family')
for name in ['Meghal', 'Saleem (MDI)', 'Karthik (MDI)', 'Arjun (MDI)']:
    add('Kalyani friends', name)

# Retire IDs after initial assignment so remaining parties retain their published IDs.
removed_ids = {'G045','G046','G047','G063','G068',
               'G034','G022','G018','G016','G011','G015','G031','G030','G035',
               'G037','G038','G039','G040','G041','G042'}
rows = [r for r in rows if r['id'] not in removed_ids]
rows = [r for r in rows if r['name'] not in {
    'Debanshu Mamu', 'Manisha Nani family', 'Susmita Mausi',
} and r['group'] != "Maa's Friends"]
for r in rows:
    if r['group'] == 'Kalyani friends' and r['name'] in {'Shreeja', 'Sonia', 'Prithvi', 'Kashmala'}:
        r.update(lo=1, hi=1, kind='single', tentative=False)
    if r['id'] in {'G035','G036'}:
        r['name'] = "Maa's Friends" if r['id'] == 'G035' else "Sourav's Friends"
        r['group'] = r['name']

def span(a,b): return str(a) if a==b else f'{a}–{b}'
for r in rows:
    if r['name']=='Meehika': r['note']='Shared by both sides; counted once here, per Sidharth’s confirmation'
groups=['Sidharth family','Sidharth friends',"Sourav's Friends","Saurav's team",'Kalyani family','Kalyani friends','Kanch friends','Additional']
def total(rs,field): return sum(r[field] for r in rs)
# Provisional party assignments preserve the supplied family room groupings.
family_rooms = {
    'Sidharth family': {
        'Sidharth fam': (0, 1, 1), 'Mamu': (1, 0, 0), 'Mausi': (1, 0, 0),
        'Abhishek Ritesh': (0, 2, 1), 'Latika Aunty': (0, 1, 0), 'Khuku Badama': (0, 1, 0),
    },
    'Kalyani family': {
        name: (1, rooms - 1, extra_beds - 1) if name in {'Supekar–Anand', 'Nani mama mami'}
        else (0, rooms, extra_beds)
        for name, rooms, extra_beds in kalyani_allocations
    },
}
# Sharing estimates keep pairs together and pool singles only within each group.
def friends_rooms(group):
    selected = [r for r in rows if r['group'] == group]
    pairs = sum(r['kind'] == 'pair' for r in selected)
    singles = sum(r['kind'] == 'single' for r in selected)
    shared = (singles + 2) // 3
    return pairs + shared, max(0, singles - 2 * shared)

room_plan = []
for group in groups:
    guests = total([r for r in rows if r['group'] == group], 'lo')
    suites = 0
    if group in family_rooms:
        suites, premium, extras = [sum(v[i] for v in family_rooms[group].values()) for i in range(3)]
    elif group in {'Sidharth friends', 'Kalyani friends', 'Kanch friends'}:
        premium, extras = friends_rooms(group)
    elif group in {"Sourav's Friends", "Saurav's team"}:
        premium, extras = (guests + 1) // 2, 0
    else:
        premium, extras = 2, 0
    room_plan.append([group if group != 'Additional' else 'Guruji and photographer', suites, premium, extras, guests])
room_totals = [sum(row[i] for row in room_plan) for i in range(1, 5)]
main_suites, main_premium, main_extras, main_guests = room_totals
md=[]; html=[]
def para(s): md.append(s+'\n'); html.append('<p>'+escape(s)+'</p>')
def heading(s,level=2): md.append('#'*level+' '+s+'\n'); html.append(f'<h{level}>'+escape(s)+f'</h{level}>')
def table(headers,data):
    md.append('| '+' | '.join(headers)+' |\n| '+' | '.join(['---']*len(headers))+' |\n'+'\n'.join('| '+' | '.join(map(str,row))+' |' for row in data)+'\n')
    html.append('<div class="table-wrap"><table><thead><tr>'+''.join('<th scope="col">'+escape(x)+'</th>' for x in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+escape(str(x))+'</td>' for x in row)+'</tr>' for row in data)+'</tbody></table></div>')

heading('The Ummed, Ahmedabad',1)
para('Guest & room plan · 25–27 February 2027')
para(f'{main_guests} guests listed · {main_suites + main_premium} rooms for the full group.')

heading('Nightly room plan')
table(['Night','Rooms required','Extra beds required','Total guests'],[
    ['25 February','4 suites + 6 Premium Rooms = 10 rooms','6 extra beds, one in each Premium Room',26],
    *[[f'{day} February', f'{main_suites} suites + {main_premium} Premium Rooms = {main_suites + main_premium} rooms',
       f'{main_extras} extra beds, one in each of {main_extras} Premium Rooms', main_guests] for day in [26,27]],
])
para('Two suites for Sidharth family and two for Kalyani family. Planning basis: 26 guests on 25 February (two per suite, three per Premium Room); the full guest list on 26–27 February. Individual stays and sharing partners to be confirmed.')
html.append('<details><summary>Room breakdown · 26–27 February</summary>')
md.append('### Room breakdown · 26–27 February\n')
table(['Group','Suites','Premium Rooms','Extra beds','Guests'], room_plan + [['TOTAL', *room_totals]])
para('Provisional suite assignments: Mamu and Mausi for Sidharth family; one room each from Supekar–Anand and Nani mama mami for Kalyani family. All other family rooms are Premium Rooms, with extra beds for three guests. Abhishek/Ritesh’s five guests split 3 + 2. Couples stay together; friend singles share up to three within their group. Sourav’s Friends and Saurav’s team use twin sharing. Guruji and the photographer each have one room alone.')
html.append('</details>')

heading('Room types')
table(['Type','Guest capacity','Use'],[
    ['Suite — 4 available','Up to 4 each','2 for Sidharth family; 2 for Kalyani family'],
    ['Premium Room','2','Couples, families or two sharing guests'],
    ['Premium + extra bed','3','Families or three compatible sharing guests'],
])
para('No standard four-person rooms. Only the four suites can accommodate four guests each.')

heading('Guest count')
summary=[]
for group in groups:
    rs=[r for r in rows if r['group']==group]
    label = 'Guruji and photographer' if group == 'Additional' else group
    summary.append([label,span(total(rs,'lo'),total(rs,'hi'))])
summary.append(['TOTAL',span(total(rows,'lo'),total(rows,'hi'))])
table(['Group','Guests'],summary)
para('Saurav’s team remains approximately 6.')

heading('Guest list')
para('Friend singles share rooms with extra beds. MDI: Saleem, Karthik and Arjun. Each extra-bed room accommodates three guests.')
allocation_by_group = {
    'Additional': {name: (rooms, extra_beds) for name, rooms, extra_beds, guests in additional_allocations},
}
for group in groups:
    rs=[r for r in rows if r['group']==group]
    if group in family_rooms:
        s, p, e = [sum(v[i] for v in family_rooms[group].values()) for i in range(3)]
        label = f'{group} · {total(rs, "lo")} guests · {s} suites + {p} Premium Rooms · {e} extra beds'
    elif group == 'Additional':
        label = 'Guruji and photographer · 2 guests · 2 rooms'
    else:
        label = group+' · '+span(total(rs,'lo'),total(rs,'hi'))+' guests'
    html.append('<details><summary>'+escape(label)+'</summary>')
    md.append('### '+label+'\n')
    if group in family_rooms:
        table(['ID','Party / person','Suites','Premium Rooms','Extra beds','Guests'],[
            [r['id'],r['name'],*family_rooms[group][r['name']],span(r['lo'],r['hi'])] for r in rs
        ])
    elif group in allocation_by_group:
        allocations = allocation_by_group[group]
        table(['ID','Party / person','Rooms','Extra beds','Guests'],[
            [r['id'],r['name'],allocations[r['name']][0],allocations[r['name']][1],span(r['lo'],r['hi'])]
            for r in rs
        ])
    else:
        table(['ID','Party / person','Guests'],[[r['id'],r['name'],span(r['lo'],r['hi'])] for r in rs])
    html.append('</details>')

heading('To confirm')
para('Individual arrival/checkout dates, suite assignments, sharing partners and hotel availability. Saurav’s team count is approximate.')

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
print(summary[-1]); print(room_plan)
