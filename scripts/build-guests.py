#!/usr/bin/env python3
"""Build the guest planning Markdown and static page from the supplied party list."""
from pathlib import Path
from math import ceil
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

# Retire IDs after initial assignment so remaining parties retain their published IDs.
removed_ids = {'G045','G046','G047','G054','G055','G056','G063','G067','G068',
               'G034','G022','G018','G016','G011','G015','G031','G030','G035'}
rows = [r for r in rows if r['id'] not in removed_ids]
for r in rows:
    if r['kind'] == 'block':
        r['name'] = "Maa's Friends" if r['id'] == 'G035' else "Sourav's Friends"
        r['group'] = r['name']

def span(a,b): return str(a) if a==b else f'{a}–{b}'
for r in rows:
    if r['name']=='Meehika': r['note']='Shared by both sides; counted once here, per Sidharth’s confirmation'
groups=['Sidharth family','Sidharth friends',"Maa's Friends","Sourav's Friends",'Kalyani family','Kalyani friends','Kanch friends']
def total(rs,field): return sum(r[field] for r in rs)
def attending(location):
    return [r for r in rows if location=='Puri' or r['group']!="Maa's Friends"]
def allocation(location,high,mode):
    counts={1:0,2:0,3:0,4:0}
    selected=attending(location)
    def pack(n,cap):
        q,rem=divmod(n,cap)
        counts[cap]+=q
        if rem: counts[2 if rem==1 else rem]+=1
    for r in selected:
        n=r['hi' if high else 'lo']
        if r['kind']=='single': continue
        if r['kind']=='pair': counts[2]+=1
        elif r['kind']=='block': pack(n,4 if mode=='maximum' else 2)
        elif mode=='double': counts[2]+=ceil(n/2)
        elif mode=='triple': pack(n,3)
        elif n==5: counts[3]+=1; counts[2]+=1
        else: counts[n]+=1
    for group in groups:
        n=sum(r['kind']=='single' for r in selected if r['group']==group)
        pack(n,2 if mode in ['double','family'] else 4)
    return counts

md=[]; html=[]
def para(s): md.append(s+'\n'); html.append('<p>'+escape(s)+'</p>')
def heading(s,level=2): md.append('#'*level+' '+s+'\n'); html.append(f'<h{level}>'+escape(s)+f'</h{level}>')
def table(headers,data):
    md.append('| '+' | '.join(headers)+' |\n| '+' | '.join(['---']*len(headers))+' |\n'+'\n'.join('| '+' | '.join(map(str,row))+' |' for row in data)+'\n')
    html.append('<div class="table-wrap"><table><thead><tr>'+''.join('<th scope="col">'+escape(x)+'</th>' for x in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+escape(str(x))+'</td>' for x in row)+'</tr>' for row in data)+'</tbody></table></div>')

heading('Wedding guest & room estimation',1)
para('Updated 2026-09-07 · Source: Sidharth’s supplied guest list. Planning scenarios, not RSVPs or a hotel booking. All listed guests are assumed to stay on the same nights; remove day guests before booking.')
heading('Headcount at a glance')
summary=[]
for group in groups:
    rs=[r for r in rows if r['group']==group]
    other=[r for r in attending('Elsewhere') if r['group']==group]
    summary.append([group,span(total(rs,'lo'),total(rs,'hi')),span(total(other,'lo'),total(other,'hi')),sum(r['kind']=='single' for r in rs),sum(r['kind']=='single' for r in other)])
other=attending('Elsewhere')
summary.append(['TOTAL',span(total(rows,'lo'),total(rows,'hi')),span(total(other,'lo'),total(other,'hi')),sum(r['kind']=='single' for r in rows),sum(r['kind']=='single' for r in other)])
table(['Guest group','Puri guests','Elsewhere guests','Puri singles','Elsewhere singles'],summary)
para("Maa's Friends now contains six named parties totalling 11 people, replacing the old ten-person placeholder. They attend only if the wedding is in Puri. All other parties are included in both location scenarios. Attendance does not imply an overnight stay: these room estimates assume every attending guest needs accommodation. If all 11 of Maa's Friends are day guests in Puri, subtract 6 D rooms from each Puri scenario without reducing event headcount.")
para('Listed does not mean RSVP-confirmed. Meehika’s two-person party is counted once under Sidharth friends. Kanch’s eight people are included provisionally. Sourav’s Friends remains an unresolved ten-person block.')
para('This list is larger than the earlier roughly 100-guest venue brief. It is a new planning estimate; the existing brief and venue enquiries have not been revised. Confirm overnight attendance before changing contracted numbers.')
heading('How to read the room estimates')
para('D = one room for up to 2 guests (double bed for a couple, twin beds for unrelated sharers). T = one room with approved 3-person occupancy. Q = one room with approved 4-person occupancy and suitable beds. A two-bedroom villa may be one booking unit but two bedrooms: ask the hotel to distinguish keys, bedrooms and beds. Capacity alone does not establish a suitable sleeping arrangement.')
para("Two-person parties stay together in one D. Families remain separate from other parties, but may split across their own rooms. Singles are pooled separately within each guest group; no cross-group sharing is assumed. Susmita Mausi and Latika Aunty are modelled in one shared twin room, subject to agreement; separate rooms add one D. Sarita uses one D alone within Maa's Friends. Unfilled last rooms stay within their pool. No gender is inferred from names. These counts are minimums before gender, friendship, accessibility and privacy constraints.")
heading('Room configurations to compare')
models=[('double','A · All rooms up to 2',"Families split into D rooms; singles share twins; Sourav's Friends uses 5 D."),('family','B · Family rooms + twin-sharing singles',"Families of 3 use T, families of 4 use Q, families of 5 use T + D; singles share twins; Sourav's Friends uses 5 D."),('triple','C · Triples for families + four-sharing singles',"Families use up to 3 per room; singles use Q with smaller remainder rooms; Sourav's Friends uses 5 D."),('mixed','D · Family rooms + four-sharing singles',"Families use T/Q (5 = T + D); singles use Q with smaller remainder rooms; Sourav's Friends uses 5 D."),('maximum',"E · Also share Sourav's Friends", "Same as D, plus Sourav's Friends uses 2 Q + 1 D. Only feasible if its internal relationships permit it. Maa's Friends stays as five two-person parties and one single in every Puri scenario.")]
def mix(c): return ' + '.join(f'{n} {k}' for k,n in [('D',c[2]),('T',c[3]),('Q',c[4])] if n)
for key,title,desc in models:
    heading(title,3); para(desc)
    data=[]
    for location in ['Puri','Elsewhere']:
        for high in [False,True]:
            c=allocation(location,high,key); rooms=sum(c.values()); guests=total(attending(location),'hi' if high else 'lo')
            assert sum(k*v for k,v in c.items())>=guests
            data.append([location,guests,mix(c),rooms,rooms*2,sum(k*v for k,v in c.items())-guests])
    table(['Wedding location','Guests','Room mix','Rooms / night','Room-nights × 2','Spare capacity'],data)
para('Use D as the first room-mix request for hotels, with A as the comfort fallback. E is an aggressive sharing scenario, not an assignment. Spare capacity is fragmented across rooms and cannot automatically accommodate extra guests. Counts exclude vendor rooms, a separate bridal/getting-ready room, and any additional couple room not already covered by the family parties.')
heading('Family-by-family room options')
table(['Family party','People','All doubles','Family-room option'],[[r['name'],span(r['lo'],r['hi']),f"{ceil(r['lo']/2)} D" if r['lo']==r['hi'] else '2 D', {2:'1 D',3:'1 T',4:'1 Q',5:'1 T + 1 D'}[r['lo']] if r['lo']==r['hi'] else '1 T if 3; 1 Q if 4'] for r in rows if r['kind']=='family'])
para('For a five-person family, 3 + 2 avoids a person sleeping alone. Other choices are 2 + 2 + 1 in three D rooms, 4 + 1 in Q + D if preferred, or one hotel-approved five-person suite. Five-person suites are not assumed in any total. Do not assume a baby needs no bed or does not count toward the hotel’s occupancy limit.')
heading('Single guests available for later grouping')
for group in groups:
    rs=[r for r in rows if r['group']==group and r['kind']=='single']
    if rs: para(group+': '+', '.join(r['name']+(' (tentative)' if r['tentative'] else '') for r in rs)+'.')
para('For gender/friendship grouping, assign a sharing-group label after confirming preferences, then calculate each group separately: sum(ceil(group size / room capacity)). For example, 5 people in one group and 3 in another need 3 four-person rooms, although 8 freely mixable people need only 2. Smaller remainder rooms can reduce the number of Q rooms needed without reducing total rooms.')
heading('Master guest register')
para('Stable IDs distinguish similarly named parties. Gender, sharing group, hotel stay, arrival/departure, bed requirements and final room assignment are all TBD. “Listed” only means supplied in this conversation. A two-person party is kept together without assuming its relationship.')
for group in groups:
    heading(group,3)
    table(['ID','Party / person','People','Rooming category','Attendance','Notes'],[[r['id'],r['name'],span(r['lo'],r['hi']),{'single':'Single pool','pair':'Together in 1 D','family':'Family — see options','block':'Unresolved group block'}[r['kind']], 'Puri only' if group=="Maa's Friends" else 'Listed',r['note'] or '—'] for r in rows if r['group']==group])
heading('Decisions before reserving rooms')
table(['Decision','Effect on estimate'],[
    ['Meehika duplicate resolved','Sidharth confirmed the two entries are redundant on 2026-09-07. One two-person party is counted under Sidharth friends; the Kalyani entry is a reference to the same party. Totals already exclude the duplicate.'],
    ['Repeated first names','Distinct remaining parties are kept separate; do not merge without confirmation.'],
    ['Kanch friends parsing','Zeel, pt, raag, snigi = 4; Mumbai: tanvee, disha, rowena, priti = 4. Confirm these are eight separate singles. Relationship label retained as Kanch without interpretation.'],
    ['Rani Aatya and Kumthekar','Each is 3–4, producing a combined 2-person range.'],
    ["Maa's Friends and Sourav's Friends", "Maa's Friends: 11 people, Puri only; five two-person parties plus Sarita. Sourav's Friends: 10 people, both locations, composition unknown. Confirm Sourav's breakdown before using E."],
    ['Who needs accommodation, and for which nights?','Create an allocation for each night; local attendees may need zero hotel rooms. Two nights is only the current comparison baseline.'],
    ['Gender, friendship and comfort','Confirm sharing preferences; split pools and round separately. Ask elders about floor/access and bathrooms.'],
    ['Couple / bridal room and baby needs','Confirm whether Sidharth and Kalyani already appear in their family totals and whether separate rooms or a cot are needed.'],
    ['Hotel inventory and costs','Request D/T/Q counts, actual bed layouts, permitted adult/child occupancy, extra-bed charges and per-night rates. Cheapest room count is not necessarily cheapest accommodation.']])
para('Compare quoted accommodation cost as nights × (D count × D rate + T count × T rate + Q count × Q rate), then add quoted extras and applicable taxes without double-counting occupancy charges already included in a rate. Recalculate night by night when stays differ. No prices have been assumed.')

parser=argparse.ArgumentParser(); parser.add_argument('--wiki',type=Path); args=parser.parse_args()
out=Path(__file__).resolve().parents[1]/'guest-estimation'; out.mkdir(exist_ok=True)
doc='\n'.join(md)
(out/'guest-estimation.md').write_text(doc)
if args.wiki: (args.wiki/'guest-estimation.md').write_text(doc)
css='''body{margin:0;background:#f7f4ec;color:#293629;font:16px/1.65 system-ui,sans-serif}main,nav{max-width:1120px;margin:auto;padding:24px}nav{display:flex;flex-wrap:wrap;gap:20px;border-bottom:1px solid #d6dacd}a{color:#40513b}h1,h2,h3{font-family:Georgia,serif;line-height:1.2}h1{font-size:clamp(32px,5vw,54px)}h2{font-size:30px;margin-top:52px}h3{font-size:23px;margin-top:32px}p{max-width:920px}.table-wrap{overflow-x:auto;margin:20px 0;background:#fffdf7;border:1px solid #d6dacd;border-radius:8px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{padding:12px 15px;text-align:left;border-bottom:1px solid #e2e5db;vertical-align:top;min-width:95px}th{background:#40513b;color:white}td:first-child{font-weight:600}tr:last-child td{border-bottom:0}@media(max-width:600px){main,nav{padding:18px}th,td{padding:10px;min-width:90px}}@media print{nav{display:none}.table-wrap{overflow:visible}th{color:#000;background:#eee}body{font-size:11px}h2{margin-top:24px}table{font-size:10px}th,td{min-width:0;padding:5px}}'''
(out/'index.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Guest & room estimation · Sidharth & Kalyani</title><style>'+css+'</style></head><body><nav aria-label="Main"><a href="/">Wedding brief</a><a href="/venues/">Venue study</a><a href="guest-estimation.md" download>Download Markdown</a></nav><main>'+''.join(html)+'</main></body></html>')
print(summary[-1]); print([(location,key,sum(allocation(location,True,key).values())) for location in ['Puri','Elsewhere'] for key,_,_ in models])
