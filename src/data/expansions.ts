// MissionChief "expansion missions": when a call is finished, a bigger one can come in at the
// same address. From expansion_missions_ids in https://www.missionchief.com/einsaetze.json
// (scripts/mc-expansions.txt). Format: mission|bigger mission|bigger mission...
export const EXPANSIONS = `
Burning car|Garage fire|Caravan fire|Burning trailer
Burning motorbike|Garage fire
Burning grass|Little field fire|Grass Fire Near House
Room fire|Partial Building Collapse
Burning leaves|Little field fire
Bulk trash fire|Basement fire|Roof fire|Commercial Fire|Industrial Fire|Garden shed fire
Bale of straw fire|Little field fire|Garden shed fire
Tractor fire|Harvester fire
Tree on the road|Road accident
Little field fire|Little wildfire|Large Field Fire
Little wildfire|Small Wildfire
Chimney fire|Roof fire
Roof fire|Industrial Fire|Commercial Fire
Grease Fire|Commercial Fire
Road accident|Burning bus shelter|Burning car|Dangerous goods truck accident|Large Unknown Tanker Spill|MVA Rollover - Ejection
Gas Leak|Road accident|Dangerous goods truck accident
Wastebin fire|Burning truck
Brawl|Large brawl
Rioter|Brawl
MVA Rollover|Road accident|MVA Rollover - Ejection
Industrial Fire|Mattress Factory Fire
Commercial Fire|Strip Mall Fire (Small)|Strip Mall Fire (Large)
Small Violent Protest|Medium Violent Protest
Medium Violent Protest|Active Shooter|Large Violent Protest
Smoke Investigation|Residential Fire
Small flooding|Medium flooding
Medium flooding|Large flooding
Large flooding|Giant flooding
Burst water main|Medium flooding
Shots fired at Officer|Active Shooter
Container Ship Fire|Container ship fire with explosion
Kidnapping|Hostage Taken
Traffic accident with train|Freight Train Derailment
Single vehicle fire in tunnel|Multiple vehicle fire in tunnel
Kitchen Fire|Residential Fire
Person with a weapon|Armed Foot Pursuit
Power Plant fire|Power Plant Fire - Major
Fire on farm medium|Fire on farm large
Landing Gear failure|Large Aircraft Crash
Hotel fire small|Hotel fire medium
Hotel fire medium|Hotel fire large
Hotel fire large|Hotel fire major
Vehicle fire in parking garage|Large parking garage fire
Museum robbery|Hostage Taken|Active Shooter
Natural Gas explosion|Full Building Collapse|Partial Building Collapse
Large Natural Gas explosion|Full Building Collapse|Partial Building Collapse
Unknown structure fire|Residential Fire|Commercial Fire|Kitchen Fire|Room fire|Electrical Cupboard Fire|Smoking Electrical Equipment|Storage Cupboard Fire|Fireplace fire|Roof fire
Ceiling Collapse|Partial Building Collapse
Passenger train derailment (Small)|Passenger train derailment (Large)
Passenger train derailment (Large)|Passenger train derailment (Major)
Chemistry accident at school|School fire
Tanker ship on fire|Tanker ship fire with explosion
Car vs tree|Car vs tree (entrapment)
Vehicle Crash - Property Damage|Truck in House Wall|Vehicle Accident - Entrapment|Accident Involving a Bus|Hit and Run
Cooking fire|Kitchen Fire
Cruise ship fire|Cruise ship fire with explosion
Medium Wildfire|Large Wildfire
Large Wildfire|Major Wildfire
Medium Controlled Burn|Large Controlled Burn
Lightning Strike in Forest|Small forest fire
Plane off the runway|Large Aircraft Crash
Small Earthquake|Large Earthquake|Medium Earthquake|Major Earthquake
Large Earthquake|Major Earthquake
Medium Earthquake|Large Earthquake|Major Earthquake
Trespasser on Tracks|Person Hit by Train
Small forest fire|Medium forest fire
Cabin fire|Medium Wildfire|Large Wildfire|Major Wildfire|Medium Controlled Burn|Large Controlled Burn|Small forest fire
Campsite fire|Medium Wildfire|Large Wildfire|Major Wildfire|Medium Controlled Burn|Large Controlled Burn
Medium forest fire|Large Forest Fire
Large Forest Fire|Major Forest Fire
Train station fire (small)|Train station fire (medium)
Train station fire (medium)|Train station fire (Large)
Small Wildfire|Medium Wildfire
Small Controlled Burn|Medium Controlled Burn
Robbery|Hostage Taken|Active Shooter
Wrong-way driver|Collision with Jackknifed Semi-Trailer (Small)
Bird strike|Large Aircraft Crash
Possible Cannabis Farm|Drug Warrant|Medium Cannabis Grow Operation
Apartment fire in High Rise|High Rise Fire
Illegal internet activity|Office used for crypto attacks|Cyber-Criminal organization hideout
Burning cake in oven|Kitchen burning down
Storm cleanup (large)|Storm cleanup (major)
Cargo Plane Fire|Cargo plane fire with oil leak
Car Jacking|Vehicle Pursuit|Armed Vehicle Pursuit
Cruise ship fire with explosion|Cruise ship fire & explosion with hull breach
Container ship fire with explosion|Container ship fire & explosion with hull breach
Tanker ship fire with explosion|Tanker ship fire & explosion with hull breach
Ranch fire|Small Wildfire
Drive by shooting|Armed Vehicle Pursuit
Out of control argument|Brawl|Officer Down|Disturbance of peace
Strip Mall Fire (Small)|Strip Mall Fire (Large)
Airplane Crash in Urban Area|Airplane Crash in Urban Area with Fire|Airplane Crash in Urban Area with Explosion
Airplane Crash in Urban Area with Fire|Airplane Crash in Urban Area with Explosion
Medium Cannabis Grow Operation|Large Cannabis Grow Operation
Driving Under The Influence of Narcotics|Fleeing Suspect|Collision with Jackknifed Semi-Trailer (Small)
Refinery Fire (Small)|Refinery Fire (Medium)
Refinery Fire (Medium)|Refinery Fire (Large)
Refinery Fire (Large)|Refinery Fire (Major)
Refinery Fire (Major)|Refinery Explosion (Major)
Stalker|Fleeing Suspect|Hostage Taken|Stabbing|Shooting|Shots fired at Officer|Person with a weapon|Caller Hangup|Home Invasion|Attempted Homicide|Residential burglar alarm triggered|Burglary in basement
Multi Vehicle Pile-up|Multi Vehicle Pile-up (Large)
Jetbridge Collapse (Small)|Jetbridge Collapse (Large)
Faulty Heating Boiler|Carbon Monoxide Leak (Small)
Carbon Monoxide Leak (Small)|Carbon Monoxide Leak (Large)
Carbon Monoxide Leak (Large)|Carbon Monoxide Leak (Major)
Sports Fan Brawl (Small)|Sports Fan Brawl (Medium)
Sports Fan Brawl (Medium)|Sports Fan Brawl (Large)
Methane Leak|Methane Fire
Methane Fire|Methane Explosion
Sinkhole - No Damage|Sinkhole - Person Injured|Sinkhole - Roadway Damaged|Vehicle Fallen Into Sinkhole|Sinkhole - Structural Damage
Sinkhole - Person Injured|Sinkhole - Roadway Damaged|Vehicle Fallen Into Sinkhole|Sinkhole - Structural Damage
Sinkhole - Roadway Damaged|Vehicle Fallen Into Sinkhole|Sinkhole - Structural Damage
Vehicle Fallen Into Sinkhole|Sinkhole - Structural Damage
Sinkhole - Structural Damage|Full Building Collapse|Partial Building Collapse
Collision with Jackknifed Semi-Trailer (Small)|Collision with Jackknifed Semi-Trailer (Medium)
Collision with Jackknifed Semi-Trailer (Medium)|Collision with Jackknifed Semi-Trailer (Large)
Collision with Jackknifed Semi-Trailer (Large)|Collision with Jackknifed Semi-Trailer (Major)
Power Plant Fire - Major|Power Plant Fire - Explosion
Power Plant Fire - Explosion|Power Plant Fire - CBRNE
Library Fire (Small)|Library Fire (Medium)
Library Fire (Medium)|Partial Building Collapse|Library Fire (Large)
Library Fire (Large)|Full Building Collapse|Library Fire (Major)
Conflagration (Small)|Conflagration (Medium)
Conflagration (Medium)|Conflagration (Large)
Conflagration (Large)|Conflagration (Major)
Dam threatens to break|Dam break
Smoke Sighting|Small forest fire|Small Wildfire|Small Controlled Burn
Small Rapid Wildfire|Medium Rapid Wildfire
Medium Rapid Wildfire|Large Rapid Wildfire
Large Rapid Wildfire|Major Rapid Wildfire
Fire Line Requested|Medium Rapid Wildfire
Tanker Truck Fire|Tanker Truck Explosion (Small)
Tanker Truck Explosion (Small)|Tanker Truck Explosion (Medium)
Tanker Truck Explosion (Medium)|Tanker Truck Explosion (Large)
Tanker Truck Explosion (Large)|Tanker Truck Explosion (Major)
Armed Foot Pursuit|Shots fired at Officer
Self-Service Laundry Facility Fire|Strip Mall Fire (Large)
Pipeline Leak|Pipeline Fire
Pipeline Fire|Subterranean Pipeline Fire
Subterranean Pipeline Fire|Pipeline Explosion
Large Violent Protest|Active Shooter
Camping Car Fire|Campsite fire
Aquarium Fire Alarm Triggered|Fire in Aquarium
Fire in Aquarium|Explosion in an aquarium park
Fire in a cell|Fire in a Prison
Flooding in a small house, following bad weather|Flooding in a neighborhood following bad weather
Flooding in a big house, following bad weather|Flooding in a neighborhood following bad weather
Flooding in a neighborhood following bad weather|Major flooding in a neighborhood following bad weather|Rising waters of the canal (Flood)
Major flooding in a neighborhood following bad weather|Rising waters of the canal (Flood)
Fire on a cruise ship at the dock|Cruise ship fire with explosion
Fire in Hardware Store (Medium)|Fire in Hardware Store (Large)
Grass Fire Near House|Little field fire|Little wildfire|Large Field Fire|Medium Wildfire|Large Wildfire|Major Wildfire|Residential Fire|Cabin fire|Small Wildfire
Roller Coaster Derailment (Minor)|Roller Coaster Derailment (Moderate)
Roller Coaster Derailment (Moderate)|Roller Coaster Derailment (Severe)
Roller Coaster Derailment (Severe)|Roller Coaster Derailment (Major)
Parking Garage Collapse|Large parking garage fire
Smoke coming from company premises|Fire in an Office Building
`;

export const EXPANSION_CHANCE = 0.15;

/** Lower-case mission name -> lower-case names it can expand into. */
export const EXPANSION_MAP: Map<string, string[]> = new Map(
  EXPANSIONS.split('\n').filter(l => l.includes('|')).map(l => { const [a, ...b] = l.split('|'); return [a.trim().toLowerCase(), b.map(x => x.trim().toLowerCase())]; }),
);
