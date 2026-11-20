// Pull marketing-related tickets out of the scrum Jira dashboard snapshot.
const fs = require('fs');
const [, , src, outJson, outTxt] = process.argv;
const html = fs.readFileSync(src, 'utf8');
const BS = String.fromCharCode(92);
const grab = (name) => {
  const i = html.indexOf('var ' + name + '=');
  if (i < 0) throw new Error('missing ' + name);
  const j = html.indexOf('{', i);
  let depth = 0, inStr = false, esc = false, k = j;
  for (; k < html.length; k++) {
    const c = html[k];
    if (inStr) { if (esc) esc = false; else if (c === BS) esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true; else if (c === '{') depth++; else if (c === '}') { depth--; if (!depth) break; }
  }
  return JSON.parse(html.slice(j, k + 1));
};
const DATA = grab('DATA'), FD = grab('FD');
const MODS = new Set(['Marketing', 'Menu Boards', 'Website']);
const PARENTS = new Set(['Marketing', 'Menu Boards', 'Web Builder']);
const SUBS = new Set(['Mom::Review Management', 'Pos::Giftcard', 'Pos::Loyalty', 'Kiosk::Loyalty', 'Online and QR::Online Giftcards', 'Kiosk::Order Ready Alert', 'Online and QR::SMS Receipt/Order Confirmation Delivery Failure']);
const RX = /loyalty|gift ?card|\bdeals?\b|campaign|journey|review|guest ?book|spotlight|brand ?(book|guide)|menu ?boards?|menuboard|website|web ?builder|promo|\bpoints\b|segment|emailer|\bsms\b|banner|screensaver|announcement|content calendar|social/i;
const rows = DATA.rows.map(x => ({ k: x[0], t: x[1], s: x[2], ty: x[3] === 'b' ? 'Bug' : 'Feature request', p: x[4], c: x[5], m: x[6], rc: x[7], pp: x[8], pc: x[9], ff: x[10] }));
// Live top-up from Jira, created after the 10 Nov snapshot.
rows.unshift(
  { k: '5111', t: "Rendezvous -  Gift card scan shows 'POS data sync in progress' error and fails to apply payment", s: 'RCA DONE', ty: 'Bug', p: 'Highest', c: '2026-11-12', m: ['POS'], rc: '', pp: 'Pos', pc: 'Payment', ff: '' },
  { k: '5099', t: 'LGCRC - POS/CFD - Display of previous gift card amount on subsequent card transaction', s: 'Newly Reported', ty: 'Bug', p: 'Highest', c: '2026-11-11', m: ['POS'], rc: '', pp: 'Pos', pc: 'CFD', ff: '' }
);
const pick = rows.filter(r => r.m.some(m => MODS.has(m)) || PARENTS.has(r.pp) || SUBS.has(r.pp + '::' + r.pc) || RX.test(r.t));
fs.writeFileSync(outJson, JSON.stringify(pick, null, 1));
let txt = `Snapshot ${DATA.snapshot} plus live top-up to 16 Nov. ${pick.length} of ${rows.length} tickets look marketing-related.\n\n`;
pick.forEach(r => { txt += `PROD-${r.k} | ${r.ty} | ${r.s} | ${r.p} | ${r.c} | module: ${r.m.join(', ')} | product: ${r.pp || '-'} > ${r.pc || '-'}\n  ${r.t}${r.rc ? '\n  RCA: ' + r.rc : ''}\n`; });
txt += '\n\n=== Scrum sub-area notes (summary, failure points, root causes) ===\n';
Object.entries(FD.sub).filter(([k, v]) => PARENTS.has(v.parent) || SUBS.has(k)).forEach(([k, v]) => {
  txt += `\n[${k}] ${v.summary}\n  Flow: ${v.steps.map(s => s.t).join(' > ')}\n  Failure points: ${v.fails.map(f => f.label).join(' | ')}\n${v.causes.map(c => '  Cause: ' + c).join('\n')}\n`;
});
fs.writeFileSync(outTxt, txt);
console.log(pick.length, 'of', rows.length, '| bytes', txt.length);
