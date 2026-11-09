// Browser journeys through the real UI (Edge via playwright-core). Server must be running.
// Usage: node tests/e2e/browser.mjs [baseUrl]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://127.0.0.1:8787';
const SHOTS = 'tests/e2e/shots/';
mkdirSync(SHOTS, { recursive: true });
const results = [];
const ok = (c, n, d = '') => { results.push([c ? 'PASS' : 'FAIL', n, d]); console.log(c ? 'PASS' : 'FAIL', n, d ? `— ${d}` : ''); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rnd = Math.random().toString(36).slice(2, 7);

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|favicon|401|404|Failed to load resource/.test(m.text())) errors.push(m.text()); });
const shot = (n) => page.screenshot({ path: SHOTS + n + '.png' });
const noErr = (n) => { ok(!errors.length, `${n}: no JS errors`, errors.slice(0, 3).join(' | ')); errors.length = 0; };

/** Answers the current practice question by trying choices until one is correct. */
async function answerByChoices(max = 8) {
  for (let i = 0; i < max; i++) {
    const choices = page.locator('.choice:not(.is-wrong):not([aria-disabled="true"])');
    const n = await choices.count();
    if (!n) return false;
    await choices.nth(0).click();
    const check = page.getByRole('button', { name: /^(Check|చూడు)/ });
    if (await check.count()) await check.first().click().catch(() => {});
    await sleep(300);
    if (await page.locator('.feedback.good, .choice.is-right').count()) return true;
  }
  return false;
}

try {
  // ---------- sign up + two learners ----------
  await page.goto(BASE + '/signup');
  await page.getByLabel('Username').fill(`fam_${rnd}`);
  await page.getByLabel('Password', { exact: true }).fill('Garden2024');
  await page.getByLabel('Confirm password').fill('Garden2024');
  await page.getByLabel('Answer').fill('mango');
  await shot('01-signup');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByText('Save your recovery codes').waitFor({ timeout: 15000 });
  ok((await page.locator('.codes li').count()) === 10, 'Sign-up shows 10 one-time recovery codes');
  await page.getByLabel('I have saved these codes somewhere safe.').check();
  await page.getByRole('button', { name: 'Continue to set up learners' }).click();
  const addLearner = async (nick, cls, band) => {
    await page.getByLabel('Nickname').fill(nick);
    await page.getByLabel('Class').selectOption({ label: cls });
    await page.getByLabel('Age band').selectOption({ label: band });
    await page.getByRole('button', { name: 'Add learner' }).click();
    await page.getByText(`${nick} added`).waitFor({ timeout: 10000 });
  };
  await addLearner('Chinni', 'Nursery', '3–4 years');
  await page.getByRole('button', { name: 'Add another learner' }).click();
  await addLearner('Arjun', 'Class 5', '9–10 years');
  await page.getByRole('button', { name: 'Add another learner' }).click();
  await addLearner('Meera', 'Class 10', '15–16 years');
  await shot('02-setup');
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByText('Who is learning today?').first().waitFor();
  ok((await page.locator('.who:not(.add-who)').count()) === 3 && (await page.locator('.add-who').count()) === 1, 'Profile picker shows the family\'s learners');
  noErr('Sign-up');

  // ---------- trusted device: new page, still signed in, resumes correct learner ----------
  await page.getByRole('button', { name: /Arjun/ }).click();
  await page.waitForURL(BASE + '/');
  const p2 = await ctx.newPage();
  await p2.goto(BASE + '/');
  await p2.getByText('Hi Arjun!').waitFor({ timeout: 10000 });
  ok(true, 'Reopening the app on a trusted device resumes the same learner without a password');
  await p2.close();

  // ---------- Nursery: counting + home layout ----------
  await page.goto(BASE + '/who');
  await page.getByRole('button', { name: /Chinni/ }).click();
  await page.waitForURL(BASE + '/');
  await shot('03-home-nursery');
  ok(await page.getByRole('link', { name: /Play & Learn/ }).count() > 0, 'Nursery home shows Play & Learn');
  await page.goto(BASE + '/learn?subject=early');
  const practiceLinks = page.getByRole('link', { name: 'Practice' });
  await practiceLinks.first().waitFor({ timeout: 15000 });
  const countLink = page.locator('a[href*="count"][href*="practice"]').first();
  await ((await countLink.count()) ? countLink : practiceLinks.first()).click();
  await page.locator('.choice, .lq-counter').first().waitFor({ timeout: 15000 });
  await shot('04-nursery-counting');
  ok(await answerByChoices(), 'Nursery learner completes a counting/spoken activity by tapping pictures (no typing)');
  ok((await page.locator('input[type=text]').count()) === 0, 'No typing required for Nursery');
  noErr('Nursery lesson');

  // ---------- Telugu switch ----------
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: /Switch/ }).first().click();
  await page.getByText('నమస్తే Chinni!').waitFor({ timeout: 5000 });
  ok(await page.getByText('ఆడుతూ నేర్చుకో').count() > 0, 'Telugu UI switch works (written Telugu labels shown)');
  await page.getByRole('button', { name: /Switch/ }).first().click();
  await page.getByText('Hi Chinni!').waitFor();

  // ---------- Class 5: resume a fraction exercise after refresh ----------
  await page.goto(BASE + '/who');
  await page.getByRole('button', { name: /Arjun/ }).click();
  await page.goto(BASE + '/learn?subject=math');
  const frac = page.locator('a[href*="frac"][href*="practice"]').first();
  await frac.waitFor({ timeout: 15000 });
  await frac.click();
  await page.locator('.lq-q, [class*="lq-"]').first().waitFor({ timeout: 15000 });
  await sleep(1200);
  // the learner starts answering (types a draft or taps a choice), then the page is refreshed
  const typed = page.locator('main input[type=text], main input[inputmode]').first();
  if (await typed.count()) { await typed.click(); await page.keyboard.type('3'); } else { await page.locator('.choice').first().click(); }
  await sleep(1500);
  const card = () => page.locator('.lq-card').first().innerText().catch(() => '');
  const before = (await card()).slice(0, 400);
  await shot('05-class5-fraction');
  await page.reload();
  await sleep(2500);
  const after = (await card()).slice(0, 400);
  ok(before.length > 20 && before === after, 'Class 5 learner resumes the same fraction question after refresh', before === after ? '' : `before="${before.slice(0, 80)}" after="${after.slice(0, 80)}"`);
  noErr('Class 5 lesson');

  // ---------- Class 10: physics with units, verify in lab ----------
  await page.goto(BASE + '/who');
  await page.getByRole('button', { name: /Meera/ }).click();
  await page.goto(BASE + '/learn?subject=physics');
  const ohm = page.locator('a[href*="ohm"][href*="practice"]').first();
  await ohm.waitFor({ timeout: 15000 });
  await ohm.click();
  const input = page.locator('input[type=text], input[inputmode]').first();
  await input.waitFor({ timeout: 15000 });
  await shot('06-class10-ohm');
  const prompt = await page.locator('main').innerText();
  ok(/V|A|Ω|ohm/i.test(prompt), 'Class 10 Ohm\'s law problem shown with units');
  await page.goto(BASE + '/lab/circuit?cells=2&bulbs=1&closed=1');
  await page.getByText(/Checking your answer/i).waitFor({ timeout: 15000 });
  await shot('07-lab-circuit-preset');
  ok(true, 'Circuit Lab opens with the lesson\'s preset to verify the result');
  noErr('Class 10 + lab');

  // ---------- games ----------
  await page.goto(BASE + '/games');
  await page.locator('a[href^="/games/"]').first().waitFor({ timeout: 15000 });
  const gameLinks = await page.locator('a[href^="/games/"]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
  ok(gameLinks.length >= 8, `Game library lists ${gameLinks.length} entries`);
  for (const g of ['counting', 'shapes', 'patterns', 'numberline', 'fractions', 'logic', 'balance', 'circuits']) {
    await page.goto(BASE + '/games/' + g);
    await sleep(1200);
    const txt = await page.locator('main').innerText();
    const restart = await page.getByRole('button', { name: /Restart|New/i }).count();
    ok(txt.length > 40 && restart > 0, `Game "${g}" loads with restart/new-round controls`);
  }
  await shot('08-game');
  noErr('Games');

  // ---------- art, play, language (smoke) ----------
  for (const [path, name] of [['/art', 'Art Studio'], ['/play', 'Play & Learn'], ['/lang', 'Language courses'], ['/progress', 'Progress'], ['/next', 'What next']]) {
    await page.goto(BASE + path);
    await sleep(1500);
    ok((await page.locator('main').innerText()).length > 20, `${name} page renders`);
  }
  noErr('Smoke pages');

  // ---------- preferences persist ----------
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Comfort settings' }).click();
  await page.getByLabel('Reduce motion').check();
  await page.getByLabel('Mute').check();
  await page.getByRole('button', { name: 'A', exact: true }).last().click();
  await page.keyboard.press('Escape');
  await sleep(800);
  await page.reload();
  await sleep(1500);
  const cls = await page.evaluate(() => ({ rm: document.documentElement.classList.contains('reduce-motion'), scale: getComputedStyle(document.documentElement).getPropertyValue('--text-scale').trim() }));
  ok(cls.rm && cls.scale === '1.3', 'Reduced motion and text size persist after reload', JSON.stringify(cls));

  // ---------- keyboard + responsive ----------
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.textContent || document.activeElement?.getAttribute('aria-label'));
  ok(!!focused, 'Keyboard focus reaches interactive elements', focused || '');
  for (const [w, h, name] of [[390, 844, 'phone portrait'], [844, 390, 'phone landscape'], [820, 1180, 'tablet']]) {
    await page.setViewportSize({ width: w, height: h });
    for (const path of ['/', '/games', '/lab/forces']) {
      await page.goto(BASE + path);
      await sleep(1000);
      const over = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      ok(!over, `${name}: ${path} has no sideways scrolling`);
    }
    await shot(`09-${name.replace(' ', '-')}`);
  }

  // ---------- isolation via URL tampering ----------
  const otherPid = '00000000-0000-4000-8000-0000000000a2'; // demo family's learner
  const res = await page.evaluate(async (pid) => (await fetch(`/api/p/${pid}/state`)).status, otherPid);
  ok(res === 404, 'Changing the profile id in an API request cannot read another family\'s learner', `status ${res}`);
  const adm = await page.evaluate(async () => (await fetch('/api/admin/items')).status);
  ok(adm === 403, 'Parent cannot open editor API');
  await page.goto(BASE + '/editor');
  await sleep(800);
  ok(!page.url().includes('/editor'), 'Parent is redirected away from the editor page');
} catch (e) {
  ok(false, 'Journey crashed', e.message.split('\n')[0]);
  await shot('zz-crash');
}
await browser.close();
const f = results.filter((r) => r[0] === 'FAIL');
console.log(`\n==== ${results.length - f.length} passed, ${f.length} failed ====`);
process.exit(f.length ? 1 : 0);
