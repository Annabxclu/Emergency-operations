// Mission catalog: name ; credits ; fire stations ; ambulance stations ; police stations ; extras
// Station counts are how many of each you need before the call can appear.
// Extras name special units/extensions (count after a colon). Vehicle requirements are
// derived from these in missions.ts, so adjust there to rebalance everything at once.

export const CATALOG = `
Bin fire;110;1;0;0;
Container fire;170;1;0;0;
Burning car;370;1;0;0;
Burning motorbike;340;1;0;0;
Burning grass;200;1;0;0;
Room fire;1400;2;0;0;
Garden shed fire;600;2;0;0;
Burning leaves;210;1;0;0;
Bulk trash fire;220;1;0;0;
Bale of straw fire;250;1;0;0;
Tractor fire;600;1;0;0;
Burning callbox;240;1;0;0;
Tree on the road;310;1;0;0;
Burning truck;980;2;0;0;
Little field fire;1000;2;0;0;
Little wildfire;1010;1;0;0;
Caravan fire;1100;2;0;0;
Mailbox on fire;340;1;0;0;
Brush pile;700;1;0;0;
Burning trailer;650;1;0;0;
Basement fire;2500;3;0;0;
Roof fire;2700;3;0;0;
Grease fire;1200;3;0;0;
Burning bus shelter;900;3;0;0;
Road accident;1000;3;0;0;
Garage fire;1400;4;0;0;
Fireplace fire;1310;6;0;0;
Harvester fire;1200;6;0;0;
Wastebin fire;110;1;0;0;
Manhole fire;210;2;0;0;
Burning machine;2470;5;0;0;
Burning locomotive;1800;7;1;0;
Gas station fire;3920;11;0;0;
Dangerous goods truck accident;2200;11;1;0;
Tree on bikeway;310;1;0;0;
Burning substation;1900;4;0;0;
Burning substation (large);2000;4;0;5;
Person under tree;1000;6;5;0;
MVA rollover;3000;4;3;3;
Industrial fire (large);5300;11;2;0;
Partial building collapse;7300;5;3;0;
Trench rescue;2500;5;3;1;
Burning garbage truck;600;2;0;0;
Stuck climber;650;4;1;0;
Smoke detector check;400;8;0;0;
Freight train derailment;10000;15;3;3;
Barn fire;1800;7;0;0;
Chlorine leak;3500;12;6;0;
Fire in hospital;6000;10;6;0;
Accident involving a bus;1000;3;8;0;
Serious accident involving a bus;2000;5;8;2;
Large MVA in tunnel;7000;13;7;2;
Single vehicle fire in tunnel;1500;6;2;0;
Small boat fire;1250;6;0;0;wre
Natural gas odor;400;1;0;0;
Ammonia leak;5000;13;5;2;
Multiple vehicle fire in tunnel;5000;8;4;0;
Transformer fire;800;2;0;0;
Power plant fire;14500;25;10;2;
Factory fire minor;2000;8;2;0;
Factory fire major;9000;15;6;2;
Multiple vehicles on fire;3500;7;0;0;
Fire on farm medium;6000;13;0;0;
Fire on farm large;11000;16;0;0;
Scrapyard fire;5000;15;0;2;
Animal rescue from drain;275;1;0;0;
Museum fire;7500;13;0;2;
Residential fire;1750;6;2;2;
Cafeteria fire;1300;6;2;0;
School fire;6000;13;3;0;
Fire in fast food restaurant;1850;6;0;0;
Container ship fire;10000;13;3;0;fbd,rbd
Dock crane fire;6000;6;1;0;fbd
Recycling centre fire;10000;20;1;2;
Cruise ship sinking;15000;13;15;0;fbd,rbd
Sinking boat;1500;8;3;0;wre:2
Traffic accident with train;3000;10;2;2;
Animal rescue from roof;900;6;0;0;
Burst water main;1200;10;2;1;
Small flooding;550;9;1;0;
Medium flooding;1550;9;3;0;wre
Large flooding;2500;9;3;0;wre
Giant flooding;4000;14;5;3;wre:2
Light aircraft crash in water;4000;11;3;0;wre
Bridge collapse;7000;13;10;2;wre:2
Smoke in cabin;1200;2;0;0;airport
Braking overheat;900;2;0;0;airport
Aircraft engine fire;1200;2;0;0;airport
Large aircraft crash;6000;10;7;4;airport
Aircraft hijack;5000;2;10;10;
Light aircraft crash (airfield);2500;4;2;0;airport
Light aircraft crash;4000;13;2;0;
Landing gear failure;2000;11;0;0;airport
Airport terminal collapse (small);5000;13;5;0;airport
Airport terminal collapse (large);7000;20;10;2;airport
Airport terminal collapse (major);13100;30;20;3;airport
Shoplifting;100;0;0;1;
Parked car accident;120;0;0;1;
Metal burglary;150;0;0;1;
Pickpocketing;150;0;0;1;
Fare dodger;120;0;0;1;
Brawl;700;0;0;3;
Rioter;500;0;0;2;
Person check;100;0;0;3;
Obstruction of traffic;80;0;0;1;
Theft of property from vehicles;150;0;0;1;
Officer down;1500;0;0;6;
Prisoner escape;4000;0;0;7;heli
Fleeing suspect on foot;3000;0;0;4;heli
Warrant standby;2000;0;0;2;heli
Hostage taken;2000;0;1;8;
Active shooter;2800;0;2;9;heli
High-risk warrant;1400;0;0;9;
Drug warrant;1000;0;0;8;
Noise complaint;400;0;0;1;
Drug deal;1500;0;0;6;
Gas station robbery;1250;0;0;8;heli
Assassination threat;4400;0;0;8;
Keys locked in vehicle;300;0;0;1;
Cable theft;550;0;0;6;
Person with a weapon;2500;0;0;8;
VIP appearance;4000;0;0;15;heli
Search of a vehicle;1000;0;0;6;
Stolen credit card;400;0;0;1;
Parole violation;400;0;0;1;
Caller hangup;600;0;0;1;
Lost child;700;0;1;2;
DUI checkpoint;3600;0;0;6;
Aggressive passenger;600;0;0;1;
Bank robbery;1600;0;0;8;
Police vehicle pursuit;1000;0;0;7;heli
Kidnapping;2000;0;1;7;heli
Home invasion;1250;0;0;9;heli
Shots fired at officer;4100;0;1;10;heli
Animal attack;300;0;1;1;
Small violent protest;2200;0;2;6;
Medium violent protest;3000;0;3;7;heli
Drug overdose;400;0;2;1;
Stabbing;1500;0;4;6;
Shooting;1750;0;4;5;
Alcoholic intoxication;0;0;1;0;
Nosebleed;0;0;1;0;
Chest pains;0;0;3;0;
Acute asthma;0;0;3;0;
Seizure;0;0;3;0;
Fever;0;0;3;0;
Fallen person;0;0;1;0;
Diabetic problems;0;0;1;0;
Anaphylaxis;0;0;2;0;
Food poisoning;0;0;1;0;
Allergic reaction;0;0;1;0;
Child birth;0;0;1;0;
Stroke symptoms;0;0;1;0;
Unconscious person;0;0;1;0;
Hemorrhage;0;0;1;0;
Respiratory arrest;0;0;1;0;
Back pain;0;0;1;0;
Turbulence injury;0;0;3;0;
Powerline down;400;1;0;0;
Elevator rescue (office building);400;1;0;0;
Drug lab fire;3000;11;5;4;
Warehouse fire;10000;20;5;5;
Unknown tanker spill;4300;13;0;2;
Large unknown tanker spill;5300;15;0;2;
High rise apartment fire;4000;13;1;0;
Office building fire;7000;15;2;3;
Concert;9600;3;1;4;
Soccer game;4800;4;2;2;
Baseball game;6600;2;2;4;
Missing person search;4500;6;1;4;heli
Hazmat truck fire in tunnel;6500;13;5;2;
Hazmat truck fire;4000;11;2;2;
Full building collapse;10000;14;5;2;
Person hit by train;3000;8;1;2;
Electrical fire on subway tracks;1200;6;0;0;
ALPR checkpoint;4000;0;0;2;
Bulk hazardous storage tank leak (small);4000;11;3;1;
Bulk hazardous storage tank leak (large);6000;11;5;2;
Fire in subway station;3000;10;2;5;
Fire in subway station (large);7000;13;5;5;
Truck rear-ended with entrapment;1250;6;1;1;
Attempted homicide;1000;0;1;9;
Medical emergency on crane;950;8;1;0;
Possible infectious outbreak;0;0;1;0;
Mental health concern;200;0;1;1;
Car workshop fire;6000;14;2;2;
Car workshop fire with explosion;10000;18;6;4;
Patient transfer from flight;0;0;1;0;
Hotel fire small;3000;4;4;0;
Hotel fire medium;5000;6;8;0;
Hotel fire large;8000;10;10;3;
Hotel fire major;12000;20;15;6;
Small supermarket fire;1500;5;1;0;
Big supermarket fire;3000;8;3;2;
Bar fight;1000;0;1;3;
Damaged roof;450;3;0;0;
Unsafe cladding;450;3;0;0;
Unsafe scaffolding;450;3;0;0;
Sports hall fire;2000;9;2;0;
Landfill fire;3500;8;0;0;
Arm caught in industrial machine;800;4;1;0;
Person trapped under machine;1100;4;1;0;
Transient ischemic attack;0;0;1;0;
Vehicle fire in parking garage;1000;2;0;0;
Large parking garage fire;6000;12;4;2;
Museum robbery;1000;0;0;9;
Natural gas explosion;5000;13;7;0;
Large natural gas explosion;10000;13;15;3;
Swimmer in distress (river);900;3;1;0;wre
Unknown structure fire;110;1;0;0;
Electrical cupboard fire;300;2;0;0;
Smoking electrical equipment;300;1;0;0;
Storage cupboard fire;300;2;0;0;
Illegal goods smuggling;800;0;0;7;
Stowaways found;2000;1;5;7;
Customs search operation;1600;0;0;7;
Heatstroke;0;0;1;0;
Acid burns;750;1;1;2;
Hit and run;500;0;1;2;
Ceiling collapse;2000;6;4;0;
Electrocution;0;0;1;0;
Large brawl;2500;0;7;6;
Pepper spray discharged on train;1500;11;5;5;
Passenger train derailment (small);8000;10;15;2;
Passenger train derailment (large);11000;15;25;4;
Passenger train derailment (major);14000;30;40;10;
Bus in river;4000;6;6;1;wre
Chemistry accident at school;900;11;1;0;
Bus on fire;2000;6;6;0;
Subway collapse;12000;15;15;1;
Subway train on fire;5000;11;3;1;
Damaged tank car;950;11;0;0;
Tanker ship on fire;15000;20;10;2;fbd:2,rbd
Car vs tree;900;1;1;1;
Car vs tree (entrapment);900;4;1;1;
Protestors on runway;1200;1;3;4;
Sick person;0;0;1;0;
Panic button activation;1500;0;1;6;
Restraining order violation;300;0;0;1;
Vehicle crash - property damage;400;0;0;1;
Child locked in vehicle;1000;1;1;1;
Residential burglar alarm triggered;600;0;0;2;
Animal on the tracks;200;0;0;1;
Cooking fire;650;1;0;0;
Propane depot explosion;8000;15;2;2;
Choking;0;0;1;0;
Injured person on high voltage mast;650;4;1;0;
Large ferry fire;9000;13;8;0;fbd
Residential police raid;750;0;0;4;
Straw bale stack on fire;1500;8;0;0;
Injured free runner;400;4;1;0;
Cruise ship fire;9000;13;6;0;fbd
Vehicle lost its load;700;1;0;1;
Medium wildfire;4000;8;0;0;forestry:2
Large wildfire;6500;10;0;0;forestry:3
Major wildfire;10000;14;0;2;forestry:4
Medium controlled burn;1300;3;0;0;forestry
Large controlled burn;1800;6;0;0;forestry:3
Firebreak clearing;600;2;0;0;forestry:2
Lightning strike in forest;700;2;0;0;forestry
Plane off the runway;3000;8;1;0;airport
Off-road rescue;3000;5;1;0;forestry
SCUBA injury;600;0;3;0;
Boat leaking fuel;1000;8;0;0;fbd
Small earthquake;500;2;0;0;
Medium earthquake;1200;6;1;0;
Large earthquake;2100;10;3;0;
Major earthquake;3200;15;5;0;
Trespasser on tracks;900;0;0;7;
Small forest fire;2000;9;0;0;forestry
Cliff collapse on highway;7000;10;2;3;
Cabin fire;3000;9;4;0;forestry
Campsite fire;3000;9;2;0;forestry
Medium forest fire;5500;11;0;0;forestry:3
Large forest fire;8000;15;0;0;forestry:5
Major forest fire;11000;18;0;3;forestry:7
Fire watch;1600;2;0;0;forestry
Burning bus terminal;2000;6;6;0;
Traffic light failure;250;0;0;1;
Train station fire (small);4000;8;5;2;
Train station fire (medium);6000;12;8;4;
Pier on fire;5000;7;0;0;rbd
Panic attack;0;0;1;0;
Community engagement;1000;1;1;1;
Train station fire (large);10000;15;13;6;
Construction vehicle accident;950;9;1;0;
Medical emergency on ship;700;3;1;0;
Security check;650;0;0;7;
Car vs powerline;1000;4;2;2;
Subway train derailment;4000;10;7;1;
Electrocution from third rail;400;2;1;0;
Small wildfire;2000;3;0;0;forestry
Small controlled burn;800;2;0;0;forestry
Restaurant fire;5000;10;3;1;
Overturned tanker truck;3500;13;2;2;
Concussion;0;0;1;0;
Reported fraud;300;0;0;1;
Serve court order;150;0;0;3;
Serve eviction notice;150;0;0;3;
Eviction standby;900;0;0;7;
Office investigation;500;0;0;0;fed
Office used for crypto attacks;1600;0;0;0;fed:3
Office embedded in corruption;1900;0;0;0;fed:3
Cyber-criminal organization hideout;3600;0;0;0;fed:8
Restaurant investigation;500;0;0;0;fed
Money laundering inside restaurant;1700;0;0;0;fed:3
Criminal organization meeting;3700;0;0;0;fed:8
Notebook stolen from school;150;0;0;1;
Burglary in basement;400;0;0;1;
Property damaged;200;0;0;1;
Disturbance of peace;250;0;0;1;
Motorcycle accident;600;1;0;1;
Drunk driving;150;0;0;1;
Breakdown of vehicle;100;0;0;1;
Robbery;1200;0;0;6;
Domestic violence;750;0;0;2;
Bicycle stolen;150;0;0;1;
Safeguarding of musical parade;2000;0;0;2;
Horse riding accident with vehicle;1200;0;3;3;
Traffic surveillance;2500;0;0;3;
Petrol fraud;300;0;0;2;
Illegal gun withdrawal;1700;0;0;3;fed
Silent alarm triggered inside bank;500;0;0;2;
Warrant enforcement;550;0;0;3;
Wrong-way driver;1000;0;0;4;
Hunter accidentally injured trespasser;200;1;1;1;
Mass panic in discotheque;3500;0;10;9;
Abandoned luggage;150;0;0;1;
Small wildfire cleanup;700;0;0;0;forestry
Medium wildfire cleanup;2000;1;0;0;forestry:2
Large wildfire cleanup;4500;6;0;0;forestry:2
Major wildfire cleanup;9500;12;0;0;forestry:2
Carpentry workshop fire;4200;13;2;2;
Person stuck on playground equipment;500;1;1;0;
Train station collapse (small);4000;8;5;0;
Train station collapse (medium);6000;12;8;2;
Train station collapse (large);9800;15;13;3;
Train station collapse (major);15000;20;18;5;
Accident with chainsaw;400;0;1;0;
Burning freight car;1500;6;0;0;
Speed radar;2000;0;0;2;
Bird strike;1500;7;0;0;airport
Possible cannabis farm;1000;0;0;1;heli
Suspicious package found;800;0;0;6;
Suspicious person;300;0;0;1;
Arrhythmia;0;0;1;0;
Street market patrol;1500;0;0;1;
Object stuck in person;0;0;1;0;
Counterfeit goods raid;1200;0;0;4;
Debris on runway;350;1;0;0;
Landslide;1500;8;4;0;
Crushed person;600;4;1;0;
Biker fell off mountain road;0;0;1;0;
Major road block;6000;0;0;5;
Apartment fire in high rise;2000;8;6;0;
Transporter fell on side;800;6;2;0;
Illegal internet activity;500;0;0;0;fed
Chlorine exposure;2500;11;2;0;
Containment breach at lab;7500;13;5;2;
Agricultural chemical leak;3500;11;1;0;
Container leaking unknown substance;1500;11;0;0;
Aircraft leaking fuel;1500;11;0;0;airport
Radioactive exposure;2500;11;2;0;
Fuel spill in waterway (river);3000;11;0;0;
Fuel spill in waterway (lake);3000;11;2;0;wre
Cat stuck in tree;450;3;0;0;
Jewelry store robbery;800;0;0;2;
Glass shard embedded in hand;0;0;1;0;
Observation of a suspect;6000;0;0;2;
Welfare check;900;0;1;1;
Spinal injury;0;0;2;0;
Bomb explosion at chemical plant;35000;25;20;8;
Chemical in water;1200;11;0;0;wre
Injured person on scaffolding;700;1;1;0;
Investigate area for fire;500;0;0;0;forestry,fmo:2
Person started brushfire (small);600;1;0;1;forestry,fmo
Person started brushfire (large);1200;2;0;2;forestry:2,fmo:2
Illegal hunting;500;0;0;2;warden
Illegal fishing;500;0;0;2;warden
Animal smuggling;500;0;0;4;warden:2
Plant smuggling;500;0;0;4;warden:2
Short children excursion;500;0;0;1;warden
Long children excursion;1200;0;0;2;warden:2
Wilderness first aid;500;0;1;1;warden
Illegal immigration by water;1500;0;0;2;wpe
Suspicious boat;500;0;0;1;wpe
Drug smuggling by water;1500;0;0;4;fed,wpe
Weapon smuggling by water;1500;0;0;4;fed,wpe
Fighting on yacht;900;0;1;0;wpe
Underwater investigation;700;0;0;1;wpe
Underwater weapon stash;1500;0;0;0;fed,wpe
Underwater drug stash;1500;0;0;0;fed,wpe
Undefused naval mine;1800;0;0;0;fed,wpe,bomb
Undefused air bomb;1800;0;0;0;fed,wpe,bomb
Office used for drug marketing;2500;0;0;2;fed:3
Possible drug lab;1500;0;0;2;fed:2
Hidden branch of drug cartel;4500;0;0;3;fed:8
Office used for black market firearms;2500;0;0;2;fed:3
Branch of firearms black market;4500;0;0;3;fed:8
Person hit by a jet ski;1200;5;1;2;wre
Falling light pole;2500;7;3;0;
Biker fallen on country road;0;0;1;0;
Large STOP operation;6000;0;0;5;
Skyscraper fire;7500;10;6;5;
Illegal tapping of electricity;500;0;0;1;
Motocross accident;0;0;3;0;
Flat fire in sheltered housing;3500;8;1;0;
Car off bridge;1500;3;1;2;
Powerline struck by lightning;250;4;1;0;
Tornado touchdown in rural area;2500;4;6;4;
Tornado touchdown in urban area;10000;9;25;6;
Storm cleanup (large);4500;8;5;4;
Storm cleanup (major);8000;10;15;5;
Flood evacuation;3600;5;20;2;
Search and rescue;4800;5;8;2;
Blown over semi truck;1250;11;1;2;
Lightning strikes house;450;4;0;0;
Tornado watch;4400;5;0;4;
Porta potty tip over;1200;11;1;1;
Intoxicated passenger;400;0;0;1;
Inflatable swept out to sea;1200;0;1;0;rbd
Fire in storage room;850;3;0;0;
Illegal street racing;2400;0;0;3;
Suspicious person at fire site;2000;0;0;2;fmo
Accelerants found near fire source;2300;0;0;2;fmo
Possible insurance fraud;2500;0;0;2;fmo
Securing evidence after fire;2000;0;0;2;fmo
Destruction of public property;3200;0;0;3;fmo:3
Destruction of private property;2500;0;0;2;fmo:2
Explosion at an ATM;5000;5;4;8;fed:2
Serious injuries caused by glass;600;1;1;0;
Armed vehicle pursuit;2000;0;0;8;heli
Fall from small scaffolding;3500;6;4;4;
Fall from large scaffolding;7000;12;8;8;
Road cleanup;1000;4;0;1;
Fire at construction site;3000;6;4;0;
Semi hanging off bridge;2800;6;2;2;
Blocked fire exit complaint;1000;0;0;0;fmo
Boat crash;1600;0;2;1;wpe
Person slipped on wet leaves;0;0;1;0;
Road accident caused by fallen leaves;1000;4;3;2;
Person fell in pile of leaves;0;0;1;0;
Leaf vacuum out of control;400;0;1;1;
Storm drain clogged with leaves;300;1;0;0;
Hypothermia after swimming in cold water;0;0;1;0;
Accident on foggy road;800;4;2;0;
Deer crossing accident;1000;4;2;1;
Burning pile of leaves;320;2;0;0;
Flooded tunnel (small);2400;6;1;2;
Flooded tunnel (large);4500;6;4;4;
Twisted ankle;700;0;1;0;
Office robbery;1500;0;0;2;
Auto theft;1600;0;0;2;
Burning wind turbine;2100;3;0;2;
Aircraft emergency landing on roadway;2000;6;2;2;
Airport terminal fire (small);5500;6;3;2;
Cargo plane fire;12000;13;5;4;foam,airport:2
Building collapsed into water;12000;15;0;8;wre,wpe,fmo,rbd
Breakdown of public bus;500;0;0;1;
Illegal firearms factory;3500;0;0;5;fed
Animal stuck between walls;1300;4;0;0;
Car jacking;3500;0;0;5;
Cruise ship fire with explosion;18000;13;20;7;fed,wre,wpe,fbd,rbd
Container ship fire with explosion;22000;13;10;7;fed,wre,wpe,fbd,rbd
Tanker ship fire with explosion;30400;20;10;7;fed,wre,wpe,fbd:2,rbd
CBRN explosion on cruise ship;40000;25;35;10;fed:2,wre,wpe,fbd:3,rbd:2
Prisoner bus accident;2000;0;0;6;heli
Ranch fire;4500;7;0;0;forestry
Ambulance accident;1500;4;2;1;
Off-road vehicle collision;5000;4;0;2;warden,forestry
Drive by shooting;2000;0;4;5;heli
Out of control argument;900;0;0;2;
Hybrid vehicle fire;1500;1;1;1;
Crane collapse;4250;15;10;3;
Cargo plane fire with oil leak;15500;13;5;4;foam,airport
Strip mall fire (small);6000;7;5;1;
Strip mall fire (large);9000;10;15;1;
Fire truck accident;2000;2;4;2;
Abdominal pain;500;0;1;0;
Airplane crash in urban area;15000;7;10;2;foam,airport
Airplane crash in urban area with explosion;22500;10;10;5;fed,foam,airport
Medium cannabis grow operation;6000;0;0;2;heli,fed
Large cannabis grow operation;10000;0;0;4;heli,fed
Stolen police car;5000;0;0;5;heli
Driving under the influence of narcotics;900;0;1;4;
Mattress factory fire;10500;8;4;3;foam
Refinery fire (small);10000;10;5;5;foam
Refinery fire (medium);15000;12;6;6;foam
Refinery fire (large);22000;15;8;8;fed,foam:2
Refinery explosion (major);40000;25;15;15;fed,foam:3
Area evacuation;3500;0;2;10;
Post-fire environmental damage assessment;2500;2;0;2;warden:2,fmo:2
Overturned small vessel;8000;0;3;0;crs:3,chh:2
Overturned large vessel;14000;0;8;0;crs:8,chh:4
Drowning surfer;1000;0;1;0;crs
Missing vessel;7000;0;3;0;crs:4,chh:2
Oil rig fire;10000;8;6;0;crs:5,chh:4,fbd:2
Oil rig explosion;35000;20;16;0;crs:20,chh:5,fbd:6
Shark attack;1000;0;2;0;crs:2
Smuggling via boat;4000;0;0;2;crs:6,chh:2
Parasailing accident;2500;0;2;0;crs:5,chh:2
Deep water search and rescue;4000;0;2;0;crs:6,chh:2
Hostage rescue aboard cargo ship;8500;0;5;6;crs:10,chh:2
Illegal whaling vessel;8000;0;0;6;crs:7
Sailors trapped in capsized naval vessel;9000;0;3;0;crs:7,chh:2
Distressed yacht caught in hurricane;5000;0;3;0;crs:6,chh:2
Oil tanker on fire in ocean;15000;12;10;0;crs:12,chh:6,fbd:4
Stalker;500;0;0;1;
Multi vehicle pile-up;3000;4;3;4;
Multi vehicle pile-up (large);6000;5;4;6;
Jetbridge collapse (small);3000;5;3;0;
Jetbridge collapse (large);6000;7;5;0;
Faulty heating boiler;400;1;1;0;
Carbon monoxide leak (small);1100;5;2;0;
Carbon monoxide leak (large);4700;11;5;0;
Carbon monoxide leak (major);9500;15;10;0;
Sports fan brawl (small);3000;0;5;4;
Sports fan brawl (medium);6000;0;8;7;
Sports fan brawl (large);9500;0;10;10;
Arborist accident;500;1;1;0;
Person pinned under tank trailer;1000;11;1;0;
Methane leak;1000;3;1;1;
Methane fire;4000;6;2;2;foam
Methane explosion;9000;10;4;4;foam:2
Sinkhole - no damage;750;6;0;1;
Sinkhole - person injured;1500;6;2;1;
Vehicle fallen into sinkhole;2000;6;2;1;
Sinkhole - structural damage;2750;6;2;1;
Light aircraft crash in wildland;6500;11;1;1;forestry
Large aircraft crash in wildland;6500;11;10;7;forestry:2,foam
Confined space rescue (small);1500;4;1;0;
Collision with jackknifed semi;1000;0;0;1;
Jackknifed semi (medium);4700;6;3;2;
Jackknifed semi (large);14500;15;8;7;
Jackknifed semi (major);24000;18;12;10;
Post-surgical complications;0;0;1;0;
Power plant fire - major;22500;30;12;8;foam
Power plant fire - explosion;37500;33;15;9;foam:2
Power plant fire - CBRNE;45000;40;20;15;foam:2
Library fire (small);2250;1;1;0;
Library fire (medium);6500;7;2;0;
Library fire (large);10000;10;10;1;
Library fire (major);20000;14;20;7;
Train fire with flammable products;4300;13;0;2;
Switchboard fire;500;1;0;0;
Campsite gas canister explosion;9800;14;6;5;
Peaceful demonstration (small);5000;0;0;6;
Peaceful demonstration (large);10000;0;0;6;
Conflagration (small);3000;6;0;2;
Conflagration (medium);8000;7;3;7;
Conflagration (large);13000;13;10;10;
Conflagration (major);20000;16;25;15;
Boat at anchor in protected area;1200;0;0;0;crs:2
Jetski out of fuel;1200;0;0;0;crs
Kayakers blown off course;1200;0;0;0;crs
Boat lost mast;1200;0;0;0;crs
Dam threatens to break;12500;15;0;5;wre:2,heli,forestry
Dam break;35500;25;10;8;wre:4,heli,forestry:3
Smoke sighting;1600;4;0;0;forestry
Small rapid wildfire;1500;6;0;0;forestry:3
Medium rapid wildfire;2900;10;0;0;forestry:4
Large rapid wildfire;7550;10;0;0;forestry:5
Major rapid wildfire;13200;10;0;0;forestry:6
Institutional fire drill;1000;1;0;0;
Industrial fire drill;3000;1;0;0;
Fire line requested;1000;6;0;0;forestry:3
MVA rollover - ejection;4000;4;4;4;
Burst tire - aircraft;750;6;1;0;airport
Sports stadium collapse;45000;50;30;10;
College sports stand collapse;35000;30;25;10;
Restaurant food theft;1250;0;1;1;
Traffic light monitoring;300;0;0;1;
Tanker truck fire;4500;11;1;0;
Tanker truck explosion (small);9000;13;1;1;
Tanker truck explosion (medium);13500;16;2;3;
Tanker truck explosion (large);18000;20;10;7;foam
Tanker truck explosion (major);26000;25;20;10;foam:2
Animal rescue from water;1000;2;0;1;wre:2,warden:2
Armed foot pursuit;3500;0;1;8;heli
Self-service laundry fire;6000;13;2;1;
Pipeline leak;3500;11;3;1;
Pipeline fire;7000;13;3;1;
Subterranean pipeline fire;9500;13;3;1;
Pipeline explosion;18500;18;15;7;foam:2
Commercial aircraft runway incursion;50000;50;40;10;fed:2,foam,airport:3
Empty commercial plane fire;8400;14;0;8;foam,airport
Plane engine fire;2400;6;0;4;foam,airport
Protesters stuck on monument;2000;6;2;6;
Train collision;16000;10;15;10;
Scooter accident;1500;2;1;1;
Impalement on fence;1500;4;1;1;
Nuclear explosion at power plant;45000;60;30;25;foam:6
Supervision of risky sports match;9500;0;0;8;riot:2,det
Escort of risky fans;17000;0;0;14;heli,riot:3,det:2
Clash of risky fans;23000;0;8;18;heli,riot:4,det:4
Crowd control;3500;0;0;8;riot
Kidnapped politician;13000;0;0;7;riot
School bomb threat;12500;0;0;9;bomb,riot:2
Large violent protest;12500;0;0;8;riot:3,det
Monitoring of small strike;2800;0;0;3;riot,det
Monitoring of a large strike;5600;0;1;8;riot:5,det
Paraglider rescued from tree;1300;4;5;2;
Fire at a bus depot;7200;14;6;2;foam
Highway construction demonstration;10500;0;0;4;
Motorcycle hits pedestrian;2000;6;5;1;
Camping car fire;4000;6;2;2;foam
Aquarium fire alarm triggered;2500;6;1;2;
Fire in aquarium;16000;10;10;10;foam:2
Explosion in an aquarium park;24000;15;6;5;foam:2
Fire in a cell;4500;6;1;2;
Fire in a prison;14500;13;4;5;foam:2
Flooded basement;1200;4;0;0;flood
Flooding in a small house;950;4;0;0;flood
Flooding in a big house;2120;4;0;0;flood
Flooding in a neighborhood;3220;7;0;0;flood
Major flooding in a neighborhood;9500;9;0;0;flood:2
Rising waters of the canal;17500;20;0;5;flood:4
Flooded mall;6200;8;0;0;flood:2
Fire in automobile manufacturing plant;16500;18;6;6;foam:3
Sailing ship adrift;6550;0;0;0;crs:6
Mass crushing at a festival;11500;10;50;15;riot:2
Sauna on fire;2500;6;0;0;foam
National archives fire;7000;13;0;0;foam
Fire in a fertilizer storage building;27500;22;13;8;foam:2
Lack of oxygen onboard;4480;0;10;0;crs,chh
Car off embankment;2500;5;3;1;
Children trapped in sewer;2000;5;3;1;
Emergency brake on the train;7300;9;3;2;
Child stuck in tree;340;3;1;0;
Child swallows cleaning supply;500;0;1;1;
Child stuck in climbing frame;1420;6;1;1;
Argument in a shopping center;1500;0;0;2;
Truck accident - animal transport;3000;6;2;2;
Fire of precarious installations;3000;6;3;2;
Explosive devices in a vehicle;4500;6;1;8;bomb
Suspicious device on plane;5700;6;1;10;bomb,airport
Dog escapes from shelter;850;0;0;1;
Unclear accident in a school;500;0;1;0;
Vehicle into gas station rack;2900;10;5;8;
Two vehicle accident on highway;5600;15;10;8;
Overturned tractor;3200;6;1;2;
Traffic fight;1640;0;0;2;
Traffic fight escalates;3955;0;0;2;
Car fire on highway;1230;6;0;2;
Hunting accident;5000;1;2;0;
Fire on a cruise ship at the dock;20500;20;15;10;wre:2,foam:2,fbd,rbd
Chemical leak in hospital lab;9000;15;6;6;
Forest fire exercise;24000;10;0;2;forestry:3
Vehicle repossession;700;0;0;0;tow
Vehicle repossession gone wrong;1200;0;0;2;tow
Disabled car on roadway;700;0;0;0;tow
Car ran out of gas;700;0;0;0;tow
Abandoned vehicle on roadside;900;0;0;0;tow
Flat tire;700;0;0;0;tow
Fire in a barbecue pit;6250;10;5;7;foam
Fire in a paper mill;100;1;0;0;
Smoke inhalation poisoning;1150;6;2;2;
Assault in a hypermarket;1150;0;0;3;
Fire in a town hall;8850;15;5;5;foam
Passenger vehicle embedded in home;3000;6;7;2;
Food truck fire;1500;6;0;1;
Windsurfer and swimmer collision;2500;0;2;0;crs
Fishing boat in distress;14000;0;2;0;crs:2,chh:2
Fire in an abandoned pizzeria;7000;12;2;2;
Factory equipment fire;14500;15;1;4;
Chemical vapor release in factory;3900;11;6;2;
Canoeing accident;3450;6;2;0;wre
Airport maintenance hangar fire;18150;15;2;3;foam:2,airport:2
Flooded subway station;7000;13;0;2;foam,flood:2
Police directing traffic;950;0;0;1;
Employee trapped in dairy freezer;800;1;2;0;
Employee trapped in cardboard baler;800;1;2;0;
Hand laceration (deli slicer);1500;1;1;0;
Bakery oven explosion;3000;6;1;0;
Butcher injured (bandsaw);1500;1;1;0;
Employee slipped on dropped salmon;0;0;1;0;
Burns from seafood steamer;0;0;1;0;
Cashier brawl in break room;1800;0;1;3;
Vagrants slash car tires;8000;0;0;6;tow:12
Fired employee spills chemicals;2500;1;1;0;
Lithium battery factory fire;11500;20;1;6;foam:2
Fire in an abandoned hospital;7500;8;0;2;
Missing person near water;3000;6;1;4;wre,heli
Drowned person in lake;8400;10;3;5;wre:2,heli
Police search on the water;1250;0;0;4;wre:5
Escaped prisoner trapped in swamp;9400;3;0;10;wre:2
Bridge collapse with prisoner transport;11800;13;10;13;wre:2,fed
Fleeing suspect jumps off bridge;2000;0;0;6;wre
Suspect trapped in flooded basement;3800;4;0;10;wre:2,flood
Plane into water - pilot distress;7500;6;5;12;wre:3
Customer steals lottery tickets;700;0;0;1;
Lawyer caught padding cases;900;0;0;1;
Illegal firearms gun store raid;1800;0;0;5;fed
Internal theft at auto parts store;700;0;0;3;
Armored truck crashes into casino;5450;6;0;8;rot
Double tractor trailer broken down;1300;0;0;3;rot:2
Cement truck flipped into ditch;1800;6;0;3;rot
Car carrier semi collision;4400;6;0;6;tow:3,rot
Charter bus out of fuel;500;0;0;0;rot
Semi-truck flipped in ditch;2150;6;3;2;rot
Garbage truck set on fire;4400;6;0;6;rot
School bus breaks down;600;0;0;0;rot
Tow truck out of fuel;400;0;0;0;tow
Passenger train into fire truck;4530;8;10;3;tech:2,rot
Pursuit into supermarket and water main;4530;8;6;6;heli,flood,tow
Scare prank heart attack;650;0;1;1;
Illegal substances in buffet food;1200;0;6;4;
Carbon monoxide poisoning in school;8000;13;6;4;
Tree on fire;1200;1;0;0;
Tree stump on fire;700;1;0;0;
Fence fire;400;1;0;0;
Hedge fire;900;2;0;0;
Person trapped in deep well;2100;3;3;2;tech
Runaway diesel locomotive derailed;3600;3;0;5;crane:2
Rockslide debris on highway;15400;3;3;2;dre:3,tech:4,tow:8,rot:4,crane:4
Fire in a shopping center;11500;15;8;3;foam
Worker fell from roof;1800;6;1;1;
Dismasted sailing boat;3000;0;0;0;crs
Person suffers diabetic shock;500;0;1;0;
Mountain biker hit a tree;350;0;2;0;
Grain dryer fire;9500;15;1;2;foam
Child fell from tree;250;0;1;0;
Search for suspect in woods;3100;0;0;6;drone
Search for multiple suspects in woods;6500;0;0;10;drone:2
Search for armed suspect in woods;4000;0;3;7;drone
Search for multiple armed suspects;8800;0;5;13;drone:2
Search for hidden drug lab;6400;0;4;9;fed:2,drone
Crane fell over on construction site;1500;4;1;1;
Trees blocking roads after storm;2000;4;0;2;
Person falls out of window;0;0;1;0;
Dine and dash;1400;0;0;2;
Person trapped by rising tide;5500;0;2;0;crs
Unlawful residence report;850;0;0;4;
Single vehicle collision exercise;15000;3;2;1;
Vessel taking on water;5000;0;0;0;crs:3
Collision between two buses;10300;16;10;4;dre,crane
Mass influx of sick people at train station;5000;11;15;5;dre
Lightning strike at event;3500;7;15;3;dre
Tram derailed;2440;3;12;4;crane
Bridge collapse (major);20115;30;20;5;wre:4,dre:4,tech,crane:2
Possible illegal plantation;7000;0;0;5;drone
Chain collision in the tunnel;7000;13;7;2;
Person in large enclosure;1180;3;2;2;
Solar park fire;3320;4;2;2;
Person trapped between platform and train;1600;5;3;1;
Fire in hardware store (medium);7700;18;10;2;forestry
Fire in hardware store (large);13600;30;10;5;forestry
Rendezvous ambulance;1000;0;10;2;
Train vs concrete mixer;12000;21;20;8;heli,forestry,tech:2
Helicopter crash;9000;15;6;6;airport
Interpol arrest warrant;7500;0;0;10;heli:2,det,drone
Tachycardia;0;0;1;0;
Powerline sparks farmland fire;6000;6;3;2;
Large animal rescue;2000;4;0;0;
Grass fire near house;2500;6;0;0;forestry
Roller coaster derailment (minor);5000;6;1;1;
Roller coaster derailment (moderate);10000;9;2;2;tech
Roller coaster derailment (severe);20000;12;6;7;tech
Roller coaster derailment (major);40000;15;15;10;tech:2
Dog running on highway;1000;0;0;1;
Driver hit by loose truck wheel;3000;1;1;2;
Parking garage collapse;1000;16;10;5;
Fire in furniture shop;12270;23;8;6;foam
Fire in stables;4500;6;0;0;
Skiing accident;4000;0;0;0;tech
Hikers stranded on mountaintop;3600;0;0;0;tech:2
Small avalanche;5600;0;1;0;tech:2
Fall of serac;7500;0;3;0;tech:3
Hiker in distress due to bad weather;1450;0;0;0;tech
Forest fire in high mountains;3600;6;0;0;forestry,tech
Mountain biker hit a tree on a snow road;1400;0;2;1;tech:2
Moderate avalanche;14000;0;3;0;tech:3
Climbing accident;2850;0;0;0;tech:3
Fire at control tower;21500;15;6;3;foam:2,airport:2
Party centre on fire;10640;19;8;5;foam
Person trapped under vehicle;3500;4;1;2;
Smoke coming from company premises;5000;6;0;2;
Sprained leg;0;0;1;0;
Sprained arm;0;0;1;0;
Sprained ankle;0;0;1;0;
Fans fight at volleyball match;1600;0;3;6;
Fans fight at basketball game;1600;0;3;6;
Truck overturned by strong winds;1760;6;2;2;
Cyclist blown over by strong winds;0;0;1;0;
Roof tiles loose;840;3;0;0;
Gutter at risk of being blown off;840;3;0;0;
Solar panels at risk of falling off the roof;840;3;0;0;
Accidental spillage of chemical drums;10500;15;3;8;foam:4
Major fire in a museum;12800;18;5;8;foam:2
Oil spill;10200;20;15;10;dre:3
Fire at a magnesium manufacturing plant;23000;20;1;8;foam
Fire and explosion in a propane warehouse;20000;28;10;10;foam:2
Fire in a photovoltaic panel plant;16000;15;10;6;foam:2
Cleanup after oil or chemical fires;6600;15;0;2;foam
Preventive decontamination at hazmat facility;8790;15;1;4;foam
Fire in inaccessible terrain;6800;7;3;7;warden,forestry:2
Washing machine on fire;1010;3;0;1;
Dryer on fire;1010;3;0;1;
Acute behavioural disturbance;2000;0;2;2;
Glass shards in the eye;0;0;3;0;
Lotto millionaire robbed;2000;0;0;2;
Burglary in auction house;2200;0;0;6;
Person stuck in a silo;2200;0;2;2;
Lost child at the beach;2900;0;2;3;
Fish sting on beach;850;0;1;0;
Burned by barbecue;850;0;1;0;
Jet ski near the coast;1000;0;0;0;crs
Inspection of automatic fire alarm system;4800;6;0;0;
Tennis player hit by tennis ball;0;0;1;0;
Skateboard accident;0;0;1;0;
Fans fight at handball match;3800;0;3;4;
Burn injury from welding work;0;0;1;0;
Person trapped under construction work;500;4;0;0;
Pursuit of a stolen car;2810;0;0;5;heli
Splinter in the eye;0;0;1;0;
Fire at a flea market;2500;6;1;2;
Burglary at a museum;2000;0;0;6;csi
Burglary at a residential property;900;0;0;2;csi
Anti-money laundering operation;3000;0;0;8;csi,heli
Organized insurance fraud uncovered;2600;0;0;4;csi
Forged professional certificates;2200;0;0;3;csi
Organized identity theft investigation;3000;0;0;3;csi
Witness intimidation before court hearing;2400;0;0;5;csi
Coordinated arrests in corruption case;5600;0;0;8;csi
Home invasion crime scene;2000;0;0;2;csi
Serial burglary investigation;2500;0;0;2;csi
Evidence found in abandoned vehicle;1500;0;0;2;csi
Dryer vent fire in laundromat;1100;3;3;1;
`;
