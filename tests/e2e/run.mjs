// End-to-end API journeys against a running local server (npm start or wrangler dev on :8787,
// after npm run db:reset). Usage: node tests/e2e/run.mjs [baseUrl]
const BASE = process.argv[2] || 'http://127.0.0.1:8787';
const results = [];
const ok = (cond, name, detail = '') => { results.push([cond ? 'PASS' : 'FAIL', name, detail]); console.log(cond ? 'PASS' : 'FAIL', name, detail ? `— ${detail}` : ''); };

class Client {
  constructor(name) { this.name = name; this.jar = {}; }
  cookie() { return Object.entries(this.jar).map(([k, v]) => `${k}=${v}`).join('; '); }
  async req(path, { method, body, headers = {}, csrf = true } = {}) {
    const m = method || (body !== undefined ? 'POST' : 'GET');
    const res = await fetch(BASE + '/api' + path, {
      method: m,
      headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-WonderLab': '1' } : {}), ...(this.cookie() ? { Cookie: this.cookie() } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    for (const sc of res.headers.getSetCookie?.() || []) {
      const [kv, ...attrs] = sc.split(';');
      const [k, v] = kv.split('=');
      const expired = attrs.some((a) => /max-age=0/i.test(a) || /expires=Thu, 01 Jan 1970/i.test(a));
      if (expired || v === '') delete this.jar[k.trim()]; else this.jar[k.trim()] = v;
      this.lastCookieAttrs = attrs.map((a) => a.trim().toLowerCase());
    }
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }
  clone(name) { const c = new Client(name); c.jar = { ...this.jar }; return c; }
}
const uuid = () => crypto.randomUUID();
const rnd = Math.random().toString(36).slice(2, 7);

async function outboxLink(to, kind) {
  const r = await new Client('dev').req('/dev/outbox');
  const m = r.data.emails.find((e) => e.to_addr === to && e.body.includes(kind));
  return m ? m.body.match(/token=([A-Za-z0-9_-]+)/)?.[1] : null;
}

async function main() {
  const health = await new Client('h').req('/health');
  ok(health.status === 200, 'API is up', JSON.stringify(health.data));

  // ---------- parent sign-up, two learners, trusted device ----------
  const A = new Client('parentA');
  const userA = `parent_${rnd}`, emailA = `a_${rnd}@example.test`;
  const blocked = await A.req('/auth/register', { body: { username: userA }, csrf: false });
  ok(blocked.status === 403, 'CSRF: mutating request without app header is blocked');
  const weak = await A.req('/auth/register', { body: { username: userA, password: 'short', securityQuestion: 0, securityAnswer: 'x' } });
  ok(weak.status === 422 && weak.data.error.fields.password, 'Registration rejects weak password');
  const reg = await A.req('/auth/register', { body: { username: userA, password: 'Garden2024', email: emailA, securityQuestion: 4, securityAnswer: 'Mango', keepSignedIn: true, deviceLabel: 'e2e' } });
  ok(reg.status === 200 && reg.data.recoveryCodes?.length === 10, 'Parent account created with 10 recovery codes');
  ok(A.lastCookieAttrs?.includes('httponly') && A.lastCookieAttrs?.some((a) => a.startsWith('max-age=')), 'Session cookie is HttpOnly and persistent ("keep me signed in")');
  const codes = reg.data.recoveryCodes;
  const p1 = await A.req('/profiles', { body: { nickname: 'Chinni', avatar: 'rabbit', classLevel: 0, ageBand: '3-4' } });
  const p2 = await A.req('/profiles', { body: { nickname: 'Arjun', avatar: 'tiger', classLevel: 7, ageBand: '9-10' } });
  ok(p1.status === 200 && p2.status === 200, 'Two learner profiles created (nickname, avatar, class, age band — no birth date)');
  const pid1 = p1.data.profile.id, pid2 = p2.data.profile.id;
  const bad = await A.req('/profiles', { body: { nickname: 'mail@x.com', avatar: 'rabbit', classLevel: 3, ageBand: '5-6' } });
  ok(bad.status === 422, 'Profile nickname rejects email-like personal data');

  // "reopen the browser on a trusted device": same cookie, new client
  const A2 = A.clone('parentA-reopened');
  const me = await A2.req('/auth/me');
  ok(me.data.account?.username === userA && me.data.profiles.length === 2 && me.data.session.persistent, 'Reopened trusted device is still signed in with both learners');

  // progress, resume, idempotent sync
  const att = { id: uuid(), questionId: 'm5.frac.add#42', questionVersion: 1, objectiveId: 'm5.frac.add', mode: 'practice', correct: true, hintsUsed: 0, at: Math.floor(Date.now() / 1000) };
  const s1 = await A2.req(`/p/${pid2}/attempts`, { body: { attempts: [att] } });
  const s2 = await A2.req(`/p/${pid2}/attempts`, { body: { attempts: [att, att] } });
  ok(s1.data.inserted === 1 && s2.data.inserted === 0, 'Repeated sync of the same attempt is not double-counted');
  await A2.req(`/p/${pid2}/lessons/c5-frac%2Fm5.frac.add`, { method: 'PUT', body: { state: { mode: 'practice', seed: 42 }, updatedAt: 2000000000 - 1 } });
  await A2.req(`/p/${pid2}/lessons/c5-frac%2Fm5.frac.add`, { method: 'PUT', body: { state: { mode: 'learn', seed: 1 }, updatedAt: 1000 } }); // stale offline write
  const st = await A2.req(`/p/${pid2}/state`);
  const ls = st.data.lessons.find((l) => l.lessonId === 'c5-frac/m5.frac.add');
  ok(ls?.state.seed === 42, 'Lesson position saved; an older offline write does not overwrite newer progress');
  ok(st.data.mastery.find((m) => m.objectiveId === 'm5.frac.add')?.correct === 1, 'Mastery updated server-side from attempts');
  const st1 = await A2.req(`/p/${pid1}/state`);
  ok(st1.data.mastery.length === 0, 'Profile isolation: second learner has separate progress');

  // artwork versioning + conflict preserves both
  const artId = uuid();
  const a1 = await A2.req(`/p/${pid1}/artworks/${artId}`, { method: 'PUT', body: { title: 'Sun', data: { layers: [1] }, baseVersion: 0 } });
  const a2 = await A2.req(`/p/${pid1}/artworks/${artId}`, { method: 'PUT', body: { title: 'Sun', data: { layers: [1, 2] }, baseVersion: 1 } });
  const conflict = await A2.req(`/p/${pid1}/artworks/${artId}`, { method: 'PUT', body: { title: 'Sun', data: { layers: ['offline edit'] }, baseVersion: 1 } });
  const list = await A2.req(`/p/${pid1}/artworks`);
  ok(a1.data.version === 1 && a2.data.version === 2, 'Artwork saves are versioned');
  ok(conflict.status === 409 && list.data.artworks.length === 2, 'Conflicting offline edit keeps BOTH versions (no silent overwrite)');
  const resolved = await A2.req(`/p/${pid1}/artworks/${conflict.data.conflictCopyId}/resolve`, { body: { keep: 'copy' } });
  const after = await A2.req(`/p/${pid1}/artworks/${artId}`);
  ok(resolved.status === 200 && JSON.stringify(after.data.artwork.data) === JSON.stringify({ layers: ['offline edit'] }), 'Learner can choose which version to keep');

  // ---------- isolation & authorization ----------
  const B = new Client('parentB');
  await B.req('/auth/register', { body: { username: `other_${rnd}`, password: 'River2024x', securityQuestion: 0, securityAnswer: 'tom', keepSignedIn: false } });
  ok(B.lastCookieAttrs && !B.lastCookieAttrs.some((a) => a.startsWith('max-age=')), 'Shared-device sign-in uses a session cookie (no long-lived cookie)');
  for (const [path, method] of [[`/p/${pid1}/state`, 'GET'], [`/p/${pid1}/artworks`, 'GET'], [`/p/${pid1}/artworks/${artId}`, 'GET'], [`/p/${pid1}/attempts`, 'POST'], [`/p/${pid1}/profile`, 'PATCH']]) {
    const r = await B.req(path, { method, body: method === 'GET' ? undefined : { attempts: [], prefs: {} } });
    ok(r.status === 404, `Account isolation: other parent cannot ${method} ${path.replace(pid1, ':pid')}`, `status ${r.status}`);
  }
  const anon = await new Client('anon').req(`/p/${pid1}/state`);
  ok(anon.status === 401, 'Anonymous request to private endpoint is rejected');
  const adminB = await B.req('/admin/items');
  ok(adminB.status === 403, 'Role permissions: parent cannot use the content editor API');

  // ---------- parent verification ----------
  const A3 = A.clone('A3');
  await A3.req('/auth/end-parent-mode', { body: {} });
  const ex1 = await A3.req('/account/export');
  const cls = await A3.req(`/p/${pid1}/profile`, { method: 'PATCH', body: { classLevel: 5 } });
  const pref = await A3.req(`/p/${pid1}/profile`, { method: 'PATCH', body: { prefs: { reduceMotion: true, textSize: 1.3, mute: true, breakMinutes: 5 } } });
  ok(ex1.status === 403 && cls.status === 403, 'Export and class changes require parent verification');
  ok(pref.status === 200 && pref.data.profile.prefs.reduceMotion === true && pref.data.profile.prefs.breakMinutes === undefined, 'Learner can change own comfort prefs; parent-only prefs are ignored without verification');
  const wrongPw = await A3.req('/auth/verify-parent', { body: { password: 'nope' } });
  const rightPw = await A3.req('/auth/verify-parent', { body: { password: 'Garden2024' } });
  const ex2 = await A3.req('/account/export');
  ok(wrongPw.status === 401 && rightPw.status === 200 && ex2.status === 200 && ex2.data.profiles.length === 2, 'Parent password unlocks export');
  const sess = await A3.req('/account/sessions');
  ok(sess.status === 200 && sess.data.sessions.length >= 1, 'Parent can see signed-in devices');

  // ---------- recovery ----------
  const generic1 = await new Client('x').req('/auth/forgot-password', { body: { identifier: 'no_such_user' } });
  const vtoken = await outboxLink(emailA, 'verify-email');
  const ve = await new Client('x').req('/auth/verify-email', { body: { token: vtoken } });
  ok(ve.status === 200, 'Parent email verified via emailed link (local outbox)');
  const generic2 = await new Client('x').req('/auth/forgot-password', { body: { identifier: userA } });
  ok(generic1.data.message === generic2.data.message, 'Forgot-password gives the same generic answer for unknown and known accounts');
  const rtoken = await outboxLink(emailA, '/reset?token=');
  const anonR = new Client('reset');
  const wrongAns = await anonR.req('/auth/reset-with-token', { body: { token: rtoken, securityAnswer: 'banana', newPassword: 'NewGarden99' } });
  ok(wrongAns.status === 401, 'Email reset link alone is not enough: wrong security answer rejected');
  const answerOnly = await anonR.req('/auth/reset-with-code', { body: { username: userA, code: 'WRONG-CODE0', securityAnswer: 'mango', newPassword: 'NewGarden99' } });
  ok(answerOnly.status === 401, 'Security answer alone cannot reset the password');
  const goodReset = await anonR.req('/auth/reset-with-token', { body: { token: rtoken, securityAnswer: '  MANGO ', newPassword: 'NewGarden99' } });
  ok(goodReset.status === 200, 'Reset via email link + security answer works');
  const reuse = await anonR.req('/auth/reset-with-token', { body: { token: rtoken, securityAnswer: 'mango', newPassword: 'Another123' } });
  ok(reuse.status === 400, 'Reset link is single-use');
  const revoked = await A2.req('/auth/me');
  ok(revoked.data.account === null, 'Password reset revoked earlier sessions (trusted device must sign in again)');
  const oldPw = await new Client('l').req('/auth/login', { body: { username: userA, password: 'Garden2024' } });
  const newPw = await new Client('l').req('/auth/login', { body: { username: userA, password: 'NewGarden99' } });
  ok(oldPw.status === 401 && newPw.status === 200, 'Old password stops working; new password works');
  // recovery code path
  const C1 = new Client('code');
  const chk = await C1.req('/auth/recovery-code/check', { body: { username: userA, code: codes[0].toLowerCase() } });
  const viaCode = await C1.req('/auth/reset-with-code', { body: { username: userA, code: codes[0], securityAnswer: 'mango', newPassword: 'CodeReset77' } });
  const codeReuse = await C1.req('/auth/reset-with-code', { body: { username: userA, code: codes[0], securityAnswer: 'mango', newPassword: 'CodeReset88' } });
  ok(chk.status === 200 && viaCode.status === 200 && viaCode.data.codesLeft === 9, 'Reset via one-time recovery code + security answer works');
  ok(codeReuse.status === 401, 'Recovery code is single-use');
  const fu = await new Client('fu').req('/auth/forgot-username', { body: { email: emailA } });
  ok(fu.status === 200 && (await new Client('d').req('/dev/outbox')).data.emails.some((e) => e.subject.includes('username') && e.body.includes(userA)), 'Forgot-username emails the username to the verified address');

  // rate limiting
  let limited = false;
  for (let i = 0; i < 12; i++) { const r = await new Client('rl').req('/auth/login', { body: { username: `other_${rnd}`, password: 'bad' + i } }); if (r.status === 429) { limited = true; break; } }
  ok(limited, 'Sign-in attempts are rate-limited');

  // ---------- educator: correct, preview, publish, rollback ----------
  const E = new Client('educator');
  const el = await E.req('/auth/login', { body: { username: 'demo_educator', password: 'wonderlab123' } });
  if (el.status !== 200) { ok(false, 'Educator demo account available (run npm run db:seed)'); }
  else {
    const items = await E.req('/admin/items?q=');
    const qItem = (await E.req('/admin/items?q=')).data.items.find((i) => i.kind === 'question') || items.data.items.find((i) => i.kind === 'objective');
    if (!qItem) ok(false, 'Content items seeded');
    else {
      const detail = await E.req(`/admin/items/${encodeURIComponent(qItem.id)}`);
      const v1 = detail.data.versions.find((v) => v.version === 1).data;
      const edited = qItem.kind === 'question' ? { ...v1, prompt: { ...v1.prompt, en: v1.prompt.en + ' (corrected)' } } : { ...v1, title: { ...v1.title, en: v1.title.en + ' (corrected)' } };
      const dr = await E.req(`/admin/items/${encodeURIComponent(qItem.id)}/drafts`, { body: { data: edited } });
      const pubDraft = await E.req(`/admin/items/${encodeURIComponent(qItem.id)}/versions/${dr.data.version}/publish`, { body: {} });
      ok(pubDraft.status === 422, 'Educator cannot publish an unvalidated draft');
      const val = await E.req(`/admin/items/${encodeURIComponent(qItem.id)}/versions/${dr.data.version}/validate`, { body: {} });
      const pub = await E.req(`/admin/items/${encodeURIComponent(qItem.id)}/versions/${dr.data.version}/publish`, { body: {} });
      const ov = await new Client('o').req('/content/overrides');
      const seen = ov.data.overrides.find((o) => o.id === qItem.id);
      ok(val.data.ok && pub.status === 200 && seen?.version === dr.data.version, `Educator corrected ${qItem.kind} ${qItem.id}, validated and published v${dr.data.version}`);
      const hist = await E.req(`/admin/items/${encodeURIComponent(qItem.id)}`);
      ok(hist.data.versions.find((v) => v.version === dr.data.version)?.publisher === 'demo_educator', 'Version history records who published');
      const rb = await E.req(`/admin/items/${encodeURIComponent(qItem.id)}/rollback`, { body: { toVersion: 1 } });
      const ov2 = await new Client('o').req('/content/overrides');
      ok(rb.status === 200 && !ov2.data.overrides.some((o) => o.id === qItem.id), 'Rollback re-publishes v1');
      const P = new Client('p'); await P.req('/auth/login', { body: { username: userA, password: 'CodeReset77' } });
      const old = await P.req(`/content/items/${encodeURIComponent(qItem.id)}/versions/1`);
      const newer = await P.req(`/content/items/${encodeURIComponent(qItem.id)}/versions/${dr.data.version}`);
      ok(old.status === 200 && newer.status === 200 && JSON.stringify(old.data.data) !== JSON.stringify(newer.data.data), 'Historical attempts can still fetch the exact version they answered');
    }
  }

  // ---------- deletion ----------
  const D = new Client('del');
  await D.req('/auth/login', { body: { username: userA, password: 'CodeReset77' } });
  await D.req('/auth/verify-parent', { body: { password: 'CodeReset77' } });
  const delP = await D.req(`/p/${pid1}/profile`, { method: 'DELETE' });
  const delA = await D.req('/account', { method: 'DELETE', body: { confirmUsername: userA } });
  const gone = await new Client('g').req('/auth/login', { body: { username: userA, password: 'CodeReset77' } });
  ok(delP.status === 200 && delA.status === 200 && gone.status === 401, 'Parent can delete a learner and the whole account');

  const fails = results.filter((r) => r[0] === 'FAIL');
  console.log(`\n==== ${results.length - fails.length} passed, ${fails.length} failed ====`);
  process.exit(fails.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
