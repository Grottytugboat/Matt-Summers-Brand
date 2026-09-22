import { plan } from './plan.js';
import { names, namingNote } from './names.js';

/** @typedef {{text:string, at:string}} Entry */
/** @typedef {{owner:string, due:string, target:string, notes:string}} GoalEdit */
/** @typedef {{version:number, name:string, startDate:string, objective:string, goals:Record<string,string>, goalEdits:Record<string,GoalEdit>, creators:Record<string,string>, publishDates:Record<string,string>, reviews:Record<string,string>, feedback:Record<string,Entry[]>, budget:Record<string,number|null>, economics:Record<string,number|null>, metrics:Record<string,number|null>, activity:Entry[], decision:string, learning:string}} StudioState */

const STORAGE_KEY = 'brand-studio-demo-v1';
const views = {
  overview: ['The portfolio', 'A clear view. A shared ambition.'],
  campaign: ['Nightbird campaign', 'One brand. A considered first launch.'],
  content: ['Creative studio', 'Distinctive ideas, ready to shape.'],
  goals: ['Goals & milestones', 'Turn ambition into a plan.'],
  results: ['Results & learning', 'Evidence before expansion.'],
  brands: ['The brand house', 'A name with room to grow.'],
};
/** @type {Record<string,string>} */
const statuses = { todo: 'To do', progress: 'In progress', blocked: 'Blocked', done: 'Complete', concept: 'Concept', changes: 'Changes requested', approved: 'Concept approved', shortlist: 'To shortlist', agreed: 'Brief agreed', sent: 'Sample sent', draft: 'Draft received', ready: 'Ready to schedule' };
/** @type {StudioState} */
let state = defaults();
let storageAvailable = true;
let contentFilter = 'all';
let goalFilter = 'all';
let toastTimer = 0;
/** @type {HTMLElement|null} */
let dialogOpener = null;

/** @returns {StudioState} */
function defaults() {
  return { version: 1, name: '', startDate: '', objective: plan.objective, goals: Object.fromEntries(plan.goals.map(g => [g.id, 'todo'])), goalEdits: {}, creators: Object.fromEntries(plan.creators.map(c => [c.id, 'shortlist'])), publishDates: {}, reviews: Object.fromEntries(plan.content.map(c => [c.id, 'concept'])), feedback: {}, budget: Object.fromEntries(plan.budget.map(b => [b.id, null])), economics: { revenue: null, product: null, fulfilment: null, fees: null, reserve: null }, metrics: { visits: null, interest: null, spend: null }, activity: [], decision: 'undecided', learning: '' };
}
/** @param {unknown} value @param {number} [limit] */
function textValue(value, limit = 2000) { return typeof value === 'string' ? value.slice(0, limit) : ''; }
/** @param {unknown} value */
function numberValue(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100000000 ? value : null; }
/** @param {unknown} value @returns {Record<string,unknown>} */
function objectValue(value) { return value && typeof value === 'object' && !Array.isArray(value) ? /** @type {Record<string,unknown>} */ (value) : {}; }
/** @param {string} value */
function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + 'T12:00:00Z')) && new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) === value; }
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const saved = objectValue(JSON.parse(raw));
    if (saved.version === 1) {
      state.name = names.some(n => n.name === saved.name) ? textValue(saved.name) : '';
      state.startDate = validDate(textValue(saved.startDate)) ? textValue(saved.startDate) : '';
      state.objective = textValue(saved.objective, 600) || plan.objective;
      state.learning = textValue(saved.learning);
      state.decision = ['undecided', 'improve', 'extend', 'pause'].includes(textValue(saved.decision)) ? textValue(saved.decision) : 'undecided';
      for (const id of Object.keys(state.goals)) {
        const status = objectValue(saved.goals)[id];
        if (['todo', 'progress', 'blocked', 'done'].includes(textValue(status))) state.goals[id] = textValue(status);
        const edit = objectValue(objectValue(saved.goalEdits)[id]);
        if (Object.keys(edit).length) state.goalEdits[id] = { owner: textValue(edit.owner, 80), due: textValue(edit.due, 80), target: textValue(edit.target, 300), notes: textValue(edit.notes) };
      }
      for (const id of Object.keys(state.creators)) {
        const status = textValue(objectValue(saved.creators)[id]);
        if (['shortlist', 'agreed', 'sent', 'draft', 'ready'].includes(status)) state.creators[id] = status;
        const publishDate = textValue(objectValue(saved.publishDates)[id]); if (validDate(publishDate)) state.publishDates[id] = publishDate;
      }
      for (const id of Object.keys(state.reviews)) {
        const status = textValue(objectValue(saved.reviews)[id]);
        if (['concept', 'changes', 'approved'].includes(status)) state.reviews[id] = status;
        const feedback = objectValue(saved.feedback)[id];
        if (Array.isArray(feedback)) state.feedback[id] = feedback.slice(0, 20).map(e => ({ text: textValue(objectValue(e).text), at: textValue(objectValue(e).at, 40) })).filter(e => e.text && !Number.isNaN(Date.parse(e.at)));
      }
      for (const group of ['budget', 'economics', 'metrics']) {
        const target = /** @type {Record<string,number|null>} */ (state[/** @type {'budget'|'economics'|'metrics'} */ (group)]);
        for (const id of Object.keys(target)) target[id] = numberValue(objectValue(saved[group])[id]);
      }
      if (Array.isArray(saved.activity)) state.activity = saved.activity.slice(0, 15).map(e => ({ text: textValue(objectValue(e).text, 300), at: textValue(objectValue(e).at, 40) })).filter(e => e.text && !Number.isNaN(Date.parse(e.at)));
    }
  }
} catch { storageAvailable = false; }

/** @param {unknown} value */
function escape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c); }
/** @param {string} selector @param {ParentNode} [root] @returns {HTMLElement} */
function el(selector, root = document) { const node = root.querySelector(selector); if (!(node instanceof HTMLElement)) throw new Error(`Missing ${selector}`); return node; }
/** @param {string} id @returns {HTMLDialogElement} */
function dialog(id) { return /** @type {HTMLDialogElement} */ (el(id)); }
/** @param {number|null} value */
function money(value) { return value === null ? 'Not set' : new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(value); }
/** @param {string} at */
function dateLabel(at) { return new Date(at).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); }
/** @param {string} status */
function badge(status) { return `<span class="badge ${escape(status)}">${escape(statuses[status] || status)}</span>`; }
/** @param {string} message */
function toast(message) { el('#studio-toast').hidden = false; el('#studio-toast').textContent = message; el('#studio-toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = window.setTimeout(() => { el('#studio-toast').classList.remove('visible'); el('#studio-toast').hidden = true; }, 4500); }
function updateStorageNotice() { el('#storage-notice').textContent = storageAvailable ? 'Interactive preview · Edits are saved only in this browser. No campaigns are live.' : 'Interactive preview · Browser storage is unavailable. Edits last for this visit; export your plan to keep a copy.'; }
/** @param {string} message */
function save(message) {
  state.activity.unshift({ text: message, at: new Date().toISOString() });
  state.activity = state.activity.slice(0, 15);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; } catch { storageAvailable = false; }
  updateStorageNotice();
  toast(`${message}${storageAvailable ? ' · Saved in this browser.' : ' · This visit only.'}`);
}
function readiness() { const critical = plan.goals.filter(g => g.critical); const done = critical.filter(g => state.goals[g.id] === 'done').length; return { total: critical.length, done, percent: Math.round(done / critical.length * 100) }; }
/** @param {number} index */
function weekDate(index) {
  if (!state.startDate) return `Week ${index + 1}`;
  const day = new Date(state.startDate + 'T12:00:00Z'); day.setUTCDate(day.getUTCDate() + index * 7);
  return day.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}
/** @param {string} id */
function campaignLink(id) { const url = new URL('https://matt-summers-brand.vercel.app/nightbird/'); url.searchParams.set('utm_source', plan.content.some(c => c.id === id) ? 'creative-preview' : id); if (plan.content.some(c => c.id === id)) url.searchParams.set('utm_content', id); url.searchParams.set('utm_medium', 'creator'); url.searchParams.set('utm_campaign', 'nightbird_first_flight'); return url.href; }
/** @param {string} value @param {string} label */
async function copy(value, label) {
  try { await navigator.clipboard.writeText(value); toast(`${label} copied.`); }
  catch { openDialog('Copy ' + label.toLowerCase(), `<p>Your browser did not allow automatic copying. Select and copy the text below.</p><label class="field">${escape(label)}<textarea readonly rows="5">${escape(value)}</textarea></label>`); }
}
/** @param {string} title @param {string} body @param {string} [eyebrow] */
function openDialog(title, body, eyebrow = 'NIGHTBIRD / PLANNING PREVIEW') {
  dialogOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  el('#dialog-content').innerHTML = `<div class="dialog-header"><div><p class="eyebrow">${escape(eyebrow)}</p><h2 id="detail-title">${escape(title)}</h2></div><button class="icon-button" data-action="close-dialog" aria-label="Close dialog">×</button></div>${body}`;
  const d = dialog('#detail-dialog'); d.setAttribute('aria-labelledby', 'detail-title'); d.showModal();
}
function closeDialog() { dialog('#detail-dialog').close(); }
dialog('#detail-dialog').addEventListener('close', () => { if (dialogOpener?.isConnected) dialogOpener.focus(); });

function overviewView() {
  const ready = readiness();
  const approved = Object.values(state.reviews).filter(s => s === 'approved').length;
  const complete = Object.values(state.goals).filter(s => s === 'done').length;
  const budgetSet = Object.values(state.budget).some(v => v !== null);
  const total = Object.values(state.budget).reduce((sum, value) => (sum || 0) + (value || 0), 0);
  return `<section class="hero-card overview-hero"><div class="hero-copy"><p class="eyebrow">THE FIRST CHAPTER / NIGHTBIRD</p><h2>A spirit worth<br><em>building around.</em></h2><p>One considered launch. Three creative directions. A shared plan to find what resonates.</p><a class="button primary" href="#campaign">Open the campaign <span aria-hidden="true">↗</span></a><span class="hero-footnote">30-day proposed pilot · Launch date ${state.startDate ? escape(weekDate(0)) : 'to agree'}</span></div><div class="hero-art"><img src="/assets/nightbird-campaign-mobile.webp" alt="Nightbird Vodka in a champagne-gold Art Deco setting" width="1024" height="1536"><span>40% ALC/VOL · 700 mL</span></div></section>
  <section class="stat-grid" aria-label="Planning progress"><article class="stat-card"><span class="eyebrow">Portfolio</span><strong>03</strong><p>Distinctive brands</p></article><article class="stat-card"><span class="eyebrow">Concept approvals</span><strong>${approved}<small> / 3</small></strong><p>Browser demo decisions</p></article><article class="stat-card"><span class="eyebrow">Plan progress</span><strong>${complete}<small> / ${plan.goals.length}</small></strong><p>Milestones marked complete</p></article><article class="stat-card"><span class="eyebrow">Planning budget</span><strong class="money-stat">${budgetSet ? money(total) : 'To agree'}</strong><p>AUD estimates · No spend committed</p></article></section>
  <div class="two-column"><section class="panel"><div class="panel-header"><div><p class="eyebrow">THE NEXT DECISIONS</p><h2>Make room for progress.</h2></div><a href="#goals" class="text-link">All goals ↗</a></div><div class="check-list">${plan.decisions.slice(0, 3).map((d, i) => `<div class="decision-row"><span class="number-label">0${i + 1}</span><div><h3>${escape(d.title)}</h3><p>${escape(d.detail)}</p><small>Proposed owner: ${escape(d.owner)}</small></div></div>`).join('')}</div></section><section class="panel readiness-panel"><p class="eyebrow">BEFORE WE GO LIVE</p><h2>A deliberate start.</h2><div class="readiness-value">${ready.done}<span> / ${ready.total}</span></div><p>Critical planning milestones completed in this demo.</p><div class="progress-track" role="progressbar" aria-label="Critical milestone progress" aria-valuenow="${ready.percent}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:${ready.percent}%"></div></div><p class="info-note">${ready.done === ready.total ? 'Demo checklist complete. Actual launch still requires verified approvals and connected services.' : 'Stock, shipping, creator eligibility and measurement need agreement before a live test.'}</p><a href="#goals" class="button secondary">Review readiness →</a></section></div>
  <section class="panel"><div class="panel-header"><div><p class="eyebrow">ONE HOUSE. INDIVIDUAL CHARACTER.</p><h2>The portfolio.</h2></div><a href="#brands" class="text-link">Explore the house ↗</a></div><div class="three-column portfolio-cards">${portfolioCards()}</div></section>
  <div class="two-column"><section class="panel"><div class="panel-header"><h2>Recent activity</h2><span class="badge">This browser</span></div>${activityList()}</section><section class="panel"><p class="eyebrow">A CLEAR PARTNERSHIP</p><h2>Everyone knows their part.</h2>${plan.roles.map(r => `<div class="role-row"><h3>${escape(r.name)}</h3><p>${escape(Array.isArray(r.responsibilities) ? r.responsibilities.join(' · ') : r.responsibilities)}</p></div>`).join('')}<p class="muted small">Proposed responsibilities for discussion, not agreed commitments.</p></section></div>`;
}
function portfolioCards() {
  return [ { name: 'Nightbird', category: 'VODKA / FIRST PILOT', image: 'nightbird-campaign.webp', url: 'nightbird', copy: 'Quiet confidence. A distinctive first chapter.', stage: 'Campaign planned' }, { name: 'Benson’s', category: 'BOURBON & COLA', image: 'bensons-campaign.webp', url: 'bensons', copy: 'Classic character. A future pilot to assess.', stage: 'Next opportunity' }, { name: 'Mountain', category: 'VODKA PREMIX', image: 'mountain-campaign.webp', url: 'mountain', copy: 'Vivid energy. Its own creative world.', stage: 'Discovery' } ].map(b => `<article class="brand-card"><a href="/${b.url}/" target="_blank" rel="noopener"><img src="/assets/${b.image}" alt="${escape(b.name)} campaign concept" loading="lazy"><span class="brand-image-link" aria-hidden="true">↗</span></a><div><p class="eyebrow">${b.category}</p><h3>${b.name}</h3><p>${b.copy}</p><span class="badge">${b.stage}</span></div></article>`).join('');
}
function activityList() { return state.activity.length ? `<ol class="activity-list">${state.activity.slice(0, 5).map(a => `<li><span class="status-dot"></span><div><p>${escape(a.text)}</p><time datetime="${escape(a.at)}">${escape(dateLabel(a.at))}</time></div></li>`).join('')}</ol>` : `<div class="empty-state compact"><span aria-hidden="true">↗</span><h3>Your first move starts here.</h3><p>Approve a concept, update a goal or set a budget. Your demo activity will appear here.</p></div>`; }

function campaignView() {
  return `<section class="panel campaign-intro"><div><p class="eyebrow">NIGHTBIRD / 30-DAY PILOT</p><h2>${escape(plan.title)}</h2><p>${escape(state.objective)}</p><div class="link-row"><button class="button secondary" data-action="edit-campaign">Edit campaign plan</button><a href="/docs/nightbird-launch-plan.md" download class="text-link">Download full brief ↓</a></div></div><div class="campaign-seal"><span>01</span><p>PROVE THE PROCESS.<br>THEN EXPAND.</p></div></section>
  <section aria-labelledby="timeline-title"><div class="section-heading"><div><p class="eyebrow">A CONSIDERED SEQUENCE</p><h2 id="timeline-title">The first four weeks.</h2></div><span class="badge">Proposed schedule</span></div><div class="timeline">${plan.phases.map((p, i) => `<article class="phase"><div class="phase-top"><span class="number-label">0${i + 1}</span><span>${escape(weekDate(i))}</span></div><h3>${escape(p.title)}</h3><p>${escape(p.summary)}</p><ul>${p.deliverables.map(d => `<li>${escape(d)}</li>`).join('')}</ul></article>`).join('')}</div></section>
  <section class="panel"><div class="panel-header"><div><p class="eyebrow">THE CREATOR COHORT</p><h2>Three voices. One point of view.</h2></div><span class="badge">Unfilled planning slots</span></div><p class="muted">No creators have been booked or contacted. Each slot defines the fit, deliverables and brief to agree.</p><div class="creator-board">${plan.creators.map((c, i) => `<article class="creator-card"><div class="creator-card-top"><span class="creator-avatar">0${i + 1}</span>${badge(state.creators[c.id])}</div><p class="eyebrow">${escape(c.specialism)}</p><h3>${escape(c.name)}</h3><p>${escape(c.brief)}</p><ul>${c.deliverables.map(d => `<li>${escape(d)}</li>`).join('')}</ul><div class="creator-card-footer"><span>${state.publishDates[c.id] ? `Planned release: ${escape(state.publishDates[c.id])}` : 'Release date to agree'}</span><button class="button secondary" data-action="creator" data-id="${escape(c.id)}">Open brief ↗</button></div></article>`).join('')}</div></section>
  <div class="two-column"><section class="panel"><div class="panel-header"><div><p class="eyebrow">PLAN THE INVESTMENT</p><h2>A budget with purpose.</h2></div><button class="text-link" data-action="edit-budget">Edit estimates ↗</button></div>${plan.budget.map(b => `<div class="budget-row"><div><h3>${escape(b.label)}</h3><p>${escape(b.description)}</p></div><strong>${money(state.budget[b.id])}</strong></div>`).join('')}<div class="budget-total"><span>Planning total · AUD</span><strong>${Object.values(state.budget).every(v => v === null) ? 'To agree' : money(Object.values(state.budget).reduce((a, b) => (a || 0) + (b || 0), 0))}</strong></div><p class="muted small">Estimates only. No fees, creator engagements or advertising spend are authorised by this preview.</p></section><section class="panel"><p class="eyebrow">THE COMMERCIAL QUESTION</p><h2>What can an order support?</h2><p>Model a possible order before setting an acquisition budget. Use amounts excluding GST consistently.</p>${economicsSummary()}<button class="button secondary" data-action="edit-economics">Explore order economics →</button><p class="muted small">Planning calculator. Unknown costs stay blank; it does not forecast demand or profit.</p></section></div>`;
}
function economicsSummary() {
  const e = state.economics;
  if (Object.values(e).some(v => v === null)) return '<div class="economics-result"><span>Available before acquisition</span><strong>Costs to confirm</strong><p>Product, delivery, fees and the contribution you want to retain.</p></div>';
  const available = (e.revenue || 0) - (e.product || 0) - (e.fulfilment || 0) - (e.fees || 0) - (e.reserve || 0);
  return `<div class="economics-result"><span>Available for acquisition per order</span><strong>${money(available)}</strong><p>${available <= 0 ? 'This scenario leaves no acquisition allowance. Revisit the offer and costs.' : 'After entered variable costs and retained contribution. Creator costs also need to be recovered.'}</p></div>`;
}

function contentView() {
  const items = plan.content.filter(c => contentFilter === 'all' || state.reviews[c.id] === contentFilter);
  return `<div class="section-heading"><div><p class="eyebrow">NIGHTBIRD / CREATIVE DIRECTION</p><h2>Three ways to take flight.</h2><p class="muted">Proposed storyboards and scripts. No creator footage has been submitted.</p></div><span class="badge">Concept library</span></div><div class="tabs" role="group" aria-label="Filter concepts">${[['all', 'All concepts'], ['concept', 'To review'], ['changes', 'Changes requested'], ['approved', 'Approved']].map(([value, label]) => `<button class="filter-button" data-action="content-filter" data-value="${value}" aria-pressed="${contentFilter === value}">${label}</button>`).join('')}</div><div class="content-grid">${items.map(c => `<article class="content-card"><button class="content-image" data-action="review" data-id="${escape(c.id)}" aria-label="Review ${escape(c.title)}"><img src="${escape(c.image)}" alt="Nightbird campaign artwork illustrating ${escape(c.title)}" loading="lazy"><span class="concept-label">STORYBOARD / ${escape(c.duration)}</span><span class="content-image-arrow" aria-hidden="true">↗</span></button><div class="content-card-body"><div class="content-meta"><span class="eyebrow">CONCEPT 0${plan.content.indexOf(c) + 1} / ${escape(c.format)}</span>${badge(state.reviews[c.id])}</div><h3>${escape(c.title)}</h3><p>${escape(c.angle)}</p><blockquote>“${escape(c.hook)}”</blockquote><button class="button secondary" data-action="review" data-id="${escape(c.id)}">Review concept <span aria-hidden="true">↗</span></button></div></article>`).join('') || '<div class="empty-state"><h3>No concepts in this view.</h3><p>Choose All concepts to see the complete creative direction.</p></div>'}</div><section class="panel"><p class="eyebrow">A SHARED STANDARD</p><h2>Brand character, carried into every frame.</h2><div class="three-column"><div><h3>Visual direction</h3><p>Clear glass, champagne gold, deep midnight and considered close-ups. Let Nightbird’s actual bottle lead.</p></div><div><h3>Creator direction</h3><p>Adult talent, calm delivery and a clear demonstration. A creator produces the asset; posting to their audience is a separate deliverable to agree.</p></div><div><h3>Before publication</h3><p>Confirm usage rights, approved claims, disclosure and responsible placement. Concept approval here is a demo decision, not release clearance.</p><a class="text-link" href="https://abac.org.au/education-training/industry-guide-to-unlocking-abac-resources/" target="_blank" rel="noopener">ABAC review resources ↗</a></div></div></section>`;
}

function goalsView() {
  const goals = plan.goals.filter(g => goalFilter === 'all' || g.phase === goalFilter);
  const done = Object.values(state.goals).filter(s => s === 'done').length;
  return `<section class="panel goals-summary"><div><p class="eyebrow">ACCOUNTABILITY, MADE VISIBLE</p><h2>Small decisions. Real momentum.</h2><p>Every milestone has an owner, a target and evidence. Responsibilities and deadlines remain proposed.</p></div><div class="goal-tally"><strong>${done}<span> / ${plan.goals.length}</span></strong><p>Demo milestones completed</p></div></section><div class="tabs" role="group" aria-label="Filter goals">${[['all', 'All milestones'], ['readiness', 'Launch readiness'], ['production', 'Content & production'], ['learning', 'Measurement & learning']].map(([value, label]) => `<button class="filter-button" data-action="goal-filter" data-value="${value}" aria-pressed="${goalFilter === value}">${label}</button>`).join('')}</div><div class="goals-list">${goals.map(g => { const edit = state.goalEdits[g.id]; return `<article class="goal-card"><div class="goal-status"><span class="goal-symbol ${state.goals[g.id]}" aria-hidden="true">${state.goals[g.id] === 'done' ? '✓' : '○'}</span></div><div class="goal-body"><div class="goal-title-row"><h3>${escape(g.title)}</h3>${g.critical ? '<span class="badge critical">Launch prerequisite</span>' : ''}</div><p>${escape(g.detail)}</p><div class="goal-details"><span><small>OWNER</small>${escape(edit?.owner || g.owner)}</span><span><small>DUE</small>${escape(edit?.due || g.due)}</span><span><small>TARGET</small>${escape(edit?.target || g.target)}</span></div></div><div class="goal-action">${badge(state.goals[g.id])}<button class="text-link" data-action="goal" data-id="${escape(g.id)}">Update milestone ↗</button></div></article>`; }).join('')}</div><p class="info-note">Completing a demo milestone records your planning decision in this browser. It does not verify stock, licences, creator agreements or connected services.</p>`;
}

function resultsView() {
  const m = state.metrics;
  const rate = m.visits !== null && m.interest !== null && m.visits > 0 ? `${(m.interest / m.visits * 100).toFixed(1)}%` : '—';
  const cost = m.spend !== null && m.interest !== null && m.interest > 0 ? money(m.spend / m.interest) : '—';
  return `<section class="panel measurement-intro"><div><p class="eyebrow">MEASUREMENT / NOT CONNECTED</p><h2>The story behind the numbers.</h2><p>The pilot should tell us which creative generates qualified interest and what to improve. No live visitor, lead or sales data is connected to this preview.</p></div><button class="button secondary" data-action="edit-metrics">Try sample figures ↗</button></section><div class="metric-grid">${[{ label: 'Campaign visits', value: m.visits === null ? '—' : m.visits.toLocaleString('en-AU'), note: 'Manual demo entry' }, { label: 'Qualified enquiries', value: m.interest === null ? '—' : m.interest.toLocaleString('en-AU'), note: 'Manual demo entry' }, { label: 'Enquiry rate', value: rate, note: 'Enquiries ÷ visits' }, { label: 'Cost per enquiry', value: cost, note: 'Entered spend ÷ enquiries' }].map(i => `<article class="metric-card"><p>${i.label}</p><strong>${i.value}</strong><span>${i.note}</span></article>`).join('')}</div><p class="info-note">${m.visits !== null || m.interest !== null || m.spend !== null ? 'Illustrative figures entered in this browser. These are not measured campaign results.' : 'No invented performance. Use “Try sample figures” to explore how a future report would work.'}</p>
  <section class="panel"><div class="panel-header"><div><p class="eyebrow">CONNECT EVIDENCE TO DECISIONS</p><h2>A measurement plan.</h2></div><span class="badge">Before paid launch</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Measure</th><th scope="col">Why it matters</th><th scope="col">Source needed</th><th scope="col">Readiness</th></tr></thead><tbody>${plan.metrics.map(m => `<tr><th scope="row">${escape(m.label)}</th><td>${escape(m.description)}</td><td>${escape(m.source)}</td><td><span class="badge">${escape(m.availability)}</span></td></tr>`).join('')}</tbody></table></div></section>
  <div class="two-column"><section class="panel"><p class="eyebrow">THE WEEKLY CONVERSATION</p><h2>What have we learned?</h2><form id="learning-form"><label class="field">Observations and next experiment<textarea name="learning" maxlength="2000" rows="5" placeholder="Which hook earned attention? What questions came back? What would we change?">${escape(state.learning)}</textarea></label><label class="field">Proposed decision<select name="decision">${[['undecided', 'Evidence still needed'], ['improve', 'Improve the creative or offer'], ['extend', 'Extend the test within an agreed budget'], ['pause', 'Pause and resolve the blockers']].map(([v, label]) => `<option value="${v}" ${state.decision === v ? 'selected' : ''}>${label}</option>`).join('')}</select></label><button class="button primary" type="submit">Save review</button></form></section><section class="panel"><p class="eyebrow">SALES / LATER PHASE</p><h2>Profitability follows real orders.</h2><div class="empty-state compact"><span aria-hidden="true">↗</span><h3>Commerce is not connected.</h3><p>Once a sales destination is ready, connect order revenue, acquisition cost, product cost and fulfilment cost. Agree attribution and distinguish platform-reported figures from recorded orders.</p></div><a href="#campaign" class="text-link">Model the offer first ↗</a></section></div>`;
}

function brandsView() {
  return `<section class="panel naming-intro"><div><p class="eyebrow">THE PARENT BRAND / NAMING DIRECTION</p><h2>An established house.<br><em>An independent spirit.</em></h2><p>Names designed to sit confidently above Nightbird, Benson’s and Mountain, with room for the next chapter.</p><p class="muted">${escape(namingNote)}</p></div><div class="name-preview"><p class="eyebrow">YOUR WORKSPACE PREVIEW</p><strong>${escape(state.name || 'The Brand House')}</strong><span>NIGHTBIRD · BENSON’S · MOUNTAIN</span><p>Previewing a name changes this dashboard only. The public site remains unchanged until a name is chosen.</p></div></section><div class="section-heading"><h2>The shortlist.</h2><a href="/docs/parent-name-options.md" download class="text-link">Download naming notes ↓</a></div><div class="name-grid">${names.map((n, i) => `<article class="name-card ${state.name === n.name ? 'selected' : ''}"><div class="name-card-top"><span class="eyebrow">0${i + 1} / ${escape(n.character)}</span>${i === 0 ? '<span class="badge">Recommended direction</span>' : ''}</div><h3>${escape(n.name)}</h3><p class="name-descriptor">${escape(n.descriptor)}</p><p>${escape(n.reason)}</p><blockquote>${escape(n.tagline)}</blockquote><button class="button ${state.name === n.name ? 'primary' : 'secondary'}" data-action="preview-name" data-id="${escape(n.id)}" aria-pressed="${state.name === n.name}">${state.name === n.name ? 'Previewing this name ✓' : 'Preview this name ↗'}</button></article>`).join('')}</div><section class="panel"><div class="panel-header"><div><p class="eyebrow">THE BRANDS UNDERNEATH</p><h2>Individual worlds. One collective.</h2></div><a href="/" target="_blank" rel="noopener" class="text-link">View public website ↗</a></div><div class="three-column portfolio-cards">${portfolioCards()}</div></section><section class="panel"><p class="eyebrow">SHARED BRAND LIBRARY</p><h2>Keep the foundations together.</h2><div class="three-column library-links"><a class="library-item" href="/assets/nightbird-campaign.webp" download><span>01 / NIGHTBIRD</span><strong>Campaign artwork</strong><small>Generated concept · WebP ↓</small></a><a class="library-item" href="/docs/nightbird-launch-plan.md" download><span>02 / STRATEGY</span><strong>The pilot brief</strong><small>Proposed launch plan · Markdown ↓</small></a><a class="library-item" href="/docs/parent-name-options.md" download><span>03 / NAMING</span><strong>The naming shortlist</strong><small>Preliminary research · Markdown ↓</small></a></div><p class="muted small">Artwork is a presentation concept based on supplied product references. Replace with approved production photography for live campaigns.</p></section>`;
}

/** @returns {keyof typeof views} */
function currentView() { const key = location.hash.slice(1); return Object.hasOwn(views, key) ? /** @type {keyof typeof views} */ (key) : 'overview'; }
/** @param {boolean} [focus] */
function render(focus = false) {
  const key = currentView();
  const generators = { overview: overviewView, campaign: campaignView, content: contentView, goals: goalsView, results: resultsView, brands: brandsView };
  el('#studio-view').innerHTML = generators[key]();
  el('#view-title').textContent = views[key][0]; el('#view-kicker').textContent = views[key][1];
  document.title = `${views[key][0]} — ${state.name || 'Brand Studio'} · Preview`;
  for (const link of document.querySelectorAll('[data-view]')) {
    if (!(link instanceof HTMLElement)) continue;
    const active = link.dataset.view === key; link.classList.toggle('active', active); link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  }
  for (const name of document.querySelectorAll('[data-workspace-name]')) name.textContent = state.name || 'The Brand Studio';
  if (focus) { el('#studio-view').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
}

/** @param {string} id */
function showReview(id) {
  const c = plan.content.find(i => i.id === id); if (!c) return;
  openDialog(c.title, `<div class="review-media"><img src="${escape(c.image)}" alt="Nightbird concept artwork"><span>CONCEPT ARTWORK · NO CREATOR FOOTAGE</span></div><div class="review-topline">${badge(state.reviews[id])}<span>${escape(c.format)} · ${escape(c.duration)}</span></div><p>${escape(c.angle)}</p><div class="detail-grid"><section><p class="eyebrow">THE OPENING HOOK</p><blockquote class="review-hook">“${escape(c.hook)}”</blockquote><h3>The sequence</h3><ol class="shot-list">${c.shots.map(s => `<li>${escape(s)}</li>`).join('')}</ol></section><section><p class="eyebrow">PROPOSED SCRIPT</p><p class="brief-script">${escape(c.script)}</p><h3>Caption direction</h3><p>${escape(c.caption)}</p><p><strong>Call to action:</strong> ${escape(c.cta)}</p><button class="text-link" type="button" data-action="copy-link" data-id="${escape(id)}">Copy concept link ↗</button></section></div><div class="info-note"><strong>Before production and publication</strong><ul>${c.checks.map(s => `<li>${escape(s)}</li>`).join('')}</ul></div><form id="review-form" data-id="${escape(id)}"><label class="field">Feedback for the next version<textarea name="feedback" maxlength="1500" rows="3" placeholder="Add specific feedback. A note is required when requesting changes."></textarea></label><p class="form-error" role="alert" id="review-error"></p><div class="dialog-actions"><button class="button secondary" type="submit" name="decision" value="changes">Request changes</button><button class="button primary" type="submit" name="decision" value="approved">Approve concept · Demo</button></div></form><p class="muted small">Recorded as a demo reviewer decision in this browser. This does not approve an ad, contact a creator or publish content.</p>${state.feedback[id]?.length ? `<section class="review-history"><h3>Concept history</h3>${state.feedback[id].map(f => `<div><small>Demo reviewer · ${escape(dateLabel(f.at))}</small><p>${escape(f.text)}</p></div>`).join('')}</section>` : ''}`);
}

/** @param {string} id */
function showCreator(id) {
  const c = plan.creators.find(c => c.id === id); if (!c) return;
  openDialog(c.name, `<p class="eyebrow">UNFILLED SLOT / ${escape(c.specialism)}</p><p>${escape(c.brief)}</p><h3>Proposed deliverables</h3><ul class="shot-list">${c.deliverables.map(d => `<li>${escape(d)}</li>`).join('')}</ul><div class="detail-grid"><div><h3>Audience fit</h3><p>${escape(c.audience)}</p></div><div><h3>Rights & fee</h3><p>${escape(c.rights)}. Fee to agree before engagement.</p></div></div><form id="creator-form" data-id="${escape(id)}"><label class="field">Planning stage<select name="status">${['shortlist', 'agreed', 'sent', 'draft', 'ready'].map(s => `<option value="${s}" ${state.creators[id] === s ? 'selected' : ''}>${statuses[s]}</option>`).join('')}</select></label><label class="field">Proposed release date<input type="date" name="publishDate" min="2026-01-01" max="2035-12-31" value="${escape(state.publishDates[id] || '')}"></label><p class="info-note">Changing the stage simulates coordination only. No creator has been contacted and no content is scheduled.</p><div class="dialog-actions"><button class="button primary" type="submit">Save stage</button><button class="button secondary" type="button" data-action="copy-link" data-id="${escape(id)}">Copy campaign link</button></div></form><label class="field">Proposed destination<input readonly value="${escape(campaignLink(id))}" aria-label="Campaign destination"></label><p class="muted small">The link opens the current Nightbird showcase. Tracking tags are prepared; analytics and an enquiry form are not connected.</p>`);
}

/** @param {string} id */
function showGoal(id) {
  const g = plan.goals.find(g => g.id === id); if (!g) return;
  const edit = state.goalEdits[id];
  openDialog(g.title, `<p>${escape(g.detail)}</p><div class="info-note"><strong>Evidence needed</strong><p>${escape(g.evidence)}</p></div><form id="goal-form" data-id="${escape(id)}"><div class="form-grid"><label class="field">Proposed owner<input name="owner" required maxlength="80" value="${escape(edit?.owner || g.owner)}"></label><label class="field">Due / milestone<input name="due" required maxlength="80" value="${escape(edit?.due || g.due)}"></label></div><label class="field">Target<input name="target" required maxlength="300" value="${escape(edit?.target || g.target)}"></label><label class="field">Status<select name="status">${['todo', 'progress', 'blocked', 'done'].map(s => `<option value="${s}" ${state.goals[id] === s ? 'selected' : ''}>${statuses[s]}</option>`).join('')}</select></label><label class="field">Notes / evidence<textarea name="notes" maxlength="2000" rows="3">${escape(edit?.notes || '')}</textarea></label><div class="dialog-actions"><button class="button primary" type="submit">Save milestone</button><button class="button secondary" type="button" data-action="close-dialog">Cancel</button></div></form>`);
}

/** @param {string} group @param {{id:string,label:string,description?:string}[]} fields @param {string} title @param {string} note */
function numericDialog(group, fields, title, note) {
  const values = state[/** @type {'budget'|'economics'|'metrics'} */ (group)];
  openDialog(title, `<p>${note}</p><form id="numbers-form" data-group="${group}"><div class="form-grid">${fields.map(f => `<label class="field">${escape(f.label)}<input type="number" name="${f.id}" min="0" max="100000000" step="${group === 'metrics' && f.id !== 'spend' ? '1' : '0.01'}" value="${values[f.id] ?? ''}" placeholder="Not set">${f.description ? `<small>${escape(f.description)}</small>` : ''}</label>`).join('')}</div><p class="form-error" id="numbers-error" role="alert"></p><div class="dialog-actions"><button class="button primary" type="submit">Save ${group === 'metrics' ? 'sample figures' : 'estimates'}</button><button class="button secondary" type="button" data-action="close-dialog">Cancel</button></div></form>`);
}

/** @param {string} action @param {HTMLElement} target */
function perform(action, target) {
  const id = target.dataset.id || '';
  if (action === 'export-readable') return exportReadable();
  if (action === 'export-data') return exportBackup();
  if (action === 'close-dialog') return closeDialog();
  if (action === 'review') return showReview(id);
  if (action === 'creator') return showCreator(id);
  if (action === 'goal') return showGoal(id);
  if (action === 'copy-link') { void copy(campaignLink(id), 'Campaign link'); return; }
  if (action === 'content-filter' || action === 'goal-filter') {
    const value = target.dataset.value || 'all'; if (action === 'content-filter') contentFilter = value; else goalFilter = value;
    render(); el(`[data-action="${action}"][data-value="${value}"]`).focus(); return;
  }
  if (action === 'preview-name') { const name = names.find(n => n.id === id); if (!name) return; state.name = name.name; save(`Previewing ${name.name}`); render(); el(`[data-action="preview-name"][data-id="${id}"]`).focus(); return; }
  if (action === 'edit-campaign') return openDialog('Shape the first launch.', `<form id="campaign-form"><label class="field">Proposed start date<input type="date" name="start" min="2026-01-01" max="2035-12-31" value="${escape(state.startDate)}"></label><p class="muted small">Leave blank to keep the plan relative to Week 1. Setting a date does not schedule publishing.</p><label class="field">Pilot objective<textarea name="objective" required maxlength="600" rows="4">${escape(state.objective)}</textarea></label><div class="dialog-actions"><button class="button primary" type="submit">Save campaign plan</button></div></form>`);
  if (action === 'edit-budget') return numericDialog('budget', plan.budget, 'Make the investment deliberate.', 'Enter proposed AUD amounts excluding GST. Blank means unknown, not zero. These are estimates, not approvals to spend.');
  if (action === 'edit-economics') return numericDialog('economics', [{ id: 'revenue', label: 'Net order revenue', description: 'After discounts, excluding GST.' }, { id: 'product', label: 'Landed product cost' }, { id: 'fulfilment', label: 'Packaging, fulfilment & freight' }, { id: 'fees', label: 'Payment fees & loss allowance' }, { id: 'reserve', label: 'Contribution to retain', description: 'Before fixed overheads.' }], 'Understand the order.', 'A planning scenario in AUD, excluding GST. Complete every field to see the acquisition allowance. Do not use unproven repeat purchases to fill a gap.');
  if (action === 'edit-metrics') return numericDialog('metrics', [{ id: 'visits', label: 'Sample campaign visits' }, { id: 'interest', label: 'Sample qualified enquiries', description: 'Cannot exceed entered campaign visits.' }, { id: 'spend', label: 'Sample campaign spend (AUD)' }], 'Explore a future report.', 'Illustrative figures only. Entries remain clearly labelled as demo data. Leave fields blank to show they are not connected.');
  if (action === 'reset-demo') return openDialog('Reset this browser’s demo?', `<p>This removes local name choices, goals, feedback, estimates and sample figures. Export the plan first if you want to keep them.</p><div class="dialog-actions"><button class="button secondary" data-action="close-dialog">Keep my changes</button><button class="button primary" data-action="confirm-reset">Reset demonstration</button></div>`, 'WORKSPACE / DEMONSTRATION');
  if (action === 'confirm-reset') { state = defaults(); contentFilter = 'all'; goalFilter = 'all'; try { localStorage.removeItem(STORAGE_KEY); storageAvailable = true; } catch { storageAvailable = false; } closeDialog(); render(); updateStorageNotice(); el('#studio-view').focus(); toast('Demonstration reset in this browser.'); }
}

document.addEventListener('click', event => {
  const target = event.target instanceof Element ? event.target.closest('[data-action]') : null;
  if (target instanceof HTMLElement) perform(target.dataset.action || '', target);
});

document.addEventListener('submit', event => {
  if (!(event.target instanceof HTMLFormElement)) return;
  const form = event.target; event.preventDefault(); const data = new FormData(form); const id = form.dataset.id || '';
  if (form.id === 'review-form') {
    const submitter = event instanceof SubmitEvent && event.submitter instanceof HTMLButtonElement ? event.submitter.value : '';
    if (!['changes', 'approved'].includes(submitter)) return;
    const note = String(data.get('feedback') || '').trim();
    if (submitter === 'changes' && !note) { el('#review-error').textContent = 'Add a note so the requested changes are clear.'; /** @type {HTMLTextAreaElement} */ (el('textarea', form)).focus(); return; }
    state.reviews[id] = submitter; state.feedback[id] ||= []; state.feedback[id].unshift({ text: `${submitter === 'approved' ? 'Concept approved (demo).' : 'Changes requested (demo).'}${note ? ' ' + note : ''}`, at: new Date().toISOString() }); state.feedback[id] = state.feedback[id].slice(0, 20);
    save(`${plan.content.find(c => c.id === id)?.title}: ${submitter === 'approved' ? 'concept approved' : 'changes requested'}`);
  } else if (form.id === 'creator-form') { state.creators[id] = String(data.get('status')); state.publishDates[id] = String(data.get('publishDate') || ''); save(`${plan.creators.find(c => c.id === id)?.name}: ${statuses[state.creators[id]]}`);
  } else if (form.id === 'goal-form') {
    state.goals[id] = String(data.get('status')); state.goalEdits[id] = { owner: String(data.get('owner')).trim(), due: String(data.get('due')).trim(), target: String(data.get('target')).trim(), notes: String(data.get('notes')).trim() }; save(`${plan.goals.find(g => g.id === id)?.title}: ${statuses[state.goals[id]]}`);
  } else if (form.id === 'campaign-form') { const start = String(data.get('start') || ''); if (start && !validDate(start)) return; state.startDate = start; state.objective = String(data.get('objective')).trim(); save('Nightbird campaign plan updated');
  } else if (form.id === 'numbers-form') {
    const group = /** @type {'budget'|'economics'|'metrics'} */ (form.dataset.group);
    const values = { ...state[group] }; for (const key of Object.keys(values)) { const raw = String(data.get(key) || ''); values[key] = raw === '' ? null : numberValue(Number(raw)); }
    if (group === 'metrics' && values.interest !== null && values.visits !== null && values.interest > values.visits) { el('#numbers-error').textContent = 'Sample enquiries cannot exceed sample visits.'; return; }
    state[group] = values; save(group === 'metrics' ? 'Illustrative report figures updated' : `${group === 'budget' ? 'Campaign budget' : 'Order economics'} estimates updated`);
  } else if (form.id === 'learning-form') { state.learning = String(data.get('learning')).trim(); state.decision = String(data.get('decision')); save('Weekly learning review saved'); return; }
  else return;
  closeDialog(); render(); el('#studio-view').focus({ preventScroll: true });
});

/** @param {string} content @param {string} type @param {string} filename */
function download(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Your plan export is ready.');
}
function exportBackup() {
  const data = { type: 'Brand Studio demonstration export', exportedAt: new Date().toISOString(), notice: 'Browser-local planning demonstration. Sample entries are not real campaign performance, approvals or commitments. No contacts or sales services are connected.', plan, workspace: state };
  download(JSON.stringify(data, null, 2), 'application/json', 'nightbird-workspace-plan.json');
}
function exportReadable() {
  const html = `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nightbird — Proposed launch plan</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f4ef;color:#18352d;font:15px/1.65 Arial,sans-serif}main{max-width:960px;margin:auto;padding:60px 40px}h1,h2{font-family:Georgia,serif;font-weight:400}h1{font-size:52px;line-height:1.1;margin:22px 0}h2{font-size:30px;margin:0 0 18px}h3{font-size:16px}p{margin:10px 0}header{border-bottom:2px solid #18352d;padding-bottom:35px}section{border-bottom:1px solid #cfd5c8;padding:30px 0}small,.label{font-size:11px;color:#61705f}.label{text-transform:uppercase;letter-spacing:2px}.note{padding:16px;background:#e7ebdf}.grid{display:grid;grid-template-columns:1fr 1fr;gap:28px}article{break-inside:avoid}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid #cfd5c8}th{background:#e7ebdf}blockquote{font-family:Georgia,serif;font-size:22px;margin:20px 0}footer{padding-top:28px;font-size:11px;color:#61705f}@media(max-width:600px){main{padding:30px 18px}.grid{grid-template-columns:1fr}h1{font-size:38px}table{font-size:10px}th,td{padding:6px}}@media print{body{background:white}main{max-width:none;padding:0}h1{font-size:36px}section{break-inside:auto}article,header{break-inside:avoid}thead{display:table-header-group}tr{break-inside:avoid}@page{size:A4;margin:18mm}}</style></head><body><main><header><p class="label">${escape(state.name || 'The Brand Studio')} / Proposed first chapter</p><h1>Nightbird,<br>introduced properly.</h1><p>${escape(state.objective)}</p><p>Prepared for Matt & Tim · Exported ${escape(new Date().toLocaleDateString('en-AU'))}</p><p class="note">Planning demonstration. All responsibilities, estimates and dates are proposals. Demo approvals are not actual release clearance. No creators are engaged, no campaign is live and no enquiries or orders are connected. Open this file in a browser and use Print to save a PDF.</p></header><section><h2>The first 30 days</h2><div class="grid">${plan.phases.map((p, i) => `<article><p class="label">${escape(weekDate(i))}</p><h3>${escape(p.title)}</h3><p>${escape(p.summary)}</p><ul>${p.deliverables.map(d => `<li>${escape(d)}</li>`).join('')}</ul></article>`).join('')}</div></section><section><h2>The creator plan</h2>${plan.creators.map(c => `<article><h3>${escape(c.name)} — ${escape(c.specialism)}</h3><p>${escape(c.brief)}</p><p>${c.deliverables.map(escape).join(' · ')}</p><small>Demo stage: ${escape(statuses[state.creators[c.id]])} · Release: ${escape(state.publishDates[c.id] || 'To agree')} · Fee and rights to agree</small></article>`).join('')}</section><section><h2>The creative direction</h2>${plan.content.map(c => `<article><p class="label">${escape(c.duration)} / ${escape(statuses[state.reviews[c.id]])}</p><h3>${escape(c.title)}</h3><blockquote>“${escape(c.hook)}”</blockquote><p>${escape(c.script)}</p><ol>${c.shots.map(s => `<li>${escape(s)}</li>`).join('')}</ol><p><strong>Caption:</strong> ${escape(c.caption)}</p><p><strong>Action:</strong> ${escape(c.cta)}</p>${(state.feedback[c.id] || []).map(f => `<p class="note"><small>Demo feedback · ${escape(dateLabel(f.at))}</small><br>${escape(f.text)}</p>`).join('')}</article>`).join('')}</section><section><h2>Goals and readiness</h2><table><thead><tr><th>Milestone</th><th>Owner / due</th><th>Target / demo status</th></tr></thead><tbody>${plan.goals.map(g => { const edit = state.goalEdits[g.id]; return `<tr><th>${escape(g.title)}</th><td>${escape(edit?.owner || g.owner)}<br>${escape(edit?.due || g.due)}</td><td>${escape(edit?.target || g.target)}<br><strong>${escape(statuses[state.goals[g.id]])}</strong>${edit?.notes ? `<p>${escape(edit.notes)}</p>` : ''}</td></tr>`; }).join('')}</tbody></table></section><section><h2>Planning budget</h2><p>AUD estimates, excluding GST. Unknown values are not treated as committed costs.</p><table><tbody>${plan.budget.map(b => `<tr><th>${escape(b.label)}</th><td>${escape(b.description)}</td><td>${escape(money(state.budget[b.id]))}</td></tr>`).join('')}</tbody></table><h3>Order economics scenario</h3>${economicsSummary()}<p>${Object.entries(state.economics).map(([key, value]) => `${escape(key)}: ${escape(money(value))}`).join(' · ')}</p></section><section><h2>Evidence and next action</h2><p>Live analytics, interest capture and commerce are not connected. Any figures below are manually entered examples.</p><p>Sample visits: ${state.metrics.visits ?? 'Not entered'} · Sample qualified enquiries: ${state.metrics.interest ?? 'Not entered'} · Sample spend: ${money(state.metrics.spend)}</p><p><strong>Proposed decision:</strong> ${escape(state.decision)}</p><p>${escape(state.learning || 'No review notes entered yet.')}</p>${plan.metrics.map(m => `<article><h3>${escape(m.label)}</h3><p>${escape(m.description)} Source needed: ${escape(m.source)}.</p></article>`).join('')}</section><section><h2>Proposed responsibilities</h2>${plan.roles.map(r => `<article><h3>${escape(r.name)}</h3><p>${escape(r.responsibilities)}</p></article>`).join('')}</section><footer>Browser-local planning export. Naming choices are creative concepts, not cleared trade marks or domains. Product artwork and concepts need final approval before publication. Source guidance: ${plan.sources.map(s => `<a href="${escape(s.url)}">${escape(s.label)}</a>`).join(' · ')}</footer></main></body></html>`;
  download(html, 'text/html', 'nightbird-launch-plan.html');
}
el('#export-plan').addEventListener('click', () => {
  openDialog('Take the plan with you.', `<p>Export the current plan, including your goals, estimates and review notes. Browser edits are not shared automatically.</p><div class="export-options"><button class="button primary" data-action="export-readable">Download readable plan ↓</button><p class="muted small">A formatted HTML document. Open it in a browser to read, share or print to PDF.</p><button class="button secondary" data-action="export-data">Download data backup ↓</button><p class="muted small">A structured JSON copy of the proposal and this browser’s demo records.</p></div>`, 'WORKSPACE / EXPORT');
});

const sidebar = el('#studio-sidebar');
/** @param {boolean} open @param {boolean} [restore] */
function toggleSidebar(open, restore = true) {
  document.body.classList.toggle('sidebar-open', open); el('#sidebar-toggle').setAttribute('aria-expanded', String(open));
  el('#sidebar-backdrop').hidden = !open; sidebar.inert = innerWidth < 768 && !open; el('.studio-shell').inert = open;
  if (open) { sidebar.setAttribute('role', 'dialog'); sidebar.setAttribute('aria-modal', 'true'); sidebar.setAttribute('aria-label', 'Workspace navigation'); el('#sidebar-close').focus(); }
  else { sidebar.removeAttribute('role'); sidebar.removeAttribute('aria-modal'); if (restore) el('#sidebar-toggle').focus(); }
}
el('#sidebar-toggle').addEventListener('click', () => toggleSidebar(!document.body.classList.contains('sidebar-open')));
el('#sidebar-backdrop').addEventListener('click', () => toggleSidebar(false));
el('#sidebar-close').addEventListener('click', () => toggleSidebar(false));
sidebar.addEventListener('click', event => { if (event.target instanceof Element && event.target.closest('a[data-view]') && document.body.classList.contains('sidebar-open')) { toggleSidebar(false, false); el('#studio-view').focus({ preventScroll: true }); } });
document.addEventListener('keydown', event => {
  if (!document.body.classList.contains('sidebar-open')) return;
  if (event.key === 'Escape') { event.preventDefault(); toggleSidebar(false); }
  if (event.key === 'Tab') {
    const items = [...sidebar.querySelectorAll('a[href],button')].filter(e => e instanceof HTMLElement && e.getClientRects().length);
    const first = /** @type {HTMLElement} */ (items[0]); const last = /** @type {HTMLElement} */ (items[items.length - 1]);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.addEventListener('resize', () => { if (innerWidth >= 768 && document.body.classList.contains('sidebar-open')) toggleSidebar(false, false); sidebar.inert = innerWidth < 768 && !document.body.classList.contains('sidebar-open'); });
sidebar.inert = innerWidth < 768;
window.addEventListener('hashchange', () => render(true));
updateStorageNotice();
render();
