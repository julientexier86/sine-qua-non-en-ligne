/* ===== Réécriture dans le .sqn des objets lus nativement (modifiés, supprimés ou créés dans l'application) ===== */
const SLOT_HDR = {
  pbp: /^(Courbe définie point par point\s*$|Pas de courbe définie point par point)/i,
  bez: /^(Courbe définie point par point avec lissage|Pas de courbe point par point lissée)/i,
  nn: /^(Données statistiques 1 variable non numérique|Pas de données statistiques 1 variable non numérique)/i,
  iso: /^(Données statistiques 1 variable \(valeurs isolées\)|Pas de données statistiques 1 variable \(valeurs isolées\))/i,
  cl: /^(Données statistiques 1 variable \(valeurs regroupées en classes\)|Pas de données statistiques 1 variable \(valeurs regroupées en classes\))/i,
  s2: /^(Données statistiques 2 variables|Pas de données statistiques 2 variables)/i,
  bin: /^(Loi binômiale|Pas de loi binômiale)/i, poi: /^(Loi de Poisson|Pas de loi de Poisson)/i, nor: /^(Loi normale|Pas de loi normale)/i,
  suite: /^(Suite numérique|Pas de suite numérique)/i, integ: /^(Intégrale définie de type|Pas d'intégrale)/i,
  box: /^(Données statistiques 1 variable \(boîtes à moustaches multiples|Pas de boîtes à moustaches multiples)/i,
  tv: /^(Table de valeurs de fonctions|Pas de table de valeurs de fonctions)/i, tvt: /^(Table de valeurs de courbes paramétrées|Pas de table de valeurs de courbes paramétrées)/i,
  ineq: /^(Inéquations(\t|\s*$)|Pas d'inéquations)/i,
  deriv: /^(Courbe de la dérivée de y=|Pas de courbe dérivée)/i, prim: /^(Courbe de la primitive de y=|Pas de courbe primitive)/i,
  lgx: /^Échelle (logarithmique|linéaire) sur l'axe Ox/i, lgy: /^Échelle (logarithmique|linéaire) sur l'axe Oy/i,
  sim: /^(Loi statistique :|Pas de simulations statistiques)/i, arb: /^(Arbre de probabilités|Pas d'arbre de probabilités)/i,
  tab: /^(Tableau de variations ou de signes|Pas de tableau de variations)/i, exp: /^(Loi exponentielle|Pas de loi exponentielle)/i, rap: /^(Rapporteur\s*$|Pas de rapporteur)/i
};
const SLOT_PAS = { pbp: 'Pas de courbe définie point par point', bez: 'Pas de courbe point par point lissée', nn: 'Pas de données statistiques 1 variable non numérique',
  iso: 'Pas de données statistiques 1 variable (valeurs isolées)', cl: 'Pas de données statistiques 1 variable (valeurs regroupées en classes)', s2: 'Pas de données statistiques 2 variables',
  bin: 'Pas de loi binômiale', poi: 'Pas de loi de Poisson', nor: 'Pas de loi normale', suite: 'Pas de suite numérique', integ: "Pas d'intégrale", box: 'Pas de boîtes à moustaches multiples',
  tv: 'Pas de table de valeurs de fonctions', ineq: "Pas d'inéquations", deriv: 'Pas de courbe dérivée.', prim: 'Pas de courbe primitive.', sim: 'Pas de simulations statistiques.',
  arb: "Pas d'arbre de probabilités.", tab: 'Pas de tableau de variations ou de signes.', exp: 'Pas de loi exponentielle' };

function slotOf(e) {
  switch (e.type) {
    case 'loi': return { bin: 'bin', poi: 'poi', nor: 'nor' }[e.kind] || null;
    case 'loiexp': return 'exp'; case 'suite': return 'suite'; case 'integ': return 'integ'; case 'ineqw': return 'ineq'; case 'boxq': return 'box'; case 'stat2': return 's2';
    case 'deriv': return 'deriv'; case 'prim': return 'prim'; case 'simw': return 'sim'; case 'arbre': return 'arb'; case 'tabw': return 'tab';
    case 'tabv': return 'tv';
    case 'pbpw': return e.nocurve ? 'tv' : e.mode === 'bez' ? 'bez' : 'pbp';
    case 'stat1': return { camem: 'nn', barres: 'nn', batons: 'iso', boite: 'iso', histo: 'cl', cumulf: 'cl' }[e.mode] || null;
  } return null;
}
const SLOT_GEN = {};   // clé -> (extras[]) => lignes ; absent : suppression seulement
const extraSnap = e => JSON.stringify(e, (k, v) => (k[0] === '_' ? undefined : v));
function markOrig(d) { d._origCount = {}; d.extras.forEach(e => { if (e.fromRaw) { e._orig = extraSnap(e); const k = slotOf(e); if (k) d._origCount[k] = (d._origCount[k] || 0) + 1; } }); }

/** Applique les objets modifiés / supprimés / créés aux blocs bruts. Renvoie { mid, tail } (copies). */
function rawWith(d) {
  const arr = { mid: d.rawMiddle.slice(), tail: d.rawTail.slice() }, all = Object.values(SLOT_HDR);
  const isHdr = l => all.some(r => r.test(l));
  const by = {}; d.extras.forEach(e => { const k = slotOf(e); if (k) (by[k] = by[k] || []).push(e); });
  for (const key of Object.keys(SLOT_PAS)) {
    const items = by[key] || [], orig = (d._origCount || {})[key] || 0;
    const unchanged = items.length === orig && items.every(e => e.fromRaw && e._orig === extraSnap(e));
    if (unchanged) continue;
    const gen = SLOT_GEN[key];
    for (const part of ['mid', 'tail']) {
      const R = arr[part]; let i = R.findIndex(l => SLOT_HDR[key].test(l)); if (i < 0) continue;
      let newLines;
      if (gen) { try { newLines = gen(items.slice(0, key === 'pbp' || key === 'bez' ? 10 : 1)); } catch (err) { newLines = null; } }
      else newLines = items.length ? null : [SLOT_PAS[key]];
      if (!newLines) break;
      const out = []; let done = false;
      for (let q = 0; q < R.length;) {
        if (SLOT_HDR[key].test(R[q])) { let j = q + 1; while (j < R.length && !isHdr(R[j])) j++; if (!done) { out.push(...newLines); done = true; } q = j; } else out.push(R[q++]);
      }
      arr[part] = out; if (gen) items.forEach(e => { e._inSqn = true; });
      break;
    }
  }
  return arr;
}

/* ---------- générateurs ---------- */
const WN = v => String(Math.round(+v * 1e9) / 1e9).replace('.', ','), WI = v => String(Math.round(+v) || 0);
const wEp = ep => Math.max(0, Math.min(4, Math.round((+ep + 1.5) / 2.5 - 1)));
const WMK = ['', 'dot', 'plus', 'x', 'star', 'sq', 'lo', 'circ', 'sq2', 'lo2'];
const loiTail = (e, c1, c2) => ["   Couleur de l'histogramme : " + WI(c1), '   Couleur de la zone à visualiser : ' + WI(c2), '   Épaisseur des traits : ' + wEp(e.ep), e.label ? 'Affichage des résultats' : "Pas d'affichage des résultats", e.params ? 'Affichage des paramètres' : "Pas d'affichage des paramètres"];
function genDiscrete(head, parLine, items, big) {
  const e = items[0]; if (!e) return [SLOT_PAS[head === 'Loi binômiale' ? 'bin' : 'poi']];
  const a = Math.round(e.a), b = Math.round(e.b), t = a === b ? 0 : 3;
  return [head, '   Titre : ' + (e.title || ''), ...parLine(e), '   Type de calcul : ' + t, '   k = ' + a, '   a = ' + a, '   b = ' + b, ...loiTail(e, e.couleur, e.couleur2)];
}
SLOT_GEN.bin = it => genDiscrete('Loi binômiale', e => ['   Nombre de répétitions : ' + Math.round(e.p1), "   Probabilité d'un succès : " + WN(e.p2)], it);
SLOT_GEN.poi = it => genDiscrete('Loi de Poisson', e => ['   Paramètre de la loi : ' + WN(e.p1)], it);
SLOT_GEN.nor = it => { const e = it[0]; if (!e) return [SLOT_PAS.nor]; const m = e.p1, sg = e.p2; let t = 2, a = e.a, b = e.b;
  if (a <= m - 9 * sg) { t = 0; a = b; } else if (b >= m + 9 * sg) t = 1;
  return ['Loi normale', '   Titre : ' + (e.title || ''), '   Moyenne : ' + WN(m), '   Ecart type : ' + WN(sg), '   Type de calcul : ' + t, '   a = ' + WN(a), '   b = ' + WN(b), '   degré = 95', '   équation = 0,95',
    '   Couleur de la courbe de Gauss : ' + WI(e.couleur), '   Couleur de la zone à visualiser : ' + WI(e.couleur2), '   Épaisseur des traits : ' + wEp(e.ep), e.label ? 'Affichage des résultats' : "Pas d'affichage des résultats"]; };
SLOT_GEN.exp = it => { const e = it[0]; if (!e) return [SLOT_PAS.exp]; const J = a => a.map(WN).join(';');
  return ['Loi exponentielle', '   Titre = ' + (e.title || ''), '   Lambda = ' + WN(e.lambda), '   Bornes zones coloriées = ' + J(e.zc), '   Couleurs Zones = ' + e.cc.map(WI).join(';'), '   Bornes zones hachurées = ' + J(e.zh),
    '   Styles hachures = ' + e.sh.map(WI).join(';'), '   Épaisseur courbe = ' + WI(e.ep), '   Couleur courbe = ' + WI(e.couleur), e.label ? '   Affichage des résultats' : "   Pas d'affichage des résultats"]; };
SLOT_GEN.suite = it => { const e = it[0]; if (!e) return [SLOT_PAS.suite]; const T = e.mode === 'expl' ? 0 : e.mode === 'rec' ? 1 : 2, ep = Math.max(0, WI(e.ep) - 1);
  return ['Suite numérique', '   Type : ' + T, '   Nom de la suite : ' + (e.nom || 'u'), '   Indice de départ : ' + WI(e.n0), '   Fonction associée : ' + e.src, '   Premier terme : ' + WN(e.u0) + '\tDernier terme dessiné : ' + WI(e.n1),
    '   Épaisseur de la courbe : ' + Math.min(4, ep), '   Couleur de la courbe : ' + WI(e.couleur2), '   Style de la courbe : 0', e.curve ? '   Courbe dessinée' : '   Courbe non dessinée',
    '   Épaisseur de la suite : ' + (Math.min(4, ep) + 50), '   Couleur de la suite : ' + WI(e.couleur), '   Style de la suite : ' + (10 + (e.link ? 0 : 4)), '   Suite dessinée', e.terms > 0 ? '   Termes affichés' : '   Termes non affichés']; };
SLOT_GEN.integ = it => { const e = it[0]; if (!e) return [SLOT_PAS.integ]; const two = !!(e.src2 && e.src2.trim());
  return ['Intégrale définie de type ' + (two ? 2 : 1), '   Borne a : ' + WN(e.a), '   Borne b : ' + WN(e.b), '   Fonction f : ' + e.src, '   Fonction g : ' + (e.src2 || ''), '   Couleur : ' + WI(e.couleur2), '   Style : 2', e.label ? '   Résultat affiché' : '   Résultat non affiché']; };
SLOT_GEN.ineq = it => { const e = it[0]; if (!e) return [SLOT_PAS.ineq]; const rows = linesOf(e.data).map(l => l.split(';')).filter(a => a.length >= 4).slice(0, 100), o = [`Inéquations\t${e.hach === false ? 'zone non hachurée' : 'zone hachurée'}`];
  rows.forEach((r, n) => { const z = Math.floor(n / 10), y = n % 10, cell = (c, v) => o.push(`${7 * z + c},${y},${v}`); cell(0, r[0].trim()); cell(1, r[1].trim()); cell(2, r[2].trim()); cell(3, r[3].trim()); cell(4, r[4] ? r[4].trim() : '0'); cell(5, r[5] ? r[5].trim() : '0'); cell(6, r[6] ? r[6].trim() : '3'); });
  o.push('Fin des inéquations'); return o; };
const pbpHead = (e, pente) => { const mk = e.marks ? Math.max(0, WMK.indexOf(e.mk)) : 0, sz = Math.max(1, Math.round((e.msz - 0.4) / 0.35)); return { mk, sz }; };
SLOT_GEN.pbp = it => { if (!it.length) return [SLOT_PAS.pbp]; const o = []; it.forEach(e => { const { mk, sz } = pbpHead(e), P = linesOf(e.data).map(l => l.split(';')).slice(0, 20);
  o.push('Courbe définie point par point', '    Couleur :' + WI(e.couleur), '    Épaisseur :' + (WI(e.tan) * 10 + WI(e.ep) % 10), '    Style des points :' + mk, '    Taille des points :' + sz, '    Couleur des points :' + WI(e.couleur2), '    Lignes de cote :' + (e.cote ? 1 : 0));
  for (let q = 0; q < 20; q++) { const p = P[q] || []; o.push((p[0] || '').trim(), (p[1] || '').trim(), p.length ? (p[2] || '0').trim() : ''); } }); return o; };
SLOT_GEN.bez = it => { if (!it.length) return [SLOT_PAS.bez]; const o = []; it.forEach(e => { const { mk, sz } = pbpHead(e), P = linesOf(e.data).map(l => l.split(';')).slice(0, 20);
  o.push('Courbe définie point par point avec lissage par courbes de Bézier', '    Couleur :' + WI(e.couleur), '    Épaisseur :' + WI(e.ep), '    Style des points :' + mk, '    Taille des points :' + sz, '    Couleur des points :' + WI(e.couleur2), '    Lignes de cote :' + (e.cote ? 1 : 0));
  for (let q = 0; q < 20; q++) { const p = P[q] || []; o.push((p[0] || '').trim(), (p[1] || '').trim()); } o.push('    Coefficient de lissage :' + WI(e.coef)); }); return o; };
SLOT_GEN.deriv = it => { const e = it[0]; return e ? ['Courbe de la dérivée de y=' + e.src, '   couleur   : ' + WI(e.couleur), '   épaisseur : ' + Math.max(0, WI(e.ep) - 1)] : [SLOT_PAS.deriv]; };
SLOT_GEN.prim = it => { const e = it[0]; return e ? ['Courbe de la primitive de y=' + e.src, 'passant par le point de coordonnées :' + WN(e.x0) + '\t' + WN(e.y0), '   couleur   : ' + WI(e.couleur), '   épaisseur : ' + Math.max(0, WI(e.ep) - 1)] : [SLOT_PAS.prim]; };
SLOT_GEN.box = it => { const e = it[0]; if (!e) return [SLOT_PAS.box]; const R = linesOf(e.data).map(l => l.split(';')).slice(0, 100);
  const o = ['Données statistiques 1 variable (boîtes à moustaches multiples', '   Titre de la série : ' + (e.title || ''), '   Orientation : ' + (e.horiz ? 'axes horizontaux' : 'axes verticaux'), '   Épaisseur :' + WI(e.ep), '   Distance entre axes :' + WI(e.dist),
    '   Position légendes :' + WI(e.leg), '   Couleur intérieure :' + WI(e.couleur2), '   Couleur traits :' + WI(e.couleur), '   Épaisseur des traits :' + Math.max(0, WI(e.ep2) - 1), '   Nombre de boîtes : ' + R.length];
  R.forEach(r => { for (let c = 0; c < 8; c++) o.push((r[c] || '').trim()); }); return o; };
/* statistiques à une variable */
const aggregate = (txt, raw) => { const m = new Map(); linesOf(txt).forEach(l => { const a = l.split(';'), v = a[0].trim(); if (!v) return; const n = raw ? 1 : parseNum(a[1], 1); m.set(v, (m.get(v) || 0) + n); }); return [...m.entries()]; };
SLOT_GEN.nn = it => { const e = it[0]; if (!e) return [SLOT_PAS.nn]; const C = catData(e), tot = C.reduce((t, c) => t + c[1], 0) || 1;
  const o = ['Données statistiques 1 variable non numérique', '   Titre de la série : ' + (e.title || ''), '   Style du graphique : ' + (e.mode === 'camem' ? 0 : 1), 'Times New Roman', '   Nombre de lignes : ' + C.length];
  C.forEach(([m, n, col], i) => o.push(m, WN(n), WN(Math.round(n / tot * 10000) / 100), WI(col !== undefined ? col : CAT_COL[i % 8]))); return o; };
SLOT_GEN.iso = it => { const e = it[0]; if (!e) return [SLOT_PAS.iso]; const rows = aggregate(e.data, e.mode === 'boite'), k = e.showStats ? 20 : 0;
  const o = ['Données statistiques 1 variable (valeurs isolées)', '   Titre de la série : ' + (e.title || ''), '   Style du graphique : ' + (k + (e.mode === 'boite' ? 1 : 0)), 'Times New Roman', '   Couleur : ' + WI(e.couleur2), '   Nombre de lignes : ' + rows.length];
  rows.forEach(([v, n]) => o.push(v.replace('.', ','), WN(n))); return o; };
SLOT_GEN.cl = it => { const e = it[0]; if (!e) return [SLOT_PAS.cl]; const rows = linesOf(e.data).map(l => l.split(';')).filter(a => a.length >= 3).slice(0, 100), k = Math.abs(e.ky - 1) < 1e-9 ? 10 : 0;
  const o = ['Données statistiques 1 variable (valeurs regroupées en classes)', '   Titre de la série : ' + (e.title || ''), '   Style du graphique : ' + ((e.mode === 'histo' ? 0 : e.mode === 'boitecl' ? (e.deciles ? 2 : 1) : 3) + k), 'Times New Roman', '   Effectifs affichés : ' + (e.table ? 'oui' : 'non'),
    '   Couleur : ' + WI(e.couleur2), '   Pourcentage représenté par 1 carreau (x10): 5', '   Nombre de lignes : ' + rows.length]; rows.forEach(r => o.push(r[0].trim().replace('.', ','), r[1].trim().replace('.', ','), r[2].trim().replace('.', ',')));
  return o; };
SLOT_GEN.s2 = it => { const e = it[0]; if (!e) return [SLOT_PAS.s2]; const FIT = { lin: 'linéaire', log: 'logarithmique', exp: 'exponentielle', pow: 'puissance', par: 'polynômiale de degré 2', pol3: 'polynômiale de degré 3', pol4: 'polynômiale de degré 4', none: 'aucune', mayer: 'Droite de Mayer' };
  const m = new Map(); linesOf(e.data).forEach(l => { const a = l.split(';'); if (a.length < 2) return; const key = a[0].trim() + ';' + a[1].trim(); m.set(key, (m.get(key) || 0) + 1); });
  const o = ['Données statistiques 2 variables', '   Titre de la série : ' + (e.title || ''), '   Type de régression : ' + (FIT[e.fit] || 'linéaire'), '   y en fonction de x', '   Couleur des points : ' + WI(e.couleur), '   Couleur de la courbe : ' + WI(e.couleur2),
    '   Chiffres significatifs : 4', '   Épaisseur de la courbe : ' + WI(e.ep), '   Forme des points : x', '   Taille des points : 1', '   Lignes de cotes non tracées', e.show ? '   Équation affichée' : '   Équation non affichée',
    e.gpoint ? '   Point moyen affiché' : '   Point moyen non affiché', 'Arial', '   Nombre de lignes : ' + m.size];
  m.forEach((n, key) => { const [x, y] = key.split(';'); o.push(x.replace('.', ','), y.replace('.', ','), String(n)); }); return o; };

SLOT_GEN.tab = it => { const e = it[0]; return e ? ['Tableau de variations ou de signes', '   ' + e.code.replace(/\r?\n/g, '')] : [SLOT_PAS.tab]; };
