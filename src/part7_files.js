/* ===== Exports d'image (jpg, bmp, gif, emf, wmf, eps), Réouvrir, Ouvrir exemple ===== */
function _rasterize(dpi, cb) {
  const d = state.doc, wpx = Math.round(d.W / 25.4 * dpi), hpx = Math.round(d.H / 25.4 * dpi);
  const svg = buildSvg(d, buildCtx(d), {}).replace(/width="[^"]*mm" height="[^"]*mm"/, `width="${wpx}" height="${hpx}"`);
  const img = new Image();
  img.onload = () => { const c = document.createElement('canvas'); c.width = wpx; c.height = hpx; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, wpx, hpx); x.drawImage(img, 0, 0, wpx, hpx); cb(c, wpx, hpx); };
  img.onerror = () => toast('Export impossible dans ce navigateur : utilisez l’export SVG.');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const u32 = (a, v) => { a.push(v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255); }, u16 = (a, v) => { a.push(v & 255, (v >>> 8) & 255); };
function rgbOf(c, w, h) { const px = c.getContext('2d').getImageData(0, 0, w, h).data, o = new Uint8Array(w * h * 3); for (let i = 0, j = 0; i < px.length; i += 4, j += 3) { o[j] = px[i]; o[j + 1] = px[i + 1]; o[j + 2] = px[i + 2]; } return o; }
function dibOf(rgb, w, h) { // BITMAPINFOHEADER + pixels BGR de bas en haut, lignes alignées sur 4 octets
  const row = (w * 3 + 3) & ~3, a = []; u32(a, 40); u32(a, w); u32(a, h); u16(a, 1); u16(a, 24); u32(a, 0); u32(a, row * h); u32(a, 3780); u32(a, 3780); u32(a, 0); u32(a, 0);
  const o = new Uint8Array(40 + row * h); o.set(a, 0);
  for (let y = 0; y < h; y++) { let p = 40 + (h - 1 - y) * row; for (let x = 0; x < w; x++) { const i = (y * w + x) * 3; o[p++] = rgb[i + 2]; o[p++] = rgb[i + 1]; o[p++] = rgb[i]; } }
  return o;
}
function bmpFile(rgb, w, h) { const dib = dibOf(rgb, w, h), a = [0x42, 0x4D]; u32(a, 14 + dib.length); u32(a, 0); u32(a, 54); const o = new Uint8Array(14 + dib.length); o.set(a, 0); o.set(dib, 14); return o; }
function lzwEncode(idx, minCode) {
  const clear = 1 << minCode, eoi = clear + 1; let size = minCode + 1, next = eoi + 1, cur = 0, nb = 0; const out = [];
  const emit = c => { cur |= c << nb; nb += size; while (nb >= 8) { out.push(cur & 255); cur >>>= 8; nb -= 8; } };
  let dict = new Map(); emit(clear); let pre = idx[0];
  for (let i = 1; i < idx.length; i++) {
    const k = idx[i], key = pre * 256 + k, v = dict.get(key);
    if (v !== undefined) { pre = v; continue; }
    emit(pre); if (next > (1 << size) - 1 && size < 12) size++;
    dict.set(key, next++); pre = k;
    if (next >= 4096) { emit(clear); dict = new Map(); next = eoi + 1; size = minCode + 1; }
  }
  emit(pre); if (next > (1 << size) - 1 && size < 12) size++; emit(eoi); if (nb > 0) out.push(cur & 255);
  return out;
}
function gifFile(rgb, w, h) { // palette : cube 6×6×6 (216 couleurs) + 40 gris
  const pal = []; for (let r = 0; r < 6; r++) for (let g = 0; g < 6; g++) for (let b = 0; b < 6; b++) pal.push(r * 51, g * 51, b * 51);
  for (let i = 0; i < 40; i++) { const v = Math.round(i * 255 / 39); pal.push(v, v, v); }
  const idx = new Uint8Array(w * h);
  for (let i = 0, j = 0; i < idx.length; i++, j += 3) {
    const R = rgb[j], G = rgb[j + 1], B = rgb[j + 2], cr = Math.round(R / 51), cg = Math.round(G / 51), cb = Math.round(B / 51);
    const e1 = (R - cr * 51) ** 2 + (G - cg * 51) ** 2 + (B - cb * 51) ** 2, gv = Math.round((R + G + B) / 3 * 39 / 255), gg = Math.round(gv * 255 / 39), e2 = (R - gg) ** 2 + (G - gg) ** 2 + (B - gg) ** 2;
    idx[i] = e2 < e1 ? 216 + gv : cr * 36 + cg * 6 + cb;
  }
  const a = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]; u16(a, w); u16(a, h); a.push(0xF7, 0, 0); pal.forEach(v => a.push(v));
  a.push(0x2C); u16(a, 0); u16(a, 0); u16(a, w); u16(a, h); a.push(0, 8);
  const data = lzwEncode(idx, 8); for (let i = 0; i < data.length; i += 255) { const n = Math.min(255, data.length - i); a.push(n); for (let k = 0; k < n; k++) a.push(data[i + k]); }
  a.push(0, 0x3B); return new Uint8Array(a);
}
function emfFile(rgb, w, h, wmm, hmm) {
  const dib = dibOf(rgb, w, h), bmi = 40, bits = dib.length - 40, rec = 80 + dib.length, recP = (rec + 3) & ~3, hdr = 100, eof = 20, total = hdr + recP + eof, a = [];
  u32(a, 1); u32(a, hdr); [0, 0, w - 1, h - 1].forEach(v => u32(a, v)); [0, 0, Math.round(wmm * 100), Math.round(hmm * 100)].forEach(v => u32(a, v));
  u32(a, 0x464D4520); u32(a, 0x10000); u32(a, total); u32(a, 3); u16(a, 1); u16(a, 0); u32(a, 0); u32(a, 0); u32(a, 0);
  u32(a, 1024); u32(a, 768); u32(a, 320); u32(a, 240); u32(a, 0); u32(a, 0); u32(a, 0);
  u32(a, 81); u32(a, recP); [0, 0, w - 1, h - 1].forEach(v => u32(a, v)); [0, 0, 0, 0, w, h].forEach(v => u32(a, v)); u32(a, 80); u32(a, bmi); u32(a, 80 + bmi); u32(a, bits); u32(a, 0); u32(a, 0x00CC0020); u32(a, w); u32(a, h);
  const o = new Uint8Array(total); o.set(a, 0); o.set(dib, a.length);
  const e = []; u32(e, 14); u32(e, 20); u32(e, 0); u32(e, 16); u32(e, 20); o.set(e, hdr + recP); return o;
}
function wmfFile(rgb, w, h, dpi) {
  const dib = dibOf(rgb, w, h), a = []; u16(a, 1); u16(a, 9); u16(a, 0x300); // en-tête standard (taille complétée plus bas)
  const recWords = 14 + dib.length / 2, orgW = 5, extW = 5, eofW = 3, totalW = 9 + orgW + extW + recWords + eofW;
  u32(a, totalW); u16(a, 0); u32(a, recWords); u16(a, 0);
  u32(a, orgW); u16(a, 0x020B); u16(a, 0); u16(a, 0); u32(a, extW); u16(a, 0x020C); u16(a, h); u16(a, w);
  u32(a, recWords); u16(a, 0x0F43); u32(a, 0x00CC0020); u16(a, 0); u16(a, h); u16(a, w); u16(a, 0); u16(a, 0); u16(a, h); u16(a, w); u16(a, 0); u16(a, 0);
  const pl = []; u32(pl, 0x9AC6CDD7); u16(pl, 0); u16(pl, 0); u16(pl, 0); u16(pl, w); u16(pl, h); u16(pl, dpi); u32(pl, 0);
  let ck = 0; for (let i = 0; i < 20; i += 2) ck ^= pl[i] | (pl[i + 1] << 8); u16(pl, ck);
  const o = new Uint8Array(pl.length + a.length + dib.length + 6); o.set(pl, 0); o.set(a, pl.length); o.set(dib, pl.length + a.length); const e = []; u32(e, 3); u16(e, 0); o.set(e, pl.length + a.length + dib.length); return o;
}
function ascii85(u8) { let o = ''; for (let i = 0; i < u8.length; i += 4) { const n = Math.min(4, u8.length - i); let v = 0; for (let k = 0; k < 4; k++) v = v * 256 + (k < n ? u8[i + k] : 0); if (v === 0 && n === 4) { o += 'z'; continue; } const s = []; for (let k = 4; k >= 0; k--) { s[k] = String.fromCharCode(33 + v % 85); v = Math.floor(v / 85); } o += s.slice(0, n + 1).join(''); if (o.length % 76 < 5) o += '\n'; } return o + '~>\n'; }
function epsFile(jpeg, w, h, wmm, hmm) {
  const wp = wmm / 25.4 * 72, hp = hmm / 25.4 * 72, f = n => n.toFixed(2);
  const head = `%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 ${Math.ceil(wp)} ${Math.ceil(hp)}\n%%HiResBoundingBox: 0 0 ${f(wp)} ${f(hp)}\n%%Creator: Sine qua non en ligne\n%%LanguageLevel: 2\n%%EndComments\nsave\n${f(wp)} ${f(hp)} scale\n/DeviceRGB setcolorspace\n<< /ImageType 1 /Width ${w} /Height ${h} /BitsPerComponent 8 /Decode [0 1 0 1 0 1] /ImageMatrix [${w} 0 0 ${-h} 0 ${h}] /DataSource currentfile /ASCII85Decode filter /DCTDecode filter >> image\n`;
  return new Blob([head, ascii85(jpeg), 'restore\n%%EOF\n'], { type: 'application/postscript' });
}
function exportImage(fmt) {
  const d = state.doc, wmm = d.W, hmm = d.H;
  if (fmt === 'png') return exportPng();
  const dpi = { jpg: 300, bmp: 300, gif: 200, emf: 150, wmf: 150, eps: 300 }[fmt];
  rasterize(dpi, (c, w, h) => {
    if (fmt === 'jpg') return c.toBlob(b => download(b, fileBase() + '.jpg'), 'image/jpeg', 0.95);
    if (fmt === 'eps') return c.toBlob(b => b.arrayBuffer().then(ab => download(epsFile(new Uint8Array(ab), w, h, wmm, hmm), fileBase() + '.eps')), 'image/jpeg', 0.95);
    const rgb = rgbOf(c, w, h);
    const bytes = fmt === 'bmp' ? bmpFile(rgb, w, h) : fmt === 'gif' ? gifFile(rgb, w, h) : fmt === 'emf' ? emfFile(rgb, w, h, wmm, hmm) : wmfFile(rgb, w, h, dpi);
    download(new Blob([bytes], { type: 'application/octet-stream' }), fileBase() + '.' + fmt);
  });
}
const exportJpg = () => exportImage('jpg'), exportBmp = () => exportImage('bmp'), exportGif = () => exportImage('gif'), exportEmf = () => exportImage('emf'), exportWmf = () => exportImage('wmf'), exportEps = () => exportImage('eps');

/* ----- Réouvrir : les 10 derniers dessins ----- */
function recentList() { try { return JSON.parse(localStorage.getItem('sqn_recent') || '[]'); } catch (e) { return []; } }
function rememberRecent(name, text) {
  try { let L = recentList().filter(r => r.name !== name); L.unshift({ name, text, ts: Date.now() }); L = L.slice(0, 10); localStorage.setItem('sqn_recent', JSON.stringify(L)); } catch (e) { /* quota */ }
}
function pickDialog(title, entries, onPick, empty) {
  const dlg = document.createElement('dialog'); dlg.className = 'pick';
  dlg.innerHTML = `<div class="dh"><span></span><button type="button" title="Fermer">✕</button></div><div class="pk-body"></div>`;
  dlg.querySelector('.dh span').textContent = title; const body = dlg.querySelector('.pk-body');
  if (!entries.length) body.append(Object.assign(document.createElement('p'), { textContent: empty || 'Aucun élément.' }));
  entries.forEach(en => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn pk-item'; b.textContent = en.label; b.onclick = () => { dlg.close(); dlg.remove(); onPick(en); }; body.append(b); });
  dlg.querySelector('button').onclick = () => { dlg.close(); dlg.remove(); }; dlg.addEventListener('cancel', () => dlg.remove());
  document.body.append(dlg); dlg.showModal();
}
function reopenRecent() {
  pickDialog('Réouvrir : derniers dessins', recentList().map(r => ({ label: r.name + '  —  ' + new Date(r.ts).toLocaleString('fr-FR'), r })), en => {
    if (state.dirty && !confirm('Le dessin en cours n’est pas enregistré. Continuer ?')) return;
    loadDoc(docFromText(en.r.text, en.r.name), en.r.name); toast('« ' + en.r.name + ' » rouvert.');
  }, 'Aucun dessin enregistré ou ouvert récemment dans ce navigateur.');
}
function openExample() {
  pickDialog('Ouvrir un exemple', Object.keys(EXAMPLES).map(n => ({ label: n.replace(/_/g, ' '), n })), en => {
    if (state.dirty && !confirm('Le dessin en cours n’est pas enregistré. Continuer ?')) return;
    const d = docFromText(EXAMPLES[en.n], en.n); loadDoc(d, en.n);
  });
}

function rasterize(dpi, cb) { schWarm(() => _rasterize(dpi, cb)); }
