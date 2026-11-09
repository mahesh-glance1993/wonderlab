// Offline journeys through the real production build + service worker (Edge via playwright-core).
// Needs a production build served by wrangler (service workers do not run under the Vite dev server):
//   npm run build && npx wrangler dev --port 8795 --ip 127.0.0.1
//   npx wrangler d1 execute wonderlab --local --command "DELETE FROM rate_limits"
//   node tests/e2e/offline.mjs http://127.0.0.1:8795
import { chromium } from 'playwright-core';
import { mkdirSync, statSync } from 'node:fs';

const BASE = process.argv[2] || process.env.BASE_URL || 'http://127.0.0.1:8795';
const SHOTS = 'tests/e2e/shots/offline-';
mkdirSync('tests/e2e/shots', { recursive: true });
const results = [];
const ok = (c, n, d = '') => { results.push([c ? 'PASS' : 'FAIL', n, d]); console.log(c ? 'PASS' : 'FAIL', n, d ? `— ${d}` : ''); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rnd = Math.random().toString(36).slice(2, 7);
const PW = 'Garden2024';
const userA = `off_${rnd}`, userB = `offb_${rnd}`;

// closing a page that has just finished a download can reject an internal Playwright promise
process.on('unhandledRejection', (e) => { if (!/Target page, context or browser has been closed/.test(String(e))) console.error('unhandled', e); });
const browser = await chromium.launch({ channel: 'msedge', headless: true });

// ---------- helpers ----------
async function apiIn(page, path, opts = {}) {
  return page.evaluate(async ([p, o]) => {
    const r = await fetch('/api' + p, { method: o.method || (o.body ? 'POST' : 'GET'), headers: { 'Content-Type': 'application/json', 'X-WonderLab': '1' }, body: o.body ? JSON.stringify(o.body) : undefined });
    return { status: r.status, json: await r.json().catch(() => ({})) };
  }, [path, opts]);
}
async function register(page, username, learners) {
  await page.goto(BASE + '/signin');
  const r = await apiIn(page, '/auth/register', { body: { username, password: PW, securityQuestion: 0, securityAnswer: 'mango', keepSignedIn: true } });
  if (r.status !== 200) throw new Error('register ' + r.status + JSON.stringify(r.json));
  const ids = [];
  for (const [nickname, classLevel, ageBand] of learners) {
    const p = await apiIn(page, '/profiles', { body: { nickname, avatar: 'owl', classLevel, ageBand } });
    if (p.status !== 200) throw new Error('profile ' + p.status + JSON.stringify(p.json));
    ids.push(p.json.profile.id);
  }
  return ids;
}
const idbKeys = (page, prefix) => page.evaluate((p) => new Promise((res, rej) => {
  const r = indexedDB.open('wonderlab');
  r.onsuccess = () => { const q = r.result.transaction('kv').objectStore('kv').getAllKeys(); q.onsuccess = () => { res(q.result.map(String).filter((k) => k.startsWith(p))); r.result.close(); }; };
  r.onerror = () => rej(r.error);
}), prefix);
const idbGet = (page, key) => page.evaluate((k) => new Promise((res, rej) => {
  const r = indexedDB.open('wonderlab');
  r.onsuccess = () => { const q = r.result.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => { res(q.result); r.result.close(); }; };
  r.onerror = () => rej(r.error);
}), key);
const idbPut = (page, key, val) => page.evaluate(([k, v]) => new Promise((res, rej) => {
  const r = indexedDB.open('wonderlab');
  r.onsuccess = () => { const t = r.result.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => { res(true); r.result.close(); }; };
  r.onerror = () => rej(r.error);
}), [key, val]);
function watch(page, errs) {
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|favicon|401|404|Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(m.text())) errs.push(m.text()); });
  page.on('requestfailed', (r) => { if (/\/assets\//.test(r.url())) errs.push('asset failed: ' + r.url()); });
}
async function waitText(page, re, timeout = 15000) { await page.getByText(re).first().waitFor({ timeout }); }
/** Answer the current lesson question (choices or typed); returns once an attempt was queued. */
async function answerOnce(page, before) {
  for (let i = 0; i < 8; i++) {
    const objs = page.locator('.lq-countobj');
    if (await objs.count()) for (let j = 0; j < await objs.count(); j++) await objs.nth(j).click();
    const choice = page.locator('.choice:not(.is-wrong):not([aria-disabled="true"])');
    const input = page.locator('main input[type=text], main input[inputmode]').first();
    if (!(await objs.count())) {
      if (await choice.count()) await choice.first().click();
      else if (await input.count()) { await input.fill(String(i + 1), { timeout: 3000 }).catch(() => {}); }
    }
    const check = page.getByRole('button', { name: /^(Check|చూడు)/ });
    if (await check.count()) await check.first().click().catch(() => {});
    await sleep(500);
    if ((await idbKeys(page, 'q:')).filter((k) => k.includes(':attempt:')).length > before) return true;
  }
  return false;
}

/** Opens the first math practice item and records one attempt (offline-capable). */
async function lessonAttempt(page, prefix, nth) {
  await page.goto(BASE + '/learn?subject=math');
  const a = page.locator('a[href*="practice"]').nth(nth);
  await a.waitFor({ timeout: 15000 });
  await a.click();
  await page.locator('.lq-card, .choice, main input').first().waitFor({ timeout: 15000 });
  await sleep(800);
  return answerOnce(page, (await idbKeys(page, prefix)).filter((k) => k.includes(':attempt:')).length);
}

try {
  // =====================================================================================
  // 1. First online setup on a trusted device → "Ready offline"
  // =====================================================================================
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
  let page = await ctx.newPage();
  let errs = [];
  watch(page, errs);
  const [pidA] = await register(page, userA, [['Arjun', 7, '9-10'], ['Chinni', 0, '3-4']]);
  await page.goto(BASE + '/who');
  await page.getByRole('button', { name: /Arjun/ }).click();
  await waitText(page, 'Hi Arjun!');
  await waitText(page, /Getting ready for offline use/, 20000).then(() => ok(true, 'Automatic download starts after first online sign-in on a trusted device (progress shown)')).catch(() => ok(false, 'Automatic download starts after first online sign-in'));
  await page.screenshot({ path: SHOTS + '01-auto-download.png' });
  await page.goto(BASE + '/downloads');
  await waitText(page, /Open without internet/);
  ok(await page.getByText(/not a password|nothing secret is stored/).count() > 0, 'Downloads explains the offline window to the parent');
  // parent check (account was just created → already verified) then turn on
  if (await page.getByLabel('Parent password').count()) { await page.getByLabel('Parent password').first().fill(PW); await page.getByRole('button', { name: 'Continue' }).first().click(); }
  await page.getByRole('button', { name: 'Turn on offline use' }).click();
  await waitText(page, 'Ready offline', 180000);
  // the other learner's class keeps downloading in the background; let it finish
  for (let i = 0; i < 240 && await idbGet(page, 'pk:job'); i++) await sleep(500);
  ok(true, '"Ready offline" shown after every required file was verified in Cache Storage');
  const verify = await page.evaluate(async () => {
    const man = await (await fetch('/packs.json')).json();
    const ready = await (await (await caches.open('wl-meta')).match('/__wl/ready')).json();
    const c = await caches.open('wl-build-' + ready.build);
    const need = new Set(man.shell.files.concat(['/__wl/index.html']));
    for (const id of ['lessons-c5', 'games', 'physics-lab', 'art-studio', 'lang-telugu-english']) man.packs.find((p) => p.id === id).files.forEach((f) => need.add(f));
    const missing = [];
    for (const f of need) if (!(await c.match(f))) missing.push(f);
    const where = [];
    for (const f of missing) { for (const k of await caches.keys()) if (await (await caches.open(k)).match(f)) where.push(f + '@' + k); }
    const inst = await new Promise((res) => { const o = indexedDB.open('wonderlab'); o.onsuccess = () => { const q = o.result.transaction('kv').objectStore('kv').get('pk:installed'); q.onsuccess = () => res(q.result); }; });
    return { build: ready.build, man: man.build, n: need.size, missing, where, inst: inst && { build: inst.build, shell: inst.shell, packs: Object.keys(inst.packs) }, keys: await caches.keys(), persisted: await navigator.storage.persisted() };
  });
  ok(verify.build === verify.man && verify.missing.length === 0, `All ${verify.n} shell + Class 5 pack files are in the verified build cache`, verify.missing.length ? JSON.stringify(verify).slice(0, 900) : '');
  const ent = await idbGet(page, `ent:${(await apiIn(page, '/auth/me')).json.account.id}`);
  ok(!!ent && ent.days === 14 && !JSON.stringify(ent).match(/token|password|cookie/i) && ent.profileIds.includes(pidA), 'Offline entitlement stored in IndexedDB: 14 days, device-bound, no credentials', ent ? `expires in ${Math.round((ent.expiresAt - Date.now()) / 864e5)} days` : 'missing');
  const lsDump = await page.evaluate(() => JSON.stringify(Object.entries(localStorage)));
  ok(!/token|session|password/i.test(lsDump), 'No tokens or passwords in localStorage');
  await page.screenshot({ path: SHOTS + '02-ready.png' });
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  const accountId = ent.accountId;

  // =====================================================================================
  // 2. Offline: fresh page after closing everything → resumes learner; every route works
  // =====================================================================================
  await page.close().catch(() => {});
  await ctx.setOffline(true);
  page = await ctx.newPage(); errs = []; watch(page, errs);
  await page.goto(BASE + '/');
  await waitText(page, 'Hi Arjun!', 20000).then(() => ok(true, 'Offline: reopening the app URL in a fresh page resumes the last authorised learner')).catch(async () => { await page.screenshot({ path: SHOTS + 'zz-offline-home.png' }); ok(false, 'Offline: reopening the app URL resumes the learner'); });
  ok(await page.getByText('Offline · saved on this device').count() > 0, 'Offline status "Offline · saved on this device" shown');
  await page.goto(BASE + '/who');
  await page.locator('.who').first().waitFor({ timeout: 15000 }).catch(() => {});
  ok(await page.getByRole('button', { name: /Arjun/ }).count() > 0 && await page.getByRole('button', { name: /Chinni/ }).count() > 0, 'Offline profile picker lists the authorised learners');
  // Chinni (Nursery) was downloaded too, as "other classes become available as packs finish"
  const routes = ['/', '/learn?subject=math', '/learn?subject=physics', '/next', '/progress', '/downloads', '/lab', '/lab/circuit', '/lab/forces', '/lab/motion', '/lab/light', '/art', '/art/paint', '/art/color', '/art/trace', '/art/gallery',
    '/games', '/games/counting', '/games/shapes', '/games/patterns', '/games/numberline', '/games/fractions', '/games/logic', '/games/balance', '/games/circuits', '/lang', '/lang/english', '/lang/telugu', '/parent'];
  const bad = [];
  for (const r of routes) {
    await page.goto(BASE + r);
    await sleep(900);
    const txt = await page.locator('main').first().innerText().catch(() => '');
    const bar = await page.locator('.offline-bar').first().innerText().catch(() => '');
    if (/Oops! Something got mixed up|not downloaded on this device yet/.test(txt) || /Download required/.test(bar) || txt.length < 20) bad.push(r + (bar ? ' [' + bar.slice(0, 60) + ']' : ''));
  }
  ok(!bad.length, `Offline: all ${routes.length} routes open from the downloaded build with no missing chunk`, bad.join(', '));
  ok(!errs.some((e) => e.startsWith('asset failed')), 'Offline: no failed asset/chunk requests', errs.filter((e) => e.startsWith('asset failed')).slice(0, 3).join(' | '));
  errs.length = 0;

  // lesson item with local grading
  const attemptsBefore = (await idbKeys(page, `q:${accountId}:${pidA}:attempt:`)).length;
  await page.goto(BASE + '/learn?subject=math');
  const practice = page.locator('a[href*="practice"]').first();
  await practice.waitFor({ timeout: 15000 });
  await practice.click();
  await page.locator('.lq-card, .choice, main input').first().waitFor({ timeout: 15000 });
  const answered = await answerOnce(page, attemptsBefore);
  const fb = await page.locator('.feedback').count();
  ok(answered && fb > 0, 'Offline: answered a downloaded lesson item; graded locally with feedback');
  await page.screenshot({ path: SHOTS + '03-offline-lesson.png' });

  // game round
  await page.goto(BASE + '/games/patterns');
  await page.locator('.gm-options button').first().waitFor({ timeout: 15000 });
  const beforeGame = (await idbKeys(page, `q:${accountId}:${pidA}:attempt:`)).length;
  let gameDone = false;
  for (let i = 0; i < 12 && !gameDone; i++) {
    const opts = page.locator('.gm-options button:not([disabled])');
    const n = await opts.count();
    if (!n) break;
    await opts.nth(i % n).click();
    await sleep(500);
    gameDone = (await idbKeys(page, `q:${accountId}:${pidA}:attempt:`)).length > beforeGame;
  }
  ok(gameDone, 'Offline: completed a game round (attempt saved on device)');

  // simulation
  await page.goto(BASE + '/lab/circuit');
  const sw = page.locator('.lab-switch').first();
  await sw.waitFor({ timeout: 15000 });
  const s1 = await sw.getAttribute('aria-pressed');
  await sw.click();
  await sleep(400);
  const s2 = await page.locator('.lab-switch').first().getAttribute('aria-pressed');
  ok(s1 !== s2, 'Offline: Circuit Lab simulation runs (switch toggles the circuit)');

  // painting: draw, save locally, export PNG
  await page.goto(BASE + '/art/paint');
  await page.getByRole('button', { name: 'Start painting' }).click();
  const vp = page.locator('.art-viewport');
  await vp.waitFor({ timeout: 15000 });
  await sleep(800);
  const box = await vp.boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await page.mouse.down();
  for (let i = 0; i < 20; i++) await page.mouse.move(box.x + box.width * (0.3 + i * 0.02), box.y + box.height * (0.3 + i * 0.015));
  await page.mouse.up();
  await sleep(2500);
  const artId = page.url().split('/art/paint/')[1]?.split('?')[0];
  const draft = await idbGet(page, `art:${accountId}:${pidA}:${artId}`);
  ok(!!draft && draft.dirty, 'Offline: painting saved as a local draft (pending upload)');
  const [dlEvt] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), page.getByRole('button', { name: 'PNG' }).click()]);
  const pngPath = 'tests/e2e/shots/offline-export.png';
  await dlEvt.saveAs(pngPath);
  ok(statSync(pngPath).size > 1000, 'Offline: painting exported as PNG', `${statSync(pngPath).size} bytes`);
  await page.screenshot({ path: SHOTS + '04-offline-paint.png' });

  // reload offline: persistence
  const pendingBefore = await idbKeys(page, `q:${accountId}:`);
  await page.close().catch(() => {});
  page = await ctx.newPage(); errs = []; watch(page, errs);
  await page.goto(BASE + '/art/gallery');
  await sleep(2500);
  ok(await page.getByText(/On this device — will upload/).count() > 0, 'Offline reload: painting is still in the gallery (on this device)');
  await page.goto(BASE + `/art/paint/${artId}`);
  await page.locator('.art-viewport').waitFor({ timeout: 15000 });
  await sleep(1000);
  ok(!(await page.getByText(/Oops/).count()), 'Offline reload: painting reopens in the studio');
  const pendingAfter = await idbKeys(page, `q:${accountId}:`);
  ok(pendingAfter.length === pendingBefore.length && pendingAfter.length >= 2, `Offline reload: ${pendingAfter.length} queued items persisted`);
  await page.goto(BASE + '/');
  await waitText(page, /awaiting sync/);
  ok(true, 'Offline: count of items awaiting sync shown');
  const offlineAttempts = (await idbKeys(page, `q:${accountId}:${pidA}:attempt:`));
  const offlineAttemptBodies = await Promise.all(offlineAttempts.map((k) => idbGet(page, k)));
  const artDraft = await idbGet(page, `art:${accountId}:${pidA}:${artId}`);

  // =====================================================================================
  // 3. Back online: revalidate session, sync exactly once, idempotent retries
  // =====================================================================================
  const stateBefore = await (async () => { const p2 = await (await browser.newContext()).newPage(); await p2.goto(BASE + '/signin'); await apiIn(p2, '/auth/login', { body: { username: userA, password: PW } }); const s = await apiIn(p2, `/p/${pidA}/state`); await p2.context().close(); return s.json; })();
  const attemptsServerBefore = stateBefore.mastery.reduce((s, m) => s + m.attempts, 0);
  await ctx.setOffline(false);
  let synced = false;
  for (let i = 0; i < 40 && !synced; i++) { await sleep(500); synced = (await idbKeys(page, `q:${accountId}:`)).length === 0 && !(await idbGet(page, `art:${accountId}:${pidA}:${artId}`))?.dirty; }
  ok(synced, 'Back online: queue flushed after the session was revalidated');
  const st = (await apiIn(page, `/p/${pidA}/state`)).json;
  const attemptsServer = st.mastery.reduce((s, m) => s + m.attempts, 0);
  ok(attemptsServer - attemptsServerBefore === offlineAttempts.length, `Server recorded exactly the ${offlineAttempts.length} offline attempts`, `delta ${attemptsServer - attemptsServerBefore}`);
  // retry: the same attempts again (as if the first response was lost)
  const again = await apiIn(page, `/p/${pidA}/attempts`, { body: { attempts: offlineAttemptBodies } });
  const st2 = (await apiIn(page, `/p/${pidA}/state`)).json;
  ok(again.json.inserted === 0 && st2.mastery.reduce((s, m) => s + m.attempts, 0) === attemptsServer, 'Retrying the same attempts is a no-op (idempotent)');
  const arts1 = (await apiIn(page, `/p/${pidA}/artworks`)).json.artworks;
  ok(arts1.filter((a) => a.id === artId).length === 1 && arts1.length === 1, 'Artwork uploaded once');
  const reput = await apiIn(page, `/p/${pidA}/artworks/${artId}`, { method: 'PUT', body: { title: artDraft.title, data: artDraft.data, thumb: artDraft.thumb, baseVersion: artDraft.baseVersion } });
  const arts2 = (await apiIn(page, `/p/${pidA}/artworks`)).json.artworks;
  ok(reput.status === 200 && arts2.length === 1, 'Retrying the same artwork save (lost response) creates no duplicate/conflict copy', `status ${reput.status}, ${arts2.length} artworks`);
  ok(st.activities.length + st.lessons.length > 0, 'Lesson/activity state saved offline was uploaded', `${st.lessons.length} lessons, ${st.activities.length} activities`);

  // =====================================================================================
  // 4. Artwork conflict: offline edit vs. another device's edit → both kept
  // =====================================================================================
  await ctx.setOffline(true);
  await page.goto(BASE + `/art/paint/${artId}`);
  await page.locator('.art-viewport').waitFor({ timeout: 15000 });
  await sleep(1000);
  const b2 = await page.locator('.art-viewport').boundingBox();
  await page.mouse.move(b2.x + b2.width * 0.6, b2.y + b2.height * 0.6); await page.mouse.down();
  for (let i = 0; i < 15; i++) await page.mouse.move(b2.x + b2.width * (0.6 - i * 0.02), b2.y + b2.height * 0.6);
  await page.mouse.up();
  await sleep(2500);
  // another device saves the same artwork meanwhile
  const other = await (await browser.newContext()).newPage();
  await other.goto(BASE + '/signin');
  await apiIn(other, '/auth/login', { body: { username: userA, password: PW } });
  const cur = (await apiIn(other, `/p/${pidA}/artworks/${artId}`)).json.artwork;
  const otherPut = await apiIn(other, `/p/${pidA}/artworks/${artId}`, { method: 'PUT', body: { title: cur.title, data: { ...cur.data, otherDevice: true }, thumb: cur.thumb, baseVersion: cur.version } });
  await ctx.setOffline(false);
  let arts3 = [];
  for (let i = 0; i < 30; i++) { await sleep(500); arts3 = (await apiIn(other, `/p/${pidA}/artworks`)).json.artworks; if (arts3.length >= 2) break; }
  ok(otherPut.status === 200 && arts3.length === 2 && arts3.some((a) => a.conflictOf === artId), 'Artwork conflict keeps both versions (original + "other device" copy)', `${arts3.length} artworks` + (arts3.length !== 2 ? ' ' + JSON.stringify(arts3.map((x) => [x.title, x.version, x.conflictOf])) : ''));
  await waitText(page, /changed on two devices/, 8000).then(() => ok(true, 'Conflict: learner is told both versions were kept')).catch(() => ok(false, 'Conflict dialog shown'));
  await page.getByRole('button', { name: 'Keep both for now' }).click({ timeout: 3000 }).catch(() => {});
  await other.context().close();

  // =====================================================================================
  // 5. Expired server session: sync pauses; a different account never uploads/sees it
  // =====================================================================================
  await ctx.setOffline(true);
  ok(await lessonAttempt(page, `q:${accountId}:`, 1), 'Offline: another lesson attempt saved before the session expires');
  const pendingExp = (await idbKeys(page, `q:${accountId}:`)).length;
  await ctx.clearCookies(); // the server session is gone (expired/revoked)
  await ctx.setOffline(false);
  await waitText(page, /Sign in as/, 15000).then(() => ok(true, 'Expired session: sync pauses and asks a parent to sign in to the same account')).catch(() => ok(false, 'Expired session prompt'));
  ok((await idbKeys(page, `q:${accountId}:`)).length === pendingExp && pendingExp > 0, 'Expired session: pending work kept on the device', `${pendingExp} items`);
  await page.screenshot({ path: SHOTS + '05-reauth.png' });
  // a different family signs in on this device
  const bPage = await (await browser.newContext()).newPage();
  await bPage.goto(BASE + '/signin');
  await apiIn(bPage, '/auth/register', { body: { username: userB, password: PW, securityQuestion: 0, securityAnswer: 'x1', keepSignedIn: true } });
  await bPage.context().close();
  await page.goto(BASE + '/signin');
  await page.getByLabel('Username').fill(userB);
  await page.locator('input[autocomplete="current-password"]').fill(PW);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await sleep(3000);
  const bTxt = await page.locator('body').innerText();
  ok(!/Arjun|Chinni|awaiting sync|Sign in as/.test(bTxt), 'Different account signs in: the other family\'s learners and pending work are not shown');
  const serverA = await (async () => { const p2 = await (await browser.newContext()).newPage(); await p2.goto(BASE + '/signin'); await apiIn(p2, '/auth/login', { body: { username: userA, password: PW } }); const s = await apiIn(p2, `/p/${pidA}/state`); await p2.context().close(); return s.json.mastery.reduce((s2, m) => s2 + m.attempts, 0); })();
  ok(serverA === attemptsServer, 'Different account: nothing of the first account was uploaded', `${serverA} vs ${attemptsServer}`);
  ok((await idbKeys(page, `q:${accountId}:`)).length === pendingExp, 'Different account: first account\'s pending work still kept, scoped to it');
  // sign out B, sign in as A again → uploads
  await apiIn(page, '/auth/logout', { body: {} });
  await page.goto(BASE + '/signin');
  await page.getByLabel('Username').fill(userA);
  await page.locator('input[autocomplete="current-password"]').fill(PW);
  await page.getByRole('button', { name: 'Sign in' }).click();
  let drained = false;
  for (let i = 0; i < 30 && !drained; i++) { await sleep(500); drained = (await idbKeys(page, `q:${accountId}:`)).length === 0; }
  const serverA2 = (await apiIn(page, `/p/${pidA}/state`)).json.mastery.reduce((s, m) => s + m.attempts, 0);
  ok(drained && serverA2 === attemptsServer + 1, 'Same account signs in again: paused work uploads exactly once', `${serverA2 - attemptsServer} new`);

  // =====================================================================================
  // 6. Offline window expiry: reopening offline asks for online re-verification
  // =====================================================================================
  const entNow = await idbGet(page, `ent:${accountId}`);
  ok(!!entNow, 'Offline entitlement kept for the same account after re-sign-in');
  await idbPut(page, `ent:${accountId}`, { ...entNow, expiresAt: Date.now() - 1000 });
  await ctx.setOffline(true);
  await page.close().catch(() => {});
  page = await ctx.newPage();
  await page.goto(BASE + '/');
  await waitText(page, /Offline use on this device has ended/, 15000).then(() => ok(true, 'Expired offline window: app asks for online re-verification instead of opening')).catch(async () => { await page.screenshot({ path: SHOTS + 'zz-expired.png' }); ok(false, 'Expired offline window prompt'); });
  ok(!(await page.getByText(/Arjun/).count()), 'Expired offline window: no learner data shown');
  await ctx.setOffline(false);
  // the app re-checks by itself on reconnect; 'Try again' may already be gone
  await page.getByRole('button', { name: 'Try again' }).click({ timeout: 3000 }).catch(() => {});
  await sleep(2500);
  const renewed = await idbGet(page, `ent:${accountId}`);
  ok(renewed && renewed.expiresAt > Date.now() + 13 * 864e5, 'Back online with a valid session: offline window renewed (14 days)');

  // sign-out warns about pending work, then purges private data
  await page.goto(BASE + '/');
  await sleep(1500);
  await ctx.setOffline(true);
  await lessonAttempt(page, `q:${accountId}:`, 2);
  // back online, but uploads fail (server trouble) → the work is still pending at sign-out
  await ctx.route('**/api/p/*/attempts', (r) => r.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await ctx.route('**/api/p/*/lessons/**', (r) => r.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await ctx.setOffline(false);
  await page.goto(BASE + '/parent');
  await page.getByLabel('Parent password').or(page.getByRole('button', { name: 'Sign out' })).first().waitFor({ timeout: 15000 });
  if (await page.getByLabel('Parent password').count()) { await page.getByLabel('Parent password').fill(PW); await page.getByRole('button', { name: 'Continue' }).click(); }
  await page.getByRole('button', { name: 'Sign out' }).first().click();
  await waitText(page, /Sign out and delete unsynced work/, 10000).then(() => ok(true, 'Sign-out warns about work not yet uploaded')).catch(() => ok(false, 'Sign-out warns about pending work'));
  await page.getByRole('button', { name: 'Sign out and delete unsynced work' }).click();
  await sleep(1500);
  const left = (await idbKeys(page, '')).filter((k) => k.includes(accountId));
  ok(left.length === 0, 'Completed sign-out purges this account\'s private local data (queue, drafts, snapshots, entitlement)', left.slice(0, 3).join(', '));
  await ctx.setOffline(false);
  await ctx.close();

  // =====================================================================================
  // 7. Interrupted download resumes (fresh device)
  // =====================================================================================
  const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx3.route('**/assets/**', async (route) => { await sleep(120); await route.continue(); });
  let p3 = await ctx3.newPage();
  await p3.goto(BASE + '/signin');
  await p3.getByLabel('Username').fill(userA);
  await p3.locator('input[autocomplete="current-password"]').fill(PW);
  await p3.getByRole('button', { name: 'Sign in' }).click();
  await p3.getByRole('button', { name: /Arjun/ }).click();
  await waitText(p3, /Getting ready for offline use/, 20000);
  let partial = 0;
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    partial = await p3.evaluate(async () => { const ks = (await caches.keys()).filter((k) => k.startsWith('wl-build-')); let n = 0; for (const k of ks) n += (await (await caches.open(k)).keys()).length; return n; });
    if (partial >= 15) break;
  }
  await p3.close().catch(() => {}); // interrupted mid-download (tab closed)
  const job = partial;
  p3 = await ctx3.newPage();
  await ctx3.unroute('**/assets/**');
  await p3.goto(BASE + '/downloads');
  let doneResume = false;
  for (let i = 0; i < 360 && !doneResume; i++) {
    await sleep(500);
    doneResume = await p3.evaluate(() => new Promise((res) => { const r = indexedDB.open('wonderlab'); r.onsuccess = () => { const q = r.result.transaction('kv').objectStore('kv').get('pk:job'); q.onsuccess = () => { res(!q.result); r.result.close(); }; }; }));
  }
  const fetched = await p3.evaluate(() => performance.getEntriesByType('resource').filter((e) => e.initiatorType === 'fetch' && e.name.includes('/assets/')).length);
  const total = await p3.evaluate(async () => { const ks = (await caches.keys()).filter((k) => k.startsWith('wl-build-')); let n = 0; for (const k of ks) n += (await (await caches.open(k)).keys()).length; return n; });
  ok(doneResume && partial > 0 && fetched < total, 'Interrupted download resumes on reopen and skips files already cached', `${job} cached before interruption, ${fetched} fetched after, ${total} total` + (doneResume ? '' : ' | job still pending: ' + JSON.stringify(await idbGet(p3, 'pk:job')).slice(0, 200) + ' | ' + (await p3.locator('.alert, .offline-bar').allInnerTexts()).join(' / ').slice(0, 400)));
  await waitText(p3, /Ready offline|Downloaded/, 30000).then(() => ok(true, 'Resumed download completes and is verified')).catch(() => ok(false, 'Resumed download completes'));
  await ctx3.close();
} catch (e) {
  ok(false, 'Offline journey crashed', e.message.split('\n')[0]);
  for (const c of browser.contexts()) for (const pg of c.pages()) await pg.screenshot({ path: SHOTS + 'zz-crash-' + Math.random().toString(36).slice(2, 6) + '.png' }).catch(() => {});
}
await browser.close();
const f = results.filter((r) => r[0] === 'FAIL');
console.log(`\n==== ${results.length - f.length} passed, ${f.length} failed ====`);
process.exit(f.length ? 1 : 0);
