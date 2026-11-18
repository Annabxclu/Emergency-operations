// Per-mission vehicle requirements, patients, prisoners and station prerequisites,
// transcribed from https://www.missionchief.com/einsaetze.json (seasonal events skipped).
// Format: name|credits|requirements|patients min-max|prisoners max|fire/ems/police stations
export const REAL_REQUIREMENTS = `
Bin fire|110|ft1|0-0|0|1/0/0
Container fire|170|ft1|0-0|0|1/0/0
Burning car|370|ft1|0-0|0|1/0/0
Burning motorbike|340|ft1|0-0|0|1/0/0
Burning grass|200|ft1|0-0|0|1/0/0
Room fire|1400|pt1,ft2|0-1|0|2/0/0
Garden shed fire|600|ft2|0-0|0|2/0/0
Burning leaves|210|ft1|0-0|0|1/0/0
Bulk trash fire|220|ft1|0-0|0|1/0/0
Bale of straw fire|250|ft1|0-0|0|1/0/0
Tractor fire|600|ft1|0-0|0|1/0/0
Burning callbox|240|ft1|0-0|0|1/0/0
Tree on the road|310|ft2|0-0|0|1/0/0
Burning truck|980|ft2|0-0|0|2/0/0
Little field fire|1000|ft2|0-0|0|2/0/0
Little wildfire|1010|ft1|0-0|0|1/0/0
Caravan fire|1100|ft2|0-0|0|2/0/0
Mailbox on fire|340|ft1|0-0|0|1/0/0
Brush pile|700|ft1|0-0|0|1/0/0
Burning trailer|650|ft1|0-0|0|1/0/0
Basement fire|2500|bc1,ft3|0-2|0|3/0/0
Chimney fire|2400|pt1,bc1,ft1|0-0|0|3/0/0
Roof fire|2700|pt1,bc1,ft3|0-0|0|3/0/0
Grease Fire|1200|ft1|0-0|0|3/0/0
Burning bus shelter|900|ft1|0-0|0|3/0/0
Road accident|1000|ft1|0-1|0|3/0/0
Garage fire|1400|ft2|0-0|0|4/0/0
Gas Leak|400|ft2|0-0|0|1/0/0
Fireplace fire|1310|pt1,bc1,ft1|0-0|0|6/0/0
Harvester fire|1200|ft2|0-0|0|6/0/0
Wastebin fire|110|ft1|0-0|0|1/0/0
Alcoholic intoxication|0||1-1|0|0/1/0
Nosebleed|0||1-1|0|0/1/0
Chest Pains|0||1-1|0|0/3/0
Acute asthma|0||1-1|0|0/3/0
Seizure|0||1-1|0|0/3/0
Fever|0||1-1|0|0/3/0
Fallen person|0||1-1|0|0/1/0
Major fire|10210|pt2,bc2,mc1,ma1,wt1,hr2,ft10|0-0|0|0/0/0
Manhole Fire|210|bc1,ft2|0-0|0|2/0/0
Diabetic problems|0||0-1|0|0/1/0
Burning machine|2470|bc1,ma1,wt1,hr1,ft3|0-0|0|5/0/0
Burning locomotive|1800|bc1,ma1,wt1,hr1,ft4|0-1|0|7/1/0
Gas station fire|3920|pt1,bc1,mc1,ma1,hz1,hr2,ft4|0-0|0|11/0/0
Dangerous goods truck accident|2200|bc1,hz1,hr1,ft3|0-1|0|11/1/0
Shoplifting|100|pc1|0-0|1|0/0/1
Parked car accident|120|pc1|0-0|0|0/0/1
Metal burglary|150|pc1|0-0|1|0/0/1
Pickpocketing|150|pc1|0-0|1|0/0/1
Fare dodger|120|pc1|0-0|0|0/0/1
Brawl|700|pc3|0-3|2|0/0/3
Rioter|500|pc2|0-0|1|0/0/2
Unannounced demonstration|10020|pc7|0-0|0|0/0/0
Pile-up|10010|bc2,hz2,hr5,ft10|10-12|0|0/0/0
Person check|100|pc1|0-0|1|0/0/3
Obstruction of traffic|80|pc1|0-0|0|0/0/1
Theft of property from vehicles|150|pc1|0-0|0|0/0/1
Tree on bikeway|310|ft2|0-0|0|1/0/0
Burning substation|1900|bc1,ft2|0-0|0|4/0/0
Person under tree|1000|ft2|1-1|0|6/5/0
Traffic accident - ice|1410|hr1,ft1|0-3|0|4/0/0
MVA Rollover|3000|pt1,bc1,hr1,ft3,pc2|0-4|0|4/3/3
Industrial Fire|5300|pt2,bc2,mc1,hz1,ft5|0-4|0|11/2/0
Partial Building Collapse|7300|pt2,bc2,hr2,ft2|0-2|0|5/3/0
Trench Rescue|2500|bc1,hr2,ft3,pc1|2-4|0|5/3/1
Officer Down|1500|pc6|1-1|0|0/0/6
Concert|9600|am1,ft2,pc7|0-0|0|3/1/4
Soccer Game|4800|am2,ft1,pc3|0-0|0|4/2/2
Baseball Game|6600|am2,ft1,pc2|0-0|0|2/2/4
Prisoner Escape|4000|k91,ph1,pc10|0-0|1|0/0/7
Fleeing Suspect|3000|ph1,pc5|0-0|1|0/0/4
Missing Person|4500|bc1,ph1,ft2,pc5|0-1|1|6/1/4
Warrant Standby|2000|ph1,pc3|0-0|1|0/0/2
Large Unknown Tanker Spill|5300|bc2,mc1,hz2,hr2,ft4,pc3|0-0|0|15/0/2
Commercial Fire|4000|pt2,bc2,mc1,hr2,ft6,pc2|0-4|0|13/2/2
Animal Attack|300|pc1|1-1|0|0/1/1
Unknown Tanker Spill|4300|bc2,mc1,hz1,hr2,ft4,pc3|0-0|0|13/0/2
High Rise Fire|4000|pt2,bc2,mc1,ma2,wt1,hr1,ft5|4-7|0|13/1/0
Domestic Dispute|300|pc2|0-0|0|0/0/3
Hostage Taken|2000|pc4|1-2|0|0/1/8
Active Shooter|2800|ph1,pc4|1-10|0|0/2/9
High-Risk Warrant|1400|pc2|0-0|0|0/0/9
Drug Warrant|1000|pc2|0-0|0|0/0/8
Anaphylaxis|0||1-1|0|0/2/0
Noise Complaint|400|pc1|0-0|0|0/0/1
Residential Fire|1750|pt1,bc1,ft3,pc2|0-4|0|6/2/2
Stabbing|1500|pc5|1-6|0|0/4/6
Bomb Explosion|14000|pt2,bc2,mc1,ph1,hr2,ft6,pc14|0-0|0|0/0/0
Smoke in Cabin|1200|arff1,ft2|0-0|0|2/0/0
Braking Overheat|900|arff1,bc1,ft2|0-0|0|2/0/0
Food Poisoning|0||1-1|0|0/1/0
Large Aircraft Crash|6000|arff4,bc2,ft4,pc5|5-25|0|10/7/4
Aircraft Hijack|5000|bc1,pc10|1-10|0|2/10/10
Carbon Monoxide Alarm|100|ft1|0-0|0|1/0/0
Bank Robbery|1600|pc6|0-0|0|0/0/8
Shooting|1750|pc7|1-6|0|0/4/5
Vehicle Accident - Entrapment|1500|bc1,hr2,ft2,pc2|0-4|0|6/1/2
Overdose|0|pc1|1-1|0|0/2/1
Fire in an Office Building|7000|pt4,bc2,mc1,ma1,wt1,hr2,ft10,pc3|0-4|0|15/2/3
Aggressive Passenger|600|pc1|0-0|1|0/0/1
Powerline Down|400|ft1|0-0|0|1/0/0
Parole Violation|400|pc1|0-0|1|0/0/1
Allergic Reaction|0||1-1|0|0/1/0
Stolen Credit Card|400|pc1|0-0|1|0/0/1
Search of a vehicle|1000|k91,pc2|0-0|0|0/0/6
Small Violent Protest|2200|k91,pc4|0-3|2|0/2/6
Medium Violent Protest|3000|k91,ph1,pc7|0-5|4|0/3/7
Drug Deal|1500|k91,pc4|0-0|2|0/0/6
Smoke Investigation|700|pt1,bc1,ft1|0-0|0|2/0/0
Drug Lab Fire|3000|pt2,bc2,hz2,ft4,pc4|1-10|5|11/5/4
Gas Station Robbery|1250|ph1,pc4|0-0|3|0/0/8
Elevator Rescue|400|ft2|0-0|0|1/0/0
Warehouse Fire|10000|pt4,bc2,mc1,ma4,wt3,hr4,ft10,pc2|0-2|0|20/5/5
Assassination Threat|4400|pc5|0-0|0|0/0/8
Truck in House Wall|4400|hr1,ft3|0-3|0|4/2/0
Burning Garbage Truck|600|ft2|0-0|0|2/0/0
Child Birth|0||1-1|0|0/1/0
Keys Locked in Vehicle|300|pc1|0-0|0|0/0/1
Stuck Climber|650|pt1,hr1,ft1|1-1|0|4/1/0
Smoke Detector Check|400|ft1|0-0|0|8/0/0
Freight Train Derailment|10000|pt4,bc2,mc1,ma2,hz2,hr4,ft10,pc2|0-4|0|15/3/3
Barn Fire|1800|pt1,bc1,ma1,wt1,ft6|0-0|0|7/0/0
Chlorine leak|3500|bc1,mc1,hz1,hr1,ft3|0-15|0|12/6/0
Fire in Hospital|6000|pt3,bc2,mc1,ma1,wt1,hr2,ft10|0-25|0|10/6/0
Turbulence Injury|0||1-4|0|0/3/0
Accident Involving a Bus|1000|hr1,ft2|0-12|0|3/8/0
Serious Accident Involving a Bus|2000|pt1,bc1,hr2,ft4,pc2|0-12|0|5/8/2
Lost Child|700|pc3|1-1|0|0/1/2
DUI Checkpoint|3600|pc6|0-0|0|0/0/6
Light Aircraft Crash (Airfield)|2500|arff2,ft1|0-4|0|4/2/0
Light Aircraft Crash|4000|bc1,hz1,wt1,hr1,ft4|0-4|0|13/2/0
Cable theft|550|k91,pc3|0-0|2|0/0/6
Drowning|1250|bt1,bc1,hr1,ft1|1-2|0|9/1/0
Car in river|1400|bt1,bc1,hr1,ft2|1-2|0|7/1/0
Car in lake|1400|bt1,bc1,hr1,ft2|1-2|0|7/1/0
Small flooding|550|ft2|0-1|0|9/1/0
Medium flooding|1550|bt1,bc1,ft4|0-3|0|9/3/0
Large flooding|2500|bt2,bc2,hr1,ft6|0-6|0|9/3/0
Giant flooding|4000|bt2,bc2,mc1,hr2,ft8,pc3|0-10|0|14/5/3
Light aircraft crash in water|4000|bt1,bc1,hz1,hr1,ft4|0-1|0|11/3/0
Bridge collapse|7000|bt2,pt1,bc2,mc1,ma1,hr2,ft5,pc2|0-20|0|13/10/2
Stroke|0||1-1|0|0/1/0
Unconscious Person|0||1-1|0|0/1/0
Hemorrhage|0||1-1|0|0/1/0
Burst water main|1200|bc1,hr2,ft3,pc1|0-4|0|10/2/1
Shots fired at Officer|4100|k92,ph1,pc8|1-2|0|0/1/10
School fire|6000|pt1,bc1,mc1,ma1,wt1,hr1,ft5|0-6|0|13/3/0
Cafeteria fire|1300|bc1,ft3|0-2|0|6/2/0
Fire in fast food restaurant|1850|pt1,bc1,ma1,ft5|0-0|0|6/0/0
Container Ship Fire|10000|pt1,bc1,mc1,ma2,hz1,fb1,bt1,hr1,ft4|0-6|0|13/3/0
Dock Crane fire|6000|pt1,bc1,fb1,ft3|0-1|0|6/1/0
Recycling Centre fire|10000|pt2,bc2,mc1,ma1,wt3,hr3,ft12,pc2|0-2|0|20/1/2
Kidnapping|2000|k91,ph1,pc4|0-1|0|0/1/7
Cruise ship sinking|15000|bt3,bc2,mc1,fb1,hr2,ft7|0-20|0|13/15/0
Sinking boat|1500|bt2,bc1,hr2,ft2|0-6|0|8/3/0
Traffic accident with train|3000|bc1,hr2,ft3,pc2|0-4|0|10/2/2
Animal Rescue|900|hr1,ft1|0-0|0|6/0/0
Single vehicle fire in tunnel|1500|bc1,ft3|0-4|0|6/2/0
Kitchen Fire|1000|ft2|0-0|0|2/0/0
Small boat fire|1250|bt1,bc1,ft3|0-0|0|6/0/0
Person with a weapon|2500|k91,pc4|0-0|1|0/0/8
VIP appearance|4000|k92,ph1,pc6|0-0|0|0/0/15
Large Field Fire|3000|bc1,wt1,ft5|0-0|0|10/0/0
Natural gas odor|400|ft1|0-0|0|1/0/0
Ammonia Leak (Gas Alarm System)|5000|bc1,mc1,ma1,hz1,hr1,ft4,pc3|0-10|0|13/5/2
Multiple vehicle fire in tunnel|5000|bc1,mc1,ma1,wt1,hr1,ft6|0-8|0|8/4/0
Transformer fire|800|ft2|0-0|0|2/0/0
Caller Hangup|600|pc1|0-0|0|0/0/1
Power Plant fire|14500|pt3,bc4,mc1,ma2,hz1,wt2,hr4,ft8,pc4|0-10|0|25/10/2
Factory fire minor|2000|bc2,ft4|0-3|0|8/2/0
Factory fire major|9000|pt2,bc4,mc1,ma1,wt1,hr2,ft8,pc2|0-7|0|15/6/2
Multiple vehicles on fire|3500|bc1,wt1,ft5|0-0|0|7/0/0
Fire on farm medium|6000|pt1,bc1,mc1,wt2,ft8|0-0|0|13/0/0
Fire on farm large|11000|pt2,bc2,mc1,wt3,ft10|0-0|0|16/0/0
Scrapyard fire|5000|pt2,bc2,mc1,wt2,hr2,ft6,pc2|0-0|0|15/0/2
Animal rescue from drain|275|ft1|0-0|0|1/0/0
Home Invasion|1250|k91,ph1,pc4|0-0|2|0/0/9
Museum Fire|7500|pt2,bc2,mc1,ma2,wt1,hr4,ft6,pc2|0-0|0|13/0/2
Cardiac Arrest|0||1-1|0|0/1/0
Respiratory Arrest|0||1-1|0|0/1/0
Difficulty Breathing|0||1-1|0|0/1/0
Back Pain|0||1-1|0|0/1/0
Vehicle Pursuit|1000|k91,ph1,pc4|0-0|2|0/0/7
Landing Gear failure|3000|arff3,bc1,hr1,ft2|0-0|0|11/0/0
Airport Terminal Collapse (Small)|5000|bc2,mc1,hr1,ft4|0-10|0|13/5/0
Airport Terminal Collapse (Large)|7000|pt1,bc4,mc1,hr4,ft8,pc2|0-20|0|20/10/2
Airport Terminal Collapse (Major)|11000|pt2,bc6,mc1,hr6,ft12,pc6|0-40|0|30/20/3
Hazardous materials truck fire in tunnel|6500|bc1,ma1,hz1,wt1,hr1,ft5,pc4|0-10|0|13/5/2
Hazardous materials truck fire|4000|bc1,hz1,wt1,hr1,ft5,pc2|0-4|0|11/2/2
Full Building Collapse|10000|pt2,bc4,mc1,hr4,ft6,pc2|0-10|0|14/5/2
Person Hit by Train|3000|bc2,hr1,ft4,pc2|1-1|0|8/1/2
Electrical fire on subway tracks|1200|bc1,ft3|0-0|0|6/0/0
ALPR Checkpoint|4000|pc4|0-0|0|0/0/2
Bulk hazardous storage tank leak (Small)|4000|bc1,hz1,hr1,ft2,pc1|0-5|0|11/3/1
Bulk hazardous storage tank leak (Large)|6000|bc2,ma1,hz1,hr1,ft4,pc2|0-10|0|11/5/2
Fire in Subway station|3000|bc2,ma1,wt1,hr1,ft4,pc2|0-4|0|10/2/5
Fire in Subway station (Large)|7000|bc2,mc1,ma2,hz1,wt1,hr2,ft8,pc4|0-10|0|13/5/5
Truck Rear-Ended with Entrapment|1250|hr1,ft3,pc1|0-2|0|6/1/1
Attempted Homicide|1000|k91,pc6|1-1|1|0/1/9
Medical emergency on crane|950|bc1,hr2,ft1|1-1|0|8/1/0
Patient Transfer|0||1-1|0|0/0/0
Possible Infectious Outbreak|0||1-1|0|0/1/0
Mental health concern|200|pc1|1-1|0|0/1/1
Car workshop fire|6000|pt2,bc2,mc1,ma1,hz1,wt1,hr1,ft8,pc2|0-4|0|14/2/2
Car workshop fire with explosion|10000|pt2,bc2,mc1,ma1,hz1,wt1,hr4,ft8,pc4|0-12|0|18/6/4
Patient transfer from flight|0||1-1|0|0/1/0
Hotel fire small|3000|ft4|0-6|0|4/4/0
Hotel fire medium|5000|pt1,bc1,ft6|0-10|0|6/8/0
Hotel fire large|8000|pt1,bc2,ma1,wt1,hr1,ft8,pc3|0-20|0|10/10/3
Hotel fire major|12000|pt2,bc4,mc1,ma1,wt1,hr2,ft14,pc6|0-50|0|20/15/6
Small Supermarket Fire|1500|bc1,ft4|0-2|0|5/1/0
Big Supermarket Fire|3000|pt1,bc2,ma1,wt1,hr1,ft6,pc1|0-6|0|8/3/2
Bar Fight|1000|pc4|0-2|3|0/1/3
Unsafe Cladding|450|pt1,ft1|0-0|0|3/0/0
Unsafe Scaffolding|450|pt1,ft1|0-0|0|3/0/0
Sports hall fire|2000|pt1,bc1,ma1,ft5|0-4|0|9/2/0
Landfill fire|3500|pt1,bc1,wt1,ft5|0-0|0|8/0/0
Arm caught in industrial machine|800|hr1,ft1|1-1|0|4/1/0
Person trapped under machine|1100|hr2,ft2|1-1|0|4/1/0
Transient Ischemic Attack|0||1-1|0|0/1/0
Vehicle fire in parking garage|1000|ft2|0-0|0|2/0/0
Large parking garage fire|6000|pt1,bc2,ma1,hz1,wt1,hr2,ft8,pc2|0-6|0|12/4/2
Museum robbery|1000|k91,pc4|0-0|3|0/0/9
Natural Gas explosion|5000|bc1,hr2,ft4|0-10|0|13/7/0
Large Natural Gas explosion|10000|pt1,bc4,mc1,hz1,hr4,ft8,pc2|0-20|0|13/15/3
Swimmer in distress|900|bt1,ft1|1-1|0|3/1/0
Unknown structure fire|110|ft1|0-0|0|1/0/0
Electrical Cupboard Fire|300|ft1|0-0|0|2/0/0
Smoking Electrical Equipment|300|ft1|0-0|0|1/0/0
Storage Cupboard Fire|300|ft1|0-0|0|2/0/0
Illegal goods smuggling|800|k91,pc3|0-0|1|0/0/7
Stowaways found|2000|k91,ft1,pc8|1-10|4|1/5/7
Customs search operation|1600|k91,pc4|0-0|0|0/0/7
Heatstroke|0||1-1|0|0/1/0
Acid burns (Accidental)|0||1-1|0|0/1/0
Hit and Run|500|pc1|0-1|0|0/1/2
Ceiling Collapse|2000|bc1,hr1,ft4|0-6|0|6/4/0
Electrocution|0||1-1|0|0/1/0
Large brawl|2500|k91,pc8|0-10|6|0/7/6
Pepper spray discharged on train|1500|bc1,hz1,ft2,pc6|0-6|1|11/5/5
Passenger train derailment (Small)|8000|bc1,hr2,ft6,pc2|0-20|0|10/15/2
Passenger train derailment (Large)|11000|bc2,hz1,hr4,ft10,pc4|0-50|0|15/25/4
Passenger train derailment (Major)|14000|pt1,bc6,mc1,hz2,hr6,ft14,pc12|0-60|0|30/40/10
Bus in river|4000|bt1,bc1,hr1,ft4,pc2|1-20|0|6/6/1
Chemistry accident at school|900|hz1,ft1|0-2|0|11/1/0
Bus on fire|2000|bc1,ft3|0-12|0|6/6/0
Subway Collapse|12000|pt2,bc4,mc1,hr6,ft8,pc2|0-30|0|15/15/1
Subway train on fire|5000|bc1,ma1,hz1,wt1,ft5,pc2|0-5|0|11/3/1
Damaged tank car|950|bc1,hz1,hr1,ft4|0-0|0|11/0/0
Tanker ship on fire|15000|pt2,bc2,mc1,ma2,hz3,fb3,bt1,hr2,ft8,pc3|0-15|0|20/10/2
Car vs tree|900|ft1,pc1|0-2|0|1/1/1
Car vs tree (entrapment)|900|hr1,ft1,pc1|0-2|0|4/1/1
Protestors on runway|700|pc4|0-4|0|0/2/2
Sick person|0||1-1|0|0/1/0
Panic button activation|1500|pc7|0-1|2|0/1/6
Restraining Order Violation|300|pc2|0-0|1|0/0/1
Vehicle Crash - Property Damage|400|pc1|0-0|1|0/0/1
Child Locked in Vehicle|1000|ft1,pc1|1-1|1|1/1/1
Residential burglar alarm triggered|600|pc3|0-0|2|0/0/2
Animal on the tracks|200|pc1|0-0|0|0/0/1
Cooking fire|650|ft1|0-0|0|1/0/0
Propane depot explosion|8000|pt1,bc2,mc1,ma1,hz1,wt1,hr1,ft8,pc3|1-4|0|15/2/2
Choking|0||1-1|0|0/1/0
Injured person on high voltage mast|650|pt1,hr1,ft1|1-1|0|4/1/0
Large Ferry Fire|9000|pt1,bc2,mc1,ma1,fb2,hr2,ft7|5-12|0|13/8/0
Residential police raid|750|pc4|0-0|3|0/0/4
Straw bale stack on fire|1500|bc1,wt1,ft5|0-0|0|8/0/0
Injured free runner|400|ft1|1-1|0|4/1/0
Cruise ship fire|9000|pt1,bc2,mc1,ma1,hz1,fb2,hr2,ft7|0-12|0|13/6/0
Vehicle lost its load|700|ft1,pc2|0-0|0|1/0/1
Medium Wildfire|4000|br4,bc1,wt2|0-0|0|8/0/0
Large Wildfire|6500|br6,bc2,wt4|0-0|0|10/0/0
Major Wildfire|10000|br8,bc3,mc1,wt8,pc2|0-0|0|14/0/2
Medium Controlled Burn|1300|br2|0-0|0|3/0/0
Large Controlled Burn|1800|br3,bc1|0-0|0|6/0/0
Firebreak Clearing|600|br2|0-0|0|2/0/0
Lightning Strike in Forest|700|br2|0-0|0|2/0/0
Plane off the runway|3000|arff2,pt1,bc1,am2,ft2|10-20|0|8/1/0
Off-road Rescue|3000|br1,ft1|0-2|0|5/1/0
SCUBA Injury|600||1-1|0|0/3/0
Boat Leaking Fuel|1000|hz1,fb1,ft2|0-0|0|8/0/0
Small Earthquake|500|ft2|0-0|0|2/0/0
Large Earthquake|2100|pt1,bc2,ma1,hr2,ft5|2-10|0|10/3/0
Medium Earthquake|1200|bc1,ma1,hr1,ft2|0-5|0|6/1/0
Major Earthquake|3200|pt2,bc4,ma2,hr5,ft10,pc1|10-30|0|15/5/0
Trespasser on Tracks|900|pc3|0-0|2|0/0/7
Small forest fire|2000|br3,bc1,wt1|0-0|0|9/0/0
Cliff collapse on highway|7000|bc4,mc1,hr4,ft8,pc5|0-0|0|10/2/3
Cabin fire|3000|br1,bc1,wt1,ft4|0-6|0|9/4/0
Campsite fire|3000|br1,bc1,wt1,ft4|0-2|0|9/2/0
Medium forest fire|5500|br5,bc2,wt2|0-0|0|11/0/0
Large Forest Fire|8000|br8,bc5,mc1,wt3|0-0|0|15/0/0
Major Forest Fire|11000|br10,bc7,mc2,fav1,wt4,pc4|0-0|0|18/0/3
Fire Watch|1600|br2|0-0|0|2/0/0
Burning Bus Terminal|2000|bc1,ft3|0-12|0|6/6/0
Traffic light failure|250|pc1|0-0|0|0/0/1
Train station fire (small)|4000|bc1,hr1,ft6,pc2|0-6|0|8/5/2
Train station fire (medium)|6000|pt1,bc2,ma1,hr2,ft8,pc4|0-12|0|12/8/4
Sunstroke|250||1-1|0|0/2/0
Heat stroke|250||1-1|0|0/4/0
Heat cramp|250||1-1|0|0/4/0
Dehydrated person|250||1-1|0|0/3/0
Barbecue fire|600|ft1|0-0|0|1/0/0
Pier on fire|5000|pt1,bc1,bt1,hr1,ft4|0-0|0|7/0/0
Panic attack|0||1-1|0|0/1/0
Community Engagement|1000|am1,ft1,pc1|0-0|0|1/1/1
Train station fire (Large)|10000|pt2,bc3,mc1,ma1,hz1,wt1,hr3,ft10,pc8|0-15|0|15/13/6
Construction vehicle accident|950|bc1,hr2,ft3|1-1|0|9/1/0
Medical emergency on ship|700|pt1,ft1|1-1|0|3/1/0
Security Check|650|k91,pc3|0-0|2|0/0/7
Car vs Powerline|1000|hr1,ft2,pc2|0-3|0|4/2/2
Subway train derailment|4000|bc2,hr2,ft4,pc2|0-15|0|10/7/1
Electrocution from third rail|400|ft2|1-1|0|2/1/0
Small Wildfire|2000|br2,wt1|0-0|0|3/0/0
Small Controlled Burn|800|br1|0-0|0|2/0/0
Restaurant fire|5000|pt1,bc1,ma1,wt1,hr1,ft4,pc2|0-5|0|10/3/1
Overturned tanker truck|3500|bc1,mc1,hz1,hr1,ft4,pc2|1-1|0|13/2/2
Concussion|0||1-1|0|0/1/0
Reported fraud|300|pc1|0-0|1|0/0/1
Serve court order|150|pc1|0-0|0|0/0/3
Serve eviction notice|150|pc1|0-0|0|0/0/3
Eviction standby|900|sv1|0-0|0|0/0/7
Office Investigation|500|fd1,dn1|0-0|0|0/0/0
Office used for crypto attacks|1600|fd3,iv1,pm1,pc2|0-0|2|0/0/0
Office embedded in corruption|1900|fd3,iv1,pm1,pc3|0-0|5|0/0/0
Cyber-Criminal organization hideout|3600|bo1,fd5,dn1,pm1,pc5|0-0|8|0/0/0
Restaurant Investigation|500|fd1,iv1|0-0|0|0/0/0
Money laundry operations inside restaurant|1700|fd3,iv1,pm1,pc2|0-0|3|0/0/0
Criminal organization meeting|3700|bo1,fd5,dn1,pm1,pc6|0-0|10|0/0/0
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
Hunter accidently injured trespasser|200|pc1|1-1|0|1/1/1
Mass panic in discotheque|3500|pc9|0-17|2|0/10/9
Abandoned luggage|150|pc1|0-0|0|0/0/1
Small wildfire cleanup|700|br2|0-0|0|0/0/0
Medium wildfire cleanup|2000|br4,ft1|0-0|0|1/0/0
Large wildfire cleanup|4500|br7,bc1,ft2|0-0|0|6/0/0
Major wildfire cleanup|9500|br10,bc2,mc1,ft4|0-0|0|12/0/0
Carpentry workshop fire|4200|pt2,bc4,mc1,ma1,wt1,ft10,pc2|0-3|0|13/2/2
Person stuck on playground equipment|500|ft1|1-1|0|1/1/0
Train station collapse (Small) (Fire alarm system)|4000|bc1,hr2,ft4|0-5|0|8/5/0
Train station collapse (Medium)|6000|bc2,hr4,ft6,pc2|0-10|0|12/8/2
Train station collapse (Large)|9800|pt1,bc4,mc1,hr6,ft8,pc4|0-15|0|15/13/3
Train station collapse (Major)|15000|pt1,bc6,mc2,hr8,ft12,pc6|0-20|0|20/18/5
Accident with chainsaw|400||1-1|0|0/1/0
Burning freight car|1500|bc1,ft5|0-0|0|6/0/0
Speed radar|2000|pc2|0-0|0|0/0/2
Bird strike|2500|arff3,bc1,ft1|0-0|0|7/0/0
Possible Cannabis Farm|1000|ph1,pc1|0-0|0|0/0/1
Suspicious package|800|k91,pc2|0-0|0|0/0/6
Suspicious Person|300|pc1|0-0|1|0/0/1
Arrhythmia|0||1-1|0|0/1/0
Street market patrol|1500|pc1|0-0|0|0/0/1
Object stuck in person|0||1-1|0|0/1/0
Counterfeit Goods raid|1200|pc4|0-0|3|0/0/4
Debris on runway|350|ft1|0-0|0|1/0/0
Landslide|1500|bc1,hr2,ft4|0-5|0|8/4/0
Crushed person|0|hr1,ft1|1-1|0|4/1/0
Biker fell off mountain-road|0||1-1|0|0/1/0
Major road block|6000|pc5|0-0|0|0/0/5
Apartment fire in High Rise|2000|pt1,bc1,ma1,ft3|0-6|0|8/6/0
Transporter fell on side|0|pt1,bc1,ft1|1-2|0|6/2/0
Illegal internet activity|500|fd1|0-0|1|0/0/0
Chlorine Exposure|2500|hz1,ft1|1-2|0|11/2/0
Containment Breach at Lab|7500|bc2,mc1,ma1,hz1,ft5,pc2|2-5|0|13/5/2
Agricultural Chemical Leak|3500|bc1,hz1,ft2|1-1|0|11/1/0
Container Leaking Unknown Substance|1500|hz1,ft1|0-0|0|11/0/0
Aircraft Leaking Fuel|1500|arff1,bc1,hz1,ft1|0-0|0|11/0/0
Radioactive Exposure|2500|bc1,hz1,ft2|1-2|0|11/2/0
Fuel Spill in Waterway|3000|bc1,hz1,ft3|0-0|0|11/0/0
Cat stuck in tree|450|pt1,ft1|0-0|0|3/0/0
Jewelry store robbery|800|pc2|0-0|0|0/0/2
Glass shard embedded in hand|0||1-1|0|0/1/0
Observation of a suspect|6000|pc2|0-0|1|0/0/2
Welfare Check|900|pc1|1-1|0|0/1/1
Spinal injury|0||1-1|0|0/2/0
Bomb Explosion at Chemical Plant|35000|pt10,bc10,mc2,ma4,hz4,wt6,hr12,ft25,pc12|30-80|0|25/20/8
Chemical in water|1200|bt1,bc1,hz1,hr1,ft1|0-0|0|11/0/0
Investigate area for fire|500|br1,fi2|0-0|0|0/0/0
Person started brushfire (small)|600|br1,fi1,ft1,pc1|0-0|0|1/0/1
Person started brushfire (large)|1200|br2,fi3,ft2,pc2|0-0|3|2/0/2
Illegal hunting|500|gw1|0-0|3|0/0/2
Illegal fishing|500|gw1|0-0|2|0/0/2
Animal smuggling|500|gw2,k91|0-0|1|0/0/4
Plant smuggling|500|gw2,k91|0-0|1|0/0/4
Short Children excursion|500|gw1|0-0|0|0/0/1
Long Children excursion|1200|gw2|0-0|0|0/0/2
Wilderness First Aid|500|gw1|1-1|0|0/1/1
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
Hidden branch of drug cartell|4500|fd7,pc5|0-6|12|0/0/3
Office used for firearms black market sales|2500|fd4,pc2|0-0|2|0/0/2
Branch of firearms black market organization|4500|fd5,pc5|0-6|12|0/0/3
Person hit by a jet ski|1200|bt1|1-1|0|5/1/2
Falling Light Pole|2500|bc1,hr1,ft2|0-6|0|7/3/0
Biker fallen on country road|0||1-1|0|0/1/0
Large STOP operation|6000|pc5|0-0|0|0/0/5
Skyscraper fire|7500|pt2,bc2,mc1,ma1,wt1,ft8,pc3|0-20|0|10/6/5
Illegal tapping of electricity|500|pc1|0-0|1|0/0/1
Burning bouquet|800|ft2|0-0|0|1/0/0
Bedroom fire from candle|1500|ft1|2-2|0|2/1/0
Burning cake in oven|600|ft1|0-0|0|1/0/0
Kitchen burning down|1400|ft2|0-2|0|1/1/0
Motorcross Accident|0||1-3|0|0/3/0
Flat fire in sheltered housing|3500|bc2,ft4|1-1|0|8/1/0
Car off bridge|1500|pt1,ft4,pc2|1-4|0|3/1/2
Powerline struck by lightning|250|pt1,ft2|0-4|0|4/1/0
Small Memorial day parade|5000|pt1,bc1,am1,hr1,ft2,pc3|0-0|0|6/1/3
Large Memorial day parade|10000|pt2,bc3,ma1,hz1,wt1,am2,hr1,ft4,pc6|0-0|0|11/2/6
Tornado touchdown in rural area|2500|ft4,pc4|0-10|0|4/6/4
Tornado touchdown in urban area|10000|bc2,k92,hr4,ft12,pc8|5-65|0|9/25/6
Storm cleanup (large)|4500|pt2,bc2,ft10,pc4|0-10|0|8/5/4
Storm cleanup (major)|8000|pt4,bc4,ma1,hr2,ft14,pc6|0-20|0|10/15/5
Flood evacuation|3600|bt2,hr2,ft6,pc2|0-30|0|5/20/2
Search and rescue|4800|hr1,ft6,pc2|0-10|0|5/8/2
Blown over semi truck|1250|hz1,ft4,pc2|1-6|0|11/1/2
Lightning strikes house|450|ft2|0-0|0|4/0/0
Tornado watch|4400|ft6,pc4|0-0|0|5/0/4
Porta Potty Tip Over|1200|hz1,hr1,ft1,pc1|0-1|0|11/1/1
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
Serious injuries caused by glass|0|ft1|1-1|0|1/1/0
Armed Vehicle Pursuit|2000|ph1,pc3|0-3|4|0/0/8
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
Storm drain clogged with leaves|300|ft2|0-0|0|1/0/0
Hypothermia after swimming in cold water|0||1-1|0|0/1/0
Accident on foggy road|800|hr1,ft2|0-2|0|4/2/0
Deer crossing accident|1000|hr1,ft2,pc1|0-1|0|4/2/1
Burning pile of leaves|320|ft2|0-0|0|2/0/0
Flooded Tunnel (small)|2400|bc1,wt1,ft2,pc2|0-1|0|6/1/2
Flooded Tunnel (large)|4500|bc2,wt2,ft6,pc4|0-4|0|6/4/4
Twisted Ankle|700|am1|1-1|0|0/1/0
Office robbery|1500|pc2|0-0|1|0/0/2
Auto theft|1600|pc3|0-0|2|0/0/2
Burning Wind Turbine|2100|pt1,ft3,pc2|0-0|0|3/0/2
Aircraft Emergency Landing On Roadway|2000|bc1,hr1,ft3,pc2|1-4|0|6/2/2
Airport Terminal Fire (Small)|5500|pt2,bc1,hr1,ft5,pc2|2-5|0|6/3/2
Cargo Plane Fire|12000|arff5,pt6,bc6,mc1,hz2,hr4,ft12,pc5|2-2|0|13/5/4
Building Collapsed into Water|12000|bt4,bc4,mc1,fi2,k92,pb2,hr6,ft8,pc6|3-30|0|15/0/8
Breakdown of public bus|500|pc1|0-0|0|0/0/1
Illegal Fire Arms Factory (Minor)|3500|fd8,pc5|0-0|6|0/0/5
Firing of Implanted Defibrillator|0|am1|1-1|0|0/0/0
Animal stuck between walls|1300|hr1,ft1|0-0|0|4/0/0
Car Jacking|3500|pc5|0-0|0|0/0/5
Cruise ship fire with explosion|18000|bo1,bt4,pt2,bc4,mc2,fd2,fi2,ma2,hz2,iv1,fb2,pm1,pb1,hr4,sv2,ft12,pc8|30-60|0|13/20/7
Cruise ship fire & explosion with hull breach|23000|bo1,bt7,pt5,bc6,mc2,fd2,fi3,ma2,hz3,iv1,fb2,pm1,pb2,hr7,sv2,ft30,pc8|40-85|0|15/30/7
Container ship fire with explosion|22000|bo1,bt3,pt3,bc4,mc2,fd2,fi2,ma2,hz2,iv1,fb2,pm1,pb1,hr3,sv1,ft12,pc5|5-25|0|13/10/7
Container ship fire & explosion with hull breach|27000|bo1,bt4,pt5,bc6,mc2,fd4,fi4,ma2,hz3,iv1,fb2,pm1,pb1,hr8,sv2,ft20,pc8|5-25|0|15/10/7
Tanker ship fire with explosion|30400|bo1,pt3,bc4,mc1,fd2,fi2,ma2,hz3,iv1,fb4,bt1,pm1,pb1,hr4,sv1,ft16,pc6|5-25|0|20/10/7
Tanker ship fire & explosion with hull breach|35400|bo1,pt5,bc4,mc2,fd4,fi4,ma2,hz3,iv1,fb4,bt2,pm1,pb1,hr5,sv2,ft24,pc9|5-35|0|25/15/7
CBRN explosion on container ship|42000|fd7,bo2,bt7,pt6,bc6,mc2,fi4,ma3,hz4,iv2,k92,fb3,pm1,pb2,hr5,sv4,ft25,pc22|5-30|0|25/10/10
CBRN explosion on tanker ship|45000|fd10,bo2,bt7,pt6,bc6,mc2,fi4,ma4,hz4,iv2,k92,fb3,pm1,pb2,hr6,sv4,ft30,pc25|5-30|0|25/10/10
Prisoner bus accident|2000|k92,ph1,pc10|1-5|5|0/0/6
Ranch fire|4500|br4,bc1,wt1,ft5|0-0|0|7/0/0
Off-Road Vehicle Collision|5000|br1,gw2,hz1,hr2,ft2|2-4|1|4/0/2
Ambulance accident|1500|hr1,ft1,pc2|4-6|0|4/2/1
Allergic reaction to bee sting|550||1-1|0|0/1/0
Allergic reaction to pollen|650||1-1|0|0/1/0
Fall from ladder during spring cleaning|500||1-1|0|0/1/0
Wild animal attack during spring picnic|600|pc1|1-3|0|0/3/1
Food poisoning from wild berries|800||1-1|0|0/1/0
Picnic basket on fire|800|ft2|0-0|0|2/0/0
Person is stealing baby cows|900|pc2|0-0|1|0/0/1
Cow Thief on the run|900|k92,ph1,pc5|0-0|1|0/0/10
Thief attacked by a cow|860|am1|1-1|0|0/1/0
Drive by shooting|2000|ph1,pc6|1-6|4|0/4/5
Out of control argument|900|pc2|0-0|2|0/0/2
Hybrid Vehicle Fire|1500|ft2,pc1|0-2|0|1/1/1
Crane Collapse|4250|pt3,bc3,mc1,hr2,ft7,pc3|0-13|0|15/10/3
Cargo plane fire with oil leak|15500|arff6,pt6,bc6,mc1,hz4,hr4,ft13,pc5|0-3|0|13/5/4
Large cargo plane fire with oil leak|19000|arff8,pt8,bc8,mc2,hz4,hr6,ft16,pc8|0-5|0|15/5/5
Strip Mall Fire (Small)|6000|pt4,bc2,ma1,ft10,pc2|0-15|0|7/5/1
Strip Mall Fire (Large)|9000|pt6,bc3,mc1,ma1,ft15,pc4|0-15|0|10/15/1
Fire Truck Accident|2000|ft2,pc2|7-10|0|2/4/2
Abdominal Pain|500||1-1|0|0/1/0
Airplane Crash in Urban Area|15000|arff3,pt4,bc3,mc1,ma2,hz2,hr4,sv1,ft10,pc6|10-25|0|7/10/2
Airplane Crash in Urban Area with Fire|20000|arff4,pt5,bc4,mc2,ma2,hz2,wt3,hr6,sv2,ft13,pc8|10-30|0|10/10/3
Airplane Crash in Urban Area with Explosion|22500|arff5,bo1,pt5,bc5,mc2,fd2,ma3,hz3,iv2,pm1,hr6,sv2,ft15,pc10|15-35|0|10/10/5
Medium Cannabis Grow Operation|6000|fd1,hz1,k91,ph1,sv1,pc3|0-0|5|0/0/2
Large Cannabis Grow Operation|10000|fd7,hz1,k92,ph1,sv5,dn1,pc10|0-0|10|0/0/4
Stolen Police Car|5000|ph1,sv1,pc5|0-0|1|0/0/5
Driving Under The Influence of Narcotics|900|pc1|0-2|1|0/1/4
Mattress Factory Fire|10500|pt5,bc3,mc1,ma1,wt1,hr1,ft14,pc2|5-20|0|8/4/3
Refinery Fire (Small)|10000|pt4,bc4,mc1,fo1,ma1,hz2,wt1,hr4,ft10,pc4|5-15|2|10/5/5
Refinery Fire (Medium)|15000|pt5,bc4,mc1,fo2,ma1,hz3,wt2,hr5,sv1,ft12,pc5|10-20|3|12/6/6
Refinery Fire (Large)|22000|pt6,bc5,mc1,fd1,fo3,ma2,hz4,wt3,hr6,sv2,ft15,pc6|15-20|4|15/8/8
Refinery Fire (Major)|30000|pt8,bc6,mc1,fd2,fo4,ma3,hz5,wt4,iv1,hr8,sv3,ft20,pc8|20-35|5|20/10/10
Refinery Explosion (Major)|40000|pt10,bc7,mc2,fd4,fo5,ma5,hz6,wt5,iv1,hr10,sv4,ft30,pc10|30-50|8|25/15/15
Area Evacuation|3500|sv2,pc10|0-5|0|0/2/10
Post-Fire Environmental Damage Assessment|2500|fi2,gw4,pc1|0-0|0|2/0/2
Overturned Small Vessel|8000|cs1,cht1|0-2|0|0/3/0
Overturned Large Vessel|14000|cs5,cht2|0-5|0|0/8/0
Drowning Surfer|1000|lg1|1-1|0|0/1/0
Missing Vessel|7000|cs2,cht1|0-5|0|0/3/0
Oil Rig Fire|10000|cht2,cs2,fb2|0-10|0|8/6/0
Oil Rig Explosion|35000|cs8,cht5,cpl1,fb6|0-20|0|20/16/0
Shark Attack|1000|cs1,lg1|1-1|0|0/2/0
Smuggling via Boat|4000|cht2,cpl1,cs2|0-0|4|0/0/2
Parasailing Accident|2500|cs1,ccm1,cht1,lg2|1-4|0|0/2/0
Deep Water Search & Rescue|4000|cs2,cht2|0-3|0|0/2/0
Hostage Rescue Aboard Cargo Ship|8500|cs5,cht2|1-8|6|0/5/6
Whaling Vessel Performing Illegal Operations|8000|cs3|0-0|8|0/0/6
Multiple Whaling Vessels Performing Illegal Operations|10000|cs9,cht2|10-24|24|0/0/14
Sailors Trapped in Capsized Naval Vessel|9000|cht1,cs2|1-4|0|0/3/0
Distressed Yacht Caught in Hurricane|5000|cht1,cpl1,cs1|1-4|0|0/3/0
Oil Tanker on Fire in Ocean|15000|cht2,cpl1,cs3,fb4|3-12|0|12/10/0
Stalker|500|pc1|0-0|1|0/0/1
Multi Vehicle Pile-up|3000|hr1,ft1,pc3|3-10|1|4/3/4
Multi Vehicle Pile-up (Large)|6000|hr2,ft2,pc4|6-15|1|5/4/6
Jetbridge Collapse (Small)|3000|arff1,pt1,bc1,hr2,ft3|1-10|0|5/3/0
Jetbridge Collapse (Large)|6000|arff1,pt1,bc2,mc1,hr2,ft5|10-30|0|7/5/0
Faulty Heating Boiler|400|ft1|0-1|0|1/1/0
Carbon Monoxide Leak (Small)|1100|ma1,ft4|1-6|0|5/2/0
Carbon Monoxide Leak (Large)|4700|bc1,ma2,hz1,ft7|5-20|0|11/5/0
Carbon Monoxide Leak (Major)|9500|pt2,bc2,mc1,ma4,hz2,ft17|20-100|0|15/10/0
Sports Fan Brawl (Small)|3000|pc10|2-10|7|0/5/4
Sports Fan Brawl (Medium)|6000|sv1,pc15|7-20|12|0/8/7
Sports Fan Brawl (Large)|9500|k92,sv2,pc25|10-45|30|0/10/10
Arborist Accident|500|pt1,ft1|1-1|0|1/1/0
Person Pinned Under Tank Trailer|1000|hz1,hr1,ft1|1-1|0|11/1/0
Methane Leak|1000|bc1,ma1,hz1,hr1,ft3,pc2|0-1|0|3/1/1
Methane Fire|4000|bc2,fo1,ma1,hz2,hr2,ft6,pc3|0-4|0|6/2/2
Methane Explosion|9000|pt2,bc3,mc1,fo3,ma2,hz3,wt2,hr4,ft10,pc5|0-11|1|10/4/4
Sinkhole - No Damage|750|pt1,bc1,hr1,ft2,pc2|0-0|0|6/0/1
Sinkhole - Person Injured|1500|pt1,bc1,hr2,ft2,pc2|5-5|0|6/2/1
Sinkhole - Roadway Damaged|1750|pt2,bc1,hr2,ft3,pc2|0-5|0|6/2/1
Vehicle Fallen Into Sinkhole|2000|pt2,bc1,hr2,ft4,pc3|0-5|0|6/2/1
Sinkhole - Structural Damage|2750|pt3,bc2,hr3,ft4,pc3|0-5|0|6/2/1
Light Aircraft Crash in Wildland|6500|br4,bc2,hz1,wt3,hr1,ft6,pc2|0-4|0|11/1/1
Large Aircraft Crash in Wildland|6500|br6,bc4,mc1,hz1,wt4,hr1,sv1,ft8,pc4|10-40|0|11/10/7
Confined Space Rescue|1500|hr1,ft2|0-4|0|4/1/0
Collision with Jackknifed Semi-Trailer (Small)|1000|pc2|0-0|0|0/0/1
Collision with Jackknifed Semi-Trailer (Medium)|4700|pt1,bc1,hr2,ft6,pc6|0-10|0|6/3/2
Collision with Jackknifed Semi-Trailer (Large)|14500|pt1,bc2,hr3,sv1,ft9,pc9|0-20|0|15/8/7
Collision with Jackknifed Semi-Trailer (Major)|24000|pt2,bc3,mc1,hr4,sv2,ft11,pc15|0-30|0|18/12/10
Post-Surgical Complications|0||1-1|0|0/0/0
Power Plant Fire - Major|22500|pt5,bc8,mc2,fo1,ma3,hz3,wt4,hr6,sv1,ft14,pc7|10-20|1|30/12/8
Power Plant Fire - Explosion|37500|pt8,bc8,mc2,fo2,ma4,hz5,wt6,hr6,sv2,ft20,pc10|15-30|1|33/15/9
Power Plant Fire - CBRNE|45000|pt12,bc9,mc2,fo2,ma4,hz6,wt10,hr15,sv4,ft30,pc20|25-50|3|40/20/15
Library Fire (Small)|2250|ft2|0-5|0|1/1/0
Library Fire (Medium)|6500|pt1,bc1,wt1,ft5|3-10|0|7/2/0
Library Fire (Large)|10000|pt2,bc2,mc1,ma1,wt2,ft8,pc2|8-15|0|10/10/1
Library Fire (Major)|20000|pt4,bc4,mc1,fi3,ma2,wt3,sv1,ft15,pc4|15-50|0|14/20/7
Train Fire With Flammable Products|4300|bc2,mc1,hz1,hr2,ft5,pc3|0-0|0|13/0/2
Switchboard Fire|500|ft1|0-0|0|1/0/0
Campside - Gas Canister Explosion|9800|pt2,bc1,hz2,wt2,ft5,pc3|0-25|0|14/6/5
Peaceful Demonstration (Small)|5000|k91,pc5|0-0|0|0/0/6
Peaceful Demonstration (Large)|10000|k91,pc15|0-0|0|0/0/6
Conflagration (Small)|3000|pt2,bc2,hr2,ft5,pc4|0-0|0|6/0/2
Conflagration (Medium)|8000|pt3,bc2,wt1,hr2,sv1,ft7,pc7|3-10|0|7/3/7
Conflagration (Large)|13000|pt4,bc4,mc1,ma1,wt4,hr3,sv2,ft10,pc10|8-20|0|13/10/10
Conflagration (Major)|20000|pt10,bc6,mc1,ma2,wt6,hr6,sv4,ft20,pc14|15-50|0|16/25/15
Jetski out of fuel|1200|cs1|0-0|0|0/0/0
Kayakers Blown Off Course|1200|cs1|0-0|0|0/0/0
Boat Lost Mast|1200|cs1|0-0|0|0/0/0
Dam threatens to break|12500|bt2,bc2,wt3,ph1,hr2,mc1,ft8,pc5|0-0|0|15/0/5
Dam break|35500|bt6,pt3,bc6,wt6,ph1,hr4,mc2,cc2,ft35,pc8|0-15|0|25/10/8
Smoke Sighting|1600|br1,bc1|0-0|0|4/0/0
Small Rapid Wildfire|1500|br1,wt1|0-0|0|6/0/0
Medium Rapid Wildfire|2900|br2,bc1,wt2,mc1|0-0|0|10/0/0
Large Rapid Wildfire|7550|br4,bc1,wt3,mc2,cc2|0-0|0|10/0/0
Major Rapid Wildfire|13200|br4,bc1,wt3,mc2,bac1,cc4|0-0|0|10/0/0
Institutional Fire Drill|1000|ft1|0-0|0|1/0/0
Industrial Fire Drill|3000|fi1,ft1|0-0|0|1/0/0
Fire Line Requested|1000|br1,wt1|0-0|0|6/0/0
Campfire sets woodshed on fire|500|ft2|0-1|0|1/0/0
Brawl on frozen lake|650|pc1|0-2|0|0/0/1
Iceskater slipped|0||1-1|0|0/1/0
Kids throwing snowballs on people and houses|550|pc1|0-0|0|0/0/1
MVA Rollover - Ejection|4000|pt1,bc1,hr2,ft4|1-6|1|4/4/4
Burst Tire - Aircraft|750|arff6,bc1,ft1|0-4|0|6/1/0
Sports Stadium Collapse|45000|pt10,bc10,mc2,ma4,k94,hr20,sv4,ft40,pc15|75-250|0|50/30/10
College Sports Stand Collapse|35000|pt10,bc5,mc2,ma3,k92,hr20,sv3,ft35,pc10|50-100|0|30/25/10
Restaurant Food Theft|1250|pc2|0-2|4|0/1/1
Traffic Light Monitoring|300|pc1|0-0|0|0/0/1
Tanker Truck Fire|4500|bc2,hz1,hr1,ft6|0-3|0|11/1/0
Tanker Truck Explosion (Small)|9000|bc2,mc1,hz2,hr1,ft8,pc2|0-5|0|13/1/1
Tanker Truck Explosion (Medium)|13500|bc4,mc1,ma1,hz2,hr2,ft10,pc4|2-10|0|16/2/3
Tanker Truck Explosion (Large)|18000|bc6,mc1,fo1,ma1,hz3,hr4,sv1,ft15,pc6|5-20|0|20/10/7
Tanker Truck Explosion (Major)|26000|bc8,mc2,fo2,ma2,hz4,hr6,sv1,ft20,pc12|10-30|0|25/20/10
Animal Rescue from Water|1000|bt1,gw1,hr1,ft1|0-0|0|2/0/1
Armed Foot Pursuit|3500|k92,ph1,sv1,sw3,pc5|0-2|1|0/1/8
Self-Service Laundry Facility Fire|6000|pt3,bc2,mc1,hz1,ft10,pc2|2-5|0|13/2/1
Pipeline Leak|3500|bc2,hz1,ft3,pc2|0-8|0|11/3/1
Pipeline Fire|7000|pt1,bc3,mc1,hz1,wt1,ft5,pc3|0-8|0|13/3/1
Subterranean Pipeline Fire|9500|bc4,mc1,hz1,wt2,hr1,ft7,pc3|0-8|0|13/3/1
Pipeline Explosion|18500|pt1,bc5,mc1,fo2,hz2,wt2,hr2,sv1,ft12,pc6|0-24|0|18/15/7
Commercial Aircraft - Runway Incursion Collision|50000|arff8,pt20,bc15,mc4,fd8,fo1,ma4,hz4,iv1,k93,pm1,hr20,sv5,ft75,pc20|150-250|0|50/40/10
Empty Commercial Plane Fire|8400|arff4,hz1,wt1,hr2,ft1,pc4|0-0|0|14/0/8
Plane Engine Fire|2400|arff2,ft1,pc2|0-0|0|6/0/4
Protesters stuck on top of a monument|2000|pt1,k91,am3,pc2|2-4|5|6/2/6
Train collision|16000|bc4,mc1,hz1,hr6,ft6,pc6|15-30|0|10/15/10
Scooter Accident|1500|ft1,pc1|1-1|0|2/1/1
Impalement on Fence|1500|hr1,ft1,pc1|1-1|0|4/1/1
Nuclear Explosion (Power Plant)|45000|pt12,bc8,mc2,fo6,ma4,hz4,wt4,hr18,sv2,ft60,pc8|20-65|0|60/30/25
Supervision of a risky sports match|9500|k92,pv1,rt2,rpt1,pc6|0-0|8|0/0/8
Escort of risky fans|17000|k94,ph1,pm1,pv2,rt3,rpt1,pc10|0-0|8|0/0/14
Clash and assault of risky fans|23000|k94,ph1,pm1,pv6,rt4,rpt1,pc20|0-25|40|0/8/18
Crowd Control|3500|k95,pm1,rt1,rpt1,pc5|0-0|0|0/0/8
Kidnapped Politician|13000|k93,rt1,rpt1,pc8|0-1|6|0/0/7
School Bomb Threat|12500|bo1,k94,pm1,rt2,rpt1,pc9|1-6|7|0/0/9
Large Violent Protest|12500|pm1,pv1,rt2,rpt1,pc12|0-0|10|0/0/8
Monitoring of small strike|2800|pv1,rt2,pc4|0-0|2|0/0/3
Monitoring of a Large strike|5600|pv1,rt4,pc12|1-2|2|0/1/8
Rescue of a paraglider from a tree|1300|pt1,hr1,ft1,pc1|1-1|0|4/5/2
Fire at a Bus depot|7200|pt2,bc3,mc1,fo2,hz1,wt1,am1,ft5,pc3|1-1|0|14/6/2
Demonstration against the construction of a highway project|10500|pc4|0-0|5|0/0/4
Motorcycle Hits Pedestrian|2000|bc1,am1,hr1,pc1|1-1|0|6/5/1
Camping Car Fire|4000|bc1,fo1,ft3,pc1|1-2|0|6/2/2
BBQ on fire|500|ft1|0-0|0|1/0/0
Father went missing|1500|pc3|0-0|0|0/0/2
Aquarium Fire Alarm Triggered|2500|bc1,ft2,pc2|0-1|0|6/1/2
Fire in Aquarium|16000|pt2,bc4,mc1,fo1,ma1,wt2,ft8,pc8|3-6|0|10/10/10
Explosion in an aquarium park|24000|pt2,mc2,fo2,ma2,wt2,k92,ft10,pc10|10-20|0|15/6/5
Fire in a cell|4500|pt1,bc2,ma1,ft4,pc2|1-2|0|6/1/2
Fire in a Prison|14500|pt2,bc4,mc1,ma2,wt2,ft8,pc5|4-8|0|13/4/5
Flooded Basement|1200|wt1,fl1|0-0|0|4/0/0
Flooding in a small house, following bad weather|950|wt1,fl1|0-0|0|4/0/0
Flooding in a big house, following bad weather|2120|wt1,fl1|0-0|0|4/0/0
Flooding in a neighborhood following bad weather|3220|wt2,hr1,fl2|0-0|0|7/0/0
Major flooding in a neighborhood following bad weather|9500|mc1,wt3,hr2,fl3,ft3|0-0|0|9/0/0
Rising waters of the canal (Flood)|17500|mc1,wt4,hr6,fl5,ft6,pc4|0-0|0|20/0/5
Flooded mall|6200|mc2,wt3,hr2,fl3,ft3|0-0|0|8/0/0
Fire in an automobile manufacturing plant|16500|pt2,bc4,mc1,fo3,ma1,hz3,wt1,hr1,ft7,pc6|1-10|0|18/6/6
Sailing ship adrift|6550|cs9|0-10|0|0/0/0
Mass crushing at a festival|11500|bc2,mc1,sw2,rt2,ft7,pc6|0-100|25|10/50/15
Sauna on Fire|2500|bc1,fo2,ft2|0-2|0|6/0/0
National Archives Fire|7000|pt2,bc1,fo2,ft6|0-0|0|13/0/0
Fire in a fertilizer storage building|27500|pt2,bc3,mc1,fo2,ma1,hz2,wt1,hr1,ft8,pc3|3-7|0|22/13/8
Lack of oxygen onboard|4480|cs2,cht1|1-2|0|0/10/0
Car off embankment|2500|hr1,ft1,pc1|2-4|0|5/3/1
Children trapped in sewer|2000|ma1,hr1,ft1,pc1|1-2|0|5/3/1
Emergency brake on the train|7300|bc1,hr2,ft4,pc3|0-4|1|9/3/2
Child stuck in tree|340|pt1,ft1|0-1|0|3/1/0
Child swallows cleaning supply|500|pc1|1-1|0|0/1/1
Child stuck in Climbing Frame|1420|bc1,hr1,ft1,pc1|1-1|0|6/1/1
Argument in a shopping center|1500|pc2|0-0|1|0/0/2
Truck Accident - Transport of Animals|3000|bc1,hr2,ft1,pc2|1-2|0|6/2/2
Fire of precarious installations|3000|pt1,bc1,ft2,pc2|1-4|0|6/3/2
Discovery of explosive devices in a vehicle|4500|bo1,bc1,ft1,pc8|0-0|0|6/1/8
Unclear Accident in a school|500||1-1|0|0/1/0
Person Slipped on a patch of ice|500|am1|1-1|0|0/1/0
Sledding accident|500||1-1|0|0/1/0
Truck overturned due to ice|3000|bc1,hr1,ft2,pc2|1-2|0|6/2/2
Vehicle collision due to ice|2700|bc1,hr1,ft3,pc2|1-5|0|6/3/2
Crash of a vehicle into a rack at a gas station|2900|hz1,hr1,ft2,pc2|1-2|0|10/5/8
Two vehicle accident on highway|5600|pt2,bc1,mc1,hr3,ft3,pc2|1-2|0|15/10/8
Overturned tractor|3200|pt2,bc1,hr1,ft2,pc1|1-1|0|6/1/2
Traffic Fight|1640|pc1|0-0|0|0/0/2
Traffic fight escalates|3955|pc2|1-1|0|0/0/2
Car Fire on Highway|1230|bc1,ft1,pc2|0-0|0|6/0/2
Hunting accident|5000|ft1|1-1|0|1/2/0
Fire on a cruise ship at the dock|20500|bt4,pt2,bc5,mc1,ma2,hz1,wt3,fb2,hr1,ft8,pc6|10-35|0|20/15/10
Leakage of chemicals in a laboratory (hospital)|9000|bc3,ma1,hz2,ft5,pc5|1-7|0|15/6/6
Forest fire exercise|24000|br10,bc1,mc1,wt5,pc2|0-0|0|10/0/2
Vehicle Reposession Gone Wrong|1200|pc2|0-0|0|0/0/2
Fire in a barbecue pit|6250|bc2,fo1,ma1,wt3,ft6,pc4|0-0|0|10/5/7
Fire in a paper mill|100|ft1|0-0|0|1/0/0
Smoke inhalation poisoning|1150|bc1,ft2,pc2|1-2|0|6/2/2
Cherry blossoms on fire|1000|pt1,bc1,ft3|0-0|0|3/0/0
Flower field on fire|2500|bc1,wt1,hr1,ft7|1-2|0|5/1/0
Flowers stolen|1200|pc5|0-0|1|0/0/4
Flowerbed catches fire|650|ft1|0-0|0|1/0/0
Gardening accident|500||1-1|0|0/1/0
Assault in a hypermarket|1150|pc4|0-0|2|0/0/3
Fire in a town hall|8850|pt2,bc2,mc1,fo1,ma1,wt1,hr1,ft4,pc4|1-6|0|15/5/5
Passenger vehicle embedded in home|3000|bc1,hr1,ft1,pc2|0-0|0|6/7/2
Food truck fire|1500|bc1,ft1,pc1|0-0|0|6/0/1
Collision between a windsurfer and a swimmer|2500|cs1|1-2|0|0/2/0
Fishing boat in distress|14000|cht2,cs4|0-5|0|0/2/0
Beer barrels leaking|900|hr1,ft2,pc1|0-0|0|7/0/1
Fire at Summer Camp|3500|pt1,bc1,ma1,hr1,ft2,pc2|0-0|0|6/0/2
Amusement Park Ride Malfunction|3000|pt1,hr1,ft1,pc1|1-1|0|10/5/5
Farmers Market Fight|750|pc2|0-0|0|0/0/2
Waterpark Slide Injury|250||1-1|0|0/1/0
Drive-in Theater Accident|700|pc2|0-0|0|0/0/2
Fire in an abandoned pizzeria|7000|pt1,bc2,ma1,hr1,ft4,pc2|0-0|0|12/2/2
Factory Equipment Fire|14500|pt2,bc4,mc1,ma1,hz1,wt1,am1,hr1,ft7,pc4|0-0|0|15/1/4
Sudden illness in spectator stand|0||0-1|0|0/1/0
Heat exhaustion at outdoor event|0||2-4|0|0/4/0
Allergic reaction at food vendor|0||1-1|0|0/1/0
Crowd control needed at sports opening ceremony|9000|bc2,k92,am2,pv1,rt6,ft4,pc5|0-0|0|6/8/5
Suspicious package found at sports stadium entrance|7500|pc5|0-0|0|0/0/5
Athlete Trapped in Elevator at Sport Facility|1400|ft2|0-0|0|3/0/0
Traffic Accident Involving Athlete Shuttle Bus|2900|bc1,hr1,ft2,pc2|0-8|0|6/0/1
Cycling accident during competition|2000|hr1,ft1|1-1|0|4/1/0
Athlete injured during gymnastics routine|0||1-1|0|0/1/0
Water Rescue Required at Sport Sailing Event|6000|bt2,bc1,hr1,ft2|1-1|0|11/1/0
Angry fan at sports swimming pool|200|pc2|0-0|1|0/0/1
Interfacility transport|0||1-1|0|0/1/0
Release of chemical vapor in a factory|3900|bc1,hz2,ft1,pc2|1-6|0|11/6/2
Canoeing accident|3450|bt1,bc1,ft1|1-2|0|6/2/0
Airport maintenance hangar fire|18150|arff2,pt2,bc4,mc1,fo2,ma1,hz2,wt1,ft6,pc3|1-2|0|15/2/3
Flooded subway station|7000|bc1,mc1,fl2,ft3,pc2|0-0|0|13/0/2
Police assistance directing traffic|950|pc1|0-0|0|0/0/1
Capsized boat on lake|3450|bt1,ft1|1-2|0|0/1/0
Lost hiker in forest|700|pc3|0-1|0|0/1/2
Sunstroke at Camping Site|0||1-1|0|0/2/0
Employee Trapped In Dairy Freezer|800|ft2|1-1|0|1/2/0
Employee Trapped in Cardboard Baler|800|ft2|1-1|0|1/2/0
Hand Laceration Caused By Malfunctioning Deli Slicer|1500|ft2|1-1|0|1/1/0
Bakery Oven Explosion In Supermarket|3000|bc1,ft2|1-6|0|6/1/0
Butcher Injured By Bandsaw Machine Malfunction|1500|ft2|1-1|0|1/1/0
Employee Slipped On Dropped Salmon|0||1-1|0|0/1/0
Hand Pierced By Sharp Catfish Bone|1500|ft2|1-1|0|1/1/0
Burns Caused By Seafood Steamer Malfunction|0||1-1|0|0/1/0
Crushed Foot Caused By Produce Cart Tip Over|0||1-1|0|0/1/0
Customer Severly Constipated In Supermarket Restroom|0||1-1|0|0/1/0
Cashier Brawl in Break Room|1800|pc3|2-12|10|0/1/3
Group Of Vagrants Slash Car Tires In Supermarket Parking Lot|8000|k92,sv1,pc12|0-0|10|0/0/6
Fired Employee Spills Cleaning Chemicals|2500|bc1,hz2,ft3,pc4|4-10|1|1/1/0
Fire in a lithium battery manufacturing factory|11500|pt3,bc3,mc1,fo2,ma1,hz2,wt2,hr2,ft12,pc6|0-0|0|20/1/6
Fire in an abandoned hospital|7500|pt1,bc2,ma1,wt1,hr1,ft4,pc2|0-0|0|8/0/2
Missing Person near water|3000|bt2,bc1,ph1,ft1,pc6|1-1|0|6/1/4
Searching for a drowned person in a lake|8400|bt4,bc1,k91,ph1,ft6,pc6|0-1|0|10/3/5
Police Search|1250|bt2,pc4|0-0|0|0/0/4
Escaped Prisoner trapped in Swamp|9400|bt3,k94,hr1,sv1,pc12|0-0|1|3/0/10
Bridge collapse Traps Prisoner Transport in River|11800|bt2,pt1,bc2,mc1,fd1,ma1,iv1,k94,hr2,sv1,sw1,ft5,pc10|0-10|20|13/10/13
Fleeing Suspect jumps off Bridge|2000|bt1,k92,pc2|0-0|1|0/0/6
Suspect trapped in flooded Basement|3800|bt1,wt1,k91,hr1,sv1,fl1,pc3|0-0|1|4/0/10
Pilot Distress - Plane crash lands into Water|7500|bt4,bc2,hz1,k92,hr1,sv1,sw2,ft4,pc6|5-30|6|6/5/12
Customer steals lottery tickets|700|pc1|0-0|1|0/0/1
Lawyer caught padding cases|900|pc1|0-0|1|0/0/1
Illegal firearms found in gun store raid|1800|fd3,pc2|0-0|2|0/0/5
Snowplow Accident|1200|hr1,ft1,pc1|0-1|0|4/1/1
Ice Fishing Rescue|900|ft1|1-1|0|1/1/0
Frozen Pipe Burst|3000|ft1|0-0|0|1/0/0
Internal Theft at Auto Parts Store|700|pc2|0-0|4|0/0/3
Stolen Armored Truck Crashes into Casino|5450|bc1,k91,sv1,ft4,pc10|0-0|0|6/0/8
Double Tractor Trailer Broken Down on Highway|1300|pc3|0-0|0|0/0/3
Driver on Phone slams into Car Carrier Semi Transport on Highway|4400|bc1,hr2,ft4,pc6|0-0|1|6/0/6
Semi-Truck Flipped in Ditch|2150|bc1,hr1,ft2,pc2|1-2|0|6/3/2
Garbage Truck set on Fire|4400|bc1,ft3,pc6|0-0|0|6/0/6
Passenger Train Crashes into Fire Truck stuck on Railroad Crossing|4530|bc2,tr2,ft4,pc4|15-25|0|8/10/3
Highspeed Pursuit ends in Suspect crashing into Supermarket causing Water Main Break|4530|pt1,bc1,ph1,hr2,sv1,fl1,ft4,pc8|2-15|0|8/6/6
Illegal substances found in Buffet Food|1200|pc3|6-20|6|0/6/4
Carbon monoxide poisoning in a school|8000|bc2,mc1,ma2,ft6,pc3|10-25|0|13/6/4
Tree on fire|1200|ft1|0-0|0|1/0/0
Tree Stump on fire|700|ft1|0-0|0|1/0/0
Fence fire|400|ft1|0-0|0|1/0/0
Hedge fire|900|ft2|0-0|0|2/0/0
Rookie Firefighter Uses The Q-Word|800|ft1|0-0|0|1/0/0
Person Trapped in Deep Well|2100|tr1,ft2,pc2|1-1|0|3/3/2
Runaway Diesel Locomotive Derailed|3600|fwk2,ft2,pc4|0-0|0|3/0/5
Massive Debris from Rockslide Stuck on Highway Trapping Drivers|15400|pt4,bc2,hr7,tr4,fwk4,ft10,pc8|15-40|0|3/3/2
Fire in a shopping center|11500|pt2,bc3,mc1,fo1,ma1,wt1,hr1,ft6,pc3|7-16|0|15/8/3
Worker fell from a roof, in cardiac arrest|1800|bc1,ft1,pc1|1-1|0|6/1/1
Dis-Masted sailing boat (inshore)|3000|cs1|0-0|0|0/0/0
Person suffers diabetic shock|500||1-1|0|0/1/0
Mountainbiker hit a tree|350||1-1|0|0/2/0
Grain dryer fires|9500|pt2,bc2,mc1,fo1,ma2,wt1,am1,hr1,ft4,pc2|0-0|0|15/1/2
Child fell from tree while playing|250||1-1|0|0/1/0
Search for Suspect in Woods|3100|k91,dn1,pc4|0-0|1|0/0/6
Search for Multiple Suspects in Woods|6500|k93,dn2,pc10|0-0|4|0/0/10
Search for Armed Suspect in Woods|4000|k91,dn1,pc5|1-3|1|0/3/7
Search for Multiple Armed Suspects in Woods|8800|k93,dn2,pc14|2-6|4|0/5/13
Search for Hidden Drug Lab|6400|fd6,k92,sv1,dn1,pc6|4-4|4|0/4/9
Crane fell over on construction site|1500|pt2,bc1,hr2,ft2,pc2|1-2|0|4/1/1
Trees blocking the roads after heavy storm|2000|bc1,hr3,ft4,pc5|0-0|0|4/0/2
Person falls out of window|0||1-1|0|0/1/0
Dine and dash|1400|pc1|0-0|1|0/0/2
Person trapped by the rising tide|5500|cs1|1-1|0|0/2/0
Unlawful residence report|850|pc2|0-0|1|0/0/4
Single Vehicle Road Traffic Collision (Exercise)|15000|bc1,am2,hr2,ft2,pc1|0-0|0|3/2/1
Vessel Taking on Water|5000|cs2|2-2|0|0/0/0
Collision between two buses|10300|bc3,mc1,hr4,fwk1,ft10,pc8|15-110|0|16/10/4
Mass influx of sick people - train station|5000|bc1,ma1,hr2,ft4,pc6|35-70|0|11/15/5
Lightning strike at event|3500|pt1,bc1,ft6,pc4|10-50|0|7/15/3
Tram derailed|2440|fwk1,ft3,pc4|25-50|0|3/12/4
Bridge collapse (major)|20115|bt5,pt4,bc5,mc1,hr5,tr2,fwk2,ft18,pc8|20-50|0|30/20/5
Possible Illegal Plantation (Aerial Thermal Imaging Required)|7000|dn1|0-0|0|0/0/5
Chain Collision in the tunnel|7000|bc2,mc1,ma1,hz1,wt1,hr3,ft6,pc3|0-14|0|13/7/2
Person in large enclosure|1180|pt1,ft1,pc1|1-1|0|3/2/2
Solar Park Fire|3320|pt2,bc1,wt3,ft1,pc2|0-0|0|4/2/2
Person trapped between platform and train|1600|bc1,hr1,ft2,pc1|1-1|0|5/3/1
Fire in Hardware Store (Medium)|7700|pt2,bc1,mc2,ma1,wt1,hr2,ft4,pc2|6-14|0|18/10/2
Fire in Hardware Store (Large)|13600|pt3,bc2,mc2,ma2,hz1,wt2,hr2,sv2,ft8,pc4|10-24|0|30/10/5
Rendezvous Ambulance|1000|pc2|1-1|0|0/10/2
Collision between Train and Concrete Mixer|12000|pt2,bc2,mc4,hz1,ph1,hr5,sv2,tr1,ft4,pc6|50-60|2|21/20/8
Helicopter crash|9000|arff1,bc1,mc1,hr1,ft8,pc5|2-6|0|15/6/6
Execution of an Interpol arrest warrant|7500|k93,ph1,sv1,pv1,dn1,pc4|0-0|3|0/0/10
Tachycardia|0||1-1|0|0/1/0
Powerline sparks fire on farmland|6000|bc1,ma1,hr2,ft3|1-1|0|6/3/2
Large Animal Rescue|2000|pt1,hr1,ft1|0-0|0|4/0/0
Grass Fire Near House|2500|br2,bc1,ft5|0-0|0|6/0/0
Roller Coaster Derailment (Minor)|5000|pt2,bc1,ft2,pc1|0-5|0|6/1/1
Roller Coaster Derailment (Moderate)|10000|pt3,bc2,mc1,hr2,tr1,ft5,pc3|2-10|0|9/2/2
Roller Coaster Derailment (Severe)|20000|pt4,bc4,mc1,hr4,sv1,tr2,ft8,pc3|5-25|0|12/6/7
Roller Coaster Derailment (Major)|40000|pt8,bc6,mc1,sv2,tr3,ft15,pc8|10-50|0|15/15/10
Snowplow overturned on rural road|3000|ft2,pc2|1-1|0|1/1/2
Dog running around on the highway|1000|pc1|0-0|0|0/0/1
Driver hit by loose truck wheel|3000|bc1,ft2,pc2|1-3|0|1/1/2
Parking Garage Collapse|1000|pt3,bc2,mc1,hr5,ft12|3-20|0|16/10/5
Fire in furniture shop|12270|pt3,bc3,mc1,fo1,ma2,hz1,wt4,ft4,pc5|0-4|0|23/8/6
Fire in stables|4500|pt1,bc2,hr1,ft6|0-0|0|6/0/0
Forest fire in high mountains|3600|br1,wt1|0-0|0|6/0/0
Fire at control tower|21500|arff4,pt2,bc4,mc1,fo1,ma1,hz1,wt1,ft8,pc4|4-12|0|15/6/3
Party centre on fire|10640|pt2,bc3,mc1,fo1,ma1,wt2,ft5,pc4|1-4|2|19/8/5
Person trapped under vehicle|3500|hr2,ft2,pc2|1-2|0|4/1/2
Smoke coming from company premises|5000|pt1,bc1,ft4,pc2|0-0|0|6/0/2
Sprained leg|0||1-1|0|0/1/0
Sprained arm|0||1-1|0|0/1/0
Sprained ankle|0||1-1|0|0/1/0
Fans fight at volleyball match|1600|am1,pc6|4-8|20|0/3/6
Truck overturned by strong winds|1760|bc1,hr1,ft2,pc2|0-2|0|0/2/2
Cyclist blown over by strong winds|0||1-1|0|0/1/0
Roof tiles loose in the gutter|840|pt1,ft1|0-0|0|3/0/0
Roof tiles loose on the roof|840|pt1,ft1|0-0|0|3/0/0
Gutter at risk of being blown off|840|pt1,ft1|0-0|0|3/0/0
Solar panels at risk of falling off the roof|840|pt1,ft1|0-0|0|3/0/0
Accidental spillage of chemical drums|10500|bc2,mc1,fo2,ma1,hz3,wt2,hr4,ft4,pc4|2-5|0|15/3/8
Major fire in a museum|12800|pt2,bc6,mc1,fo1,ma1,wt1,hr1,ft8,pc5|2-7|0|18/5/8
Oil spill|10200|pt2,bc2,mc5,hz2,k94,hr5,ft10,pc10|0-0|0|20/15/10
Fire at a magnesium manufacturing plant|23000|br1,pt2,bc6,mc1,fo1,ma1,hz2,wt1,am1,hr1,ft12,pc8|0-0|0|20/1/8
Fire and explosion in a propane warehouse|20000|br2,pt4,bc7,mc1,fo2,ma1,hz2,wt1,hr3,ft18,pc8|4-14|0|28/10/10
Fire in a photovoltaic panel manufacturing plant|16000|br2,pt2,bc6,mc1,fo1,ma1,hz2,hr2,ft10,pc6|2-12|0|15/10/6
Cleanup of areas damaged by fires of oil or chemical origin|6600|bc3,fo1,hz1,hr1,ft4,pc2|0-0|0|15/0/2
Preventive decontamination at high-risk hazardous materials facilities|8790|br2,bc2,fo1,hz2,am1,hr2,ft6,pc4|0-0|0|15/1/4
Player missing|1200|ph1,pc1|0-0|0|0/0/2
Out of control coach|900|pc2|0-0|2|0/0/2
Ticket forgery|700|pc1|0-0|1|0/0/1
Fire in inaccessible terrain|6800|br5,bc2,wt1,hr1,ft1,pc2|0-8|0|7/3/7
Washing machine on fire|1010|pt1,ft1,pc1|0-0|0|3/0/1
Dryer on fire|1010|pt1,ft1,pc1|0-0|0|3/0/1
Illegal opening of fire hydrants|600|ft1,pc1|0-0|0|1/0/1
Acute Behavioural Disturbance|2000|pc4|1-1|0|0/2/2
Glass shards in the eye|0||1-1|0|0/3/0
Lotto millionaire robbed|2000|pc3|0-0|3|0/0/2
Burglary in Auction House|2200|k91,pc2|0-0|3|0/0/6
Person falls into a silo and gets stuck|2200|am1,ft1,pc2|1-2|0|0/2/2
Lost child at the beach|2900|pc2|0-1|0|0/2/3
Fish sting on beach|850||1-1|0|0/1/0
Burned by barbecue|850||1-1|0|0/1/0
Jet ski near the coast|1000|cs1|0-0|0|0/0/0
Inspection of Automatic Fire Alarm System|4800|bc1,ft1|0-0|0|6/0/0
Tennis player hit in stomach by tennis ball|0||1-1|0|0/1/0
Skateboard accident|0||1-1|0|0/1/0
Fans fight at handball match|3800|pc4|4-8|15|0/3/4
Burn injury caused by welding work|0||1-1|0|0/1/0
Person trapped under construction work|500|hr1,ft1|0-0|0|4/0/0
Pursuit of a stolen car|2810|ph1,pc4|0-0|2|0/0/5
Splinter in the eye|0||1-1|0|0/1/0
Fire at a flea market|2500|bc1,ft2,pc2|0-2|0|6/1/2
Burglary at a museum|2000|k91,iv1,pc2|0-0|3|0/0/6
Burglary at a residential property|900|iv1,pc2|0-0|2|0/0/2
Anti-Money Laundering Operation|3000|k91,ph1,iv1,pc8|0-0|8|0/0/8
Organized insurance fraud uncovered|2600|iv1,pc2|0-0|0|0/0/4
Discovery of forged professional certificates|2200|iv1,pc1|0-0|0|0/0/3
Investigation into organized identity theft|3000|iv1,pc2|0-0|0|0/0/3
Witness intimidation before a court hearing|2400|iv1,pc3|0-0|0|0/0/5
Coordinated arrests in a major corruption investigation|5600|iv1,pc5|0-0|5|0/0/8
Home Invasion - Crime Scene|2000|csu1,pc1|0-0|0|0/0/2
Serial Burglary Investigation|2500|csu1,pc1|0-0|0|0/0/2
Evidence Found in Abandoned Vehicle|1500|csu1,pc1|0-0|0|0/0/2
Dryer vent fire in laundromat|1100|pt1,ft1|0-5|0|3/3/1
Burning substation (large)|2000|bc1,ft2,pc1|0-0|0|
Industrial fire (large)|5300|pt2,bc2,mc1,hz1,ft5|0-4|0|
Fleeing suspect on foot|3000|ph1,pc5|0-0|1|
Missing person search|4500|bc1,ph1,ft2,pc5|0-1|0|
High rise apartment fire|4000|pt2,bc2,mc1,ma2,wt1,hr1,ft5|4-7|0|
Aircraft engine fire|1200|arff2,bc1,ft2|0-0|0|2/0/0
Drug overdose|400|pc1|1-1|0|0/0/1
Office building fire|7000|pt4,bc2,mc1,ma1,wt1,hr2,ft10,pc3|0-0|0|15/0/3
Elevator rescue (office building)|400|any1,ft1|0-0|0|1/0/0
Stroke symptoms|0||1-1|0|
Animal rescue from roof|900|hr1,ft1|0-0|0|6/0/0
Ammonia leak|5000|bc1,mc1,ma1,hz1,hr1,ft4,pc3|0-10|0|13/0/2
Police vehicle pursuit|1000|k91,ph1,pc4|0-0|2|0/0/7
Hazmat truck fire in tunnel|6500|bc1,ma1,hz1,wt1,hr1,ft5,pc4|0-10|0|13/0/2
Hazmat truck fire|4000|bc1,hz1,wt1,hr1,ft5,pc2|0-4|0|11/0/2
Damaged roof|450|pt1,ft1|0-0|0|3/0/0
Swimmer in distress (river)|900|bt1,ft1|1-1|0|3/1/0
Acid burns|750|ft1,pc3|1-1|0|1/1/2
Money laundering inside restaurant|1700|fd3,iv1,pc2|0-0|3|0/0/0
Hunter accidentally injured trespasser|200|pc1|1-1|0|1/1/1
Train station collapse (small)|4000|bc1,hr2,ft4|0-5|0|8/5/0
Suspicious package found|800|k91,pc2|0-0|0|0/0/6
Biker fell off mountain road|0||1-1|0|0/1/0
Fuel spill in waterway (river)|3000|bc1,hz1,ft3|0-0|0|11/0/0
Fuel spill in waterway (lake)|3000|bt1,bc1,hz1,ft3|0-0|0|11/2/0
Injured person on scaffolding|700|pt1,hr1,ft2|1-1|0|1/1/0
Hidden branch of drug cartel|4500|fd7,pc5|0-6|12|0/0/3
Office used for black market firearms|2500|fd4,pc2|0-0|2|0/0/2
Branch of firearms black market|4500|fd5,pc5|0-6|12|0/0/3
Motocross accident|0||1-3|0|0/3/0
Airport terminal fire (medium)|7500|pt3,bc2,hr2,any4,ft6,pc4|2-10|0|10/6/3
Airport terminal fire (large)|9500|pt3,bc3,mc1,hr2,any4,ft10,pc4|10-20|0|13/10/3
Airport terminal fire (major)|14500|pt5,bc5,mc1,hz1,hr6,any4,ft14,pc5|20-30|0|13/15/3
Large cargo plane fire|15000|arff7,pt8,bc7,mc2,hz3,hr5,ft15,pc8|2-2|0|15/5/5
Illegal firearms factory|3500|fd8,pc5|0-0|6|0/0/5
Illegal firearms factory (major)|7500|fd15,pc8|0-0|12|0/0/10
CBRN explosion on cruise ship|40000|fd7,bo2,bt7,pt5,bc4,mc2,fi4,ma3,hz3,iv1,k92,fb3,pb2,hr5,ft22,pc21|50-100|0|25/35/10
Deep water search and rescue|4000|cs2,cht2|0-3|0|0/2/0
Illegal whaling vessel|8000|cs3|0-0|8|0/0/6
Multiple whaling vessels illegal operations|10000|cs9,cht2|0-0|24|0/0/14
Confined space rescue (small)|1500|hr1,any1,ft1|0-4|0|4/1/0
Collision with jackknifed semi|1000|pc2|0-0|0|0/0/1
Jackknifed semi (medium)|4700|pt1,bc1,hr2,ft6,pc6|0-10|0|6/3/2
Jackknifed semi (large)|14500|pt1,bc2,hr3,ft9,pc10|0-20|0|15/8/7
Jackknifed semi (major)|24000|pt2,bc3,mc1,hr4,ft11,pc17|0-30|0|18/12/10
Campsite gas canister explosion|9800|pt2,bc1,hz2,wt2,ft5,pc3|0-25|0|14/6/5
`;
