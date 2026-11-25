/* ---------- 5. Interface ---------- */
const state = { doc: null, ctx: null, scale: 3.78, hist: [], histPos: -1, dirty: false };
const PAPER = { portrait: [210, 297], paysage: [297, 210] };
const STYLE_NAMES = ['Continu', 'Tirets', 'Pointillés', 'Ronds', 'Points'];
const STYLE_OPTS = [...STYLE_NAMES.map((n, i) => [i, n]), [10, 'Invisible']];
const GRID_NAMES = ['Aucune grille', 'Petites croix', 'Pointillés fins', 'Pointillés moyens', 'Petits tirets', 'Petits carreaux', 'Papier millimétré', 'Papier pointé'];
const POS_NAMES = [['0', 'Centré'], ['1', 'Nord-Est'], ['2', 'Est'], ['3', 'Sud-Est'], ['4', 'Sud'], ['5', 'Sud-Ouest'], ['6', 'Ouest'], ['7', 'Nord-Ouest'], ['8', 'Nord']];
const openSections = new Set(['Page', 'Repère', 'Fonctions f(x)']);
const errEls = [];

function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const k of kids.flat(Infinity)) { if (k == null || k === false) continue; e.append(k.nodeType ? k : document.createTextNode(k)); }
  return e;
}
let rafId = 0;
function redraw() { if (rafId) return; rafId = requestAnimationFrame(() => { rafId = 0; drawNow(); }); }
function toast(msg, ms = 3500) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms);
}

/* --- historique (annuler / rétablir) --- */
function snapshot() { return snapshotDoc(state.doc); }
function commit() {
  const s = snapshot();
  if (state.hist[state.histPos] === s) return;
  state.hist = state.hist.slice(0, state.histPos + 1); state.hist.push(s);
  if (state.hist.length > 80) state.hist.shift();
  state.histPos = state.hist.length - 1; state.dirty = true;
  try { localStorage.setItem('sqn_autosave', JSON.stringify({ name: state.doc.name, text: s })); } catch (e) { /* quota */ }
  updateTitle();
}
function restore(i) {
  if (i < 0 || i >= state.hist.length) return;
  state.histPos = i; const keepName = state.doc.name;
  state.doc = docFromText(state.hist[i], keepName); buildPanel(); redraw();
}
const undo = () => restore(state.histPos - 1), redo = () => restore(state.histPos + 1);
function updateTitle() { document.title = (state.dirty ? '• ' : '') + state.doc.name + ' — Sine qua non en ligne'; }

/* --- champs de formulaire --- */
function field(label, input, cls = '') { return h('label', { class: 'f ' + cls }, h('span', null, label), input); }
function fText(label, obj, key, o = {}) {
  const i = h('input', { type: 'text', value: obj[key], spellcheck: 'false', title: o.title || '',
    oninput: e => { obj[key] = e.target.value; o.after && o.after(); redraw(); },
    onchange: commit });
  return field(label, i, o.cls);
}
function fNum(label, obj, key, o = {}) {
  const i = h('input', { type: 'number', value: obj[key], min: o.min, max: o.max, step: o.step || 1,
    oninput: e => { const v = parseFloat(e.target.value); if (Number.isFinite(v)) { obj[key] = v; o.after && o.after(); redraw(); } },
    onchange: commit });
  return field(label, i, o.cls);
}
const PALETTE16 = [0, 128, 32768, 32896, 8388608, 8388736, 8421376, 12632256, 8421504, 255, 65280, 65535, 16711680, 16711935, 16776960, 16777215];
function palette(obj, key) {
  return h('div', { class: 'pal' }, PALETTE16.map(c => h('button', { type: 'button', class: 'sw', title: tcolor(c), style: 'background:' + tcolor(c), onclick: () => { obj[key] = c; redraw(); commit(); if (state.dlg) buildPanel(); } })));
}
function fColor(label, obj, key, o = {}) {
  const i = h('input', { type: 'color', value: tcolor(obj[key]),
    oninput: e => { obj[key] = fromCss(e.target.value); redraw(); }, onchange: commit });
  return field(label, i, 'color ' + (o.cls || ''));
}
function fNumC(label, obj, key, o = {}) { // affiche en cm un champ stocké en mm
  const i = h('input', { type: 'number', value: Math.round(obj[key]) / 10, min: o.min, max: o.max, step: o.step || 0.1,
    oninput: e => { const v = parseFloat(e.target.value); if (Number.isFinite(v)) { obj[key] = Math.round(v * 100) / 10; redraw(); } }, onchange: commit });
  return field(label, i, o.cls);
}
function fSel(label, obj, key, opts, o = {}) {
  const i = h('select', { onchange: e => { obj[key] = o.num ? +e.target.value : e.target.value; o.after && o.after(); redraw(); commit(); } },
    opts.map(([v, t]) => h('option', { value: v, selected: String(obj[key]) === String(v) }, t)));
  return field(label, i, o.cls);
}
function fChk(label, obj, key, o = {}) {
  const i = h('input', { type: 'checkbox', checked: !!obj[key],
    onchange: e => { obj[key] = e.target.checked; o.rebuild ? buildPanel() : null; redraw(); commit(); } });
  return h('label', { class: 'chk' }, i, h('span', null, label));
}
function errLine(get) { const e = h('div', { class: 'err' }); errEls.push([e, get]); return e; }
function updateErrs() { for (const [e, get] of errEls) { const m = get(); e.textContent = m || ''; e.style.display = m ? 'block' : 'none'; } }

function section(title, ...kids) {
  const d = h('details', { class: 'sec', open: openSections.has(title) || null,
    ontoggle: e => { e.target.open ? openSections.add(title) : openSections.delete(title); } }, h('summary', null, title), h('div', { class: 'body' }, kids));
  return d;
}
const btn = (txt, fn, cls = '') => h('button', { type: 'button', class: 'btn ' + cls, onclick: fn }, txt);


/* --- compléments : éditeur générique --- */
function exEditor(e, k) {
  const d = state.doc, T = EX[e.type], box = h('div', { class: 'item' });
  box.append(h('div', { class: 'row' }, h('b', { class: 'grow' }, T.label), btn('✕', () => { d.extras.splice(k, 1); buildPanel(); redraw(); commit(); }, 'x')));
  let row = h('div', { class: 'row' }); box.append(row);
  for (const f of T.fields) {
    if (f === 'br') { row = h('div', { class: 'row' }); box.append(row); continue; }
    const [key, label, kind, cls = '', opt] = f;
    if (key === 'kind' && state.dlg && state.dlg.kind) continue;
    if (kind === 'text') row.append(fText(label, e, key, { cls }));
    else if (kind === 'num') row.append(fNum(label, e, key, Object.assign({ cls }, opt || {})));
    else if (kind === 'color') row.append(fColor(label, e, key));
    else if (kind === 'sel') row.append(fSel(label, e, key, opt, { cls, num: typeof opt[0][0] === 'number' }));
    else if (kind === 'chk') row.append(fChk(label, e, key));
    else if (kind === 'area') row.append(field(label, h('textarea', { rows: 6, spellcheck: 'false', oninput: ev => { e[key] = ev.target.value; redraw(); }, onchange: commit }, e[key]), cls));
    else if (kind === 'btn') row.append(btn(label, () => { T.action(e, key); buildPanel(); redraw(); commit(); }, 'small'));
  }
  box.append(errLine(() => e._err));
  return box;
}
function addExtra(type, kind) { const d = state.doc, e = Object.assign({ type }, EX[type].def()); if (kind) e.kind = kind; if (EX[type].init) EX[type].init(e); d.extras.push(e); buildPanel(); redraw(); commit(); }

/* --- calculs --- */
function calcSection() {
  const st = state.calc || (state.calc = { l: 'x^2', r: '2', a: -10, b: 10, ts: 'f1', t0: -3, t1: 3, step: 1, is: 'f1', ia: 0, ib: 1, o1: '', o2: '', o3: '' });
  const out = k => { const p = h('pre', { class: 'out' }, st[k]); return p; };
  const run = (k, fn) => () => { try { st[k] = fn(); } catch (e) { st[k] = 'Erreur : ' + e.message; } buildPanel(); };
  const ctx = () => buildCtx(state.doc);
  return section('Calculs',
    h('b', null, 'Résoudre une équation'),
    h('div', { class: 'row' }, fText('f(x) =', st, 'l', { cls: 'w2' }), fText('g(x) =', st, 'r', { cls: 'w2' }), fNum('de', st, 'a', { cls: 'w3' }), fNum('à', st, 'b', { cls: 'w3' }),
      btn('Résoudre', run('o1', () => { const s = solveEq(st.l, st.r, st.a, st.b, ctx()); return s.length ? s.map(v => 'x ≈ ' + fmtC(v, 8)).join('\n') : 'Aucune solution trouvée sur cet intervalle.'; }), 'small')), out('o1'),
    h('b', null, 'Table de valeurs'),
    h('div', { class: 'row' }, fText('fonction', st, 'ts', { cls: 'w2' }), fNum('de', st, 't0', { cls: 'w3', step: 0.5 }), fNum('à', st, 't1', { cls: 'w3', step: 0.5 }), fNum('pas', st, 'step', { cls: 'w3', step: 0.1 }),
      btn('Calculer', run('o2', () => { const f = fnOf(st.ts, ctx()); const o = []; for (let x = st.t0, i = 0; x <= st.t1 + 1e-9 && i < 500; x += st.step, i++) o.push('x = ' + fmtC(x, 6).padEnd(8) + ' f(x) = ' + fmtC(f(x), 8)); return o.join('\n'); }), 'small')), out('o2'),
    h('b', null, 'Valeur approchée d’une intégrale'),
    h('div', { class: 'row' }, fText('fonction', st, 'is', { cls: 'w2' }), fNum('de', st, 'ia', { cls: 'w3', step: 0.5 }), fNum('à', st, 'ib', { cls: 'w3', step: 0.5 }),
      btn('Calculer', run('o3', () => '∫ ≈ ' + fmtC(integrate(st.is, st.ia, st.ib, ctx()), 10)), 'small')), out('o3'));
}

/* --- panneau --- */
const KEYS = [['Abs', 'abs('], ['ArcCos', 'arccos('], ['ArcSin', 'arcsin('], ['ArcTan', 'arctan('], ['ArgCh', 'argch('], ['ArgSh', 'argsh('], ['ArgTh', 'argth('], ['Carré', '²'], ['Cos', 'cos('], ['Ch', 'ch('], ['Exp', 'exp('], ['Frac', 'frac('],
  ['Int', 'int('], ['Ln', 'ln('], ['Log', 'log('], ['Racine', 'racine('], ['Sh', 'sh('], ['Sin', 'sin('], ['Tan', 'tan('], ['Th', 'th('], ['π', 'pi'], ['e', 'e'], ['+', '+'], ['−', '-'], ['×', '*'], ['/', '/'], ['^', '^']];
function keypad() {
  return h('div', { class: 'keypad' }, h('p', { class: 'hint' }, 'Pour saisir une fonction : cliquez dans une zone d’expression puis sur ces boutons, ou tapez au clavier.'),
    h('div', { class: 'keys' }, KEYS.map(([t, ins]) => h('button', { type: 'button', class: 'key', onmousedown: e => e.preventDefault(), onclick: () => {
      const i = state.lastInput; if (!i) { toast('Cliquez d’abord dans une zone d’expression.'); return; }
      i.focus(); const a = i.selectionStart ?? i.value.length, b = i.selectionEnd ?? a; i.setRangeText(ins, a, b, 'end'); i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true }));
    } }, t))));
}
function pointEditor(c, kind) {
  const wrap = h('div', { class: 'pts' });
  c.pts.forEach((p, k) => {
    wrap.append(h('div', { class: 'pt' },
      h('div', { class: 'row' }, fText(kind === 'fn' ? 'abscisse' : 't =', p, 'a', { cls: 'w2' }), fText('nom', p, 'nom', { cls: 'w2' }), fColor('', p, 'couleur'),
        btn('✕', () => { c.pts.splice(k, 1); buildPanel(); redraw(); commit(); }, 'x')),
      h('div', { class: 'row' }, fSel('nom en', p, 'pos', POS_NAMES, { num: true }), fChk('lignes de cote', p, 'cote'), fChk('tangente', p, 'tang')),
      h('div', { class: 'row' }, fChk('double flèche tangente', p, 'ftang'), fChk('flèche normale', p, 'fnorm'))));
  });
  wrap.append(btn('+ point particulier', () => { c.pts.push(newPoint({ a: kind === 'fn' ? '0' : '0', nom: '' })); buildPanel(); redraw(); commit(); }, 'small'));
  return h('details', { class: 'sub' }, h('summary', null, `Points particuliers (${c.pts.length})`), wrap);
}
function curveEditor(c, kind, label, onDelete) {
  const rows = [];
  if (kind === 'fn') rows.push(h('div', { class: 'row' }, h('span', { class: 'lab' }, label), fText('', c, 'expr', { cls: 'grow', title: 'ex. 0,5x^2-3 ; sin x ; racine(x²+1)' }), btn('✕', onDelete, 'x')));
  else if (kind === 'param') rows.push(
    h('div', { class: 'row' }, h('span', { class: 'lab' }, 'x(t)='), fText('', c, 'expr', { cls: 'grow' }), btn('✕', onDelete, 'x')),
    h('div', { class: 'row' }, h('span', { class: 'lab' }, 'y(t)='), fText('', c, 'expr2', { cls: 'grow' })));
  else rows.push(h('div', { class: 'row' }, h('span', { class: 'lab' }, 'r(t)='), fText('', c, 'expr', { cls: 'grow', title: 'ρ en fonction de t (radians)' }), btn('✕', onDelete, 'x')));
  rows.push(errLine(() => c._err));
  if (kind !== 'fn') rows.push(h('div', { class: 'row' }, fText('t min', c, 'tmin', { cls: 'w2' }), fText('t max', c, 'tmax', { cls: 'w2' }), fNum('nb valeurs', c, 'n', { min: 20, max: 20000, step: 50, cls: 'w2' })));
  rows.push(h('div', { class: 'row' }, fColor('Couleur', c, 'couleur'), palette(c, 'couleur'), fNum('Épaisseur (×0,1 mm)', c, 'ep', { min: 1, max: 10, cls: 'w2' }),
    fSel('style', c, 'style', STYLE_OPTS, { num: true, cls: 'w2' })));
  rows.push(h('div', { class: 'row' }, fChk('développée', c, 'dev'), fChk('enveloppe des tangentes', c, 'env')));
  rows.push(pointEditor(c, kind));
  return h('div', { class: 'item' }, rows);
}

function buildPanel() {
  if (!state.dlg) return;
  const d = state.doc, P = h('div'); errEls.length = 0;
  const paperDims = PAPER[d.orient] || PAPER.portrait;

  P.append(section('Page',
    h('div', { class: 'row' }, fSel('orientation', d, 'orient', [['portrait', 'Portrait (A4)'], ['paysage', 'Paysage (A4)']], { after: () => { } , cls: 'w2'}),
      fChk('cadre', d, 'cadre')),
    h('div', { class: 'row' }, fNum('largeur (mm)', d, 'W', { min: 20, max: 420, cls: 'w2' }), fNum('hauteur (mm)', d, 'H', { min: 20, max: 420, cls: 'w2' })),
    h('div', { class: 'row' }, fNum('marge gauche', d, 'mg', { min: 0, cls: 'w2' }), fNum('marge haute', d, 'mh', { min: 0, cls: 'w2' })),
    h('div', { class: 'row' },
      btn('Centrer ↔', () => { d.mg = Math.max(0, Math.round((paperDims[0] - d.W) / 2 * 10) / 10); buildPanel(); commit(); }, 'small'),
      btn('Centrer ↕', () => { d.mh = Math.max(0, Math.round((paperDims[1] - d.H) / 2 * 10) / 10); buildPanel(); commit(); }, 'small'),
      btn('Remplir la page', () => { d.W = paperDims[0] - 2 * d.mg; d.H = paperDims[1] - 2 * d.mh; buildPanel(); redraw(); commit(); }, 'small')),
    h('div', { class: 'row' }, fColor('bordure', d, 'cadreCol'), fColor('fond', d, 'fondCol'))));

  P.append(section('Repère',
    h('div', { class: 'row' }, fChk('Axes visibles', d, 'axesVis', { rebuild: true }),
      !d.axesVis && fChk('garder Ox', d, 'keepX'), !d.axesVis && fChk('garder Oy', d, 'keepY')),
    h('div', { class: 'row' }, fSel('graduations', d, 'grad', [['full', 'complètes'], ['first', 'première seulement'], ['none', 'aucune']], { cls: 'w2' }), fChk('Graduation basée sur les petits carreaux', d, 'gradGrille')),
    h('div', { class: 'row' }, fText('Origine de l’axe Ox', d, 'ox', { cls: 'w2' }), fText('Origine de l’axe Oy', d, 'oy', { cls: 'w2' })),
    h('div', { class: 'row' }, fText('Unité de graduation Ox', d, 'ux', { cls: 'w2', title: 'ex. 1 ; 0,5 ; pi/6' }), fText('Unité de graduation Oy', d, 'uy', { cls: 'w2' })),
    h('div', { class: 'row' }, fSel('format Ox', d, 'fmtX', [['normal', 'décimal'], ['trig', 'multiples de π']], { cls: 'w2' }), fSel('format Oy', d, 'fmtY', [['normal', 'décimal'], ['trig', 'multiples de π']], { cls: 'w2' })),
    h('div', { class: 'row' }, fNumC('Longueur de l’unité Ox (cm)', d, 'lx', { min: 0.1, step: 0.1, cls: 'w2' }), fNumC('Longueur de l’unité Oy (cm)', d, 'ly', { min: 0.1, step: 0.1, cls: 'w2' })),
    h('div', { class: 'row' }, fNumC('Distance entre l’axe Ox et le bord supérieur (cm)', d, 'dOx', { step: 0.5, cls: 'w2' }), fNumC('Distance entre l’axe Oy et le bord gauche (cm)', d, 'dOy', { step: 0.5, cls: 'w2' })),
    h('div', { class: 'row' }, fNum('chiffres sign. Ox', d, 'sigX', { min: 3, max: 10, cls: 'w2' }), fNum('chiffres sign. Oy', d, 'sigY', { min: 3, max: 10, cls: 'w2' })),
    h('div', { class: 'row' }, fText('Nom de l’axe Ox', d, 'nameX', { cls: 'w2' }), fText('Nom de l’axe Oy', d, 'nameY', { cls: 'w2' })),
    h('div', { class: 'row' }, fSel('Grille du repère', d, 'gridStyle', [0, 1, 2, 3, 6, 5, 4, 7].map(i => [i, GRID_NAMES[i]]), { num: true, cls: 'w2' }), fNum('Taille des petits carreaux (mm)', d, 'gridSize', { min: 2, max: 20, step: 1, cls: 'w2' })),
    h('div', { class: 'row' }, fColor('couleur grille', d, 'gridCol'), fColor('couleur axes', d, 'repCol')),
    h('div', { class: 'row' }, fChk('Échelle logarithmique sur Ox', d.log, 'x'), fNumC('Longueur du module (cm)', d.log, 'mx', { min: 0.5, cls: 'w2' })),
    h('div', { class: 'row' }, fChk('Échelle logarithmique sur Oy', d.log, 'y'), fNumC('Longueur du module (cm)', d.log, 'my', { min: 0.5, cls: 'w2' })),
    h('p', { class: 'hint' }, 'Astuce : à la souris, glissez l’origine (rond bleu), les carrés d’unité sur chaque axe, ou le bord droit / bas du dessin. En échelle logarithmique, l’origine doit être positive (0 devient 1).')));

  // fonctions
  const fnSec = [];
  d.fns.forEach((c, k) => fnSec.push(curveEditor(c, 'fn', `f${k + 1}(x)=`, () => { d.fns.splice(k, 1); buildPanel(); redraw(); commit(); })));
  if (d.fns.length < 10) fnSec.push(btn('+ Ajouter une fonction', () => { d.fns.push(newCurve({ couleur: [0, 16711680, 255, 32768, 8388736][d.fns.length % 5] })); buildPanel(); commit(); }));
  fnSec.push(keypad());
  fnSec.push(h('p', { class: 'hint' }, 'Syntaxe « calculatrice » : 3x+4, x², x^2, racine(x), sin x, ln x, exp(x), abs(x), x!, pi. Composition : f1of2(x). Domaine : (3/(x-1))(x>=2).'));
  P.append(section('Fonctions f(x)', fnSec));

  const pSec = [];
  d.params.forEach((c, k) => pSec.push(curveEditor(c, 'param', '', () => { d.params.splice(k, 1); buildPanel(); redraw(); commit(); })));
  if (d.params.length < 10) pSec.push(btn('+ Courbe paramétrée', () => { d.params.push(newCurve({ expr: 'cos(t)', expr2: 'sin(t)' })); buildPanel(); redraw(); commit(); }));
  P.append(section('Courbes paramétrées', pSec));

  const poSec = [];
  d.polars.forEach((c, k) => poSec.push(curveEditor(c, 'polar', '', () => { d.polars.splice(k, 1); buildPanel(); redraw(); commit(); })));
  if (d.polars.length < 10) poSec.push(btn('+ Courbe polaire', () => { d.polars.push(newCurve({ expr: '1+cos(t)', tmin: '0', tmax: '2pi' })); buildPanel(); redraw(); commit(); }));
  P.append(section('Courbes polaires', poSec));

  const drSec = [];
  d.droites.forEach((r, k) => drSec.push(h('div', { class: 'item' },
    h('div', { class: 'row' }, h('span', { class: 'lab' }, `D${k + 1}:`), fText('', r, 'eq', { cls: 'grow', title: 'y=2x-1 ou x=3' }),
      btn('✕', () => { d.droites.splice(k, 1); buildPanel(); redraw(); commit(); }, 'x')),
    errLine(() => r._err),
    h('div', { class: 'row' }, fColor('couleur', r, 'couleur'), fNum('épaisseur', r, 'ep', { min: 1, max: 10, cls: 'w2' })))));
  if (d.droites.length < 10) drSec.push(btn('+ Droite', () => { d.droites.push({ eq: 'y=x', couleur: 0, ep: 2, styleStr: '011', type: 1, a: '1', b: '0' }); buildPanel(); redraw(); commit(); }));
  P.append(section('Droites', drSec));

  const famSec = [];
  if (!d.fam) famSec.push(btn('+ Famille de fonctions dépendant de p', () => {
    d.fam = { expr: '(x^3-p*x)/10', pmin: '-3', pmax: '3', dp: '0.5', couleur: -1, vitesse: 0, ep: 3, style: 0, anim: true, animDet: false, show: false, abs: '0', pos: 1 };
    buildPanel(); redraw(); commit();
  }));
  else {
    const f = d.fam;
    famSec.push(h('div', { class: 'item' },
      h('div', { class: 'row' }, h('span', { class: 'lab' }, 'Fp(x)='), fText('', f, 'expr', { cls: 'grow' }), btn('✕', () => { d.fam = null; buildPanel(); redraw(); commit(); }, 'x')),
      errLine(() => f._err),
      h('div', { class: 'row' }, fText('p min', f, 'pmin', { cls: 'w3' }), fText('p max', f, 'pmax', { cls: 'w3' }), fText('pas', f, 'dp', { cls: 'w3' })),
      h('div', { class: 'row' }, fNum('épaisseur', f, 'ep', { min: 1, max: 10, cls: 'w2' }), fSel('style', f, 'style', STYLE_OPTS, { num: true, cls: 'w2' })),
      h('div', { class: 'row' }, fChk('couleur différente pour chaque p', { v: f.couleur === -1 }, 'v', {}),
        fColor('couleur unique', f, 'couleur')),
      h('div', { class: 'row' }, fChk('afficher les valeurs de p', f, 'show'), fText('à l’abscisse', f, 'abs', { cls: 'w2' }), fSel('position', f, 'pos', [[0, 'Au-dessus de chaque courbe'], [1, 'Sur chaque courbe'], [2, 'En-dessous de chaque courbe']], { num: true, cls: 'grow' })),
      h('div', { class: 'row' }, fChk('voir la progression courbe par courbe', f, 'anim'), fChk('progression détaillée de chaque courbe', f, 'animDet'), fNum('vitesse', f, 'vitesse', { min: 0, max: 10, cls: 'w2' }))));
    // case « couleur multicolore » : liée à couleur = -1
    const chk = famSec[0].querySelector('input[type=checkbox]'); chk.checked = f.couleur === -1;
    chk.onchange = e => { f.couleur = e.target.checked ? -1 : 0; redraw(); commit(); };
  }
  P.append(section('Famille de fonctions', famSec));

  const scSec = [];
  d.objs.forEach((o, k) => {
    if (o.kind === 'point') scSec.push(h('div', { class: 'item row' }, h('span', { class: 'lab' }, 'Point'), fText('nom', o, 'nom', { cls: 'w3' }), fNum('x', o, 'x', { step: 0.1, cls: 'w3' }), fNum('y', o, 'y', { step: 0.1, cls: 'w3' }), btn('✕', () => { d.objs.splice(k, 1); buildPanel(); redraw(); commit(); }, 'x')));
    else if (o.kind === 'segment') scSec.push(h('div', { class: 'item' },
      h('div', { class: 'row' }, h('span', { class: 'lab' }, 'Segment'), fNum('x1', o, 'x1', { step: 0.1, cls: 'w4' }), fNum('y1', o, 'y1', { step: 0.1, cls: 'w4' }), fNum('x2', o, 'x2', { step: 0.1, cls: 'w4' }), fNum('y2', o, 'y2', { step: 0.1, cls: 'w4' }), btn('✕', () => { d.objs.splice(k, 1); buildPanel(); redraw(); commit(); }, 'x')),
      h('div', { class: 'row' }, fColor('couleur', o, 'couleur'), fSel('style', o, 'style', [[0, 'Continu'], [1, 'Tirets'], [2, 'Pointillés']], { num: true, cls: 'w2' }))));
    else scSec.push(h('div', { class: 'item row dim' }, h('span', { class: 'grow' }, 'Objet non pris en charge (conservé dans le fichier) : ' + o.raw.split(',')[0]), btn('✕', () => { d.objs.splice(k, 1); buildPanel(); redraw(); commit(); }, 'x')));
  });
  scSec.push(h('div', { class: 'row' },
    btn('+ Point', () => { d.objs.push({ kind: 'point', nom: 'A', pos: 1, x: 1, y: 1, tail: '7,1,2,0,0' }); buildPanel(); redraw(); commit(); }, 'small'),
    btn('+ Segment', () => { d.objs.push({ kind: 'segment', x1: 0, y1: 0, x2: 1, y2: 1, style: 0, ep: 1, couleur: 0, e1: '[', e2: ']' }); buildPanel(); redraw(); commit(); }, 'small')));
  P.append(section('Points et segments', scSec));

  const txSec = [];
  d.texts.forEach((t, k) => txSec.push(h('div', { class: 'item' },
    h('div', { class: 'row' }, fText('', t, 'txt', { cls: 'grow' }), btn('✕', () => { d.texts.splice(k, 1); buildPanel(); redraw(); commit(); }, 'x')),
    h('div', { class: 'row' }, fSel('police', t, 'font', ['Times New Roman', 'Arial', 'Courier New'].map(x => [x, x]), { cls: 'w2' }), fNum('taille', t, 'size', { min: 6, max: 72, cls: 'w3' }), fColor('', t, 'col')),
    h('div', { class: 'row' }, fSel('style', t, 'style', [['normal', 'normal'], ['gras', 'gras'], ['italique', 'italique'], ['gras italique', 'gras italique']], { cls: 'w2' }), fNum('x', t, 'x', { step: 0.1, cls: 'w3' }), fNum('y', t, 'y', { step: 0.1, cls: 'w3' })))));
  txSec.push(btn('+ Ajouter un texte', () => { d.texts.push({ txt: 'Texte', x: g0().xOf(d.dOy + 10), y: g0().yOf(d.dOx - 10), font: 'Times New Roman', size: 12, col: 0, style: 'normal' }); buildPanel(); redraw(); commit(); }));
  txSec.push(h('p', { class: 'hint' }, 'Les textes se déplacent à la souris directement sur le dessin.'));
  P.append(section('Textes', txSec));

  const laSec = [];
  d.latex.forEach((l, k) => laSec.push(h('div', { class: 'item' },
    h('div', { class: 'row' }, fText('', l, 'src', { cls: 'grow', title: 'code LaTeX' }), btn('✕', () => { d.latex.splice(k, 1); buildPanel(); redraw(); commit(); }, 'x')),
    h('div', { class: 'row' }, fNum('x', l, 'x', { step: 0.1, cls: 'w3' }), fNum('y', l, 'y', { step: 0.1, cls: 'w3' }), fNum('taille (1-5)', l, 'size', { min: 1, max: 5, cls: 'w3' })))));
  laSec.push(btn('+ Expression LaTeX', () => { d.latex.push({ pre: '   3$ ', size: 3, src: '\\frac{a}{b}+\\sqrt{x^2+1}', x: g0().xOf(d.dOy + 10), y: g0().yOf(d.dOx - 20) }); buildPanel(); redraw(); commit(); }));
  laSec.push(h('p', { class: 'hint' }, 'Rendu simplifié : fractions, exposants, indices, racines, lettres grecques, systèmes. Les cas complexes peuvent différer de MimeTeX.'));
  P.append(section('Expressions LaTeX', laSec));

  const exSec = [];
  const DT = state.dlg.type, DK = state.dlg.kind;
  d.extras.forEach((e, k) => { if (!DT || (e.type === DT && (!DK || e.kind === DK))) exSec.push(exEditor(e, k)); });
  if (DT) exSec.push(btn('+ Ajouter', () => { addExtra(DT, DK); }, 'small'));
  else exSec.push(h('div', { class: 'row' }, h('select', { id: 'exType', class: 'sel' }, Object.entries(EX).map(([k, T]) => h('option', { value: k }, T.label))), btn('+ Ajouter', () => addExtra($('#exType').value), 'small')));
  exSec.push(h('p', { class: 'hint' }, 'Ces objets sont propres à la version en ligne : ils sont enregistrés dans un fichier .sqnw.'));
  P.append(section('Compléments', exSec));

  const rapSec = [];
  if (!d.rap) rapSec.push(btn('+ Rapporteur trigonométrique', () => { d.rap = RAP_DEF(); buildPanel(); redraw(); commit(); }));
  else {
    const r = d.rap, onoff = [[0, 'non'], [1, 'oui']];
    rapSec.push(h('div', { class: 'row' }, fNum('rayon (mm)', r, 'R', { min: 10, max: 200, step: 5, cls: 'w2' }), btn('✕ retirer', () => { d.rap = null; buildPanel(); redraw(); commit(); }, 'x')),
      h('div', { class: 'row' }, fSel('graduations en radians', r, 'rad', onoff, { num: true, cls: 'w2' }), fSel('graduations en degrés', r, 'deg', onoff, { num: true, cls: 'w2' })),
      h('div', { class: 'row' }, fSel('cercle extérieur', r, 'ext', onoff, { num: true, cls: 'w2' }), fSel('valeurs remarquables', r, 'val', onoff, { num: true, cls: 'w2' })),
      h('div', { class: 'row' }, fSel('quadrillage intérieur', r, 'quad', [[0, 'aucun'], [1, 'rayons'], [2, 'rayons et lignes']], { num: true, cls: 'grow' })),
      h('div', { class: 'row' }, fColor('cercles', r, 'colCercles'), fColor('graduations', r, 'colGrad'), fColor('quadrillage', r, 'colQuad'), fColor('valeurs', r, 'colVal')));
  }
  rapSec.push(h('div', { class: 'row' }, btn('→ Rapporteur de collège (demi-cercle gradué de 0 à 180°)', () => { closeDlg(true); ex('rapcol')(); }, 'small')));
  P.append(section('Rapporteur trigonométrique', rapSec));
  P.append(calcSection());
  renderDialog(P);
}
const g0 = () => geom(state.doc);

/* --- dessin à l'écran --- */
function drawNow() {
  const d = state.doc;
  try {
    state.ctx = buildCtx(d);
    const paper = $('#paper'); paper.innerHTML = buildSvg(d, state.ctx, { ui: true });
    const svg = paper.firstElementChild;
    state.scale = 96 / 25.4 * (d.zoom / 100);
    svg.setAttribute('width', f2(d.W * state.scale) + 'px'); svg.setAttribute('height', f2(d.H * state.scale) + 'px');
    paper.style.width = f2(d.W * state.scale) + 'px'; paper.style.height = f2(d.H * state.scale) + 'px';
    { const zs = $('#zoomsel'); if (zs) { const z = Math.round(d.zoom); if (![...zs.options].some(o => +o.value === z)) zs.append(h('option', { value: z }, z + ' %')); zs.value = z; } }
    updateErrs();
  } catch (e) { console.error(e); toast('Erreur de dessin : ' + e.message); }
}

/* --- souris : origine, unités, bords, textes --- */
let drag = null;
function mmFromEvent(e) {
  const svg = $('#paper').firstElementChild, r = svg.getBoundingClientRect();
  return [(e.clientX - r.left) / r.width * state.doc.W, (e.clientY - r.top) / r.height * state.doc.H];
}
function hitTest(e) {
  const d = state.doc, g = geom(d), [mx, my] = mmFromEvent(e), tol = 9 / state.scale;
  if (Math.hypot(mx - d.dOy, my - d.dOx) < tol) return { mode: 'origin', cur: 'move' };
  if (Math.hypot(mx - (d.dOy + g.lx), my - d.dOx) < tol) return { mode: 'ux', cur: 'ew-resize' };
  if (Math.hypot(mx - d.dOy, my - (d.dOx - g.ly)) < tol) return { mode: 'uy', cur: 'ns-resize' };
  const t = e.target.closest && e.target.closest('[data-ti]');
  if (t) return { mode: 'text', idx: +t.getAttribute('data-ti'), cur: 'move' };
  if (Math.abs(mx - d.W) < tol * 0.6) return { mode: 'right', cur: 'col-resize' };
  if (Math.abs(my - d.H) < tol * 0.6) return { mode: 'bottom', cur: 'row-resize' };
  return null;
}
function snapMm(v, d, fine) { return d.gradGrille && !fine ? Math.round(v / d.gridSize) * d.gridSize : Math.round(v * 2) / 2; }
function initMouse() {
  const stage = $('#stage');
  stage.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    const hit = hitTest(e); if (!hit) return;
    const g = geom(state.doc); drag = Object.assign({ fine: e.shiftKey }, hit);
    if (hit.mode === 'text') { const t = state.doc.texts[hit.idx], [mx, my] = mmFromEvent(e); drag.ox = mx - g.X(t.x); drag.oy = my - g.Y(t.y); }
    stage.setPointerCapture(e.pointerId); e.preventDefault();
  });
  stage.addEventListener('pointermove', e => {
    const d = state.doc;
    if (!drag) { const hit = $('#paper').firstElementChild && hitTest(e); $('#paper').style.cursor = hit ? hit.cur : 'default'; return; }
    const [mx, my] = mmFromEvent(e), fine = e.shiftKey;
    if (drag.mode === 'origin') { d.dOy = snapMm(clamp(mx, 0, d.W), d, fine); d.dOx = snapMm(clamp(my, 0, d.H), d, fine); }
    else if (drag.mode === 'ux') d.lx = Math.max(2, snapMm(mx - d.dOy, d, fine));
    else if (drag.mode === 'uy') d.ly = Math.max(2, snapMm(d.dOx - my, d, fine));
    else if (drag.mode === 'right') d.W = Math.max(40, Math.round(mx));
    else if (drag.mode === 'bottom') d.H = Math.max(40, Math.round(my));
    else if (drag.mode === 'text') { const g = geom(d), t = d.texts[drag.idx]; t.x = Math.round(g.xOf(mx - drag.ox) * 1000) / 1000; t.y = Math.round(g.yOf(my - drag.oy) * 1000) / 1000; }
    drawNow(); drag.moved = true;
  });
  const end = () => { if (drag && drag.moved) { buildPanel(); commit(); } drag = null; };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
}

/* --- fichiers --- */
function newDocument() {
  if (state.dirty && !confirm('Le dessin en cours n’est pas enregistré. Continuer ?')) return;
  loadDoc(defaultDoc(), 'sans titre');
}
function loadDoc(d, name) {
  d.name = name; state.doc = d; state.hist = []; state.histPos = -1; state.dirty = false;
  drawNow(); commit(); state.dirty = false; fitIfLarge(); updateTitle();
}
function openFile(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const u8 = new Uint8Array(r.result), isJson = u8[0] === 0x7B || (u8[0] === 0xEF && u8[3] === 0x7B);
      const txt = isJson ? new TextDecoder('utf-8').decode(u8) : decodeCp1252(r.result);
      const d = docFromText(txt, file.name.replace(/\.[^.]+$/, ''));
      loadDoc(d, d.name); toast('« ' + file.name + ' » ouvert.');
    } catch (e) { toast('Impossible d’ouvrir ce fichier : ' + e.message, 6000); }
  };
  r.readAsArrayBuffer(file);
}
function download(blob, name) {
  const a = h('a', { href: URL.createObjectURL(blob), download: name }); document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
const fileBase = () => (state.doc.name || 'dessin').replace(/[\\/:*?"<>|]+/g, '_');
function saveSqn() {
  if (hasExtras(state.doc)) {
    download(new Blob([snapshotDoc(state.doc)], { type: 'application/json' }), fileBase() + '.sqnw');
    state.dirty = false; updateTitle(); toast('Enregistré en .sqnw (contient les compléments de la version en ligne). Le bouton « .sqn » produit un fichier pour la version Windows.', 6000);
  } else exportSqnOnly(true);
}
function exportSqnOnly(clean) {
  download(new Blob([encodeCp1252(serializeSqn(state.doc))], { type: 'application/octet-stream' }), fileBase() + '.sqn');
  if (clean) { state.dirty = false; updateTitle(); }
  toast(hasExtras(state.doc) ? 'Fichier .sqn pour la version Windows : les compléments (stats, probabilités, etc.) n’y figurent pas.' : 'Dessin enregistré (.sqn) dans vos téléchargements.', 5000);
}
function exportSvg() { download(new Blob([buildSvg(state.doc, buildCtx(state.doc), {})], { type: 'image/svg+xml' }), fileBase() + '.svg'); }
function exportPng() {
  const d = state.doc, dpi = 300, wpx = Math.round(d.W / 25.4 * dpi), hpx = Math.round(d.H / 25.4 * dpi);
  const svg = buildSvg(d, buildCtx(d), {}).replace(/width="[^"]*mm" height="[^"]*mm"/, `width="${wpx}" height="${hpx}"`);
  const img = new Image();
  img.onload = () => {
    const c = h('canvas', { width: wpx, height: hpx }); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, wpx, hpx); x.drawImage(img, 0, 0, wpx, hpx);
    c.toBlob(b => download(b, fileBase() + '.png'), 'image/png');
  };
  img.onerror = () => toast('Export PNG impossible dans ce navigateur : utilisez l’export SVG.');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function printDoc() {
  const d = state.doc, pg = PAPER[d.orient] || PAPER.portrait;
  let st = $('#printStyle'); if (!st) { st = h('style', { id: 'printStyle' }); document.head.append(st); }
  st.textContent = `@page{size:${pg[0]}mm ${pg[1]}mm;margin:0}@media print{html,body{margin:0;background:#fff}body>*:not(#printArea){display:none!important}#printArea{display:block!important;position:absolute;left:${d.mg}mm;top:${d.mh}mm}}`;
  $('#printArea').innerHTML = buildSvg(d, buildCtx(d), {});
  setTimeout(() => window.print(), 50);
}

/* --- fenêtres modales (comme sous Windows : OK / Annuler / Aide) --- */
function openDlg(titles, o = {}) {
  const dlg = $('#dlg');
  state.dlgSnap = { text: snapshotDoc(state.doc), pos: state.histPos, len: state.hist.length };
  state.dlg = { titles, type: o.type, kind: o.kind, title: o.title || titles[0], help: o.help };
  if (o.prep) o.prep(state.doc);
  state.lastInput = null; buildPanel(); redraw();
  if (!dlg.open) dlg.showModal();
}
function closeDlg(ok) {
  const dlg = $('#dlg');
  if (!ok && state.dlgSnap) {
    const nm = state.doc.name; state.doc = docFromText(state.dlgSnap.text, nm);
    state.hist = state.hist.slice(0, state.dlgSnap.pos + 1); state.histPos = state.dlgSnap.pos; redraw();
  } else if (ok) commit();
  state.dlg = null; state.dlgSnap = null; if (dlg.open) dlg.close();
}
function renderDialog(P) {
  const dlg = $('#dlg'), D = state.dlg; if (!D) return;
  const body = $('#dlg-body'), keep = body.scrollTop; body.textContent = '';
  $('#dlg-title').textContent = D.title;
  const secs = [...P.children].filter(sec => D.titles.includes(sec.querySelector('summary').textContent));
  secs.forEach(sec => body.append(...sec.querySelector('.body').childNodes));
  body.scrollTop = keep; updateErrs();
}
function initDlg() {
  const dlg = $('#dlg');
  $('#dlg-ok').onclick = () => closeDlg(true); $('#dlg-cancel').onclick = () => closeDlg(false);
  $('#dlg-x').onclick = () => closeDlg(false);
  $('#dlg-help').onclick = () => { const D = state.dlg; toast((D && D.help) || 'Modifiez les champs : le dessin se met à jour derrière la fenêtre. « OK » valide, « Annuler » revient en arrière.', 7000); };
  dlg.addEventListener('cancel', e => { e.preventDefault(); closeDlg(false); });
  dlg.addEventListener('focusin', e => { if (e.target.matches('input[type=text]')) state.lastInput = e.target; });
}

/* --- zoom --- */
function setZoom(z) { state.doc.zoom = clamp(Math.round(z), 25, 400); drawNow(); }
function fitZoom() { const st = $('#stage'); setZoom((st.clientWidth - 48) / (state.doc.W * 96 / 25.4) * 100); }
function fitIfLarge() { const st = $('#stage'); if (state.doc.W * 96 / 25.4 * (state.doc.zoom / 100) > st.clientWidth - 30) fitZoom(); }

/* --- aide --- */
function showHelp() { $('#help').showModal(); }

/* --- démarrage --- */
function init() {
  buildChrome(); initDlg();
  $('#file').onchange = e => { if (e.target.files[0]) openFile(e.target.files[0]); e.target.value = ''; };
  $('#help-close').onclick = () => $('#help').close();
  document.addEventListener('keydown', e => {
    const mod = e.ctrlKey || e.metaKey, tag = (e.target.tagName || '').toLowerCase();
    if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); saveSqn(); }
    else if (mod && e.key.toLowerCase() === 'o') { e.preventDefault(); $('#file').click(); }
    else if (mod && e.key.toLowerCase() === 'p') { e.preventDefault(); printDoc(); }
    else if (mod && e.key.toLowerCase() === 'z' && tag !== 'input') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (mod && e.key.toLowerCase() === 'y' && tag !== 'input') { e.preventDefault(); redo(); }
  });
  const stage = $('#stage');
  ['dragover', 'drop'].forEach(ev => stage.addEventListener(ev, e => {
    e.preventDefault(); if (ev === 'drop' && e.dataTransfer.files[0]) openFile(e.dataTransfer.files[0]);
  }));
  window.addEventListener('beforeunload', e => { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });
  initMouse();
  let d = null;
  try {
    const a = JSON.parse(localStorage.getItem('sqn_autosave') || 'null');
    if (a && a.text) d = docFromText(a.text, a.name);
  } catch (e) { d = null; }
  loadDoc(d || defaultDoc(), d ? d.name : 'sans titre');
}
window.addEventListener('DOMContentLoaded', init);
