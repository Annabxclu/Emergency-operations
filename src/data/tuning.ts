// One place for the numbers you are most likely to want to tweak.
// Change a value, rebuild (npm run build:pages), and push.

export const TUNING = {
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

  /** Multiplier on every call reward (also adjustable in Settings > Tuning). */
  defaultRewardMultiplier: 1,
};
