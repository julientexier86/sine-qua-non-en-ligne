/* ===== Schémas : objets géométriques dépendants (chaînes identiques à celles de la version Windows) ===== */
const SCH_COLORS = ['Noir', 'Bordeaux', 'Vert', 'Olive', 'Bleu marine', 'Violet', 'Sarcelle', 'Gris clair', 'Gris', 'Rouge', 'Vert vif', 'Jaune', 'Bleu', 'Magenta', 'Cyan', 'Blanc'];
const schCol = i => tcolor(PALETTE16[clamp(+i || 0, 0, 15)]);
const sNum = s => { s = String(s == null ? '' : s).trim(); if (!s) return NaN; let v = parseNum(s, NaN); if (Number.isFinite(v)) return v; return evalConst(s, NaN); };
const sFmt4 = v => { const t = +Number(v || 0).toPrecision(4); return String(Math.abs(t) < 1e-9 ? 0 : t).replace('.', ','); };
function schCur(s) { return { cut(sep) { const i = s.indexOf(sep); const r = i < 0 ? s : s.slice(0, i); s = i < 0 ? '' : s.slice(i + sep.length); return r; },
  item() { if (s[0] === '(') { const i = s.indexOf(')'); const r = s.slice(0, i + 1); s = s.slice(i + 2); return r; } const i = s.indexOf(','); const r = i < 0 ? s : s.slice(0, i); s = i < 0 ? '' : s.slice(i + 1); return r; }, rest: () => s }; }
const schDefs = {
  Point: {
    start: 'Point ',
    parse(raw) { const c = schCur(raw.slice(6)); const p = { nom: c.cut(','), nat: +c.cut(',') }; let r = c.rest();
      if (p.nat === 3) { const k = r.indexOf(':'); p.def = r.slice(0, k); r = r.slice(k + 1); }
      else if (p.nat === 0 || p.nat === 8) { const a = r.indexOf(';'), b = r.indexOf(';', a + 1); p.def = r.slice(0, b); r = r.slice(b + 1); }
      else { const k = r.indexOf(';'); p.def = r.slice(0, k); r = r.slice(k + 1); }
      const m = r.split(','); p.style = +(m[0] || '1')[0]; p.pos = +m[1] || 0; p.taille = +m[2] || 0; p.cote = +m[3] || 0; p.col = +m[4] || 0; return p; },
    build(p) { return `Point ${p.nom},${p.nat},${p.def}${p.nat === 3 ? ':' : ';'}${p.style},${p.pos},${p.taille},${p.cote},${p.col}`; },
    make: () => ({ nom: 'A', nat: 0, def: '1;1', style: 3, pos: 1, taille: 1, cote: 0, col: 0 }) },
  Segment: {
    start: 'Segment,',
    parse(raw) { const c = schCur(raw.slice(8)); const p = { nat: +c.cut(',') }; c.cut('['); p.orig = c.cut(','); p.extr = c.cut(']'); c.cut(',');
      p.x1 = c.cut(';'); p.y1 = c.cut(';'); p.x2 = c.cut(';'); p.y2 = c.cut(';'); const m = c.rest().split(',');
      p.A = m[0] || ''; p.B = m[1] || ''; p.C = m[2] || ''; p.som = m[3] || ''; const e = +m[4] || 0; p.codage = Math.floor(e / 10); p.ep = e % 10; p.style = +m[5] || 0; p.couleur = +m[6] || 0;
      p.format = +m[7] || 0; const t = +m[8]; p.ferm = (isNaN(t) ? 0 : t) % 10; p.taille = Math.floor((isNaN(t) ? 50 : t) / 10) || 5; return p; },
    build(p) { return `Segment,${p.nat},[${p.orig},${p.extr}],${p.x1};${p.y1};${p.x2};${p.y2};${p.A},${p.B},${p.C},${p.som},${p.ep + 10 * p.codage},${p.style},${p.couleur},${p.format},${p.ferm + 10 * p.taille}`; },
    make: () => ({ nat: 1, orig: '', extr: '', x1: '0', y1: '0', x2: '1', y2: '1', A: '', B: '', C: '', som: '', codage: 0, ep: 1, style: 0, couleur: 0, format: 0, ferm: 0, taille: 5 }) },
  Vecteur: {
    start: 'Vecteur,',
    parse(raw) { const c = schCur(raw.slice(8)); const p = { nom: c.cut(','), pos: +c.cut(','), nat: +c.cut(',') }; p.ab = c.cut(';'); p.or = c.cut(';'); p.orig = c.cut(','); p.extr = c.cut(',');
      p.fleche = +c.cut(',') || 0; const te = +c.cut(',') || 0; p.ep = te % 10; p.taille = Math.floor(te / 10) || 5; p.style = +c.cut(',') || 1; p.col = +c.cut(',') || 0; p.xo = c.cut(';'); p.yo = c.rest(); return p; },
    build(p) { return `Vecteur,${p.nom},${p.pos},${p.nat},${p.ab};${p.or};${p.orig},${p.extr},${p.fleche},${10 * p.taille + p.ep},${p.style},${p.col},${p.xo};${p.yo}`; },
    make: () => ({ nom: 'u', pos: 1, nat: 0, ab: '2', or: '1', orig: '', extr: '', fleche: 1, ep: 1, taille: 5, style: 1, col: 0, xo: '0', yo: '0' }) },
  Droite: {
    start: 'Droite,',
    parse(raw) { const c = schCur(raw.slice(7)); const p = { nom: c.cut(','), nat: +c.cut(','), p1: c.cut(','), p2: c.cut(','), vd: c.cut(';'), vn: c.cut(';'), dp: c.cut(';'), dpp: c.cut(';') };
      const m = c.rest().split(','); p.seg = (m[0] || m[1]) ? m[0] + ',' + m[1] : ''; p.a3 = (m[2] || m[3] || m[4]) ? m.slice(2, 5).join(',') : ''; p.a2 = (m[5] || m[6] || m[7]) ? m.slice(5, 8).join(',') : '';
      p.ep = +m[8] || 0; p.style = +m[9] || 0; p.col = +m[10] || 0; const q = (m.slice(11).join(',')).split(';'); p.cx = q[0]; p.cy = q[1]; p.cx0 = q[2]; p.cy0 = q[3]; return p; },
    build(p, cache) { const q = cache || [p.cx, p.cy, p.cx0, p.cy0]; return `Droite,${p.nom},${p.nat},${p.p1},${p.p2},${p.vd};${p.vn};${p.dp};${p.dpp};${p.seg ? p.seg + ',' : ',,'}${p.a3 ? p.a3 + ',' : ',,,'}${p.a2 ? p.a2 + ',' : ',,,'}${p.ep},${p.style},${p.col},${q.join(';')}`; },
    make: () => ({ nom: 'd', nat: 0, p1: 'A', p2: 'B', vd: '', vn: '', dp: '', dpp: '', seg: '', a3: '', a2: '', ep: 1, style: 0, col: 0, cx: '0', cy: '0', cx0: '0', cy0: '0' }) },
  'Demi-droite': {
    start: 'Demi-droite,',
    parse(raw) { const c = schCur(raw.slice(12)); const p = { orig: c.item(), nat: +c.cut(',') }; p.pt = c.item(); p.vd = c.item(); p.ang = c.cut(';'); const m = c.rest().split(','); p.ep = +m[0] || 0; p.style = +m[1] || 0; p.col = +m[2] || 0; p.deg = m[3] === '1' ? 1 : 0; return p; },
    build(p) { return `Demi-droite,${p.orig},${p.nat},${p.pt},${p.vd},${p.ang};${p.ep},${p.style},${p.col},${p.deg}`; },
    make: () => ({ orig: 'A', nat: 0, pt: 'B', vd: '', ang: '', ep: 1, style: 0, col: 0, deg: 1 }) },
  Cercle: {
    start: 'Cercle,',
    parse(raw) { const c = schCur(raw.slice(7)); const p = { nat: +c.cut(',') }; p.c = p.a = p.b = p.r = p.d = '';
      if (p.nat === 0) { p.c = c.cut(','); p.r = c.cut(';'); } else if (p.nat === 1) { p.c = c.cut(','); p.a = c.cut(','); } else if (p.nat === 2) { p.a = c.cut(','); p.b = c.cut(','); }
      else if (p.nat === 3 || p.nat === 4) { p.a = c.cut(','); p.b = c.cut(','); p.c = c.cut(','); } else { p.c = c.cut(','); p.d = c.cut(';'); }
      const m = c.rest().split(','); p.ep = +m[0] || 0; p.style = +m[1] || 0; p.col = +m[2] || 0; p.fond = m[3] === undefined ? 15 : +m[3]; return p; },
    build(p) { const h = p.nat === 0 ? `${p.c},${p.r};` : p.nat === 1 ? `${p.c},${p.a},` : p.nat === 2 ? `${p.a},${p.b},` : p.nat < 5 ? `${p.a},${p.b},${p.c},` : `${p.c},${p.d};`; return `Cercle,${p.nat},${h}${p.ep},${p.style},${p.col},${p.fond}`; },
    make: () => ({ nat: 0, c: 'A', a: '', b: '', r: '2', d: '', ep: 1, style: 0, col: 0, fond: 15 }) },
  Ellipse: {
    start: 'Ellipse,',
    parse(raw) { const m = raw.slice(8).split(','); return { nat: +m[0], c: m[1] || '', rx: m[2] || '', ry: m[3] || '', a: m[4] || '', b: m[5] || '', ep: +m[6] || 0, style: +m[7] || 0, col: +m[8] || 0, fond: m[9] === undefined ? 15 : +m[9] }; },
    build(p) { return `Ellipse,${p.nat},${p.c},${p.rx},${p.ry},${p.a},${p.b},${p.ep},${p.style},${p.col},${p.fond}`; },
    make: () => ({ nat: 0, c: 'A', rx: '3', ry: '2', a: '', b: '', ep: 1, style: 0, col: 0, fond: 15 }) },
  'Carré': {
    start: 'Carré,',
    parse(raw) { const m = raw.slice(6).split(','); return { nat: +m[0], a: m[1] || '', b: m[2] || '', ep: +m[3] || 0, style: +m[4] || 0, col: +m[5] || 0, fond: m[6] === undefined ? 15 : +m[6] }; },
    build(p) { return `Carré,${p.nat},${p.a},${p.b},${p.ep},${p.style},${p.col},${p.fond}`; },
    make: () => ({ nat: 2, a: 'A', b: 'B', ep: 1, style: 0, col: 0, fond: 15 }) },
  Polygone: {
    start: 'Polygone de type ',
    parse(raw) { const m = raw.slice(17).split(','); const n = +m[1]; return { nat: +m[0], n, som: m.slice(2, 2 + n).join(','), ep: +m[2 + n] || 0, style: +m[3 + n] || 0, col: +m[4 + n] || 0, fond: m[5 + n] === undefined ? 15 : +m[5 + n], hach: +m[6 + n] || 0 }; },
    build(p) { const n = p.som ? p.som.split(',').length : 0; return `Polygone de type ${p.nat},${n},${p.som},${p.ep},${p.style},${p.col},${p.fond},${p.hach}`; },
    make: () => ({ nat: 3, som: 'A,B,C', ep: 1, style: 0, col: 0, fond: 15, hach: 0 }) },
  'Courbe de Bézier': {
    start: 'Courbe de Bézier de type ',
    parse(raw) { const m = raw.slice(24).split(','); const n = +m[1]; return { nat: +m[0], som: m.slice(2, 2 + n).join(','), ep: +m[2 + n] || 0, col: +m[3 + n] || 0 }; },
    build(p) { return `Courbe de Bézier de type ${p.nat},${p.som.split(',').length},${p.som},${p.ep},${p.col}`; },
    make: () => ({ nat: 0, som: 'A,B,C,D', ep: 3, col: 0 }) },
  Angle: {
    start: 'Angle ',
    parse(raw) { const three = raw.startsWith('Angle 3 points,'); const m = raw.slice(raw.indexOf(',') + 1).split(','); const p = { nat: three ? 0 : 1, A: '', B: '', C: '', som: '', deb: '0', fin: '90' }; let i = 0;
      if (three) { p.A = m[0]; p.B = m[1]; p.C = m[2]; i = 3; } else { p.som = m[0]; p.deb = m[1]; p.fin = m[2]; i = 3; }
      p.style = +m[i] || 0; p.ep = +m[i + 1] || 0; p.col = +m[i + 2] || 0; p.ori = +m[i + 3] || 0; p.taille = +m[i + 4] || 6; return p; },
    build(p) { return (p.nat === 0 ? `Angle 3 points,${p.A},${p.B},${p.C},` : `Angle sommet et angles,${p.som},${p.deb},${p.fin},`) + `${p.style},${p.ep},${p.col},${p.ori},${p.taille}`; },
    make: () => ({ nat: 0, A: 'A', B: 'B', C: 'C', som: '', deb: '0', fin: '90', style: 0, ep: 1, col: 0, ori: 0, taille: 6 }) },
  'Polygone prédéfini': {
    start: 'Polygone prédéfini,',
    parse(raw) { const m = raw.slice(19).split(','); const nat = +m[0], four = nat >= 6; const p = { nat, opt: +m[1] || 0, A: m[2] || '', B: m[3] || '', C: m[4] || '', D: '' }; let i = 5; if (four) { p.D = m[5] || ''; i = 6; }
      p.e = [m[i], m[i + 1], m[i + 2], m[i + 3], m[i + 4]].map(x => x || ''); p.ep = +m[i + 5] || 0; p.style = +m[i + 6] || 0; p.col = +m[i + 7] || 0; p.fond = m[i + 8] === undefined ? 15 : +m[i + 8]; return p; },
    build(p) { return `Polygone prédéfini,${p.nat},${p.opt},${p.A},${p.B},${p.C},${p.nat >= 6 ? p.D + ',' : ''}${p.e.join(',')},${p.ep},${p.style},${p.col},${p.fond}`; },
    make: () => ({ nat: 0, opt: 0, A: 'A', B: 'B', C: 'C', D: 'D', e: ['4', '', '', '', ''], ep: 1, style: 0, col: 0, fond: 15 }) },
  Conique: {
    start: 'Conique,',
    parse(raw) { const m = raw.split(','); const g = i => m[i] === undefined ? '' : m[i]; const p = { nat: +g(1) || 0, foyer: g(2), dir: g(3), exc: g(4), A: g(5), B: g(6), C: g(7), D: g(8), E: g(9), F: g(10) };
      p.f = []; for (let i = 0; i < 11; i++) p.f.push(g(11 + i) === '1' ? 1 : 0); p.ep = +g(22) || 1; p.couleur = +g(24) || 0; p.sd = +g(26) || 1; p.cd = +g(27) || 0; p.sp = +g(29) || 7; return p; },
    build(p) { return `Conique,${p.nat},${p.foyer},${p.dir},${p.exc},${p.A},${p.B},${p.C},${p.D},${p.E},${p.F},${p.f.join(',')},${p.ep},1,${p.couleur},1,${p.sd},${p.cd},2,${p.sp},0`; },
    make: () => ({ nat: 0, foyer: '(2;0)', dir: 'x=-2', exc: '1', A: '', B: '', C: '', D: '', E: '', F: '', f: [1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1], ep: 2, couleur: 16711680, sd: 2, cd: 255, sp: 7 }) },
  Colorier: {
    start: 'Colorier;',
    parse(raw) { const m = raw.split(';'); return { x: m[1] || '0', y: m[2] || '0', col: +m[3] || 0 }; },
    build(p) { return `Colorier;${p.x};${p.y};${p.col}`; },
    make: () => ({ x: '0', y: '0', col: 255 }) },
};
function schKind(raw) { for (const k in schDefs) if (raw.startsWith(schDefs[k].start)) return k; return null; }
function schNorm(o) { // anciens objets structurés (versions précédentes de l'application)
  if (o.kind === 'point') { o.raw = `Point ${o.nom || ''},0,${fmtNum(o.x)};${fmtNum(o.y)};${o.tail || '3,1,1,0,0'}`; o.kind = 'raw'; }
  else if (o.kind === 'segment') { o.raw = serializeObj(o, '7,1,2,0,0'); o.kind = 'raw'; }
  return o;
}
function schLine(a, b) { return { x: b[0] - a[0], y: b[1] - a[1], x0: a[0], y0: a[1] }; }
function schInter(A, B, C, D) { const d = (B[0] - A[0]) * (D[1] - C[1]) - (B[1] - A[1]) * (D[0] - C[0]); if (!d) return null; const t = ((C[0] - A[0]) * (D[1] - C[1]) - (C[1] - A[1]) * (D[0] - C[0])) / d; return [A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]; }
function schCtx(objs) {
  const P = {}, V = {}, D = {}; objs.forEach(o => { schNorm(o); if (o.kind !== 'raw') return; const k = schKind(o.raw); try { if (k === 'Point') { const p = schDefs.Point.parse(o.raw); P[p.nom] = p; } else if (k === 'Vecteur') { const p = schDefs.Vecteur.parse(o.raw); V[p.nom] = p; } else if (k === 'Droite') { const p = schDefs.Droite.parse(o.raw); D[p.nom] = p; } } catch (e) { /* objet illisible */ } });
  const memo = { P: {}, V: {}, D: {} }, busy = new Set();
  const guard = (key, fn) => { if (busy.has(key)) return null; busy.add(key); try { return fn(); } catch (e) { return null; } finally { busy.delete(key); } };
  const T = { point, vecteur, droite, lineOf };
  function point(n) { n = String(n || '').trim(); if (n in memo.P) return memo.P[n]; const p = P[n]; if (!p) return null; const r = guard('P' + n, () => evalPoint(p)); memo.P[n] = r; return r; }
  function vecteur(n) { n = String(n || '').trim(); if (n in memo.V) return memo.V[n]; const p = V[n]; if (!p) return null; const r = guard('V' + n, () => { if (p.nat === 0) { const a = sNum(p.ab), b = sNum(p.or); return isNaN(a) || isNaN(b) ? null : [a, b]; } const A = point(p.orig), B = point(p.extr); return A && B ? [B[0] - A[0], B[1] - A[1]] : null; }); memo.V[n] = r; return r; }
  function droite(n) { n = String(n || '').trim(); if (n in memo.D) return memo.D[n]; const p = D[n]; if (!p) return null; const r = guard('D' + n, () => evalDroite(p)); memo.D[n] = r; return r; }
  function lineOf(s) { s = String(s || '').trim(); if (s.includes(',')) { const [a, b] = s.split(',').map(x => x.trim()); const A = point(a), B = point(b); return A && B ? schLine(A, B) : null; } return droite(s); }
  function evalPoint(p) {
    const d = p.def;
    switch (p.nat) {
      case 0: { const [a, b] = d.split(';'), x = sNum(a), y = sNum(b); return isNaN(x) || isNaN(y) ? null : [x, y]; }
      case 1: { const [c, ab] = d.split(';'), [a, b] = (ab || '').split(','), k = sNum(c), A = point(a), B = point(b); return A && B && !isNaN(k) ? [A[0] + k * (B[0] - A[0]), A[1] + k * (B[1] - A[1])] : null; }
      case 2: { const m = d.match(/^\((.*?)\),\((.*)\)$/); if (!m) return null; const L1 = lineOf(m[1]), L2 = lineOf(m[2]); if (!L1 || !L2) return null; return schInter([L1.x0, L1.y0], [L1.x0 + L1.x, L1.y0 + L1.y], [L2.x0, L2.y0], [L2.x0 + L2.x, L2.y0 + L2.y]); }
      case 3: { let sx = 0, sy = 0, sc = 0; const re = /\(([^;)]*);([^)]*)\)/g; let m; while ((m = re.exec(d))) { const A = point(m[1]), c = sNum(m[2]); if (!A || isNaN(c)) return null; sx += c * A[0]; sy += c * A[1]; sc += c; } return sc ? [sx / sc, sy / sc] : null; }
      case 4: { let sx = 0, sy = 0, n = 0; for (const nm of d.split(',')) { const A = point(nm); if (!A) return null; sx += A[0]; sy += A[1]; n++; } return n ? [sx / n, sy / n] : null; }
      case 5: { const [a, b, c] = d.split(','), A = point(a), B = point(b), C = point(c); return A && B && C ? [A[0] + C[0] - B[0], A[1] + C[1] - B[1]] : null; }
      case 6: { const i = d.indexOf(','), A = point(d.slice(0, i)), L = lineOf(d.slice(i + 1)); if (!A || !L) return null; const n = L.x * L.x + L.y * L.y; if (!n) return null; const t = ((A[0] - L.x0) * L.x + (A[1] - L.y0) * L.y) / n; return [L.x0 + t * L.x, L.y0 + t * L.y]; }
      case 7: { const [a, b, ang] = d.split(','), A = point(a), C = point(b), t = sNum(ang) / 180 * Math.PI; if (!A || !C || isNaN(t)) return null; return [C[0] + Math.cos(t) * (A[0] - C[0]) - Math.sin(t) * (A[1] - C[1]), C[1] + Math.sin(t) * (A[0] - C[0]) + Math.cos(t) * (A[1] - C[1])]; }
      case 8: { const [r, t] = d.split(';'), rr = sNum(r), th = sNum(t); return isNaN(rr) || isNaN(th) ? null : [rr * Math.cos(th * Math.PI / 180), rr * Math.sin(th * Math.PI / 180)]; }
    }
    return null;
  }
  function evalDroite(p) {
    const pt = point(p.p1); let r = null;
    const dirTwo = s => { const L = lineOf(s); return L ? [L.x, L.y] : null; };
    switch (p.nat) {
      case 0: { const A = point(p.p1), B = point(p.p2); r = A && B ? schLine(A, B) : null; break; }
      case 1: { const v = p.vd.includes(',') ? (() => { const [a, b] = p.vd.split(','), A = point(a), B = point(b); return A && B ? [B[0] - A[0], B[1] - A[1]] : null; })() : vecteur(p.vd); r = pt && v ? { x: v[0], y: v[1], x0: pt[0], y0: pt[1] } : null; break; }
      case 2: { const v = p.vn.includes(',') ? (() => { const [a, b] = p.vn.split(','), A = point(a), B = point(b); return A && B ? [A[1] - B[1], B[0] - A[0]] : null; })() : (() => { const w = vecteur(p.vn); return w ? [-w[1], w[0]] : null; })(); r = pt && v ? { x: v[0], y: v[1], x0: pt[0], y0: pt[1] } : null; break; }
      case 3: { const v = dirTwo(p.dp); r = pt && v ? { x: v[0], y: v[1], x0: pt[0], y0: pt[1] } : null; break; }
      case 4: { const v = dirTwo(p.dpp); r = pt && v ? { x: -v[1], y: v[0], x0: pt[0], y0: pt[1] } : null; break; }
      case 5: { const [a, b] = p.seg.split(','), A = point(a), B = point(b); r = A && B ? { x: A[1] - B[1], y: B[0] - A[0], x0: (A[0] + B[0]) / 2, y0: (A[1] + B[1]) / 2 } : null; break; }
      case 6: { const [a, b, c] = p.a3.split(','), A = point(a), B = point(b), C = point(c); if (A && B && C) { const nBA = Math.hypot(B[0] - A[0], B[1] - A[1]), nBC = Math.hypot(B[0] - C[0], B[1] - C[1]); if (nBA > 0 && nBC > 0) { const k = nBA / nBC, x3 = B[0] + k * (C[0] - B[0]), y3 = B[1] + k * (C[1] - B[1]); r = { x: A[0] + x3 - 2 * B[0], y: A[1] + y3 - 2 * B[1], x0: B[0], y0: B[1] }; } } break; }
      case 7: { const [a, b, c] = p.a2.split(','), A = point(a), v = vecteur(b), w = vecteur(c); if (A && v && w) { const nv = Math.hypot(v[0], v[1]), nw = Math.hypot(w[0], w[1]); if (nv > 0 && nw > 0) { const k = nv / nw; r = { x: v[0] + k * w[0], y: v[1] + k * w[1], x0: A[0], y0: A[1] }; } } break; }
    }
    if (r && !r.x && !r.y) r = null; return r;
  }
  T.D = D; T.P = P; T.V = V; return T;
}
/* ----- dessin ----- */
const schDash = st => st === 1 ? 'stroke-dasharray="2 1"' : st === 2 ? 'stroke-dasharray="0.5 1"' : '';
const schW = ep => f2((ep + 1) / 4);
// segments et vecteurs : à l'écran, trait d'un pixel (constaté sur Windows à 100, 200 et 250 %) ; à l'export, (ép+1)/4 mm comme l'original
const schHair = (svg, ep) => !SCH_UI ? svg : svg.replace(/stroke-width="[^"]+"/g, `stroke-width="${Math.max(1, ep)}" vector-effect="non-scaling-stroke"`);
function schBigLine(g, d, x0, y0, dx, dy, both, col, ep, st) {
  const A = [g.X(x0), g.Y(y0)], B = [g.X(x0 + dx), g.Y(y0 + dy)], L = Math.hypot(B[0] - A[0], B[1] - A[1]); if (!L) return '';
  const k = 2 * (d.W + d.H) / L, u = [(B[0] - A[0]) * k, (B[1] - A[1]) * k];
  return `<path d="M${f2(A[0] - (both ? u[0] : 0))} ${f2(A[1] - (both ? u[1] : 0))}L${f2(A[0] + u[0])} ${f2(A[1] + u[1])}" stroke="${col}" stroke-width="${schW(ep)}" ${schDash(st)} fill="none"/>`;
}
function schArrowHead(x2, y2, alpha, r, col, w, filled, lance) { // alpha : angle écran (rad) de la direction du trait vers la pointe
  const P = a => [x2 + r * Math.cos(alpha + a), y2 + r * Math.sin(alpha + a)], a = P(0.9 * Math.PI), b = P(-0.9 * Math.PI);
  const pts = lance ? [[x2 + r / 2 * Math.cos(alpha + Math.PI), y2 + r / 2 * Math.sin(alpha + Math.PI)], a, [x2, y2], b] : [a, [x2, y2], b];
  return `<${filled ? 'polygon' : 'polyline'} points="${pts.map(p => f2(p[0]) + ',' + f2(p[1])).join(' ')}" fill="${filled ? col : 'none'}" stroke="${col}" stroke-width="${w}" stroke-linejoin="miter"/>`;
}
function schPointMark(X, Y, st, e, col) { // formes et tailles de uDessin.DessinerObjetPoint (e = taille 0..2)
  e = +e || 0; const ln = (a, b, c, d, w) => `<path d="M${f2(X + a)} ${f2(Y + b)}L${f2(X + c)} ${f2(Y + d)}" stroke="${col}" stroke-width="${f2(w)}" fill="none"/>`;
  const wl = (e + 1) / 4, rc = (2 * e + 3) / 10, ray = 0.5 * (e + 1), th = 0.26, wh = (e + 1) / 10;
  const dia = (fill, w) => `<polygon points="${f2(X - 0.8 * ray)},${f2(Y)} ${f2(X)},${f2(Y - ray)} ${f2(X + 0.8 * ray)},${f2(Y)} ${f2(X)},${f2(Y + ray)}" fill="${fill}" stroke="${col}" stroke-width="${f2(w)}"/>`;
  switch (st) {
    case 1: return `<circle cx="${f2(X)}" cy="${f2(Y)}" r="${f2(rc)}" fill="${col}" stroke="${col}" stroke-width="${th}"/>`;
    case 2: return ln(-1, 0, 1, 0, wl) + ln(0, -1, 0, 1, wl);
    case 3: return ln(-0.8, -0.8, 0.8, 0.8, wl) + ln(0.8, -0.8, -0.8, 0.8, wl);
    case 4: return ln(-0.8, -0.6, 0.8, 0.6, wl) + ln(0.8, -0.6, -0.8, 0.6, wl) + ln(0, -1, 0, 1, wl);
    case 5: return `<rect x="${f2(X - rc)}" y="${f2(Y - rc)}" width="${f2(2 * rc)}" height="${f2(2 * rc)}" fill="${col}" stroke="${col}" stroke-width="${th}"/>`;
    case 6: return dia(col, th);
    case 7: return `<circle cx="${f2(X)}" cy="${f2(Y)}" r="${f2(rc)}" fill="#fff" stroke="${col}" stroke-width="${f2(wh)}"/>`;
    case 8: return `<rect x="${f2(X - rc)}" y="${f2(Y - rc)}" width="${f2(2 * rc)}" height="${f2(2 * rc)}" fill="#fff" stroke="${col}" stroke-width="${f2(wh)}"/>`;
    case 9: return dia('#fff', wh);
  }
  return '';
}
// nom d'un point : police « points » du dessin, centré à 3 mm dans la direction pos·45°, dernier caractère en indice, rien si pos = 8
let SCH_UI = false;
// à l'écran, Windows garde la police des noms de points à sa taille réelle quel que soit le zoom (constaté à 100, 200 et 250 %) ; le décalage de 3 mm suit le zoom
function schPointLabel(d, X, Y, nom, pos) {
  if (!nom || pos >= 8) return '';
  const a = pos * Math.PI / 4, cx = X + 3 * Math.cos(a), cy = Y - 3 * Math.sin(a), fs = d.gSize[1] * MM_PER_PT * (SCH_UI ? 100 / (d.zoom || 100) : 1), n = nom.length;
  const at = `font-family="${FONT_STACK(d.gFont[1])}"${fontAttrs(d.gStyle[1])} fill="${tcolor(d.gCol[1])}"`;
  let inner;
  if (n < 2 || nom[n - 1] === "'") inner = esc(nom);
  else inner = `${esc(nom.slice(0, -1))}<tspan font-size="${f2(Math.max(fs - 2 * MM_PER_PT * (SCH_UI ? 100 / (d.zoom || 100) : 1), 0.5))}" dy="${f2(0.6 * fs)}">${esc(nom[n - 1])}</tspan>`;
  return `<text x="${f2(cx)}" y="${f2(cy + 0.35 * fs)}" font-size="${f2(fs)}" ${at} text-anchor="middle">${inner}</text>`;
}
function schLabel(X, Y, text, pos, col, off = 2.4) {
  const a = (pos || 0) * Math.PI / 4, dx = Math.cos(a), dy = -Math.sin(a), sz = 10 * MM_PER_PT, ax = Math.abs(dx) < 0.1 ? 'middle' : dx > 0 ? 'start' : 'end';
  return `<text x="${f2(X + dx * off)}" y="${f2(Y + dy * off + (dy < -0.1 ? -0.3 : dy > 0.1 ? sz * 0.8 : sz * 0.35))}" font-size="${f2(sz)}" font-family="'Times New Roman',serif" font-style="italic" text-anchor="${ax}" fill="${col}">${esc(text)}</text>`;
}
function schDraw(d, g) {
  if (!SCH_NOFILL) SCH_BASE.delete(d);
  const C = schCtx(d.objs), OPAQUE = ['Cercle', 'Ellipse', 'Carré', 'Polygone', 'Polygone prédéfini'], under = [], over = [];
  d.objs.forEach(o => {
    if (o.kind !== 'raw') return; const k = schKind(o.raw); if (!k) return; let p; try { p = schDefs[k].parse(o.raw); } catch (e) { return; }
    try { (OPAQUE.includes(k) ? under : over).push(schOne(k, p, C, g, d)); } catch (e) { /* objet incomplet : ignoré */ }
  });
  return under.join('') + over.join('');
}
function schOne(k, p, C, g, d) {
  const X = g.X, Y = g.Y;
  if (k === 'Point') { const q = C.point(p.nom); if (!q) return ''; const x = X(q[0]), y = Y(q[1]), col = schCol(p.col); let s = '';
    if (p.cote) s += `<path d="M${f2(x)} ${f2(y)}L${f2(x)} ${f2(Y(0))}M${f2(x)} ${f2(y)}L${f2(X(0))} ${f2(y)}" stroke="${col}" stroke-width="0.2" stroke-dasharray="1 1" fill="none"/>`;
    s += schPointMark(x, y, p.style, p.taille, col) + schPointLabel(d, x, y, p.nom, p.pos); return s; }
  if (k === 'Segment') { let A, B;
    if (p.nat === 0) { A = C.point(p.orig); B = C.point(p.extr); } else if (p.nat === 1) { A = [sNum(p.x1), sNum(p.y1)]; B = [sNum(p.x2), sNum(p.y2)]; }
    else { const a = C.point(p.A), b = C.point(p.B), c = C.point(p.C), s = C.point(p.som); if (p.nat === 2 && a && b && c && s) { const m = p.som === p.A ? [a, [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2]] : p.som === p.B ? [b, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2]] : [c, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]]; A = m[0]; B = m[1]; }
      else if (p.nat === 3 && a && b && c && s) { let u = p.A, v = p.B; if (p.som === p.A) { u = p.B; v = p.C; } else if (p.som === p.B) { u = p.A; v = p.C; } const U = C.point(u), V = C.point(v); if (!U || !V) return ''; const dx = V[0] - U[0], dy = V[1] - U[1], n = dx * dx + dy * dy; if (!n) return ''; const t = ((s[0] - U[0]) * dx + (s[1] - U[1]) * dy) / n; A = s; B = [U[0] + t * dx, U[1] + t * dy]; } }
    if (!A || !B || A.some(isNaN) || B.some(isNaN)) return '';
    const col = tcolor(p.couleur), w = schW(p.ep), x1 = X(A[0]), y1 = Y(A[1]), x2 = X(B[0]), y2 = Y(B[1]), al = Math.atan2(y2 - y1, x2 - x1), r = p.taille / 2;
    let s = `<path d="M${f2(x1)} ${f2(y1)}L${f2(x2)} ${f2(y2)}" stroke="${col}" stroke-width="${w}" ${schDash(p.style)} fill="none"/>`;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, nx = -Math.sin(al) * 2, ny = Math.cos(al) * 2, ux = Math.cos(al) * 0.5, uy = Math.sin(al) * 0.5;
    for (let i = 0; i < p.codage; i++) { const o = (i - (p.codage - 1) / 2); s += `<path d="M${f2(mx + ux * o * 2 + nx)} ${f2(my + uy * o * 2 + ny)}L${f2(mx + ux * o * 2 - nx)} ${f2(my + uy * o * 2 - ny)}" stroke="${col}" stroke-width="${w}" fill="none"/>`; }
    if (p.format === 1) { const hd = (x, y, a, c) => schArrowHead(x, y, a, r, col, w, false); if (p.ferm === 0) s += hd(x2, y2, al) + hd(x1, y1, al + Math.PI); else if (p.ferm === 1) s += hd(x1, y1, al) + hd(x2, y2, al + Math.PI); else s += hd(x2, y2, al); }
    else if (p.format === 2) { const e = (x, y) => `<path d="M${f2(x - Math.sin(al) * r)} ${f2(y + Math.cos(al) * r)}L${f2(x + Math.sin(al) * r)} ${f2(y - Math.cos(al) * r)}" stroke="${col}" stroke-width="${w}" fill="none"/>`; s += e(x1, y1) + e(x2, y2); }
    else if (p.format === 3) { s += `<circle cx="${f2(x1)}" cy="${f2(y1)}" r="${f2(r / 2)}" fill="none" stroke="${col}" stroke-width="${w}"/><circle cx="${f2(x2)}" cy="${f2(y2)}" r="${f2(r / 2)}" fill="none" stroke="${col}" stroke-width="${w}"/>`; }
    return schHair(s, p.ep); }
  if (k === 'Vecteur') { if (!p.fleche) return ''; let A, B; if (p.nat === 0) { const a = sNum(p.xo), b = sNum(p.yo), u = sNum(p.ab), v = sNum(p.or); A = [a, b]; B = [a + u, b + v]; } else { A = C.point(p.orig); B = C.point(p.extr); }
    if (!A || !B || A.concat(B).some(isNaN)) return ''; const col = schCol(p.col), w = schW(p.ep), x1 = X(A[0]), y1 = Y(A[1]), x2 = X(B[0]), y2 = Y(B[1]), al = Math.atan2(y2 - y1, x2 - x1), r = p.taille / 2;
    let s = `<path d="M${f2(x1)} ${f2(y1)}L${f2(x2)} ${f2(y2)}" stroke="${col}" stroke-width="${w}" fill="none"/>` + schArrowHead(x2, y2, al, r, col, w, p.style >= 2, p.style === 3);
    s = schHair(s, p.ep); if (p.nom) s += schLabel((x1 + x2) / 2, (y1 + y2) / 2, p.nom, p.pos, col, 2.4); return s; }
  if (k === 'Droite') { const L = C.droite(p.nom) || (p.cx && !isNaN(sNum(p.cx)) ? { x: sNum(p.cx), y: sNum(p.cy), x0: sNum(p.cx0), y0: sNum(p.cy0) } : null); if (!L || (!L.x && !L.y)) return ''; return schBigLine(g, d, L.x0, L.y0, L.x, L.y, true, schCol(p.col), p.ep, p.style); }
  if (k === 'Demi-droite') { let O = p.orig[0] === '(' ? p.orig.slice(1, -1).split(';').map(sNum) : C.point(p.orig); if (!O || O.some(isNaN)) return ''; let dx, dy;
    if (p.nat === 0) { const Q = p.pt[0] === '(' ? p.pt.slice(1, -1).split(';').map(sNum) : C.point(p.pt); if (!Q || Q.some(isNaN)) return ''; dx = Q[0] - O[0]; dy = Q[1] - O[1]; }
    else if (p.nat === 1) { const V = p.vd[0] === '(' ? p.vd.slice(1, -1).split(';').map(sNum) : C.vecteur(p.vd); if (!V || V.some(isNaN)) return ''; dx = V[0]; dy = V[1]; }
    else { let a = sNum(p.ang); if (isNaN(a)) return ''; if (p.deg) a = a / 180 * Math.PI; dx = Math.cos(a); dy = Math.sin(a); }
    if (!dx && !dy) return ''; return schBigLine(g, d, O[0], O[1], dx, dy, false, schCol(p.col), p.ep, p.style); }
  if (k === 'Cercle') { let cx, cy, r;
    const pa = C.point(p.a), pb = C.point(p.b), pc = C.point(p.c), pcen = C.point(p.c);
    if (p.nat === 0) { if (!pcen) return ''; [cx, cy] = pcen; r = sNum(p.r); }
    else if (p.nat === 1) { const A = pcen, B = pa; if (!A || !B) return ''; [cx, cy] = A; r = Math.hypot(B[0] - A[0], B[1] - A[1]); }
    else if (p.nat === 2) { if (!pa || !pb) return ''; cx = (pa[0] + pb[0]) / 2; cy = (pa[1] + pb[1]) / 2; r = Math.hypot(pa[0] - cx, pa[1] - cy); }
    else if (p.nat === 3) { if (!pa || !pb || !pc) return ''; const I = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2], J = [(pa[0] + pc[0]) / 2, (pa[1] + pc[1]) / 2], O = schInter(I, [I[0] + pb[1] - pa[1], I[1] + pa[0] - pb[0]], J, [J[0] + pc[1] - pa[1], J[1] + pa[0] - pc[0]]); if (!O) return ''; [cx, cy] = O; r = Math.hypot(pa[0] - cx, pa[1] - cy); }
    else if (p.nat === 4) { if (!pa || !pb || !pc) return ''; const nAB = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]), nBC = Math.hypot(pb[0] - pc[0], pb[1] - pc[1]), nAC = Math.hypot(pa[0] - pc[0], pa[1] - pc[1]); if (!nAB || !nBC || !nAC) return '';
      const I = [pb[0] + nAB / nBC * (pc[0] - pb[0]), pb[1] + nAB / nBC * (pc[1] - pb[1])], J = [(pa[0] + I[0]) / 2, (pa[1] + I[1]) / 2], K = [pc[0] + nAC / nBC * (pb[0] - pc[0]), pc[1] + nAC / nBC * (pb[1] - pc[1])], Lp = [(pa[0] + K[0]) / 2, (pa[1] + K[1]) / 2], O = schInter(pb, J, pc, Lp); if (!O) return ''; [cx, cy] = O;
      const H = schInter([cx + pb[1] - pc[1], cy + pc[0] - pb[0]], O, pb, pc); r = Math.hypot(H[0] - cx, H[1] - cy); }
    else { const A = pcen, L = C.lineOf(p.d); if (!A || !L) return ''; const n = L.x * L.x + L.y * L.y; if (!n) return ''; const t = ((A[0] - L.x0) * L.x + (A[1] - L.y0) * L.y) / n; cx = A[0]; cy = A[1]; r = Math.hypot(A[0] - (L.x0 + t * L.x), A[1] - (L.y0 + t * L.y)); }
    if (!(r > 0) || isNaN(cx)) return ''; return `<ellipse cx="${f2(X(cx))}" cy="${f2(Y(cy))}" rx="${f2(Math.abs(X(cx + r) - X(cx)))}" ry="${f2(Math.abs(Y(cy + r) - Y(cy)))}" fill="${p.fond === 15 ? 'none' : schCol(p.fond)}" stroke="${schCol(p.col)}" stroke-width="${schW(p.ep)}" ${schDash(p.style)}/>`; }
  if (k === 'Ellipse') { let c, rx, ry; if (p.nat === 0) { c = C.point(p.c); rx = sNum(p.rx); ry = sNum(p.ry); } else { const a = C.point(p.a), b = C.point(p.b); if (!a || !b) return ''; c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; rx = Math.abs(a[0] - b[0]) / 2; ry = Math.abs(a[1] - b[1]) / 2; }
    if (!c || !(rx > 0) || !(ry > 0)) return ''; return `<ellipse cx="${f2(X(c[0]))}" cy="${f2(Y(c[1]))}" rx="${f2(Math.abs(X(c[0] + rx) - X(c[0])))}" ry="${f2(Math.abs(Y(c[1] + ry) - Y(c[1])))}" fill="${p.fond === 15 ? 'none' : schCol(p.fond)}" stroke="${schCol(p.col)}" stroke-width="${schW(p.ep)}" ${schDash(p.style)}/>`; }
  if (k === 'Carré') { let A, B; if (p.nat === 0 || p.nat === 1) { const c = C.point(p.a), r = sNum(p.b); if (!c || !(r > 0)) return ''; const h = p.nat === 0 ? r / 2 : r / Math.SQRT2; A = [c[0] - h, c[1] - h]; B = [c[0] + h, c[1] + h]; }
    else { const a = C.point(p.a), b = C.point(p.b); if (!a || !b) return ''; A = a; B = p.nat === 2 ? b : [b[0] + a[1] - b[1], b[1] + b[0] - a[0]]; }
    const V = [A, [(A[0] + B[0] + A[1] - B[1]) / 2, (A[1] + B[1] + B[0] - A[0]) / 2], B, [(A[0] + B[0] + B[1] - A[1]) / 2, (A[1] + B[1] + A[0] - B[0]) / 2]];
    return schPoly(V.map(q => [X(q[0]), Y(q[1])]), p, true); }
  if (k === 'Polygone') { const V = p.som.split(',').map(n => C.point(n)); if (V.some(q => !q) || V.length < 2) return ''; return schPoly(V.map(q => [X(q[0]), Y(q[1])]), p, true); }
  if (k === 'Courbe de Bézier') { const V = p.som.split(',').map(n => C.point(n)); if (V.some(q => !q) || V.length < 2) return ''; const S = V.map(q => [X(q[0]), Y(q[1])]), col = schCol(p.col), w = f2(p.ep / 10 || 0.1); let dd = '';
    if (p.nat === 1) { dd = `M${f2(S[0][0])} ${f2(S[0][1])}`; for (let i = 1; i + 2 < S.length; i += 3) dd += `C${S.slice(i, i + 3).map(q => f2(q[0]) + ' ' + f2(q[1])).join(',')}`; }
    else { const n = S.length - 1, pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; const A = S.map(q => q.slice()); for (let j = 1; j <= n; j++) for (let m = 0; m <= n - j; m++) A[m] = [(1 - t) * A[m][0] + t * A[m + 1][0], (1 - t) * A[m][1] + t * A[m + 1][1]]; pts.push(A[0]); } dd = 'M' + pts.map(q => f2(q[0]) + ' ' + f2(q[1])).join('L'); }
    return `<path d="${dd}" stroke="${col}" stroke-width="${w}" fill="none"/>`; }
  if (k === 'Angle') { let A, B, Cc; if (p.nat === 0) { A = C.point(p.A); B = C.point(p.B); Cc = C.point(p.C); if (!A || !B || !Cc) return ''; } else { B = C.point(p.som); if (!B) return ''; const t1 = sNum(p.deb) * Math.PI / 180, t2 = sNum(p.fin) * Math.PI / 180; A = [B[0] + Math.cos(t1), B[1] + Math.sin(t1)]; Cc = [B[0] + Math.cos(t2), B[1] + Math.sin(t2)]; }
    const x0 = X(B[0]), y0 = Y(B[1]), a1 = Math.atan2(-(Y(A[1]) - y0), X(A[0]) - x0), a2 = Math.atan2(-(Y(Cc[1]) - y0), X(Cc[0]) - x0), delta = ((a2 - a1) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI), r = p.taille, col = tcolor(p.col), w = schW(p.ep);
    const pt = (a, rr) => [x0 + rr * Math.cos(a), y0 - rr * Math.sin(a)], arc = rr => { const a = pt(a1, rr), b = pt(a1 + delta, rr); return `<path d="M${f2(a[0])} ${f2(a[1])}A${f2(rr)} ${f2(rr)} 0 ${delta > Math.PI ? 1 : 0} 0 ${f2(b[0])} ${f2(b[1])}" stroke="${col}" stroke-width="${w}" fill="none"/>`; };
    let s = ''; const bis = a1 + delta / 2, tick = a => { const u = pt(a, r - 1), v = pt(a, r + 1); return `<path d="M${f2(u[0])} ${f2(u[1])}L${f2(v[0])} ${f2(v[1])}" stroke="${col}" stroke-width="${w}"/>`; };
    if (p.style === 6) { const u = pt(a1, r), v = pt(a1 + delta, r), m = [u[0] + v[0] - x0, u[1] + v[1] - y0]; s = `<path d="M${f2(u[0])} ${f2(u[1])}L${f2(m[0])} ${f2(m[1])}L${f2(v[0])} ${f2(v[1])}" stroke="${col}" stroke-width="${w}" fill="none"/>`; }
    else if (p.style >= 3) s = arc(r + 0.5) + arc(r - 0.5); else s = arc(r);
    if (p.style === 1 || p.style === 4) s += tick(bis); if (p.style === 2 || p.style === 5) s += tick(bis - 0.2 / r) + tick(bis + 0.2 / r);
    if (p.ori > 0) { const a = p.ori === 1 ? a1 + delta : a1, q = pt(a, r), dir = p.ori === 1 ? a + Math.PI / 2 : a - Math.PI / 2; s += schArrowHead(q[0], q[1], -dir, 2, col, w, true); }
    return s; }
  if (k === 'Polygone prédéfini') { const V = [p.A, p.B, p.C].concat(p.nat >= 6 ? [p.D] : []).map(n => C.point(n)); if (V.some(q => !q)) return ''; return schPoly(V.map(q => [X(q[0]), Y(q[1])]), p, true); }
  if (k === 'Conique') return schConic(p, C, g, d);
  if (k === 'Colorier') return schFloodSvg(d, p, g);
  return '';
}
function schConicCoef(p, C) { let A, B, Cc, D, E, F;
  if (p.nat === 1) { [A, B, Cc, D, E, F] = [p.A, p.B, p.C, p.D, p.E, p.F].map(v => sNum(v) || 0); }
  else { let xf, yf; const f = p.foyer; if (f[0] === '(') { const [a, b] = f.slice(1, -1).split(';'); xf = sNum(a); yf = sNum(b); } else { const q = C.point(f); if (!q) return null; [xf, yf] = q; }
    const e = sNum(p.exc), s = p.dir.trim(); let a, b, c;
    if (/^x=/i.test(s)) { a = 1; b = 0; c = -sNum(s.slice(2)); } else if (/^y=/i.test(s)) { const ex = s.slice(2), f0 = sNum(ex.replace(/x/gi, '(0)')), f1 = sNum(ex.replace(/x/gi, '(1)')); a = f1 - f0; b = -1; c = f0; /* y = f(x) : a x - y + c = 0 avec a = f(1)-f(0) */ }
    else if (/=0$/.test(s)) { const ex = s.slice(0, -2), ev = (x, y) => sNum(ex.replace(/x/gi, `(${x})`).replace(/y/gi, `(${y})`)), z = ev(0, 0); a = ev(1, 0) - z; b = ev(0, 1) - z; c = z; }
    else if (s[0] === '(' && s.slice(-1) === ')' && s.length > 3) { const P1 = C.point(s[1]), P2 = C.point(s[2]); if (!P1 || !P2) return null; a = P2[1] - P1[1]; b = P1[0] - P2[0]; c = P1[1] * P2[0] - P1[0] * P2[1]; }
    else { const L = C.droite(s); if (!L) return null; a = L.y; b = -L.x; c = L.x * L.y0 - L.y * L.x0; }
    if (isNaN(a + b + c + e + xf + yf)) return null; const N = a * a + b * b, e2 = e * e;
    A = N - e2 * a * a; B = -2 * e2 * a * b; Cc = N - e2 * b * b; D = -2 * N * xf - 2 * e2 * a * c; E = -2 * N * yf - 2 * e2 * b * c; F = N * (xf * xf + yf * yf) - e2 * c * c; }
  return [A, B, Cc, D, E, F]; }
function schConic(p, C, g, d) {
  const K = schConicCoef(p, C); if (!K || K.some(isNaN)) return ''; const [A, B, Cc, D, E, F] = K, col = tcolor(p.couleur), w = f2(p.ep / 4 || 0.25), fx = (x, y) => A * x * x + B * x * y + Cc * y * y + D * x + E * y + F;
  // courbe : lignes de niveau (marching squares) sur la zone visible
  const x0 = g.xOf(0), x1 = g.xOf(d.W), ya = g.yOf(d.H), yb = g.yOf(0), N = 160, hx = (x1 - x0) / N, hy = (yb - ya) / N, V = [];
  for (let j = 0; j <= N; j++) { const r = []; for (let i = 0; i <= N; i++) r.push(fx(x0 + i * hx, ya + j * hy)); V.push(r); }
  let path = ''; const I = (a, b, va, vb) => a + (b - a) * (va / (va - vb));
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const v = [V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i]], X0 = x0 + i * hx, Y0 = ya + j * hy, pts = [];
    if (v[0] * v[1] < 0) pts.push([I(X0, X0 + hx, v[0], v[1]), Y0]); if (v[1] * v[2] < 0) pts.push([X0 + hx, I(Y0, Y0 + hy, v[1], v[2])]); if (v[3] * v[2] < 0) pts.push([I(X0, X0 + hx, v[3], v[2]), Y0 + hy]); if (v[0] * v[3] < 0) pts.push([X0, I(Y0, Y0 + hy, v[0], v[3])]);
    if (pts.length >= 2) path += `M${f2(g.X(pts[0][0]))} ${f2(g.Y(pts[0][1]))}L${f2(g.X(pts[1][0]))} ${f2(g.Y(pts[1][1]))}`; if (pts.length === 4) path += `M${f2(g.X(pts[2][0]))} ${f2(g.Y(pts[2][1]))}L${f2(g.X(pts[3][0]))} ${f2(g.Y(pts[3][1]))}`; }
  let s = path ? `<path d="${path}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round"/>` : '';
  // éléments caractéristiques
  const eps = 1e-9, th = 0.5 * Math.atan2(B, A - Cc), c = Math.cos(th), sn = Math.sin(th), A2 = A * c * c + B * c * sn + Cc * sn * sn, C2 = A * sn * sn - B * c * sn + Cc * c * c, D2 = D * c + E * sn, E2 = -D * sn + E * c;
  const back = (u, v) => [u * c - v * sn, u * sn + v * c], dcol = tcolor(p.cd), dw = f2((p.sd || 1) / 4), pc = schCol(p.cd);
  const ln = (P, Q, st) => `<path d="M${f2(g.X(P[0]))} ${f2(g.Y(P[1]))}L${f2(g.X(Q[0]))} ${f2(g.Y(Q[1]))}" stroke="${dcol}" stroke-width="${dw}" ${schDash(st || 0)} fill="none"/>`, pointM = q => schPointMark(g.X(q[0]), g.Y(q[1]), p.sp, 1, col);
  const long = (P, u, v) => { const k = 3 * (x1 - x0 + yb - ya), a = [P[0] - u * k, P[1] - v * k], b = [P[0] + u * k, P[1] + v * k]; return ln(a, b, p.sd - 1); };
  const foyers = [], sommets = [], axes = [], dirs = [], asy = []; let centre = null;
  if (Math.abs(A2) > eps && Math.abs(C2) > eps) { const u0 = -D2 / (2 * A2), v0 = -E2 / (2 * C2), F2 = F - D2 * D2 / (4 * A2) - E2 * E2 / (4 * C2); centre = back(u0, v0);
    const a2 = -F2 / A2, b2 = -F2 / C2; if (A2 * C2 > 0 && a2 > 0 && b2 > 0) { const aa = Math.sqrt(a2), bb = Math.sqrt(b2), horiz = aa >= bb, cf = Math.sqrt(Math.abs(a2 - b2));
      sommets.push(back(u0 + aa, v0), back(u0 - aa, v0), back(u0, v0 + bb), back(u0, v0 - bb)); axes.push([centre, 1, 0], [centre, 0, 1]);
      if (cf > eps) { if (horiz) { foyers.push(back(u0 + cf, v0), back(u0 - cf, v0)); dirs.push([back(u0 + a2 / cf, v0), 0, 1], [back(u0 - a2 / cf, v0), 0, 1]); } else { foyers.push(back(u0, v0 + cf), back(u0, v0 - cf)); dirs.push([back(u0, v0 + b2 / cf), 1, 0], [back(u0, v0 - b2 / cf), 1, 0]); } } }
    else if (A2 * C2 < 0) { const trH = a2 > 0, aa = Math.sqrt(Math.abs(trH ? a2 : b2)), bb = Math.sqrt(Math.abs(trH ? b2 : a2)), cf = Math.sqrt(aa * aa + bb * bb);
      if (trH) { sommets.push(back(u0 + aa, v0), back(u0 - aa, v0)); foyers.push(back(u0 + cf, v0), back(u0 - cf, v0)); dirs.push([back(u0 + aa * aa / cf, v0), 0, 1], [back(u0 - aa * aa / cf, v0), 0, 1]); } else { sommets.push(back(u0, v0 + aa), back(u0, v0 - aa)); foyers.push(back(u0, v0 + cf), back(u0, v0 - cf)); dirs.push([back(u0, v0 + aa * aa / cf), 1, 0], [back(u0, v0 - aa * aa / cf), 1, 0]); }
      axes.push([centre, 1, 0], [centre, 0, 1]); const r = trH ? bb / aa : aa / bb; asy.push([centre, ...back(1, r)], [centre, ...back(1, -r)]); } }
  else if ((Math.abs(A2) <= eps) !== (Math.abs(C2) <= eps)) { // parabole
    const alongX = Math.abs(A2) <= eps, Q = alongX ? C2 : A2, L = alongX ? D2 : E2, M = alongX ? E2 : D2; if (Math.abs(L) > eps) { const m0 = -M / (2 * Q), l0 = (M * M / (4 * Q) - F) / L, fd = -L / (4 * Q), V0 = alongX ? back(l0, m0) : back(m0, l0);
      sommets.push(V0); foyers.push(alongX ? back(l0 + fd, m0) : back(m0, l0 + fd)); dirs.push([alongX ? back(l0 - fd, m0) : back(m0, l0 - fd), alongX ? 0 : 1, alongX ? 1 : 0]); axes.push([V0, alongX ? 1 : 0, alongX ? 0 : 1]); } }
  const dv = (u, v) => back(u, v);
  if (p.f[0]) foyers.forEach(q => s += pointM(q)); if (p.f[1]) dirs.forEach(([q, u, v]) => { const dd = back(u, v); s += long(q, dd[0], dd[1]); });
  if (p.f[2]) axes.forEach(([q, u, v]) => { const dd = back(u, v); s += long(q, dd[0], dd[1]); }); if (p.f[3]) sommets.forEach(q => s += pointM(q)); if (p.f[4] && centre) s += pointM(centre); if (p.f[5]) asy.forEach(([q, u, v]) => s += long(q, u, v));
  const txt = []; if (p.f[6]) { const e = p.nat === 0 ? sNum(p.exc) : (() => { if (Math.abs(A2) > eps && Math.abs(C2) > eps && A2 * C2 > 0) { const a2 = Math.max(-1 / A2, -1 / C2), b2 = Math.min(-1 / A2, -1 / C2); return Math.sqrt(1 - Math.abs(b2 / a2)); } return NaN; })(); if (!isNaN(e)) txt.push('e = ' + sFmt4(e)); }
  if (p.f[9]) txt.push(`${sFmt4(A)}x² + ${sFmt4(B)}xy + ${sFmt4(Cc)}y² + ${sFmt4(D)}x + ${sFmt4(E)}y + ${sFmt4(F)} = 0`.replace(/\+ -/g, '- '));
  if (p.f[8]) { if (foyers.length) txt.push('foyers : ' + foyers.map(q => `(${sFmt4(q[0])} ; ${sFmt4(q[1])})`).join(' ')); if (centre && p.f[4]) txt.push(`centre : (${sFmt4(centre[0])} ; ${sFmt4(centre[1])})`); }
  txt.forEach((t, i) => { s += `<text x="${f2(g.X(x0) + 2)}" y="${f2(8 + 4.6 * i)}" font-size="${f2(10 * MM_PER_PT)}" font-family="'Times New Roman',serif" fill="${col}">${esc(t)}</text>`; });
  return s;
}
function schPoly(S, p, closed) { const col = schCol(p.col), fill = schCol(p.fond), pts = S.map(q => f2(q[0]) + ',' + f2(q[1])).join(' '), hach = p.hach || 0; let s = '';
  if (p.fond !== 15) { if (!hach) s += `<polygon points="${pts}" fill="${fill}" stroke="none"/>`; else { const id = 'hc' + schHash(pts + fill + hach).replace(/[^0-9a-z]/gi, '_'), L = (a, b, c, d) => `<path d="M${a} ${b}L${c} ${d}" stroke="${fill}" stroke-width="0.25"/>`, sp = 2;
    const pat = hach === 1 ? L(0, sp, sp, 0) + L(-1, 1, 1, -1) + L(sp - 1, sp + 1, sp + 1, sp - 1) : hach === 2 ? L(0, 0, sp, sp) + L(-1, 1, 1, 3) + L(sp - 1, -1, sp + 1, 1) : hach === 3 ? L(sp / 2, 0, sp / 2, sp) : hach === 4 ? L(0, sp / 2, sp, sp / 2) : hach === 5 ? L(sp / 2, 0, sp / 2, sp) + L(0, sp / 2, sp, sp / 2) : L(0, 0, sp, sp) + L(0, sp, sp, 0);
    s += `<defs><pattern id="${id}" width="${sp}" height="${sp}" patternUnits="userSpaceOnUse">${pat}</pattern></defs><polygon points="${pts}" fill="url(#${id})" stroke="none"/>`; } }
  return s + `<${closed ? 'polygon' : 'polyline'} points="${pts}" fill="none" stroke="${col}" stroke-width="${schW(p.ep)}" ${schDash(p.style)} stroke-linejoin="miter"/>`;
}

/* ----- interface : liste et formulaires des objets ----- */
function schRefresh(objs) { // met à jour les valeurs calculées stockées dans les droites (comme le fait la version Windows)
  const C = schCtx(objs); objs.forEach(o => { if (o.kind === 'raw' && o.raw.startsWith('Droite,')) { try { const p = schDefs.Droite.parse(o.raw), L = C.droite(p.nom); if (L) o.raw = schDefs.Droite.build(p, [sFmt4(L.x), sFmt4(L.y), sFmt4(L.x0), sFmt4(L.y0)]); } catch (e) { /* ignoré */ } } });
}
const SCH_TITLES = { Point: 'Point', Segment: 'Segment', Vecteur: 'Vecteur', Droite: 'Droite', 'Demi-droite': 'Demi-droite', Cercle: 'Cercle', Ellipse: 'Ellipse', 'Carré': 'Carré', Polygone: 'Polygone', 'Polygone prédéfini': 'Polygone prédéfini', Conique: 'Conique', 'Courbe de Bézier': 'Courbe de Bézier', Angle: 'Angle', Colorier: 'Colorier une zone' };
const SCH_PREDEF = ['Triangle équilatéral', 'Triangle isocèle', 'Triangle rectangle', 'Triangle rectangle isocèle', 'Triangle (3 côtés)', 'Triangle quelconque', 'Carré', 'Rectangle', 'Parallélogramme', 'Losange', 'Trapèze quelconque', 'Trapèze rectangle', 'Trapèze isocèle', 'Quadrilatère quelconque'];
const SCH_PREDEF_E = { 0: ['côté'], 1: ['base', 'hauteur (ou côté)'], 2: ['côté 1', 'côté 2'], 3: ['côté'], 4: ['côté 1', 'côté 2', 'côté 3'], 5: [], 6: ['côté'], 7: ['longueur', 'largeur'], 8: ['côté', 'hauteur', 'tangente de l’angle'], 9: ['largeur', 'hauteur'], 10: [], 11: ['grande base', 'petite base', 'hauteur'], 12: ['grande base', 'petite base', 'hauteur'], 13: [] };
const SCH_PTEX = { 0: '1;1', 1: '0,5;A,B', 2: '(A,B),(C,D)', 3: '(A;1),(B;1)', 4: 'A,B,C', 5: 'A,B,C', 6: 'P,A,B', 7: 'P,C,90', 8: '2;45' };
const SCH_PTHINT = { 0: 'x;y', 1: 'abscisse;A,B', 2: '(A,B),(C,D)  ou  (d1),(d2)', 3: '(A;coef),(B;coef)', 4: 'A,B,C', 5: 'A,B,C  (4e sommet)', 6: 'P,A,B  ou  P,d', 7: 'P,centre,angle°', 8: 'r;θ°' };
const SCH_POS = [[0, 'à droite'], [1, 'en haut à droite'], [2, 'en haut'], [3, 'en haut à gauche'], [4, 'à gauche'], [5, 'en bas à gauche'], [6, 'en bas'], [7, 'en bas à droite'], [8, 'aucun nom']];
const SCH_PALSEL = SCH_COLORS.map((n, i) => [i, n]);
const SCH_STYLE = [[0, 'Continu'], [1, 'Tirets'], [2, 'Pointillés']], SCH_EP = [[0, 'Fin'], [1, 'Moyen'], [2, 'Épais']];
function schEditor(o, k, idx, rebuild) {
  schNorm(o); const D = schDefs[k]; const p = D.parse(o.raw);
  const sync = () => { o.raw = D.build(p); const d = state.doc; if (k === 'Droite') schRefresh([o].concat(d.objs.filter(x => x !== o))); if (k === 'Polygone prédéfini') schPredefApply(d, p); if (k === 'Polygone') schEnsureVertices(d, p); };
  const T = (l, key, cls = 'w4', title) => fText(l, p, key, { after: sync, cls, title });
  const S = (l, key, opts, cls = 'w4', re) => fSel(l, p, key, opts, { num: true, after: () => { if (re) re(); sync(); if (re || key === 'nat' || key === 'opt') rebuild(); }, cls });
  const rows = [];
  const R = (...x) => rows.push(h('div', { class: 'row' }, ...x));
  if (k === 'Point') {
    R(T('nom', 'nom', 'w3'), S('définition', 'nat', [[0, 'Coordonnées'], [1, 'Sur une droite (AB)'], [2, 'Intersection de 2 droites'], [3, 'Barycentre'], [4, 'Isobarycentre'], [5, '4e sommet d’un parallélogramme'], [6, 'Projeté orthogonal'], [7, 'Image par rotation'], [8, 'Coordonnées polaires']], 'grow', () => { p.def = SCH_PTEX[p.nat]; sync(); }));
    R(T(SCH_PTHINT[p.nat], 'def', 'grow'));
    R(S('marque', 'style', [[0, 'aucune'], [1, 'point'], [2, '+'], [3, '×'], [4, '✳'], [5, '■'], [6, '◆'], [7, '○'], [8, '□'], [9, '◇']], 'w3'), S('position du nom', 'pos', SCH_POS, 'w4'), S('taille', 'taille', [[0, 'petit'], [1, 'moyen'], [2, 'gros']], 'w3'), S('couleur', 'col', SCH_PALSEL, 'w3'));
    R(fChk('lignes de cote', (p.cb = { v: !!p.cote }) && { get v() { return !!p.cote; }, set v(x) { p.cote = x ? 1 : 0; sync(); } }, 'v'));
  } else if (k === 'Segment') {
    R(S('définition', 'nat', [[0, 'Deux points nommés'], [1, 'Coordonnées'], [2, 'Médiane d’un triangle'], [3, 'Hauteur d’un triangle']], 'grow', () => {}));
    if (p.nat === 0) R(T('origine', 'orig', 'w3'), T('extrémité', 'extr', 'w3'));
    else if (p.nat === 1) R(T('x1', 'x1', 'w3'), T('y1', 'y1', 'w3'), T('x2', 'x2', 'w3'), T('y2', 'y2', 'w3'));
    else R(T('A', 'A', 'w3'), T('B', 'B', 'w3'), T('C', 'C', 'w3'), T('sommet', 'som', 'w3'));
    R(fColor('couleur', p, 'couleur', { after: sync }), S('épaisseur', 'ep', SCH_EP, 'w3'), S('style', 'style', SCH_STYLE, 'w3'), S('codage', 'codage', [[0, 'aucun'], [1, '|'], [2, '||'], [3, '|||']], 'w2'));
    R(S('extrémités', 'format', [[0, 'sans'], [1, 'flèches'], [2, 'crochets'], [3, 'arcs']], 'w3'), S('forme', 'ferm', [[0, 'fermé'], [1, 'ouvert'], [2, 'semi-ouvert']], 'w3'), S('taille', 'taille', [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => [n, n]), 'w2'));
  } else if (k === 'Vecteur') {
    R(T('nom', 'nom', 'w3'), S('position du nom', 'pos', SCH_POS, 'w4'), S('définition', 'nat', [[0, 'Coordonnées'], [1, 'Deux points']], 'grow'));
    if (p.nat === 0) R(T('abscisse', 'ab', 'w3'), T('ordonnée', 'or', 'w3'), T('origine x', 'xo', 'w3'), T('origine y', 'yo', 'w3')); else R(T('origine', 'orig', 'w3'), T('extrémité', 'extr', 'w3'));
    R(S('tracé', 'fleche', [[1, 'dessiné'], [0, 'non dessiné']], 'w3'), S('flèche', 'style', [[1, 'simple'], [2, 'triangle'], [3, 'lancéolée']], 'w3'), S('épaisseur', 'ep', SCH_EP, 'w3'), S('taille', 'taille', [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => [n, n]), 'w2'), S('couleur', 'col', SCH_PALSEL, 'w3'));
  } else if (k === 'Droite') {
    R(T('nom', 'nom', 'w3'), S('définition', 'nat', [[0, 'Deux points'], [1, 'Point et vecteur directeur'], [2, 'Point et vecteur normal'], [3, 'Parallèle à une droite'], [4, 'Perpendiculaire à une droite'], [5, 'Médiatrice d’un segment'], [6, 'Bissectrice (3 points)'], [7, 'Bissectrice (2 vecteurs)']], 'grow'));
    const N = p.nat; if (N === 0) R(T('point 1', 'p1', 'w3'), T('point 2', 'p2', 'w3')); else if (N === 1) R(T('point', 'p1', 'w3'), T('vecteur (nom ou A,B)', 'vd', 'grow')); else if (N === 2) R(T('point', 'p1', 'w3'), T('vecteur normal (nom ou A,B)', 'vn', 'grow'));
    else if (N === 3) R(T('point', 'p1', 'w3'), T('parallèle à (nom ou A,B)', 'dp', 'grow')); else if (N === 4) R(T('point', 'p1', 'w3'), T('perpendiculaire à (nom ou A,B)', 'dpp', 'grow')); else if (N === 5) R(T('segment A,B', 'seg', 'grow')); else if (N === 6) R(T('A,B,C  (sommet B)', 'a3', 'grow')); else R(T('point, u, v', 'a2', 'grow'));
    R(S('épaisseur', 'ep', SCH_EP, 'w3'), S('style', 'style', SCH_STYLE, 'w3'), S('couleur', 'col', SCH_PALSEL, 'w3'));
  } else if (k === 'Demi-droite') {
    R(T('origine (nom ou (x;y))', 'orig', 'w4'), S('direction', 'nat', [[0, 'Vers un point'], [1, 'Vecteur directeur'], [2, 'Angle polaire']], 'grow'));
    R(p.nat === 0 ? T('point', 'pt', 'w4') : p.nat === 1 ? T('vecteur', 'vd', 'w4') : T('angle', 'ang', 'w3'), p.nat === 2 ? S('unité', 'deg', [[1, 'degrés'], [0, 'radians']], 'w3') : h('span'));
    R(S('épaisseur', 'ep', SCH_EP, 'w3'), S('style', 'style', SCH_STYLE, 'w3'), S('couleur', 'col', SCH_PALSEL, 'w3'));
  } else if (k === 'Cercle') {
    R(S('définition', 'nat', [[0, 'Centre et rayon'], [1, 'Centre et point'], [2, 'Diamètre [AB]'], [3, 'Circonscrit à ABC'], [4, 'Inscrit dans ABC'], [5, 'Centre et tangent à une droite']], 'grow'));
    if (p.nat === 0) R(T('centre', 'c', 'w3'), T('rayon', 'r', 'w3')); else if (p.nat === 1) R(T('centre', 'c', 'w3'), T('point', 'a', 'w3')); else if (p.nat === 2) R(T('A', 'a', 'w3'), T('B', 'b', 'w3')); else if (p.nat < 5) R(T('A', 'a', 'w3'), T('B', 'b', 'w3'), T('C', 'c', 'w3')); else R(T('centre', 'c', 'w3'), T('droite (nom ou A,B)', 'd', 'w4'));
    R(S('épaisseur', 'ep', [[0, 'Fin'], [1, 'Moyen'], [2, 'Épais'], [3, 'Très épais']], 'w3'), S('style', 'style', SCH_STYLE, 'w3'), S('trait', 'col', SCH_PALSEL, 'w3'), S('intérieur', 'fond', SCH_PALSEL.map(([i, n]) => [i, i === 15 ? 'transparent' : n]), 'w3'));
  } else if (k === 'Ellipse') {
    R(S('définition', 'nat', [[0, 'Centre et axes'], [1, 'Deux sommets opposés du rectangle']], 'grow'));
    if (p.nat === 0) R(T('centre', 'c', 'w3'), T('demi-axe horizontal', 'rx', 'w3'), T('demi-axe vertical', 'ry', 'w3')); else R(T('sommet 1', 'a', 'w3'), T('sommet 2', 'b', 'w3'));
    R(S('épaisseur', 'ep', SCH_EP, 'w3'), S('style', 'style', SCH_STYLE, 'w3'), S('trait', 'col', SCH_PALSEL, 'w3'), S('intérieur', 'fond', SCH_PALSEL.map(([i, n]) => [i, i === 15 ? 'transparent' : n]), 'w3'));
  } else if (k === 'Carré') {
    R(S('définition', 'nat', [[0, 'Centre et côté'], [1, 'Centre et rayon'], [2, 'Deux sommets opposés'], [3, 'Deux sommets consécutifs']], 'grow'));
    R(T(p.nat < 2 ? 'centre' : 'sommet 1', 'a', 'w3'), T(p.nat === 0 ? 'côté' : p.nat === 1 ? 'rayon' : 'sommet 2', 'b', 'w3'));
    R(S('épaisseur', 'ep', SCH_EP, 'w3'), S('style', 'style', SCH_STYLE, 'w3'), S('trait', 'col', SCH_PALSEL, 'w3'), S('intérieur', 'fond', SCH_PALSEL.map(([i, n]) => [i, i === 15 ? 'transparent' : n]), 'w3'));
  } else if (k === 'Polygone') {
    R(S('type', 'nat', [[0, 'Triangle équilatéral (A,B,C)'], [1, 'Parallélogramme (A,B,C,D)'], [2, 'Polygone régulier (A,B,C,…)'], [3, 'Polygone quelconque']], 'grow'));
    R(T('sommets (séparés par des virgules)', 'som', 'grow'));
    R(S('épaisseur', 'ep', SCH_EP, 'w3'), S('style', 'style', SCH_STYLE, 'w3'), S('trait', 'col', SCH_PALSEL, 'w3'), S('intérieur', 'fond', SCH_PALSEL.map(([i, n]) => [i, i === 15 ? 'transparent' : n]), 'w3'), S('hachures', 'hach', [[0, 'aucune'], [1, '/'], [2, '\\'], [3, '|'], [4, '—'], [5, '+'], [6, '×']], 'w3'));
  } else if (k === 'Polygone prédéfini') {
    R(S('figure', 'nat', SCH_PREDEF.map((n, i) => [i, n]), 'grow', () => {})); if (p.nat === 1) R(S('2e donnée', 'opt', [[0, 'hauteur'], [1, 'côté']], 'w3')); if (p.nat === 3) R(S('donnée', 'opt', [[0, 'côté de l’angle droit'], [1, 'hypoténuse']], 'w3'));
    R(T('sommets', p.nat >= 6 ? 'A' : 'A', 'w2'), T('', 'B', 'w2'), T('', 'C', 'w2'), p.nat >= 6 ? T('', 'D', 'w2') : h('span'));
    const ek = SCH_PREDEF_E[p.nat]; if (ek.length) R(...ek.map((l, i) => fText(l, p.e, i, { after: sync, cls: 'w3' })));
    R(S('épaisseur', 'ep', SCH_EP, 'w3'), S('style', 'style', SCH_STYLE, 'w3'), S('trait', 'col', SCH_PALSEL, 'w3'), S('intérieur', 'fond', SCH_PALSEL.map(([i, n]) => [i, i === 15 ? 'transparent' : n]), 'w3'));
  } else if (k === 'Conique') {
    R(S('définition', 'nat', [[0, 'Foyer, directrice, excentricité'], [1, 'Équation Ax²+Bxy+Cy²+Dx+Ey+F=0']], 'grow'));
    if (p.nat === 0) R(T('foyer (nom ou (x;y))', 'foyer', 'w4'), T('directrice (x=…, y=…, (AB), d)', 'dir', 'w4'), T('excentricité', 'exc', 'w3')); else R(...['A', 'B', 'C', 'D', 'E', 'F'].map(l => T(l, l, 'w2')));
    const FL = ['foyer', 'directrice', 'axes', 'sommets', 'centre', 'asymptotes', 'excentricité', 'mesures', 'coordonnées', 'équation', 'valeurs exactes'];
    R(...FL.map((l, i) => fChk(l, { get v() { return !!p.f[i]; }, set v(x) { p.f[i] = x ? 1 : 0; sync(); } }, 'v')));
    R(S('épaisseur', 'ep', [1, 2, 3, 4, 5, 6].map(n => [n, n]), 'w2'), fColor('couleur', p, 'couleur', { after: sync }), fColor('droites', p, 'cd', { after: sync }), S('style droites', 'sd', [[1, 'continu'], [2, 'tirets'], [3, 'pointillés']], 'w3'), S('marque', 'sp', [[1, 'point'], [2, '+'], [3, '×'], [4, '✳'], [5, '■'], [6, '◆'], [7, '○'], [8, '□'], [9, '◇']], 'w3'));
  } else if (k === 'Courbe de Bézier') {
    R(S('type', 'nat', [[0, 'Bézier (extrémités et points de contrôle)'], [1, 'Polybézier (3k+1 points)']], 'grow')); R(T('points (A,B,C,…)', 'som', 'grow'));
    R(S('épaisseur', 'ep', [1, 2, 3, 4, 5, 6, 8, 10].map(n => [n, n]), 'w3'), S('couleur', 'col', SCH_PALSEL, 'w3'));
  } else if (k === 'Angle') {
    R(S('définition', 'nat', [[0, '3 points A,B,C (sommet B)'], [1, 'Sommet et angles']], 'grow'));
    if (p.nat === 0) R(T('A', 'A', 'w3'), T('B (sommet)', 'B', 'w3'), T('C', 'C', 'w3')); else R(T('sommet', 'som', 'w3'), T('début (°)', 'deb', 'w3'), T('fin (°)', 'fin', 'w3'));
    R(S('marque', 'style', [[0, 'arc'], [1, 'arc et 1 barre'], [2, 'arc et 2 barres'], [3, 'double arc'], [4, 'double arc, 1 barre'], [5, 'double arc, 2 barres'], [6, 'angle droit']], 'grow'), S('orientation', 'ori', [[0, 'simple'], [1, 'orienté +'], [2, 'orienté −']], 'w3'));
    R(S('épaisseur', 'ep', SCH_EP, 'w3'), fColor('couleur', p, 'col', { after: sync }), S('taille (mm)', 'taille', [3, 4, 5, 6, 7, 8, 9, 10, 12].map(n => [n, n]), 'w2'));
  } else if (k === 'Colorier') {
    R(T('abscisse du point', 'x', 'w3'), T('ordonnée', 'y', 'w3'), fColor('couleur', p, 'col', { after: sync }));
  }
  return h('div', { class: 'item' }, h('div', { class: 'row' }, h('span', { class: 'lab' }, SCH_TITLES[k]), h('span', { class: 'grow' }), btn('✕', () => { state.doc.objs.splice(idx, 1); rebuild(); redraw(); commit(); }, 'small')), rows);
}
function schAddButtons(rebuild) {
  const add = k => { const d = state.doc, used = new Set(d.objs.filter(x => x.kind === 'raw').map(x => { const q = schKind(x.raw); try { return q === 'Point' || q === 'Droite' || q === 'Vecteur' ? schDefs[q].parse(x.raw).nom : ''; } catch (e) { return ''; } }));
    const p = schDefs[k].make(); if (p.nom !== undefined) { const set = k === 'Point' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : k === 'Droite' ? 'dfghijklmnpqrstuvwxyz' : 'uvwxyz'; p.nom = [...set].find(c => !used.has(c)) || p.nom; }
    if (k === 'Segment') { const pts = [...used].filter(Boolean); if (pts.length >= 2) { p.nat = 0; p.orig = pts[pts.length - 2]; p.extr = pts[pts.length - 1]; } }
    if (k === 'Droite') { const pts = d.objs.map(x => x.kind === 'raw' && x.raw.startsWith('Point ') ? schDefs.Point.parse(x.raw).nom : null).filter(Boolean); if (pts.length >= 2) { p.p1 = pts[pts.length - 2]; p.p2 = pts[pts.length - 1]; } }
    if (k === 'Demi-droite' || k === 'Cercle') { const pts = d.objs.map(x => x.kind === 'raw' && x.raw.startsWith('Point ') ? schDefs.Point.parse(x.raw).nom : null).filter(Boolean); if (pts.length >= 2) { if (k === 'Demi-droite') { p.orig = pts[pts.length - 2]; p.pt = pts[pts.length - 1]; } else p.c = pts[pts.length - 1]; } }
    if (k === 'Polygone prédéfini') { p.A = 'A'; const all = new Set(d.objs.filter(x => x.kind === 'raw' && x.raw.startsWith('Point ')).map(x => schDefs.Point.parse(x.raw).nom)); const free = n => [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(c => !all.has(c)).slice(0, n); const [a, b, c, e] = free(4); if (a) { p.A = a; p.B = b || 'B'; p.C = c || 'C'; p.D = e || 'D'; } schPredefApply(d, p); }
    if (k === 'Polygone') { const pts = [...new Set(d.objs.filter(x => x.kind === 'raw' && x.raw.startsWith('Point ')).map(x => schDefs.Point.parse(x.raw).nom))]; if (pts.length >= 3) p.som = pts.slice(-3).join(','); }
    if (['Ellipse', 'Carré', 'Courbe de Bézier', 'Angle'].includes(k)) { const pts = [...new Set(d.objs.filter(x => x.kind === 'raw' && x.raw.startsWith('Point ')).map(x => schDefs.Point.parse(x.raw).nom))]; if (pts.length >= 2) { if (k === 'Ellipse') { p.c = pts[pts.length - 1]; } if (k === 'Carré') { p.a = pts[pts.length - 2]; p.b = pts[pts.length - 1]; } if (k === 'Angle' && pts.length >= 3) { [p.A, p.B, p.C] = pts.slice(-3); } if (k === 'Courbe de Bézier' && pts.length >= 4) p.som = pts.slice(-4).join(','); } }
    d.objs.push({ kind: 'raw', raw: schDefs[k].build(p) }); if (k === 'Droite') schRefresh(d.objs); rebuild(); redraw(); commit(); };
  return h('div', { class: 'row' }, Object.keys(SCH_TITLES).map(k => btn('+ ' + SCH_TITLES[k], () => add(k), 'small')));
}

/* ----- Colorier une zone (remplissage par diffusion, comme le « FloodFill » de la version Windows) ----- */
const SCH_BASE = new WeakMap(); let SCH_NOFILL = false; const SCH_FLOOD = new Map(), SCH_JOBS = new Map();
const schHash = s => { s = s.replace(/clipPath id="[^"]*"/g, '').replace(/url\(#c[a-z0-9]+\)/g, ''); let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h + ':' + s.length; };
function schFloodJob(base, d, px, py, col, key) {
  return new Promise(res => {
    const sc = 4, w = Math.round(d.W * sc), h = Math.round(d.H * sc), img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h);
      const im = x.getImageData(0, 0, w, h), D = im.data, sx = Math.round(px * sc), sy = Math.round(py * sc);
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) { SCH_FLOOD.set(key, ''); return res(); }
      const o = (sy * w + sx) * 4, r0 = D[o], g0 = D[o + 1], b0 = D[o + 2], same = i => Math.abs(D[i] - r0) + Math.abs(D[i + 1] - g0) + Math.abs(D[i + 2] - b0) < 60, mask = new Uint8Array(w * h), st = [sx, sy];
      while (st.length) { let y = st.pop(), x0 = st.pop(); while (x0 > 0 && !mask[y * w + x0 - 1] && same(((y * w) + x0 - 1) * 4)) x0--; let up = false, dn = false;
        for (let xx = x0; xx < w && !mask[y * w + xx] && same((y * w + xx) * 4); xx++) { mask[y * w + xx] = 1; if (y > 0) { const m = !mask[(y - 1) * w + xx] && same(((y - 1) * w + xx) * 4); if (m && !up) st.push(xx, y - 1); up = m; } if (y < h - 1) { const m = !mask[(y + 1) * w + xx] && same(((y + 1) * w + xx) * 4); if (m && !dn) st.push(xx, y + 1); dn = m; } } }
      const out = x.createImageData(w, h), O = out.data, cr = col & 255, cg = (col >> 8) & 255, cb = (col >> 16) & 255; // couleur Delphi BGR
      for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { let m = mask[y * w + xx]; if (!m) { for (let dy = -1; dy <= 1 && !m; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, x2 = xx + dx; if (yy >= 0 && yy < h && x2 >= 0 && x2 < w && mask[yy * w + x2]) { m = 1; break; } } } if (m) { const i = (y * w + xx) * 4; O[i] = cr; O[i + 1] = cg; O[i + 2] = cb; O[i + 3] = 255; } }
      x.putImageData(out, 0, 0); SCH_FLOOD.set(key, c.toDataURL('image/png')); res();
    };
    img.onerror = () => { SCH_FLOOD.set(key, ''); res(); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(base.replace(/width="[^"]*mm" height="[^"]*mm"/, `width="${w}" height="${h}"`));
  });
}
function schFloodPending(d) { // liste des remplissages à calculer pour le dessin courant
  const list = d.objs.filter(o => o.kind === 'raw' && o.raw.startsWith('Colorier;')); if (!list.length) return [];
  SCH_NOFILL = true; let base; try { base = buildSvg(d, buildCtx(d), {}); } finally { SCH_NOFILL = false; }
  const g = geom(d), H = schHash(base), jobs = [];
  list.forEach(o => { const p = schDefs.Colorier.parse(o.raw), x = sNum(p.x), y = sNum(p.y); if (isNaN(x) || isNaN(y)) return; const key = H + '|' + p.x + '|' + p.y + '|' + p.col; if (!SCH_FLOOD.has(key) && !SCH_JOBS.has(key)) jobs.push([key, base, d, g.X(x), g.Y(y), p.col]); });
  return jobs;
}
function schFloodRun(d, done) {
  const jobs = schFloodPending(d); if (!jobs.length) return done && done();
  Promise.all(jobs.map(j => { const pr = schFloodJob(j[1], j[2], j[3], j[4], j[5], j[0]); SCH_JOBS.set(j[0], pr); return pr.then(() => SCH_JOBS.delete(j[0])); })).then(() => { done ? done() : redraw(); });
}
function schWarm(cb) { schFloodRun(state.doc, cb); }
function schFloodSvg(d, p, g) { if (SCH_NOFILL) return ''; const x = sNum(p.x), y = sNum(p.y); if (isNaN(x) || isNaN(y)) return '';
  if (!SCH_BASE.has(d)) { SCH_NOFILL = true; try { SCH_BASE.set(d, schHash(buildSvg(d, buildCtx(d), {}))); } finally { SCH_NOFILL = false; } }
  const key = SCH_BASE.get(d) + '|' + p.x + '|' + p.y + '|' + p.col, url = SCH_FLOOD.get(key); if (url) return `<image x="0" y="0" width="${d.W}" height="${d.H}" preserveAspectRatio="none" href="${url}"/>`; if (url === undefined && !SCH_JOBS.has(key)) setTimeout(() => schFloodRun(d), 0); return ''; }

/* ----- création des sommets calculés (polygones prédéfinis, triangle équilatéral…) ----- */
function schPutPoint(d, nom, x, y, style, pos, col, replace) {
  const raw = `Point ${nom},0,${sFmt4(x)};${sFmt4(y)};${style},${pos},0,0,${col}`, i = d.objs.findIndex(o => o.kind === 'raw' && o.raw.startsWith('Point ' + nom + ','));
  if (i >= 0) { if (replace) d.objs[i].raw = raw; } else d.objs.push({ kind: 'raw', raw });
}
function schPredefApply(d, p) {
  const C = schCtx(d.objs), e = p.e.map(v => sNum(v)), nat = p.nat, A0 = C.point(p.A); let x1, y1;
  const dflt = { 6: () => [-e[0] / 2, -e[0] / 2], 7: () => [-e[0] / 2, -e[1] / 2], 8: () => [-e[0] / 2, -e[1] / 2], 9: () => [0, -e[1] / 2], 12: () => [-e[0] / 2, -e[2] / 2] }[nat];
  [x1, y1] = A0 || (dflt ? dflt() : [-3, -3]); if (isNaN(x1 + y1)) return false; let V;
  const L = e[0], H = e[1];
  switch (nat) {
    case 0: V = [[x1 + L, y1], [x1 + L / 2, y1 + L * Math.sqrt(3) / 2]]; break;
    case 1: { let h = H; if (p.opt === 1) { if (L < 2 * H) h = Math.sqrt(H * H - L * L / 4); else return false; } V = [[x1 + L, y1], [x1 + L / 2, y1 + h]]; break; }
    case 2: V = [[x1 + L, y1], [x1, y1 + H]]; break;
    case 3: { const l = p.opt === 1 ? L / Math.SQRT2 : L; V = [[x1 + l, y1], [x1, y1 + l]]; break; }
    case 4: { const L1 = e[0], L2 = e[1], L3 = e[2], l = (L1 * L1 + L3 * L3 - L2 * L2) / (2 * L1); if (l < 0 || L3 < l) return false; V = [[x1 + L1, y1], [x1 + l, y1 + Math.sqrt(L3 * L3 - l * l)]]; break; }
    case 5: V = [[x1 + 12.5, y1 + 2.5], [x1 + 8.5, y1 + 8.5]]; break;
    case 6: V = [[x1 + L, y1], [x1 + L, y1 + L], [x1, y1 + L]]; break;
    case 7: V = [[x1 + L, y1], [x1 + L, y1 + H], [x1, y1 + H]]; break;
    case 8: { const t = e[2]; if (!t) return false; const x3 = x1 + L + H / t; V = [[x1 + L, y1], [x3, y1 + H], [x3 - L, y1 + H]]; break; }
    case 9: V = [[x1 + L / 2, y1 + H / 2], [x1, y1 + H], [x1 - L / 2, y1 + H / 2]]; break;
    case 10: V = [[x1 + 8, y1], [x1 + 7, y1 + 4], [x1 + 2, y1 + 4]]; break;
    case 11: V = [[x1 + e[0], y1], [x1 + e[1], y1 + e[2]], [x1, y1 + e[2]]]; break;
    case 12: V = [[x1 + e[0], y1], [e[1] / 2, y1 + e[2]], [-e[1] / 2, y1 + e[2]]]; break;
    default: V = [[x1 + 8, y1], [x1 + 6, y1 + 5], [x1 + 3, y1 + 6]];
  }
  if (V.flat().some(isNaN)) return false;
  if (!A0) schPutPoint(d, p.A, x1, y1, 0, 5, p.col, false);
  schPutPoint(d, p.B, V[0][0], V[0][1], 0, 7, p.col, true); schPutPoint(d, p.C, V[1][0], V[1][1], 0, 1, p.col, true); if (nat >= 6) schPutPoint(d, p.D, V[2][0], V[2][1], 0, 3, p.col, true);
  return true;
}
function schEnsureVertices(d, p) { // polygone : crée les sommets manquants (équilatéral, parallélogramme, régulier)
  const C = schCtx(d.objs), n = p.som.split(','), P = n.map(x => C.point(x));
  if (p.nat === 0 && n.length === 3 && P[0] && P[1] && !P[2]) schPutPoint(d, n[2], 0.5 * (P[1][0] - P[0][0]) - Math.sqrt(3) / 2 * (P[1][1] - P[0][1]) + P[0][0], 0.5 * (P[1][1] - P[0][1]) + Math.sqrt(3) / 2 * (P[1][0] - P[0][0]) + P[0][1], 6, 0, p.col, false);
  else if (p.nat === 1 && n.length === 4 && P[0] && P[1] && P[2] && !P[3]) schPutPoint(d, n[3], P[0][0] + P[2][0] - P[1][0], P[0][1] + P[2][1] - P[1][1], 6, 0, p.col, false);
  else if (p.nat === 2 && n.length >= 3 && P[0] && P[1]) { let [x1, y1] = P[0], [x2, y2] = P[1]; const k = n.length; for (let i = 2; i < k; i++) { const a = (k - 1) * 2 * Math.PI / k, x3 = x2 + (x2 - x1) * Math.cos(a) + (y2 - y1) * Math.sin(a), y3 = y2 - (x2 - x1) * Math.sin(a) + (y2 - y1) * Math.cos(a); if (!C.point(n[i])) schPutPoint(d, n[i], x3, y3, 6, 0, p.col, false); x1 = x2; x2 = x3; y1 = y2; y2 = y3; } }
}

/* ----- déplacement à la souris des points définis par leurs coordonnées ----- */
function schHitPoint(d, g, mx, my, tol) {
  let best = -1, bd = tol; if (!d.objs.length) return -1;
  d.objs.forEach((o, i) => { if (o.kind !== 'raw' || !o.raw.startsWith('Point ')) return; let p; try { p = schDefs.Point.parse(o.raw); } catch (e) { return; } if (p.nat !== 0 && p.nat !== 8) return;
    const [a, b] = p.def.split(';'), x = sNum(a), y = sNum(b); if (p.nat !== 0 || isNaN(x) || isNaN(y)) return; const dd = Math.hypot(g.X(x) - mx, g.Y(y) - my); if (dd < bd) { bd = dd; best = i; } });
  return best;
}
