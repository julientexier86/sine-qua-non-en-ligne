/* ---------- 7. Barre de menus et barre d'icônes (même organisation que le logiciel Windows) ---------- */
const IC = {
  new: '<path d="M6 3h8l4 4v14H6z" fill="#fff" stroke="#444"/><path d="M14 3v4h4" fill="none" stroke="#444"/>',
  open: '<path d="M3 8h6l2 2h9v9H3z" fill="#f2c94c" stroke="#8a6d00"/><path d="M3 19l3-7h16l-3 7z" fill="#ffe08a" stroke="#8a6d00"/>',
  print: '<rect x="7" y="3" width="10" height="5" fill="#fff" stroke="#444"/><rect x="3" y="8" width="18" height="8" rx="1" fill="#9aa5b1" stroke="#444"/><rect x="7" y="13" width="10" height="7" fill="#fff" stroke="#444"/>',
  save: '<path d="M4 4h14l2 2v14H4z" fill="#3b6fb6" stroke="#1d3f73"/><rect x="7" y="4" width="9" height="6" fill="#fff"/><rect x="7" y="14" width="10" height="6" fill="#dfe6ee"/>',
  export: '<path d="M4 4h14l2 2v14H4z" fill="#fff" stroke="#1d3f73"/><path d="M12 8v8m-3-3l3 3 3-3" fill="none" stroke="#1b5fbf" stroke-width="2"/>',
  copy: '<rect x="4" y="3" width="11" height="14" fill="#fff" stroke="#444"/><rect x="9" y="7" width="11" height="14" fill="#eaf1fb" stroke="#444"/>',
  tex: '<text x="12" y="16" font-size="12" font-weight="bold" text-anchor="middle" fill="#1b5fbf" font-family="serif">TeX</text>',
  text: '<rect x="3" y="5" width="18" height="14" fill="#fff" stroke="#000" stroke-width="1.5"/><text x="12" y="16" font-size="10" text-anchor="middle" font-family="sans-serif">ab</text>',
  axes: '<path d="M5 20V4m0 16h15" stroke="#222" stroke-width="1.6" fill="none"/><path d="M5 3l-2 4h4zM21 20l-4-2v4z" fill="#222"/>',
  fn: '<path d="M3 18c4-14 8 6 12-6 2-6 4-6 6-5" fill="none" stroke="#1b5fbf" stroke-width="2"/>',
  param: '<path d="M3 18c8-6-2-12 8-6s8-6 10-4M3 4l18 16" fill="none" stroke="#1b5fbf" stroke-width="2"/>',
  polar: '<path d="M12 12c0-1 1-1 1 0s-2 2-3 0 2-4 5-3 4 6 0 8-9 0-9-6 7-8 11-3" fill="none" stroke="#1b5fbf" stroke-width="1.6"/>',
  fam: '<path d="M3 20c3-14 6-14 9-14M6 20c2-10 5-12 8-12M9 20c1-6 4-9 8-9M12 20c1-3 3-6 7-6" fill="none" stroke="#7a2a8a" stroke-width="1.6"/>',
  shape: '<path d="M4 18l4-12 10 3 2 9z" fill="#2e8b57" stroke="#14532d" stroke-width="1.4"/><circle cx="7" cy="17" r="3" fill="#f2c94c" stroke="#333"/>',
  lines: '<path d="M3 5l18 12" stroke="#1b5fbf" stroke-width="2"/><path d="M3 19L21 6" stroke="#d62828" stroke-width="2"/>',
  deriv: '<path d="M3 17c4-14 8-2 12-8 2-3 4-2 6-1" fill="none" stroke="#222" stroke-width="2"/><path d="M13 8l6 2" stroke="#d62828" stroke-width="1.6"/>',
  prim: '<path d="M3 20c3 0 4-10 8-12s7 0 10-3" fill="none" stroke="#2e8b57" stroke-width="2"/><path d="M3 20h18" stroke="#222"/>',
  stat1: '<rect x="4" y="12" width="3.5" height="8" fill="#1b5fbf"/><rect x="9" y="5" width="3.5" height="15" fill="#d62828"/><rect x="14" y="9" width="3.5" height="11" fill="#2e8b57"/>',
  stat2: '<path d="M3 20L21 5" stroke="#d62828" stroke-width="1.6"/><g fill="#1b5fbf"><circle cx="6" cy="15" r="1.6"/><circle cx="10" cy="14" r="1.6"/><circle cx="14" cy="9" r="1.6"/><circle cx="18" cy="9" r="1.6"/></g>',
  histo: '<g fill="#7bd88f" stroke="#1d6b34"><rect x="3" y="13" width="4" height="7"/><rect x="7" y="6" width="4" height="14"/><rect x="11" y="3" width="4" height="17"/><rect x="15" y="10" width="4" height="10"/></g>',
  loi: '<path d="M3 20c4 0 4-15 9-15s5 15 9 15" fill="#f2c94c" stroke="#8a6d00" stroke-width="1.6"/><text x="19" y="6" font-size="7" font-weight="bold">N</text>',
  arbre: '<path d="M4 12h5l5-6h6M9 12l5 6h6" fill="none" stroke="#333" stroke-width="1.6"/><g fill="#d62828"><circle cx="4" cy="12" r="1.8"/><circle cx="20" cy="6" r="1.8"/><circle cx="20" cy="18" r="1.8"/></g>',
  de: '<rect x="4" y="4" width="16" height="16" rx="3" fill="#d62828" stroke="#7a1010"/><g fill="#fff"><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></g>',
  suite: '<path d="M20 4L4 12l16 8" fill="none" stroke="#2e8b57" stroke-width="2.4"/>',
  integ: '<path d="M3 19c3-10 7-12 11-12s5 2 7 3v9z" fill="#9ec0f4" stroke="#1b5fbf" stroke-width="1.5"/>',
  ineq: '<path d="M3 6l18 10v5H3z" fill="#9ec0f4" stroke="#1b5fbf" stroke-width="1.4"/><path d="M3 18l18-12" stroke="#d62828" stroke-width="1.4"/>',
  impl: '<ellipse cx="12" cy="12" rx="9" ry="5" fill="none" stroke="#7a2a8a" stroke-width="2"/>',
  tab: '<rect x="3" y="4" width="18" height="16" fill="#fff" stroke="#333"/><path d="M3 9h18M3 14h18M8 4v16" stroke="#333"/><path d="M11 18l7-3" stroke="#d62828" stroke-width="1.4"/>',
  rap: '<circle cx="12" cy="12" r="9" fill="none" stroke="#333"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" stroke="#8a2a2a" stroke-width=".8"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2" fill="#dfe6ee" stroke="#333"/><rect x="7" y="5" width="10" height="4" fill="#fff" stroke="#333" stroke-width=".7"/><g fill="#333"><circle cx="8.5" cy="13" r="1"/><circle cx="12" cy="13" r="1"/><circle cx="15.5" cy="13" r="1"/><circle cx="8.5" cy="17" r="1"/><circle cx="12" cy="17" r="1"/><circle cx="15.5" cy="17" r="1"/></g>',
  fp: '<text x="12" y="17" font-size="15" font-style="italic" text-anchor="middle" font-family="serif">f′</text>',
  F: '<text x="12" y="18" font-size="16" font-weight="bold" text-anchor="middle" font-family="sans-serif">F</text>',
  globe: '<circle cx="12" cy="12" r="9" fill="none" stroke="#0a7a3a" stroke-width="2"/><path d="M12 3v18M3 12h18M5 7c4 2 10 2 14 0M5 17c4-2 10-2 14 0" fill="none" stroke="#1b5fbf" stroke-width="1.2"/>',
  poi: '<g fill="#7bd88f" stroke="#1d6b34"><rect x="3" y="6" width="3" height="14"/><rect x="7" y="3" width="3" height="17"/><rect x="11" y="8" width="3" height="12"/><rect x="15" y="14" width="3" height="6"/><rect x="19" y="18" width="3" height="2"/></g>',
  expo: '<path d="M3 4c2 10 6 14 18 15" fill="none" stroke="#d62828" stroke-width="2"/><path d="M3 20h18" stroke="#333"/>',
  zin: '<circle cx="10" cy="10" r="6" fill="#fff" stroke="#333" stroke-width="1.6"/><path d="M15 15l6 6M7 10h6M10 7v6" stroke="#333" stroke-width="1.6"/>',
  zout: '<circle cx="10" cy="10" r="6" fill="#fff" stroke="#333" stroke-width="1.6"/><path d="M15 15l6 6M7 10h6" stroke="#333" stroke-width="1.6"/>',
  grid: '<path d="M3 3l18 18M3 9l12 12M9 3l12 12" stroke="#333" stroke-width="1.8"/>',
  undo: '<path d="M9 7L4 11l5 4M4 11h10a5 5 0 010 10h-3" fill="none" stroke="#333" stroke-width="2"/>',
  redo: '<path d="M15 7l5 4-5 4M20 11H10a5 5 0 000 10h3" fill="none" stroke="#333" stroke-width="2"/>'
};
const svgIcon = k => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', 23); s.setAttribute('height', 23); s.innerHTML = IC[k]; return s; };

const DLGHELP = {
  'Fonctions f(x)': 'Saisissez jusqu’à 10 fonctions. Cochez la zone « courbe dessinée » en laissant l’expression non vide ; invisible = style « Invisible ».',
  'Repère': 'Les longueurs sont en cm, comme dans la version Windows. Vous pouvez aussi glisser l’origine et les unités à la souris dans le dessin.'
};
function gotoSection(title, titleDlg) { openDlg([title], { title: titleDlg || title, help: DLGHELP[title] }); }
function copyPng() {
  const d = state.doc, dpi = 150, wpx = Math.round(d.W / 25.4 * dpi), hpx = Math.round(d.H / 25.4 * dpi);
  const svg = buildSvg(d, buildCtx(d), {}).replace(/width="[^"]*mm" height="[^"]*mm"/, `width="${wpx}" height="${hpx}"`), img = new Image();
  img.onload = () => {
    const c = h('canvas', { width: wpx, height: hpx }), x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, wpx, hpx); x.drawImage(img, 0, 0, wpx, hpx);
    c.toBlob(b => { try { navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]).then(() => toast('Image copiée : collez-la dans votre traitement de texte (Ctrl+V).'), () => download(b, fileBase() + '.png')); } catch (e) { download(b, fileBase() + '.png'); } }, 'image/png');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function styleToggle(flag) {
  const T = state.doc.texts; if (!T.length) { toast('Ajoutez d’abord un texte (bouton ab|).'); return; }
  const t = T[T.length - 1], on = new Set(); if (/gras|bold/.test(t.style || '')) on.add('gras'); if (/ital/.test(t.style || '')) on.add('italique'); if (/soul/.test(t.style || '')) on.add('souligné');
  on.has(flag) ? on.delete(flag) : on.add(flag); t.style = [...on].join(' ') || 'normal'; buildPanel(); redraw(); commit();
}
const addText = () => openDlg(['Textes'], { prep: d => { const g = geom(d); d.texts.push({ txt: 'Texte', x: g.xOf(d.dOy + 10), y: g.yOf(d.dOx - 10), font: 'Times New Roman', size: 12, col: 0, style: 'normal' }); } });
const addLatex = () => openDlg(['Expressions LaTeX'], { prep: d => { const g = geom(d); d.latex.push({ pre: '   3$ ', size: 3, src: '\\frac{a}{b}+\\sqrt{x^2+1}', x: g.xOf(d.dOy + 10), y: g.yOf(d.dOx - 20) }); } });
const ex = (t, kind, title) => () => openDlg(['Compléments'], { type: t, kind, title: title || EX[t].label, prep: d => { if (!d.extras.some(e => e.type === t && (!kind || e.kind === kind))) { const e = Object.assign({ type: t }, EX[t].def()); if (kind) e.kind = kind; if (EX[t].init) EX[t].init(e); d.extras.push(e); } } });
const go = (t, title) => () => gotoSection(t, title);

function chromeSpec() {
  const A = {
    nouveau: ['Nouveau', 'Nouveau dessin', newDocument, 'new'], ouvrir: ['Ouvrir…', 'Ouvrir un dessin (.sqn)', () => $('#file').click(), 'open', 'Ctrl+O'],
    enreg: ['Enregistrer', 'Enregistrer le dessin', saveSqn, 'save', 'Ctrl+S'], sqn: ['Exporter en .sqn (version Windows)', 'Exporter pour la version Windows', () => exportSqnOnly(false), 'export'],
    copier: ['Copier l’image', 'Copier le dessin comme image', copyPng, 'copy'], png: ['Exporter en PNG', 'Image PNG', exportPng], svg: ['Exporter en SVG', 'Image vectorielle', exportSvg],
    imprimer: ['Imprimer / PDF…', 'Imprimer à l’échelle réelle', printDoc, 'print', 'Ctrl+P'],
    undo: ['Annuler', 'Annuler', undo, 'undo', 'Ctrl+Z'], redo: ['Rétablir', 'Rétablir', redo, 'redo', 'Ctrl+Y'],
    zin: ['Zoom avant', 'Zoom avant', () => setZoom(state.doc.zoom + 25), 'zin'], zout: ['Zoom arrière', 'Zoom arrière', () => setZoom(state.doc.zoom - 25), 'zout'],
    zfit: ['Ajuster à la largeur', 'Ajuster à la largeur', fitZoom], z100: ['Zoom 100 %', 'Zoom 100 %', () => setZoom(100)],
    aide: ['Aide', 'Aide', showHelp], apropos: ['À propos', 'À propos', () => toast('Sine qua non en ligne — réécriture du logiciel de Patrice Rabiller et Patrick Pradeau. Les dessins .sqn de la version Windows s’ouvrent directement.', 7000)]
  };
  const D = (label, title, fn, icon) => [label, title, fn, icon];
  const menus = [
    ['Fichier', [A.nouveau, A.ouvrir, A.enreg, A.sqn, '-', A.copier, A.png, A.svg, A.imprimer]],
    ['Définir', [D('Page…', 'Page', go('Page')), D('Repère…', 'Repère', go('Repère')), D('Fonctions f(x)…', '', go('Fonctions f(x)')), D('Courbes paramétrées…', '', go('Courbes paramétrées')), D('Courbes polaires…', '', go('Courbes polaires')),
      D('Droites…', '', go('Droites')), D('Famille de fonctions…', '', go('Famille de fonctions')), D('Points et segments…', '', go('Points et segments')), '-', D('Texte', '', addText), D('Expression LaTeX', '', addLatex), D('Rapporteur trigonométrique…', '', go('Rapporteur trigonométrique'))]],
    ['Outils', [A.undo, A.redo, '-', A.zin, A.zout, A.zfit, A.z100, '-', ...Object.entries(EX).map(([k, T]) => D('Ajouter : ' + T.label, '', ex(k)))]],
    ['Calculs', [D('Résoudre une équation…', '', go('Calculs', 'Calculs')), D('Table de valeurs…', '', go('Calculs', 'Calculs')), D('Intégrale approchée…', '', go('Calculs', 'Calculs')), '-', D('Dérivée', '', ex('deriv')), D('Primitive', '', ex('prim')), D('Statistiques à une variable', '', ex('stat1')), D('Statistiques à deux variables', '', ex('stat2')), D('Lois de probabilité', '', ex('loi')), D('Simulation', '', () => { ex('stat1')(); })]],
    ['?', [A.aide, A.apropos]]
  ];
  const B = (title, icon, fn) => ({ title, icon, fn }), SEP = { sep: 1 };
  const bar = [A.nouveau, A.ouvrir, A.imprimer, A.enreg, A.sqn, SEP, B('Copier le dessin comme image', 'copy', copyPng), SEP,
    B('Expression LaTeX', 'tex', addLatex), B('Texte', 'text', addText), SEP, { fmt: 1 }, SEP,
    B('Définir le repère', 'axes', go('Repère', 'Définir le repère')), B('Liste des fonctions', 'fn', go('Fonctions f(x)', 'Liste des fonctions')), B('Liste des courbes paramétrées', 'param', go('Courbes paramétrées', 'Liste des courbes paramétrées')),
    B('Liste des courbes polaires r=f(t)', 'polar', go('Courbes polaires', 'Liste des courbes polaires r=f(t)')), B('Famille de fonctions', 'fam', go('Famille de fonctions')),
    B('Objets du schéma : figures géométriques', 'shape', ex('shape', null, 'Objets du schéma')), B('Droites', 'lines', go('Droites')), B('Courbe point par point', 'prim', ex('pbp')),
    B('Statistiques à une variable', 'stat1', ex('stat1')), B('Statistiques à 2 variables', 'stat2', ex('stat2')),
    B('Loi binomiale', 'histo', ex('loi', 'bin', 'Loi binomiale')), B('Loi de Poisson', 'poi', ex('loi', 'poi', 'Loi de Poisson')), B('Loi normale', 'loi', ex('loi', 'nor', 'Loi normale')), B('Loi exponentielle', 'expo', ex('loi', 'exp', 'Loi exponentielle')),
    B('Simulations statistiques', 'de', ex('stat1', null, 'Simulations statistiques')), B('Tableau de signes ou de variations', 'tab', ex('tab')), B('Suites numériques', 'suite', ex('suite')),
    B('Intégrale d’une fonction', 'integ', ex('integ')), B('Inéquations', 'ineq', ex('ineq')), B('Courbe dérivée', 'fp', ex('deriv')), B('Primitive', 'F', ex('prim')),
    B('Rapporteur trigonométrique ou géométrique', 'rap', go('Rapporteur trigonométrique', 'Rapporteur trigonométrique ou géométrique')), SEP,
    { zoom: 1 }, B('Quadrillage', 'grid', go('Repère', 'Définir le repère')), A.zin, A.zout, { coords: 1 }];
  return { menus, bar };
}

function buildChrome() {
  const { menus, bar } = chromeSpec(), mb = $('#menubar'), ib = $('#iconbar'); let open = null;
  const closeAll = () => { mb.querySelectorAll('.menu.open').forEach(m => m.classList.remove('open')); open = null; };
  menus.forEach(([name, items]) => {
    const m = h('div', { class: 'menu' }), b = h('button', { class: 'mt', type: 'button' }, name), dd = h('div', { class: 'dd' });
    items.forEach(it => { if (it === '-') dd.append(h('hr')); else dd.append(h('button', { type: 'button', class: 'mi', onclick: () => { closeAll(); it[2](); } }, h('span', null, it[0]), it[4] ? h('kbd', null, it[4]) : null)); });
    b.onclick = e => { e.stopPropagation(); const was = m.classList.contains('open'); closeAll(); if (!was) { m.classList.add('open'); open = m; } };
    b.onmouseenter = () => { if (open && open !== m) { closeAll(); m.classList.add('open'); open = m; } };
    m.append(b, dd); mb.append(m);
  });
  document.addEventListener('click', closeAll);
  bar.forEach(it => {
    if (it.sep) ib.append(h('span', { class: 'sep' }));
    else if (it.fmt) { ib.append(h('span', { class: 'fontname' }, 'Times-12'), ...[['G', 'gras', 'Gras (dernier texte)'], ['I', 'italique', 'Italique (dernier texte)'], ['S', 'souligné', 'Souligné (dernier texte)']].map(([l, f, t]) => h('button', { class: 'ib txt', type: 'button', title: t, onclick: () => styleToggle(f), style: f === 'gras' ? 'font-weight:bold' : f === 'italique' ? 'font-style:italic' : 'text-decoration:underline' }, l))); }
    else if (it.zoom) {
      const sel = h('select', { id: 'zoomsel', title: 'Zoom', onchange: e => setZoom(+e.target.value) }, [25, 50, 75, 100, 125, 150, 200, 300, 400].map(z => h('option', { value: z }, z + ' %'))); ib.append(sel);
    } else if (it.coords) ib.append(h('span', { id: 'coords' }, 'X=—  Y=—'));
    else { const title = Array.isArray(it) ? it[1] : it.title, icon = Array.isArray(it) ? it[3] : it.icon, fn = Array.isArray(it) ? it[2] : it.fn; ib.append(h('button', { class: 'ib', type: 'button', title, onclick: fn }, svgIcon(icon))); }
  });
  $('#stage').addEventListener('pointermove', e => {
    const svg = $('#paper').firstElementChild; if (!svg) return; const r = svg.getBoundingClientRect(), d = state.doc;
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    const g = geom(d), mx = (e.clientX - r.left) / r.width * d.W, my = (e.clientY - r.top) / r.height * d.H, f = v => Number.isFinite(v) ? v.toFixed(2).replace('.', ',') : '—';
    $('#coords').textContent = `X=${f(g.xOf(mx))}  Y=${f(g.yOf(my))}`;
  });
}
