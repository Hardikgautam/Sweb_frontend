/**
 * e2e_verify.mjs — drives the built app in real Chrome to verify this session's
 * fixes actually work in a browser, not just in unit tests.
 *
 *   node e2e_verify.mjs
 *
 * Expects: frontend preview on :4173, backend on :8022.
 */

import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:4173/Sweb_frontend';
const API = 'http://127.0.0.1:8022/api';
const SHOTS = 'e2e_shots';

const PHONE = { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const DESKTOP = { width: 1440, height: 900 };

let pass = 0;
let fail = 0;
const failures = [];

function check(label, ok, detail = '') {
  if (ok) {
    pass += 1;
    console.log(`  [OK]   ${label}`);
  } else {
    fail += 1;
    failures.push(`${label}${detail ? ` -> ${detail}` : ''}`);
    console.log(`  [FAIL] ${label}${detail ? ` -> ${detail}` : ''}`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  mkdirSync(SHOTS, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
  });

  const page = await browser.newPage();

  // Collect page errors — a blank screen usually shows up here first.
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });

  // ─────────────────────────────────────────────────────────────────────
  console.log('\n=== 1. Home page loads ===');
  await page.setViewport(DESKTOP);
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 45000 });

  const title = await page.title();
  check('home page responds', title.length > 0, title);
  check('no uncaught page errors on home', pageErrors.length === 0, pageErrors.join(' | '));

  const navCount = await page.$$eval('.navbar__link', (els) => els.length);
  check('navbar rendered', navCount > 0, `${navCount} links`);

  // ─────────────────────────────────────────────────────────────────────
  console.log('\n=== 2. "More" dropdown: click opens, click closes ===');
  const moreBtn = await page.$('.navbar__dropdown-btn');
  check('More button exists', Boolean(moreBtn));

  if (moreBtn) {
    const menuOpen = () =>
      page.$eval('.navbar__dropdown-menu', (el) => {
        const s = getComputedStyle(el);
        return s.visibility === 'visible' && parseFloat(s.opacity) > 0.5;
      });

    // Hover alone must NOT open it any more (that was half the old bug).
    await moreBtn.hover();
    await sleep(400);
    check('hover alone does not open the menu', (await menuOpen()) === false);

    await moreBtn.click();
    await sleep(350);
    check('first click OPENS the menu', (await menuOpen()) === true);

    // The pointer is still over the trigger here — exactly the situation
    // where the old CSS :hover rule kept the panel open and made clicks
    // appear to do nothing.
    await moreBtn.click();
    await sleep(350);
    check('second click CLOSES it (no repeated clicking needed)', (await menuOpen()) === false);

    // Escape also closes.
    await moreBtn.click();
    await sleep(300);
    await page.keyboard.press('Escape');
    await sleep(300);
    check('Escape closes the menu', (await menuOpen()) === false);

    // Outside click closes.
    await moreBtn.click();
    await sleep(300);
    await page.mouse.click(700, 500);
    await sleep(300);
    check('outside click closes the menu', (await menuOpen()) === false);
  }

  // ─────────────────────────────────────────────────────────────────────
  console.log('\n=== 3. Subject pages on MOBILE show curriculum data ===');
  await page.setViewport(PHONE);

  for (const slug of ['science', 'mathematics', 'social-studies']) {
    pageErrors.length = 0;
    await page.goto(`${BASE}/subjects/${slug}`, { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(600);

    const bands = await page.$$eval('.sp-band', (els) => els.length);
    // The actual regression: the points list used to collapse to ~0px wide.
    const pts = await page.$$eval('.sp-band__points li', (els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), text: (el.textContent || '').trim().slice(0, 30) };
      }),
    );
    const visible = pts.filter((p) => p.w > 120 && p.h > 8);

    check(`/${slug}: curriculum bands present`, bands > 0, `${bands} bands`);
    check(
      `/${slug}: ${visible.length}/${pts.length} curriculum points readable on a 390px screen`,
      pts.length > 0 && visible.length === pts.length,
      pts.length ? `widest=${Math.max(...pts.map((p) => p.w))}px` : 'no list items found',
    );

    // No sideways scroll.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    check(`/${slug}: no horizontal page overflow`, overflow <= 1, `${overflow}px`);
    check(`/${slug}: no page errors`, pageErrors.length === 0, pageErrors.join(' | '));
  }

  await page.goto(`${BASE}/subjects/science`, { waitUntil: 'networkidle2' });
  await sleep(500);
  await page.screenshot({ path: `${SHOTS}/subject-science-mobile.png`, fullPage: false });

  // Navigating to an unknown subject used to break the hook order.
  pageErrors.length = 0;
  await page.goto(`${BASE}/subjects/does-not-exist`, { waitUntil: 'networkidle2' });
  await sleep(500);
  const notFound = await page.$eval('body', (b) => b.innerText.includes('Subject Not Found')).catch(() => false);
  check('unknown subject shows the not-found view', notFound);
  check('unknown subject does not throw (hook order fix)', pageErrors.length === 0, pageErrors.join(' | '));

  // ─────────────────────────────────────────────────────────────────────
  console.log('\n=== 4. Saraswati AI widget ===');
  await page.setViewport(DESKTOP);
  pageErrors.length = 0;
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.sar-launcher', { timeout: 15000 }).catch(() => {});

  const hasLauncher = Boolean(await page.$('.sar-launcher'));
  check('chat launcher is mounted', hasLauncher);

  if (hasLauncher) {
    await page.click('.sar-launcher');
    await page.waitForSelector('.sar-panel', { timeout: 10000 });
    check('panel opens', Boolean(await page.$('.sar-panel')));

    const botName = await page.$eval('.sar-brand__name', (el) => el.textContent.trim());
    check('bot is branded Saraswati AI', botName === 'Saraswati AI', botName);

    const greeting = await page.$eval('.sar-msg--bot .sar-msg__bubble', (el) => el.textContent.trim());
    check('greeting shown', greeting.length > 20, greeting.slice(0, 60));

    const chips = await page.$$eval('.sar-chip', (els) => els.length);
    check('suggestion chips offered', chips > 0, `${chips} chips`);

    // Ask a grounded question via the UI.
    await page.type('.sar-input', 'How do I apply for admission?');
    await page.click('.sar-send');
    await page.waitForFunction(
      // :not(.sar-typing) — the typing indicator is also a .sar-msg__bubble but
      // carries no text, so counting it would match before the answer arrives.
      () => document.querySelectorAll('.sar-msg--bot .sar-msg__bubble:not(.sar-typing)').length >= 2,
      { timeout: 30000 },
    );
    const answers = await page.$$eval('.sar-msg--bot .sar-msg__bubble:not(.sar-typing)', (els) =>
      els.map((e) => e.textContent.trim()),
    );
    const last = answers[answers.length - 1];
    check('an answer came back', last.length > 20, last.slice(0, 80));

    const mine = await page.$$eval('.sar-msg--me', (els) => els.length);
    check('the visitor message is echoed', mine >= 1, `${mine}`);

    await page.screenshot({ path: `${SHOTS}/chat-desktop.png` });

    // Ask for a person.
    const linkExists = Boolean(await page.$('.sar-link'));
    if (linkExists) {
      await page.click('.sar-link');
      await page.waitForSelector('.sar-banner--pending', { timeout: 20000 }).catch(() => {});
      check('human handoff banner appears', Boolean(await page.$('.sar-banner--pending')));
    }

    check('chat produced no page errors', pageErrors.length === 0, pageErrors.join(' | '));
  }

  // Mobile sheet
  await page.setViewport(PHONE);
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.sar-launcher', { timeout: 15000 }).catch(() => {});
  if (await page.$('.sar-launcher')) {
    await page.click('.sar-launcher');
    await page.waitForSelector('.sar-panel', { timeout: 10000 });
    const box = await page.$eval('.sar-panel', (el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) };
    });
    check('mobile chat panel fits the viewport width', box.w <= 390 && box.w >= 380, JSON.stringify(box));
    check('mobile chat panel fits vertically', box.top >= 0 && box.h <= 844, JSON.stringify(box));
    const composerVisible = await page.$eval('.sar-composer', (el) => {
      const r = el.getBoundingClientRect();
      return r.bottom <= 845 && r.top > 0;
    });
    check('composer is on screen on mobile', composerVisible);
    await page.screenshot({ path: `${SHOTS}/chat-mobile.png` });
  }

  // ─────────────────────────────────────────────────────────────────────
  console.log('\n=== 5. Admin: analytics charts + new tabs ===');
  await page.setViewport(DESKTOP);

  // Log in through the API and seed the token the app reads.
  const token = await page.evaluate(async (api) => {
    const r = await fetch(`${api}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@greenwood.edu', password: '0000' }),
    });
    const d = await r.json();
    return d.access_token || '';
  }, API);
  check('admin login via API', token.length > 20);

  await page.evaluate((t) => {
    localStorage.setItem('admin_token', t);
    localStorage.setItem('admin_email', 'test@greenwood.edu');
  }, token);

  pageErrors.length = 0;
  await page.goto(`${BASE}/admin/dashboard?tab=analytics`, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(2500);

  check('analytics tab rendered', Boolean(await page.$('.an-wrap')));

  const kpis = await page.$$eval('.an-kpi', (els) => els.length);
  check('four KPI cards', kpis === 4, `${kpis}`);

  const panels = await page.$$eval('.an-panel', (els) => els.length);
  check('four panels (3 charts + visitor log)', panels === 4, `${panels}`);

  // Recharts renders <svg class="recharts-surface">.
  const svgs = await page.$$eval('.an-panel svg.recharts-surface', (els) =>
    els.map((e) => ({ w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) })),
  );
  const drawn = svgs.filter((s) => s.w > 100 && s.h > 40);
  check('chart SVGs have real dimensions', drawn.length >= 1, JSON.stringify(svgs.slice(0, 5)));

  // The point of removing the fallbacks: zeros, not invented numbers.
  const kpiValues = await page.$$eval('.an-kpi__value', (els) => els.map((e) => e.textContent.trim()));
  check('KPI values render', kpiValues.length === 4, JSON.stringify(kpiValues));
  check(
    'no seeded demo numbers (old fallback showed 582 / 1,280 / 18,450)',
    !kpiValues.some((v) => ['582', '1,280', '18,450', '7,320', '342'].includes(v)),
    JSON.stringify(kpiValues),
  );

  // Exactly one legend for the traffic panel (the duplicate footer is gone).
  const trafficLegends = await page.evaluate(() => {
    const panels = [...document.querySelectorAll('.an-panel')];
    const t = panels.find((p) => (p.querySelector('.an-panel__title')?.textContent || '').includes('Website Traffic'));
    return t ? t.querySelectorAll('.an-legend').length : -1;
  });
  check('traffic panel has exactly one legend (duplicate removed)', trafficLegends === 1, `${trafficLegends}`);

  // The 4th KPI is a meter now, not a second redundant sparkline.
  const meters = await page.$$eval('.an-meter', (els) => els.length);
  check('unique-visitor share meter replaces the duplicate sparkline', meters === 1, `${meters}`);

  const rangeBtns = await page.$$eval('.an-range__btn', (els) => els.map((e) => e.textContent.trim()));
  check('traffic range selector present', rangeBtns.length === 3, JSON.stringify(rangeBtns));

  check('analytics produced no page errors', pageErrors.length === 0, pageErrors.join(' | '));
  await page.screenshot({ path: `${SHOTS}/admin-analytics.png`, fullPage: true });

  // Range switching must not crash.
  if (rangeBtns.length === 3) {
    pageErrors.length = 0;
    for (const label of ['12M', 'ALL', '30D']) {
      await page.evaluate((l) => {
        const b = [...document.querySelectorAll('.an-range__btn')].find((x) => x.textContent.trim() === l);
        if (b) b.click();
      }, label);
      await sleep(700);
    }
    check('switching traffic ranges does not error', pageErrors.length === 0, pageErrors.join(' | '));
  }

  // ── Saraswati AI admin tab ──
  pageErrors.length = 0;
  await page.goto(`${BASE}/admin/dashboard?tab=saraswati`, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(2000);
  check('Saraswati AI admin tab rendered', Boolean(await page.$('.sk-wrap')));
  const kbEntries = await page.$$eval('.sk-item', (els) => els.length);
  check('knowledge entries listed', kbEntries >= 1, `${kbEntries} entries`);
  check('add-answer form present', Boolean(await page.$('#sk-content')));
  check('document upload zone present', Boolean(await page.$('.sk-drop')));
  check('Saraswati tab produced no page errors', pageErrors.length === 0, pageErrors.join(' | '));
  await page.screenshot({ path: `${SHOTS}/admin-saraswati.png`, fullPage: true });

  // Test-a-question box
  await page.type('.sk-test, .sk-inline .sk-input', 'school bus');
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.sk-btn--primary')].find((x) => x.textContent.includes('Test'));
    if (b) b.click();
  });
  await page.waitForSelector('.sk-test__verdict', { timeout: 15000 }).catch(() => {});
  check('test-a-question returns a verdict', Boolean(await page.$('.sk-test__verdict')));

  // ── Chat requests tab ──
  pageErrors.length = 0;
  await page.goto(`${BASE}/admin/dashboard?tab=chat-requests`, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(2000);
  check('Chat Requests tab rendered', Boolean(await page.$('.hr-wrap')));
  const rows = await page.$$eval('.hr-row', (els) => els.length);
  check('the escalated conversation is in the inbox', rows >= 1, `${rows} rows`);
  if (rows >= 1) {
    await page.click('.hr-row');
    await page.waitForSelector('.hr-transcript', { timeout: 15000 }).catch(() => {});
    const msgs = await page.$$eval('.hr-msg', (els) => els.length);
    check('transcript loads', msgs >= 2, `${msgs} messages`);
    check('reply composer present', Boolean(await page.$('#hr-reply')));
  }
  check('Chat Requests produced no page errors', pageErrors.length === 0, pageErrors.join(' | '));
  await page.screenshot({ path: `${SHOTS}/admin-chat-requests.png`, fullPage: true });

  // ── Admin tab bar must be reachable on mobile ──
  await page.setViewport(PHONE);
  await page.goto(`${BASE}/admin/dashboard?tab=news`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  const tabBar = await page.evaluate(() => {
    const c = document.querySelector('.adm-tabs-container');
    if (!c) return null;
    return { scrollW: c.scrollWidth, clientW: c.clientWidth, scrollable: c.scrollWidth > c.clientWidth };
  });
  check('admin tab bar scrolls horizontally on mobile', tabBar?.scrollable === true, JSON.stringify(tabBar));
  const bodyOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check('admin dashboard has no horizontal page overflow on mobile', bodyOverflow <= 1, `${bodyOverflow}px`);
  await page.screenshot({ path: `${SHOTS}/admin-mobile.png` });

  // ─────────────────────────────────────────────────────────────────────
  console.log('\n=== 6. Mobile form field sizes (iOS zoom threshold) ===');
  await page.setViewport(PHONE);
  await page.goto(`${BASE}/appointments`, { waitUntil: 'networkidle2' });
  await sleep(1200);
  const apptFormRendered = Boolean(await page.$('.appt-form'));
  check('appointments form actually renders (page does not white-screen)', apptFormRendered);
  const fieldSizes = await page.$$eval('.appt-input, .appt-select, .appt-textarea', (els) =>
    els.map((e) => ({
      fs: parseFloat(getComputedStyle(e).fontSize),
      h: Math.round(e.getBoundingClientRect().height),
    })),
  );
  const tooSmall = fieldSizes.filter((f) => f.fs < 16);
  check(
    `all ${fieldSizes.length} appointment fields are >= 16px (no iOS focus zoom)`,
    fieldSizes.length > 0 && tooSmall.length === 0,
    `${tooSmall.length} under 16px`,
  );
  const shortTargets = fieldSizes.filter((f) => f.h < 44);
  check(
    'appointment touch targets are >= 44px tall',
    fieldSizes.length > 0 && shortTargets.length === 0,
    `${shortTargets.length} too short of ${fieldSizes.length}`,
  );
  const apptOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check('appointments page has no horizontal overflow', apptOverflow <= 1, `${apptOverflow}px`);
  await page.screenshot({ path: `${SHOTS}/appointments-mobile.png` });

  // Enquiry modal fields
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await sleep(800);
  const opened = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button, a')].find((x) =>
      /enquire|enquiry/i.test(x.textContent || ''),
    );
    if (b) { b.click(); return true; }
    return false;
  });
  if (opened) {
    await page.waitForSelector('.enquiry-form__input', { timeout: 10000 }).catch(() => {});
    const eSizes = await page.$$eval('.enquiry-form__input, .enquiry-form__select, .enquiry-form__textarea', (els) =>
      els.map((e) => parseFloat(getComputedStyle(e).fontSize)),
    );
    check(
      `all ${eSizes.length} enquiry-form fields are >= 16px on mobile`,
      eSizes.length > 0 && eSizes.every((s) => s >= 16),
      JSON.stringify(eSizes),
    );
    const modalFits = await page.$eval('.enquiry-modal', (el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), fits: r.width <= 390 && r.height <= 844 };
    }).catch(() => null);
    check('enquiry modal fits a 390x844 screen', modalFits?.fits === true, JSON.stringify(modalFits));
    await page.screenshot({ path: `${SHOTS}/enquiry-mobile.png` });
  }

  // ─────────────────────────────────────────────────────────────────────
  console.log('\n=== 7. Other public pages load clean ===');
  await page.setViewport(DESKTOP);
  for (const path of ['/ebooks', '/calendar', '/classes', '/news', '/fees-scholarships', '/visit-campus', '/appointments']) {
    pageErrors.length = 0;
    const resp = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(800);
    const bodyLen = await page.$eval('body', (b) => b.innerText.trim().length);
    const status = resp?.status() ?? 0;
    // 304 Not Modified is a cache hit, not a failure — puppeteer reports
    // ok() === false for it.
    const served = status === 0 || (status >= 200 && status < 400);
    check(`${path} renders content`, served && bodyLen > 200, `status=${status} len=${bodyLen}`);
    check(`${path} no page errors`, pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
  }

  // ─────────────────────────────────────────────────────────────────────
  console.log(`\n${'='.repeat(66)}`);
  console.log(`  PASSED: ${pass}    FAILED: ${fail}`);
  if (failures.length) {
    console.log('\n  Failures:');
    failures.forEach((f) => console.log(`   - ${f}`));
  }
  console.log(`  Screenshots in ./${SHOTS}/`);
  console.log('='.repeat(66));

  await browser.close();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error('\nHARNESS ERROR:', e);
  process.exit(2);
});
