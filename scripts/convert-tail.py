import re,sys
KEY={'firetrucks':'ft','platform_trucks':'pt','battalion_chief_vehicles':'bc','mobile_command_vehicles':'mc','elw3':'mc',
'mobile_air_vehicles':'ma','water_tankers':'wt','heavy_rescue_vehicles':'hr','technical_rescue':'tr','hazmat_vehicles':'hz',
'fire_investigation':'fi','police_cars':'pc','sheriff':'pc','oneof_police_patrol_or_swat':'pc','k9':'k9','police_helicopters':'ph',
'swat_armored_vehicle':'sw','arff':'arff','ambulances':'am','boats':'bt','large_rescue_boat':'bt','large_fire_boat':'fb',
'brush_truck':'br','fbi':'fd','dea_clan_lab':'fd','dea_unit':'fd','atf_lab_vehicle':'fd','atf_unit':'fd','fbi_bomb':'bo',
'police_drone':'dn','investigation':'iv','crime_scene_unit':'iv','civil_patrolcar':'iv','game_warden':'gw','foam':'fo',
'coastal_boat':'cs','large_coastal_boat':'cs','coastal_helicopter':'cht','fwk':'fwk','flood_equipment':'fl',
'detention_unit':'pv','riot_police':'rt'}
out=[]; unknown=set()
for line in open(sys.argv[1]):
    line=line.strip()
    if not line: continue
    _id,name,cr,rq,pt,pr,pre=line.split(';')
    cr='0' if not cr.isdigit() else cr
    codes={}
    for tok in rq.split(','):
        if '=' not in tok: continue
        k,v=tok.split('='); v=int(v)
        c=KEY.get(k) or ('any' if k.startswith('oneof_') else None)
        if not c: unknown.add(k); continue
        codes[c]=codes.get(c,0)+v
    pt='0-0' if pt in('-','none') else pt
    if '-' not in pt: pt='0-'+pt
    a,b=pt.split('-'); a=a if a.isdigit() else '0'
    pr='0' if not pr.isdigit() else pr
    if not codes and int(b)==0: continue
    nums=[0,0,0]
    if '/' in pre: nums=[int(x) if x.isdigit() else 0 for x in pre.split('/')]
    else:
        for k,v in re.findall(r'(\w+)[=:](\d+)',pre):
            i={'F':0,'fire_stations':0,'A':1,'rescue_stations':1,'P':2,'police_stations':2}.get(k)
            if i is not None: nums[i]=int(v)
    out.append(f"{name}|{cr}|{','.join(f'{k}{v}' for k,v in codes.items())}|{a}-{b}|{pr}|{nums[0]}/{nums[1]}/{nums[2]}")
print('\n'.join(out)); print('unknown',sorted(unknown),file=sys.stderr)
