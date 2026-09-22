/* Browser integration checks. Writes only to an isolated browser's demo storage. */
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright');

const input = process.env.STUDIO_BASE_URL || process.argv.find((arg, i) => i > 1 && !arg.startsWith('--')) || 'http://127.0.0.1:4173/studio/';
const base = new URL(input);
if (base.pathname === '/') base.pathname = '/studio/';
if (!base.pathname.endsWith('/')) base.pathname += '/';
base.hash = '';
const functionalOnly = process.argv.includes('--functional-only');
const titles = {
  overview: 'The portfolio', campaign: 'Nightbird campaign', content: 'Creative studio',
  goals: 'Goals & milestones', results: 'Results & learning', brands: 'The brand house',
};

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true });
  const page = await context.newPage();
  const pageErrors = [];
  const failedResources = [];
  const mutations = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => { if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) mutations.push(`${request.method()} ${request.url()}`); });
  page.setDefaultTimeout(8000);
  const action = name => page.locator(`[data-action="${name}"]`);
  const modal = page.locator('#detail-dialog');
  const value = selector => page.locator(selector).innerText();
  const check = message => console.log(`PASS ${message}`);
  async function view(name) {
    await page.goto(`${base.href}#${name}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(expected => document.querySelector('#view-title')?.textContent === expected, titles[name]);
  }
  async function closed() { await modal.waitFor({ state: 'hidden' }); }
  async function numbers(group, values) {
    await action(`edit-${group}`).click();
    for (const [name, number] of Object.entries(values)) await modal.locator(`[name="${name}"]`).fill(String(number));
    await modal.locator('button[type="submit"]').click();
    await closed();
  }
  async function hasNoOverflow(label) {
    const size = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth }));
    assert.ok(size.width <= size.viewport + 1, `${label}: page width ${size.width} exceeds ${size.viewport}`);
  }
  async function publicFingerprint() {
    const response = await context.request.get(new URL('/', base).href);
    assert.equal(response.status(), 200, 'Public homepage must remain available');
    return createHash('sha256').update(await response.body()).digest('hex');
  }

  try {
    const publicBefore = await publicFingerprint();
    await view('overview');
    assert.match(await value('#storage-notice'), /saved only in this browser.*No campaigns are live/s);
    assert.match(await value('.money-stat'), /To agree/);

    await view('content');
    assert.equal(await page.locator('.content-card').count(), 3);
    const firstReview = action('review').first();
    const conceptId = await firstReview.getAttribute('data-id');
    await firstReview.click();
    await modal.getByRole('button', { name: 'Request changes', exact: true }).click();
    assert.match(await value('#review-error'), /Add a note/);
    assert.equal(await modal.getAttribute('open'), '', 'Empty change request must stay open');
    await modal.locator('[name="feedback"]').fill('Demo QA: hold the bottle label longer in the opening shot.');
    await modal.getByRole('button', { name: 'Request changes', exact: true }).click();
    await closed();
    const conceptCard = page.locator('.content-card').filter({ has: page.locator(`[data-id="${conceptId}"]`) });
    assert.match(await conceptCard.innerText(), /Changes requested/);
    await page.reload({ waitUntil: 'networkidle' });
    await action('review').first().click();
    assert.match(await value('.review-history'), /hold the bottle label longer/);
    await modal.getByRole('button', { name: 'Approve concept · Demo', exact: true }).click();
    await closed();
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-action="content-filter"][data-value="approved"]').click();
    assert.equal(await page.locator('.content-card').count(), 1, 'Approved filter should show the saved concept');
    assert.match(await page.locator('.content-card').first().innerText(), /Concept approved/);
    check('Concept feedback validation, approval, filters and reload persistence');

    await view('goals');
    const goalId = await action('goal').first().getAttribute('data-id');
    await action('goal').first().click();
    await modal.locator('[name="owner"]').fill('Matt + Tim · demo review');
    await modal.locator('[name="due"]').fill('Week 1 · after joint review');
    await modal.locator('[name="status"]').selectOption('done');
    await modal.locator('[name="notes"]').fill('Demo QA: review the proposed objective together before commissioning.');
    await modal.getByRole('button', { name: 'Save milestone', exact: true }).click();
    await closed();
    await page.reload({ waitUntil: 'networkidle' });
    const goalCard = page.locator('.goal-card').filter({ has: page.locator(`[data-id="${goalId}"]`) });
    assert.match(await goalCard.innerText(), /Matt \+ Tim · demo review/);
    assert.match(await goalCard.innerText(), /Complete/);
    await page.locator(`[data-action="goal"][data-id="${goalId}"]`).click();
    assert.match(await modal.locator('[name="notes"]').inputValue(), /before commissioning/);
    assert.equal(await modal.locator('[name="status"]').inputValue(), 'done');
    await page.keyboard.press('Escape');
    await closed();
    check('Goal owner, milestone, status and evidence survive reload');

    await view('campaign');
    assert.match(await value('.budget-total'), /To agree/);
    assert.match(await value('.economics-result'), /Costs to confirm/);
    await numbers('budget', { content: 0 });
    assert.match(await value('.budget-total strong'), /^\$0$/);
    assert.equal(await page.locator('.budget-row strong').filter({ hasText: 'Not set' }).count(), 4, 'Unknown budget fields must remain unknown');
    await action('edit-budget').click();
    assert.equal(await modal.locator('[name="content"]').inputValue(), '0');
    assert.equal(await modal.locator('[name="media"]').inputValue(), '');
    await modal.locator('[name="content"]').fill('');
    await modal.locator('button[type="submit"]').click();
    await closed();
    assert.match(await value('.budget-total'), /To agree/);
    await numbers('economics', { revenue: 70, product: 20, fulfilment: 10, fees: 0 });
    assert.match(await value('.economics-result'), /Costs to confirm/, 'One unknown cost must block a complete allowance');
    await numbers('economics', { reserve: 0 });
    assert.match(await value('.economics-result strong'), /^\$40$/);
    await numbers('economics', { revenue: 0 });
    assert.match(await value('.economics-result strong'), /^-\$30$/);
    assert.match(await value('.economics-result'), /no acquisition allowance/);
    await numbers('budget', { content: 300, media: 0 });
    check('Budget and order economics distinguish unknown, zero and negative scenarios');

    await view('results');
    await action('edit-metrics').click();
    await modal.locator('[name="visits"]').fill('10');
    await modal.locator('[name="interest"]').fill('11');
    await modal.locator('[name="spend"]').fill('100');
    await modal.locator('button[type="submit"]').click();
    assert.match(await value('#numbers-error'), /cannot exceed sample visits/);
    await modal.locator('[name="visits"]').fill('0');
    await modal.locator('[name="interest"]').fill('0');
    await modal.locator('button[type="submit"]').click();
    await closed();
    assert.deepEqual(await page.locator('.metric-card strong').allTextContents(), ['0', '0', '—', '—']);
    await numbers('metrics', { visits: 100, interest: 10, spend: 50 });
    assert.deepEqual(await page.locator('.metric-card strong').allTextContents(), ['100', '10', '10.0%', '$5']);
    assert.match(await value('#studio-view'), /Illustrative figures.*not measured campaign results/s);
    check('Sample-report validation, zero denominators and labelled calculations');

    await view('brands');
    const firstName = action('preview-name').first();
    const nameCard = page.locator('.name-card').first();
    const chosenName = await nameCard.locator('h3').innerText();
    await firstName.click();
    assert.equal(await page.locator('[data-workspace-name]').first().innerText(), chosenName);
    assert.equal(await value('.name-preview strong'), chosenName);
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await value('.name-preview strong'), chosenName);
    assert.equal(await publicFingerprint(), publicBefore, 'Dashboard name preview must not mutate the public homepage');
    check('Name preview persists in the dashboard without changing the public brand');

    await page.locator('#export-plan').click();
    const downloadEvent = page.waitForEvent('download');
    await action('export-data').click();
    const download = await downloadEvent;
    assert.equal(download.suggestedFilename(), 'nightbird-workspace-plan.json');
    const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
    assert.match(exported.type, /demonstration/);
    assert.match(exported.notice, /not real campaign performance/);
    assert.equal(exported.workspace.name, chosenName);
    assert.equal(exported.workspace.reviews[conceptId], 'approved');
    assert.equal(exported.workspace.goals[goalId], 'done');
    assert.equal(exported.workspace.budget.content, 300);
    assert.equal(exported.plan.phases.length, 4);
    if (await modal.isVisible()) { await page.keyboard.press('Escape'); await closed(); }
    check('JSON export includes the complete plan and actual browser-local edits');

    await page.locator('#export-plan').click();
    const readableEvent = page.waitForEvent('download');
    await action('export-readable').click();
    const readable = await readableEvent;
    assert.match(readable.suggestedFilename(), /\.html$/);
    const readableHtml = await readFile(await readable.path(), 'utf8');
    const readableText = await page.evaluate(html => new DOMParser().parseFromString(html, 'text/html').body.textContent, readableHtml);
    assert.ok(readableText.includes(chosenName), 'Readable plan includes the chosen name');
    assert.match(readableText, /Nightbird/);
    assert.match(readableText, /demonstration|demo|preview/i, 'Readable export distinguishes demo state');
    assert.match(readableText, /Matt \+ Tim · demo review/, 'Readable plan includes edited ownership');
    assert.match(readableText, /Concept approved/i, 'Readable plan includes the concept decision');
    if (await modal.isVisible()) { await page.keyboard.press('Escape'); await closed(); }
    check('Readable HTML export includes the selected identity and saved planning decisions');

    await action('reset-demo').click();
    await modal.getByRole('button', { name: 'Keep my changes', exact: true }).click();
    await closed();
    assert.equal(await value('.name-preview strong'), chosenName, 'Cancelling reset must keep name choice');
    await view('content');
    assert.match(await page.locator('.content-card').first().innerText(), /Concept approved/);
    await action('reset-demo').click();
    await modal.getByRole('button', { name: 'Reset demonstration', exact: true }).click();
    await closed();
    assert.equal(await page.locator('.content-card').count(), 3);
    assert.equal(await page.locator('.content-card .badge.approved').count(), 0);
    await page.reload({ waitUntil: 'networkidle' });
    await view('brands');
    assert.equal(await value('.name-preview strong'), 'The Brand House');
    await view('goals');
    assert.match(await value('.goal-tally'), /^0\s*\/\s*12/);
    await view('results');
    assert.deepEqual(await page.locator('.metric-card strong').allTextContents(), ['—', '—', '—', '—']);
    await view('campaign');
    assert.match(await value('.budget-total'), /To agree/);
    assert.match(await value('.economics-result'), /Costs to confirm/);
    check('Reset confirmation preserves on cancel and clears saved demo changes on confirm');

    await page.setViewportSize({ width: 390, height: 844 });
    await view('overview');
    assert.equal(await page.locator('#studio-sidebar').evaluate(node => node.inert), true, 'Offscreen mobile navigation must be inert');
    await page.locator('#sidebar-toggle').click();
    assert.equal(await page.locator('.studio-shell').evaluate(node => node.inert), true, 'Background must be inert while navigation is open');
    assert.equal(await page.locator('#studio-sidebar').getAttribute('aria-modal'), 'true');
    assert.equal(await page.locator('#sidebar-close').evaluate(node => node === document.activeElement), true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.locator('#studio-sidebar a').last().evaluate(node => node === document.activeElement), true, 'Reverse tab wraps to final navigation link');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#sidebar-close').evaluate(node => node === document.activeElement), true, 'Forward tab wraps to close');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#sidebar-toggle').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#sidebar-toggle').evaluate(node => node === document.activeElement), true, 'Escape restores opener focus');
    assert.equal(await page.locator('#studio-sidebar').evaluate(node => node.inert), true);
    assert.equal(await page.locator('.studio-shell').evaluate(node => node.inert), false);
    await page.locator('#sidebar-toggle').click();
    await page.locator('.studio-nav [data-view="campaign"]').click();
    await page.waitForFunction(() => document.querySelector('#view-title')?.textContent === 'Nightbird campaign');
    assert.equal(await page.locator('#sidebar-toggle').getAttribute('aria-expanded'), 'false');
    check('Mobile navigation traps focus, closes with Escape/selection and keeps hidden links inert');

    if (!functionalOnly) {
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const name of Object.keys(titles)) {
          await view(name);
          for (const image of await page.locator('#studio-view img').all()) {
            await image.scrollIntoViewIfNeeded();
            await image.evaluate(node => node.decode());
            assert.ok(await image.evaluate(node => node.naturalWidth > 0), `${width}/${name}: image failed`);
          }
          await hasNoOverflow(`${width}/${name}`);
          assert.equal(await page.locator('.studio-nav [aria-current="page"]').count(), 1, `${width}/${name}: one current navigation item`);
        }
        check(`All six views: ${width}px, loaded images and no horizontal page overflow`);
      }
    }
    assert.deepEqual(pageErrors, [], 'No uncaught browser exceptions');
    assert.deepEqual(failedResources, [], 'No failed document, script, style or image requests');
    assert.deepEqual(mutations, [], 'Demo interactions must not submit external mutations');
    console.log(`STUDIO CHECK PASSED · ${base.href} · ${functionalOnly ? 'functional flows' : 'functional flows + 24 viewport/view combinations'}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
