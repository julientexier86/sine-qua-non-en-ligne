/* ---------- 4. Rendu SVG (unités = millimètres) ---------- */
const f2 = n => (Math.round(n * 100) / 100).toString();
const FONT_STACK = name => {
  const n = (name || '').toLowerCase();
  if (n.includes('times')) return "'Times New Roman',Times,'Liberation Serif',serif";
  if (n.includes('arial') || n.includes('sans')) return "Arial,Helvetica,'Liberation Sans',sans-serif";
  if (n.includes('courier')) return "'Courier New',Courier,'Liberation Mono',monospace";
  if (n.includes('sqnmath')) return "'Times New Roman',Times,'Liberation Serif',serif";
  return `'${name}',Arial,sans-serif`;
};
const fontAttrs = (style) => {
  const s = (style || '').toLowerCase();
  return (/gras|bold/.test(s) ? ' font-weight="bold"' : '') + (/ital/.test(s) ? ' font-style="italic"' : '') +
    (/soulign/.test(s) ? ' text-decoration="underline"' : '');
};
const lineWidth = ep => Math.max(0.1, ep * 0.1 + 0.15);

function geom(d) {
  const ox = evalConst(d.ox, 0), oy = evalConst(d.oy, 0);
  let ux = evalConst(d.ux, 1), uy = evalConst(d.uy, 1);
  if (!(ux > 0)) ux = 1; if (!(uy > 0)) uy = 1;
  const lx = Math.max(d.lx, 0.1), ly = Math.max(d.ly, 0.1), L = d.log || {}, lgx = !!L.x, lgy = !!L.y, mx = L.mx || 40, my = L.my || 40;
  const bx = ox > 0 ? ox : 1, by = oy > 0 ? oy : 1;
  return {
    ox, oy, ux, uy, lx, ly, lgx, lgy, mx, my, bx, by,
    X: lgx ? (x => x > 0 ? d.dOy + Math.log10(x / bx) * mx : NaN) : (x => d.dOy + (x - ox) * lx / ux),
    Y: lgy ? (y => y > 0 ? d.dOx - Math.log10(y / by) * my : NaN) : (y => d.dOx - (y - oy) * ly / uy),
    xOf: lgx ? (mm => bx * Math.pow(10, (mm - d.dOy) / mx)) : (mm => ox + (mm - d.dOy) * ux / lx),
    yOf: lgy ? (mm => by * Math.pow(10, (d.dOx - mm) / my)) : (mm => oy - (mm - d.dOx) * uy / ly)
  };
}

/** Compile toutes les expressions du document ; mémorise les erreurs dans les objets. */
function buildCtx(d) {
  const F = [null];
  for (let k = 0; k < 10; k++) F[k + 1] = () => NaN;
  d.fns.forEach((c, k) => {
    c._err = '';
    if (!c.expr.trim()) { F[k + 1] = () => NaN; return; }
    try { const fn = compileExpr(c.expr, F, k); F[k + 1] = x => fn(x, 0, 0); c._fn = F[k + 1]; }
    catch (e) { c._err = e.message; F[k + 1] = () => NaN; c._fn = null; }
  });
  const safe = (s, mf = 10) => { try { return s.trim() ? compileExpr(s, F, mf) : null; } catch (e) { return null; } };
  const check = (c, key) => { try { if (c[key].trim()) compileExpr(c[key], F, 10); return ''; } catch (e) { return e.message; } };
  d.params.forEach(c => { c._err = check(c, 'expr') || check(c, 'expr2'); c._fx = safe(c.expr); c._fy = safe(c.expr2); });
  d.polars.forEach(c => { c._err = check(c, 'expr'); c._fr = safe(c.expr); });
  if (d.fam) { d.fam._err = check(d.fam, 'expr'); d.fam._f = safe(d.fam.expr); }
  d.droites.forEach(r => { r._err = ''; r._f = null; });
  return { F, g: geom(d) };
}

/* ----- tracés ----- */
function ptsToPath(pts) {
  let s = '', pen = false;
  for (const p of pts) {
    if (!p) { pen = false; continue; }
    s += (pen ? 'L' : 'M') + f2(p[0]) + ' ' + f2(p[1]); pen = true;
  }
  return s;
}
function dotsAlong(pts, step) {
  const out = []; let carry = 0, prev = null;
  for (const p of pts) {
    if (!p) { prev = null; continue; }
    if (prev) {
      let dx = p[0] - prev[0], dy = p[1] - prev[1]; const len = Math.hypot(dx, dy);
      if (len > 0 && len < 5000) {
        let pos = step - carry;
        while (pos <= len) { out.push([prev[0] + dx * pos / len, prev[1] + dy * pos / len]); pos += step; }
        carry = len - (pos - step);
      }
    } else out.push([p[0], p[1]]);
    prev = p;
  }
  return out;
}
function strokeOf(col, ep, style) { return { col, w: lineWidth(ep), style }; }
function drawPolyline(pts, st, wMul = 1) {
  const w = st.w * wMul;
  if (st.style === 3 || st.style === 4) {
    const dots = dotsAlong(pts, 3), r = st.style === 3 ? Math.max(0.5, st.w * 1.6) : Math.max(0.3, st.w * 0.8);
    return dots.map(p => `<circle cx="${f2(p[0])}" cy="${f2(p[1])}" r="${f2(r)}" fill="${st.col}"/>`).join('');
  }
  const dash = st.style === 1 ? ' stroke-dasharray="2 1"' : st.style === 2 ? ` stroke-dasharray="0.01 ${f2(1 + w)}" stroke-linecap="round"` : '';
  return `<path d="${ptsToPath(pts)}" fill="none" stroke="${st.col}" stroke-width="${f2(w)}" stroke-linejoin="round"${dash}/>`;
}
const toMM = (g, x, y) => [g.X(x), g.Y(y)];
function breakJumps(pts, H) { // coupe les raccords verticaux géants (asymptotes)
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if (a && b && Math.abs(b[1] - a[1]) > H * 1.5 && ((a[1] < 0 && b[1] > H) || (a[1] > H && b[1] < 0))) pts.splice(i, 0, null), i++;
  }
  return pts;
}
function sampleFn(f, d, g, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const mm = -5 + (d.W + 10) * i / n, x = g.xOf(mm); let y;
    try { y = f(x); } catch (e) { y = NaN; }
    const Y = g.Y(y);
    if (!Number.isFinite(y) || !Number.isFinite(Y)) { pts.push(null); continue; }
    pts.push([mm, clamp(Y, -1e4, 1e4)]);
  }
  return breakJumps(pts, d.H);
}
function sampleParam(fxy, t0, t1, n, g, H) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + (t1 - t0) * i / n; let r;
    try { r = fxy(t); } catch (e) { r = null; }
    if (!r || !Number.isFinite(r[0]) || !Number.isFinite(r[1])) { pts.push(null); continue; }
    pts.push([clamp(g.X(r[0]), -1e4, 1e4), clamp(g.Y(r[1]), -1e4, 1e4)]);
  }
  return pts;
}
// dérivées numériques d'une courbe (x(t), y(t))
function deriv(fxy, t, h) {
  const a = fxy(t - h), b = fxy(t), c = fxy(t + h);
  return { p: b, d1: [(c[0] - a[0]) / (2 * h), (c[1] - a[1]) / (2 * h)], d2: [(c[0] - 2 * b[0] + a[0]) / (h * h), (c[1] - 2 * b[1] + a[1]) / (h * h)] };
}
function evolutePts(fxy, t0, t1, n, g) {
  const h = (t1 - t0) * 1e-4 || 1e-4, pts = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + (t1 - t0) * i / n; let q;
    try {
      const { p, d1, d2 } = deriv(fxy, t, h);
      const den = d1[0] * d2[1] - d1[1] * d2[0], s = d1[0] * d1[0] + d1[1] * d1[1];
      if (!Number.isFinite(den) || Math.abs(den) < 1e-10) { pts.push(null); continue; }
      q = [p[0] - d1[1] * s / den, p[1] + d1[0] * s / den];
    } catch (e) { pts.push(null); continue; }
    const X = g.X(q[0]), Y = g.Y(q[1]);
    pts.push(Number.isFinite(X) && Number.isFinite(Y) && Math.abs(X) < 3000 && Math.abs(Y) < 3000 ? [X, Y] : null);
  }
  return pts;
}
function envelopeSvg(fxy, t0, t1, g, d, col) {
  const h = (t1 - t0) * 1e-4 || 1e-4, K = 70, L = (d.W + d.H) * 2; let s = '';
  for (let i = 0; i <= K; i++) {
    const t = t0 + (t1 - t0) * i / K;
    try {
      const { p, d1 } = deriv(fxy, t, h);
      const vx = d1[0] * g.lx / g.ux, vy = -d1[1] * g.ly / g.uy, n = Math.hypot(vx, vy);
      if (!(n > 1e-12) || !Number.isFinite(p[0] + p[1])) continue;
      const X = g.X(p[0]), Y = g.Y(p[1]);
      s += `M${f2(X - vx / n * L)} ${f2(Y - vy / n * L)}L${f2(X + vx / n * L)} ${f2(Y + vy / n * L)}`;
    } catch (e) { /* ignore */ }
  }
  return `<path d="${s}" fill="none" stroke="${col}" stroke-width="0.12"/>`;
}
const arrowHead = (x, y, ang, col, s = 2.4) => {
  const a1 = ang + Math.PI - 0.38, a2 = ang + Math.PI + 0.38;
  return `<path d="M${f2(x)} ${f2(y)}L${f2(x + s * Math.cos(a1))} ${f2(y + s * Math.sin(a1))}L${f2(x + s * Math.cos(a2))} ${f2(y + s * Math.sin(a2))}Z" fill="${col}"/>`;
};
const POS_DIR = { 0: [0, 0], 1: [1, -1], 2: [1, 0], 3: [1, 1], 4: [0, 1], 5: [-1, 1], 6: [-1, 0], 7: [-1, -1], 8: [0, -1] };

/** Points particuliers (lignes de cote, tangente, flèches, nom) sur une courbe donnée par fxy(t). */
function pointsSvg(c, fxy, g, d, defaultColor) {
  let s = '';
  for (const p of c.pts) {
    const a = evalConst(p.a, NaN); if (!Number.isFinite(a)) continue;
    let r, dd;
    try {
      const h = 1e-5 * Math.max(1, Math.abs(a));
      const q = deriv(fxy, a, h); r = q.p; dd = q.d1;
    } catch (e) { continue; }
    if (!Number.isFinite(r[0] + r[1])) continue;
    const X = g.X(r[0]), Y = g.Y(r[1]), col = tcolor(p.couleur);
    const vx = dd[0] * g.lx / g.ux, vy = -dd[1] * g.ly / g.uy, n = Math.hypot(vx, vy) || 1;
    const ux_ = vx / n, uy_ = vy / n, L = (d.W + d.H) * 2;
    if (p.cote) s += `<path d="M${f2(X)} ${f2(Y)}L${f2(X)} ${f2(d.dOx)}M${f2(X)} ${f2(Y)}L${f2(d.dOy)} ${f2(Y)}" stroke="${col}" stroke-width="0.25" stroke-dasharray="1 0.9" fill="none"/>`;
    if (p.tang) s += `<path d="M${f2(X - ux_ * L)} ${f2(Y - uy_ * L)}L${f2(X + ux_ * L)} ${f2(Y + uy_ * L)}" stroke="${col}" stroke-width="0.3" fill="none"/>`;
    if (p.ftang) {
      const h2 = 8, x1 = X - ux_ * h2, y1 = Y - uy_ * h2, x2 = X + ux_ * h2, y2 = Y + uy_ * h2;
      s += `<path d="M${f2(x1)} ${f2(y1)}L${f2(x2)} ${f2(y2)}" stroke="${col}" stroke-width="0.4" fill="none"/>` +
        arrowHead(x2, y2, Math.atan2(uy_, ux_), col) + arrowHead(x1, y1, Math.atan2(-uy_, -ux_), col);
    }
    if (p.fnorm) {
      const nx = uy_, ny = -ux_, x2 = X + nx * 12, y2 = Y + ny * 12;
      s += `<path d="M${f2(X)} ${f2(Y)}L${f2(x2)} ${f2(y2)}" stroke="${col}" stroke-width="0.4" fill="none"/>` + arrowHead(x2, y2, Math.atan2(ny, nx), col);
    }
    s += `<circle cx="${f2(X)}" cy="${f2(Y)}" r="0.9" fill="${col}"/>`;
    if (p.nom) {
      const sz = (p.taille || 10) * MM_PER_PT, dir = POS_DIR[p.pos] || POS_DIR[1];
      const off = 2.2;
      const anchor = dir[0] > 0 ? 'start' : dir[0] < 0 ? 'end' : 'middle';
      const ty = Y + dir[1] * off + (dir[1] > 0 ? sz * 0.8 : dir[1] < 0 ? -0.5 : sz * 0.35);
      s += `<text x="${f2(X + dir[0] * off)}" y="${f2(ty)}" font-size="${f2(sz)}" font-family="${FONT_STACK(p.police)}"${fontAttrs(p.style)} fill="${col}" text-anchor="${anchor}">${esc(p.nom)}</text>`;
    }
  }
  return s;
}

/** Dessine une courbe générique (fonction, paramétrée ou polaire) avec développée, enveloppe et points. */
function curveSvg(c, ptsMM, fxy, t0, t1, g, d, color) {
  if (c.style === 10) return ''; // style « invisible » du logiciel d'origine
  const st = strokeOf(color, c.ep, c.style);
  let s = drawPolyline(ptsMM, st);
  if (c.dev) s += drawPolyline(evolutePts(fxy, t0, t1, Math.max(c.n || 400, 200), g), strokeOf(color, 1, 0), 1);
  if (c.env) s += envelopeSvg(fxy, t0, t1, g, d, color);
  s += pointsSvg(c, fxy, g, d, color);
  return s;
}

/* ----- repère ----- */
function fmtTick(v, sig, trig, unitVal) {
  if (Math.abs(v) < 1e-12 * Math.max(1, Math.abs(unitVal))) return '0';
  if (trig) {
    const q = v / Math.PI;
    for (let den = 1; den <= 24; den++) {
      const nu = q * den;
      if (Math.abs(nu - Math.round(nu)) < 1e-6) {
        const n = Math.round(nu), sg = n < 0 ? '-' : '', an = Math.abs(n);
        const num = an === 1 ? 'π' : an + 'π';
        return sg + num + (den === 1 ? '' : '/' + den);
      }
    }
  }
  let r = Number(v.toPrecision(Math.max(3, sig)));
  if (Math.abs(r) >= Math.pow(10, sig)) return r.toExponential().replace('e+', 'E').replace('e', 'E').replace('.', ',');
  return String(r).replace('.', ',');
}

function gridSvg(d, g) {
  const col = tcolor(d.gridCol), sz = Math.max(d.gridSize, 1), W = d.W, H = d.H; let gs = d.gridStyle;
  if (!gs) return '';
  if ((g.lgx || g.lgy) && (gs === 6 || gs === 1 || gs === 7)) gs = 5;
  const kx0 = Math.ceil((0 - d.dOy) / sz), kx1 = Math.floor((W - d.dOy) / sz);
  const ky0 = Math.ceil((0 - d.dOx) / sz), ky1 = Math.floor((H - d.dOx) / sz);
  const logPos = (lg, base, mod, off, size) => { const r = []; if (!lg) return null; const k0 = Math.floor(Math.log10(Math.max(1e-300, 1))) - 40; for (let k = -40; k <= 40; k++) for (let m = 1; m <= 9; m++) { const mmv = off + (lg === 'x' ? 1 : -1) * Math.log10(m * Math.pow(10, k)) * mod; if (mmv >= -0.01 && mmv <= size + 0.01) r.push(mmv); } return r; };
  const vlines = (step, extra = '') => { let s = ''; if (g.lgx) { for (const X of logPos('x', g.bx, g.mx, d.dOy, W)) s += `M${f2(X)} 0V${f2(H)}`; return s; } for (let k = Math.ceil((0 - d.dOy) / step); k <= Math.floor((W - d.dOy) / step); k++) s += `M${f2(d.dOy + k * step)} 0V${f2(H)}`; return s; };
  const hlines = (step) => { let s = ''; if (g.lgy) { for (const Y of logPos('y', g.by, g.my, d.dOx, H)) s += `M0 ${f2(Y)}H${f2(W)}`; return s; } for (let k = Math.ceil((0 - d.dOx) / step); k <= Math.floor((H - d.dOx) / step); k++) s += `M0 ${f2(d.dOx + k * step)}H${f2(W)}`; return s; };
  if (gs === 6) { // papier millimétré
    let p1 = '', p5 = '', p10 = '';
    for (let k = Math.ceil(-d.dOy); k <= Math.floor(W - d.dOy); k++) { const s = `M${f2(d.dOy + k)} 0V${f2(H)}`; if (k % 10 === 0) p10 += s; else if (k % 5 === 0) p5 += s; else p1 += s; }
    for (let k = Math.ceil(-d.dOx); k <= Math.floor(H - d.dOx); k++) { const s = `M0 ${f2(d.dOx + k)}H${f2(W)}`; if (k % 10 === 0) p10 += s; else if (k % 5 === 0) p5 += s; else p1 += s; }
    return `<g fill="none" stroke="${col}"><path d="${p1}" stroke-width="0.08"/><path d="${p5}" stroke-width="0.18"/><path d="${p10}" stroke-width="0.3"/></g>`;
  }
  if (gs === 1) { // petites croix
    let s = '';
    for (let i = kx0; i <= kx1; i++) for (let j = ky0; j <= ky1; j++) { const x = d.dOy + i * sz, y = d.dOx + j * sz; s += `M${f2(x - 0.9)} ${f2(y)}h1.8M${f2(x)} ${f2(y - 0.9)}v1.8`; }
    return `<path d="${s}" stroke="${col}" stroke-width="0.15" fill="none"/>`;
  }
  if (gs === 7) { // papier pointé
    let s = '';
    for (let i = kx0; i <= kx1; i++) for (let j = ky0; j <= ky1; j++) s += `<circle cx="${f2(d.dOy + i * sz)}" cy="${f2(d.dOx + j * sz)}" r="0.22"/>`;
    return `<g fill="${col}">${s}</g>`;
  }
  const dash = gs === 2 ? 'stroke-dasharray="0.2 0.8" stroke-width="0.22"' : gs === 3 ? 'stroke-dasharray="0.5 1" stroke-width="0.3"' :
    gs === 4 ? 'stroke-dasharray="1.5 1" stroke-width="0.2"' : 'stroke-width="0.2"';
  return `<path d="${vlines(sz)}${hlines(sz)}" stroke="${col}" fill="none" ${dash}/>`;
}

function axesSvg(d, g) {
  const col = tcolor(d.repCol), W = d.W, H = d.H;
  const showX = d.axesVis || d.keepX, showY = d.axesVis || d.keepY;
  const thick = d.gridStyle === 5 || d.gridStyle === 6 ? 0.55 : 0.3;
  let s = '';
  const inX = d.dOx >= -0.01 && d.dOx <= H + 0.01, inY = d.dOy >= -0.01 && d.dOy <= W + 0.01;
  const font = FONT_STACK(d.gFont[0]), fs = d.gSize[0] * MM_PER_PT, gcol = tcolor(d.gCol[0]), fa = fontAttrs(d.gStyle[0]);
  const T = (x, y, txt, anchor) => `<text x="${f2(x)}" y="${f2(y)}" font-size="${f2(fs)}" font-family="${font}"${fa} fill="${gcol}" text-anchor="${anchor}">${esc(txt)}</text>`;
  const ax = [];
  if (showX && inX) { ax.push(`M0 ${f2(d.dOx)}H${f2(W)}`); }
  if (showY && inY) { ax.push(`M${f2(d.dOy)} ${f2(H)}V0`); }
  s += `<path d="${ax.join('')}" stroke="${col}" stroke-width="${thick}" fill="none"/>`;
  if (showX && inX) s += arrowHead(W, d.dOx, 0, col, 2.2);
  if (showY && inY) s += arrowHead(d.dOy, 0, -Math.PI / 2, col, 2.2);
  // noms des axes
  const nf = `font-family="'Times New Roman',Times,serif" font-style="italic" font-size="${f2(12 * MM_PER_PT)}" fill="${col}"`;
  if (showX && inX) s += `<text x="${f2(W - 1.5)}" y="${f2(d.dOx - 2)}" ${nf} text-anchor="end">${esc(d.nameX)}</text>`;
  if (showY && inY) s += `<text x="${f2(d.dOy + 2)}" y="${f2(4.2)}" ${nf}>${esc(d.nameY)}</text>`;
  // graduations
  const zeroBoth = !g.lgx && !g.lgy && Math.abs(g.ox) < 1e-12 && Math.abs(g.oy) < 1e-12;
  const strideX = Math.max(1, Math.ceil(9 / g.lx)), strideY = Math.max(1, Math.ceil(5.5 / g.ly));
  let ticks = '', labels = '';
  if (showX && inX) {
    if (g.lgx) {
      const k0 = Math.floor(Math.log10(g.xOf(0) / g.bx)), k1 = Math.ceil(Math.log10(g.xOf(W) / g.bx));
      for (let k = k0; k <= k1; k++) for (let m = 1; m <= 9; m++) {
        const v = g.bx * Math.pow(10, k) * m, X = g.X(v); if (!(X >= -0.01 && X <= W + 0.01)) continue;
        const maj = m === 1, th = maj ? 1.1 : 0.6; ticks += `M${f2(X)} ${f2(d.dOx - th)}V${f2(d.dOx + th)}`;
        if (maj && d.grad !== 'none' && !(d.grad === 'first' && k !== 1)) labels += T(X, d.dOx + 1.2 + fs * 0.9, fmtTick(v, d.sigX, false, 1), 'middle');
      }
    } else {
      const kmin = Math.ceil((0 - d.dOy) / g.lx), kmax = Math.floor((W - d.dOy) / g.lx);
      for (let k = kmin; k <= kmax && kmax - kmin < 2000; k++) {
        const X = d.dOy + k * g.lx;
        ticks += `M${f2(X)} ${f2(d.dOx - 1.1)}V${f2(d.dOx + 1.1)}`;
        if (d.grad === 'none') continue;
        if (d.grad === 'first' && k !== 1) continue;
        if (d.grad === 'full' && k % strideX !== 0) continue;
        if (k === 0 && zeroBoth && showY && inY) continue;
        const v = g.ox + k * g.ux;
        labels += T(X, d.dOx + 1.2 + fs * 0.9, fmtTick(v, d.sigX, d.fmtX === 'trig', g.ux), 'middle');
      }
    }
  }
  if (showY && inY) {
    if (g.lgy) {
      const k0 = Math.floor(Math.log10(g.yOf(H) / g.by)), k1 = Math.ceil(Math.log10(g.yOf(0) / g.by));
      for (let k = k0; k <= k1; k++) for (let m = 1; m <= 9; m++) {
        const v = g.by * Math.pow(10, k) * m, Y = g.Y(v); if (!(Y >= -0.01 && Y <= H + 0.01)) continue;
        const maj = m === 1, th = maj ? 1.1 : 0.6; ticks += `M${f2(d.dOy - th)} ${f2(Y)}H${f2(d.dOy + th)}`;
        if (maj && d.grad !== 'none' && !(d.grad === 'first' && k !== 1)) labels += T(d.dOy - 1.6, Y + fs * 0.33, fmtTick(v, d.sigY, false, 1), 'end');
      }
    } else {
      const kmin = Math.ceil((d.dOx - H) / g.ly), kmax = Math.floor(d.dOx / g.ly);
      for (let k = kmin; k <= kmax && kmax - kmin < 2000; k++) {
        const Y = d.dOx - k * g.ly;
        ticks += `M${f2(d.dOy - 1.1)} ${f2(Y)}H${f2(d.dOy + 1.1)}`;
        if (d.grad === 'none') continue;
        if (d.grad === 'first' && k !== 1) continue;
        if (d.grad === 'full' && k % strideY !== 0) continue;
        if (k === 0 && zeroBoth && showX && inX) continue;
        const v = g.oy + k * g.uy;
        labels += T(d.dOy - 1.6, Y + fs * 0.33, fmtTick(v, d.sigY, d.fmtY === 'trig', g.uy), 'end');
      }
    }
  }
  if (zeroBoth && showX && showY && inX && inY && d.grad !== 'none' && d.grad !== 'first') labels += T(d.dOy - 1.6, d.dOx + 1.2 + fs * 0.9, '0', 'end');
  s += `<path d="${ticks}" stroke="${col}" stroke-width="0.25" fill="none"/>` + labels;
  return s;
}


/* ----- rapporteur trigonométrique (cercle trigonométrique) ----- */
function rapSvg(d, g) {
  const r = d.rap; if (!r) return '';
  const cx = d.dOy, cy = d.dOx, R = r.R, S = (a, rr) => [cx + rr * Math.cos(a), cy - rr * Math.sin(a)];
  const cCol = tcolor(r.colCercles), gCol = tcolor(r.colGrad), qCol = tcolor(r.colQuad), vCol = tcolor(r.colVal);
  let s = '';
  const T = (x, y, txt, col, anchor = 'middle', sz = 9) => `<text x="${f2(x)}" y="${f2(y)}" font-size="${f2(sz * MM_PER_PT)}" font-family="'Times New Roman',serif" fill="${col}" text-anchor="${anchor}">${esc(txt)}</text>`;
  if (r.quad >= 1) { // rayons et lignes remarquables en pointillés
    let q = '';
    for (const deg of [30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330]) { const [x, y] = S(deg * Math.PI / 180, R); q += `M${f2(cx)} ${f2(cy)}L${f2(x)} ${f2(y)}`; }
    if (r.quad >= 2) for (const v of [0.5, Math.SQRT1_2, Math.sqrt(3) / 2]) for (const sg of [-1, 1]) {
      const o = v * R * sg, h = Math.sqrt(R * R - o * o);
      q += `M${f2(cx + o)} ${f2(cy - h)}V${f2(cy + h)}M${f2(cx - h)} ${f2(cy + o)}H${f2(cx + h)}`;
    }
    s += `<path d="${q}" stroke="${qCol}" stroke-width="0.2" stroke-dasharray="0.8 1" fill="none"/>`;
  }
  s += `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(R)}" fill="none" stroke="${cCol}" stroke-width="0.45"/>`;
  if (r.ext) s += `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(R + 7)}" fill="none" stroke="${cCol}" stroke-width="0.25"/>`;
  let ticks = '';
  for (let deg = 0; deg < 360; deg += 5) {
    const len = deg % 30 === 0 || deg % 45 === 0 ? 3 : deg % 15 === 0 ? 2 : 1.2, a = deg * Math.PI / 180;
    const [x1, y1] = S(a, R - len), [x2, y2] = S(a, R); ticks += `M${f2(x1)} ${f2(y1)}L${f2(x2)} ${f2(y2)}`;
  }
  s += `<path d="${ticks}" stroke="${gCol}" stroke-width="0.25" fill="none"/>`;
  const RAD = { 0: '0', 30: 'π/6', 45: 'π/4', 60: 'π/3', 90: 'π/2', 120: '2π/3', 135: '3π/4', 150: '5π/6', 180: 'π', 210: '7π/6', 225: '5π/4', 240: '4π/3', 270: '3π/2', 300: '5π/3', 315: '7π/4', 330: '11π/6' };
  for (const [deg, lab] of Object.entries(RAD)) {
    const a = +deg * Math.PI / 180, off = r.rad ? 6.5 : 4.5;
    if (r.rad) { const [x, y] = S(a, R + off); s += T(x, y + 1.2, lab, gCol, 'middle', 9); }
    if (r.deg) { const [x, y] = S(a, R + (r.rad ? 12.5 : off)); s += T(x, y + 1.2, deg + '°', gCol, 'middle', 8); }
  }
  if (r.val) {
    const vals = [[0.5, '1/2'], [Math.SQRT1_2, '√2/2'], [Math.sqrt(3) / 2, '√3/2'], [1, '1']];
    for (const [v, lab] of vals) for (const sg of [-1, 1]) {
      if (v === 1 && sg === 1) continue;
      const o = v * R * sg;
      s += T(cx + o, cy + 4.2, (sg < 0 ? '-' : '') + lab, vCol, 'middle', 8);
      s += T(cx - 1.5, cy - o + 1.2, (sg > 0 ? '' : '-') + lab, vCol, 'end', 8);
    }
  }
  return s;
}

/* ----- schémas ----- */
function objSvg(o, g, d) {
  if (o.kind === 'segment') {
    const dash = o.style === 1 ? 'stroke-dasharray="2 1"' : o.style === 2 ? 'stroke-dasharray="0.8 1"' : '';
    return `<path d="M${f2(g.X(o.x1))} ${f2(g.Y(o.y1))}L${f2(g.X(o.x2))} ${f2(g.Y(o.y2))}" stroke="${tcolor(o.couleur)}" stroke-width="${f2(lineWidth(o.ep) * 0.8)}" ${dash} fill="none"/>`;
  }
  if (o.kind === 'point') {
    const X = g.X(o.x), Y = g.Y(o.y), col = '#000';
    let s = `<path d="M${f2(X - 1.1)} ${f2(Y - 1.1)}l2.2 2.2M${f2(X - 1.1)} ${f2(Y + 1.1)}l2.2 -2.2" stroke="${col}" stroke-width="0.3" fill="none"/>`;
    if (o.nom) {
      const dir = POS_DIR[o.pos || 1] || POS_DIR[1], sz = 10 * MM_PER_PT;
      s += `<text x="${f2(X + dir[0] * 2.4)}" y="${f2(Y + dir[1] * 2.4 + (dir[1] > 0 ? sz * 0.8 : dir[1] < 0 ? -0.4 : sz * 0.35))}" font-size="${f2(sz)}" font-family="'Times New Roman',serif" font-style="italic" text-anchor="${dir[0] > 0 ? 'start' : dir[0] < 0 ? 'end' : 'middle'}">${esc(o.nom)}</text>`;
    }
    return s;
  }
  return '';
}

/* ----- assemblage complet ----- */
function buildSvg(d, ctx, opts = {}) {
  const g = ctx.g, W = d.W, H = d.H;
  let curves = '';
  // fonctions
  d.fns.forEach((c, k) => {
    if (!c._fn || !c.expr.trim()) return;
    const f = c._fn, fxy = x => [x, f(x)];
    const x0 = g.xOf(0), x1 = g.xOf(W);
    const pts = sampleFn(f, d, g, clamp(Math.round(W * 4), 300, 4000));
    curves += curveSvgFn(c, pts, fxy, x0, x1, g, d);
  });
  // paramétrées
  d.params.forEach(c => {
    if (!c._fx || !c._fy) return;
    const t0 = evalConst(c.tmin, -Math.PI), t1 = evalConst(c.tmax, Math.PI), n = clamp(c.n || 400, 20, 20000);
    const fxy = t => [c._fx(0, t, 0), c._fy(0, t, 0)];
    curves += curveSvg(c, sampleParam(fxy, t0, t1, n, g, H), fxy, t0, t1, g, d, tcolor(c.couleur));
  });
  // polaires
  d.polars.forEach(c => {
    if (!c._fr) return;
    const t0 = evalConst(c.tmin, 0), t1 = evalConst(c.tmax, 2 * Math.PI), n = clamp(c.n || 400, 20, 20000);
    const fxy = t => { const r = c._fr(0, t, 0); return [r * Math.cos(t), r * Math.sin(t)]; };
    curves += curveSvg(c, sampleParam(fxy, t0, t1, n, g, H), fxy, t0, t1, g, d, tcolor(c.couleur));
  });
  // famille de fonctions
  if (d.fam && d.fam._f && d.fam.expr.trim()) {
    const f = d.fam, p0 = evalConst(f.pmin, -1), p1 = evalConst(f.pmax, 1);
    let dp = evalConst(f.dp, 0.5); if (!(dp > 0)) dp = 1;
    const cnt = Math.min(300, Math.floor((p1 - p0) / dp + 1e-9) + 1);
    for (let i = 0; i < cnt; i++) {
      const p = p0 + i * dp, col = f.couleur === -1 ? hsl(i, cnt) : tcolor(f.couleur);
      const fn = x => f._f(x, 0, p);
      const pts = sampleFn(fn, d, g, clamp(Math.round(W * 3), 300, 3000));
      if (f.style !== 10) curves += drawPolyline(pts, strokeOf(col, f.ep, f.style));
      if (f.show) {
        const xa = evalConst(f.abs, 0), ya = fn(xa);
        if (Number.isFinite(ya)) curves += `<text x="${f2(g.X(xa) + 1)}" y="${f2(g.Y(ya) + (f.pos === 0 ? -1.5 : f.pos === 2 ? 3.5 : 1))}" font-size="${f2(9 * MM_PER_PT)}" font-family="Arial,sans-serif" fill="${col}">p=${esc(fmtTick(p, 5, false, 1))}</text>`;
      }
    }
  }
  // droites
  d.droites.forEach(r => {
    const col = tcolor(r.couleur), st = strokeOf(col, r.ep, 0);
    let m, pts = null;
    const eq = String(r.eq).trim();
    if ((m = eq.match(/^y\s*=(.*)$/i))) {
      try { const fn = compileExpr(m[1], ctx.F, 10); r._err = ''; pts = [[g.X(g.xOf(-5)), g.Y(fn(g.xOf(-5), 0, 0))], [g.X(g.xOf(W + 5)), g.Y(fn(g.xOf(W + 5), 0, 0))]]; }
      catch (e) { r._err = e.message; }
    } else if ((m = eq.match(/^x\s*=(.*)$/i))) {
      const c = evalConst(m[1], NaN); if (Number.isFinite(c)) pts = [[g.X(c), -5], [g.X(c), H + 5]]; else r._err = 'Abscisse invalide';
    } else r._err = 'Écrire y=… ou x=…';
    if (pts && pts.every(p => Number.isFinite(p[0]) && Number.isFinite(p[1])))
      curves += `<path d="M${f2(pts[0][0])} ${f2(pts[0][1])}L${f2(pts[1][0])} ${f2(pts[1][1])}" stroke="${col}" stroke-width="${f2(st.w)}" fill="none"/>`;
  });
  d.objs.forEach(o => { curves += objSvg(o, g, d); });
  curves += extrasSvg(d, ctx);

  // textes
  let texts = '';
  d.texts.forEach((t, k) => {
    const sz = t.size * MM_PER_PT, X = g.X(t.x), Y = g.Y(t.y);
    const lines = String(t.txt).split(/\\n|\n/);
    lines.forEach((ln, li) => {
      texts += `<text data-ti="${k}" x="${f2(X)}" y="${f2(Y + sz * 0.82 + li * sz * 1.2)}" font-size="${f2(sz)}" font-family="${FONT_STACK(t.font)}"${fontAttrs(t.style)} fill="${tcolor(t.col)}"${opts.ui ? ' style="cursor:move"' : ''}>${esc(ln)}</text>`;
    });
  });
  // LaTeX
  let tex = '';
  d.latex.forEach((l, k) => { tex += texSvg(l, g, d, k); });

  const uid = 'c' + Math.random().toString(36).slice(2, 7);
  let ui = '';
  if (opts.ui) {
    ui += `<g class="ui" fill="rgba(30,100,220,.18)" stroke="rgba(30,100,220,.8)" stroke-width="0.3">
      <circle cx="${f2(d.dOy)}" cy="${f2(d.dOx)}" r="2.4"/>
      <rect x="${f2(d.dOy + g.lx - 1.4)}" y="${f2(d.dOx - 1.4)}" width="2.8" height="2.8"/>
      <rect x="${f2(d.dOy - 1.4)}" y="${f2(d.dOx - g.ly - 1.4)}" width="2.8" height="2.8"/></g>`;
  }
  const bg = `<rect x="0" y="0" width="${f2(W)}" height="${f2(H)}" fill="${tcolor(d.fondCol)}"/>`;
  const frame = d.cadre ? `<rect x="0.15" y="0.15" width="${f2(W - 0.3)}" height="${f2(H - 0.3)}" fill="none" stroke="${tcolor(d.cadreCol)}" stroke-width="0.3"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${f2(W)}mm" height="${f2(H)}mm" viewBox="0 0 ${f2(W)} ${f2(H)}">
<defs><clipPath id="${uid}"><rect x="0" y="0" width="${f2(W)}" height="${f2(H)}"/></clipPath></defs>
${bg}<g clip-path="url(#${uid})">${gridSvg(d, g)}${axesSvg(d, g)}${rapSvg(d, g)}${curves}${tex}${texts}</g>${frame}${ui}</svg>`;
}
function curveSvgFn(c, pts, fxy, x0, x1, g, d) {
  return curveSvg(Object.assign({}, c, { n: 400 }), pts, fxy, x0, x1, g, d, tcolor(c.couleur));
}
