/* ===== Compléments issus du format .sqn Windows (d'après les sources Delphi) ===== */

/* --- hachures (styles Delphi) : b "/", f "\", cross "+", dcross "x", h "—", v "|" --- */
function hatchDefs(id, kind, col, dist, w = 0.25) {
  const D = Math.max(0.8, dist), H = `<path d="M0 0H${D}" stroke="${col}" stroke-width="${w}"/>`, V = `<path d="M0 0V${D}" stroke="${col}" stroke-width="${w}"/>`;
  const tr = { b: 'rotate(45)', f: 'rotate(-45)', dcross: 'rotate(45)' }[kind] || '', body = { b: V, f: V, cross: H + V, dcross: H + V, h: H, v: V }[kind] || V;
  return `<pattern id="${id}" width="${f2(D)}" height="${f2(D)}" patternUnits="userSpaceOnUse"${tr ? ` patternTransform="${tr}"` : ''}>${body}</pattern>`;
}
const HATCH_KINDS = ['b', 'f', 'cross', 'dcross', 'h', 'v'];            // style 0..5 des inéquations
const BRUSH_KINDS = ['', '', 'h', 'v', 'f', 'b', 'cross', 'dcross'];    // TBrushStyle Delphi (loi exponentielle)

/* --- inéquations à la manière de Windows : a·x + b·y + c  (< > <= >=)  0, une couleur / hachure par ligne --- */
EX.ineqw = { label: 'Inéquations (format Windows)', def: () => ({ data: '1;1;-3;<;255;0;3\n0;1;-1;>;16711680;1;3', hach: true }),
  fields: [['data', 'a ; b ; c ; signe (<, >, <=, >=) ; couleur ; hachure (0 à 5) ; écart (mm)  — une inéquation a·x+b·y+c ? 0 par ligne', 'area', 'grow'], 'br', ['hach', 'la zone solution est hachurée (sinon, la zone non solution)', 'chk']],
  render(e, d, g) {
    const rows = linesOf(e.data).map(l => l.split(';')).filter(a => a.length >= 4), cell = 1.2, nx = Math.ceil(d.W / cell), ny = Math.ceil(d.H / cell);
    let defs = '', s = '';
    rows.forEach((r, k) => {
      const a = parseNum(r[0], NaN), b = parseNum(r[1], NaN), c = parseNum(r[2], NaN); if (![a, b, c].every(Number.isFinite)) return;
      const op = (r[3] || '<').trim().replace('£', '<=').replace('³', '>='), col = tcolor(parseNum(r[4], 0)), st = Math.max(0, Math.min(5, parseNum(r[5], 0) | 0)), dist = parseNum(r[6], 3) || 3;
      const sat = (x, y) => { const v = a * x + b * y + c; const ok = op === '<' ? v < 0 : op === '>' ? v > 0 : op === '<=' ? v <= 0 : v >= 0; return e.hach ? ok : !ok; };
      let p = ''; for (let j = 0; j < ny; j++) { let run = -1; for (let i = 0; i <= nx; i++) { const ok = i < nx && sat(g.xOf((i + 0.5) * cell), g.yOf((j + 0.5) * cell));
        if (ok && run < 0) run = i; else if (!ok && run >= 0) { p += `M${f2(run * cell)} ${f2(j * cell)}h${f2((i - run) * cell)}v${f2(cell + 0.02)}h${f2(-(i - run) * cell)}z`; run = -1; } } }
      defs += hatchDefs('iw' + k, HATCH_KINDS[st], col, dist); s += `<path d="${p}" fill="url(#iw${k})" stroke="none"/>`;
    });
    return `<defs>${defs}</defs>` + s;
  } };

/* --- loi exponentielle : zones coloriées / hachurées de la boîte Windows --- */
EX.loiexp = { label: 'Loi exponentielle (zones Windows)', def: () => ({ lambda: 1, title: '', zc: [0, 0, 0, 0], cc: [255, 65280, 16711680], zh: [0, 0, 0, 0], sh: [5, 4, 6], couleur: 0, ep: 1, label: true }),
  fields: [['lambda', 'λ', 'num', 'w3', { step: 0.1 }], ['title', 'titre', 'text', 'grow'], ['couleur', 'courbe', 'color'], ['label', 'afficher les résultats', 'chk']],
  render(e, d, g) {
    const lam = e.lambda, xmax = g.xOf(d.W), pdf = x => lam * Math.exp(-lam * x), st = { col: tcolor(e.couleur), w: lineWidth(e.ep), style: 0 };
    const zone = (x1, x2, fill) => { if (!(x2 > x1)) return ''; const pts = []; for (let i = 0; i <= 120; i++) { const x = x1 + (x2 - x1) * i / 120; pts.push(f2(g.X(x)) + ' ' + f2(g.Y(pdf(x)))); }
      return `<path d="M${f2(g.X(x1))} ${f2(g.Y(0))}L${pts.join('L')}L${f2(g.X(x2))} ${f2(g.Y(0))}Z" fill="${fill}" stroke="none"/>`; };
    let s = '', defs = '';
    const [A, B, C, D] = e.zc, [a, b, c, dd] = e.zh;
    if (A > 0) s += zone(0, A, tcolor(e.cc[0])); if (B > 0) s += zone(B, xmax, tcolor(e.cc[1])); if (C > 0) s += zone(C, D, tcolor(e.cc[2]));
    const hz = (x1, x2, k) => { const kind = BRUSH_KINDS[e.sh[k]] || 'b'; defs += hatchDefs('le' + k, kind, '#000', 2); return zone(x1, x2, `url(#le${k})`); };
    if (a > 0) s += hz(0, a, 0); if (b > 0) s += hz(b, xmax, 1); if (c > 0) s += hz(c, dd, 2);
    const pts = []; for (let i = 0; i <= 200; i++) { const x = i * xmax / 200; pts.push([g.X(x), g.Y(pdf(x))]); }
    s += drawPolyline(pts, st);
    if (e.title) s += T_(g.X(g.xOf(d.W / 2)), 8, e.title, { size: 12, anchor: 'middle', bold: true, italic: true });
    if (e.label) s += T_(g.X(0) + 2, g.Y(0) + 5, 'Loi exponentielle de paramètre λ = ' + fmtC(lam), { size: 10 });
    return `<defs>${defs}</defs>` + s;
  } };

/* --- boîtes à moustaches multiples : min ; D1 ; Q1 ; médiane ; Q3 ; D9 ; max ; légende --- */
EX.boxq = { label: 'Boîtes à moustaches multiples (paramètres)', def: () => ({ data: '2;4;6;10;14;17;20;Série 1\n5;7;9;12;15;18;22;Série 2', horiz: true, ep: 6, dist: 20, leg: 0, title: '', couleur: 0, couleur2: 16777215, ep2: 1 }),
  fields: [['data', 'min ; D1 ; Q1 ; médiane ; Q3 ; D9 ; max ; légende (une boîte par ligne)', 'area', 'grow'], 'br', ['horiz', 'axes horizontaux', 'chk'], ['ep', 'épaisseur (mm)', 'num', 'w3'], ['dist', 'distance entre axes (mm)', 'num', 'w3'], ['title', 'titre', 'text', 'grow'], ['couleur', 'traits', 'color'], ['couleur2', 'intérieur', 'color']],
  render(e, d, g) {
    const rows = linesOf(e.data).map(l => l.split(';')), st = { col: tcolor(e.couleur), w: lineWidth(e.ep2) }, fill = tcolor(e.couleur2), h = e.ep; let s = '';
    rows.forEach((r, i) => {
      const v = r.slice(0, 7).map(x => parseNum(x, NaN)); if (v.some(x => !Number.isFinite(x))) return; const [mn, d1, q1, md, q3, d9, mx] = v, leg = (r[7] || '').trim();
      const P = e.horiz ? (t => g.X(t)) : (t => g.Y(t)), off = (e.horiz ? g.Y(0) - (i + 1) * e.dist : g.X(0) + (i + 1) * e.dist);
      const seg = (t1, o1, t2, o2) => e.horiz ? lineSeg([P(t1), o1], [P(t2), o2], st.col, st.w) : lineSeg([o1, P(t1)], [o2, P(t2)], st.col, st.w);
      const rect = e.horiz ? `<rect x="${f2(Math.min(P(q1), P(q3)))}" y="${f2(off - h / 2)}" width="${f2(Math.abs(P(q3) - P(q1)))}" height="${f2(h)}"` : `<rect x="${f2(off - h / 2)}" y="${f2(Math.min(P(q1), P(q3)))}" width="${f2(h)}" height="${f2(Math.abs(P(q3) - P(q1)))}"`;
      s += rect + ` fill="${fill}" stroke="${st.col}" stroke-width="${f2(st.w)}"/>`;
      s += seg(md, off - h / 2, md, off + h / 2) + seg(mn, off, q1, off) + seg(q3, off, mx, off) + seg(mn, off - h / 4, mn, off + h / 4) + seg(mx, off - h / 4, mx, off + h / 4) + seg(d1, off - h / 3, d1, off + h / 3) + seg(d9, off - h / 3, d9, off + h / 3);
      if (leg) s += e.horiz ? T_(g.X(0) + 2, off + 1, leg, { size: 10 }) : T_(off, g.Y(0) + 5, leg, { size: 10, anchor: 'middle' });
    });
    if (e.title) s += T_(g.X(g.xOf(d.W / 2)), 8, e.title, { size: 12, anchor: 'middle', bold: true });
    return s;
  } };

/* --- titre optionnel pour les statistiques --- */
['stat1', 'stat2'].forEach(k => { const r0 = EX[k].render; EX[k].render = function (e, d, g, ctx) { return r0.call(this, e, d, g, ctx) + (e.title ? T_(g.X(g.xOf(d.W / 2)), 8, e.title, { size: 12, anchor: 'middle', bold: true }) : ''); };
  EX[k].fields = EX[k].fields.concat([['title', 'titre', 'text', 'grow']]); });

/* --- point par point à la manière de Windows : points + pentes (arcs de cubique) et Bézier lissé --- */
EX.pbpw = { label: 'Courbe point par point (format Windows)', def: () => ({ data: '0;0;1\n1;1;0\n2;0;-1', mode: 'pentes', tan: 0, coef: 100, mk: 'x', msz: 1.1, marks: true, cote: false, couleur: 16711680, couleur2: 16711680, ep: 2 }),
  fields: [['mode', 'type', 'sel', 'grow', [['pentes', 'points et pentes  (x ; y ; pente)'], ['bez', 'lissage par courbes de Bézier  (x ; y)']]], ['data', 'points (un par ligne)', 'area', 'grow'], 'br',
    ['tan', 'tangentes : 0 aucune, 1 double flèche, 2 droite', 'num', 'w3'], ['coef', 'coefficient de lissage (%)', 'num', 'w3'], ['marks', 'marquer les points', 'chk'], ['cote', 'lignes de cote', 'chk'], ['mk', 'marque', 'sel', 'w2', [['x', 'Croix'], ['plus', 'Plus'], ['dot', 'Point'], ['star', 'Étoile'], ['sq', 'Carré'], ['lo', 'Losange'], ['circ', 'Rond'], ['sq2', 'Carré 2'], ['lo2', 'Losange 2']]], ['msz', 'taille', 'num', 'w3', { step: 0.1 }], ['couleur', 'courbe', 'color'], ['couleur2', 'points', 'color'], ['ep', 'épaisseur', 'num', 'w3']],
  render(e, d, g) {
    const P = linesOf(e.data).map(l => l.split(';').map(x => parseNum(x, NaN))).filter(a => a.length >= 2 && Number.isFinite(a[0]) && Number.isFinite(a[1]));
    if (P.length < 2) return ''; const st = { col: tcolor(e.couleur), w: lineWidth(e.ep), style: 0 }, pc = tcolor(e.couleur2); let s = '';
    if (e.mode === 'pentes') {
      if (!e.nocurve) for (let i = 0; i < P.length - 1; i++) { const [x1, y1, m1 = 0] = P[i], [x2, y2, m2 = 0] = P[i + 1], h = x2 - x1, pts = [];
        if (!(Math.abs(h) > 1e-12)) continue;
        for (let k = 0; k <= 60; k++) { const t = k / 60, h00 = 2 * t ** 3 - 3 * t ** 2 + 1, h10 = t ** 3 - 2 * t ** 2 + t, h01 = -2 * t ** 3 + 3 * t ** 2, h11 = t ** 3 - t ** 2;
          pts.push([g.X(x1 + t * h), g.Y(h00 * y1 + h10 * h * m1 + h01 * y2 + h11 * h * m2)]); }
        s += drawPolyline(pts, st); }
      if (e.tan) P.forEach(([x, y, m = 0]) => { const L = e.tan === 2 ? 400 : 10, ux = g.X(x), uy = g.Y(y), vx = g.X(x + 1) - ux, vy = g.Y(y + m) - uy, n = Math.hypot(vx, vy) || 1;
        s += lineSeg([ux - L * vx / n, uy - L * vy / n], [ux + L * vx / n, uy + L * vy / n], pc, 0.25); });
    } else {
      const Q = P.map(a => [g.X(a[0]), g.Y(a[1])]), n = Q.length, co = e.coef, closed = n > 2 && Math.abs(P[0][0] - P[n - 1][0]) < 1e-9 && Math.abs(P[0][1] - P[n - 1][1]) < 1e-9;
      const ctl = (p1, p2, p3) => [(p2[0] + co * (p2[0] - p1[0]) / 100 + (p2[0] + p3[0]) / 2) / 2, (p2[1] + co * (p2[1] - p1[1]) / 100 + (p2[1] + p3[1]) / 2) / 2];
      const at = i => Q[(i + n - 1) % (n - (closed ? 1 : 0)) ] ; // utilisé seulement pour les courbes fermées
      let path = `M${f2(Q[0][0])} ${f2(Q[0][1])}`;
      for (let i = 0; i < n - 1; i++) {
        const p0 = i > 0 ? Q[i - 1] : (closed ? Q[n - 2] : null), p1 = Q[i], p2 = Q[i + 1], p3 = i + 2 < n ? Q[i + 2] : (closed ? Q[1] : null);
        const c1 = p0 ? ctl(p0, p1, p2) : p1, c2 = p3 ? ctl(p3, p2, p1) : p2;
        path += `C${f2(c1[0])} ${f2(c1[1])} ${f2(c2[0])} ${f2(c2[1])} ${f2(p2[0])} ${f2(p2[1])}`;
      }
      if (!e.nocurve) s += `<path d="${path}" fill="none" stroke="${st.col}" stroke-width="${f2(st.w)}"/>`;
    }
    if (e.marks) P.forEach(([x, y]) => { s += markSvg(g.X(x), g.Y(y), e.mk, e.msz, pc);
      if (e.cote) s += lineSeg([g.X(x), g.Y(0)], [g.X(x), g.Y(y)], pc, 0.15) + lineSeg([g.X(0), g.Y(y)], [g.X(x), g.Y(y)], pc, 0.15); });
    return s;
  } };
function markSvg(X, Y, k, sz, col) {
  const r = sz, L = (a, b, c, d2) => lineSeg([a, b], [c, d2], col, 0.3);
  switch (k) {
    case 'plus': return L(X - r, Y, X + r, Y) + L(X, Y - r, X, Y + r);
    case 'dot': return `<circle cx="${f2(X)}" cy="${f2(Y)}" r="${f2(r * 0.45)}" fill="${col}"/>`;
    case 'star': return L(X - r, Y, X + r, Y) + L(X, Y - r, X, Y + r) + L(X - r * .7, Y - r * .7, X + r * .7, Y + r * .7) + L(X - r * .7, Y + r * .7, X + r * .7, Y - r * .7);
    case 'sq': return `<rect x="${f2(X - r)}" y="${f2(Y - r)}" width="${f2(2 * r)}" height="${f2(2 * r)}" fill="none" stroke="${col}" stroke-width="0.3"/>`;
    case 'sq2': return `<rect x="${f2(X - r)}" y="${f2(Y - r)}" width="${f2(2 * r)}" height="${f2(2 * r)}" fill="${col}" stroke="${col}" stroke-width="0.3"/>`;
    case 'lo': return `<path d="M${f2(X - r)} ${f2(Y)}L${f2(X)} ${f2(Y - r)}L${f2(X + r)} ${f2(Y)}L${f2(X)} ${f2(Y + r)}Z" fill="none" stroke="${col}" stroke-width="0.3"/>`;
    case 'lo2': return `<path d="M${f2(X - r)} ${f2(Y)}L${f2(X)} ${f2(Y - r)}L${f2(X + r)} ${f2(Y)}L${f2(X)} ${f2(Y + r)}Z" fill="${col}" stroke="${col}" stroke-width="0.3"/>`;
    case 'circ': return `<circle cx="${f2(X)}" cy="${f2(Y)}" r="${f2(r)}" fill="none" stroke="${col}" stroke-width="0.3"/>`;
    default: return L(X - r, Y - r, X + r, Y + r) + L(X - r, Y + r, X + r, Y - r);
  }
}

/* --- arbre : taille automatique (comme Windows : 90 % de la page, 15 mm de marge à droite) --- */
{ const r0 = EX.arbre.render; EX.arbre.render = function (e, d, g, ctx) { if (!e.auto) return r0.call(this, e, d, g, ctx); return r0.call(this, Object.assign({}, e, { ox: d.W * 0.05, oy: d.H * 0.07, w: d.W * 0.9 - 15, h: d.H * 0.86 }), d, g, ctx); }; }

/* --- simulations statistiques (résultats enregistrés dans le .sqn) --- */
EX.simw = { label: 'Simulation (format Windows)', def: () => ({ gtype: 4, title: '', nbcl: 10, dist: 10, couleur: 65535, samples: [], calcs: [], general: [] }),
  fields: [['gtype', 'graphique : 0 points, 1 histogramme du dernier échantillon, 2 boîtes multiples, 3 histogramme général, 4 boîte générale, 5 histogramme des moyennes, 6 boîte des moyennes, 7 dispersion des moyennes', 'num', 'w3'], ['nbcl', 'classes', 'num', 'w3'], ['dist', 'distance entre boîtes (mm)', 'num', 'w3'], ['title', 'titre', 'text', 'grow'], ['couleur', 'couleur', 'color']],
  render(e, d, g) {
    const fill = tcolor(e.couleur), t = e.gtype | 0; let s = ''; const means = e.calcs.map(c => c[0]).filter(Number.isFinite);
    const box = (v, off) => { const [mn, d1, q1, md, q3, d9, mx] = v, P = x => g.X(x), L = (a, b, c2, d2, w = 0.5) => lineSeg([a, b], [c2, d2], '#000', w);
      return L(P(mn), off, P(q1), off) + L(P(q3), off, P(mx), off) + `<rect x="${f2(P(q1))}" y="${f2(off - 5)}" width="${f2(P(q3) - P(q1))}" height="10" fill="${fill}" stroke="#000" stroke-width="0.5"/>` + L(P(md), off - 5, P(md), off + 5) + L(P(d1), off - 3, P(d1), off + 3) + L(P(d9), off - 3, P(d9), off + 3); };
    const hist = (vals, lo, hi, n) => { const w = (hi - lo) / n || 1, c = Array(n).fill(0); vals.forEach(v => { c[Math.min(n - 1, Math.max(0, Math.floor((v - lo) / w)))]++; }); let r = ''; c.forEach((k, j) => { if (k) r += `<rect x="${f2(g.X(lo + j * w))}" y="${f2(g.Y(k))}" width="${f2(g.X(lo + (j + 1) * w) - g.X(lo + j * w))}" height="${f2(g.Y(0) - g.Y(k))}" fill="${fill}" stroke="#000" stroke-width="0.3"/>`; }); return r; };
    const ns = e.calcs.length, tl = ns ? Math.round(e.samples.length / ns) : 0, smp = i => e.samples.slice(i * tl, (i + 1) * tl), y0 = g.Y(0);
    if (t === 0 && tl) { for (let i = 0; i < ns; i++) smp(i).forEach(v => { s += `<circle cx="${f2(g.X(v))}" cy="${f2(y0 - (i + 1))}" r="0.4" fill="${fill}" stroke="${fill}" stroke-width="0.1"/>`; }); }
    else if (t === 1 && tl) { const v = smp(ns - 1), c = e.calcs[ns - 1] || [], rect = (a, b, n) => (n ? `<rect x="${f2(g.X(a))}" y="${f2(g.Y(n))}" width="${f2(g.X(b) - g.X(a))}" height="${f2(y0 - g.Y(n))}" fill="${fill}" stroke="#000" stroke-width="0.2"/>` : '');
      if (v.every(Number.isInteger)) { const lo = Math.min(...v), hi = Math.max(...v); for (let k = lo; k <= hi; k++) s += rect(k - 0.4, k + 0.4, v.filter(x => x === k).length); }
      else { const lo = Number.isFinite(c[2]) ? c[2] : Math.min(...v), hi = Number.isFinite(c[8]) ? c[8] : Math.max(...v), n = e.nbcl || 10, w = (hi - lo) / n; for (let k = 0; k < n; k++) s += rect(lo + k * w, lo + (k + 1) * w, v.filter(x => lo + k * w < x && x < lo + (k + 1) * w).length); } }
    else if (t === 2) e.calcs.forEach((c, i) => { if (c.length >= 9 && c.slice(2, 9).every(Number.isFinite)) s += box(c.slice(2, 9), g.Y(0) - (i + 1) * e.dist); });
    else if (t === 4 && e.general.length >= 10 && e.general.slice(3, 10).every(Number.isFinite)) s += box(e.general.slice(3, 10), g.Y(0) - 20);
    else if (t === 3 && e.samples.length) { const lo = Math.min(...e.samples), hi = Math.max(...e.samples); s += hist(e.samples, lo, hi, e.nbcl); }
    else if (t === 5 && means.length) s += hist(means, Math.min(...means), Math.max(...means), 20);
    else if (t === 6 && means.length) { const v = means.slice().sort((a, b) => a - b), n = v.length, med = n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; s += box([v[0], v[Math.max(0, Math.ceil(n / 10) - 1)], v[Math.max(0, Math.ceil(n / 4) - 1)], med, v[Math.min(n - 1, Math.floor(3 * n / 4) + n % 4 - 1)], v[Math.min(n - 1, n - Math.floor(n / 10) - 1)], v[n - 1]], g.Y(0) - 20); }
    else if (t === 7) means.forEach((m, i) => { s += `<circle cx="${f2(g.X(m))}" cy="${f2(g.Y(0) - 3 - 0.8 * i)}" r="0.8" fill="${fill}" stroke="#000" stroke-width="0.2"/>`; });
    if (e.title) s += T_(g.X(g.xOf(d.W / 2)), 8, e.title, { size: 12, anchor: 'middle' });
    return s;
  } };

/* --- tableaux de variations ou de signes au format Windows : [g:m:d]sép[g:m:d]… séparés par \\ --- */
function tabwDecode(code) {
  const rows = String(code || '').replace(/\s+$/, '').split(/\]\\\\/).map((l, i, a) => (i < a.length - 1 ? l + ']' : l)).filter(l => l.trim());
  return rows.map(l => { const t = []; let st = 1; for (let i = 1; i < l.length; i++) if ('[:]'.includes(l[i])) { t.push(l.slice(st, i)); st = i + 1; } return t; });
}
const TABW_RES = new Set(['', '//', '/>', '\\>', '_>', '|', '||', ':']);
function tabwTex(s, sz) {
  s = String(s || '');
  if (s.length > 2 && s.startsWith('||') && !TABW_RES.has(s.slice(2))) s = s.slice(2);
  if (s.length > 2 && s.endsWith('||') && !TABW_RES.has(s.slice(0, -2))) s = s.slice(0, -2);
  if (s.length > 1 && s[0] === '|' && !TABW_RES.has(s.slice(1))) s = s.slice(1);
  if (s.length > 1 && s.endsWith('|') && s[s.length - 2] !== 't' && !TABW_RES.has(s.slice(0, -1))) s = s.slice(0, -1);
  if (TABW_RES.has(s)) return null;
  s = s.replace(/\\hspace\{[^}]*\}/g, '').replace(/^\d\$\s*/, '').replace(/\\(black|blue|red|green|yellow|cyan|magenta|white|normalsize)\b/g, '');
  try { return texLayout(texParse(s), sz, '#000'); } catch (err) { return null; }
}
EX.tabw = { label: 'Tableau de variations ou de signes (format Windows)', def: () => ({ code: "[:x:]|[-\\infty::]-3[::+\\infty]\\\\[:f'(x):]|[:-:]|0[:+:]\\\\[:f(x):]|[+\\infty:\\>:]2[:/>:+\\infty]", sz: 3.8, couleur: 0, gras: false }),
  fields: [['code', 'code du tableau (une ligne par ligne du tableau, séparées par \\\\ )', 'area', 'grow'], 'br', ['sz', 'taille (mm)', 'num', 'w3', { step: 0.2 }], ['gras', 'traits épais', 'chk'], ['couleur', 'traits', 'color']],
  render(e, d, g) {
    const R = tabwDecode(e.code); if (R.length < 2) return ''; const sz = e.sz || 3.8, col = tcolor(e.couleur), wt = e.gras ? 0.33 : 0.22, GM = 1.4, PM = 0.7;
    const L = R.length, c = R[0].length, cc = Math.floor((c + 1) / 4), arrow = t => t === '/>' || t === '\\>' || t === '_>';
    const isVar = R.map(r => r.some(arrow)), F = R.map(r => r.map(t => tabwTex(t, sz)));
    let hL = 5, hV = 14, wC = 7, wT = 7;
    R.forEach((r, i) => { if (isVar[i]) return; for (let jj = 0; jj < cc; jj++) { let w = 0; for (let k = 0; k < 4; k++) { const b = F[i][4 * jj + k]; if (!b) continue; hL = Math.max(hL, b.a + b.dsc + 2 * GM); w += k < 3 ? b.w + 2 * GM : b.w / 2 + GM; } wC = Math.max(wC, w); } });
    R.forEach((r, i) => isVar[i] && (() => { for (let jj = 1; jj < cc; jj++) { const wd = k => (F[i][4 * jj + k] ? F[i][4 * jj + k].w : 0); wC = Math.max(wC, wd(-1 + 4) / 2 + 10 + wd(3) / 2 + wd(0) / 2 + wd(2) / 2 + 2 * GM, 20); } })());
    R.forEach((r, i) => { for (let k = 0; k < 3; k++) { const b = F[i][k]; if (b) wT = Math.max(wT, b.w + 2 * GM); } });
    const rh = i => (isVar[i] ? hV : hL), H = R.reduce((t, r, i) => t + rh(i), 0), W = wT + (cc - 1) * wC, ox = (d.W - W) / 2, oy = (d.H - H) / 2;
    const lnS = (x1, y1, x2, y2, w = wt) => lineSeg([ox + x1, oy + y1], [ox + x2, oy + y2], col, w); let s = `<rect x="${f2(ox)}" y="${f2(oy)}" width="${f2(W)}" height="${f2(H)}" fill="#fff" stroke="${col}" stroke-width="${wt}"/>`, defs = '';
    const ys = [0]; R.forEach((r, i) => ys.push(ys[i] + rh(i))); for (let i = 1; i < L; i++) s += lnS(0, ys[i], W, ys[i]);
    const draw = (b, x, yc, al) => { if (!b) return ''; const xx = al === 'l' ? x : al === 'r' ? x - b.w : x - b.w / 2; return b.draw(ox + xx, oy + yc + (b.a - b.dsc) / 2); };
    // hachures
    defs += hatchDefs('tw', 'b', col, 1.41, 0.2);
    for (let jj = 1; jj < cc; jj++) for (let i = 1; i < L; i++) { const t = R[i], hz = [4 * jj, 4 * jj + 1, 4 * jj + 2].some(k => t[k] === '//'); if (hz) s += `<rect x="${f2(ox + wT + (jj - 1) * wC)}" y="${f2(oy + ys[i])}" width="${f2(wC)}" height="${f2(rh(i))}" fill="url(#tw)" stroke="none"/>`; }
    R.forEach((r, i) => {
      const yc = (ys[i] + ys[i + 1]) / 2; for (let k = 0; k < 3; k++) { const b = F[i][k]; if (!b) continue; s += draw(b, k === 0 ? GM : k === 1 ? wT / 2 : wT - GM, yc, k === 0 ? 'l' : k === 1 ? 'c' : 'r'); }
      for (let jj = 1; jj < cc; jj++) {
        const x1 = wT + (jj - 1) * wC, x2 = x1 + wC, sepL = r[4 * jj - 1] || '', lft = r[4 * jj] || '', rgt = r[4 * jj + 2] || '';
        if (sepL.includes('|') && sepL !== '||' && !sepL.includes('||')) s += lnS(x1, ys[i], x1, ys[i + 1]);
        if (sepL.includes('||')) { s += lnS(x1 - PM / 2, ys[i], x1 - PM / 2, ys[i + 1]) + lnS(x1 + PM / 2, ys[i], x1 + PM / 2, ys[i + 1]); }
        if (lft.includes('||')) s += lnS(x1, ys[i], x1, ys[i + 1]) + lnS(x1 + PM, ys[i], x1 + PM, ys[i + 1]);
        if (rgt.includes('||')) s += lnS(x2 - PM, ys[i], x2 - PM, ys[i + 1]) + lnS(x2 - 0.1, ys[i], x2 - 0.1, ys[i + 1]);
        if (!isVar[i]) { s += draw(F[i][4 * jj - 1], x1, yc, 'c') + draw(F[i][4 * jj], x1 + GM, yc, 'l') + draw(F[i][4 * jj + 1], (x1 + x2) / 2, yc, 'c') + draw(F[i][4 * jj + 2], x2 - GM, yc, 'r'); }
      }
      if (isVar[i]) {
        const y1 = ys[i], y2 = ys[i + 1], mid = (y1 + y2) / 2, ar = jj => r[4 * jj + 1], dir = t => (t === '/>' ? 1 : t === '\\>' ? -1 : 0);
        const level = (jj, side) => { // niveau de la valeur de la frontière placée entre les cases jj-1 et jj ; side : 'a' arrivée, 'd' départ
          const prev = jj > 1 ? dir(ar(jj - 1)) : null, next = jj < cc ? dir(ar(jj)) : null, hasP = jj > 1 && arrow(ar(jj - 1)), hasN = jj < cc && arrow(ar(jj));
          const pa = side === 'a' ? hasP : false, pd = side === 'd' ? hasN : false; if (side === 'a' && hasP) return prev === 1 ? 1 : prev === -1 ? -1 : 0; if (side === 'd' && hasN) return next === 1 ? -1 : next === -1 ? 1 : 0;
          const both = hasP && hasN; if (both) return 0; return hasP ? (prev === 1 ? 1 : -1) : hasN ? (next === 1 ? -1 : 1) : 0; };
        const yAt = (lv, b) => (lv > 0 ? y1 + PM + (b ? b.a + b.dsc : 0) / 2 : lv < 0 ? y2 - PM - (b ? b.a + b.dsc : 0) / 2 : mid);
        for (let jj = 1; jj <= cc; jj++) { // frontière gauche de la case jj
          const x = wT + (jj - 1) * wC, edgeL = jj === 1, sepT = r[4 * jj - 1] || '';
          const lt = edgeL ? F[i][4] : null; if (edgeL) { if (lt) s += draw(lt, x + GM, yAt(level(1, 'd'), lt), 'l'); continue; }
          if (jj === cc) { const rv = F[i][4 * (cc - 1) + 2]; if (rv) s += draw(rv, x - GM, yAt(level(cc, 'a'), rv), 'r'); continue; }
          const rv = F[i][4 * (jj - 1) + 2], lv = F[i][4 * jj], sp = F[i][4 * jj - 1];
          if (rv || lv) { if (rv) s += draw(rv, x - GM / 2, yAt(level(jj, 'a'), rv), 'r'); if (lv) s += draw(lv, x + GM / 2, yAt(level(jj, 'd'), lv), 'l'); } else if (sp) s += draw(sp, x, yAt(level(jj, 'a'), sp), 'c');
        }
        for (let jj = 1; jj < cc; jj++) { const t = ar(jj), x1 = wT + (jj - 1) * wC, x2 = x1 + wC; if (!arrow(t)) continue;
          let a, b; if (t === '/>') { a = [x1 + GM, y2 - PM]; b = [x2 - GM, y1 + PM]; } else if (t === '\\>') { a = [x1 + GM, y1 + PM]; b = [x2 - GM, y2 - PM]; } else { const pv = jj > 1 ? dir(ar(jj - 1)) : 0, yy = pv === 1 ? y1 + PM : pv === -1 ? y2 - PM : mid; a = [x1 + GM, yy]; b = [x2 - GM, yy]; }
          s += arrowSvg([ox + a[0], oy + a[1]], [ox + b[0], oy + b[1]], col, wt); }
      }
    });
    return `<defs>${defs}</defs>` + s;
  } };

/* --- table de valeurs affichée sous le dessin (12 lignes × 11 colonnes de 17 × 7 mm) --- */
const TABV_H = 5 + 12 * 7 + 3;
EX.tabv = { label: 'Table de valeurs (affichée sous le dessin)', below: true, def: () => ({ kind: 'f', rows: [], couleur: 0 }),
  fields: [['kind', 'table', 'sel', 'w2', [['f', 'fonctions'], ['t', 'courbes paramétrées']]], ['couleur', 'traits', 'color']],
  render(e, d) {
    const cw = 17, rh = 7, x0 = 7, y0 = d.H + 5, col = tcolor(e.couleur || 0), head = [];
    for (let i = 0; i < 11; i++) head.push(e.kind === 't' ? (i === 0 ? 't' : (i % 2 ? 'x' : 'y') + Math.ceil(i / 2) + '(t)') : (i === 0 ? 'x' : 'f' + i + '(x)'));
    let s = '';
    for (let r = 0; r < 12; r++) for (let c = 0; c < 11; c++) {
      const txt = r === 0 ? head[c] : ((e.rows[r - 1] || [])[c] || '').trim(), X = x0 + c * cw, Y = y0 + r * rh;
      s += `<rect x="${f2(X)}" y="${f2(Y)}" width="${cw}" height="${rh}" fill="${r * c === 0 ? '#f0f0f0' : 'none'}" stroke="${col}" stroke-width="0.2"/>`;
      if (txt) s += T_(X + cw / 2, Y + rh / 2 + 1.2, txt, { size: 10, anchor: 'middle', font: 'Arial,Helvetica,sans-serif' });
    }
    return s; } };
