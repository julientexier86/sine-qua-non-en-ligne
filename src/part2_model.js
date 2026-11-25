/* ---------- 3. Modèle de document + lecture / écriture du format .sqn ---------- */

// Blocs « bruts » conservés tels quels pour les fonctions non prises en charge (statistiques, etc.)
const RAW_MIDDLE_DEFAULT = [
  "Pas de courbe définie point par point",
  "Données statistiques 1 variable non numérique",
  "   Titre de la série : ",
  "   Style du graphique : 0",
  "Times New Roman",
  "   Nombre de lignes : 0",
  "Données statistiques 1 variable (valeurs isolées)",
  "   Titre de la série : ",
  "   Style du graphique : 20",
  "Times New Roman",
  "   Couleur : 16777181",
  "   Nombre de lignes : 0",
  "Pas de données statistiques 1 variable (valeurs regroupées en classes)",
  "Pas de données statistiques 2 variables",
  "Pas de loi binômiale",
  "Pas de loi de Poisson",
  "Pas de loi normale",
  "Pas de suite numérique",
  "Pas d'intégrale",
  "Pas de courbe point par point lissée",
  "Pas de boîtes à moustaches multiples",
  "Pas de table de valeurs de fonctions",
  "Pas de table de valeurs de courbes paramétrées",
  "Pas d'inéquations"
];
const RAW_TAIL_DEFAULT = [
  "Pas de courbe dérivée.",
  "Pas de courbe primitive.",
  "Échelle linéaire sur l'axe Ox",
  "Échelle linéaire sur l'axe Oy",
  "Pas de simulations statistiques.",
  "Pas d'arbre de probabilités.",
  "Pas de tableau de variations ou de signes.",
  "Pas de loi exponentielle",
  "Pas de rapporteur"
];

const newCurve = (o = {}) => Object.assign({
  expr: '', expr2: '', couleur: 0, vitesse: 5, ep: 2, style: 0,
  tmin: '-pi', tmax: 'pi', n: 400, env: false, dev: false, anim: false, pts: []
}, o);
const newPoint = (o = {}) => Object.assign({
  a: '0', nom: '', police: 'MS Sans Serif', taille: 10, style: 'gras', pos: 1, couleur: 16711680,
  cote: true, tang: false, ftang: false, fnorm: false
}, o);

function newDoc() {
  return {
    header: '1', // « Sine qua non - version 2 »
    cadre: true, cadreCol: 12632256, fondCol: 16777215,
    orient: 'portrait',
    axesVis: true, nameX: 'x', nameY: 'y', keepX: false, keepY: false,
    grad: 'full', // full | first | none
    gradGrille: true,
    W: 180, H: 130, mg: 15, mh: 15, dOx: 65, dOy: 90,
    ox: '0', oy: '0', sigX: 4, sigY: 4,
    ux: '1', uy: '1', fmtX: 'normal', fmtY: 'normal',
    lx: 10, ly: 10, zoom: 100,
    gridStyle: 2, gridSize: 5, repCol: 0, gridCol: 8388736,
    gFont: ['Courier New', 'Arial'], gSize: [10, 10], gCol: [0, 0], gStyle: ['gras', 'gras'],
    texts: [], fns: [], params: [], polars: [],
    fam: null, droites: [], objs: [],
    latex: [], latexOpaque: false,
    rawMiddle: RAW_MIDDLE_DEFAULT.slice(), rawTail: RAW_TAIL_DEFAULT.slice(),
    extraHeader: [], name: 'sans titre',
    extras: [], log: { x: false, y: false, mx: 40, my: 40 }
  };
}
function defaultDoc() {
  const d = newDoc();
  d.fns.push(newCurve({ expr: '0.5x^2-3' }));
  return d;
}

/* ----- lecture ----- */
const isIndented = l => /^\s/.test(l);

function parseCurveAttrs(lines, c) {
  let cp = null;
  for (const raw of lines) {
    const t = raw.trim(); let m;
    if ((m = t.match(/^point n°\s*\d+,\s*(?:d'abscisse|de paramètre|d'angle|de t|de)?\s*(.*)$/i))) {
      cp = newPoint({ a: m[1].trim(), cote: false }); c.pts.push(cp); continue;
    }
    if (cp) {
      if ((m = t.match(/^nom\s*:\s*(.*)$/))) cp.nom = m[1];
      else if ((m = t.match(/^police\s*:\s*(.*)$/))) cp.police = m[1];
      else if ((m = t.match(/^taille\s*:\s*(\d+)/))) cp.taille = +m[1];
      else if ((m = t.match(/^style\s*:\s*(.*)$/))) cp.style = m[1];
      else if ((m = t.match(/^position\s*:\s*(-?\d+)/))) cp.pos = +m[1];
      else if ((m = t.match(/^couleur\s*:\s*(-?\d+)/))) cp.couleur = +m[1];
      else if (/^ligne de cote trac/i.test(t)) cp.cote = true;
      else if (/^pas de ligne de cote/i.test(t)) cp.cote = false;
      else if (/^tangente trac/i.test(t)) cp.tang = true;
      else if (/^pas de tangente/i.test(t)) cp.tang = false;
      else if (/^fl[èe]che tangente trac/i.test(t)) cp.ftang = true;
      else if (/^pas de fl[èe]che tangente/i.test(t)) cp.ftang = false;
      else if (/^fl[èe]che normale trac/i.test(t)) cp.fnorm = true;
      else if (/^pas de fl[èe]che normale/i.test(t)) cp.fnorm = false;
      continue;
    }
    if ((m = t.match(/^couleur\s*:\s*(-?\d+)/))) c.couleur = +m[1];
    else if ((m = t.match(/^vitesse\s*:\s*(-?\d+)/))) c.vitesse = +m[1];
    else if ((m = t.match(/^[ée]paisseur\s*:\s*(\d+)/i))) c.ep = +m[1];
    else if ((m = t.match(/^style\s*:\s*(-?\d+)/))) c.style = +m[1];
    else if ((m = t.match(/^TMin\s*:\s*(.*)$/i))) c.tmin = m[1].trim();
    else if ((m = t.match(/^TMax\s*:\s*(.*)$/i))) c.tmax = m[1].trim();
    else if ((m = t.match(/^Nombre de valeurs de T\s*:\s*(\d+)/i))) c.n = +m[1];
    else if (/^pas d'enveloppe/i.test(t)) c.env = false;
    else if (/^enveloppe tangentielle/i.test(t)) c.env = true;
    else if (/^pas de d[ée]velopp[ée]e/i.test(t)) c.dev = false;
    else if (/^d[ée]velopp[ée]e normale/i.test(t)) c.dev = true;
    else if (/^ne pas voir la progression/i.test(t)) c.anim = false;
    else if (/^voir la progression/i.test(t)) c.anim = true;
  }
}

/** Lit un bloc d'éléments indentés : renvoie [début de l'élément, lignes d'attributs] */
function readItems(L, i, headRe) {
  const items = [];
  while (i < L.length && headRe.test(L[i])) {
    const head = L[i++]; const attrs = [];
    while (i < L.length && isIndented(L[i]) ) attrs.push(L[i++]);
    items.push({ head, attrs });
  }
  return { items, i };
}

function parseSqn(text, name = 'sans titre') {
  const L = text.replace(/\r\n?/g, '\n').split('\n');
  while (L.length && L[L.length - 1].trim() === '') L.pop();
  const d = newDoc(); d.name = name; d.rawMiddle = []; d.rawTail = [];
  let i = 0;
  if (!/^Sine qua non/i.test(L[0] || '')) throw new Error('Ce fichier n\'est pas un dessin Sine qua non (.sqn).');
  i = 1;
  // --- en-tête ---
  while (i < L.length && !/^Nombre de textes/i.test(L[i])) {
    const line = L[i++]; let m;
    const kv = line.match(/^([^:]+?)\s*:\s*(.*)$/);
    if (/^Cadre\s*:/i.test(line)) d.cadre = /oui/i.test(line);
    else if ((m = line.match(/^Couleur cadre\s*:\s*(-?\d+)\s+(-?\d+)/i))) { d.cadreCol = +m[1]; d.fondCol = +m[2]; }
    else if (/^Orientation\s*:/i.test(line)) d.orient = /paysage|landscape/i.test(line) ? 'paysage' : 'portrait';
    else if (/^Axes (in)?visibles/i.test(line)) {
      d.axesVis = !/^Axes invisibles/i.test(line);
      const p = line.split('\t'); d.nameX = p[1] || 'x'; d.nameY = p[2] || 'y';
      d.keepX = p[3] === '1'; d.keepY = p[4] === '1';
    }
    else if (/^Graduations compl/i.test(line)) d.grad = 'full';
    else if (/^Graduations (incompl|premi)/i.test(line)) d.grad = 'first';
    else if (/^(Aucune graduation|Pas de graduation|Graduations (absentes|invisibles))/i.test(line)) d.grad = 'none';
    else if (/^Graduations bas[ée]es sur la grille/i.test(line)) d.gradGrille = true;
    else if (/^Graduations (non|ind[ée]pendantes|libres)/i.test(line)) d.gradGrille = false;
    else if (/^\s+taille\s*:/i.test(line) && (m = line.match(/:\s*(\d+)-(\d+)/))) d.gSize = [+m[1], +m[2]];
    else if (/^\s+couleur\s*:/i.test(line) && (m = line.match(/:\s*(-?\d+)-(-?\d+)/))) d.gCol = [+m[1], +m[2]];
    else if (/^\s+style\s*:/i.test(line) && (m = line.match(/:\s*(.+)-(.+)$/))) d.gStyle = [m[1].trim(), m[2].trim()];
    else if (kv) {
      const k = kv[1].toLowerCase(), v = kv[2];
      const parts = v.split('\t');
      if (/^largeur en mm/.test(k)) d.W = parseNum(v);
      else if (/^hauteur en mm/.test(k)) d.H = parseNum(v);
      else if (/^marge gauche/.test(k)) d.mg = parseNum(v);
      else if (/^marge haute/.test(k)) d.mh = parseNum(v);
      else if (/^distance de l'axe ox/.test(k)) d.dOx = parseNum(v);
      else if (/^distance de l'axe oy/.test(k)) d.dOy = parseNum(v);
      else if (/^origine de l'axe ox/.test(k)) { d.ox = parts[0].trim(); d.sigX = parseInt(parts[1]) || 4; }
      else if (/^origine de l'axe oy/.test(k)) { d.oy = parts[0].trim(); d.sigY = parseInt(parts[1]) || 4; }
      else if (/^unit[ée] sur l'axe ox/.test(k)) d.ux = v.trim();
      else if (/^unit[ée] sur l'axe oy/.test(k)) d.uy = v.trim();
      else if (/^format des unit[ée]s sur ox/.test(k)) d.fmtX = /trig/i.test(v) ? 'trig' : 'normal';
      else if (/^format des unit[ée]s sur oy/.test(k)) d.fmtY = /trig/i.test(v) ? 'trig' : 'normal';
      else if (/^longueur de l'unit[ée] sur ox/.test(k)) d.lx = parseNum(v);
      else if (/^longueur de l'unit[ée] sur oy/.test(k)) d.ly = parseNum(v);
      else if (/^zoom/.test(k)) d.zoom = parseNum(v, 100);
      else if (/^style grille/.test(k)) { d.gridStyle = parseInt(parts[0]) || 0; d.gridSize = parseNum(parts[1], 5) || 5; }
      else if (/^couleur du rep[èe]re/.test(k)) d.repCol = parseInt(v) || 0;
      else if (/^couleur de la grille/.test(k)) d.gridCol = parseInt(v) || 0;
      else if (/^polices utilis[ée]es graduations/.test(k)) { const q = v.split('-'); d.gFont = [q[0].trim(), (q[1] || q[0]).trim()]; }
      else d.extraHeader.push(line);
    }
    else d.extraHeader.push(line);
  }
  // --- textes ---
  let m = (L[i] || '').match(/^Nombre de textes\s*:\s*(\d+)/i);
  if (m) {
    i++; const n = +m[1];
    for (let k = 0; k < n && i < L.length; k++) {
      const h = (L[i++] || '').match(/^Texte n°\s*\d+\s*:\s?(.*)$/);
      const t = { txt: h ? h[1] : '', x: 0, y: 0, font: 'Times New Roman', size: 12, col: 0, style: 'normal' };
      while (i < L.length && isIndented(L[i])) {
        const a = L[i++].match(/^\s+(abscisse|ordonnee|ordonnée|police|taille|couleur|style|angle)\s*:\s*(.*)$/i);
        if (!a) continue;
        const key = a[1].toLowerCase(), v = a[2];
        if (key === 'abscisse') t.x = parseNum(v); else if (key.startsWith('ordonn')) t.y = parseNum(v);
        else if (key === 'police') t.font = v.trim(); else if (key === 'taille') t.size = parseNum(v, 12);
        else if (key === 'couleur') t.col = parseInt(v) || 0; else if (key === 'style') t.style = v.trim();
        else if (key === 'angle') t.angle = parseNum(v);
      }
      d.texts.push(t);
    }
  }
  // --- fonctions ---
  m = (L[i] || '').match(/^Nombre de fonctions\s*:\s*(\d+)/i);
  if (m) {
    i++;
    const r = readItems(L, i, /^F\d+\(x\)\s*=/i); i = r.i;
    for (const it of r.items) {
      const c = newCurve({ expr: it.head.replace(/^F\d+\(x\)\s*=/i, '') });
      parseCurveAttrs(it.attrs, c); d.fns.push(c);
    }
  }
  // --- paramétrées ---
  m = (L[i] || '').match(/^Nombre de courbes param[ée]tr[ée]es\s*:\s*(\d+)/i);
  if (m) {
    i++;
    while (i < L.length && /^X\d+\(t\)\s*=/i.test(L[i])) {
      const c = newCurve({ expr: L[i++].replace(/^X\d+\(t\)\s*=/i, '') });
      if (/^Y\d+\(t\)\s*=/i.test(L[i] || '')) c.expr2 = L[i++].replace(/^Y\d+\(t\)\s*=/i, '');
      const attrs = []; while (i < L.length && isIndented(L[i])) attrs.push(L[i++]);
      parseCurveAttrs(attrs, c); d.params.push(c);
    }
  }
  // --- famille ---
  if (/^Famille de fonctions/i.test(L[i] || '')) {
    i++; const f = { expr: '', pmin: '-1', pmax: '1', dp: '0.5', couleur: -1, vitesse: 0, ep: 3, style: 0, anim: true, animDet: false, show: false, abs: '0', pos: 1 };
    while (i < L.length && !/^Nombre de droites/i.test(L[i])) {
      const l = L[i++]; let q;
      if ((q = l.match(/^Fp\(x\)\s*=(.*)$/i))) f.expr = q[1];
      else if ((q = l.match(/^P Minimum\s*=(.*)$/i))) f.pmin = q[1].trim();
      else if ((q = l.match(/^P Maximum\s*=(.*)$/i))) f.pmax = q[1].trim();
      else if ((q = l.match(/^Delta P\s*=(.*)$/i))) f.dp = q[1].trim();
      else if ((q = l.match(/^Couleur\s*=\s*(-?\d+)/i))) f.couleur = +q[1];
      else if ((q = l.match(/^Vitesse\s*=\s*(-?\d+)/i))) f.vitesse = +q[1];
      else if ((q = l.match(/^[ÉE]paisseur\s*=\s*(\d+)/i))) f.ep = +q[1];
      else if ((q = l.match(/^Style\s*=\s*(\d+)/i))) f.style = +q[1];
      else if (/^Ne pas voir la progression d[ée]taill/i.test(l)) f.animDet = false;
      else if (/^Voir la progression d[ée]taill/i.test(l)) f.animDet = true;
      else if (/^Ne pas voir la progression/i.test(l)) f.anim = false;
      else if (/^Voir la progression/i.test(l)) f.anim = true;
      else if (/^Ne pas afficher/i.test(l)) f.show = false;
      else if (/^Afficher les valeurs/i.test(l)) f.show = true;
      else if ((q = l.match(/^Abscisse de l'a(?:ff?)ichage de P\s*=(.*)$/i))) { f.abs = q[1].trim(); f.typo = /l'afichage/i.test(l); }
      else if ((q = l.match(/^Position de P\s*=\s*(-?\d+)/i))) f.pos = +q[1];
    }
    d.fam = f;
  } else if (/^Pas de famille/i.test(L[i] || '')) i++;
  // --- droites ---
  m = (L[i] || '').match(/^Nombre de droites\s*:\s*(\d+)/i);
  if (m) {
    i++;
    const r = readItems(L, i, /^[ÉE]quation de D\d+\s*:/i); i = r.i;
    for (const it of r.items) {
      const dr = { eq: it.head.replace(/^[ÉE]quation de D\d+\s*:/i, ''), couleur: 0, ep: 2, styleStr: '011', type: 1, a: '0', b: '0' };
      for (const a of it.attrs) {
        const q = a.trim().match(/^([^:]+?)\s*:\s*(.*)$/); if (!q) continue;
        const k = q[1].toLowerCase();
        if (k === 'couleur') dr.couleur = parseInt(q[2]) || 0; else if (/paisseur/.test(k)) dr.ep = parseInt(q[2]) || 2;
        else if (k === 'style') dr.styleStr = q[2]; else if (k.startsWith('type')) dr.type = parseInt(q[2]) || 1;
        else if (k === 'coef a') dr.a = q[2]; else if (k === 'coef b') dr.b = q[2];
      }
      d.droites.push(dr);
    }
  }
  // --- objets graphiques ---
  m = (L[i] || '').match(/^Nombre d'objets graphiques\s*:\s*(\d+)/i);
  if (m) {
    const n = +m[1]; d.objsTail = (L[i].split('\t')[1] || '1'); i++;
    for (let k = 0; k < n && i < L.length; k++) d.objs.push(parseObj(L[i++]));
  }
  // --- bloc brut (stats, lois, suites, intégrales…) jusqu'aux expressions LaTeX ---
  while (i < L.length && !/^(Pas d'expressions LaTeX|Expressions LaTeX)/i.test(L[i])) d.rawMiddle.push(L[i++]);
  // --- LaTeX ---
  if (/^Expressions LaTeX/i.test(L[i] || '')) {
    d.latexOpaque = /opaque/i.test(L[i]); i++;
    while (i < L.length && !/^Fin des expressions LaTeX/i.test(L[i])) {
      const q = L[i++].match(/^(\s*(?:\d+\$)?\s?)(.*)\t([^\t]*)\t([^\t]*)$/);
      if (q) d.latex.push({ pre: q[1], size: (/(\d+)\$/.exec(q[1]) || [0, 3])[1] * 1, src: q[2], x: parseNum(q[3]), y: parseNum(q[4]) });
    }
    i++;
  } else if (/^Pas d'expressions LaTeX/i.test(L[i] || '')) i++;
  // --- polaires ---
  m = (L[i] || '').match(/^Nombre de courbes en coordonn[ée]es polaires\s*:\s*(\d+)/i);
  if (m) {
    i++;
    const r = readItems(L, i, /^f\d+\(t\)\s*=/i); i = r.i;
    for (const it of r.items) {
      const c = newCurve({ expr: it.head.replace(/^f\d+\(t\)\s*=/i, ''), tmin: '0', tmax: '2pi' });
      parseCurveAttrs(it.attrs, c); d.polars.push(c);
    }
  } else if (/^Pas de courbes en coordonn[ée]es polaires/i.test(L[i] || '')) i++;
  // --- reste ---
  while (i < L.length) d.rawTail.push(L[i++]);
  const ri = d.rawTail.findIndex(l => /^Rapporteur\s*$/i.test(l));
  if (ri >= 0) {
    const kv = {}; for (const l of d.rawTail.slice(ri + 1)) { const q = l.match(/^\s+([^:]+?)\s*:\s*(-?\d+)/); if (q) kv[q[1].trim().toLowerCase()] = +q[2]; }
    const gv = (k, dflt) => (kv[k] !== undefined ? kv[k] : dflt);
    d.rap = { R: gv('rayon du rapporteur', 65), ext: gv('cercle extérieur', 0), deg: gv('graduations en degrés', 0), rad: gv('graduations en radians', 1),
      quad: gv('quadrillage intérieur', 0), val: gv('valeurs remarquables', 1), colCercles: gv('couleur cercles', 0),
      colGrad: gv('couleur graduations', 0), colQuad: gv('couleur quadrillage', 12632256), colVal: gv('couleur valeurs remarquables', 32768) };
  }
  if (!d.rawMiddle.length) d.rawMiddle = RAW_MIDDLE_DEFAULT.slice();
  if (!d.rawTail.length) d.rawTail = RAW_TAIL_DEFAULT.slice();
  return d;
}

function parseObj(line) {
  let m;
  if ((m = line.match(/^Point ([^,]*),(-?\d+),(.*)$/))) {
    const parts = m[3].split(';');
    return { kind: 'point', nom: m[1].trim(), pos: +m[2], x: parseNum(parts[0]), y: parseNum(parts[1]), tail: parts.slice(2).join(';') || '7,1,2,0,0' };
  }
  if ((m = line.match(/^Segment,(\d+),(.),(.),(.*)$/))) {
    const parts = m[4].split(';');
    const f = (parts[4] || ',,,,0,1,0,0,30').split(',');
    return { kind: 'segment', x1: parseNum(parts[0]), y1: parseNum(parts[1]), x2: parseNum(parts[2]), y2: parseNum(parts[3]),
      style: parseInt(f[4]) || 0, ep: parseInt(f[5]) || 1, couleur: parseInt(f[6]) || 0, e1: m[2], e2: m[3], f: f };
  }
  return { kind: 'raw', raw: line };
}

/* ----- écriture ----- */
function serializeCurveAttrs(c, mode) {
  const o = [];
  o.push(`    couleur : ${c.couleur}`, `    vitesse : ${c.vitesse}`, `    épaisseur : ${c.ep}`, `    style : ${c.style}`);
  if (mode !== 'fn') o.push(`    TMin : ${c.tmin}`, `    TMax : ${c.tmax}`, `    Nombre de valeurs de T : ${c.n}`);
  o.push(c.env ? '    enveloppe tangentielle' : "    pas d'enveloppe tangentielle");
  o.push(c.dev ? '    développée normale' : '    pas de développée normale');
  o.push(c.anim ? '    voir la progression' : '    ne pas voir la progression');
  o.push(`    Nombre de points particuliers : ${c.pts.length}`);
  c.pts.forEach((p, k) => {
    o.push(`    point n° ${k + 1}, d'abscisse ${p.a}`,
      `        nom : ${p.nom}`, `        police : ${p.police}`, `        taille : ${p.taille}`,
      `        style : ${p.style}`, `        position : ${p.pos}`, `        couleur : ${p.couleur}`,
      p.cote ? '        ligne de cote tracée' : '        pas de ligne de cote',
      p.tang ? '        tangente tracée' : '        pas de tangente',
      p.ftang ? '        flèche tangente tracée' : '        pas de flèche tangente',
      p.fnorm ? '        flèche normale tracée' : '        pas de flèche normale');
  });
  return o;
}
function serializeObj(o, tailDefault) {
  if (o.kind === 'raw') return o.raw;
  if (o.kind === 'point') return `Point ${o.nom},${o.pos || 0},${fmtNum(o.x)};${fmtNum(o.y)};${o.tail || tailDefault}`;
  const f = (o.f || ',,,,0,1,0,0,30'.split(',')).slice(); while (f.length < 9) f.push('0');
  f[4] = o.style; f[5] = o.ep; f[6] = o.couleur;
  return `Segment,1,${o.e1 || '['},${o.e2 || ']'},${fmtNum(o.x1)};${fmtNum(o.y1)};${fmtNum(o.x2)};${fmtNum(o.y2)};${f.join(',')}`;
}

function serializeSqn(d) {
  const o = [];
  o.push('Sine qua non - version 2');
  o.push(`Cadre : ${d.cadre ? 'oui' : 'non'}`);
  o.push(`Couleur cadre : ${d.cadreCol}\t${d.fondCol}`);
  o.push(`Orientation : ${d.orient}`);
  o.push(`Axes ${d.axesVis ? '' : 'in'}visibles\t${d.nameX}\t${d.nameY}\t${d.keepX ? 1 : 0}\t${d.keepY ? 1 : 0}`);
  o.push(d.grad === 'full' ? 'Graduations complètes' : d.grad === 'first' ? 'Graduations incomplètes' : 'Aucune graduation');
  o.push(d.gradGrille ? 'Graduations basées sur la grille' : 'Graduations non basées sur la grille');
  o.push(`Largeur en mm : ${fmtNum(d.W)}`, `Hauteur en mm : ${fmtNum(d.H)}`,
    `Marge gauche en mm : ${fmtNum(d.mg)}`, `Marge haute en mm : ${fmtNum(d.mh)}`,
    `Distance de l'axe Ox en mm : ${fmtNum(d.dOx)}`, `Distance de l'axe Oy en mm : ${fmtNum(d.dOy)}`,
    `Origine de l'axe Ox : ${d.ox}\t${d.sigX}\tchiffres significatifs`,
    `Origine de l'axe Oy : ${d.oy}\t${d.sigY}\tchiffres significatifs`,
    `Unité sur l'axe Ox : ${d.ux}`, `Format des unités sur Ox : ${d.fmtX === 'trig' ? 'trigonométrique' : 'normal'}`,
    `Longueur de l'unité sur Ox en mm : ${fmtNum(d.lx)}`,
    `Unité sur l'axe Oy : ${d.uy}`, `Format des unités sur Oy : ${d.fmtY === 'trig' ? 'trigonométrique' : 'normal'}`,
    `Longueur de l'unité sur Oy en mm : ${fmtNum(d.ly)}`,
    `Zoom (%) : ${fmtNum(d.zoom)}`, `Style grille : ${d.gridStyle}\t${fmtNum(d.gridSize)}`,
    `Couleur du repère : ${d.repCol}`, `Couleur de la grille : ${d.gridCol}`,
    `Polices utilisées graduations-points : ${d.gFont.join('-')}`,
    `      taille  : ${d.gSize.join('-')}`, `      couleur : ${d.gCol.join('-')}`, `      style : ${d.gStyle.join('-')}`);
  o.push(...d.extraHeader);
  o.push(`Nombre de textes : ${d.texts.length}`);
  d.texts.forEach((t, k) => o.push(`Texte n° ${k + 1} : ${t.txt}`,
    `      abscisse : ${fmtNum(t.x)}`, `      ordonnee : ${fmtNum(t.y)}`, `      police   : ${t.font}`,
    `      taille   : ${fmtNum(t.size)}`, `      couleur  : ${t.col};-16777211`, `      style    : ${t.style}`));
  o.push(`Nombre de fonctions : ${d.fns.length}`);
  d.fns.forEach((c, k) => { o.push(`F${k + 1}(x)=${c.expr}`, ...serializeCurveAttrs(c, 'fn')); });
  o.push(`Nombre de courbes paramétrées : ${d.params.length}`);
  d.params.forEach((c, k) => { o.push(`X${k + 1}(t)=${c.expr}`, `Y${k + 1}(t)=${c.expr2}`, ...serializeCurveAttrs(c, 'param')); });
  if (d.fam) {
    const f = d.fam;
    o.push('Famille de fonctions', `Fp(x) =${f.expr}`, `P Minimum =${f.pmin}`, `P Maximum =${f.pmax}`, `Delta P =${f.dp}`,
      `Couleur =${f.couleur}`, `Vitesse =${f.vitesse}`, `Épaisseur =${f.ep}`, `Style =${f.style}`,
      f.anim ? 'Voir la progression du dessin' : 'Ne pas voir la progression du dessin',
      f.animDet ? 'Voir la progression détaillée du dessin' : 'Ne pas voir la progression détaillée du dessin',
      f.show ? 'Afficher les valeurs de P' : 'Ne pas afficher les valeurs de P',
      `Abscisse de l'${f.typo === false ? 'aff' : 'af'}ichage de P =${f.abs}`, `Position de P =${f.pos}`);
  } else o.push('Pas de famille de fonctions');
  o.push(`Nombre de droites : ${d.droites.length}`);
  d.droites.forEach((r, k) => o.push(`Équation de D${k + 1}:${r.eq}`, `    Couleur :${r.couleur}`, `    Épaisseur :${r.ep}`,
    `    Style :${r.styleStr}`, `    Type de droite :${r.type}`, `    Coef a :${r.a}`, `    Coef b :${r.b}`));
  o.push(`Nombre d'objets graphiques : ${d.objs.length}\t${d.objsTail || 1}`);
  d.objs.forEach(ob => o.push(serializeObj(ob, '7,1,2,0,0')));
  o.push(...d.rawMiddle);
  if (d.latex.length) {
    o.push(`Expressions LaTeX (${d.latexOpaque ? 'opaques' : 'transparentes'})`);
    d.latex.forEach(l => o.push(`${l.pre !== undefined ? l.pre : '   ' + (l.size || 3) + '$ '}${l.src}\t${fmtNum(l.x)}\t${fmtNum(l.y)}`));
    o.push('Fin des expressions LaTeX');
  } else o.push("Pas d'expressions LaTeX");
  if (d.polars.length) {
    o.push(`Nombre de courbes en coordonnées polaires : ${d.polars.length}`);
    d.polars.forEach((c, k) => o.push(`f${k + 1}(t)=${c.expr}`, ...serializeCurveAttrs(c, 'param')));
  } else o.push('Pas de courbes en coordonnées polaires.');
  o.push(...tailWithRap(d));
  return o.join('\r\n') + '\r\n';
}

function tailWithRap(d) {
  const t = d.rawTail.slice();
  let i = t.findIndex(l => /^Rapporteur\s*$/i.test(l)), j = t.findIndex(l => /^Pas de rapporteur/i.test(l));
  const r = d.rap;
  const block = r ? ['Rapporteur', '   Type Lycée', `   Rayon du rapporteur    :${r.R}`, '   Repère en arrière plan :0', `   Cercle extérieur       :${r.ext}`,
    `   Graduations en degrés  :${r.deg}`, `   Graduations en radians :${r.rad}`, '      Traits', `   Quadrillage intérieur  :${r.quad}`,
    `   Valeurs remarquables   :${r.val}`, `   Couleur cercles        :${r.colCercles}`, `   Couleur graduations    :${r.colGrad}`,
    `   Couleur quadrillage    :${r.colQuad}`, `   Couleur valeurs remarquables :${r.colVal}`] : ['Pas de rapporteur'];
  if (!r) { if (i >= 0) t.splice(i, t.length - i, 'Pas de rapporteur'); return t; }
  if (i >= 0) t.splice(i, t.length - i, ...block); else if (j >= 0) t.splice(j, 1, ...block); else t.push(...block);
  return t;
}
const hasExtras = d => d.extras.length > 0 || d.log.x || d.log.y;
/** Instantané complet (.sqn + compléments propres à la version en ligne) */
function snapshotDoc(d) { return JSON.stringify({ format: 'sqnw', sqn: serializeSqn(d), extras: d.extras, log: d.log }); }
function docFromText(text, name) {
  if (text.trim().startsWith('{')) {
    const j = JSON.parse(text); if (j.format !== 'sqnw') throw new Error('Format de fichier inconnu.');
    const d = parseSqn(j.sqn, name); d.extras = j.extras || []; d.log = Object.assign({ x: false, y: false, mx: 40, my: 40 }, j.log || {}); return d;
  }
  return parseSqn(text, name);
}

/* Encodage / décodage Windows-1252 (encodage des .sqn) */
const CP1252 = { 0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88,
  0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94,
  0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F };
function encodeCp1252(s) {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    b[i] = c < 256 ? c : (CP1252[c] || 63);
  }
  return b;
}
function decodeCp1252(buf) { return new TextDecoder('windows-1252').decode(buf); }
