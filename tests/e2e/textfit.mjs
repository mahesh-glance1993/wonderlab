// Checks that text is never cut off or pushed off-screen on phone and tablet widths.
// Usage: node tests/e2e/textfit.mjs http://127.0.0.1:PORT
import { chromium } from 'playwright-core';
const BASE = process.argv[2] || 'http://127.0.0.1:8787';
const ROUTES = ['/', '/who', '/learn', '/lab', '/art', '/games', '/play', '/play/stories', '/play/stories/sankranti-kites', '/play/memory', '/play/rhymes', '/play/safari', '/play/stickers', '/lang', '/progress', '/downloads', '/parent', '/next'];
const SIZES = [{ n: 'phone 360', w: 360, h: 760 }, { n: 'phone 412', w: 412, h: 915 }, { n: 'tablet 800', w: 800, h: 1280 }, { n: 'tablet landscape 1280', w: 1280, h: 800 }];
const b = await chromium.launch({ channel: 'msedge' });
let pass = 0, fail = 0;
for (const sz of SIZES) {
  const ctx = await b.newContext({ viewport: { width: sz.w, height: sz.h }, deviceScaleFactor: 2, isMobile: sz.w < 1000, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(BASE + '/signin');
  await p.fill('input[autocomplete="username"]', 'demo_parent'); await p.fill('input[type="password"]', 'wonderlab123');
  await p.click('button[type="submit"]'); await p.waitForURL(/\/who/, { timeout: 20000 });
  for (const kid of ['Chinni', 'Meera']) {
    await p.goto(BASE + '/who'); await p.locator('main button', { hasText: kid }).first().click(); await p.waitForTimeout(1200);
    for (const r of ROUTES) {
      if (kid === 'Meera' && r.startsWith('/play')) continue;
      await p.goto(BASE + r); await p.waitForTimeout(900);
      const probs = await p.evaluate(() => {
        const out = [];
        if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`page scrolls sideways (${document.documentElement.scrollWidth}px > ${innerWidth}px)`);
        for (const el of document.querySelectorAll('h1,h2,h3,.title,.tile b,.btn,button,label,p,a,.choice,.pill')) {
          const cs = getComputedStyle(el), r = el.getBoundingClientRect();
          if (!r.width || cs.visibility === 'hidden' || el.closest('.sr-only,[hidden],.art-toolbar,.art-layer-name,svg')) continue;
          const txt = (el.innerText || '').trim().slice(0, 40); if (!txt) continue;
          if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) out.push(`cut with … : "${txt}"`);
          else if ((cs.overflow === 'hidden' || cs.overflowX === 'hidden') && el.scrollWidth > el.clientWidth + 2) out.push(`clipped: "${txt}"`);
          if (r.right > innerWidth + 2 || r.left < -2) if (!el.closest('[style*="overflow"],.art-toolbar,.row-scroll,[class*="scroll"],table')) out.push(`off-screen: "${txt}" (${Math.round(r.left)}..${Math.round(r.right)})`);
        }
        return [...new Set(out)].slice(0, 5);
      });
      if (probs.length) { fail++; console.log(`FAIL [${sz.n}] ${kid} ${r}: ${probs.join(' | ')}`); } else pass++;
    }
  }
  await ctx.close();
}
console.log(`==== ${pass} passed, ${fail} failed ====`);
await b.close();
