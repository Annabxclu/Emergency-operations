import { Empty, useCtx } from '../common';
import { money } from '../format';

export function GoalsPanel() {
  const { game, back } = useCtx();
  const goals = game.city.goals;
  const done = goals ? goals.list.filter(g => g.done).length : 0;
  return (
    <div>
      <div className="sheet-head"><button className="back" onClick={back} aria-label="Back">‹</button><div className="grow"><div className="title">Today's goals</div>
        <div className="sub">{goals ? `${done}/${goals.list.length} complete · new goals every game day` : 'Goals appear once your stations are set up'}</div></div></div>
      {!goals || !game.setupDone ? <Empty>Place your starter stations to get daily goals.</Empty> : (
        <div className="list">
          {goals.list.map(g => (
            <div key={g.id} className={`goal-card ${g.done ? 'done' : ''}`} data-testid="goal">
              <div className="goal-top"><span className="goal-label">{g.done ? '✓ ' : ''}{g.label}</span><span className="goal-count">{g.progress}/{g.target}</span></div>
              <div className="xpbar wide"><span style={{ width: `${(g.progress / g.target) * 100}%` }} /></div>
              <div className="goal-reward">{g.done ? 'Reward paid: ' : 'Reward: '}{money(g.reward)} · {g.xp} XP</div>
            </div>
          ))}
        </div>
      )}
      <p className="hint">Rewards are paid automatically the moment a goal is completed.</p>
    </div>
  );
}
