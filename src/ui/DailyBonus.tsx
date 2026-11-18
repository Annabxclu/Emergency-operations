import type { Game } from '../engine/game';
import { TUNING } from '../data/tuning';
import { money } from './format';

/** Local calendar date, so the bonus resets at your midnight. */
export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function DailyBonus({ game, onClaim, onLater }: { game: Game; onClaim(): void; onLater(): void }) {
  const b = game.dailyBonus(todayKey());
  if (!b) return null;
  const days = Array.from({ length: TUNING.dailyBonusDays }, (_, i) => i + 1);
  return (
    <div className="modal-backdrop" data-testid="daily-bonus">
      <div className="modal">
        <div className="picker-brand">DAILY BONUS</div>
        <h2>Welcome back, Director</h2>
        <p className="muted">Claim a bonus every day you play. It grows each day up to day {TUNING.dailyBonusDays}, then starts over.</p>
        <div className="bonus-days">
          {days.map(d => (
            <div key={d} className={`bonus-day ${d < b.step ? 'past' : d === b.step ? 'today' : ''}`}>
              <div className="bd-label">Day {d}</div>
              <div className="bd-amt">{d < b.step ? '✓' : money(d * TUNING.dailyBonusBase)}</div>
            </div>
          ))}
        </div>
        <button className="btn primary big" onClick={onClaim} data-testid="claim-bonus">Claim {money(b.amount)}</button>
        <button className="btn ghost big" onClick={onLater}>Later</button>
      </div>
    </div>
  );
}
