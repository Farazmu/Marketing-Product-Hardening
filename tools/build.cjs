// Assemble the marketing Product Hardening page from the shell and the per-sub-module maps.
// usage: node build.cjs <shell.html> <marketing dir> <tickets.json> <out.html> [--smoke]
const fs = require('fs');
const path = require('path');
const [, , shellFile, dataDir, ticketsFile, outFile, flag] = process.argv;

// Sidebar order of the marketing module.
const ORDER = ['overview', 'guestbook', 'reviews', 'campaigns', 'journeys', 'menuboards', 'website', 'brandbook', 'deals', 'spotlights', 'loyalty', 'giftcards'];
const tickets = JSON.parse(fs.readFileSync(ticketsFile, 'utf8'));
const byKey = new Map(tickets.map(t => [t.k, t]));

const CHANNELS = {}, used = new Set(), missing = [];
for (const key of ORDER) {
  const f = path.join(dataDir, key + '.json');
  if (!fs.existsSync(f)) { missing.push(key); continue; }
  const c = JSON.parse(fs.readFileSync(f, 'utf8'));
  c.NODES.forEach(n => n.e.forEach(x => { x[4] = x[4].map(String); x[4].forEach(id => used.add(id)); }));
  CHANNELS[key] = { name: c.name, title: c.title, BANDS: c.BANDS, NODES: c.NODES.map(({ id, b, k, rel, internalOnly, t, d, sys, e }) => ({ id, b, k, rel, internalOnly, t, d, sys, e })), EDGES: c.EDGES, PATH_GROUPS: c.PATH_GROUPS, PATHS: c.PATHS, NOTES: c.NOTES || [] };
}
const TICKETS = {};
[...used].sort().forEach(id => { const t = byKey.get(id); if (!t) throw new Error('unknown ticket ' + id); TICKETS[id] = [t.t.trim(), t.s, t.ty === 'Bug' ? 'b' : 'f', t.p, t.c]; });
const META = { range: '1 Sep to 16 Nov 2026', asOf: '10 Nov 2026' };
const order = ORDER.filter(k => CHANNELS[k]);
const safe = o => JSON.stringify(o).replace(/</g, '\\u003c');
const data = `const CHANNEL_ORDER = ${safe(order)};\nconst CHANNELS = ${safe(CHANNELS)};\nconst TICKETS = ${safe(TICKETS)};\nconst META = ${safe(META)};`;
const html = fs.readFileSync(shellFile, 'utf8').replace('/*DATA*/', () => data);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, html);

const tot = order.reduce((a, k) => { const c = CHANNELS[k]; a.n += c.NODES.length; a.e += c.NODES.reduce((s, n) => s + n.e.length, 0); a.p += c.PATHS.length; return a; }, { n: 0, e: 0, p: 0 });
console.log(`built ${outFile}: ${order.length} sub-modules, ${tot.n} steps, ${tot.e} errors, ${tot.p} paths, ${used.size} tickets, ${(html.length / 1024).toFixed(0)} KB`);
if (missing.length) console.log('MISSING: ' + missing.join(', '));
console.log('unattached tickets:\n' + tickets.filter(t => !used.has(t.k)).map(t => `  ${t.k} [${t.pp || '-'} > ${t.pc || '-'}] ${t.t.trim()}`).join('\n'));

if (flag === '--smoke') {
  // Run the page script against a stub DOM: every sub-module, every path, every step, both tabs.
  const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
  const els = new Map(), handlers = {};
  const el = sel => { if (!els.has(sel)) { const o = { sel, on: {}, innerHTML: '', textContent: '', value: '', hidden: false, scrollTop: 0, dataset: {}, classList: { add() {}, remove() {} }, setAttribute() {}, addEventListener(t, f) { o.on[t] = f; }, focus() {}, setSelectionRange() {}, scrollIntoView() {} }; els.set(sel, o); } return els.get(sel); };
  const document = { body: el('body'), querySelector: el, querySelectorAll: () => [], addEventListener: (t, f) => { handlers[t] = f; } };
  const window = { addEventListener() {} }, location = { hash: '' }, localStorage = { getItem: () => null, setItem() {} };
  new Function('document', 'window', 'location', 'localStorage', script)(document, window, location, localStorage);
  const click = ds => handlers.click({ target: { closest: s => (s === 'a' || s === '.card') ? null : { dataset: ds } } });
  let renders = 0;
  for (const k of order) {
    click({ ch: k });
    for (const p of CHANNELS[k].PATHS) {
      click({ tab: 'journey' });
      el('#path').on.change({ target: { value: p.id } }); renders++;
      if (!el('#drawer').innerHTML.includes('Steps in order')) throw new Error(`path drawer empty for ${k} ${p.id}`);
      click({ tab: 'errors' }); renders++;
    }
    click({ tab: 'journey' }); click({ act: 'clear' });
    CHANNELS[k].NODES.forEach(n => { click({ node: n.id }); renders++; if (!el('#drawer').innerHTML.includes('What can go wrong')) throw new Error(`drawer empty for ${k} ${n.id}`); });
    click({ act: 'close' });
    if (!el('#journey').innerHTML.includes('class="card')) throw new Error('no cards for ' + k);
    click({ tab: 'errors' }); click({ tix: '1' }); click({ sev: 'L' }); el('#bk').on.change({ target: { value: 'CX' } }); el('#q').on.input({ target: { value: 'prod', selectionStart: 4 } });
    if (!el('#errors').innerHTML.includes('<table>')) throw new Error('no table for ' + k);
  }
  console.log(`smoke OK: ${renders} renders, last summary: ${el('#sum').innerHTML.replace(/<[^>]+>/g, '')}`);
}
