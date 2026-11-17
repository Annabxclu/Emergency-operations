// Build: bundles src/ with esbuild into dist/, copies public/.
// Usage: node build.mjs [--watch]
// Uses the project's esbuild (npm install) if present, else a preinstalled copy.
let esbuild;
try { esbuild = await import('esbuild'); } catch { esbuild = await import('/opt/npm-tools/node_modules/esbuild/lib/main.js'); }
const outDir = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'dist';
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const watch = process.argv.includes('--watch');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync('public', outDir, { recursive: true });
const stamp = Date.now().toString(36);
writeFileSync(`${outDir}/sw.js`, readFileSync(`${outDir}/sw.js`, 'utf8').replace('__BUILD__', stamp));

const opts = {
  entryPoints: ['src/main.tsx'], bundle: true, outfile: `${outDir}/app.js`, format: 'iife', target: ['es2020', 'safari15'],
  jsx: 'automatic', minify: !watch, sourcemap: watch ? 'inline' : false, nodePaths: ['node_modules', '/opt/npm-tools/node_modules'],
  define: { 'process.env.NODE_ENV': watch ? '"development"' : '"production"' }, logLevel: 'info',
};
if (watch) { const ctx = await esbuild.context(opts); await ctx.watch(); } else { await esbuild.build(opts); writeFileSync(`${outDir}/.nojekyll`, ''); console.log(`Built ${outDir}/ ·`, stamp); }
