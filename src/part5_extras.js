/* ---------- 6. Compléments : dérivée, primitive, point par point, figures, statistiques, probabilités,
   arbres, suites, intégrales, inéquations, courbes implicites (coniques), tableaux, rapporteur, calculs ---------- */

const fmtC = (v, n = 4) => { // nombre -> texte français
  if (!Number.isFinite(v)) return String(v);
  let r = Number(v.toPrecision(n)); return String(r).replace('.', ',').replace('-', '-');
};
const rowsOf = txt => String(txt || '').split(/\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  .map(l => l.split(/[;\t]|\s+/).filter(x => x !== '').map(x => parseNum(x, NaN)));
const linesOf = txt => String(txt || '').split(/\n/).map(l => l.replace(/\s+$/, '')).filter(l => l.trim() !== '');
const exStroke = (e, w = 1) => ({ col: tcolor(e.couleur), w: lineWidth(e.ep) * w, style: e.style || 0 });
const T_ = (x, y, txt, o = {}) => `<text x="${f2(x)}" y="${f2(y)}" font-size="${f2((o.size || 10) * MM_PER_PT)}" font-family="${o.font || "'Times New Roman',Times,serif"}"${o.italic ? ' font-style="italic"' : ''}${o.bold ? ' font-weight="bold"' : ''} fill="${o.col || '#000'}" text-anchor="${o.anchor || 'start'}"${o.rot ? ` transform="rotate(${o.rot} ${f2(x)} ${f2(y)})"` : ''}>${esc(txt)}</text>`;
function fnOf(src, ctx) { // « f1 » ou expression en x
  const s = String(src || '').trim(); if (!s) throw new Error('Expression vide');
  const fn = compileExpr(s, ctx.F, 10); return x => fn(x, 0, 0);
}
function visibleX(d, g) { return [g.xOf(-5), g.xOf(d.W + 5)]; }
const lineSeg = (a, b, col, w, dash = '') => `<path d="M${f2(a[0])} ${f2(a[1])}L${f2(b[0])} ${f2(b[1])}" stroke="${col}" stroke-width="${f2(w)}" fill="none"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
function mean(a) { return a.reduce((s, v) => s + v, 0) / a.length; }
function median(sorted) { const n = sorted.length; return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2; }
function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
const normCdf = (x, m, s) => 0.5 * (1 + erf((x - m) / (s * Math.SQRT2)));
const normPdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
const binomPmf = (k, n, p) => k < 0 || k > n ? 0 : p <= 0 ? (k === 0 ? 1 : 0) : p >= 1 ? (k === n ? 1 : 0)
  : Math.exp(lnGamma(n + 1) - lnGamma(k + 1) - lnGamma(n - k + 1) + k * Math.log(p) + (n - k) * Math.log(1 - p));
const poisPmf = (k, l) => k < 0 ? 0 : Math.exp(-l + k * Math.log(l) - lnGamma(k + 1));
function solveLin(A, b) { // gauss
  const n = b.length; A = A.map(r => r.slice()); b = b.slice();
  for (let i = 0; i < n; i++) { let m = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r;
    [A[i], A[m]] = [A[m], A[i]]; [b[i], b[m]] = [b[m], b[i]];
    for (let r = i + 1; r < n; r++) { const f = A[r][i] / A[i][i]; for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]; b[r] -= f * b[i]; } }
  const x = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c]; x[i] = s / A[i][i]; } return x;
}
const arrowSvg = (a, b, col, w = 0.4) => {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return `<path d="M${f2(a[0])} ${f2(a[1])}L${f2(b[0])} ${f2(b[1])}" stroke="${col}" stroke-width="${f2(w)}" fill="none"/>` + arrowHead(b[0], b[1], ang, col, 2.6);
};

const EX = {};
const STY = [[0, 'Continu'], [1, 'Tirets'], [2, 'Pointillés']];

/* --- dérivée --- */
EX.deriv = { label: 'Courbe dérivée', def: () => ({ src: 'f1', couleur: 255, ep: 2, style: 0 }),
  fields: [['src', 'dérivée de (f1… ou expression)', 'text', 'grow'], ['couleur', 'couleur', 'color'], ['ep', 'épaisseur', 'num', 'w3'], ['style', 'style', 'sel', 'w3', STY]],
  render(e, d, g, ctx) { const f = fnOf(e.src, ctx), h = 1e-5; return drawPolyline(sampleFn(x => (f(x + h) - f(x - h)) / (2 * h), d, g, 800), exStroke(e)); } };

/* --- primitive --- */
EX.prim = { label: 'Primitive passant par un point', def: () => ({ src: 'f1', x0: 0, y0: 0, couleur: 32768, ep: 2, style: 0 }),
  fields: [['src', 'primitive de', 'text', 'grow'], ['x0', 'x₀', 'num', 'w3'], ['y0', 'F(x₀)', 'num', 'w3'], ['couleur', 'couleur', 'color'], ['ep', 'épaisseur', 'num', 'w3']],
  render(e, d, g, ctx) {
    const f = fnOf(e.src, ctx), [a, b] = visibleX(d, g), N = 1200, xs = Array.from({ length: N + 1 }, (_, i) => a + (b - a) * i / N);
    let i0 = 0; xs.forEach((x, i) => { if (Math.abs(x - e.x0) < Math.abs(xs[i0] - e.x0)) i0 = i; });
    const val = Array(N + 1).fill(NaN); val[i0] = e.y0;
    const stepI = (x1, x2) => { const m = (x1 + x2) / 2; return (x2 - x1) / 6 * (f(x1) + 4 * f(m) + f(x2)); };
    for (let i = i0 + 1; i <= N; i++) val[i] = val[i - 1] + stepI(xs[i - 1], xs[i]);
    for (let i = i0 - 1; i >= 0; i--) val[i] = val[i + 1] - stepI(xs[i], xs[i + 1]);
    const pts = xs.map((x, i) => Number.isFinite(val[i]) ? [g.X(x), clamp(g.Y(val[i]), -1e4, 1e4)] : null);
    return drawPolyline(breakJumps(pts, d.H), exStroke(e));
  } };

/* --- point par point --- */
EX.pbp = { label: 'Courbe point par point', def: () => ({ data: '0;0\n1;2\n2;1\n3;3\n4;2', mode: 'lisse', marks: true, couleur: 16711680, ep: 2, style: 0 }),
  fields: [['data', 'points (x;y, un par ligne)', 'area', 'grow'], 'br', ['mode', 'tracé', 'sel', 'w2', [['seg', 'Segments'], ['lisse', 'Courbe lissée']]], ['marks', 'croix sur les points', 'chk'],
    ['couleur', 'couleur', 'color'], ['ep', 'épaisseur', 'num', 'w3'], ['style', 'style', 'sel', 'w3', STY]],
  render(e, d, g) {
    const P = rowsOf(e.data).filter(r => r.length >= 2 && r.every(Number.isFinite)).map(r => [g.X(r[0]), g.Y(r[1])]), st = exStroke(e); let s = '';
    if (P.length >= 2) {
      if (e.mode === 'seg') s += drawPolyline(P, st);
      else {
        let dstr = `M${f2(P[0][0])} ${f2(P[0][1])}`;
        for (let i = 0; i < P.length - 1; i++) {
          const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
          dstr += `C${f2(p1[0] + (p2[0] - p0[0]) / 6)} ${f2(p1[1] + (p2[1] - p0[1]) / 6)} ${f2(p2[0] - (p3[0] - p1[0]) / 6)} ${f2(p2[1] - (p3[1] - p1[1]) / 6)} ${f2(p2[0])} ${f2(p2[1])}`;
        }
        s += `<path d="${dstr}" fill="none" stroke="${st.col}" stroke-width="${f2(st.w)}"${st.style === 1 ? ' stroke-dasharray="2 1"' : st.style === 2 ? ' stroke-dasharray="0.5 1"' : ''}/>`;
      }
    }
    if (e.marks) P.forEach(p => { s += `<path d="M${f2(p[0] - 1.1)} ${f2(p[1] - 1.1)}l2.2 2.2M${f2(p[0] - 1.1)} ${f2(p[1] + 1.1)}l2.2 -2.2" stroke="${st.col}" stroke-width="0.3"/>`; });
    return s;
  } };

/* --- figures géométriques --- */
const SHAPES = [['cercle', 'Cercle  (cx;cy;r)'], ['ellipse', 'Ellipse  (cx;cy;a;b;angle°)'], ['vecteur', 'Vecteur  (x1;y1;x2;y2)'], ['demidroite', 'Demi-droite  (x1;y1;x2;y2)'],
  ['polygone', 'Polygone  (un sommet x;y par ligne)'], ['arc', 'Arc / angle  (cx;cy;r;angle1°;angle2°)'], ['bezier', 'Courbe de Bézier  (points de contrôle, un par ligne)'], ['segments', 'Ligne brisée  (un point par ligne)']];
EX.shape = { label: 'Figure (cercle, polygone, vecteur…)', def: () => ({ kind: 'cercle', data: '0;0;2', couleur: 0, ep: 2, style: 0, fill: false, fillCol: 16776960, opa: 0.35, nom: '' }),
  fields: [['kind', 'figure', 'sel', 'grow', SHAPES], ['data', 'données', 'area', 'grow'], 'br', ['couleur', 'trait', 'color'], ['ep', 'épaisseur', 'num', 'w3'], ['style', 'style', 'sel', 'w3', STY],
    ['fill', 'remplir', 'chk'], ['fillCol', 'fond', 'color'], ['opa', 'opacité', 'num', 'w3', { step: 0.05, min: 0, max: 1 }], ['nom', 'nom', 'text', 'w3']],
  render(e, d, g) {
    const R = rowsOf(e.data), st = exStroke(e), col = st.col, w = st.w, dash = st.style === 1 ? ' stroke-dasharray="2 1"' : st.style === 2 ? ' stroke-dasharray="0.5 1"' : '';
    const fill = e.fill ? `fill="${tcolor(e.fillCol)}" fill-opacity="${e.opa}"` : 'fill="none"';
    const r0 = R[0] || [], K = e.kind; let s = '', label = null;
    const sx = g.lx / g.ux, sy = g.ly / g.uy;
    if (K === 'cercle') { const [cx, cy, r] = r0; s = `<ellipse cx="${f2(g.X(cx))}" cy="${f2(g.Y(cy))}" rx="${f2(Math.abs(r * sx))}" ry="${f2(Math.abs(r * sy))}" ${fill} stroke="${col}" stroke-width="${f2(w)}"${dash}/>`; label = [g.X(cx), g.Y(cy)]; }
    else if (K === 'ellipse') { const [cx, cy, a, b, ang = 0] = r0; s = `<ellipse cx="${f2(g.X(cx))}" cy="${f2(g.Y(cy))}" rx="${f2(Math.abs(a * sx))}" ry="${f2(Math.abs(b * sy))}" transform="rotate(${-ang} ${f2(g.X(cx))} ${f2(g.Y(cy))})" ${fill} stroke="${col}" stroke-width="${f2(w)}"${dash}/>`; label = [g.X(cx), g.Y(cy)]; }
    else if (K === 'vecteur') { const [x1, y1, x2, y2] = r0; s = arrowSvg([g.X(x1), g.Y(y1)], [g.X(x2), g.Y(y2)], col, w); label = [g.X(x2), g.Y(y2)]; }
    else if (K === 'demidroite') { const [x1, y1, x2, y2] = r0, A = [g.X(x1), g.Y(y1)], B = [g.X(x2), g.Y(y2)], L = (d.W + d.H) * 2, n = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
      s = lineSeg(A, [A[0] + (B[0] - A[0]) / n * L, A[1] + (B[1] - A[1]) / n * L], col, w, dash ? '2 1' : ''); label = A; }
    else if (K === 'polygone' || K === 'segments') { const P = R.filter(r => r.length >= 2).map(r => [g.X(r[0]), g.Y(r[1])]);
      if (P.length >= 2) s = `<path d="M${P.map(p => f2(p[0]) + ' ' + f2(p[1])).join('L')}${K === 'polygone' ? 'Z' : ''}" ${K === 'polygone' ? fill : 'fill="none"'} stroke="${col}" stroke-width="${f2(w)}" stroke-linejoin="round"${dash}/>`; label = P[0]; }
    else if (K === 'arc') { const [cx, cy, r, a1, a2] = r0, A = a1 * Math.PI / 180, B = a2 * Math.PI / 180, N = 60; const pts = [];
      for (let i = 0; i <= N; i++) { const t = A + (B - A) * i / N; pts.push([g.X(cx + r * Math.cos(t)), g.Y(cy + r * Math.sin(t))]); }
      s = `<path d="M${pts.map(p => f2(p[0]) + ' ' + f2(p[1])).join('L')}" ${fill} stroke="${col}" stroke-width="${f2(w)}"${dash}/>`; label = pts[N >> 1]; }
    else if (K === 'bezier') { const P = R.filter(r => r.length >= 2).map(r => [g.X(r[0]), g.Y(r[1])]);
      if (P.length >= 3) { const cmd = P.length === 3 ? 'Q' : 'C'; s = `<path d="M${f2(P[0][0])} ${f2(P[0][1])}${cmd}${P.slice(1, 4).map(p => f2(p[0]) + ' ' + f2(p[1])).join(' ')}" fill="none" stroke="${col}" stroke-width="${f2(w)}"${dash}/>`; } label = P[0]; }
    if (e.nom && label) s += T_(label[0] + 1.5, label[1] - 1.5, e.nom, { italic: true });
    return s;
  } };

/* --- statistiques à une variable --- */
function stat1Data(e) { // renvoie {vals:[[x,eff]], classes:[[a,b,eff]], all:[valeurs]}
  const R = rowsOf(e.data).filter(r => r.every(Number.isFinite));
  if (e.mode === 'histo') { const cl = R.filter(r => r.length >= 3); return { classes: cl, all: [] }; }
  const map = new Map(); R.forEach(r => { map.set(r[0], (map.get(r[0]) || 0) + (r.length >= 2 ? r[1] : 1)); });
  const vals = [...map.entries()].sort((a, b) => a[0] - b[0]); const all = []; vals.forEach(([x, n]) => { for (let i = 0; i < n && all.length < 100000; i++) all.push(x); });
  return { vals, all };
}
function quart(sorted, q) { const n = sorted.length; return sorted[Math.max(0, Math.ceil(n * q) - 1)]; }
EX.stat1 = { label: 'Statistique à une variable', def: () => ({ mode: 'batons', data: '1;3\n2;5\n3;8\n4;4\n5;2', ky: 1, y0: -2, h: 1.2, showStats: true, sx: 0, sy: 0, couleur: 16711680, couleur2: 16777181, ep: 3, sim: 'bin', simN: 50, simA: 10, simB: 0.5 }),
  fields: [['mode', 'représentation', 'sel', 'grow', [['batons', 'Diagramme en bâtons  (valeur;effectif)'], ['histo', 'Histogramme  (a;b;effectif)'], ['boite', 'Boîte à moustaches  (valeurs brutes)'], ['cumul', 'Polygone des effectifs cumulés croissants']]],
    ['data', 'données (une ligne par valeur)', 'area', 'grow'], 'br', ['ky', 'échelle verticale', 'num', 'w2', { step: 0.1 }], ['y0', 'boîte : y', 'num', 'w3', { step: 0.5 }], ['h', 'boîte : hauteur', 'num', 'w3', { step: 0.1 }], 'br',
    ['couleur', 'trait', 'color'], ['couleur2', 'remplissage', 'color'], ['ep', 'épaisseur', 'num', 'w3'], ['showStats', 'afficher moyenne, médiane, écart-type', 'chk'], ['sx', 'x', 'num', 'w3', { step: 0.1 }], ['sy', 'y', 'num', 'w3', { step: 0.1 }], 'br',
    ['sim', 'simulation', 'sel', 'w2', [['bin', 'Binomiale (n;p)'], ['unif', 'Uniforme entière (1..A)'], ['bern', 'Bernoulli (p)'], ['norm', 'Normale (μ;σ)'], ['geo', 'Géométrique (p)'], ['pois', 'Poisson (λ)']]],
    ['simN', 'nb tirages', 'num', 'w3'], ['simA', 'A / n / μ / λ', 'num', 'w3', { step: 0.1 }], ['simB', 'p / σ', 'num', 'w3', { step: 0.05 }],
    ['@sim', 'Simuler → remplir les données', 'btn']],
  action(e, name) {
    if (name !== '@sim') return; const out = []; const rnd = Math.random, N = Math.min(100000, e.simN | 0);
    const norm = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
    for (let i = 0; i < N; i++) {
      let v; if (e.sim === 'bin') { v = 0; for (let k = 0; k < e.simA; k++) v += rnd() < e.simB ? 1 : 0; } else if (e.sim === 'unif') v = 1 + Math.floor(rnd() * e.simA);
      else if (e.sim === 'bern') v = rnd() < e.simA ? 1 : 0; else if (e.sim === 'norm') v = Math.round((e.simA + e.simB * norm()) * 100) / 100;
      else if (e.sim === 'geo') { v = 1; while (rnd() > e.simA && v < 1e4) v++; } else { let L = Math.exp(-e.simA), k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); v = k - 1; }
      out.push(v);
    }
    if (e.sim === 'norm') { e.data = out.map(v => v).join('\n'); e.mode = 'boite'; } else { const m = new Map(); out.forEach(v => m.set(v, (m.get(v) || 0) + 1)); e.data = [...m.entries()].sort((a, b) => a[0] - b[0]).map(([k, n]) => k + ';' + n).join('\n'); e.mode = 'batons'; }
  },
  render(e, d, g) {
    const D = stat1Data(e), st = exStroke(e), fillc = tcolor(e.couleur2); let s = '', all = D.all, info = '';
    if (e.mode === 'batons') {
      for (const [x, n] of D.vals) s += lineSeg([g.X(x), g.Y(0)], [g.X(x), g.Y(n * e.ky)], st.col, st.w * 1.6);
    } else if (e.mode === 'histo') {
      for (const [a, b, n] of D.classes) { const hgt = n / (b - a) * e.ky; s += `<rect x="${f2(g.X(a))}" y="${f2(g.Y(hgt))}" width="${f2(g.X(b) - g.X(a))}" height="${f2(g.Y(0) - g.Y(hgt))}" fill="${fillc}" stroke="${st.col}" stroke-width="${f2(st.w * 0.6)}"/>`; }
      D.classes.forEach(([a, b, n]) => { for (let i = 0; i < n && all.length < 100000; i++) all.push((a + b) / 2); });
    } else if (e.mode === 'boite' && all.length) {
      const v = all.slice().sort((a, b) => a - b), q1 = quart(v, 0.25), q3 = quart(v, 0.75), md = median(v), mn = v[0], mx = v[v.length - 1];
      const y1 = g.Y(e.y0 - e.h / 2), y2 = g.Y(e.y0 + e.h / 2), ym = g.Y(e.y0);
      s += `<rect x="${f2(g.X(q1))}" y="${f2(Math.min(y1, y2))}" width="${f2(g.X(q3) - g.X(q1))}" height="${f2(Math.abs(y1 - y2))}" fill="${fillc}" stroke="${st.col}" stroke-width="${f2(st.w * 0.7)}"/>` +
        lineSeg([g.X(md), y1], [g.X(md), y2], st.col, st.w) + lineSeg([g.X(mn), ym], [g.X(q1), ym], st.col, st.w * 0.7) + lineSeg([g.X(q3), ym], [g.X(mx), ym], st.col, st.w * 0.7) +
        lineSeg([g.X(mn), (y1 + ym) / 2 + (ym - y1) * 0], [g.X(mn), (2 * ym - y1 + ym) / 2], st.col, st.w * 0.7) + lineSeg([g.X(mx), y1 * 0.5 + ym * 0.5], [g.X(mx), y2 * 0.5 + ym * 0.5], st.col, st.w * 0.7);
      info = `min=${fmtC(mn)}  Q1=${fmtC(q1)}  méd=${fmtC(md)}  Q3=${fmtC(q3)}  max=${fmtC(mx)}`;
    } else if (e.mode === 'cumul') {
      let c = 0; const pts = [[g.X(D.vals[0] ? D.vals[0][0] : 0), g.Y(0)]]; for (const [x, n] of D.vals) { c += n; pts.push([g.X(x), g.Y(c * e.ky)]); }
      s += drawPolyline(pts, st) + pts.map(p => `<circle cx="${f2(p[0])}" cy="${f2(p[1])}" r="0.9" fill="${st.col}"/>`).join('');
    }
    if (e.showStats && all.length) {
      const m = mean(all), sd = Math.sqrt(mean(all.map(v => (v - m) ** 2))), sorted = all.slice().sort((a, b) => a - b);
      const txt = [`N = ${all.length}`, `moyenne = ${fmtC(m)}`, `médiane = ${fmtC(median(sorted))}`, `écart-type = ${fmtC(sd)}`, ...(info ? [info] : [])];
      txt.forEach((t, i) => { s += T_(g.X(e.sx), g.Y(e.sy) + 4 * i, t, { size: 9 }); });
    }
    return s;
  } };

/* --- statistiques à deux variables --- */
EX.stat2 = { label: 'Statistique à deux variables (nuage, ajustement)', def: () => ({ data: '1;2.1\n2;3.9\n3;6.2\n4;7.8\n5;10.1\n6;12.2', fit: 'lin', cloud: true, gpoint: true, show: true, tx: 0, ty: 0, couleur: 16711680, couleur2: 255, ep: 2 }),
  fields: [['data', 'points (x;y)', 'area', 'grow'], 'br', ['fit', 'ajustement', 'sel', 'grow', [['none', 'Aucun'], ['lin', 'Droite des moindres carrés'], ['mayer', 'Droite de Mayer'], ['log', 'Logarithmique  y = a·ln x + b'], ['exp', 'Exponentielle  y = a·eᵇˣ'], ['pow', 'Puissance  y = a·xᵇ'], ['par', 'Polynomiale de degré 2'], ['pol3', 'Polynomiale de degré 3'], ['pol4', 'Polynomiale de degré 4']]],
    ['cloud', 'nuage', 'chk'], ['gpoint', 'point moyen G', 'chk'], ['show', 'afficher l’équation', 'chk'], ['tx', 'x', 'num', 'w3', { step: 0.1 }], ['ty', 'y', 'num', 'w3', { step: 0.1 }], ['couleur', 'points', 'color'], ['couleur2', 'courbe', 'color'], ['ep', 'épaisseur', 'num', 'w3']],
  render(e, d, g) {
    const P = rowsOf(e.data).filter(r => r.length >= 2 && r.every(Number.isFinite)); let s = ''; if (!P.length) return s;
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]), n = P.length, mx = mean(xs), my = mean(ys), c1 = tcolor(e.couleur), c2 = tcolor(e.couleur2); let f = null, eq = '', r2 = null;
    const lin = (X, Y) => { const mX = mean(X), mY = mean(Y); const sxy = mean(X.map((v, i) => v * Y[i])) - mX * mY, sxx = mean(X.map(v => v * v)) - mX * mX; const a = sxy / sxx, b = mY - a * mX; const syy = mean(Y.map(v => v * v)) - mY * mY; return { a, b, r: sxy / Math.sqrt(sxx * syy) }; };
    if (e.fit === 'lin' && n >= 2) { const r = lin(xs, ys); f = x => r.a * x + r.b; eq = `y = ${fmtC(r.a)}x ${r.b < 0 ? '-' : '+'} ${fmtC(Math.abs(r.b))}   (r = ${fmtC(r.r)})`; }
    else if (e.fit === 'mayer' && n >= 4) { const idx = P.map((p, i) => i).sort((a, b) => xs[a] - xs[b]), h = Math.floor(n / 2); const A = idx.slice(0, h), B = idx.slice(n - h);
      const g1 = [mean(A.map(i => xs[i])), mean(A.map(i => ys[i]))], g2 = [mean(B.map(i => xs[i])), mean(B.map(i => ys[i]))]; const a = (g2[1] - g1[1]) / (g2[0] - g1[0]), b = g1[1] - a * g1[0];
      f = x => a * x + b; eq = `y = ${fmtC(a)}x ${b < 0 ? '-' : '+'} ${fmtC(Math.abs(b))}  (Mayer)`;
      s += [g1, g2].map(G => `<circle cx="${f2(g.X(G[0]))}" cy="${f2(g.Y(G[1]))}" r="1.1" fill="${c2}"/>`).join(''); }
    else if (e.fit === 'exp' && ys.every(v => v > 0) && n >= 2) { const r = lin(xs, ys.map(Math.log)), a = Math.exp(r.b); f = x => a * Math.exp(r.a * x); eq = `y = ${fmtC(a)}·e^(${fmtC(r.a)}x)`; }
    else if (e.fit === 'pow' && ys.every(v => v > 0) && xs.every(v => v > 0) && n >= 2) { const r = lin(xs.map(Math.log), ys.map(Math.log)), a = Math.exp(r.b); f = x => a * Math.pow(x, r.a); eq = `y = ${fmtC(a)}·x^${fmtC(r.a)}`; }
    else if (e.fit === 'log' && xs.every(v => v > 0) && n >= 2) { const r = lin(xs.map(Math.log), ys); f = x => r.a * Math.log(x) + r.b; eq = `y = ${fmtC(r.a)}·ln x ${r.b < 0 ? '-' : '+'} ${fmtC(Math.abs(r.b))}`; }
    else if ((e.fit === 'pol3' || e.fit === 'pol4') && n > (e.fit === 'pol3' ? 3 : 4)) { const m = e.fit === 'pol3' ? 3 : 4, S = k => xs.reduce((t, x) => t + Math.pow(x, k), 0), Sy = k => xs.reduce((t, x, i) => t + Math.pow(x, k) * ys[i], 0);
      const A = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => S(2 * m - i - j))), c = solveLin(A, Array.from({ length: m + 1 }, (_, i) => Sy(m - i))); f = x => c.reduce((t, k) => t * x + k, 0);
      eq = 'y = ' + c.map((k, i) => (i && k >= 0 ? '+ ' : i ? '- ' : '') + fmtC(i ? Math.abs(k) : k) + (m - i > 1 ? 'x^' + (m - i) : m - i === 1 ? 'x' : '')).join(' '); }
    else if (e.fit === 'par' && n >= 3) { const S = k => xs.reduce((t, x) => t + Math.pow(x, k), 0), Sy = k => xs.reduce((t, x, i) => t + Math.pow(x, k) * ys[i], 0);
      const [a, b, c] = solveLin([[S(4), S(3), S(2)], [S(3), S(2), S(1)], [S(2), S(1), n]], [Sy(2), Sy(1), Sy(0)]); f = x => a * x * x + b * x + c; eq = `y = ${fmtC(a)}x² ${b < 0 ? '-' : '+'} ${fmtC(Math.abs(b))}x ${c < 0 ? '-' : '+'} ${fmtC(Math.abs(c))}`; }
    if (f) s += drawPolyline(sampleFn(f, d, g, 600), { col: c2, w: lineWidth(e.ep), style: 0 });
    if (e.cloud) P.forEach(p => { const X = g.X(p[0]), Y = g.Y(p[1]); s += `<path d="M${f2(X - 1.2)} ${f2(Y - 1.2)}l2.4 2.4M${f2(X - 1.2)} ${f2(Y + 1.2)}l2.4 -2.4" stroke="${c1}" stroke-width="0.35"/>`; });
    if (e.gpoint) s += `<circle cx="${f2(g.X(mx))}" cy="${f2(g.Y(my))}" r="1.3" fill="${c1}"/>` + T_(g.X(mx) + 1.8, g.Y(my) - 1.8, 'G', { italic: true, size: 10, col: c1 });
    if (e.show && eq) s += T_(g.X(e.tx), g.Y(e.ty), eq, { size: 10, col: c2 });
    return s;
  } };

/* --- lois de probabilité --- */
EX.loi = { label: 'Loi de probabilité', init(e) { const K = { bin: [10, 0.5, 3, 6, 20], poi: [3, 0, 1, 4, 20], nor: [0, 1, -1, 1, 10], exp: [0.5, 0, 0, 3, 10], uni: [-3, 3, -1, 2, 10] }[e.kind]; if (K) [e.p1, e.p2, e.a, e.b, e.ky] = K; }, def: () => ({ kind: 'bin', p1: 10, p2: 0.5, a: 3, b: 6, zone: true, ky: 20, label: true, lx: 0, ly: 0, couleur: 16711680, couleur2: 16776960, ep: 2 }),
  fields: [['kind', 'loi', 'sel', 'grow', [['bin', 'Binomiale B(n ; p)'], ['poi', 'Poisson P(λ)'], ['nor', 'Normale N(μ ; σ)'], ['exp', 'Exponentielle E(λ)'], ['uni', 'Uniforme sur [a ; b]']]],
    ['p1', 'n / λ / μ / a', 'num', 'w3', { step: 0.1 }], ['p2', 'p / σ / b', 'num', 'w3', { step: 0.05 }], 'br', ['zone', 'colorier P(a ≤ X ≤ b)', 'chk'], ['a', 'a', 'num', 'w3', { step: 0.5 }], ['b', 'b', 'num', 'w3', { step: 0.5 }],
    ['ky', 'échelle verticale', 'num', 'w3', { step: 1 }], 'br', ['label', 'afficher la probabilité', 'chk'], ['lx', 'x', 'num', 'w3', { step: 0.1 }], ['ly', 'y', 'num', 'w3', { step: 0.1 }], ['couleur', 'trait', 'color'], ['couleur2', 'zone', 'color'], ['ep', 'ép.', 'num', 'w3']],
  render(e, d, g) {
    const st = exStroke(e), fc = tcolor(e.couleur2); let s = '', prob = NaN, name = ''; const K = e.kind;
    if (K === 'bin' || K === 'poi') {
      const n = K === 'bin' ? Math.round(e.p1) : Math.ceil(e.p1 + 6 * Math.sqrt(e.p1) + 10), pm = k => K === 'bin' ? binomPmf(k, n, e.p2) : poisPmf(k, e.p1);
      prob = 0; for (let k = 0; k <= n; k++) { const v = pm(k), inz = e.zone && k >= Math.ceil(e.a - 1e-9) && k <= Math.floor(e.b + 1e-9); if (inz) prob += v;
        const X0 = g.X(k - 0.4), X1 = g.X(k + 0.4), Y0 = g.Y(0), Y1 = g.Y(v * e.ky); if (Y0 - Y1 < 0.05) continue;
        s += `<rect x="${f2(X0)}" y="${f2(Y1)}" width="${f2(X1 - X0)}" height="${f2(Y0 - Y1)}" fill="${inz ? fc : 'none'}" stroke="${st.col}" stroke-width="${f2(st.w * 0.6)}"/>`; }
      name = K === 'bin' ? `B(${n} ; ${fmtC(e.p2)})` : `P(${fmtC(e.p1)})`;
    } else {
      const pdf = K === 'nor' ? x => normPdf(x, e.p1, e.p2) : K === 'exp' ? x => x < 0 ? 0 : e.p1 * Math.exp(-e.p1 * x) : x => x >= e.p1 && x <= e.p2 ? 1 / (e.p2 - e.p1) : 0;
      const cdf = K === 'nor' ? x => normCdf(x, e.p1, e.p2) : K === 'exp' ? x => x < 0 ? 0 : 1 - Math.exp(-e.p1 * x) : x => clamp((x - e.p1) / (e.p2 - e.p1), 0, 1);
      if (e.zone) { prob = cdf(e.b) - cdf(e.a); const N = 120, pts = []; for (let i = 0; i <= N; i++) { const x = e.a + (e.b - e.a) * i / N; pts.push(f2(g.X(x)) + ' ' + f2(g.Y(pdf(x) * e.ky))); }
        s += `<path d="M${f2(g.X(e.a))} ${f2(g.Y(0))}L${pts.join('L')}L${f2(g.X(e.b))} ${f2(g.Y(0))}Z" fill="${fc}" fill-opacity="0.6" stroke="none"/>`; }
      s += drawPolyline(sampleFn(x => pdf(x) * e.ky, d, g, 700), st);
      name = K === 'nor' ? `N(${fmtC(e.p1)} ; ${fmtC(e.p2)}²)` : K === 'exp' ? `E(${fmtC(e.p1)})` : `U([${fmtC(e.p1)} ; ${fmtC(e.p2)}])`;
    }
    if (e.label) s += T_(g.X(e.lx), g.Y(e.ly), name + (Number.isFinite(prob) && e.zone ? `   P(${fmtC(e.a)} ≤ X ≤ ${fmtC(e.b)}) ≈ ${fmtC(prob)}` : ''), { size: 10 });
    return s;
  } };

/* --- arbre de probabilités --- */
function parseTree(txt) {
  const root = { name: 'Ω', p: 1, ch: [], depth: 0 }, stack = [root];
  for (const raw of linesOf(txt)) {
    const lvl = Math.floor(raw.match(/^[ \t]*/)[0].replace(/\t/g, '  ').length / 2), toks = raw.trim().split(/\s+/);
    const last = toks[toks.length - 1], pv = evalConst(last, NaN); let name = toks.slice(0, -1).join(' '), p = pv;
    if (!Number.isFinite(pv)) { name = toks.join(' '); p = NaN; }
    const node = { name, p, ch: [], depth: lvl + 1 }; while (stack.length > lvl + 1) stack.pop(); stack[stack.length - 1].ch.push(node); stack.length = lvl + 1; stack.push(node);
  }
  return root;
}
EX.arbre = { label: 'Arbre de probabilités', def: () => ({ data: 'A 0.3\n  B 0.4\n  B̄ 0.6\nĀ 0.7\n  B 0.2\n  B̄ 0.8', ox: 12, oy: 12, w: 110, h: 70, leaves: true, couleur: 0, couleur2: 8388608, size: 11 }),
  fields: [['data', 'arbre : une branche par ligne « nom probabilité », 2 espaces par niveau', 'area', 'grow'], 'br', ['ox', 'x (mm)', 'num', 'w3'], ['oy', 'y (mm)', 'num', 'w3'], ['w', 'largeur', 'num', 'w3'], ['h', 'hauteur', 'num', 'w3'], ['size', 'taille', 'num', 'w3'],
    ['leaves', 'probabilités des chemins', 'chk'], ['couleur', 'branches', 'color'], ['couleur2', 'probabilités', 'color']],
  render(e) {
    const root = parseTree(e.data); let maxD = 0, leaves = 0; (function w(n) { maxD = Math.max(maxD, n.depth); if (!n.ch.length) n.leaf = leaves++; n.ch.forEach(w); })(root);
    if (!leaves) return ''; const colW = e.w / (maxD + (e.leaves ? 1.2 : 0.6)), sz = e.size, col = tcolor(e.couleur), pc = tcolor(e.couleur2); let s = '';
    const yOf = n => n.ch.length ? mean(n.ch.map(yOf)) : e.oy + (n.leaf + 0.5) * e.h / leaves, xOf = n => e.ox + n.depth * colW;
    (function draw(n, prod) {
      n.ch.forEach(c => {
        const pr = (Number.isFinite(c.p) ? c.p : 0), A = [xOf(n) + 1, yOf(n)], B = [xOf(c) - 1, yOf(c)];
        s += lineSeg(A, B, col, 0.35) + T_((A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 1.3 + (B[1] > A[1] ? 0 : -0.3), Number.isFinite(c.p) ? fmtC(c.p) : '', { size: sz * 0.8, col: pc, anchor: 'middle' });
        s += T_(B[0] + 1.2, B[1] + sz * 0.12, c.name, { size: sz, italic: true });
        if (!c.ch.length && e.leaves) s += T_(e.ox + (maxD + 0.55) * colW, B[1] + sz * 0.12, 'P = ' + fmtC(prod * pr), { size: sz * 0.85, col: pc });
        draw(c, prod * pr);
      });
    })(root, 1);
    s += `<circle cx="${f2(e.ox)}" cy="${f2(yOf(root))}" r="1" fill="${col}"/>`; return s;
  } };

/* --- suites --- */
EX.suite = { label: 'Suite numérique', def: () => ({ mode: 'expl', src: '1/(x+1)', u0: 1, n0: 0, n1: 12, couleur: 16711680, couleur2: 32768, ep: 2, curve: true }),
  fields: [['mode', 'type', 'sel', 'grow', [['expl', 'u(n) = f(n)'], ['rec', 'u(n+1) = f(u(n))   (points)'], ['toile', 'u(n+1) = f(u(n))   (escalier / toile d’araignée)']]], ['src', 'f(x)', 'text', 'grow'], 'br',
    ['u0', 'u(n₀)', 'num', 'w3', { step: 0.1 }], ['n0', 'n₀', 'num', 'w3'], ['n1', 'n max', 'num', 'w3'], ['curve', 'tracer y=f(x) et y=x', 'chk'], ['couleur', 'points', 'color'], ['couleur2', 'courbe', 'color'], ['ep', 'ép.', 'num', 'w3']],
  render(e, d, g, ctx) {
    const f = fnOf(e.src, ctx), c1 = tcolor(e.couleur), c2 = tcolor(e.couleur2); let s = ''; const N = clamp(Math.round(e.n1), e.n0, e.n0 + 500), dot = (X, Y) => `<circle cx="${f2(X)}" cy="${f2(Y)}" r="1.1" fill="${c1}"/>`;
    if (e.mode === 'expl') { for (let n = e.n0; n <= N; n++) { const v = f(n); if (Number.isFinite(v)) s += dot(g.X(n), g.Y(v)); } return s; }
    const u = [e.u0]; for (let n = e.n0; n < N; n++) u.push(f(u[u.length - 1]));
    if (e.mode === 'rec') { u.forEach((v, i) => { if (Number.isFinite(v)) s += dot(g.X(e.n0 + i), g.Y(v)); }); return s; }
    if (e.curve) s += drawPolyline(sampleFn(f, d, g, 500), { col: c2, w: lineWidth(e.ep), style: 0 }) + lineSeg([g.X(g.xOf(-5)), g.Y(g.xOf(-5))], [g.X(g.xOf(d.W + 5)), g.Y(g.xOf(d.W + 5))], '#666', 0.3);
    let path = `M${f2(g.X(u[0]))} ${f2(g.Y(0))}`; for (let i = 0; i < u.length - 1; i++) { if (!Number.isFinite(u[i]) || !Number.isFinite(u[i + 1])) break; path += `L${f2(g.X(u[i]))} ${f2(g.Y(u[i + 1]))}L${f2(g.X(u[i + 1]))} ${f2(g.Y(u[i + 1]))}`; }
    s += `<path d="${path}" fill="none" stroke="${c1}" stroke-width="0.3"/>`; u.slice(0, 12).forEach((v, i) => { s += T_(g.X(v) + 0.8, g.Y(0) + 4, 'u' + (e.n0 + i), { size: 7, col: c1 }); });
    return s;
  } };

/* --- intégrale --- */
EX.integ = { label: 'Intégrale (aire, rectangles, trapèzes)', def: () => ({ src2: '', src: 'f1', a: 0, b: 2, mode: 'aire', n: 8, couleur: 255, couleur2: 16776960, opa: 0.4, ep: 2, label: true, lx: 0, ly: 0 }),
  fields: [['src', 'f(x)', 'text', 'grow'], ['src2', 'g(x) : laisser vide pour l’aire sous la courbe, sinon aire entre f et g', 'text', 'grow'], ['a', 'a', 'num', 'w3', { step: 0.1 }], ['b', 'b', 'num', 'w3', { step: 0.1 }], 'br', ['mode', 'méthode', 'sel', 'grow', [['aire', 'Aire sous la courbe'], ['gauche', 'Rectangles à gauche'], ['droite', 'Rectangles à droite'], ['milieu', 'Rectangles au milieu'], ['trap', 'Trapèzes']]],
    ['n', 'nb de subdivisions', 'num', 'w3'], 'br', ['couleur', 'contour', 'color'], ['couleur2', 'remplissage', 'color'], ['opa', 'opacité', 'num', 'w3', { step: 0.05, min: 0, max: 1 }], ['label', 'afficher la valeur', 'chk'], ['lx', 'x', 'num', 'w3', { step: 0.1 }], ['ly', 'y', 'num', 'w3', { step: 0.1 }]],
  render(e, d, g, ctx) {
    if (String(e.src2 || '').trim()) { const f1 = fnOf(e.src, ctx), g2 = fnOf(e.src2, ctx), a = e.a, b = e.b, st = exStroke(e), N = 240, up = [], lo = [];
      for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; up.push(f2(g.X(x)) + ' ' + f2(g.Y(f1(x)))); lo.push(f2(g.X(x)) + ' ' + f2(g.Y(g2(x)))); }
      let v = 0; const M = 2000, hh = (b - a) / M; for (let i = 0; i < M; i++) { const x0 = a + i * hh; v += hh / 6 * ((f1(x0) - g2(x0)) + 4 * (f1(x0 + hh / 2) - g2(x0 + hh / 2)) + (f1(x0 + hh) - g2(x0 + hh))); }
      let s2 = `<path d="M${up.join('L')}L${lo.reverse().join('L')}Z" fill="${tcolor(e.couleur2)}" fill-opacity="${e.opa}" stroke="none"/>` + drawPolyline(sampleFn(f1, d, g, 600), st) + drawPolyline(sampleFn(g2, d, g, 600), st);
      if (e.label) s2 += T_(g.X(e.lx), g.Y(e.ly), `∫ (f − g) de ${fmtC(a)} à ${fmtC(b)} ≈ ${fmtC(v, 6)}`, { size: 10 }); return s2; }
    const f = fnOf(e.src, ctx), a = e.a, b = e.b, st = exStroke(e), fill = `fill="${tcolor(e.couleur2)}" fill-opacity="${e.opa}"`; let s = '', approx = 0; const n = clamp(Math.round(e.n), 1, 500);
    let exact = 0; { const M = 2000, hh = (b - a) / M; for (let i = 0; i < M; i += 1) { const x0 = a + i * hh; exact += hh / 6 * (f(x0) + 4 * f(x0 + hh / 2) + f(x0 + hh)); } }
    if (e.mode === 'aire') { const N = 200, pts = []; for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; pts.push(f2(g.X(x)) + ' ' + f2(g.Y(f(x)))); }
      s += `<path d="M${f2(g.X(a))} ${f2(g.Y(0))}L${pts.join('L')}L${f2(g.X(b))} ${f2(g.Y(0))}Z" ${fill} stroke="none"/>`; approx = exact; }
    else { const h = (b - a) / n; for (let i = 0; i < n; i++) { const x0 = a + i * h, x1 = x0 + h; let poly;
      if (e.mode === 'trap') { poly = [[x0, 0], [x0, f(x0)], [x1, f(x1)], [x1, 0]]; approx += h * (f(x0) + f(x1)) / 2; }
      else { const y = e.mode === 'gauche' ? f(x0) : e.mode === 'droite' ? f(x1) : f((x0 + x1) / 2); poly = [[x0, 0], [x0, y], [x1, y], [x1, 0]]; approx += h * y; }
      s += `<path d="M${poly.map(p => f2(g.X(p[0])) + ' ' + f2(g.Y(p[1]))).join('L')}Z" ${fill} stroke="${st.col}" stroke-width="${f2(st.w * 0.5)}"/>`; } }
    s += drawPolyline(sampleFn(f, d, g, 600), st);
    if (e.label) s += T_(g.X(e.lx), g.Y(e.ly), `∫ de ${fmtC(a)} à ${fmtC(b)} ≈ ${fmtC(exact, 6)}` + (e.mode !== 'aire' ? `   (approx. ${fmtC(approx, 6)})` : ''), { size: 10 });
    return s;
  } };

/* --- courbes implicites / coniques / inéquations --- */
function splitRel(src) { const m = String(src).replace(/≤/g, '<=').replace(/≥/g, '>=').match(/^(.*?)(<=|>=|=<|=>|<|>|=)(.*)$/); if (!m) throw new Error('Il faut un signe =, <, >, ≤ ou ≥'); return { l: m[1], op: m[2], r: m[3] }; }
function implicitFn(src, ctx) { const { l, op, r } = splitRel(src), fl = compileExpr(l, ctx.F, 10), fr = compileExpr(r, ctx.F, 10); return { f: (x, y) => fl(x, y, 0) - fr(x, y, 0), op }; }
function contourPath(F, d, g, cell = 0.8) {
  const nx = Math.ceil(d.W / cell), ny = Math.ceil(d.H / cell); let path = '';
  const val = (i, j) => { const x = g.xOf(i * cell), y = g.yOf(j * cell); const v = F(x, y); return Number.isFinite(v) ? v : NaN; };
  let prev = Array.from({ length: nx + 1 }, (_, i) => val(i, 0));
  for (let j = 0; j < ny; j++) {
    const cur = Array.from({ length: nx + 1 }, (_, i) => val(i, j + 1));
    for (let i = 0; i < nx; i++) {
      const v = [prev[i], prev[i + 1], cur[i + 1], cur[i]], P = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
      if (v.some(Number.isNaN)) continue; const pts = [];
      for (let k = 0; k < 4; k++) { const a = v[k], b = v[(k + 1) % 4]; if ((a < 0) !== (b < 0)) { const t = a / (a - b), A = P[k], B = P[(k + 1) % 4]; pts.push([(A[0] + (B[0] - A[0]) * t) * cell, (A[1] + (B[1] - A[1]) * t) * cell]); } }
      if (pts.length === 2) path += `M${f2(pts[0][0])} ${f2(pts[0][1])}L${f2(pts[1][0])} ${f2(pts[1][1])}`;
      else if (pts.length === 4) path += `M${f2(pts[0][0])} ${f2(pts[0][1])}L${f2(pts[1][0])} ${f2(pts[1][1])}M${f2(pts[2][0])} ${f2(pts[2][1])}L${f2(pts[3][0])} ${f2(pts[3][1])}`;
    }
    prev = cur;
  }
  return path;
}
EX.impl = { label: 'Courbe d’équation F(x,y)=0 (coniques…)', def: () => ({ eq: 'x^2/4+y^2=1', couleur: 8388608, ep: 2, style: 0 }),
  fields: [['eq', 'équation (x et y)  ex. x^3+y^3-3xy=0 ; y^2=4x ; x²+y²-2x=3', 'text', 'grow'], ['couleur', 'couleur', 'color'], ['ep', 'ép.', 'num', 'w3'], ['style', 'style', 'sel', 'w3', STY]],
  render(e, d, g, ctx) { const { f } = implicitFn(e.eq, ctx), st = exStroke(e); const dash = st.style === 1 ? ' stroke-dasharray="2 1"' : st.style === 2 ? ' stroke-dasharray="0.5 1"' : '';
    return `<path d="${contourPath(f, d, g)}" fill="none" stroke="${st.col}" stroke-width="${f2(st.w)}" stroke-linecap="round"${dash}/>`; } };
EX.ineq = { label: 'Système d’inéquations', def: () => ({ data: 'y>x^2-2\nx+y<=3', couleur: 16711680, opa: 0.28, border: true, ep: 2 }),
  fields: [['data', 'inéquations (une par ligne, variables x et y)', 'area', 'grow'], 'br', ['couleur', 'couleur', 'color'], ['opa', 'opacité', 'num', 'w3', { step: 0.05, min: 0, max: 1 }], ['border', 'tracer les frontières', 'chk'], ['ep', 'ép.', 'num', 'w3']],
  render(e, d, g, ctx) {
    const conds = linesOf(e.data).map(l => implicitFn(l, ctx)); if (!conds.length) return ''; const cell = 1.2, nx = Math.ceil(d.W / cell), ny = Math.ceil(d.H / cell); let rects = '';
    for (let j = 0; j < ny; j++) { let run = -1; for (let i = 0; i <= nx; i++) { let ok = false; if (i < nx) { const x = g.xOf((i + 0.5) * cell), y = g.yOf((j + 0.5) * cell);
          ok = conds.every(c => { const v = c.f(x, y); return c.op === '<' || c.op === '<=' || c.op === '=<' ? v < 0 || (c.op !== '<' && v === 0) : c.op === '=' ? Math.abs(v) < 0.05 : v > 0 || (c.op !== '>' && v === 0); }); }
        if (ok && run < 0) run = i; else if (!ok && run >= 0) { rects += `M${f2(run * cell)} ${f2(j * cell)}h${f2((i - run) * cell)}v${f2(cell + 0.02)}h${f2(-(i - run) * cell)}z`; run = -1; } } }
    let s = `<path d="${rects}" fill="${tcolor(e.couleur)}" fill-opacity="${e.opa}" stroke="none"/>`;
    if (e.border) conds.forEach(c => { s += `<path d="${contourPath(c.f, d, g)}" fill="none" stroke="${tcolor(e.couleur)}" stroke-width="${f2(lineWidth(e.ep))}"${c.op === '<' || c.op === '>' ? ' stroke-dasharray="2 1"' : ''}/>`; });
    return s;
  } };

/* --- tableaux de signes et de variations --- */
function parseXs(txt) { return String(txt).split(/[;\s]+/).filter(Boolean).map(t => /^[-−]?\s*(inf|∞)/i.test(t) ? -Infinity : /^\+?\s*(inf|∞)/i.test(t) ? Infinity : evalConst(t, NaN)); }
EX.tab = { label: 'Tableau de signes ou de variations', def: () => ({ kind: 'var', src: 'x^3-3x', xs: '-inf;-1;1;+inf', ox: 10, oy: 10, w: 120, rh: 9, couleur: 0, size: 10 }),
  fields: [['kind', 'tableau', 'sel', 'w2', [['var', 'Tableau de variations de f'], ['sign', 'Tableau de signes de f']]], ['src', 'f(x)', 'text', 'grow'], ['xs', 'valeurs de x (séparées par ;) — « -inf » et « +inf » permis', 'text', 'grow'], 'br',
    ['ox', 'x (mm)', 'num', 'w3'], ['oy', 'y (mm)', 'num', 'w3'], ['w', 'largeur', 'num', 'w3'], ['rh', 'hauteur ligne', 'num', 'w3'], ['size', 'taille', 'num', 'w3'], ['couleur', 'trait', 'color']],
  render(e, d, g, ctx) {
    const f = fnOf(e.src, ctx), xs = parseXs(e.xs).filter(v => !Number.isNaN(v)); if (xs.length < 2) throw new Error('Donnez au moins deux valeurs de x');
    const col = tcolor(e.couleur), sz = e.size, lab = 22, cw = (e.w - lab) / (xs.length - 1), isVar = e.kind === 'var', rh = e.rh, x0 = e.ox, y0 = e.oy;
    const rows = isVar ? [rh, rh, rh * 2.2] : [rh, rh]; const H = rows.reduce((a, b) => a + b, 0), cx = i => x0 + lab + i * cw; let s = '';
    s += `<rect x="${f2(x0)}" y="${f2(y0)}" width="${f2(e.w)}" height="${f2(H)}" fill="#fff" stroke="${col}" stroke-width="0.4"/>`;
    let yy = y0; rows.forEach(r => { yy += r; if (yy < y0 + H - 0.1) s += lineSeg([x0, yy], [x0 + e.w, yy], col, 0.3); }); s += lineSeg([x0 + lab, y0], [x0 + lab, y0 + H], col, 0.3);
    const fmtX = v => v === Infinity ? '+∞' : v === -Infinity ? '−∞' : fmtC(v), pad = v => (Math.abs(v) < 1e300 ? v : v);
    const probe = (a, b) => { const A = Number.isFinite(a) ? a : (Number.isFinite(b) ? b - 10 - Math.abs(b) : -10), B = Number.isFinite(b) ? b : (Number.isFinite(a) ? a + 10 + Math.abs(a) : 10); return [A, B]; };
    const mid = (a, b) => { const [A, B] = probe(a, b); return (A + B) / 2; };
    const val = v => { if (!Number.isFinite(v)) { const t = v > 0 ? 1e6 : -1e6, y = f(t); return Math.abs(y) > 1e4 ? (y > 0 ? Infinity : -Infinity) : Number(y.toFixed(3)); } return f(v); };
    const fmtV = y => y === Infinity ? '+∞' : y === -Infinity ? '−∞' : Number.isFinite(y) ? fmtC(y) : '||';
    const h = 1e-5, df = x => (f(x + h) - f(x - h)) / (2 * h);
    s += T_(x0 + 3, y0 + rh * 0.68, 'x', { size: sz, italic: true }); xs.forEach((v, i) => { s += T_(i === 0 ? cx(i) + 1.5 : i === xs.length - 1 ? cx(i) - 1.5 : cx(i), y0 + rh * 0.68, fmtX(v), { size: sz, anchor: i === 0 ? 'start' : i === xs.length - 1 ? 'end' : 'middle' }); });
    for (let i = 1; i < xs.length - 1; i++) s += lineSeg([cx(i), y0], [cx(i), y0 + H], col, 0.2, '1 1');
    const signRow = (fnc, ry, name) => {
      s += T_(x0 + 3, ry + rh * 0.68, name, { size: sz, italic: true });
      for (let i = 0; i < xs.length - 1; i++) { const m = mid(xs[i], xs[i + 1]), v = fnc(m); s += T_((cx(i) + cx(i + 1)) / 2, ry + rh * 0.68, Number.isFinite(v) ? (v > 0 ? '+' : v < 0 ? '−' : '0') : '', { size: sz * 1.1, anchor: 'middle', bold: true }); }
      for (let i = 1; i < xs.length - 1; i++) { const v = fnc(xs[i]); s += T_(cx(i), ry + rh * 0.68, Number.isFinite(v) ? (Math.abs(v) < 1e-6 ? '0' : '') : '||', { size: sz, anchor: 'middle' }); }
    };
    if (!isVar) signRow(f, y0 + rh, 'f(x)');
    else {
      signRow(df, y0 + rh, "f ′(x)"); const ry = y0 + 2 * rh, rhh = rh * 2.2; s += T_(x0 + 3, ry + rhh * 0.55, 'f', { size: sz, italic: true });
      const ys = xs.map(v => val(v)), top = ry + 2.2, bot = ry + rhh - 2.2;
      const pos = ys.map((y, i) => { const nb = i === 0 ? df(mid(xs[0], xs[1])) : df(mid(xs[i - 1], xs[i])); return { y, up: nb > 0 }; });
      for (let i = 0; i < xs.length; i++) { const dirNext = i < xs.length - 1 ? df(mid(xs[i], xs[i + 1])) > 0 : null, dirPrev = i > 0 ? df(mid(xs[i - 1], xs[i])) > 0 : null;
        let at; if (i === 0) at = dirNext ? 'bot' : 'top'; else if (i === xs.length - 1) at = dirPrev ? 'top' : 'bot'; else at = dirPrev && !dirNext ? 'top' : !dirPrev && dirNext ? 'bot' : dirPrev ? 'mid' : 'mid';
        pos[i].at = at; const Y = at === 'top' ? top : at === 'bot' ? bot : (top + bot) / 2, X = cx(i);
        s += T_(i === 0 ? X + 2.5 : i === xs.length - 1 ? X - 2.5 : X, Y + sz * 0.12 + (at === 'top' ? 0.6 : at === 'bot' ? 0.2 : 0), fmtV(pos[i].y), { size: sz, anchor: i === 0 ? 'start' : i === xs.length - 1 ? 'end' : 'middle' }); pos[i].Y = Y; }
      for (let i = 0; i < xs.length - 1; i++) { const up = df(mid(xs[i], xs[i + 1])) > 0, A = [cx(i) + (i === 0 ? 11 : 7), pos[i].Y + (up ? -1.5 : 1.5)], B = [cx(i + 1) - (i + 1 === xs.length - 1 ? 11 : 7), pos[i + 1].Y + (up ? 1.5 : -1.5)];
        if (Math.abs(A[0] - B[0]) > 2) s += arrowSvg([A[0], pos[i].Y], [B[0], pos[i + 1].Y], col, 0.4); }
    }
    return s;
  } };

/* --- rapporteur --- */
const RAP_DEF = () => ({ R: 65, ext: 0, deg: 0, rad: 1, quad: 2, val: 1, colCercles: 0, colGrad: 8388608, colQuad: 12632256, colVal: 32768 });

/* ---------- Calculs : équation, table de valeurs, intégrale approchée ---------- */
function solveEq(lhs, rhs, a, b, ctx) {
  const fl = compileExpr(lhs, ctx.F, 10), fr = compileExpr(rhs || '0', ctx.F, 10), f = x => fl(x, 0, 0) - fr(x, 0, 0), out = []; const N = 4000; let px = a, pv = f(a);
  for (let i = 1; i <= N; i++) { const x = a + (b - a) * i / N, v = f(x); if (Number.isFinite(pv) && Number.isFinite(v) && (pv === 0 || pv * v < 0)) {
      if (pv === 0) out.push(px); else { let lo = px, hi = x, fl_ = pv; for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2, fm = f(m); if (fl_ * fm <= 0) hi = m; else { lo = m; fl_ = fm; } } const r = (lo + hi) / 2; if (Math.abs(f(r)) < 1e-6 * (1 + Math.abs(r))) out.push(r); } }
    px = x; pv = v; }
  return out.filter((v, i) => !i || Math.abs(v - out[i - 1]) > 1e-7);
}
function integrate(src, a, b, ctx) { const f = fnOf(src, ctx), M = 4000, h = (b - a) / M; let s = 0; for (let i = 0; i < M; i++) { const x = a + i * h; s += h / 6 * (f(x) + 4 * f(x + h / 2) + f(x + h)); } return s; }

function extrasSvg(d, ctx) {
  let s = '';
  d.extras.forEach(e => { e._err = ''; const T = EX[e.type]; if (!T) return;
    try { s += T.render(e, d, ctx.g, ctx) || ''; } catch (err) { e._err = err.message; } });
  return s;
}
