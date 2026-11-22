import { useEffect, useState } from 'react';
import { HOSPITAL, SPECIALTIES } from '../../data/hospitals';
import { Btn, Header, Section, useCtx } from '../common';
import { money } from '../format';

export function HospitalPanel({ id }: { id: string }) {
  const { game, act, focus } = useCtx();
  const h = game.ownedHospital(id);
  const [name, setName] = useState(h?.name ?? '');
  const [renaming, setRenaming] = useState(false);
  useEffect(() => { if (h) focus(h.pos, 15); }, [id]);
  if (!h) return <div><Header title="Hospital not found" /></div>;
  const beds = game.hospitalBeds(h), free = game.hospitalFreeBeds(h);
  return (
    <div>
      <Header title={h.name} sub={`${free}/${beds} beds free${h.address ? ` · ${h.address}` : ''}`} />
      {renaming ? (
        <div className="field"><input className="text" value={name} onChange={(e: any) => setName(e.target.value)} />
          <div className="actions"><Btn small kind="primary" onClick={() => { game.renameHospital(h.id, name); setRenaming(false); }}>Save</Btn><Btn small onClick={() => setRenaming(false)}>Cancel</Btn></div></div>
      ) : <div className="actions"><Btn small onClick={() => { setName(h.name); setRenaming(true); }}>Rename</Btn></div>}
      <p className="hint">Ambulances bring patients to your nearest hospital with a free bed and the care they need; otherwise they go to the public hospital. A general patient admitted here earns {money(HOSPITAL.admissionFee)}; specialist patients earn the fee shown below. Each patient keeps a bed for {HOSPITAL.stayHours} hour{HOSPITAL.stayHours === 1 ? '' : 's'}.</p>
      <Section title="Alliance">
        {game.state.alliance ? (<>
          <p className="hint">Share this hospital so alliance members' ambulances can bring patients here. They earn the admission fee; you keep the cut you choose, and their patients use your beds.</p>
          <div className="seg" data-testid="hospital-share">
            {([null, 0, 10, 30] as (number | null)[]).map(p => (
              <button key={String(p)} className={(h.allianceFee ?? null) === p ? 'on' : ''} onClick={() => act(() => game.setHospitalShare(h.id, p))} data-testid={`hospital-share-${p ?? 'off'}`}>{p == null ? 'Not shared' : `${p}% fee`}</button>
            ))}
          </div>
        </>) : <p className="hint">Join an alliance (Settings → Alliance) to share this hospital with friends.</p>}
      </Section>
      <Section title="Beds">
        <div className="kv"><span>{beds} beds · {beds - free} in use</span></div>
        {h.extraBeds < HOSPITAL.maxExtraBeds ? (
          <div className="actions"><Btn small disabled={game.city.money < HOSPITAL.bedCost} testid="hospital-add-bed" onClick={() => act(() => game.addHospitalBed(h.id), 'Bed added')}>Add a bed · {money(HOSPITAL.bedCost)}</Btn></div>
        ) : <p className="hint">Maximum of {HOSPITAL.baseBeds + HOSPITAL.maxExtraBeds} beds reached.</p>}
      </Section>
      <Section title="Specialties">
        <p className="hint">About half of patients need specialist care. They can only be admitted where that specialty exists.</p>
        <div className="list">
          {SPECIALTIES.map(sp => {
            const has = h.specialties.includes(sp.id);
            return (
              <div key={sp.id} className="row compact">
                <div className="grow"><div className="row-title">{sp.name}</div><div className="row-sub">Earns {money(sp.fee)} per patient</div></div>
                {has ? <span className="chip ok">Available</span>
                  : <Btn small disabled={game.city.money < sp.cost} testid={`spec-${sp.id}`} onClick={() => act(() => game.addSpecialty(h.id, sp.id), `${sp.name} added`)}>Add · {money(sp.cost)}</Btn>}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
