import { useEffect } from 'react';
import { dept, stationTypeForDept } from '../../data/departments';
import { Btn, Header, Section, useCtx } from '../common';
import { money } from '../format';
import { glyph } from '../icons';

/** A real-world station from OpenStreetMap, with a shortcut to build yours there. */
export function RealStationPanel({ id }: { id: string }) {
  const { game, startBuild, focus } = useCtx();
  const r = game.city.realStations?.find(x => x.id === id);
  useEffect(() => { if (r) focus(r.pos, 16); }, [id]);
  if (!r) return <div><Header title="Station not found" /></div>;
  const d = dept(r.dept);
  const t = stationTypeForDept(r.dept);
  const setupDept = !game.setupDone;
  const need = game.needStations(game.deptRequirement(d.id));
  const locked = !!need;
  return (
    <div>
      <Header title={<><span className="st-ico inline" style={{ background: d.color }} dangerouslySetInnerHTML={{ __html: glyph(r.dept, 13) }} /> {r.name}</>}
        sub={`Real ${d.short.toLowerCase()} station · ${r.address || game.districtFor(r.pos)}`} />
      <p className="hint">This is a real station from OpenStreetMap. Build your own {t.name.toLowerCase()} on the same spot to mirror the city's real network.</p>
      <Section>
        <div className="actions">
          <Btn kind="primary" disabled={setupDept || locked || game.city.money < game.stationPrice(t.id)} testid="build-real"
            onClick={() => startBuild(t.id, { pos: r.pos, name: r.name, address: r.address })}>
            Build {t.name} here · {money(game.stationPrice(t.id))}
          </Btn>
        </div>
        {setupDept && <p className="hint">Finish placing your starter stations first — you can tap real stations while placing them to use their spots.</p>}
        {locked && <p className="hint">{d.name}: {need?.toLowerCase()}.</p>}
      </Section>
    </div>
  );
}
