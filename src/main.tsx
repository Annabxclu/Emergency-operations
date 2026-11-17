import { createRoot } from 'react-dom/client';
import { Game, newGameState } from './engine/game';
import { OsrmRouting } from './services/routing';
import { loadGame } from './services/storage';
import { App } from './ui/App';

function fatal(title: string, detail: string) {
  const root = document.getElementById('root')!;
  root.innerHTML = `<div class="fatal"><h1>${title}</h1><p>${detail}</p><button onclick="location.reload()">Try again</button></div>`;
}

async function start() {
  if (typeof (window as any).L === 'undefined') {
    fatal('Map could not load', 'The map library failed to download. Check your internet connection and try again.');
    return;
  }
  let state = null;
  try { state = await loadGame(); } catch { state = null; }
  const routing = new OsrmRouting(state?.settings.routingUrl || 'https://router.project-osrm.org');
  const game = new Game(state || newGameState(), routing);
  game.resumeAfterLoad();
  (window as any).__game = game; // handy for debugging from the console
  createRoot(document.getElementById('root')).render(<App game={game} routing={routing} firstRun={!state} />);

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  }
}

start().catch(e => fatal('Something went wrong', String(e?.message || e)));
