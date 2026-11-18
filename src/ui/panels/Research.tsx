import { RESEARCH } from '../../data/progression';
import { Btn, Chip, Header, useCtx } from '../common';
import { dur, money } from '../format';

export function ResearchPanel() {
  const { game, act } = useCtx();
  const rs = game.state.research;
  const active = rs.active ? RESEARCH.find(r => r.id === rs.active!.id) : null;
  return (
    <div>
      <Header title="Research" sub={`${rs.done.length}/${RESEARCH.length} completed · paid from ${game.cityDef.name}'s budget`} />
      {active && rs.active && (
        <div className="callout">
          Researching <b>{active.name}</b> · {dur(rs.active.until - game.state.time)} left
          <div className="xpbar wide"><span style={{ width: `${Math.min(100, 100 - ((rs.active.until - game.state.time) / (active.hours * 3600)) * 100)}%` }} /></div>
        </div>
      )}
      <div className="list">
        {RESEARCH.map(r => {
          const done = rs.done.includes(r.id);
          const need = game.needStations(r.unlockLevel);
          const locked = !!need;
          const needs = r.requires && !rs.done.includes(r.requires) ? RESEARCH.find(x => x.id === r.requires)!.name : null;
          return (
            <div key={r.id} className={`row compact ${locked && !done ? 'disabled' : ''}`} data-testid="research-item">
              <div className="grow">
                <div className="row-title">{r.name}</div>
                <div className="row-sub wrap">{r.desc}</div>
                <div className="row-sub">{money(r.cost)} · {r.hours} h{needs ? ` · needs ${needs}` : ''}</div>
              </div>
              {done ? <Chip tone="ok">Done</Chip> : rs.active?.id === r.id ? <Chip tone="info">In progress</Chip> : locked ? <Chip tone="muted">{need}</Chip> :
                <Btn small kind="primary" disabled={!!rs.active || !!needs || game.city.money < r.cost} onClick={() => act(() => game.startResearch(r.id), `Started ${r.name}`)}>Start</Btn>}
            </div>
          );
        })}
      </div>
      <p className="hint">One project at a time. Research benefits apply to all of your cities.</p>
    </div>
  );
}
