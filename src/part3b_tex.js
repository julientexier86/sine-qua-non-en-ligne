/* ---------- 4b. Mini-moteur LaTeX → SVG (fractions, exposants, indices, racines, systèmes) ---------- */
const TEX_SYM = { pi: 'π', theta: 'θ', rho: 'ρ', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', lambda: 'λ', mu: 'μ',
  sigma: 'σ', Sigma: 'Σ', omega: 'ω', Omega: 'Ω', phi: 'φ', varphi: 'φ', epsilon: 'ε', varepsilon: 'ε', infty: '∞', leq: '≤', le: '≤',
  geq: '≥', ge: '≥', neq: '≠', ne: '≠', times: '×', cdot: '·', to: '→', rightarrow: '→', Rightarrow: '⇒', approx: '≈', pm: '±',
  circ: '°', ast: '∗', int: '∫', oint: '∮', prod: '∏', sqcup: '⊔', subset: '⊂', emptyset: '∅', lbrace: '{', rbrace: '}', lfloor: '⌊', rfloor: '⌋', Rightarrow: '⇒', Leftrightarrow: '⇔',  dots: '…', ldots: '…', cdots: '⋯', Gamma: 'Γ', in: '∈', sum: '∑', partial: '∂', degree: '°', prime: '′', cup: '∪', cap: '∩',
  forall: '∀', exists: '∃', mathbb: '', vee: '∨', wedge: '∧', neg: '¬', equiv: '≡', sim: '∼', perp: '⊥', angle: '∠', vec: '→' };
const TEX_FN = ['arcsin', 'arccos', 'arctan', 'sin', 'cos', 'tan', 'ln', 'log', 'exp', 'lim', 'max', 'min', 'sh', 'ch', 'th'];
const TEX_COLORS = { black: '#000', blue: '#0000ff', red: '#ff0000', green: '#008000', gray: '#808080', white: '#fff', yellow: '#c0a000', magenta: '#ff00ff', cyan: '#00a0a0' };
let _mctx = null;
function measureW(txt, sz, italic) {
  try {
    if (!_mctx) _mctx = document.createElement('canvas').getContext('2d');
    _mctx.font = `${italic ? 'italic ' : ''}${100}px 'Times New Roman',Times,serif`;
    return _mctx.measureText(txt).width / 100 * sz;
  } catch (e) { return txt.length * sz * 0.5; }
}

function texParse(s) {
  let i = 0;
  function seq(stop) {
    const items = [];
    while (i < s.length && s[i] !== stop) {
      const a = atomScripts(); if (a) items.push(a);
    }
    return items;
  }
  function arg() {
    while (s[i] === ' ') i++;
    if (s[i] === '{') { i++; const r = seq('}'); i++; return { t: 'group', items: r }; }
    return atom();
  }
  function atomScripts() {
    let b = atom(); if (!b) return null;
    for (;;) {
      let j = i; while (s[j] === ' ') j++;
      if (s[j] === '^' || s[j] === '_') { i = j + 1; const a = arg(); b = { t: s[j] === '^' ? 'sup' : 'sub', base: b, arg: a }; }
      else break;
    }
    return b;
  }
  function atom() {
    const c = s[i];
    if (c === undefined) return null;
    if (c === '{') { i++; const r = seq('}'); i++; return { t: 'group', items: r }; }
    if (c === '}') { i++; return null; }
    if (c === '\\') {
      i++;
      if (s[i] === '\\') { i++; return { t: 'nl' }; }
      const m = /^[A-Za-z]+/.exec(s.slice(i));
      if (!m) { const ch = s[i++]; if (ch === ',' || ch === ';' || ch === ' ' || ch === '!') return { t: 'space', w: 0.25 }; return { t: 'run', txt: ch, it: false }; }
      const name = m[0]; i += name.length;
      if (name === 'frac' || name === 'dfrac') { const n = arg(), d = arg(); return { t: 'frac', n, d }; }
      if (name === 'sqrt') { let idx = null; if (s[i] === '[') { const e = s.indexOf(']', i); idx = s.slice(i + 1, e); i = e + 1; } return { t: 'sqrt', arg: arg(), idx }; }
      if (name === 'array') { const g = arg(); return { t: 'array', items: g.items || [g] }; }
      if (name === 'mathrm' || name === 'text' || name === 'mbox' || name === 'rm') { const g = arg(); return { t: 'up', arg: g }; }
      if (name === 'left') { const d = s[i++] === '\\' ? s[i++] : s[i - 1]; return { t: 'left', d }; }
      if (name === 'right') { const d = s[i++] === '\\' ? s[i++] : s[i - 1]; return { t: 'right', d }; }
      if (TEX_COLORS[name]) return { t: 'color', c: TEX_COLORS[name] };
      if (/^(tiny|scriptsize|small|normalsize|large|Large|LARGE|huge|Huge|big|Big|bigg|Bigg|displaystyle|limits|nolimits|bf|it|sf|tt|bigl|bigr|Bigl|Bigr|biggl|biggr|textstyle)$/.test(name)) return { t: 'space', w: 0 };
      if (/^(overline|bar|widehat|hat|widetilde|tilde|vec|overrightarrow|underline)$/.test(name)) return { t: 'accent', kind: name, arg: arg() };
      if (name === 'quad' || name === 'qquad') return { t: 'space', w: name === 'quad' ? 1 : 2 };
      if (TEX_FN.includes(name)) return { t: 'run', txt: name, it: false };
      if (name in TEX_SYM) return { t: 'run', txt: TEX_SYM[name], it: false };
      return { t: 'run', txt: name, it: false };
    }
    for (const fn of TEX_FN) if (s.startsWith(fn, i) && !/[A-Za-z]/.test(s[i + fn.length] || '')) { i += fn.length; return { t: 'run', txt: fn, it: false }; }
    i++;
    if (c === ' ') return { t: 'space', w: 0.2 };
    if (c === '$') return null;
    return { t: 'run', txt: c, it: /[A-Za-z]/.test(c) };
  }
  return seq();
}

function texLayout(items, sz, color) {
  // renvoie {w, a, dsc, draw(x,y)}
  let cur = color; const parts = [];
  const mk = (it) => {
    switch (it.t) {
      case 'color': cur = it.c; return null;
      case 'left': case 'right': return it.d && it.d !== '.' ? run(it.d === '{' || it.d === '}' ? it.d : it.d, false, cur) : null;
      case 'space': return { w: sz * it.w, a: 0, dsc: 0, draw: () => '' };
      case 'run': return run(it.txt, it.it, cur);
      case 'group': return texLayout(it.items, sz, cur);
      case 'up': { const b = texLayout(it.arg.items || [it.arg], sz, cur); return b; }
      case 'sup': case 'sub': {
        const base = it.base.t === 'run' || it.base.t === 'group' || it.base.t === 'frac' || it.base.t === 'sqrt' ? mk(it.base) : mk(it.base);
        const sub = texLayout([it.arg.t === 'group' ? it.arg : it.arg], sz * 0.7, cur);
        const up = it.t === 'sup', dy = up ? -sz * 0.42 : sz * 0.22;
        const w = base.w + sub.w + sz * 0.04;
        return { w, a: Math.max(base.a, up ? sz * 0.42 + sub.a : 0), dsc: Math.max(base.dsc, up ? 0 : sz * 0.22 + sub.dsc),
          draw: (x, y) => base.draw(x, y) + sub.draw(x + base.w + sz * 0.04, y + dy) };
      }
      case 'frac': {
        const n = texLayout([it.n], sz * 0.88, cur), d = texLayout([it.d], sz * 0.88, cur), ax = sz * 0.28, gap = sz * 0.14;
        const w = Math.max(n.w, d.w) + sz * 0.25, col = cur;
        return { w, a: ax + gap + n.a + n.dsc, dsc: -ax + gap + d.a + d.dsc,
          draw: (x, y) => `<path d="M${f2(x + sz * 0.05)} ${f2(y - ax)}H${f2(x + w - sz * 0.05)}" stroke="${col}" stroke-width="${f2(sz * 0.05)}"/>` +
            n.draw(x + (w - n.w) / 2, y - ax - gap - n.dsc) + d.draw(x + (w - d.w) / 2, y - ax + gap + d.a) };
      }
      case 'sqrt': {
        const b = texLayout([it.arg], sz, cur), col = cur, rw = sz * 0.55, top = b.a + sz * 0.18;
        const idx = it.idx ? texLayout([{ t: 'run', txt: it.idx, it: false }], sz * 0.5, cur) : null;
        const iw = idx ? idx.w : 0;
        return { w: iw + rw + b.w + sz * 0.1, a: top + sz * 0.05, dsc: b.dsc,
          draw: (x, y) => {
            const x0 = x + iw;
            return `<path d="M${f2(x0)} ${f2(y - sz * 0.25)}L${f2(x0 + rw * 0.25)} ${f2(y - sz * 0.3)}L${f2(x0 + rw * 0.55)} ${f2(y + b.dsc)}L${f2(x0 + rw)} ${f2(y - top)}H${f2(x0 + rw + b.w + sz * 0.1)}" fill="none" stroke="${col}" stroke-width="${f2(sz * 0.05)}"/>` +
              (idx ? idx.draw(x, y - top * 0.5) : '') + b.draw(x0 + rw + sz * 0.02, y);
          } };
      }
      case 'array': { // pile verticale (ex. coefficient binomial)
        const rows = []; let row = [];
        for (const e of it.items) { if (e.t === 'nl') { rows.push(row); row = []; } else row.push(e); }
        rows.push(row);
        const bs = rows.map(r => texLayout(r, sz * 0.9, cur));
        const w = Math.max(...bs.map(b => b.w)); let h = 0; const offs = [];
        bs.forEach(b => { h += b.a; offs.push(h); h += b.dsc + sz * 0.12; });
        return { w, a: h / 2 + sz * 0.3, dsc: h / 2 - sz * 0.3,
          draw: (x, y) => bs.map((b, k) => b.draw(x + (w - b.w) / 2, y - (h / 2 - sz * 0.3) + offs[k] + k * 0)).join('') };
      }
      case 'accent': {
        const b = texLayout([it.arg], sz, cur), col = cur, k = it.kind, top = b.a + sz * 0.1;
        return { w: b.w, a: b.a + sz * 0.2, dsc: k === 'underline' ? b.dsc + sz * 0.15 : b.dsc,
          draw: (x, y) => {
            let m;
            if (k === 'underline') m = `<path d="M${f2(x)} ${f2(y + b.dsc + sz * 0.05)}H${f2(x + b.w)}" stroke="${col}" stroke-width="${f2(sz * 0.05)}"/>`;
            else if (k === 'overline' || k === 'bar') m = `<path d="M${f2(x)} ${f2(y - top)}H${f2(x + b.w)}" stroke="${col}" stroke-width="${f2(sz * 0.05)}"/>`;
            else if (k === 'vec' || k === 'overrightarrow') m = `<path d="M${f2(x)} ${f2(y - top)}H${f2(x + b.w)}M${f2(x + b.w - sz * 0.18)} ${f2(y - top - sz * 0.1)}L${f2(x + b.w)} ${f2(y - top)}L${f2(x + b.w - sz * 0.18)} ${f2(y - top + sz * 0.1)}" fill="none" stroke="${col}" stroke-width="${f2(sz * 0.05)}"/>`;
            else m = `<path d="M${f2(x)} ${f2(y - top)}L${f2(x + b.w / 2)} ${f2(y - top - sz * 0.18)}L${f2(x + b.w)} ${f2(y - top)}" fill="none" stroke="${col}" stroke-width="${f2(sz * 0.05)}"/>`;
            return b.draw(x, y) + m;
          } };
      }
      default: return null;
    }
  };
  function run(txt, it, col) {
    const w = measureW(txt, sz, it) + (/^[=+\-<>≤≥≠×±]$/.test(txt) ? sz * 0.3 : 0);
    const pad = /^[=+\-<>≤≥≠×±]$/.test(txt) ? sz * 0.15 : 0;
    return { w, a: sz * 0.72, dsc: sz * 0.22,
      draw: (x, y) => `<text x="${f2(x + pad)}" y="${f2(y)}" font-size="${f2(sz)}" font-family="'Times New Roman',Times,serif"${it ? ' font-style="italic"' : ''} fill="${col}">${esc(txt)}</text>` };
  }
  for (const it of items) { const b = mk(it); if (b) parts.push(b); }
  let w = 0, a = 0, dsc = 0;
  parts.forEach(p => { w += p.w; a = Math.max(a, p.a); dsc = Math.max(dsc, p.dsc); });
  return { w, a, dsc, draw: (x, y) => { let s = '', cx = x; for (const p of parts) { s += p.draw(cx, y); cx += p.w; } return s; } };
}

function texSvg(l, g, d) {
  const scale = { 1: 0.65, 2: 0.82, 3: 1, 4: 1.2, 5: 1.45 }[l.size] || 1, sz = 12 * MM_PER_PT * scale * 1.1;
  let src = l.src.trim(), system = false;
  if (/^\\left\\\{/.test(src)) { system = true; src = src.replace(/^\\left\\\{/, '').replace(/\\right\.\s*$/, ''); }
  const items = texParse(src);
  // découpe en lignes
  const lines = []; let cur = [];
  for (const it of items) { if (it.t === 'nl') { lines.push(cur); cur = []; } else cur.push(it); }
  lines.push(cur);
  let color = '#000';
  const boxes = lines.map(ln => { const b = texLayout(ln, sz, color); return b; });
  let y = 0, out = ''; const X = g.X(l.x) + (system ? sz * 0.6 : 0), Y0 = g.Y(l.y);
  const metrics = [];
  boxes.forEach((b, k) => { y += b.a; metrics.push(y); y += b.dsc + sz * 0.25; });
  boxes.forEach((b, k) => { out += b.draw(X, Y0 + metrics[k]); });
  if (system) {
    const h = y - sz * 0.25, bx = X - sz * 0.45;
    out += `<path d="M${f2(bx + sz * 0.3)} ${f2(Y0)}Q${f2(bx)} ${f2(Y0)} ${f2(bx)} ${f2(Y0 + h * 0.2)}V${f2(Y0 + h * 0.42)}Q${f2(bx)} ${f2(Y0 + h / 2)} ${f2(bx - sz * 0.2)} ${f2(Y0 + h / 2)}Q${f2(bx)} ${f2(Y0 + h / 2)} ${f2(bx)} ${f2(Y0 + h * 0.58)}V${f2(Y0 + h * 0.8)}Q${f2(bx)} ${f2(Y0 + h)} ${f2(bx + sz * 0.3)} ${f2(Y0 + h)}" fill="none" stroke="#000" stroke-width="${f2(sz * 0.06)}"/>`;
  }
  return `<g>${out}</g>`;
}
