// Real photographs for Class 1–10 learners (pre-primary keeps the 3D emoji pictures).
//
// Only freely licensed images with a known licence are used: Wikimedia Commons (CC0 / public domain / CC BY / CC BY-SA)
// and, as a fallback, Openverse (same licences only). Every choice was reviewed by eye and is recorded in
// scripts/photo-picks.json, so the build is reproducible.
//
//   node scripts/fetch-photos.mjs search [key…]      find candidates for each concept → <cache>/candidates.json + thumbnails
//   node scripts/fetch-photos.mjs openverse key…     add Openverse candidates for some concepts
//   node scripts/fetch-photos.mjs extra key "query"  add Commons candidates from a custom search
//   node scripts/fetch-photos.mjs sheet              contact sheets of the candidates (for reviewing) → <cache>/sheets/
//   node scripts/fetch-photos.mjs pick key=N …       record candidate N (1-based, as numbered on the sheet) in photo-picks.json
//   node scripts/fetch-photos.mjs build              download the picked photos, crop to 256×256 webp, write index.json + credits.json
//
// Cache directory: $PHOTO_CACHE or .photo-cache/ (git-ignored).
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { CONCEPTS, GLYPHS } from './photo-concepts.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cache = resolve(process.env.PHOTO_CACHE || join(root, '.photo-cache'));
const out = join(root, 'android/shared/src/commonMain/composeResources/files/photos');
const emojiIndex = JSON.parse(readFileSync(join(root, 'android/shared/src/commonMain/composeResources/files/emoji/index.json'), 'utf8'));
const picksFile = join(root, 'scripts/photo-picks.json');
const candFile = join(cache, 'candidates.json');
const UA = 'WonderLabAssetBuilder/1.0 (offline educational app; picture asset build script)';
const SIZE = 256;

mkdirSync(join(cache, 'thumbs'), { recursive: true });
const norm = (e) => e.replace(/️/g, '');
const concepts = Object.fromEntries(Object.entries(CONCEPTS).map(([e, v]) => [norm(e), { emoji: e, key: v[0], term: v[1], wiki: v[2] }]));
const byKey = Object.fromEntries(Object.values(concepts).map((c) => [c.key, c]));
const glyphs = new Set(Object.values(GLYPHS).flat().map(norm));
const load = (f, d) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : d);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wikimedia rate-limits bursts: requests to each host are serialised with a gap (API hosts get a long one), and
// 429s back off, honouring Retry-After.
const lastCall = {};
async function get(url, json = true, tries = 8) {
  const host = new URL(url).host; const gap = /api|w\/api/.test(url) && !/upload\./.test(host) ? 1500 : 150;
  for (let i = 0; ; i++) {
    const prev = lastCall[host] ?? 0; const wait = prev + gap - Date.now(); lastCall[host] = Math.max(Date.now(), prev + gap);
    if (wait > 0) await sleep(wait);
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA } });
    if (r.ok) return json ? r.json() : Buffer.from(await r.arrayBuffer());
    if (i >= tries || ![429, 500, 502, 503, 504].includes(r.status)) throw new Error(`${r.status} ${url}`);
    await sleep(1000 * (Number(r.headers.get('retry-after')) || 5 * (i + 1)));
  }
}

const LICENCE_OK = /^(cc0|cc-zero|public domain|pd\b|pdm|cc[ -]by(-sa)?[ -]\d)/i;
const strip = (h) => String(h ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

async function commons(query, limit) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({
    action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrlimit: String(limit * 3),
    gsrsearch: `${query} filetype:bitmap -drawing -illustration -painting -logo -map -diagram`,
    prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: '360',
    iiextmetadatafilter: 'LicenseShortName|Artist|ObjectName|LicenseUrl|Credit',
  }).forEach(([k, v]) => u.searchParams.set(k, v));
  const j = await get(u);
  const pages = Object.values(j.query?.pages ?? {}).sort((a, b) => a.index - b.index);
  const res = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0]; const md = ii?.extmetadata ?? {};
    const lic = strip(md.LicenseShortName?.value);
    if (!ii || !/jpeg|png|webp/.test(ii.mime) || ii.width < 300 || ii.height < 300 || !LICENCE_OK.test(lic)) continue;
    res.push({
      source: 'commons', id: p.title, title: strip(md.ObjectName?.value) || p.title.replace(/^File:|\.\w+$/g, ''),
      author: strip(md.Artist?.value) || 'Unknown', licence: lic, licenceUrl: md.LicenseUrl?.value ?? '',
      page: ii.descriptionurl, thumb: ii.thumburl, w: ii.width, h: ii.height,
    });
    if (res.length >= limit) break;
  }
  return res;
}

/** Commons metadata for a list of "File:…" titles (licence-filtered), in the given order. */
async function commonsInfo(titles) {
  const res = [];
  for (let i = 0; i < titles.length; i += 40) {
    const u = new URL('https://commons.wikimedia.org/w/api.php');
    Object.entries({
      action: 'query', format: 'json', titles: titles.slice(i, i + 40).join('|'), prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: '360',
      iiextmetadatafilter: 'LicenseShortName|Artist|ObjectName|LicenseUrl',
    }).forEach(([k, v]) => u.searchParams.set(k, v));
    const j = await get(u);
    const byTitle = Object.fromEntries(Object.values(j.query?.pages ?? {}).map((p) => [p.title, p]));
    const alias = Object.fromEntries((j.query?.normalized ?? []).map((n) => [n.from, n.to]));
    for (const t of titles.slice(i, i + 40)) {
      const p = byTitle[alias[t] ?? t]; const ii = p?.imageinfo?.[0]; const md = ii?.extmetadata ?? {};
      const lic = strip(md.LicenseShortName?.value);
      if (!ii || !/jpeg|png|webp/.test(ii.mime) || ii.width < 300 || ii.height < 300 || !LICENCE_OK.test(lic)) continue;
      res.push({
        source: 'commons', id: p.title, title: strip(md.ObjectName?.value) || p.title.replace(/^File:|\.\w+$/g, ''),
        author: strip(md.Artist?.value) || 'Unknown', licence: lic, licenceUrl: md.LicenseUrl?.value ?? '',
        page: ii.descriptionurl, thumb: ii.thumburl, w: ii.width, h: ii.height,
      });
    }
  }
  return res;
}

/** Photos illustrating the best-matching English Wikipedia article (lead image first) — curated and on-topic. */
async function wikipedia(query, limit) {
  const api = 'https://en.wikipedia.org/w/api.php?format=json&';
  const j = await get(api + new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: query, gsrlimit: '1', prop: 'pageimages|images', piprop: 'name', pilicense: 'free', imlimit: '60' }));
  const page = Object.values(j.query?.pages ?? {})[0]; if (!page) return [];
  const files = (page.images ?? []).map((i) => i.title.replace(/^[^:]+:/, 'File:')).filter((t) => /\.(jpe?g|png)$/i.test(t) && !/icon|logo|map|symbol|flag|stub|diagram|chart/i.test(t));
  const lead = page.pageimage ? [`File:${page.pageimage.replace(/_/g, ' ')}`] : [];
  const order = [...new Set([...lead, ...files])];
  return (await commonsInfo(order)).slice(0, limit);
}

async function openverse(query, limit) {
  const u = new URL('https://api.openverse.org/v1/images/');
  Object.entries({ q: query, license: 'cc0,pdm,by,by-sa', category: 'photograph', page_size: String(limit * 2), mature: 'false' })
    .forEach(([k, v]) => u.searchParams.set(k, v));
  const j = await get(u);
  return (j.results ?? []).filter((r) => (r.width ?? 999) >= 300).slice(0, limit).map((r) => ({
    source: 'openverse', id: `openverse:${r.id}`, title: r.title || 'Untitled', author: r.creator || 'Unknown',
    licence: r.license === 'cc0' ? 'CC0' : r.license === 'pdm' ? 'Public domain' : `CC ${r.license.toUpperCase()} ${r.license_version ?? ''}`.trim(),
    licenceUrl: r.license_url ?? '', page: r.foreign_landing_url, thumb: r.thumbnail || r.url, full: r.url, w: r.width, h: r.height,
  }));
}

const thumbPath = (c) => join(cache, 'thumbs', `${Buffer.from(c.id).toString('base64url').slice(0, 120)}.img`);
async function ensureThumb(c) {
  const p = thumbPath(c);
  if (!existsSync(p)) { try { writeFileSync(p, await get(c.thumb, false)); } catch (e) { console.warn('  thumb failed', c.id, e.message); return false; } }
  return true;
}

async function search(keys) {
  const cand = load(candFile, {});
  const list = keys.length ? keys.map((k) => byKey[k]).filter(Boolean) : Object.values(concepts);
  const queue = list.filter((c) => keys.length || !cand[c.key]?.some((r) => !r.wiki));
  await Promise.all(Array.from({ length: 4 }, async () => { for (let c; (c = queue.shift());) await one(c); }));
  async function one(c) {
    const seen = new Set(); const all = [];
    for (const [q, n] of [[`${c.term} isolated`, 3], [`${c.term} incategory:Quality_images`, 3], [c.term, 4]]) {
      try { for (const r of await commons(q, n)) if (!seen.has(r.id)) { seen.add(r.id); all.push(r); } } catch (e) { console.warn('  search failed', q, e.message); }
    }
    const ok = [];
    for (const r of all.slice(0, 8)) if (await ensureThumb(r)) ok.push(r);
    cand[c.key] = [...(cand[c.key] ?? []).filter((r) => r.wiki), ...ok.filter((r) => !(cand[c.key] ?? []).some((w) => w.id === r.id))].slice(0, 12);
    writeFileSync(candFile, JSON.stringify(cand, null, 1));
    console.log(`${c.emoji} ${c.key}: ${ok.length}`);
  }
}

async function addMore(key, fn) {
  const cand = load(candFile, {});
  const have = new Set((cand[key] ?? []).map((r) => r.id));
  const add = [];
  for (const r of await fn()) if (!have.has(r.id) && (await ensureThumb(r))) add.push(r);
  cand[key] = [...add, ...(cand[key] ?? [])];
  writeFileSync(candFile, JSON.stringify(cand, null, 1));
  console.log(`${key}: +${add.length} (now ${cand[key].length})`);
}

const esc = (s) => s.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]);
async function sheets(keys) {
  const cand = load(candFile, {});
  const picks = load(picksFile, {});
  const dir = join(cache, 'sheets'); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const T = 150, COLS = 13, ROWS = 6;
  const todo = (keys.length ? keys : Object.keys(cand)).filter((k) => cand[k]);
  for (let s = 0; s * ROWS < todo.length; s++) {
    const rows = todo.slice(s * ROWS, s * ROWS + ROWS);
    const layers = [];
    for (let r = 0; r < rows.length; r++) {
      const k = rows[r];
      layers.push({ input: Buffer.from(`<svg width="${T}" height="${T}"><rect width="100%" height="100%" fill="#222"/><text x="6" y="40" font-size="22" font-family="Arial" fill="#fff">${esc(k)}</text><text x="6" y="70" font-size="13" font-family="Arial" fill="#aaa">${esc(byKey[k]?.term ?? '')}</text>${picks[k] ? `<text x="6" y="100" font-size="13" font-family="Arial" fill="#7f7">picked</text>` : ''}</svg>`), left: 0, top: r * T });
      for (const [i, c] of cand[k].slice(0, COLS - 1).entries()) {
        try {
          const img = await sharp(thumbPath(c)).resize(T - 4, T - 4, { fit: 'cover', position: sharp.strategy.attention }).png().toBuffer();
          layers.push({ input: img, left: (i + 1) * T + 2, top: r * T + 2 });
          layers.push({ input: Buffer.from(`<svg width="26" height="20"><rect width="26" height="20" fill="#000" opacity=".75"/><text x="5" y="15" font-size="15" font-family="Arial" fill="#ff0">${i + 1}</text></svg>`), left: (i + 1) * T + 2, top: r * T + 2 });
        } catch { /* unreadable thumbnail */ }
      }
    }
    await sharp({ create: { width: T * COLS, height: T * rows.length, channels: 3, background: '#444' } }).composite(layers).jpeg({ quality: 80 }).toFile(join(dir, `sheet-${String(s + 1).padStart(2, '0')}.jpg`));
  }
  console.log(`${Math.ceil(todo.length / ROWS)} sheets in ${dir}`);
}

function pick(args) {
  const cand = load(candFile, {});
  const picks = load(picksFile, {});
  for (const a of args) {
    const [key, spec] = a.split('=');
    const [n, pos] = spec.split(':');
    const c = cand[key]?.[Number(n) - 1];
    if (!byKey[key] || !c) { console.error('bad pick', a); continue; }
    picks[key] = { ...c, ...(pos === 'contain' ? { fit: 'contain' } : pos ? { position: pos } : {}) };
    delete picks[key].wiki;
    delete picks[key].w; delete picks[key].h;
  }
  const sorted = Object.fromEntries(Object.keys(picks).sort().map((k) => [k, picks[k]]));
  writeFileSync(picksFile, JSON.stringify(sorted, null, 1) + '\n');
  console.log(`${Object.keys(picks).length} picks`);
}

async function build() {
  const picks = load(picksFile, {});
  rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
  mkdirSync(join(cache, 'full'), { recursive: true });
  const index = {}; const credits = {}; const glyphList = []; const missing = [];
  for (const e of Object.keys(emojiIndex)) {
    const n = norm(e);
    if (glyphs.has(n)) { glyphList.push(e); continue; }
    const c = concepts[n]; const p = c && picks[c.key];
    if (!p) { missing.push(e); continue; }
    if (!credits[c.key]) {
      // the ~500 px Commons thumbnail is plenty for a sharp 256 px crop (Wikimedia only serves standard sizes)
      const full = thumbPath(p);
      if (!existsSync(full)) writeFileSync(full, await get(p.thumb, false));
      // crop: subject-centred ("attention") by default; picks may name a gravity (north, centre…) and a zoom-out
      // factor (contain inside a light frame) when the subject would otherwise be cut off
      const pos = p.position ? (sharp.gravity[p.position] ?? sharp.strategy[p.position]) : sharp.strategy.attention;
      const img = p.fit === 'contain'
        ? sharp(full).rotate().resize(SIZE, SIZE, { fit: 'contain', background: '#f4f4f2' })
        : sharp(full).rotate().resize(SIZE, SIZE, { fit: 'cover', position: pos });
      await img.webp({ quality: 74, effort: 6 }).toFile(join(out, `${c.key}.webp`));
      credits[c.key] = { title: p.title, author: p.author, licence: p.licence, licenceUrl: p.licenceUrl, source: p.page };
    }
    index[e] = c.key;
  }
  writeFileSync(join(out, 'index.json'), JSON.stringify(index));
  writeFileSync(join(out, 'credits.json'), JSON.stringify(Object.fromEntries(Object.keys(credits).sort().map((k) => [k, credits[k]])), null, 1));
  const bytes = readdirSync(out).reduce((s, f) => s + statSync(join(out, f)).size, 0);
  const mix = {};
  for (const v of Object.values(credits)) { const l = v.licence.replace(/ [\d.]+.*$/, ''); mix[l] = (mix[l] ?? 0) + 1; }
  console.log(`${Object.keys(credits).length} photos for ${Object.keys(index).length} emoji, ${(bytes / 1048576).toFixed(2)} MB`);
  console.log('licences:', mix);
  console.log(`kept as 3D (${glyphList.length}):`, glyphList.join(' '));
  if (missing.length) console.log(`no photo picked (${missing.length}):`, missing.join(' '));
}

const [mode, ...args] = process.argv.slice(2);
if (mode === 'search') await search(args);
else if (mode === 'openverse') for (const k of args) await addMore(k, () => openverse(byKey[k].term, 6));
else if (mode === 'wiki') {
  // prepend Wikipedia-article photos for the given concepts (or every concept), optionally "key=article search"
  const cand = load(candFile, {});
  const todo = (args.length ? args : Object.keys(byKey).filter((k) => !cand[k]?.some((r) => r.wiki))).map((a) => a.split('='));
  await Promise.all(Array.from({ length: 4 }, async () => {
    for (let t; (t = todo.shift());) {
      const [k, q] = t; const c = byKey[k]; if (!c) continue;
      try {
        const got = [];
        for (const r of await wikipedia(q ?? c.wiki ?? c.term, 6)) if (await ensureThumb(r)) got.push({ ...r, wiki: true });
        const ids = new Set(got.map((r) => r.id));
        cand[k] = [...got, ...(cand[k] ?? []).filter((r) => !ids.has(r.id) && !(q && r.wiki))].slice(0, 12);
        writeFileSync(candFile, JSON.stringify(cand, null, 1));
        console.log(`${k}: wiki ${got.length}`);
      } catch (e) { console.warn(k, e.message); }
    }
  }));
}
else if (mode === 'extra')await addMore(args[0], () => commons(args[1], Number(args[2] ?? 6)));
else if (mode === 'sheet') await sheets(args);
else if (mode === 'pick') pick(args);
else if (mode === 'build') await build();
else {
  // coverage check
  const un = Object.keys(emojiIndex).filter((e) => !glyphs.has(norm(e)) && !concepts[norm(e)]);
  console.log('emoji without a concept or glyph decision:', un.join(' ') || 'none');
}
