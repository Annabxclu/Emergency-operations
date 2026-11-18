// Per-mission vehicle requirements, patients, prisoners and station prerequisites,
// transcribed from https://www.missionchief.com/einsaetze.json (seasonal events skipped).
// Format: name|credits|requirements|patients min-max|prisoners max|fire/ems/police stations
export const REAL_REQUIREMENTS = `
Bin fire|110|ft1|0-0|0|
Container fire|170|ft1|0-0|0|
Burning car|370|ft1|0-0|0|
Burning motorbike|340|ft1|0-0|0|
Burning grass|200|ft1|0-0|0|
Room fire|1400|pt1,ft2|0-1|0|
Garden shed fire|600|ft2|0-0|0|
Burning leaves|210|ft1|0-0|0|
Bulk trash fire|220|ft1|0-0|0|
Bale of straw fire|250|ft1|0-0|0|
Tractor fire|600|ft1|0-0|0|
Burning callbox|240|ft1|0-0|0|
Tree on the road|310|any1,ft1|0-0|0|
Burning truck|980|ft2|0-0|0|
Little field fire|1000|ft2|0-0|0|
Little wildfire|1010|ft1|0-0|0|
Caravan fire|1100|ft2|0-0|0|
Mailbox on fire|340|ft1|0-0|0|
Brush pile|700|ft1|0-0|0|
Burning trailer|650|ft1|0-0|0|
Basement fire|2500|bc1,ft3|0-2|0|
Chimney fire|2400|pt1,bc1,ft1|0-0|0|
Roof fire|2700|pt1,bc1,ft3|0-0|0|
Grease fire|1200|ft1|0-0|0|
Burning bus shelter|900|ft1|0-0|0|
Road accident|1000|ft1|0-1|0|
Garage fire|1400|ft2|0-0|0|
Gas leak|400|any1,ft1|0-0|0|
Fireplace fire|1310|pt1,bc1,ft1|0-0|0|
Harvester fire|1200|ft2|0-0|0|
Wastebin fire|110|ft1|0-0|0|
Alcoholic intoxication|0||1-1|0|
Nosebleed|0||1-1|0|
Chest pains|0||1-1|0|
Acute asthma|0||1-1|0|
Seizure|0||1-1|0|
Fever|0||1-1|0|
Fallen person|0||1-1|0|
Major fire|10210|pt2,bc2,mc1,ma1,wt1,hr2,ft10|0-0|0|
Manhole fire|210|bc1,ft2|0-0|0|
Diabetic problems|0||1-1|0|
Burning machine|2470|bc1,ma1,wt1,hr1,ft3|0-0|0|
Burning locomotive|1800|bc1,ma1,wt1,hr1,ft4|0-1|0|
Gas station fire|3920|pt1,bc1,mc1,ma1,hz1,hr2,ft4|0-0|0|
Dangerous goods truck accident|2200|bc1,hz1,hr1,ft3|0-1|0|
Shoplifting|100|pc1|0-0|1|
Parked car accident|120|pc1|0-0|0|
Metal burglary|150|pc1|0-0|1|
Pickpocketing|150|pc1|0-0|1|
Fare dodger|120|pc1|0-0|0|
Brawl|700|pc3|0-3|2|
Rioter|500|pc2|0-0|1|
Unannounced demonstration|10020|pc7|0-0|0|0/0/7
Pile-up|10010|bc2,hz2,hr5,ft10|10-12|0|12/6/0
Person check|100|pc1|0-0|1|
Obstruction of traffic|80|pc1|0-0|0|
Theft of property from vehicles|150|pc1|0-0|0|
Tree on bikeway|310|any1,ft1|0-0|0|
Burning substation|1900|bc1,ft2|0-0|0|
Burning substation (large)|2000|bc1,ft2,pc1|0-0|0|
Person under tree|1000|any1,ft1|1-1|0|
Traffic accident - ice|1410|hr1,ft1|0-3|0|3/1/0
MVA rollover|3000|pt1,bc1,hr1,ft3,pc2|0-4|0|
Industrial fire (large)|5300|pt2,bc2,mc1,hz1,ft5|0-4|0|
Partial building collapse|7300|pt2,bc2,hr2,ft2|0-2|0|
Trench rescue|2500|bc1,hr2,ft3,pc1|0-4|0|
Officer down|1500|pc6|1-1|0|
Concert|9600|am1,ft2,pc7|0-0|0|
Soccer game|4800|am2,ft1,pc3|0-0|0|
Baseball game|6600|am2,ft1,pc2|0-0|0|
Prisoner escape|4000|k91,ph1,pc10|0-0|1|
Fleeing suspect on foot|3000|ph1,pc5|0-0|1|
Missing person search|4500|bc1,ph1,ft2,pc5|0-1|0|
Warrant standby|2000|ph1,pc3|0-0|1|
Large unknown tanker spill|5300|bc2,mc1,hz2,hr2,ft4,pc3|0-0|0|
Commercial fire|4000|pt2,bc2,mc1,hr2,ft6,pc2|0-4|0|
Animal attack|300|pc1|1-1|0|
Unknown tanker spill|4300|bc2,mc1,hz1,hr2,ft4,pc3|0-0|0|
High rise apartment fire|4000|pt2,bc2,mc1,ma2,wt1,hr1,ft5|4-7|0|
Domestic dispute|300|pc2|0-0|0|
Hostage taken|2000|pc4|1-2|0|
Active shooter|2800|ph1,pc4|1-10|0|
High-risk warrant|1400|sw1,pc1|0-0|0|
Drug warrant|1000|sw1,pc1|0-0|0|
Anaphylaxis|0||1-1|0|
Noise complaint|400|pc1|0-0|0|
Residential fire|1750|pt1,bc1,ft3,pc2|0-4|0|
Stabbing|1500|pc5|1-6|0|
Bomb explosion|14000|pt2,bc2,mc1,ph1,hr2,ft6,pc14|0-0|0|14/0/14
Smoke in cabin|1200|arff1,ft2|0-0|0|
Braking overheat|900|arff1,bc1,ft2|0-0|0|
Aircraft engine fire|1200|arff2,bc1,ft2|0-0|0|2/0/0
Large aircraft crash|6000|arff4,bc2,ft4,pc5|5-25|0|10/0/4
Food poisoning|0||1-1|0|
Aircraft hijack|5000|bc1,pc10|1-10|0|2/0/10
Carbon monoxide alarm|100|ft1|0-0|0|1/0/0
Bank robbery|1600|pc6|0-0|0|0/0/8
Shooting|1750|pc7|1-6|0|0/0/5
Vehicle accident - entrapment|1500|bc1,hr2,ft2,pc2|0-0|0|6/0/2
Drug overdose|400|pc1|1-1|0|0/0/1
Office building fire|7000|pt4,bc2,mc1,ma1,wt1,hr2,ft10,pc3|0-0|0|15/0/3
Aggressive passenger|600|pc1|0-0|1|0/0/1
Powerline down|400|ft1|0-0|0|1/0/0
Parole violation|400|pc1|0-0|1|0/0/1
Allergic reaction|0||1-1|0|
Stolen credit card|400|pc1|0-0|1|0/0/1
Search of a vehicle|1000|k91,pc2|0-0|0|0/0/6
Small violent protest|2200|k91,pc4|0-0|2|0/0/6
Medium violent protest|3000|k91,ph1,pc7|0-0|4|0/0/7
Drug deal|1500|k91,pc4|0-0|2|0/0/6
Smoke investigation|700|pt1,bc1,ft1|0-0|0|2/0/0
Drug lab fire|3000|pt2,bc2,hz2,ft4,pc4|1-10|5|11/0/4
Gas station robbery|1250|ph1,pc4|0-0|3|0/0/8
Elevator rescue (office building)|400|any1,ft1|0-0|0|1/0/0
Warehouse fire|10000|pt4,bc2,mc1,ma4,wt3,hr4,ft10,pc2|0-0|0|20/0/5
Assassination threat|4400|pc5|0-0|0|0/0/8
Truck in house wall|4400|hr1,ft3|0-0|0|4/0/0
Burning garbage truck|600|ft2|0-0|0|2/0/0
Child birth|0||1-1|0|
Keys locked in vehicle|300|pc1|0-0|0|0/0/1
Stuck climber|650|pt1,hr1,ft1|1-1|0|4/0/0
Smoke detector check|400|ft1|0-0|0|8/0/0
Freight train derailment|10000|pt4,bc2,mc1,ma2,hz2,hr4,ft10,pc2|0-0|0|15/0/3
Barn fire|1800|pt1,bc1,ma1,wt1,ft6|0-0|0|7/0/0
Chlorine leak|3500|bc1,mc1,hz1,hr1,ft3|0-0|0|12/0/0
Fire in hospital|6000|pt3,bc2,mc1,ma1,wt1,hr2,ft10|0-0|0|10/0/0
Turbulence injury|0||1-4|0|
Accident involving a bus|1000|hr1,ft2|0-0|0|3/0/0
Serious accident involving a bus|2000|pt1,bc1,hr2,ft4,pc2|0-0|0|5/0/2
Lost child|700|pc3|1-1|0|0/0/2
DUI checkpoint|3600|pc6|0-0|0|0/0/6
Light aircraft crash (airfield)|2500|arff2,ft1|0-0|0|4/0/0
Light aircraft crash|4000|bc1,hz1,wt1,hr1,ft4|0-0|0|13/0/0
Cable theft|550|k91,pc3|0-0|2|0/0/6
Drowning|1250|bt1,bc1,hr1,ft1|1-2|0|9/0/0
Car in river|1400|bt1,bc1,hr1,ft2|1-2|0|7/0/0
Car in lake|1400|bt1,bc1,hr1,ft2|1-2|0|7/0/0
Small flooding|550|ft2|0-0|0|9/0/0
Medium flooding|1550|bt1,bc1,ft4|0-0|0|9/0/0
Large flooding|2500|bt2,bc2,hr1,ft6|0-0|0|9/0/0
Giant flooding|4000|bt2,bc2,mc1,hr2,ft8,pc3|0-0|0|14/0/3
Light aircraft crash in water|4000|bt1,bc1,hz1,hr1,ft4|0-0|0|11/0/0
Bridge collapse|7000|bt2,pt1,bc2,mc1,ma1,hr2,ft5,pc2|0-0|0|13/0/2
Stroke symptoms|0||1-1|0|
Unconscious person|0||1-1|0|
Hemorrhage|0||1-1|0|
Burst water main|1200|bc1,hr2,ft3,pc1|0-0|0|10/0/1
Shots fired at officer|4100|k92,ph1,pc8|1-2|0|0/0/10
School fire|6000|pt1,bc1,mc1,ma1,wt1,hr1,ft5|0-0|0|13/0/0
Cafeteria fire|1300|bc1,ft3|0-0|0|6/0/0
Fire in fast food restaurant|1850|pt1,bc1,ma1,ft5|0-0|0|6/0/0
Container ship fire|10000|pt1,bc1,mc1,ma2,hz1,fb1,bt1,hr1,ft4|0-0|0|13/0/0
Dock crane fire|6000|pt1,bc1,fb1,ft3|0-0|0|6/0/0
Recycling centre fire|10000|pt2,bc2,mc1,ma1,wt3,hr3,ft12,pc2|0-0|0|20/0/2
Kidnapping|2000|k91,ph1,pc4|0-0|0|0/0/7
Cruise ship sinking|15000|bt2,bc2,mc1,fb1,bt1,hr2,ft7|0-0|0|13/0/0
Sinking boat|1500|bt2,bc1,hr2,ft2|0-0|0|8/0/0
Traffic accident with train|3000|bc1,hr2,ft3,pc2|0-0|0|10/0/2
Animal rescue from roof|900|hr1,ft1|0-0|0|6/0/0
Single vehicle fire in tunnel|1500|bc1,ft3|0-4|0|6/0/0
Kitchen fire|1000|ft2|0-0|0|2/0/0
Small boat fire|1250|bt1,bc1,ft3|0-0|0|6/0/0
Person with a weapon|2500|k91,pc4|0-0|1|0/0/8
VIP appearance|4000|k92,ph1,pc6|0-0|0|0/0/15
Large field fire|3000|bc1,wt1,ft5|0-0|0|10/0/0
Natural gas odor|400|ft1|0-0|0|1/0/0
Ammonia leak|5000|bc1,mc1,ma1,hz1,hr1,ft4,pc3|0-10|0|13/0/2
Multiple vehicle fire in tunnel|5000|bc1,mc1,ma1,wt1,hr1,ft6|0-8|0|8/0/0
Transformer fire|800|ft2|0-0|0|2/0/0
Caller hangup|600|pc1|0-0|0|0/0/1
Power plant fire|14500|pt3,bc4,mc1,ma2,hz1,wt2,hr4,ft8,pc4|0-10|0|25/0/2
Factory fire minor|2000|bc2,ft4|0-3|0|8/0/0
Factory fire major|9000|pt2,bc4,mc1,ma1,wt1,hr2,ft8,pc2|0-7|0|15/0/2
Multiple vehicles on fire|3500|bc1,wt1,ft5|0-0|0|7/0/0
Fire on farm medium|6000|pt1,bc1,mc1,wt2,ft8|0-0|0|13/0/0
Fire on farm large|11000|pt2,bc2,mc1,wt3,ft10|0-0|0|16/0/0
Scrapyard fire|5000|pt2,bc2,mc1,wt2,hr2,ft6,pc2|0-0|0|15/0/2
Animal rescue from drain|275|ft1|0-0|0|1/0/0
Home invasion|1250|k91,ph1,pc4|0-0|2|0/0/9
Museum fire|7500|pt2,bc2,mc1,ma2,wt1,hr4,ft6,pc2|0-0|0|13/0/2
Cardiac arrest|0||1-1|0|
Respiratory arrest|0||1-1|0|
Difficulty breathing|0||1-1|0|
Back pain|0||1-1|0|
Police vehicle pursuit|1000|k91,ph1,pc4|0-0|2|0/0/7
Landing gear failure|2000|arff2,ft2|0-0|0|11/0/0
Airport terminal collapse (small)|5000|bc2,mc1,hr1,ft4|0-10|0|13/0/0
Airport terminal collapse (large)|7000|pt1,bc4,mc1,hr4,ft8,pc2|0-20|0|20/0/2
Airport terminal collapse (major)|11000|pt2,bc6,mc1,hr6,ft12,pc6|0-40|0|30/0/3
Hazmat truck fire in tunnel|6500|bc1,ma1,hz1,wt1,hr1,ft5,pc4|0-10|0|13/0/2
Hazmat truck fire|4000|bc1,hz1,wt1,hr1,ft5,pc2|0-4|0|11/0/2
Full building collapse|10000|pt2,bc4,mc1,hr4,ft6,pc2|0-10|0|14/0/2
Person hit by train|3000|bc2,hr1,ft4,pc2|1-1|0|8/0/2
Electrical fire on subway tracks|1200|bc1,ft3|0-0|0|6/0/0
ALPR checkpoint|4000|pc4|0-0|0|0/0/2
Bulk hazardous storage tank leak (small)|4000|bc1,hz1,hr1,ft2,pc1|0-5|0|11/0/1
Bulk hazardous storage tank leak (large)|6000|bc2,ma1,hz1,hr1,ft4,pc2|0-10|0|11/0/2
Fire in subway station|3000|bc2,ma1,wt1,hr1,ft4,pc2|0-4|0|10/0/5
Fire in subway station (large)|7000|bc2,mc1,ma2,hz1,wt1,hr2,ft8,pc4|0-10|0|13/0/5
Truck rear-ended with entrapment|1250|hr1,ft3,pc1|0-2|0|6/0/1
Attempted homicide|1000|k91,pc6|1-1|1|0/0/9
Fare dodger|120|pc1|0-0|0|0/0/1
Medical emergency on crane|950|bc1,hr2,ft1|1-1|0|8/0/0
Patient transfer|0||1-1|0|
Possible infectious outbreak|0||1-1|0|
Mental health concern|200|pc1|1-1|0|0/0/1
Car workshop fire|6000|pt2,bc2,mc1,ma1,hz1,wt1,hr1,ft8,pc2|0-4|0|14/0/2
Car workshop fire with explosion|10000|pt2,bc2,mc1,ma1,hz1,wt1,hr4,ft8,pc4|0-12|0|18/0/4
Patient transfer from flight|0||1-1|0|
Hotel fire small|3000|ft4|0-6|0|4/0/0
Hotel fire medium|5000|pt1,bc1,ft6|0-10|0|6/0/0
Hotel fire large|8000|pt1,bc2,ma1,wt1,hr1,ft8,pc3|0-20|0|10/0/3
Hotel fire major|12000|pt2,bc4,mc1,ma1,wt1,hr2,ft14,pc6|0-50|0|20/0/6
Small supermarket fire|1500|bc1,ft4|0-2|0|5/0/0
Big supermarket fire|3000|pt1,bc2,ma1,wt1,hr1,ft6,pc1|0-6|0|8/0/2
Bar fight|1000|pc4|0-2|3|0/0/3
Damaged roof|450|pt1,ft1|0-0|0|3/0/0
Unsafe cladding|450|pt1,ft1|0-0|0|3/0/0
Unsafe scaffolding|450|pt1,ft1|0-0|0|3/0/0
Sports hall fire|2000|pt1,bc1,ma1,ft5|0-4|0|9/2/0
Landfill fire|3500|pt1,bc1,wt1,ft5|0-0|0|8/0/0
Arm caught in industrial machine|800|hr1,ft1|1-1|0|4/1/0
Person trapped under machine|1100|hr2,ft2|1-1|0|4/1/0
Transient ischemic attack|0||1-1|0|0/1/0
Vehicle fire in parking garage|1000|ft2|0-0|0|2/0/0
Large parking garage fire|6000|pt1,bc2,ma1,hz1,wt1,hr2,ft8,pc2|0-6|0|12/4/2
Museum robbery|1000|k91,pc4|0-0|3|0/0/9
Natural gas explosion|5000|bc1,hr2,ft4|0-10|0|13/7/0
Large natural gas explosion|10000|pt1,bc4,mc1,hz1,hr4,ft8,pc2|0-20|0|13/15/3
Swimmer in distress (river)|900|bt1,ft1|1-1|0|3/1/0
Swimmer in distress|900|bt1,ft1|1-1|0|3/1/0
Unknown structure fire|110|ft1|0-0|0|1/0/0
Electrical cupboard fire|300|ft1|0-0|0|2/0/0
Smoking electrical equipment|300|ft1|0-0|0|1/0/0
Storage cupboard fire|300|ft1|0-0|0|2/0/0
Illegal goods smuggling|800|k91,pc3|0-0|1|0/0/7
Stowaways found|2000|k91,ft1,pc8|1-10|4|1/5/7
Customs search operation|1600|k91,pc4|0-0|0|0/0/7
Heatstroke|0||1-1|0|0/1/0
Acid burns|750|ft1,pc3|1-1|0|1/1/2
Hit and run|500|pc1|0-1|0|0/1/2
Ceiling collapse|2000|bc1,hr1,ft4|0-6|0|6/4/0
Electrocution|0||1-1|0|0/1/0
Large brawl|2500|k91,pc8|0-10|6|0/7/6
Pepper spray discharged on train|1500|bc1,hz1,ft2,pc6|0-6|1|11/5/5
Passenger train derailment (small)|8000|bc1,hr2,ft6,pc2|0-20|0|10/15/2
Passenger train derailment (large)|11000|bc2,hz1,hr4,ft10,pc4|0-50|0|15/25/4
Passenger train derailment (major)|14000|pt1,bc6,mc1,hz2,hr6,ft14,pc12|0-60|0|30/40/10
Bus in river|4000|bt1,bc1,hr1,ft4,pc2|1-20|0|6/6/1
Chemistry accident at school|900|hz1,ft1|0-2|0|11/1/0
Bus on fire|2000|bc1,ft3|0-12|0|6/6/0
Subway collapse|12000|pt2,bc4,mc1,hr6,ft8,pc2|0-30|0|15/15/1
Subway train on fire|5000|bc1,ma1,hz1,wt1,ft5,pc2|0-5|0|11/3/1
Damaged tank car|950|bc1,hz1,hr1,ft4|0-0|0|11/0/0
Tanker ship on fire|15000|pt2,bc2,mc1,ma2,hz3,fb3,bt1,hr2,ft8,pc3|0-15|0|20/10/2
Car vs tree|900|ft1,pc1|0-2|0|1/1/1
Car vs tree (entrapment)|900|hr1,ft1,pc1|0-2|0|4/1/1
Protestors on runway|1200|ft1,pc6|0-7|0|1/3/4
Sick person|0||1-1|0|0/1/0
Panic button activation|1500|sw2,pc1|1-1|2|0/1/6
Restraining order violation|300|pc2|0-0|1|0/0/1
Vehicle crash - property damage|400|pc1|0-0|1|0/0/1
Child locked in vehicle|1000|ft1,pc1|1-1|1|1/1/1
Residential burglar alarm triggered|600|pc3|0-0|2|0/0/2
Animal on the tracks|200|pc1|0-0|0|0/0/1
Cooking fire|650|ft1|0-0|0|1/0/0
Propane depot explosion|8000|pt1,bc2,mc1,ma1,hz1,wt1,hr1,ft8,pc3|1-4|0|15/2/2
Choking|0||1-1|0|0/1/0
Injured person on high voltage mast|650|pt1,hr1,ft1|1-1|0|4/1/0
Large ferry fire|9000|pt1,bc2,mc1,ma1,fb2,hr2,ft7|5-12|0|13/8/0
Residential police raid|750|pc4|0-0|3|0/0/4
Straw bale stack on fire|1500|bc1,wt1,ft5|0-0|0|8/0/0
Injured free runner|400|ft1|1-1|0|4/1/0
Cruise ship fire|9000|pt1,bc2,mc1,ma1,hz1,fb2,hr2,ft7|0-12|0|13/6/0
Vehicle lost its load|700|ft1,pc2|0-0|0|1/0/1
Medium wildfire|4000|br4,bc1,wt2|0-0|0|8/0/0
Large wildfire|6500|br6,bc2,wt4|0-0|0|10/0/0
Medium controlled burn|1300|br2|0-2|0|3/0/0
Large controlled burn|1800|br3,bc1|0-0|0|6/0/0
Firebreak clearing|600|br2|0-0|0|2/0/0
Lightning strike in forest|700|br2|0-0|0|2/0/0
Major wildfire|10000|br8,bc3,mc1,wt8,pc2|0-0|0|14/0/2
Plane off the runway|3000|arff2,pt1,bc1,am2,ft2|10-20|0|8/1/0
Off-road rescue|3000|br1,ft1|0-2|0|5/1/0
SCUBA injury|600||1-1|0|0/3/0
Boat leaking fuel|1000|hz1,fb1,ft2|0-0|0|8/0/0
Small earthquake|500|ft2|0-0|0|2/0/0
Large earthquake|2100|pt1,bc2,ma1,hr2,ft5|2-10|0|10/3/0
Medium earthquake|1200|bc1,ma1,hr1,ft2|0-5|0|6/1/0
Major earthquake|3200|pt2,bc4,ma2,hr5,ft10,pc1|10-30|0|15/5/0
Trespasser on tracks|900|pc3|0-0|2|0/0/7
Small forest fire|2000|br3,bc1,wt1|0-0|0|9/0/0
Cliff collapse on highway|7000|bc4,mc1,hr4,ft8,pc5|0-0|0|10/2/3
Cabin fire|3000|br1,bc1,wt1,ft4|0-6|0|9/4/0
Campsite fire|3000|br1,bc1,wt1,ft4|0-2|0|9/2/0
Medium forest fire|5500|br5,bc2,wt2|0-0|0|11/0/0
Large forest fire|8000|br8,bc5,mc1,wt3|0-0|0|15/0/0
Major forest fire|11000|br10,bc7,mc2,wt4,pc4|0-0|0|18/0/3
Fire watch|1600|br2|0-0|0|2/0/0
Burning bus terminal|2000|bc1,ft3|0-12|0|6/6/0
Traffic light failure|250|pc1|0-0|0|0/0/1
Train station fire (small)|4000|bc1,hr1,ft6,pc2|0-6|0|8/5/2
Train station fire (medium)|6000|pt1,bc2,ma1,hr2,ft8,pc4|0-12|0|12/8/4
Sunstroke|250||1-1|0|0/2/0
Heat cramp|250||1-1|0|0/4/0
Dehydrated person|250||1-1|0|0/3/0
Barbecue fire|600|ft1|0-0|0|1/0/0
Pier on fire|5000|pt1,bc1,bt1,hr1,ft4|0-0|0|7/0/0
Panic attack|0||1-1|0|0/1/0
Community engagement|1000|am1,ft1,pc1|0-0|0|1/1/1
Train station fire (large)|10000|pt2,bc3,mc1,ma1,hz1,wt1,hr3,ft10,pc8|0-15|0|15/13/6
Construction vehicle accident|950|bc1,hr2,ft3|1-1|0|9/1/0
Medical emergency on ship|700|pt1,ft1|1-1|0|3/1/0
Security check|650|k91,pc3|0-0|2|0/0/7
Car vs powerline|1000|hr1,ft2,pc2|0-3|0|4/2/2
Subway train derailment|4000|bc2,hr2,ft4,pc2|0-15|0|10/7/1
Electrocution from third rail|400|ft2|1-1|0|2/1/0
Small wildfire|2000|br2,wt1|0-0|0|3/0/0
Small controlled burn|800|br1|0-0|0|2/0/0
Restaurant fire|5000|pt1,bc1,ma1,wt1,hr1,ft4,pc2|0-5|0|10/3/1
Overturned tanker truck|3500|bc1,mc1,hz1,hr1,ft4,pc2|0-1|0|13/2/2
Concussion|0||1-1|0|0/1/0
Reported fraud|300|pc1|0-0|1|0/0/1
Serve court order|150|pc1|0-0|0|0/0/3
Serve eviction notice|150|pc1|0-0|0|0/0/3
Eviction standby|900|pc1|0-0|0|0/0/7
Office investigation|500|fd1|0-0|0|0/0/0
Office used for crypto attacks|1600|fd3,iv1,pc2|0-0|2|0/0/0
Office embedded in corruption|1900|fd3,iv1,pc3|0-0|5|0/0/0
Cyber-criminal organization hideout|3600|bo1,fd5,dn1,pc5|0-0|8|0/0/0
Restaurant investigation|500|fd1,iv1|0-0|0|0/0/0
Money laundering inside restaurant|1700|fd3,iv1,pc2|0-0|3|0/0/0
Criminal organization meeting|3700|bo1,fd5,dn1,pc6|0-0|10|0/0/0
Notebook stolen from school|150|pc1|0-0|1|0/0/1
Burglary in basement|400|pc1|0-0|0|0/0/1
Property damaged|200|pc1|0-0|1|0/0/1
Disturbance of peace|250|pc1|0-0|1|0/0/1
Motorcycle accident|600|ft1,pc1|1-1|0|1/0/1
Drunk driving|150|pc1|0-0|0|0/0/1
Breakdown of vehicle|100|pc1|0-0|0|0/0/1
Robbery|1200|pc3|0-0|3|0/0/6
Domestic violence|750|pc2|1-1|1|0/0/2
Bicycle stolen|150|pc1|0-0|0|0/0/1
Safeguarding of musical parade|2000|pc2|0-0|0|0/0/2
Horse riding accident with vehicle|1200|pc1|1-4|0|0/3/3
Traffic surveillance|2500|pc2|0-0|0|0/0/3
Petrol fraud|300|pc1|0-0|1|0/0/2
Illegal gun withdrawal|1700|fd4,pc4|0-0|1|0/0/3
Silent alarm triggered inside bank|500|pc2|0-0|0|0/0/2
Warrant enforcement|550|pc2|0-0|1|0/0/3
Wrong-way driver|1000|pc4|0-0|0|0/0/4
Hunter accidentally injured trespasser|200|pc1|1-1|0|1/1/1
Mass panic in discotheque|3500|pc9|0-17|2|0/10/9
Abandoned luggage|150|pc1|0-0|0|0/0/1
Small wildfire cleanup|700|br2|0-0|0|0/0/0
Medium wildfire cleanup|2000|br4,ft1|0-0|0|1/0/0
Large wildfire cleanup|4500|br7,bc1,ft2|0-0|0|6/0/0
Major wildfire cleanup|9500|br10,bc2,mc1,ft4|0-0|0|12/0/0
Carpentry workshop fire|4200|pt2,bc4,mc1,ma1,wt1,ft10,pc2|0-3|0|13/2/2
Person stuck on playground equipment|500|ft1|1-1|0|1/1/0
Train station collapse (small)|4000|bc1,hr2,ft4|0-5|0|8/5/0
Train station collapse (medium)|6000|bc2,hr4,ft6,pc2|0-10|0|12/8/2
Train station collapse (large)|9800|pt1,bc4,mc1,hr6,ft8,pc4|0-15|0|15/13/3
Train station collapse (major)|15000|pt1,bc6,mc2,hr8,ft12,pc6|0-20|0|20/18/5
Accident with chainsaw|400||1-1|0|0/1/0
Burning freight car|1500|bc1,ft5|0-0|0|6/0/0
Speed radar|2000|pc2|0-0|0|0/0/2
Bird strike|1500|arff2,ft1|0-0|0|7/0/0
Possible cannabis farm|1000|ph1,pc1|0-0|0|0/0/1
Suspicious package found|800|k91,pc2|0-0|0|0/0/6
Suspicious person|300|pc1|0-0|1|0/0/1
Arrhythmia|0||1-1|0|0/1/0
Street market patrol|1500|pc1|0-0|0|0/0/1
Object stuck in person|0||1-1|0|0/1/0
Counterfeit goods raid|1200|pc4|0-0|3|0/0/4
Debris on runway|350|ft1|0-0|0|1/0/0
Landslide|1500|bc1,hr2,ft4|0-5|0|8/4/0
Crushed person|600|hr1,ft1|1-1|0|4/1/0
Biker fell off mountain road|0||1-1|0|0/1/0
Major road block|6000|pc5|0-0|0|0/0/5
Apartment fire in high rise|2000|pt1,bc1,ma1,ft3|0-6|0|8/6/0
Transporter fell on side|800|pt1,bc1,ft1|1-2|0|6/2/0
Illegal internet activity|500|fd1|0-0|1|0/0/0
Chlorine exposure|2500|hz1,ft1|1-2|0|11/2/0
Containment breach at lab|7500|bc2,mc1,ma1,hz1,ft5,pc2|2-5|0|13/5/2
Agricultural chemical leak|3500|bc1,hz1,ft2|1-1|0|11/1/0
Container leaking unknown substance|1500|hz1,ft1|0-0|0|11/0/0
Aircraft leaking fuel|1500|arff1,bc1,hz1,ft1|0-0|0|11/0/0
Radioactive exposure|2500|bc1,hz1,ft2|1-2|0|11/2/0
Fuel spill in waterway (river)|3000|bc1,hz1,ft3|0-0|0|11/0/0
Fuel spill in waterway (lake)|3000|bt1,bc1,hz1,ft3|0-0|0|11/2/0
Cat stuck in tree|450|pt1,ft1|0-0|0|3/0/0
Jewelry store robbery|800|pc2|0-0|0|0/0/2
Glass shard embedded in hand|0||1-1|0|0/1/0
Observation of a suspect|6000|pc2|0-0|1|0/0/2
Welfare check|900|pc1|1-1|0|0/1/1
Spinal injury|0||1-1|0|0/2/0
Bomb explosion at chemical plant|35000|pt10,bc10,mc2,ma4,hz4,wt6,hr12,ft25,pc12|30-80|0|25/20/8
Chemical in water|1200|bt1,bc1,hz1,hr1,ft1|0-0|0|11/0/0
Injured person on scaffolding|700|pt1,hr1,ft2|1-1|0|1/1/0
Investigate area for fire|500|br1,fi2|0-0|0|0/0/0
Person started brushfire (small)|600|br1,fi1,ft1,pc1|0-0|0|1/0/1
Person started brushfire (large)|1200|br2,fi3,ft2,pc2|0-0|3|2/0/2
Illegal hunting|500|gw1|0-0|3|0/0/2
Illegal fishing|500|gw1|0-0|2|0/0/2
Animal smuggling|500|gw2,k91|0-0|1|0/0/4
Plant smuggling|500|gw2,k91|0-0|1|0/0/4
Short children excursion|500|gw1|0-0|0|0/0/1
Long children excursion|1200|gw2|0-0|0|0/0/2
Wilderness first aid|500|gw1|1-1|0|0/1/1
Illegal immigration by water|1500|pb2,pc6|3-6|5|0/0/2
Suspicious boat|500|pb1|0-0|0|0/0/1
Drug smuggling by water|1500|fd3,k91,pb2|0-0|0|0/0/4
Weapon smuggling by water|1500|fd3,k91,pb2|0-0|0|0/0/4
Fighting on yacht|900|pb2,pc6|1-1|1|0/1/0
Underwater investigation|700|pb1|0-0|0|0/0/1
Underwater weapon stash|1500|fd3,pb2|0-0|0|0/0/0
Underwater drug stash|1500|fd3,pb2|0-0|0|0/0/0
Undefused naval mine|1800|fd3,bo1,pb2|0-0|0|0/0/0
Undefused air bomb|1800|fd3,bo1,pb2|0-0|0|0/0/0
Office used for drug marketing|2500|fd4,pc2|0-0|2|0/0/2
Possible drug lab|1500|fd2,pc2|0-0|2|0/0/2
Hidden branch of drug cartel|4500|fd7,pc5|0-6|12|0/0/3
Office used for black market firearms|2500|fd4,pc2|0-0|2|0/0/2
Branch of firearms black market|4500|fd5,pc5|0-6|12|0/0/3
Person hit by a jet ski|1200|bt1|1-1|0|5/1/2
Falling light pole|2500|bc1,hr1,ft2|0-6|0|7/3/0
Biker fallen on country road|0||1-1|0|0/1/0
Large STOP operation|6000|pc5|0-0|0|0/0/5
Skyscraper fire|7500|pt2,bc2,mc1,ma1,wt1,ft8,pc3|0-20|0|10/6/5
Illegal tapping of electricity|500|pc1|0-0|1|0/0/1
Motocross accident|0||1-3|0|0/3/0
Flat fire in sheltered housing|3500|bc2,ft4|1-1|0|8/1/0
Car off bridge|1500|pt1,ft4,pc2|1-4|0|3/1/2
Powerline struck by lightning|250|pt1,ft2|0-4|0|4/1/0
Tornado touchdown in rural area|2500|ft4,pc4|0-10|0|4/6/4
Tornado touchdown in urban area|10000|bc2,k92,hr4,ft12,pc8|5-65|0|9/25/6
Storm cleanup (large)|4500|pt2,bc2,ft10,pc4|0-10|0|8/5/4
Storm cleanup (major)|8000|pt4,bc4,ma1,hr2,ft14,pc6|0-20|0|10/15/5
Flood evacuation|3600|bt2,hr2,ft6,pc2|0-30|0|5/20/2
Search and rescue|4800|hr1,ft6,pc2|0-10|0|5/8/2
Blown over semi truck|1250|hz1,ft4,pc2|1-6|0|11/1/2
Lightning strikes house|450|ft2|0-0|0|4/0/0
Tornado watch|4400|ft6,pc4|0-0|0|5/0/4
Porta potty tip over|1200|hz1,hr1,ft1,pc1|0-1|0|11/1/1
Safeguarding a swimming competition|2400|am2|0-0|0|0/2/0
Contaminated ice cream cart|250|pc1|1-4|0|0/2/1
Illegal bonfire in park|600|ft1,pc1|0-0|1|1/0/1
Intoxicated passenger|400|pc1|0-0|1|0/0/1
Inflatable swept out to sea|1200|bt1|1-1|0|0/1/0
Fire in storage room|850|ft3|0-0|0|3/0/0
Illegal street racing|2400|pc4|1-3|0|0/0/3
Suspicious person at fire site|2000|fi2,pc2|0-0|1|0/0/2
Accelerants found near fire source|2300|fi2,hz1,pc2|0-0|0|0/0/2
Possible insurance fraud|2500|fi3,pc2|0-0|1|0/0/2
Securing evidence after fire|2000|fi2,pc2|0-0|0|0/0/2
Destruction of public property|3200|fi4,pc3|0-0|4|0/0/3
Destruction of private property|2500|fi3,pc2|0-0|2|0/0/2
Explosion at an ATM|5000|bo2,ft2,pc5|0-2|2|5/4/8
Serious injuries caused by glass|600|ft1|1-1|0|1/1/0
Armed vehicle pursuit|2000|ph1,pc3|0-3|4|0/0/8
Fall from small scaffolding|3500|pt1,bc1,hr1,ft2,pc2|0-4|0|6/4/4
Fall from large scaffolding|7000|pt2,bc1,hr3,ft4,pc3|0-10|0|12/8/8
Road cleanup|1000|hr1,ft1,pc1|0-0|0|4/0/1
Fire at construction site|3000|pt3,bc1,hr3,ft7|3-7|0|6/4/0
Semi hanging off bridge|2800|pt1,bc1,hr3,ft4,pc2|1-2|0|6/2/2
Blocked fire exit complaint|1000|fi1|0-0|0|0/0/0
Boat crash|1600|pb1|0-2|0|0/2/1
Person slipped on wet leaves|0||1-1|0|0/1/0
Road accident caused by fallen leaves|1000|hr1,ft1,pc2|1-3|0|4/3/2
Person fell in pile of leaves|0||1-1|0|0/1/0
Leaf vacuum out of control|400|pc1|1-1|0|0/1/1
Storm drain clogged with leaves|300|any1,ft1|0-0|0|1/0/0
Hypothermia after swimming in cold water|0||1-1|0|0/1/0
Accident on foggy road|800|hr1,ft2|0-2|0|4/2/0
Deer crossing accident|1000|hr1,ft2,pc1|0-1|0|4/2/1
Burning pile of leaves|320|ft2|0-0|0|2/0/0
Flooded tunnel (small)|2400|bc1,wt1,ft2,pc2|0-1|0|6/1/2
Flooded tunnel (large)|4500|bc2,wt2,ft6,pc4|0-4|0|6/4/4
Twisted ankle|700|am1|1-1|0|0/1/0
Office robbery|1500|pc2|0-0|1|0/0/2
Auto theft|1600|pc3|0-0|2|0/0/2
Burning wind turbine|2100|pt1,ft3,pc2|0-0|0|3/0/2
Aircraft emergency landing on roadway|2000|bc1,hr1,ft3,pc2|1-4|0|6/2/2
Airport terminal fire (small)|5500|pt2,bc1,hr1,any4,ft1,pc2|2-5|0|6/3/2
Airport terminal fire (medium)|7500|pt3,bc2,hr2,any4,ft6,pc4|2-10|0|10/6/3
Airport terminal fire (large)|9500|pt3,bc3,mc1,hr2,any4,ft10,pc4|10-20|0|13/10/3
Airport terminal fire (major)|14500|pt5,bc5,mc1,hz1,hr6,any4,ft14,pc5|20-30|0|13/15/3
Cargo plane fire|12000|arff5,pt6,bc6,mc1,hz2,hr4,ft12,pc5|2-2|0|13/5/4
Large cargo plane fire|15000|arff7,pt8,bc7,mc2,hz3,hr5,ft15,pc8|2-2|0|15/5/5
Building collapsed into water|12000|bt4,bc4,mc1,fi2,k92,pb2,hr6,ft8,pc6|3-30|0|15/0/8
Breakdown of public bus|500|pc1|0-0|0|0/0/1
Illegal firearms factory|3500|fd8,pc5|0-0|6|0/0/5
Illegal firearms factory (major)|7500|fd15,pc8|0-0|12|0/0/10
Firing of implanted defibrillator|0|am1|1-1|0|0/1/0
Animal stuck between walls|1300|hr1,ft1|0-0|0|4/0/0
Car jacking|3500|pc5|0-0|0|0/0/5
Cruise ship fire with explosion|18000|bo1,bt4,pt2,bc4,mc2,fd2,fi2,ma2,hz2,iv1,fb2,pb1,hr4,ft12,pc10|30-60|0|13/20/7
Cruise ship fire & explosion with hull breach|23000|bo1,bt7,pt5,bc6,mc2,fd2,fi3,ma2,hz3,iv1,fb2,pb2,hr7,ft30,pc10|40-85|0|15/30/7
Container ship fire with explosion|22000|bo1,bt3,pt3,bc4,mc2,fd2,fi2,ma2,hz2,iv1,fb2,pb1,hr3,ft12,pc6|5-25|0|13/10/7
Container ship fire & explosion with hull breach|27000|bo1,bt4,pt5,bc6,mc2,fd4,fi4,ma2,hz3,iv1,fb2,pb1,hr8,ft20,pc10|5-25|0|15/10/7
Tanker ship fire with explosion|30400|bo1,pt3,bc4,mc1,fd2,fi2,ma2,hz3,iv1,fb4,bt1,pb1,hr4,ft16,pc7|5-25|0|20/10/7
Tanker ship fire & explosion with hull breach|35400|bo1,pt5,bc4,mc2,fd4,fi4,ma2,hz3,iv1,fb4,bt2,pb1,hr5,ft24,pc11|5-35|0|25/15/7
CBRN explosion on cruise ship|40000|fd7,bo2,bt7,pt5,bc4,mc2,fi4,ma3,hz3,iv1,k92,fb3,pb2,hr5,ft22,pc21|50-100|0|25/35/10
CBRN explosion on container ship|42000|fd7,bo2,bt7,pt6,bc6,mc2,fi4,ma3,hz4,iv2,k92,fb3,pb2,hr5,ft25,pc26|5-30|0|25/10/10
CBRN explosion on tanker ship|45000|fd9,bo2,bt7,pt6,bc6,mc2,fi4,ma4,hz4,iv2,k92,fb3,pb2,hr6,ft30,pc29|5-30|0|25/10/10
Prisoner bus accident|2000|k92,ph1,pc10|1-5|5|0/0/6
Ranch fire|4500|br4,bc1,wt1,ft5|0-0|0|7/0/0
Ambulance accident|1500|hr1,ft1,pc2|4-6|0|4/2/1
Off-road vehicle collision|5000|br1,gw2,hz1,hr2,ft2|2-4|1|4/0/2
Drive by shooting|2000|ph1,pc6|1-6|4|0/4/5
Out of control argument|900|pc2|0-0|2|0/0/2
Hybrid vehicle fire|1500|ft2,pc1|0-2|0|1/1/1
Crane collapse|4250|pt3,bc3,mc1,hr2,ft7,pc3|0-13|0|15/10/3
Cargo plane fire with oil leak|15500|arff6,pt6,bc6,mc1,hz4,hr4,ft13,pc5|0-3|0|13/5/4
Large cargo plane fire with oil leak|19000|arff8,pt8,bc8,mc2,hz4,hr6,ft16,pc8|0-5|0|15/5/5
Strip mall fire (small)|6000|pt4,bc2,ma1,ft10,pc2|0-15|0|7/5/1
Strip mall fire (large)|9000|pt6,bc3,mc1,ma1,ft15,pc4|0-15|0|10/15/1
Fire truck accident|2000|ft2,pc2|7-10|0|2/4/2
Abdominal pain|500||1-1|0|0/1/0
Airplane crash in urban area|15000|arff3,pt4,bc3,mc1,ma2,hz2,hr4,ft10,pc7|10-25|0|7/10/2
Airplane crash in urban area with fire|20000|arff4,pt5,bc4,mc2,ma2,hz2,wt3,hr6,ft13,pc10|10-30|0|10/10/3
Airplane crash in urban area with explosion|22500|arff5,bo1,pt5,bc5,mc2,fd2,ma3,hz3,iv2,hr6,ft15,pc12|15-35|0|10/10/5
Medium cannabis grow operation|6000|fd1,hz1,k91,ph1,pc4|0-0|5|0/0/2
Large cannabis grow operation|10000|fd7,hz1,k92,ph1,pc15|0-0|10|0/0/4
Stolen police car|5000|ph1,pc6|0-0|1|0/0/5
Driving under the influence of narcotics|900|pc1|0-2|1|0/1/4
Mattress factory fire|10500|pt5,bc3,mc1,ma1,wt1,hr1,ft14,pc2|5-20|0|8/4/3
Refinery fire (small)|10000|pt4,bc4,mc1,fo1,ma1,hz2,wt1,hr4,ft10,pc4|5-15|2|10/5/5
Refinery fire (medium)|15000|pt5,bc4,mc1,fo2,ma1,hz3,wt2,hr5,ft12,pc6|10-20|3|12/6/6
Refinery fire (large)|22000|pt6,bc5,mc1,fd1,fo3,ma2,hz4,wt3,hr6,ft15,pc8|15-20|4|15/8/8
Refinery fire (major)|30000|pt8,bc6,mc1,fd2,fo4,ma3,hz5,wt4,iv1,hr8,ft20,pc11|20-35|5|20/10/10
Refinery explosion (major)|40000|pt10,bc7,mc2,fd4,fo5,ma5,hz6,wt5,iv1,hr10,ft30,pc14|30-50|8|25/15/15
Area evacuation|3500|pc12|0-5|0|0/2/10
Post-fire environmental damage assessment|2500|fi2,gw4,pc1|0-0|0|2/0/2
Overturned small vessel|8000|cs1,cht1|0-2|0|0/3/0
Overturned large vessel|14000|cs5,cht2|0-5|0|0/8/0
Drowning surfer|1000|cs1|1-1|0|0/1/0
Missing vessel|7000|cs2,cht1|0-5|0|0/3/0
Oil rig fire|10000|cht2,cs2,fb2|0-10|0|8/6/0
Oil rig explosion|35000|cs8,cht6,fb6|0-20|0|20/16/0
Shark attack|1000|cs2|1-1|0|0/2/0
Smuggling via boat|4000|cht3,cs2|0-0|4|0/0/2
Parasailing accident|2500|cs3,cht1|1-4|0|0/2/0
Deep water search and rescue|4000|cs2,cht2|0-3|0|0/2/0
Hostage rescue aboard cargo ship|8500|cs5,cht2|1-8|6|0/5/6
Illegal whaling vessel|8000|cs3|0-0|8|0/0/6
Multiple whaling vessels illegal operations|10000|cs9,cht2|0-0|24|0/0/14
Sailors trapped in capsized naval vessel|9000|cht1,cs2|1-4|0|0/3/0
Distressed yacht caught in hurricane|5000|cht2,cs1|1-4|0|0/3/0
Oil tanker on fire in ocean|15000|cht3,cs3,fb4|3-12|0|12/10/0
Stalker|500|pc1|0-0|1|0/0/1
Multi vehicle pile-up|3000|hr1,ft1,pc3|3-10|1|4/3/4
Multi vehicle pile-up (large)|6000|hr2,ft2,pc4|6-15|1|5/4/6
Jetbridge collapse (small)|3000|arff1,pt1,bc1,hr2,ft3|1-10|0|5/3/0
Jetbridge collapse (large)|6000|arff1,pt1,bc2,mc1,hr2,ft5|10-30|0|7/5/0
Faulty heating boiler|400|ft1|0-1|0|1/1/0
Carbon monoxide leak (small)|1100|ma1,ft4|1-6|0|5/2/0
Carbon monoxide leak (large)|4700|bc1,ma2,hz1,ft7|5-20|0|11/5/0
Carbon monoxide leak (major)|9500|pt2,bc2,mc1,ma4,hz2,ft17|20-100|0|15/10/0
Sports fan brawl (small)|3000|pc10|2-10|7|0/5/4
Sports fan brawl (medium)|6000|pc16|7-20|12|0/8/7
Sports fan brawl (large)|9500|k92,pc27|10-45|30|0/10/10
Arborist accident|500|pt1,ft1|1-1|0|1/1/0
Person pinned under tank trailer|1000|hz1,hr1,ft1|1-1|0|11/1/0
Methane leak|1000|bc1,ma1,hz1,hr1,ft3,pc2|0-1|0|3/1/1
Methane fire|4000|bc2,fo1,ma1,hz2,hr2,ft6,pc3|0-4|0|6/2/2
Methane explosion|9000|pt2,bc3,mc1,fo3,ma2,hz3,wt2,hr4,ft10,pc5|0-11|1|10/4/4
Sinkhole - no damage|750|pt1,bc1,hr1,ft2,pc2|0-0|0|6/0/1
Sinkhole - person injured|1500|pt1,bc1,hr2,ft2,pc2|5-5|0|6/2/1
Sinkhole - roadway damaged|1750|pt2,bc1,hr2,ft3,pc2|0-5|0|6/2/1
Vehicle fallen into sinkhole|2000|pt2,bc1,hr2,ft4,pc3|0-5|0|6/2/1
Sinkhole - structural damage|2750|pt3,bc2,hr3,ft4,pc3|0-5|0|6/2/1
Light aircraft crash in wildland|6500|br4,bc2,hz1,wt3,hr1,ft6,pc2|0-4|0|11/1/1
Large aircraft crash in wildland|6500|br6,bc4,mc1,hz1,wt4,hr1,ft8,pc5|10-40|0|11/10/7
Confined space rescue (small)|1500|hr1,any1,ft1|0-4|0|4/1/0
Collision with jackknifed semi|1000|pc2|0-0|0|0/0/1
Jackknifed semi (medium)|4700|pt1,bc1,hr2,ft6,pc6|0-10|0|6/3/2
Jackknifed semi (large)|14500|pt1,bc2,hr3,ft9,pc10|0-20|0|15/8/7
Jackknifed semi (major)|24000|pt2,bc3,mc1,hr4,ft11,pc17|0-30|0|18/12/10
Post-surgical complications|0||1-1|0|0/1/0
Power plant fire - major|22500|pt5,bc8,mc2,ma3,hz3,wt4,hr6,ft14,pc8|10-20|1|30/12/8
Power plant fire - explosion|37500|pt8,bc8,mc2,ma4,hz5,wt6,hr6,ft20,pc12|15-30|1|33/15/9
Power plant fire - CBRNE|45000|pt12,bc9,mc2,ma4,hz6,wt10,hr15,ft30,pc24|25-50|3|40/20/15
Library fire (small)|2250|ft2|0-5|0|1/1/0
Library fire (medium)|6500|pt1,bc1,wt1,ft5|3-10|0|7/2/0
Library fire (large)|10000|pt2,bc2,mc1,ma1,wt2,ft8,pc2|8-15|0|10/10/1
Library fire (major)|20000|pt4,bc4,mc1,fi3,ma2,wt3,ft15,pc5|15-50|0|14/20/7
Train fire with flammable products|4300|bc2,mc1,hz1,hr2,ft5,pc3|0-0|0|13/0/2
Switchboard fire|500|ft1|0-0|0|1/0/0
Campsite gas canister explosion|9800|pt2,bc1,hz2,wt2,ft5,pc3|0-25|0|14/6/5
Peaceful demonstration (small)|5000|k91,pc5|0-0|0|0/0/6
Peaceful demonstration (large)|10000|k91,pc15|0-0|0|0/0/6
Conflagration (small)|3000|pt2,bc2,hr2,ft5,pc4|0-0|0|6/0/2
Conflagration (medium)|8000|pt3,bc2,wt1,hr2,ft7,pc8|3-10|0|7/3/7
Conflagration (large)|13000|pt4,bc4,mc1,ma1,wt4,hr3,ft10,pc12|8-20|0|13/10/10
Conflagration (major)|20000|pt10,bc6,mc1,ma2,wt6,hr6,ft20,pc18|15-50|0|16/25/15
`;
