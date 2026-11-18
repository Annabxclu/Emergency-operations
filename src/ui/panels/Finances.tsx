import { useState } from 'react';
import type { FinanceBucket } from '../../engine/types';
import { DEPARTMENTS, vehicleType } from '../../data/departments';
import { Btn, Chip, ConfirmBtn, Dot, Section, Stat, useCtx } from '../common';
import { AGREEMENTS } from '../../data/progression';
import { dept } from '../../data/departments';
import { cap1, clock, money, moneyShort } from '../format';

function sum(o: Record<string, number>) { return Object.values(o).reduce((a, b) => a + b, 0); }

function Breakdown({ b }: { b: FinanceBucket }) {
  const rows = [
    ...Object.entries(b.income).map(([k, v]) => ({ k, v, sign: 1 })),
    ...Object.entries(b.expense).map(([k, v]) => ({ k, v, sign: -1 })),
  ].sort((a, b2) => b2.v - a.v);
  const max = Math.max(1, ...rows.map(r => r.v));
  if (!rows.length) return <p className="hint">No transactions yet.</p>;
  return (
    <div className="bars">
      {rows.map(r => (
        <div key={r.k + r.sign} className="bar-row">
          <span className="bar-label">{cap1(r.k)}</span>
          <span className="bar"><span className={r.sign > 0 ? 'in' : 'out'} style={{ width: `${(r.v / max) * 100}%` }} /></span>
          <span className={`bar-val ${r.sign > 0 ? 'ok' : 'bad'}`}>{r.sign > 0 ? '+' : '−'}{moneyShort(r.v)}</span>
        </div>
      ))}
    </div>
  );
}

export function FinancesPanel() {
  const { game, act } = useCtx();
  const c = game.city;
  const [period, setPeriod] = useState('today');
  const b = period === 'today' ? c.finance.today : period === 'yesterday' ? c.finance.yesterday : c.finance.total;
  const h = game.hourlyCosts();
  const inc = b ? sum(b.income) : 0, exp = b ? sum(b.expense) : 0;
  const topVehicles = [...c.vehicles].map(v => ({ v, total: v.costs.purchase + v.costs.fuel + v.costs.maintenance })).sort((a, b2) => b2.total - a.total).slice(0, 8);
  return (
    <div>
      <div className="sheet-head"><div className="grow"><div className="title">Finances</div><div className="sub">Balance <b className={c.money < 0 ? 'bad' : ''}>{money(c.money)}</b></div></div></div>
      <div className="seg">
        {[['today', 'Today'], ['yesterday', 'Yesterday'], ['total', 'All time']].map(([k, l]) =>
          <button key={k} className={period === k ? 'on' : ''} onClick={() => setPeriod(k)}>{l}</button>)}
      </div>
      {!b ? <p className="hint">No data for yesterday yet.</p> : (
        <>
          <div className="stats">
            <Stat label="Income" value={moneyShort(inc)} tone="ok" />
            <Stat label="Expenses" value={moneyShort(exp)} tone="bad" />
            <Stat label="Net" value={moneyShort(inc - exp)} tone={inc - exp < 0 ? 'bad' : 'ok'} />
          </div>
          <Section title="By category"><Breakdown b={b} /></Section>
          <Section title="By department">
            <div className="list">
              {DEPARTMENTS.map(d => {
                const x = b.byDept[d.id] || { income: 0, expense: 0 };
                return (
                  <div key={d.id} className="row compact">
                    <Dot color={d.color} /><div className="grow"><div className="row-title">{d.short}</div></div>
                    <div className="row-right"><span className="ok small">+{moneyShort(x.income)}</span> <span className="bad small">−{moneyShort(x.expense)}</span></div>
                  </div>
                );
              })}
            </div>
          </Section>
        </>
      )}
      <Section title="Running costs per game hour">
        <div className="kv">
<span>Stations {money(h.upkeep)}</span><span>Vehicles {money(h.maint)}</span>
          <span className="ok">City contracts +{money(h.contract)}</span>
        </div>
        <p className="hint">Fixed costs net {money(h.net)}/h before call rewards and fuel. Costs only accrue while the game is open and unpaused.</p>
      </Section>
      <Section title="Regional service agreements">
        <div className="list">
          {AGREEMENTS.map(a => {
            const signed = (c.agreements || []).includes(a.id);
            const met = game.agreementActive(a.id);
            const locked = false;
            const req = `${a.stations} ${dept(a.dept).short} station${a.stations > 1 ? 's' : ''}${a.extraDept ? ` + ${dept(a.extraDept).short}` : ''}`;
            return (
              <div key={a.id} className={`row compact ${locked ? 'disabled' : ''}`}>
                <div className="grow"><div className="row-title">{a.name}</div>
                  <div className="row-sub wrap">{a.desc} Needs {req}. +{money(a.incomePerHour)}/h</div></div>
                {signed ? (met ? <ConfirmBtn small onConfirm={() => game.cancelAgreement(a.id)} confirmText="Cancel?">Active</ConfirmBtn> : <Chip tone="warn">Paused</Chip>)
                  : <Btn small kind="primary" disabled={!met || c.money < a.signCost} onClick={() => act(() => game.signAgreement(a.id), `Signed ${a.name}`)}>Sign · {money(a.signCost)}</Btn>}
              </div>
            );
          })}
        </div>
        <p className="hint">Agreements pay every hour while you keep the required stations. They pause if you fall below.</p>
      </Section>

      <Section title="Vehicle costs (lifetime)">
        <div className="list">
          {topVehicles.map(({ v, total }) => (
            <div key={v.id} className="row compact">
              <div className="grow"><div className="row-title">{v.name}</div><div className="row-sub">{vehicleType(v.typeId).name} · fuel {money(v.costs.fuel)} · maint. {money(v.costs.maintenance)}</div></div>
              <div className="row-right"><span className="amt">{money(total)}</span></div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Recent transactions">
        <div className="list">
          {c.ledger.slice(0, 40).map((l, i) => {
            const t = clock(l.t);
            return (
              <div key={i} className="row compact">
                <div className="grow"><div className="row-title small">{l.note}</div><div className="row-sub">Day {t.day} {t.hm} · {cap1(l.cat)}</div></div>
                <span className={`amt ${l.amount < 0 ? 'bad' : 'ok'}`}>{l.amount > 0 ? '+' : ''}{money(l.amount)}</span>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
