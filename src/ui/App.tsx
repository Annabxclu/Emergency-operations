import { useEffect, useRef, useState } from 'react';
import { ActionError, Game, SETUP_ORDER, newGameState } from '../engine/game';
import type { GameEvent, LatLng } from '../engine/types';
import { DEPARTMENTS, dept, qualification, stationType, stationTypeForDept } from '../data/departments';
import type { OsrmRouting } from '../services/routing';
import { clearSave, importJson, saveGame } from '../services/storage';
import { fetchHospitals, reverseAddress, searchAddress, type AddressResult } from '../services/geocode';
import { GameCtx, type Ctx, type Route } from './common';
import { MapView, type MapApi, type Selection } from './MapView';
import { OUTCOME, money, moneyShort } from './format';
import { tabIcon } from './icons';
import { DispatchList, IncidentDetail } from './panels/Dispatch';
import { BuildChooser, StationDetail, StationsList } from './panels/Stations';
import { VehicleDetail, VehiclesList } from './panels/Vehicles';
import { HospitalPanel } from './panels/Hospital';
import { HOSPITAL } from '../data/hospitals';
import { AcademyPanel, EmployeeDetail, PersonnelList } from './panels/Personnel';
import { FinancesPanel } from './panels/Finances';
import { SettingsPanel } from './panels/Settings';
import { MissionsPanel } from './panels/Missions';
import { ResearchPanel } from './panels/Research';
import { GoalsPanel } from './panels/Goals';
import { RESEARCH } from '../data/progression';
import { playAlert, unlockAudio } from './sound';
import { CityPicker } from './CityPicker';
import { DailyBonus, todayKey } from './DailyBonus';
import type { CityDef } from '../engine/types';

const TABS = [
  { id: 'map', label: 'Map' }, { id: 'dispatch', label: 'Dispatch' }, { id: 'stations', label: 'Stations' },
  { id: 'vehicles', label: 'Vehicles' },
];
const TAB_OF: Record<string, string> = {
  dispatch: 'dispatch', incident: 'dispatch', stations: 'stations', station: 'stations', build: 'stations', hire: 'stations', hospital: 'stations', academy: 'stations',
  vehicles: 'vehicles', vehicle: 'vehicles', personnel: 'settings', employee: 'settings', finances: 'settings', settings: 'settings', missions: 'settings', research: 'settings', goals: 'settings', real: 'stations',
};

interface Toast { id: number; text: string; tone: string; action?: () => void }

// Panels opened from the tab bar or top bar fill the screen on phones; map taps open a half sheet.
const FULL_SCREEN = new Set(['dispatch', 'stations', 'vehicles', 'finances', 'settings', 'personnel', 'missions', 'research', 'goals']);

export function App({ game, routing, firstRun }: { game: Game; routing: OsrmRouting; firstRun: boolean }) {
  const [, setFrame] = useState(0);
  const [stack, setStack] = useState([] as Route[]);
  const [expanded, setExpanded] = useState(false);
  const [toasts, setToasts] = useState([] as Toast[]);
  const [buildType, setBuildType] = useState(null as string | null);
  const [pending, setPending] = useState(null as LatLng | null);
  const [buildName, setBuildName] = useState('');
  const [addrQuery, setAddrQuery] = useState('');
  const [addrResults, setAddrResults] = useState([] as AddressResult[]);
  const [addrBusy, setAddrBusy] = useState(false);
  const [addrError, setAddrError] = useState('');
  const [pendingAddr, setPendingAddr] = useState(null as string | null);
  const [tileTrouble, setTileTrouble] = useState(false);
  const [routingOk, setRoutingOk] = useState(null as boolean | null);
  // First launch goes straight to choosing a city; afterwards the game opens on the map.
  const [picker, setPicker] = useState((firstRun ? 'new' : null) as null | 'new' | 'add');
  const menu = false;
  const [hasSave, setHasSave] = useState(!firstRun);
  const [bonusHidden, setBonusHidden] = useState(false);
  const blocked = useRef(true);
  blocked.current = menu || !!picker;
  const mapApi = useRef(null as MapApi | null);
  const toastId = useRef(0);
  const lastFallbackToast = useRef(0);

  const rerender = () => setFrame((f: number) => f + 1);

  // ---------------------------------------------------------- toasts
  const toast = (text: string, tone: Toast['tone'] = 'info', action?: () => void) => {
    const id = ++toastId.current;
    setToasts((t: Toast[]) => [{ id, text, tone, action }, ...t].slice(0, 3));
    setTimeout(() => setToasts((t: Toast[]) => t.filter(x => x.id !== id)), tone === 'bad' ? 6000 : 4200);
  };

  // ---------------------------------------------------------- navigation
  const push = (r: Route) => setStack((s: Route[]) => [...s, r]);
  const back = () => setStack((s: Route[]) => s.slice(0, -1));
  // Swipe right on a panel to go back (or close it at the top level), like iOS.
  const swipe = useRef(null as { x: number; y: number; t: number } | null);
  const onTouchStart = (e: any) => {
    const t = e.touches[0];
    // Leave sideways-scrolling rows (tabs, quick-add buttons) and form fields alone.
    if (e.touches.length !== 1 || (e.target as HTMLElement).closest('input, textarea, select, .seg, .aao, .filters, .tabs, .hscroll')) { swipe.current = null; return; }
    swipe.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e: any) => {
    const s0 = swipe.current; swipe.current = null;
    if (!s0) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s0.x, dy = t.clientY - s0.y;
    if (dx > 80 && Math.abs(dy) < dx * 0.5 && Date.now() - s0.t < 700) {
      if (stack.length > 1) back(); else openRoot(null);
    }
  };
  const openRoot = (r: Route | null) => { setStack(r ? [r] : []); setExpanded(false); };
  const focus = (p: LatLng, zoom?: number) => mapApi.current?.focus(p, zoom);
  const act = (fn: () => void, okText?: string) => {
    try { fn(); if (okText) toast(okText, 'ok'); return true; }
    catch (e) { toast(e instanceof ActionError ? e.message : `Something went wrong: ${(e as Error).message}`, 'bad'); if (!(e instanceof ActionError)) console.error(e); return false; }
  };
  const startBuild = (typeId: string, at?: { pos: LatLng; name: string; address?: string }) => {
    setBuildType(typeId); setPending(null); setBuildName(''); setAddrQuery(''); setAddrResults([]); setAddrError(''); setPendingAddr(null); setStack([]);
    if (at) { setBuildName(at.name); placeAt(at.pos, at.address || at.name); }
  };

  // ---------------------------------------------------------- game loop
  useEffect(() => {
    let raf = 0, last = performance.now(), lastUi = 0;
    const loop = (now: number) => {
      const dtReal = Math.min(0.25, (now - last) / 1000);
      last = now;
      const speed = game.setupDone && !blocked.current ? game.state.settings.speed : 0;
      if (speed > 0) game.tick(dtReal * speed);
      game.state.lastSeen = Date.now();
      if (now - lastUi > 250) { lastUi = now; if (speed > 0) rerender(); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    let queued = false;
    const unsub = game.subscribe(() => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; rerender(); }); } });
    return () => { cancelAnimationFrame(raf); unsub(); };
  }, [game]);

  // ---------------------------------------------------------- events -> toasts
  useEffect(() => game.onEvent((e: GameEvent) => {
    if (e.cityId && e.cityId !== game.state.activeCity) {
      const name = game.defOf(e.cityId).name;
      if (e.type === 'incident_resolved') toast(`${name}: call ${OUTCOME[e.outcome].label.toLowerCase()} ${money(e.payout)}`, e.payout >= 0 ? 'info' : 'warn');
      else if (e.type === 'incident_escalated') toast(`${name}: a call escalated`, 'warn');
      return;
    }
    const c = game.city;
    switch (e.type) {
      case 'incident_new': {
        const inc = c.incidents.find(i => i.id === e.id);
        if (inc && game.state.settings.sound && !inc.parentId) playAlert(inc.severity >= 3 ? 'major' : 'call');
        if (inc && inc.parentId) break; // major event children are summarized by the event toast
        if (inc) toast(`New call: ${inc.name} · ${inc.district}`, inc.severity >= 3 ? 'bad' : 'warn', () => openRoot({ kind: 'incident', id: inc.id }));
        break;
      }
      case 'incident_escalated': {
        const inc = game.incident(e.id);
        if (inc) toast(`${inc.name} escalated — more units required`, 'bad', () => openRoot({ kind: 'incident', id: inc.id }));
        break;
      }
      case 'incident_late': {
        const inc = game.incident(e.id);
        if (inc) toast(`${inc.name} response overdue`, 'warn', () => openRoot({ kind: 'incident', id: inc.id }));
        break;
      }
      case 'incident_resolved': {
        const inc = game.incident(e.id);
        const o = OUTCOME[e.outcome];
        toast(`${inc?.name ?? 'Call'}: ${o.label} ${e.payout >= 0 ? '+' : ''}${money(e.payout)}`, o.tone === 'ok' ? 'ok' : o.tone === 'bad' ? 'bad' : 'warn');
        break;
      }
      case 'transport_done': {
        const v = game.vehicle(e.id);
        toast(`${v?.name ?? 'Unit'} delivered ${e.count} ${e.kind}${e.count > 1 ? 's' : ''} to ${e.dest}${e.fee ? ` +${money(e.fee)}` : ''}`, 'ok');
        break;
      }
      case 'major_event': {
        const inc = game.incident(e.id);
        if (inc) toast(`MAJOR EVENT: ${inc.name} — ${e.children} related calls`, 'bad', () => openRoot({ kind: 'dispatch' }));
        break;
      }
      case 'research_done': toast(`Research complete: ${RESEARCH.find(r => r.id === e.id)?.name}`, 'ok'); if (game.state.settings.sound) playAlert('good'); break;
      case 'goal_done': toast(`Daily goal done: ${e.label} +${money(e.reward)}`, 'ok'); if (game.state.settings.sound) playAlert('good'); break;
      case 'training_done': {
        const emp = game.employee(e.empId);
        toast(`${emp?.name ?? 'Employee'} completed ${qualification(e.qual).name}`, 'ok');
        break;
      }
      case 'recruited': toast(`${e.count} new recruit${e.count > 1 ? 's' : ''} joined ${game.station(e.stationId)?.name ?? 'a station'}`, 'ok'); break;
      case 'routing_fallback':
        if (Date.now() - lastFallbackToast.current > 60000) {
          lastFallbackToast.current = Date.now();
          toast('Road routing unavailable — using approximate paths (dashed) for now', 'warn');
        }
        break;
      case 'notice': toast(e.text, 'info'); break;
    }
  }), [game]);

  // ---------------------------------------------------------- hospitals for generated cities saved before they existed
  useEffect(() => {
    const def = game.state.cityDefs[game.state.activeCity];
    if (!def || def.hospitals) return;
    def.hospitals = [];
    fetchHospitals(def.bounds).then(h => { def.hospitals = h; game.changed(); }).catch(() => { def.hospitals = undefined; });
  }, [game, game.state.activeCity, game.state]);

  // ---------------------------------------------------------- offline progress
  const catchUp = () => {
    const last = game.state.lastSeen;
    const now = Date.now();
    game.state.lastSeen = now;
    if (!last || !game.setupDone) return;
    const away = (now - last) / 1000;
    const speed = game.state.settings.speed;
    if (away < 5 || speed <= 0) return;
    const r = game.catchUp(away * speed);
    if (!r) return;
    saveGame(game.state);
    const h = Math.floor(away / 3600), m = Math.round((away % 3600) / 60);
    const parts = [`${h ? `${h}h ` : ''}${m}m away`];
    if (r.calls) parts.push(`${r.calls} call${r.calls > 1 ? 's' : ''} closed (${r.successful} successful${r.failed ? `, ${r.failed} failed` : ''})`);
    if (Math.abs(r.money) >= 1) parts.push(`${r.money >= 0 ? '+' : ''}${money(r.money)}`);
    if (away >= 60) toast(`While you were away: ${parts.join(' · ')}`, r.failed ? 'warn' : 'info');
  };
  useEffect(() => {
    if (!firstRun) catchUp();
    const onVis = () => { if (document.visibilityState === 'visible') catchUp(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [game]);

  // ---------------------------------------------------------- persistence
  useEffect(() => {
    routing.onStatus = ok => setRoutingOk(ok);
    const save = () => { saveGame(game.state).catch(() => toast('Autosave failed', 'bad')); };
    const iv = setInterval(save, 10000);
    const onHide = () => { if (document.visibilityState === 'hidden') save(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', save);
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', onHide); window.removeEventListener('pagehide', save); };
  }, [game]);

  const onImport = (text: string) => {
    try {
      const st = importJson(text);
      game.load(st);
      routing.setBaseUrl(st.settings.routingUrl);
      saveGame(st);
      openRoot(null);
      setHasSave(true);
      toast('Save loaded', 'ok');
    } catch (e) { toast((e as Error).message, 'bad'); }
  };
  const onPickCity = async (def: CityDef) => {
    if (picker === 'add') {
      if (act(() => game.addCity(def), `Welcome to ${def.name}. Place your first stations.`)) { setPicker(null); openRoot(null); setBuildType(null); setPending(null); }
      return;
    }
    await clearSave();
    game.load(newGameState(def));
    routing.setBaseUrl(game.state.settings.routingUrl);
    saveGame(game.state);
    setHasSave(true);
    setPicker(null); openRoot(null); setBuildType(null); setPending(null);
  };
  const onSwitchCity = (id: string) => {
    if (act(() => game.switchCity(id), `Now managing ${game.defOf(id).name}`)) { openRoot(null); setBuildType(null); setPending(null); }
  };
  const onRoutingUrl = (url: string) => {
    if (!/^https?:\/\//.test(url)) { toast('Enter a full URL starting with https://', 'bad'); return; }
    game.state.settings.routingUrl = url.replace(/\/+$/, '');
    routing.setBaseUrl(url);
    game.changed();
    toast('Routing server updated', 'ok');
  };

  // ---------------------------------------------------------- derived
  const c = game.city;
  const setup = !game.setupDone;
  const setupType = setup ? stationTypeForDept(SETUP_ORDER[c.setupStep]).id : null;
  const activeBuild = picker || menu ? null : setup ? setupType : buildType;
  useEffect(() => { document.documentElement.dataset.theme = game.state.settings.theme ?? 'midnight'; }, [game.state.settings.theme]);
  const pendingCount = c.incidents.filter(i => game.shownStatus(i) === 'pending').length;
  const top = stack[stack.length - 1];
  const activeTab = stack.length ? TAB_OF[stack[0].kind] : 'map';
  const selected: Selection = top && (top.kind === 'incident' || top.kind === 'station' || top.kind === 'vehicle' || top.kind === 'hospital') ? { kind: top.kind, id: top.id } : null;

  const ctx: Ctx = { game, push, back, toast, act, focus, startBuild };

  const placeAt = (p: LatLng, label: string | null) => {
    setPending(p); setPendingAddr(label); setAddrResults([]);
    focus(p, 16);
    if (!label) reverseAddress(p).then(a => setPendingAddr(a || 'Address not available'));
  };
  const resetAddr = () => { setAddrQuery(''); setAddrResults([]); setAddrError(''); setPendingAddr(null); };
  const findAddress = async () => {
    setAddrBusy(true); setAddrError(''); setAddrResults([]);
    try {
      const r = await searchAddress(addrQuery, game.cityDef.bounds, `${game.cityDef.name}, ${game.cityDef.state}`);
      if (r.length === 1) placeAt(r[0].pos, r[0].label);
      else if (r.length) setAddrResults(r);
      else setAddrError(`No match in ${game.cityDef.name}. Try a street address like "123 Main St".`);
    } catch { setAddrError('Address search is unavailable right now — tap the map instead.'); }
    setAddrBusy(false);
  };
  const onMapClick = (p: LatLng) => {
    if (activeBuild) placeAt(p, null);
  };
  const confirmBuild = () => {
    if (!activeBuild || !pending) return;
    let id = '';
    const addr = pendingAddr && pendingAddr !== 'Address not available' ? pendingAddr : undefined;
    const ok = activeBuild === 'hospital'
      ? act(() => { id = game.buildHospital(pending, buildName, addr).id; }, 'Hospital built')
      : act(() => { id = game.placeStation(activeBuild, pending, buildName, addr).id; }, setup ? undefined : `${stationType(activeBuild).name} built`);
    if (ok) {
      setPending(null); setBuildName(''); resetAddr();
      if (!setup) { setBuildType(null); openRoot(activeBuild === 'hospital' ? { kind: 'hospital', id } : { kind: 'station', id }); }
    }
  };

  const renderSheet = (r: Route) => {
    switch (r.kind) {
      case 'dispatch': return <DispatchList />;
      case 'incident': return <IncidentDetail key={r.id} id={r.id} />;
      case 'stations': return <StationsList />;
      case 'station': return <StationDetail key={r.id} id={r.id} />;
      case 'build': return <BuildChooser />;
      case 'academy': return <AcademyPanel key={r.dept} dept={r.dept} />;
      case 'hospital': return <HospitalPanel key={r.id} id={r.id} />;
      case 'vehicles': return <VehiclesList />;
      case 'vehicle': return <VehicleDetail key={r.id} id={r.id} />;
      case 'personnel': return <PersonnelList />;
      case 'employee': return <EmployeeDetail key={r.id} id={r.id} />;
      case 'finances': return <FinancesPanel />;
      case 'settings': return <SettingsPanel onImport={onImport} onNewGame={() => setPicker('new')} onAddCity={() => setPicker('add')} onSwitchCity={onSwitchCity} onRoutingUrl={onRoutingUrl} routingOk={routingOk} />;
      case 'missions': return <MissionsPanel />;
      case 'research': return <ResearchPanel />;
      case 'goals': return <GoalsPanel />;
    }
  };

  // Hospitals use the same placement flow as stations.
  const buildInfo = activeBuild === 'hospital' ? { name: HOSPITAL.name, cost: HOSPITAL.cost, dept: 'ems' } : activeBuild ? stationType(activeBuild) : null;
  const buildDept = buildInfo ? buildInfo.dept : null;

  return (
    <GameCtx.Provider value={ctx}>
      <div className="app" onPointerDown={unlockAudio}>
        <MapView game={game} selected={selected}
          preview={pending && buildDept ? { pos: pending, dept: buildDept } : null}
          onSelect={(sel: Selection) => {
            if (!sel) return;
            if (activeBuild) return;
            openRoot({ kind: sel.kind, id: sel.id } as Route);
          }}
          onMapClick={onMapClick}
          onReady={(api: MapApi) => (mapApi.current = api)}
          onTileTrouble={setTileTrouble} />

        <header className="topbar">
          <button className="money" onClick={() => openRoot({ kind: 'finances' })} data-testid="money">
            <span className={c.money < 0 ? 'bad' : ''}>{moneyShort(c.money)}</span>
          </button>
          <div className="topbrand">
            <div className="brand-name">Authority<span>: First Response</span></div>
            <div className="brand-city">{game.cityDef.name}, {game.cityDef.state}</div>
          </div>
          <button className="gear" aria-label="Settings" onClick={() => openRoot({ kind: 'settings' })}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L15 3.3h-4l-.4 2.6c-.6.3-1.2.6-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1c.5.4 1.1.7 1.7 1l.4 2.6h4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5L19.4 13zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" /></svg>
          </button>
        </header>

        <div className="filters">
          {DEPARTMENTS.filter(d => c.stations.some(st => st.dept === d.id) || ['fire', 'police', 'ems'].includes(d.id)).map(d => {
            const on = game.state.settings.deptFilter[d.id] !== false;
            return (
              <button key={d.id} className={`fchip ${on ? 'on' : ''}`} style={{ '--c': d.color } as any}
                onClick={() => { game.state.settings.deptFilter[d.id] = !on; game.changed(); }}>{d.short}</button>
            );
          })}
          <button className={`fchip ${game.state.settings.showCoverage ? 'on' : ''}`} style={{ '--c': '#64748b' } as any}
            onClick={() => { game.state.settings.showCoverage = !game.state.settings.showCoverage; game.changed(); }}>Coverage</button>
        </div>

        <div className="toasts">
          {toasts.map((x: Toast) => (
            <button key={x.id} className={`toast ${x.tone}`} onClick={() => { x.action?.(); setToasts((ts: Toast[]) => ts.filter(y => y.id !== x.id)); }}>
              {x.text}{x.action && <span className="toast-go">›</span>}
            </button>
          ))}
        </div>

        {tileTrouble && <div className="banner bad">Map tiles aren't loading. Check your connection or switch map style in Settings.</div>}

        {activeBuild && (
          <div className="buildbar">
            <div className="grow">
              {!pending && setup && c.setupStep === 0 && <div className="welcome">Welcome, Director. Set up your first three stations — they come staffed and equipped.</div>}
              <div className="build-row"><span className="dot" style={{ background: dept(buildDept!).color }} />
                <b>{setup ? `Step ${c.setupStep + 1} of 3: ` : ''}{buildInfo!.name}</b>
                <span className="muted small">{setup ? 'Free starter station' : money(buildInfo!.cost)}</span></div>
              {!pending ? (
                <>
                  <form className="addr-form" onSubmit={(e: Event) => { e.preventDefault(); findAddress(); }}>
                    <input className="text" placeholder="Enter an address or place" value={addrQuery} onChange={(e: any) => setAddrQuery(e.target.value)}
                      autoCorrect="off" enterKeyHint="search" disabled={addrBusy} data-testid="addr-input" />
                    <button className="btn primary" disabled={addrBusy || !addrQuery.trim()} data-testid="addr-find">{addrBusy ? '…' : 'Find'}</button>
                  </form>
                  {addrError && <div className="muted small">{addrError}</div>}
                  {addrResults.length > 0 && (
                    <div className="addr-results">
                      {addrResults.map((r: AddressResult, i: number) => (
                        <button key={i} className="addr-result" onClick={() => placeAt(r.pos, r.label)} data-testid="addr-result">{r.label}</button>
                      ))}
                    </div>
                  )}
                  <div className="muted small">…or tap anywhere on the map.</div>
                  {!setup && <div className="actions"><button className="btn ghost small" onClick={() => { setBuildType(null); resetAddr(); }}>Cancel</button></div>}
                </>
              ) : (
                <>
                  <div className="addr-picked" data-testid="addr-picked">📍 {pendingAddr ?? 'Looking up address…'} <span className="muted">· {game.districtFor(pending)}</span></div>
                  <input className="text" placeholder={activeBuild === 'hospital' ? `${game.cityDef.name} Hospital ${(c.hospitals?.length ?? 0) + 1}` : `${buildInfo!.name} ${c.stations.filter(st => st.typeId === activeBuild).length + 1}`} value={buildName}
                    onChange={(e: any) => setBuildName(e.target.value)} />
                  <div className="actions">
                    <button className="btn primary" onClick={confirmBuild} data-testid="build-confirm">{setup ? 'Place station' : `Build · ${money(buildInfo!.cost)}`}</button>
                    <button className="btn ghost" onClick={() => { setPending(null); setPendingAddr(null); }}>Change</button>
                    {!setup && <button className="btn ghost" onClick={() => { setBuildType(null); setPending(null); resetAddr(); }}>Cancel</button>}
                  </div>
                  <div className="muted small">Tap elsewhere on the map to adjust the spot.</div>
                </>
              )}
            </div>
          </div>
        )}

        {stack.length > 0 && !activeBuild && (
          <div className={`sheet ${expanded ? 'expanded' : ''} ${FULL_SCREEN.has(stack[0].kind) ? 'full' : ''}`} data-testid="sheet"
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <button className="grabber" aria-label={expanded ? 'Collapse panel' : 'Expand panel'} onClick={() => setExpanded(!expanded)}><span /></button>
            <button className="close" aria-label="Close panel" onClick={() => openRoot(null)}>×</button>
            <div className="sheet-body">{renderSheet(top)}</div>
          </div>
        )}

        {!menu && !picker && !bonusHidden && game.dailyBonus(todayKey()) && (
          <DailyBonus game={game} onClaim={() => { const amt = game.claimDailyBonus(todayKey()); toast(`Daily bonus claimed: +${money(amt)}`, 'ok'); saveGame(game.state); }} onLater={() => setBonusHidden(true)} />
        )}

        {picker && (
          <CityPicker
            title={picker === 'add' ? 'Expand to a new city' : hasSave ? 'Start a new game' : 'Where do you want to start?'}
            subtitle={picker === 'add' ? 'Your new city has its own stations, staff, calls and budget. You keep your level.'
              : hasSave ? 'This replaces your current game. Export a backup in Settings first if you want to keep it.'
              : 'Enter a city and state. You will build your network on its real streets.'}
            existingIds={picker === 'add' ? Object.keys(game.state.cities) : []}
            onPick={onPickCity}
            onCancel={hasSave ? () => setPicker(null) : undefined} />
        )}

        <nav className="tabbar">
          {TABS.map(tab => (
            <button key={tab.id} className={activeTab === tab.id ? 'on' : ''} data-testid={`tab-${tab.id}`}
              onClick={() => openRoot(tab.id === 'map' ? null : ({ kind: tab.id } as Route))}>
              <span className="ti" dangerouslySetInnerHTML={{ __html: tabIcon(tab.id) }} />
              <span className="tl">{tab.label}</span>
              {tab.id === 'dispatch' && pendingCount > 0 && <span className="badge">{pendingCount}</span>}
            </button>
          ))}
        </nav>
      </div>
    </GameCtx.Provider>
  );
}
