/* ======================================================================
   SINE QUA NON — version en ligne
   Réécriture du traceur de courbes planes en HTML/JavaScript (sans dépendance).
   Le logiciel d'origine (Delphi / Windows) est de Patrice Rabiller et Patrick Pradeau.
   Cette version relit/écrit le format .sqn pour les objets pris en charge.
   ====================================================================== */
'use strict';

/* ---------- 1. Utilitaires ---------- */
const MM_PER_PT = 25.4 / 72;
const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const f3 = n => (Math.round(n * 1000) / 1000).toString();

function parseNum(s, dflt = 0) {
  if (typeof s === 'number') return s;
  const t = String(s).trim().replace(',', '.');
  const v = Number(t);
  if (Number.isFinite(v)) return v;
  // fraction exacte écrite par Windows, éventuellement avec un signe doublé (« --6655/16 » = -6655/16)
  const q = t.replace(/^--/, '-').match(/^(-?)(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (q && +q[3]) return (q[1] ? -1 : 1) * +q[2] / +q[3];
  return dflt;
}
function fmtNum(n) { // nombre -> texte avec virgule décimale (format .sqn)
  if (!Number.isFinite(n)) return '0';
  return String(Math.round(n * 1e9) / 1e9).replace('.', ',');
}
// Couleurs Delphi (TColor = $00BBGGRR) <-> CSS
function tcolor(v) {
  v = Number(v);
  if (v === -16777211 || v === -16777201 || v === -16777215) return '#ffffff';
  if (v < 0) return '#000000';
  const r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255;
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}
function fromCss(h) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h);
  if (!m) return 0;
  return parseInt(m[1], 16) + parseInt(m[2], 16) * 256 + parseInt(m[3], 16) * 65536;
}
function hsl(i, n) { return `hsl(${Math.round(360 * i / Math.max(n, 1) * 0.85)},75%,42%)`; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

/* ---------- 2. Moteur d'expressions (syntaxe « calculatrice » française) ---------- */
function gammaFn(z) {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaFn(1 - z));
  z -= 1;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  let a = c[0]; const t = z + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (z + i);
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * a;
}
function FACT(a) {
  if (Number.isInteger(a)) {
    if (a < 0) return NaN;
    if (a > 170) return Infinity;
    let r = 1; for (let i = 2; i <= a; i++) r *= i; return r;
  }
  return gammaFn(a + 1);
}
function PW(a, b) { // puissance, avec racines impaires des nombres négatifs
  if (a >= 0 || Number.isInteger(b)) return Math.pow(a, b);
  for (let q = 1; q <= 99; q++) {
    const pq = b * q;
    if (Math.abs(pq - Math.round(pq)) < 1e-9) {
      if (q % 2 === 1) return (Math.round(pq) % 2 === 0 ? 1 : -1) * Math.pow(-a, b);
      return NaN;
    }
  }
  return NaN;
}
const SQ = a => a * a;
const LN = a => Math.log(a);
const FRAC = a => a - Math.floor(a);
const FN_JS = {
  abs: 'Math.abs', arccos: 'Math.acos', arcsin: 'Math.asin', arctan: 'Math.atan',
  argch: 'Math.acosh', argsh: 'Math.asinh', argth: 'Math.atanh', carre: 'SQ', cos: 'Math.cos',
  ch: 'Math.cosh', exp: 'Math.exp', frac: 'FRAC', int: 'Math.floor', ln: 'LN', log: 'Math.log10',
  racine: 'Math.sqrt', sqrt: 'Math.sqrt', sh: 'Math.sinh', sin: 'Math.sin', tan: 'Math.tan', th: 'Math.tanh',
  sinh: 'Math.sinh', cosh: 'Math.cosh', tanh: 'Math.tanh'
};
const NAMES = [...Object.keys(FN_JS), 'pi', 'f10', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'e', 'x', 't', 'y', 'p', 'o']
  .sort((a, b) => b.length - a.length);

function tokenize(src) {
  let s = String(src).toLowerCase()
    .replace(/[éèê]/g, 'e').replace(/²/g, '^2').replace(/³/g, '^3').replace(/π/g, 'pi')
    .replace(/[−–—]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/√/g, 'racine')
    .replace(/°/g, 'o').replace(/[,]/g, '.').replace(/\s+/g, '');
  const out = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
      out.push({ t: 'num', v: parseFloat(s.slice(i, j)) }); i = j;
    } else if (/[a-z]/.test(c)) {
      const nm = NAMES.find(n => s.startsWith(n, i));
      if (!nm) throw new Error('Symbole inconnu : « ' + c + ' »');
      out.push({ t: 'name', v: nm }); i += nm.length;
    } else if ('+-*/^()!'.includes(c)) { out.push({ t: 'op', v: c }); i++; }
    else if (c === '<' || c === '>') {
      if (s[i + 1] === '=') { out.push({ t: 'op', v: c + '=' }); i += 2; } else { out.push({ t: 'op', v: c }); i++; }
    } else if (c === '=') { // « >= » saisi « => » : toléré
      out.push({ t: 'op', v: '==' }); i++;
    } else throw new Error('Caractère non reconnu : « ' + c + ' »');
  }
  return out;
}

/** Compile une expression en fonction (x,t,p). F = tableau des fonctions f1..f10. */
function lnGamma(z) {
  if (z < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * z))) - lnGamma(1 - z);
  z -= 1;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  let a = c[0]; const t = z + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (z + i);
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}
function compileExpr(src, F, maxF = 10) {
  const toks = tokenize(src);
  if (!toks.length) throw new Error('Expression vide');
  let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  const isOp = (tk, v) => tk && tk.t === 'op' && tk.v === v;
  const startsFactor = tk => tk && (tk.t === 'num' || (tk.t === 'name' && tk.v !== 'o') || isOp(tk, '('));
  const isFnTok = tk => tk && tk.t === 'name' && (FN_JS[tk.v] || /^f\d+$/.test(tk.v));

  function parseRel() {
    const a = parseAdd(); const tk = peek();
    if (tk && tk.t === 'op' && ['<', '>', '<=', '>='].includes(tk.v)) {
      next(); const b = parseAdd();
      return `(((${a})${tk.v}(${b}))?1:NaN)`;
    }
    return a;
  }
  function parseAdd() {
    let neg = false, tk = peek();
    if (tk && tk.t === 'op' && (tk.v === '-' || tk.v === '+')) { next(); neg = tk.v === '-'; }
    let a = parseMul(); if (neg) a = `(-${a})`;
    while ((tk = peek()) && tk.t === 'op' && (tk.v === '+' || tk.v === '-')) {
      next(); const b = parseMul(); a = `(${a}${tk.v}${b})`;
    }
    return a;
  }
  function parseMul() {
    let a = parseImp(), tk;
    while ((tk = peek()) && tk.t === 'op' && (tk.v === '*' || tk.v === '/')) {
      next(); let neg = false; const t2 = peek();
      if (isOp(t2, '-')) { next(); neg = true; } else if (isOp(t2, '+')) next();
      let b = parseImp(); if (neg) b = `(-${b})`;
      a = `(${a}${tk.v}${b})`;
    }
    return a;
  }
  function parseImp(stopAtFn) {
    let a = parsePow();
    while (startsFactor(peek()) && !(stopAtFn && isFnTok(peek()))) a = `(${a}*${parsePow()})`;
    return a;
  }
  function parsePow() {
    const a = parsePost(); const tk = peek();
    if (isOp(tk, '^')) {
      next(); let neg = false; const t2 = peek();
      if (isOp(t2, '-')) { next(); neg = true; } else if (isOp(t2, '+')) next();
      let b = parsePow(); if (neg) b = `(-${b})`;
      return `PW(${a},${b})`;
    }
    return a;
  }
  function parsePost() {
    let a = parseAtom();
    while (isOp(peek(), '!')) { next(); a = `FACT(${a})`; }
    return a;
  }
  function parseParen() {
    if (!isOp(peek(), '(')) throw new Error('Parenthèse ouvrante attendue');
    next(); const a = parseRel();
    if (!isOp(peek(), ')')) throw new Error('Parenthèse fermante manquante');
    next(); return a;
  }
  function parseFnArg() {
    if (isOp(peek(), '(')) {
      // « sin(x) » : l'argument est la parenthèse ; mais « sin(2)x » reste (sin 2)*x
      return parseParen();
    }
    let neg = false;
    if (isOp(peek(), '-')) { next(); neg = true; }
    const a = parseImp(true);
    return neg ? `(-${a})` : a;
  }
  function parseAtom() {
    const tk = next();
    if (!tk) throw new Error('Expression incomplète');
    if (tk.t === 'num') return `(${tk.v})`;
    if (isOp(tk, '(')) { i--; return parseParen(); }
    if (tk.t === 'name') {
      const n = tk.v;
      if (n === 'x') return 'x'; if (n === 't' || n === 'y') return 't'; if (n === 'p') return 'p';
      if (n === 'pi') return 'Math.PI'; if (n === 'e') return 'Math.E';
      if (FN_JS[n]) return `${FN_JS[n]}(${parseFnArg()})`;
      if (/^f\d+$/.test(n)) {
        const idx = [parseInt(n.slice(1), 10)];
        while (peek() && peek().t === 'name' && peek().v === 'o' && toks[i + 1] && /^f\d+$/.test(toks[i + 1].v || '')) {
          next(); idx.push(parseInt(next().v.slice(1), 10));
        }
        for (const k of idx) if (k < 1 || k > 10 || k > maxF) throw new Error(`f${k} n'est pas utilisable ici (ordre de définition)`);
        const arg = isOp(peek(), '(') ? parseParen() : 'x';
        return idx.reduceRight((acc, k) => `F[${k}](${acc})`, arg);
      }
      if (n === 'o') throw new Error('« o » ne s\'emploie qu\'entre deux fonctions (f1of2)');
    }
    throw new Error('Symbole inattendu');
  }

  const code = parseRel();
  if (i < toks.length) throw new Error('Texte en trop après l\'expression');
  const fn = new Function('F', 'PW', 'FACT', 'SQ', 'LN', 'FRAC',
    `"use strict"; return function(x,t,p){ return ${code}; }`)(F, PW, FACT, SQ, LN, FRAC);
  return fn;
}

/** Évalue une constante (pas de x/t/p) comme "pi/6" ; renvoie NaN si erreur. */
function evalConst(src, dflt = NaN) {
  try { const v = compileExpr(String(src), [], 0)(0, 0, 0); return Number.isFinite(v) ? v : dflt; }
  catch (e) { return dflt; }
}
