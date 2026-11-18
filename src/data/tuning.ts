// One place for the numbers you are most likely to want to tweak.
// Change a value, rebuild (npm run build:pages), and push.

export const TUNING = {
  /** Cost of each station level (index 0 = level 1). Levels past the list use the last value. */
  levelCosts: [10000, 50000, 100000],
  /** After this many stations of one type, new ones cost `bigNetworkMultiplier` x and rise a little each time. */
  priceRiseAfter: 24,
  bigNetworkMultiplier: 3,
  /** Personnel capacity per vehicle bay. */
  staffPerBay: 8,

  startingMoney: 0,

  /** Daily login bonus: day N pays N × base, up to `days`, then starts over at day 1. */
  dailyBonusBase: 1000,
  dailyBonusDays: 7,

  /** Max active calls = largest department's station count + this. */
  callCapBonus: 1,
  defaultCallIntervalMin: 3,

  /** Running costs are off by default; set true to start new games with payroll/upkeep/fuel. */
  runningCostsDefault: false,

  /** When false, calls wait as long as you need: no countdown, escalation or failure. */
  responseTimeLimit: false,

  /** Default driving speed multiplier (Settings > Tuning can change it per game). */
  defaultTravelMult: 2,
  /** Default on-scene work time multiplier (1 = full mission times listed in data). */
  defaultWorkMult: 0.1,
  /** Turnout (time to leave the station) multiplier. */
  turnoutMultiplier: 0.25,

  /** Seconds a unit spends handing over a patient (hospital) or suspect (jail). */
  handoverSeconds: 5,
  maxPatientAmbulances: 10,

  /** Multiplier on every call reward (also adjustable in Settings > Tuning). */
  defaultRewardMultiplier: 1,
};
