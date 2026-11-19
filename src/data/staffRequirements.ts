// Trained personnel some missions need on scene ("personnel_educations" in
// https://www.missionchief.com/einsaetze.json). Format: mission name|training=count,...
// Training keys: hazmat, hotshot, riot_police, traffic_control, technical_rescue,
// ems_mobile_command, lifeguard_supervisor, lifeguard, ocean_navigation.
export const STAFF_REQUIREMENTS = `
Gas station fire|hazmat=4
Dangerous goods truck accident|hazmat=4
Industrial Fire|hazmat=4
Large Unknown Tanker Spill|hazmat=8
Unknown Tanker Spill|hazmat=4
Drug Lab Fire|hazmat=4
Chlorine leak|hazmat=4
Large MVA in tunnel|hazmat=4
Ammonia Leak (Gas Alarm System)|hazmat=4
Hazardous materials truck fire in tunnel|hazmat=4
Hazardous materials truck fire|hazmat=4
Fire in Subway station (Large)|hazmat=4
Large Natural Gas explosion|hazmat=4
Pepper spray discharged on train|hazmat=2
Chemistry accident at school|hazmat=2
Subway train on fire|hazmat=4
Propane depot explosion|hazmat=4
Train station fire (Large)|hazmat=4
Overturned tanker truck|hazmat=4
Chlorine Exposure|hazmat=2
Containment Breach at Lab|hazmat=4
Agricultural Chemical Leak|hazmat=4
Container Leaking Unknown Substance|hazmat=2
Aircraft Leaking Fuel|hazmat=4
Radioactive Exposure|hazmat=4
Fuel Spill in Waterway|hazmat=4
Bomb Explosion at Chemical Plant|hazmat=16
Chemical in water|hazmat=4
CBRN explosion on cruise ship|hazmat=16
CBRN explosion on container ship|hazmat=16
CBRN explosion on tanker ship|hazmat=16
Large cargo plane fire with oil leak|hazmat=24
Airplane Crash in Urban Area|hazmat=8
Airplane Crash in Urban Area with Fire|hazmat=8
Airplane Crash in Urban Area with Explosion|hazmat=12
Refinery Fire (Small)|hazmat=8
Refinery Fire (Medium)|hazmat=10
Refinery Fire (Large)|hazmat=14
Refinery Fire (Major)|hazmat=18
Refinery Explosion (Major)|hazmat=24
Overturned Small Vessel|lifeguard_supervisor=1
Overturned Large Vessel|lifeguard_supervisor=1
Missing Vessel|lifeguard_supervisor=1
Oil Rig Fire|lifeguard_supervisor=1
Oil Rig Explosion|lifeguard_supervisor=4,lifeguard=8
Smuggling via Boat|ocean_navigation=12
Deep Water Search & Rescue|lifeguard=8
Hostage Rescue Aboard Cargo Ship|ocean_navigation=18
Whaling Vessel Performing Illegal Operations|ocean_navigation=8
Multiple Whaling Vessels Performing Illegal Operations|ocean_navigation=24
Multi Vehicle Pile-up (Large)|traffic_control=14
Power Plant Fire - Explosion|ems_mobile_command=2
Power Plant Fire - CBRNE|ems_mobile_command=2,hazmat=30
Boat at Anchor in a Protected Area|ocean_navigation=4
Boat at anchor in protected area|ocean_navigation=4
Dam break|hotshot=10
Small Rapid Wildfire|hotshot=10
Medium Rapid Wildfire|hotshot=20
Large Rapid Wildfire|hotshot=30
Major Rapid Wildfire|hotshot=40
Fire Line Requested|hotshot=10
Tanker Truck Explosion (Medium)|hazmat=8
Tanker Truck Explosion (Large)|hazmat=12
Tanker Truck Explosion (Major)|hazmat=15
Pipeline Leak|hazmat=4
Pipeline Fire|hazmat=4
Subterranean Pipeline Fire|hazmat=4
Pipeline Explosion|hazmat=8
Commercial Aircraft - Runway Incursion Collision|hazmat=16,ems_mobile_command=4
Nuclear Explosion (Power Plant)|hazmat=16,ems_mobile_command=2
Supervision of a risky sports match|riot_police=10
Escort of risky fans|riot_police=30
Clash and assault of risky fans|riot_police=60
Crowd Control|riot_police=10
Large Violent Protest|riot_police=32
Fired Employee Spills Cleaning Chemicals|hazmat=8
Double Tractor Trailer Broken Down on Highway|traffic_control=4
Passenger Train Crashes into Fire Truck stuck on Railroad Crossing|technical_rescue=6
Person Trapped in Deep Well|technical_rescue=6
Runaway Diesel Locomotive Derailed|traffic_control=4
Massive Debris from Rockslide Stuck on Highway Trapping Drivers|technical_rescue=18
Collision between two buses|traffic_control=12
Chain Collision in the tunnel|traffic_control=6
Collision between Train and Concrete Mixer|traffic_control=12
Roller Coaster Derailment (Moderate)|technical_rescue=4
Roller Coaster Derailment (Severe)|technical_rescue=8
Roller Coaster Derailment (Major)|technical_rescue=12
`;

/** Training keys -> the qualification ids that count for them (any department). */
export const STAFF_TRAININGS: Record<string, { name: string; quals: string[] }> = {
  hazmat: { name: 'HazMat', quals: ['hazmat_tech'] },
  hotshot: { name: 'Hotshot Crew', quals: ['hotshot'] },
  riot_police: { name: 'Riot Police', quals: ['riot_training'] },
  traffic_control: { name: 'Traffic Control', quals: ['traffic_control', 'police_traffic'] },
  technical_rescue: { name: 'Technical Rescue', quals: ['tech_rescue'] },
  ems_mobile_command: { name: 'EMS Mobile Command', quals: ['ems_mobile_command'] },
  lifeguard_supervisor: { name: 'Lifeguard Supervisor', quals: ['lifeguard_supervisor'] },
  lifeguard: { name: 'Lifeguard', quals: ['lifeguard', 'lifeguard_supervisor'] },
  ocean_navigation: { name: 'Ocean Navigation', quals: ['ocean_navigation', 'fire_ocean_navigation'] },
};
