// Validate one channel file of the marketing Product Hardening map.
// usage: node validate.cjs <channel.json> [tickets.json]
const fs = require('fs');
const path = require('path');
const [, , file, ticketsFile = path.join(__dirname, '..', 'out', 'tickets.json')] = process.argv;
const errs = [], warns = [];
const E = m => errs.push(m), W = m => warns.push(m);
let c;
try { c = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { console.error('NOT VALID JSON: ' + e.message); process.exit(1); }
const known = new Set(JSON.parse(fs.readFileSync(ticketsFile, 'utf8')).map(t => t.k));

const KINDS = new Set(['op', 'cust', 'soft', 'int', 'dec', 'term']);
const RELS = new Set(['L', 'R8', 'R9', 'R10', 'NEXT', 'TBC']);
const SEVS = new Set(['C', 'H', 'M', 'L']);
const BUCKETS = new Set(['M', 'L', 'S', 'OB', 'D', 'B', 'R', 'CN', 'CX', 'T']);
const CONTRACTION = /\b\w+n['’]t\b|\b(it|that|there|what|here|who|let)['’]s\b|\b\w+['’](re|ve|ll)\b|\b(I|you|we|they|he|she)['’]d\b/i;
const style = (s, where) => {
  if (typeof s !== 'string' || !s.trim()) return E(`${where}: empty text`);
  if (CONTRACTION.test(s)) E(`${where}: contraction in "${s}" (spell it out: cannot, does not)`);
  if (/[—–]/.test(s)) E(`${where}: em or en dash in "${s}" (use a comma, colon or full stop)`);
};

['key', 'name', 'title'].forEach(k => { if (typeof c[k] !== 'string' || !c[k]) E(`missing top-level "${k}"`); });
const bands = new Map();
(c.BANDS || []).forEach(b => {
  if (!/^[A-Z]$/.test(b.id)) E(`band id "${b.id}" must be one capital letter`);
  if (bands.has(b.id)) E(`duplicate band ${b.id}`);
  bands.set(b.id, 0); style(b.t, `band ${b.id} title`); style(b.s, `band ${b.id} subtitle`);
});
if (!bands.size) E('no BANDS');

const nodes = new Map();
let nErr = 0, nTix = 0; const sevCount = { C: 0, H: 0, M: 0, L: 0 }; const usedTix = new Set();
(c.NODES || []).forEach(n => {
  const w = `node ${n.id}`;
  if (!/^[A-Z]\d+$/.test(n.id || '')) return E(`${w}: id must be band letter + number`);
  if (nodes.has(n.id)) E(`${w}: duplicate id`);
  nodes.set(n.id, n);
  if (!bands.has(n.b)) E(`${w}: unknown band "${n.b}"`); else bands.set(n.b, bands.get(n.b) + 1);
  if (n.id[0] !== n.b) E(`${w}: id must start with its band letter ${n.b}`);
  if (!KINDS.has(n.k)) E(`${w}: kind "${n.k}" not in ${[...KINDS]}`);
  if (!RELS.has(n.rel)) E(`${w}: rel "${n.rel}" not in ${[...RELS]}`);
  style(n.t, `${w} title`); style(n.d, `${w} description`);
  if ((n.t || '').length > 64) W(`${w}: title is ${n.t.length} chars, keep it under 64`);
  if (!Array.isArray(n.sys)) E(`${w}: sys must be an array`);
  if (!Array.isArray(n.e) || !n.e.length) return E(`${w}: needs at least one error`);
  if (n.e.length < 2 && n.k !== 'term') W(`${w}: only ${n.e.length} error, most steps have 2 to 7`);
  n.e.forEach((x, i) => {
    const we = `${w} error ${i + 1}`;
    if (!Array.isArray(x) || x.length !== 5) return E(`${we}: must be [what, impact, severity, buckets, tickets]`);
    style(x[0], we); style(x[1], `${we} impact`);
    if (/\.$/.test(x[0]) || /\.$/.test(x[1])) W(`${we}: no trailing full stop`);
    if (!SEVS.has(x[2])) E(`${we}: severity "${x[2]}"`); else sevCount[x[2]]++;
    String(x[3]).split(',').forEach(b => { if (!BUCKETS.has(b)) E(`${we}: bucket "${b}" not in ${[...BUCKETS]}`); });
    if (!Array.isArray(x[4])) return E(`${we}: tickets must be an array, use [] when none`);
    x[4].forEach(t => { if (!known.has(String(t))) E(`${we}: ticket "${t}" is not in tickets.json (use the 4 digit number as a string)`); else { usedTix.add(String(t)); nTix++; } });
    nErr++;
  });
});
bands.forEach((n, id) => { if (!n) E(`band ${id} has no nodes`); });

const edgeSet = new Set(), out = new Map(), inn = new Map();
(c.EDGES || []).forEach(e => {
  const [a, b, label] = e;
  if (!nodes.has(a) || !nodes.has(b)) return E(`edge ${a} > ${b}: unknown node`);
  if (edgeSet.has(a + '>' + b)) E(`duplicate edge ${a} > ${b}`);
  edgeSet.add(a + '>' + b); out.set(a, (out.get(a) || 0) + 1); inn.set(b, (inn.get(b) || 0) + 1);
  if (typeof label !== 'string') E(`edge ${a} > ${b}: label must be a string, "" when none`);
  else if (label) style(label, `edge ${a} > ${b} label`);
});
nodes.forEach(n => {
  if (n.k !== 'term' && !out.get(n.id)) E(`node ${n.id} "${n.t}": no outgoing edge (only term nodes may end a journey)`);
  if (!inn.get(n.id) && n.k !== 'term') E(`node ${n.id} "${n.t}": nothing leads here (only a term start node may have no incoming edge)`);
  if (n.k === 'dec' && (out.get(n.id) || 0) < 2) W(`decision ${n.id} "${n.t}": has fewer than 2 outcomes`);
});

if (!Array.isArray(c.PATH_GROUPS) || !c.PATH_GROUPS.length) E('no PATH_GROUPS');
const onPath = new Set(), pids = new Set();
(c.PATHS || []).forEach(p => {
  const w = `path ${p.id}`;
  if (pids.has(p.id)) E(`${w}: duplicate id`); pids.add(p.id);
  if (!(p.g >= 0 && p.g < (c.PATH_GROUPS || []).length)) E(`${w}: group index ${p.g}`);
  style(p.t, `${w} title`); style(p.n, `${w} note`);
  const seq = String(p.s || '').split(' ').filter(Boolean);
  if (seq.length < 2) E(`${w}: needs at least 2 steps`);
  seq.forEach((id, i) => {
    if (!nodes.has(id)) return E(`${w}: unknown step ${id}`);
    onPath.add(id);
    if (i && nodes.has(seq[i - 1]) && !edgeSet.has(seq[i - 1] + '>' + id)) E(`${w}: no edge ${seq[i - 1]} > ${id}`);
  });
  String(p.side || '').split(' ').filter(Boolean).forEach(id => { if (!nodes.has(id)) E(`${w}: unknown side step ${id}`); else onPath.add(id); });
});
if (!(c.PATHS || []).length) E('no PATHS');
nodes.forEach(n => { if (!onPath.has(n.id)) W(`node ${n.id} "${n.t}" is on no path`); });

console.log(`${c.key}: ${bands.size} stages, ${nodes.size} steps, ${edgeSet.size} edges, ${(c.PATHS || []).length} paths, ${nErr} errors (C ${sevCount.C}, H ${sevCount.H}, M ${sevCount.M}, L ${sevCount.L}), ${usedTix.size} tickets attached: ${[...usedTix].sort().join(' ')}`);
warns.forEach(w => console.log('  warn  ' + w));
errs.forEach(e => console.log('  ERROR ' + e));
console.log(errs.length ? `FAILED with ${errs.length} errors` : 'OK');
process.exit(errs.length ? 1 : 0);
