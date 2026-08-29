const API = '/api';

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

async function api(path, opts) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if (!res.ok) throw new Error((await res.json()).error || 'request failed');
  return res.json();
}

// ---------- Sidebar navigation ----------
const navItems = document.querySelectorAll('.nav-item[data-tab]');

function switchTab(tab) {
  navItems.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('main > section').forEach(s => s.style.display = 'none');
  document.getElementById('tab-' + tab).style.display = 'block';

  const activeBtn = document.querySelector('.nav-item[data-tab="' + tab + '"]');
  const group = activeBtn && activeBtn.closest('.nav-group');
  if (group) group.classList.remove('collapsed');

  closeSidebar();
  loadTab(tab);
}

navItems.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

document.querySelectorAll('.nav-group-toggle').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.nav-group').classList.toggle('collapsed'));
});

document.querySelectorAll('.quick-link-card[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('show');
}
document.getElementById('sidebar-toggle').addEventListener('click', () => {
  sidebar.classList.add('open');
  sidebarBackdrop.classList.add('show');
});
sidebarBackdrop.addEventListener('click', closeSidebar);

function loadTab(tab) {
  if (tab === 'dashboard') loadDashboard();
  if (tab === 'feed') loadFeed();
  if (tab === 'resources') loadResources();
  if (tab === 'events') loadEvents();
  if (tab === 'commission') loadCommission();
  if (tab === 'mdrt') loadMdrt();
  if (tab === 'sa-asoke') { loadSaAsoke(); loadSaRates(); loadSaRecruits(); }
  if (tab === 'shirts') loadShirts();
  if (tab === 'members') loadMembers();
}

// ---------- Members (shared) ----------
let membersCache = [];
async function fetchMembers() {
  membersCache = await api('/members');
  return membersCache;
}

function fillMemberSelect(select) {
  select.innerHTML = membersCache
    .map(m => `<option value="${escapeAttr(m.name)}">${escapeHtml(m.name)}${m.role ? ' (' + escapeHtml(m.role) + ')' : ''}</option>`)
    .join('');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }

// ---------- Dashboard ----------
async function loadDashboard() {
  const [posts, events, resources] = await Promise.all([
    api('/posts'), api('/events'), api('/resources')
  ]);

  renderPostList('dash-recent-posts', posts.slice(0, 3), { compact: true });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(e => e.eventDate >= today).slice(0, 5);
  const upcomingBox = document.getElementById('dash-upcoming-events');
  upcomingBox.innerHTML = upcoming.length
    ? upcoming.map(eventRowHtml).join('')
    : '<div class="empty">ยังไม่มีนัดหมายที่จะถึง</div>';

  const recentResources = resources.slice(0, 3);
  const resBox = document.getElementById('dash-recent-resources');
  resBox.innerHTML = recentResources.length
    ? recentResources.map(resourceRowHtml).join('')
    : '<div class="empty">ยังไม่มีความรู้ในคลัง</div>';
}

// ---------- Feed ----------
function renderPostList(elId, posts, opts) {
  const box = document.getElementById(elId);
  if (!posts.length) {
    box.innerHTML = '<div class="empty">ยังไม่มีโพสต์</div>';
    return;
  }
  box.innerHTML = posts.map(p => `
    <div style="padding:10px 0;border-bottom:1px solid var(--gridline)">
      <div style="display:flex;justify-content:space-between;gap:8px">
        <span style="font-weight:600">${escapeHtml(p.author || 'ไม่ระบุชื่อ')}</span>
        <span class="hint">${new Date(p.createdAt).toLocaleString('th-TH')}</span>
      </div>
      <div style="margin-top:4px;white-space:pre-wrap">${escapeHtml(p.content)}</div>
      ${opts && opts.compact ? '' : `<div style="margin-top:6px"><button class="ghost" data-del-post="${p.id}">ลบ</button></div>`}
    </div>
  `).join('');

  if (!(opts && opts.compact)) {
    box.querySelectorAll('[data-del-post]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('ลบโพสต์นี้?')) return;
        await api('/posts/' + btn.dataset.delPost, { method: 'DELETE' });
        loadFeed();
      });
    });
  }
}

async function loadFeed() {
  await fetchMembers();
  fillMemberSelect(document.getElementById('pt-author'));
  const posts = await api('/posts');
  document.getElementById('feed-empty').style.display = posts.length ? 'none' : 'block';
  renderPostList('feed-list', posts, { compact: false });
}

document.getElementById('form-post').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    author: document.getElementById('pt-author').value,
    content: document.getElementById('pt-content').value
  };
  await api('/posts', { method: 'POST', body: JSON.stringify(payload) });
  toast('โพสต์แล้ว');
  document.getElementById('pt-content').value = '';
  loadFeed();
});

// ---------- Knowledge base / sales scripts ----------
function resourceRowHtml(r, opts) {
  return `
    <div style="padding:10px 0;border-bottom:1px solid var(--gridline)">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline">
        <span style="font-weight:600">${escapeHtml(r.title)}</span>
        ${r.category ? `<span class="status-pill proposed">${escapeHtml(r.category)}</span>` : ''}
      </div>
      <div style="margin-top:4px;white-space:pre-wrap">${escapeHtml(r.content)}</div>
      <div class="hint" style="margin-top:6px">${escapeHtml(r.createdBy || '-')} · ${new Date(r.createdAt).toLocaleDateString('th-TH')}</div>
      ${opts && opts.withDelete ? `<div style="margin-top:6px"><button class="ghost" data-del-resource="${r.id}">ลบ</button></div>` : ''}
    </div>
  `;
}

async function loadResources() {
  await fetchMembers();
  fillMemberSelect(document.getElementById('rs-author'));
  const resources = await api('/resources');
  const box = document.getElementById('resources-list');
  const empty = document.getElementById('resources-empty');
  if (!resources.length) {
    box.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  box.innerHTML = resources.map(r => resourceRowHtml(r, { withDelete: true })).join('');

  box.querySelectorAll('[data-del-resource]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('ลบรายการนี้?')) return;
      await api('/resources/' + btn.dataset.delResource, { method: 'DELETE' });
      loadResources();
    });
  });
}

document.getElementById('form-resource').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById('rs-title').value,
    category: document.getElementById('rs-category').value,
    content: document.getElementById('rs-content').value,
    createdBy: document.getElementById('rs-author').value
  };
  await api('/resources', { method: 'POST', body: JSON.stringify(payload) });
  toast('บันทึกแล้ว');
  e.target.reset();
  loadResources();
});

// ---------- Events / calendar ----------
function eventRowHtml(ev, opts) {
  return `
    <div style="padding:10px 0;border-bottom:1px solid var(--gridline)">
      <div style="display:flex;justify-content:space-between;gap:8px">
        <span style="font-weight:600">${escapeHtml(ev.title)}</span>
        <span class="hint">${escapeHtml(ev.eventDate)}${ev.eventTime ? ' · ' + escapeHtml(ev.eventTime) : ''}</span>
      </div>
      ${ev.location ? `<div class="hint" style="margin-top:2px">📍 ${escapeHtml(ev.location)}</div>` : ''}
      ${ev.note ? `<div style="margin-top:4px;white-space:pre-wrap">${escapeHtml(ev.note)}</div>` : ''}
      <div class="hint" style="margin-top:4px">${escapeHtml(ev.createdBy || '-')}</div>
      ${opts && opts.withDelete ? `<div style="margin-top:6px"><button class="ghost" data-del-event="${ev.id}">ลบ</button></div>` : ''}
    </div>
  `;
}

async function loadEvents() {
  await fetchMembers();
  fillMemberSelect(document.getElementById('ev-author'));
  const dateEl = document.getElementById('ev-date');
  if (!dateEl.value) dateEl.value = new Date().toISOString().slice(0, 10);

  const events = await api('/events');
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(e => e.eventDate >= today);
  const past = events.filter(e => e.eventDate < today).reverse();

  const upBox = document.getElementById('events-upcoming-list');
  const upEmpty = document.getElementById('events-upcoming-empty');
  if (!upcoming.length) {
    upBox.innerHTML = '';
    upEmpty.style.display = 'block';
  } else {
    upEmpty.style.display = 'none';
    upBox.innerHTML = upcoming.map(ev => eventRowHtml(ev, { withDelete: true })).join('');
  }

  const pastBox = document.getElementById('events-past-list');
  const pastEmpty = document.getElementById('events-past-empty');
  if (!past.length) {
    pastBox.innerHTML = '';
    pastEmpty.style.display = 'block';
  } else {
    pastEmpty.style.display = 'none';
    pastBox.innerHTML = past.map(ev => eventRowHtml(ev, { withDelete: true })).join('');
  }

  document.querySelectorAll('[data-del-event]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('ลบนัดหมายนี้?')) return;
      await api('/events/' + btn.dataset.delEvent, { method: 'DELETE' });
      loadEvents();
    });
  });
}

document.getElementById('form-event').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById('ev-title').value,
    eventDate: document.getElementById('ev-date').value,
    eventTime: document.getElementById('ev-time').value,
    location: document.getElementById('ev-location').value,
    note: document.getElementById('ev-note').value,
    createdBy: document.getElementById('ev-author').value
  };
  await api('/events', { method: 'POST', body: JSON.stringify(payload) });
  toast('บันทึกนัดหมายแล้ว');
  e.target.reset();
  document.getElementById('ev-date').value = new Date().toISOString().slice(0, 10);
  loadEvents();
});

// ---------- Commission calculator ----------
function formatMoney(n) {
  return '฿' + Math.round(n).toLocaleString();
}

function buildGroupedOptions(kind, selectedPlan) {
  const entries = COMMISSION_RATE_TABLE
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => p.kind === kind);
  const categories = [...new Set(entries.map(({ p }) => p.category))];
  return categories.map(cat => {
    const opts = entries
      .filter(({ p }) => p.category === cat)
      .map(({ p, idx }) => `<option value="${idx}"${selectedPlan === p ? ' selected' : ''}>${escapeHtml(p.code)} — ${escapeHtml(p.name)}</option>`)
      .join('');
    return `<optgroup label="${escapeAttr(cat)}">${opts}</optgroup>`;
  }).join('');
}

function tierBadgesHtml(tier, rate) {
  let html = `<span class="badge">พิกัดอายุรับประกัน: ${escapeHtml(tier.ageRange)}</span>`;
  if (tier.participation != null) html += `<span class="badge badge-good">นับผลงาน: ${tier.participation}%</span>`;
  html += `<span class="badge">คอมหลัก: ${rate}%</span>`;
  if (tier.comPlus != null) {
    const note = tier.comPlusNote ? ` (${escapeHtml(tier.comPlusNote)})` : '';
    html += `<span class="badge badge-muted">Com+: ${tier.comPlus}%${note}</span>`;
  }
  if (tier.laBonus != null) html += `<span class="badge badge-muted">LA Bonus: ${tier.laBonus}%</span>`;
  if (tier.note) html += `<span class="badge badge-muted">${escapeHtml(tier.note)}</span>`;
  return html;
}

function getPolicyYear() {
  return document.getElementById('cm-year').value;
}

let commissionWired = false;
let cmSelectedPlan = null;
let cmMainTierIdx = 0;
let cmCurrentComPlus = null;
let cmCurrentLaBonus = null;
let cmRiders = [];
let cmRiderSeq = 0;

function fillPlanSelect() {
  document.getElementById('cm-plan').innerHTML =
    '<option value="">— กรอกอัตราคอมมิชชั่นเอง —</option>' + buildGroupedOptions('main', null);
}

function loadCommission() {
  if (commissionWired) return;
  commissionWired = true;
  document.getElementById('cm-period').textContent = COMMISSION_RATE_PERIOD;
  fillPlanSelect();

  document.getElementById('cm-plan').addEventListener('change', onCommissionPlanChange);
  document.getElementById('cm-condition').addEventListener('change', () => {
    cmMainTierIdx = Number(document.getElementById('cm-condition').value) || 0;
    updateMainFromPlan();
  });
  document.getElementById('cm-year').addEventListener('change', () => {
    if (cmSelectedPlan) updateMainFromPlan();
    cmRiders.forEach(r => { if (r.plan) applyRiderTier(r); });
    renderRiderRows();
    calcCommission();
  });
  ['cm-premium', 'cm-rate'].forEach(id => {
    document.getElementById(id).addEventListener('input', calcCommission);
  });
  document.getElementById('cm-tax').addEventListener('change', calcCommission);
  document.getElementById('cm-add-rider').addEventListener('click', addRiderRow);

  renderRiderRows();
  calcCommission();
}

function onCommissionPlanChange() {
  const idx = document.getElementById('cm-plan').value;
  const conditionField = document.getElementById('cm-condition-field');
  const badges = document.getElementById('cm-badges');
  const rateInput = document.getElementById('cm-rate');
  const manualHint = document.getElementById('cm-manual-hint');

  if (idx === '') {
    cmSelectedPlan = null;
    cmCurrentComPlus = null;
    cmCurrentLaBonus = null;
    conditionField.style.display = 'none';
    badges.style.display = 'none';
    rateInput.readOnly = false;
    manualHint.style.display = '';
    calcCommission();
    return;
  }

  cmSelectedPlan = COMMISSION_RATE_TABLE[Number(idx)];
  cmMainTierIdx = 0;
  rateInput.readOnly = true;
  manualHint.style.display = 'none';

  const conditionSelect = document.getElementById('cm-condition');
  if (cmSelectedPlan.tiers.length > 1) {
    conditionField.style.display = '';
    conditionSelect.innerHTML = cmSelectedPlan.tiers
      .map((t, i) => `<option value="${i}">${escapeHtml(t.condition || t.ageRange)}</option>`)
      .join('');
  } else {
    conditionField.style.display = 'none';
    conditionSelect.innerHTML = '<option value="0"></option>';
  }

  updateMainFromPlan();
}

function updateMainFromPlan() {
  if (!cmSelectedPlan) return;
  const tier = cmSelectedPlan.tiers[cmMainTierIdx];
  const rate = tier[getPolicyYear()];

  document.getElementById('cm-rate').value = rate;
  cmCurrentComPlus = tier.comPlus;
  cmCurrentLaBonus = tier.laBonus;

  const badges = document.getElementById('cm-badges');
  badges.innerHTML = tierBadgesHtml(tier, rate);
  badges.style.display = '';

  calcCommission();
}

// ---- Riders ----
function addRiderRow() {
  cmRiderSeq++;
  cmRiders.push({ id: cmRiderSeq, plan: null, tier: null, tierIdx: 0, premium: 0, rate: 0, comPlus: null, laBonus: null });
  renderRiderRows();
  calcCommission();
}

function removeRiderRow(id) {
  cmRiders = cmRiders.filter(r => r.id !== id);
  renderRiderRows();
  calcCommission();
}

function applyRiderTier(rider) {
  const tier = rider.plan.tiers[rider.tierIdx];
  rider.tier = tier;
  rider.rate = tier[getPolicyYear()];
  rider.comPlus = tier.comPlus;
  rider.laBonus = tier.laBonus;
}

function riderRowHtml(rider) {
  const planOptions = '<option value="">— กรอกอัตราคอมมิชชั่นเอง —</option>' + buildGroupedOptions('rider', rider.plan);
  const hasTiers = rider.plan && rider.plan.tiers.length > 1;
  const conditionOptions = rider.plan
    ? rider.plan.tiers.map((t, i) => `<option value="${i}"${i === rider.tierIdx ? ' selected' : ''}>${escapeHtml(t.condition || t.ageRange)}</option>`).join('')
    : '';
  const badges = rider.plan ? tierBadgesHtml(rider.tier, rider.rate) : '';

  return `
    <div class="rider-row" data-rider-id="${rider.id}">
      <div class="rider-row-head">
        <span class="rider-row-title">สัญญาเพิ่มเติม</span>
        <button type="button" class="ghost" data-remove-rider="${rider.id}">ลบ</button>
      </div>
      <div class="field">
        <label>แบบสัญญาเพิ่มเติม</label>
        <select class="rider-plan-select" data-rider-id="${rider.id}">${planOptions}</select>
      </div>
      <div class="field" style="display:${hasTiers ? '' : 'none'}">
        <label>เงื่อนไข</label>
        <select class="rider-condition-select" data-rider-id="${rider.id}">${conditionOptions}</select>
      </div>
      <div class="row2">
        <div class="field">
          <label>เบี้ยสัญญาเพิ่มเติม (บาท)</label>
          <input type="number" class="rider-premium-input" data-rider-id="${rider.id}" min="0" value="${rider.premium}">
        </div>
        <div class="field">
          <label>อัตราคอมมิชชั่น (%)</label>
          <input type="number" class="rider-rate-input" data-rider-id="${rider.id}" min="0" max="100" step="0.01" value="${rider.rate}"${rider.plan ? ' readonly' : ''}>
        </div>
      </div>
      <div class="badge-row" style="display:${rider.plan ? '' : 'none'}">${badges}</div>
    </div>
  `;
}

function renderRiderRows() {
  const list = document.getElementById('cm-riders-list');
  const empty = document.getElementById('cm-riders-empty');
  empty.style.display = cmRiders.length ? 'none' : '';
  list.innerHTML = cmRiders.map(riderRowHtml).join('');

  list.querySelectorAll('.rider-plan-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const rider = cmRiders.find(r => r.id === Number(sel.dataset.riderId));
      if (sel.value === '') {
        rider.plan = null;
        rider.tier = null;
        rider.tierIdx = 0;
        rider.comPlus = null;
        rider.laBonus = null;
      } else {
        rider.plan = COMMISSION_RATE_TABLE[Number(sel.value)];
        rider.tierIdx = 0;
        applyRiderTier(rider);
      }
      renderRiderRows();
      calcCommission();
    });
  });
  list.querySelectorAll('.rider-condition-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const rider = cmRiders.find(r => r.id === Number(sel.dataset.riderId));
      rider.tierIdx = Number(sel.value) || 0;
      applyRiderTier(rider);
      renderRiderRows();
      calcCommission();
    });
  });
  list.querySelectorAll('.rider-premium-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const rider = cmRiders.find(r => r.id === Number(inp.dataset.riderId));
      rider.premium = Number(inp.value) || 0;
      calcCommission();
    });
  });
  list.querySelectorAll('.rider-rate-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const rider = cmRiders.find(r => r.id === Number(inp.dataset.riderId));
      rider.rate = Number(inp.value) || 0;
      calcCommission();
    });
  });
  list.querySelectorAll('[data-remove-rider]').forEach(btn => {
    btn.addEventListener('click', () => removeRiderRow(Number(btn.dataset.removeRider)));
  });
}

function calcCommission() {
  const mainPremium = Number(document.getElementById('cm-premium').value) || 0;
  const mainRate = Number(document.getElementById('cm-rate').value) || 0;
  const taxPct = Number(document.getElementById('cm-tax').value) || 0;

  const mainCommission = mainPremium * (mainRate / 100);
  const mainComPlus = cmCurrentComPlus != null ? mainPremium * (cmCurrentComPlus / 100) : 0;

  let ridersCommission = 0;
  let ridersComPlus = 0;
  let hasLaBonus = cmCurrentLaBonus != null;
  const riderLines = cmRiders.map((r, i) => {
    const commission = r.premium * (r.rate / 100);
    const comPlusAmt = r.comPlus != null ? r.premium * (r.comPlus / 100) : 0;
    ridersCommission += commission;
    ridersComPlus += comPlusAmt;
    if (r.laBonus != null) hasLaBonus = true;
    const label = r.plan ? `${r.plan.code} — ${r.plan.name}` : `สัญญาเพิ่มเติม #${i + 1} (กรอกเอง)`;
    return { label, amount: commission };
  });

  const totalCommission = mainCommission + ridersCommission;
  const totalComPlus = mainComPlus + ridersComPlus;
  const gross = totalCommission + totalComPlus;
  const tax = gross * (taxPct / 100);
  const net = gross - tax;

  let breakdownHtml = `<div class="dark-row"><span>สัญญาหลัก${cmSelectedPlan ? ` (${escapeHtml(cmSelectedPlan.code)})` : ''}</span><span>${formatMoney(mainCommission)}</span></div>`;
  breakdownHtml += riderLines.map(l => `<div class="dark-row"><span>${escapeHtml(l.label)}</span><span>${formatMoney(l.amount)}</span></div>`).join('');
  document.getElementById('cm-breakdown').innerHTML = breakdownHtml;

  const comPlusRow = document.getElementById('cm-complus-row');
  comPlusRow.style.display = totalComPlus > 0 ? '' : 'none';
  document.getElementById('cm-complus').textContent = formatMoney(totalComPlus);

  document.getElementById('cm-commission').textContent = formatMoney(totalCommission);
  document.getElementById('cm-gross').textContent = formatMoney(gross);
  document.getElementById('cm-tax-amount').textContent = '-' + formatMoney(tax);
  document.getElementById('cm-net').textContent = formatMoney(net);

  document.getElementById('cm-bonus-hint').style.display = hasLaBonus ? '' : 'none';
}

// ---------- MDRT tracking ----------
const MONTH_NAMES = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
let mdrtWired = false;

async function loadMdrt() {
  await fetchMembers();
  const memberSelect = document.getElementById('md-member');
  const prevMember = memberSelect.value;
  fillMemberSelect(memberSelect);
  if (prevMember) memberSelect.value = prevMember;

  const yearInput = document.getElementById('md-year');
  if (!yearInput.value) yearInput.value = new Date().getFullYear();

  if (!mdrtWired) {
    mdrtWired = true;
    memberSelect.addEventListener('change', refreshMdrt);
    yearInput.addEventListener('change', refreshMdrt);
    document.getElementById('md-save-target').addEventListener('click', saveMdrtTarget);
  }

  await refreshMdrt();
}

async function refreshMdrt() {
  const member = document.getElementById('md-member').value;
  const year = document.getElementById('md-year').value;
  if (!member || !year) return;

  const data = await api('/mdrt?member=' + encodeURIComponent(member) + '&year=' + encodeURIComponent(year));
  document.getElementById('md-target').value = data.target || '';

  const total = Object.values(data.entries).reduce((sum, v) => sum + v, 0);
  const target = data.target || 0;
  const gap = Math.max(0, target - total);
  const pct = target > 0 ? Math.min(100, Math.round((total / target) * 100)) : 0;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const monthsRemaining = Number(year) === currentYear ? Math.max(1, 13 - currentMonth) : 12;

  document.getElementById('md-total').textContent = formatMoney(total);
  document.getElementById('md-progress-bar').style.width = pct + '%';
  document.getElementById('md-gap').textContent = formatMoney(gap);
  document.getElementById('md-per-month-label').textContent = gap > 0
    ? `ต้องทำยอดเพิ่ม/เดือน (เหลือ ${monthsRemaining} เดือน)`
    : 'ต้องทำยอดเพิ่ม/เดือน';
  document.getElementById('md-per-month').textContent = formatMoney(gap > 0 ? gap / monthsRemaining : 0);

  const grid = document.getElementById('md-month-grid');
  grid.innerHTML = MONTH_NAMES.map((name, i) => {
    const month = i + 1;
    const value = data.entries[month] || '';
    return `
      <div class="month-cell">
        <label>${name}</label>
        <input type="number" min="0" class="md-month-input" data-month="${month}" value="${value}">
      </div>
    `;
  }).join('');
  grid.querySelectorAll('.md-month-input').forEach(el => {
    el.addEventListener('change', saveMdrtEntry);
  });
}

async function saveMdrtTarget() {
  const member = document.getElementById('md-member').value;
  const year = document.getElementById('md-year').value;
  const targetAmount = Number(document.getElementById('md-target').value) || 0;
  if (!member || !year) { toast('เลือกสมาชิกและปีก่อนนะครับ'); return; }
  await api('/mdrt/target', { method: 'POST', body: JSON.stringify({ member, year: Number(year), targetAmount }) });
  toast('บันทึกเป้าหมายแล้ว');
  refreshMdrt();
}

async function saveMdrtEntry(e) {
  const member = document.getElementById('md-member').value;
  const year = document.getElementById('md-year').value;
  const month = Number(e.target.dataset.month);
  const fyp = Number(e.target.value) || 0;
  await api('/mdrt/entry', { method: 'POST', body: JSON.stringify({ member, year: Number(year), month, fyp }) });
  toast('บันทึกยอดเดือน ' + MONTH_NAMES[month - 1] + ' แล้ว');
  refreshMdrt();
}

// ---------- SA Asoke premium summary ----------
let saAsokeCache = [];
let saAsokeEditingId = null;
let saAddingRiderToId = null;

function formatBaht(n) {
  return '฿' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function entryTotal(e) {
  return e.premium + (e.riders || []).reduce((sum, r) => sum + r.premium, 0);
}

function grandTotal() {
  return saAsokeCache.reduce((sum, e) => sum + entryTotal(e), 0);
}

async function loadSaAsoke() {
  saAsokeEditingId = null;
  saAddingRiderToId = null;
  const data = await api('/sa-asoke');
  saAsokeCache = data.entries.sort((a, b) => a.name.localeCompare(b.name, 'th'));
  renderSaAsoke(data.total);
}

function renderSaAsoke(total) {
  document.getElementById('sa-asoke-total').textContent = formatBaht(total);
  document.getElementById('sa-asoke-policy-count').textContent = saAsokeCache.length.toLocaleString();
  document.getElementById('sa-asoke-foot-total').textContent = formatBaht(total);
  document.getElementById('sa-asoke-foot-label').textContent = `รวม (${saAsokeCache.length} กรมธรรม์)`;

  const tbody = document.getElementById('sa-asoke-tbody');
  const empty = document.getElementById('sa-asoke-empty');
  if (!saAsokeCache.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = saAsokeCache.map(e => {
    if (e.id === saAsokeEditingId) {
      return `
        <tr>
          <td><input type="text" class="sa-edit-name" value="${escapeAttr(e.name)}"></td>
          <td><input type="text" class="sa-edit-group" value="${escapeAttr(e.group)}" style="width:60px"></td>
          <td><select class="sa-edit-product-type" style="max-width:220px">${buildFlatRateOptions(e.commissionRateRuleId)}</select></td>
          <td><input type="number" class="sa-edit-premium" min="0" step="0.01" value="${e.premium}" style="width:110px"></td>
          <td class="no-print">
            <button class="ghost" data-save-sa="${e.id}">บันทึก</button>
            <button class="ghost" data-cancel-sa="${e.id}">ยกเลิก</button>
          </td>
        </tr>
      `;
    }
    const riders = e.riders || [];
    const riderLines = riders.map(r => `
      <div class="sa-rider-line">
        <span>+ ${escapeHtml(r.productType || 'สัญญาเพิ่มเติม')} (${formatBaht(r.premium)})</span>
        <button type="button" class="ghost no-print" data-del-sa-rider="${r.id}" title="ลบสัญญาเพิ่มเติม">×</button>
      </div>
    `).join('');
    const addRiderBlock = e.id === saAddingRiderToId ? `
      <div class="sa-rider-add-form no-print">
        <select class="sa-new-rider-rule" style="max-width:200px">${buildFlatRateOptions(null)}</select>
        <input type="number" class="sa-new-rider-premium" min="0" step="0.01" placeholder="เบี้ย" style="width:90px">
        <button type="button" class="ghost" data-save-sa-rider="${e.id}">บันทึก</button>
        <button type="button" class="ghost" data-cancel-sa-rider="${e.id}">ยกเลิก</button>
      </div>
    ` : `<button type="button" class="ghost no-print" data-add-sa-rider="${e.id}" style="margin-top:4px">+ สัญญาเพิ่มเติม</button>`;
    return `
      <tr>
        <td>${escapeHtml(e.name)}</td>
        <td>${escapeHtml(e.group || '-')}</td>
        <td>
          <div>${escapeHtml(e.productType || '-')}</div>
          ${riderLines}
          ${addRiderBlock}
        </td>
        <td>${formatBaht(entryTotal(e))}</td>
        <td class="no-print">
          <button class="ghost" data-edit-sa="${e.id}">แก้ไข</button>
          <button class="ghost" data-del-sa="${e.id}">ลบ</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('[data-edit-sa]').forEach(btn => {
    btn.addEventListener('click', () => {
      saAsokeEditingId = btn.dataset.editSa;
      renderSaAsoke(grandTotal());
    });
  });
  tbody.querySelectorAll('[data-cancel-sa]').forEach(btn => {
    btn.addEventListener('click', () => {
      saAsokeEditingId = null;
      renderSaAsoke(grandTotal());
    });
  });
  tbody.querySelectorAll('[data-save-sa]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest('tr');
      const select = row.querySelector('.sa-edit-product-type');
      const ruleId = select.value || null;
      const rule = ruleId ? saRateCache.find(r => r.id === ruleId) : null;
      const payload = {
        name: row.querySelector('.sa-edit-name').value,
        group: row.querySelector('.sa-edit-group').value,
        productType: rule ? productLabel(rule) : '',
        commissionRateRuleId: ruleId,
        premium: Number(row.querySelector('.sa-edit-premium').value)
      };
      if (!payload.name || !Number.isFinite(payload.premium)) {
        toast('กรุณากรอกชื่อและเบี้ยให้ถูกต้อง');
        return;
      }
      await api('/sa-asoke/' + btn.dataset.saveSa, { method: 'PUT', body: JSON.stringify(payload) });
      toast('บันทึกการแก้ไขแล้ว');
      loadSaAsoke();
    });
  });
  tbody.querySelectorAll('[data-del-sa]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('ลบรายการนี้?')) return;
      await api('/sa-asoke/' + btn.dataset.delSa, { method: 'DELETE' });
      loadSaAsoke();
    });
  });
  tbody.querySelectorAll('[data-add-sa-rider]').forEach(btn => {
    btn.addEventListener('click', () => {
      saAddingRiderToId = btn.dataset.addSaRider;
      renderSaAsoke(grandTotal());
    });
  });
  tbody.querySelectorAll('[data-cancel-sa-rider]').forEach(btn => {
    btn.addEventListener('click', () => {
      saAddingRiderToId = null;
      renderSaAsoke(grandTotal());
    });
  });
  tbody.querySelectorAll('[data-save-sa-rider]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest('tr');
      const ruleId = row.querySelector('.sa-new-rider-rule').value || null;
      const premium = Number(row.querySelector('.sa-new-rider-premium').value);
      if (!Number.isFinite(premium)) {
        toast('กรุณากรอกเบี้ยของสัญญาเพิ่มเติมให้ถูกต้อง');
        return;
      }
      const rule = ruleId ? saRateCache.find(r => r.id === ruleId) : null;
      await api('/sa-asoke/' + btn.dataset.saveSaRider + '/riders', {
        method: 'POST',
        body: JSON.stringify({ commissionRateRuleId: ruleId, productType: rule ? productLabel(rule) : '', premium })
      });
      toast('เพิ่มสัญญาเพิ่มเติมแล้ว');
      loadSaAsoke();
    });
  });
  tbody.querySelectorAll('[data-del-sa-rider]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('ลบสัญญาเพิ่มเติมนี้?')) return;
      await api('/sa-asoke/riders/' + btn.dataset.delSaRider, { method: 'DELETE' });
      loadSaAsoke();
    });
  });
}

function productKey(r) { return r.productCode + '||' + r.productName; }

function productLabel(r) {
  let label = r.productCode + ' - ' + r.productName;
  const extra = [r.ageRange, r.conditionLabel].filter(Boolean).join(', ');
  if (extra) label += ' (' + extra + ')';
  return label;
}

function buildFlatRateOptions(selectedId) {
  const byCategory = new Map();
  saRateCache.forEach(r => {
    if (!byCategory.has(r.category)) byCategory.set(r.category, []);
    byCategory.get(r.category).push(r);
  });
  let html = '<option value="">-- ไม่ระบุ --</option>';
  byCategory.forEach((list, category) => {
    html += `<optgroup label="${escapeAttr(category)}">`;
    html += list.map(r => `<option value="${r.id}" ${r.id === selectedId ? 'selected' : ''}>${escapeHtml(productLabel(r))} — ${r.year1Rate ?? '-'}%</option>`).join('');
    html += '</optgroup>';
  });
  return html;
}

function populateProductSelect() {
  const select = document.getElementById('sa-product-select');
  const byCategory = new Map();
  const seenKeys = new Set();
  saRateCache.forEach(r => {
    const key = productKey(r);
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    if (!byCategory.has(r.category)) byCategory.set(r.category, []);
    byCategory.get(r.category).push(r);
  });
  let html = '<option value="">-- เลือกแบบประกัน --</option>';
  byCategory.forEach((list, category) => {
    html += `<optgroup label="${escapeAttr(category)}">`;
    html += list.map(r => `<option value="${escapeAttr(productKey(r))}">${escapeHtml(r.productCode + ' - ' + r.productName)}</option>`).join('');
    html += '</optgroup>';
  });
  select.innerHTML = html;
}

function updateConditionSelect() {
  const productSelect = document.getElementById('sa-product-select');
  const conditionSelect = document.getElementById('sa-condition-select');
  const key = productSelect.value;
  const matches = saRateCache.filter(r => productKey(r) === key);
  if (!key || matches.length === 0) {
    conditionSelect.style.display = 'none';
    conditionSelect.innerHTML = '';
    updateCommissionPreview();
    return;
  }
  if (matches.length === 1) {
    conditionSelect.style.display = 'none';
    conditionSelect.innerHTML = `<option value="${matches[0].id}" selected></option>`;
    updateCommissionPreview();
    return;
  }
  conditionSelect.style.display = '';
  conditionSelect.innerHTML = matches.map(r => {
    const label = [r.ageRange, r.conditionLabel].filter(Boolean).join(', ') || r.productName;
    return `<option value="${r.id}">${escapeHtml(label)} — ${r.year1Rate ?? '-'}%</option>`;
  }).join('');
  updateCommissionPreview();
}

function getSelectedRuleId() {
  const conditionSelect = document.getElementById('sa-condition-select');
  return conditionSelect.value || null;
}

function updateCommissionPreview() {
  const preview = document.getElementById('sa-commission-preview');
  const ruleId = getSelectedRuleId();
  const premium = Number(document.getElementById('sa-premium').value);
  const rule = ruleId ? saRateCache.find(r => r.id === ruleId) : null;
  if (!rule || !Number.isFinite(premium) || rule.year1Rate === null) {
    preview.style.display = 'none';
    return;
  }
  preview.style.display = 'block';
  preview.textContent = `ค่าบำเหน็จโดยประมาณ (ปีแรก): ${formatBaht(premium * rule.year1Rate / 100)} (${rule.year1Rate}%)`;
}

document.getElementById('sa-product-select').addEventListener('change', updateConditionSelect);
document.getElementById('sa-condition-select').addEventListener('change', updateCommissionPreview);
document.getElementById('sa-premium').addEventListener('input', updateCommissionPreview);

function addRiderRow() {
  const container = document.getElementById('sa-rider-rows');
  const row = document.createElement('div');
  row.className = 'sa-new-rider-row row2';
  row.innerHTML = `
    <select class="sa-rider-rule-select">${buildFlatRateOptions(null)}</select>
    <div style="display:flex;gap:6px;align-items:center">
      <input type="number" class="sa-rider-premium-input" min="0" step="0.01" placeholder="เบี้ยสัญญาเพิ่มเติม (บาท)">
      <button type="button" class="ghost sa-remove-rider-row">ลบ</button>
    </div>
  `;
  row.querySelector('.sa-remove-rider-row').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

document.getElementById('sa-add-rider-row').addEventListener('click', addRiderRow);

document.getElementById('form-sa-asoke').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ruleId = getSelectedRuleId();
  const rule = ruleId ? saRateCache.find(r => r.id === ruleId) : null;
  const riders = [...document.querySelectorAll('#sa-rider-rows .sa-new-rider-row')].map(row => {
    const riderRuleId = row.querySelector('.sa-rider-rule-select').value || null;
    const riderRule = riderRuleId ? saRateCache.find(r => r.id === riderRuleId) : null;
    const riderPremium = Number(row.querySelector('.sa-rider-premium-input').value);
    return { commissionRateRuleId: riderRuleId, productType: riderRule ? productLabel(riderRule) : '', premium: riderPremium };
  }).filter(r => Number.isFinite(r.premium) && r.premium > 0);
  const payload = {
    name: document.getElementById('sa-name').value,
    group: document.getElementById('sa-group').value,
    productType: rule ? productLabel(rule) : '',
    commissionRateRuleId: ruleId,
    premium: Number(document.getElementById('sa-premium').value),
    riders
  };
  await api('/sa-asoke', { method: 'POST', body: JSON.stringify(payload) });
  toast('เพิ่มรายการแล้ว');
  e.target.reset();
  document.getElementById('sa-rider-rows').innerHTML = '';
  document.getElementById('sa-condition-select').style.display = 'none';
  document.getElementById('sa-commission-preview').style.display = 'none';
  loadSaAsoke();
});

// ---------- Commission rate rules (used by the product dropdowns; no browsing UI) ----------
let saRateCache = [];

async function loadSaRates() {
  saRateCache = await api('/sa-asoke/commission-rates');
  populateProductSelect();
}

// ---------- SA Asoke team building (recruits) ----------
let saRecruitCache = [];

async function loadSaRecruits() {
  saRecruitCache = await api('/sa-asoke/recruits');
  renderSaRecruits();
}

function renderSaRecruits() {
  const tbody = document.getElementById('sa-recruit-tbody');
  const empty = document.getElementById('sa-recruit-empty');
  if (!saRecruitCache.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  tbody.innerHTML = saRecruitCache.map(r => `
    <tr>
      <td>${escapeHtml(r.recruiterName)}</td>
      <td>${escapeHtml(r.newAgentName)}</td>
      <td>${r.caseOpened ? '✅' : '—'}</td>
      <td>${escapeHtml(r.note || '-')}</td>
      <td class="no-print"><button class="ghost" data-del-sa-recruit="${r.id}">ลบ</button></td>
    </tr>
  `).join('');
  tbody.querySelectorAll('[data-del-sa-recruit]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('ลบรายการนี้?')) return;
      await api('/sa-asoke/recruits/' + btn.dataset.delSaRecruit, { method: 'DELETE' });
      loadSaRecruits();
    });
  });
}

document.getElementById('form-sa-recruit').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    recruiterName: document.getElementById('sa-recruit-recruiter').value,
    newAgentName: document.getElementById('sa-recruit-new-agent').value,
    caseOpened: document.getElementById('sa-recruit-case-opened').checked,
    note: document.getElementById('sa-recruit-note').value
  };
  await api('/sa-asoke/recruits', { method: 'POST', body: JSON.stringify(payload) });
  toast('เพิ่มรายการแล้ว');
  e.target.reset();
  loadSaRecruits();
});

// ---------- SA Asoke awards summary ----------
function renderAwardTable(title, entries, valueLabel, valueFormatter) {
  if (!entries.length) {
    return `<h3>${title}</h3><div class="empty">ไม่มีผู้เข้าเกณฑ์</div>`;
  }
  const rows = entries.map(e => `
    <tr>
      <td>${e.rank ? 'อันดับ ' + e.rank : ''}</td>
      <td>${escapeHtml(e.name)}${e.missingRate ? ' ⚠️' : ''}</td>
      <td>${valueFormatter(e.value)}</td>
      <td>${formatBaht(e.prize)}</td>
    </tr>
  `).join('');
  return `
    <h3>${title}</h3>
    <div class="table-scroll">
      <table class="data">
        <thead><tr><th>อันดับ</th><th>ชื่อ</th><th>${valueLabel}</th><th>รางวัล</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

let lastAwardsData = null;

async function computeSaAwards() {
  const data = await api('/sa-asoke/awards');
  lastAwardsData = data;
  const missing = document.getElementById('sa-awards-missing-rate');
  if (data.peopleMissingRate.length) {
    missing.style.display = 'block';
    missing.textContent = '⚠️ ยังไม่มีอัตราค่าบำเหน็จครบสำหรับ: ' + data.peopleMissingRate.join(', ') + ' (ค่าบำเหน็จของรายการที่ไม่ทราบแบบประกันจะไม่ถูกนับ)';
  } else {
    missing.style.display = 'none';
  }

  const result = document.getElementById('sa-awards-result');
  result.innerHTML = [
    renderAwardTable('ประเภท 1: ค่าบำเหน็จสะสมสูงสุด (ตั้งแต่ 10,000 บาทขึ้นไป)', data.type1.top, 'ค่าบำเหน็จ', formatBaht),
    data.type1.consolation.length ? `
      <h3>รางวัลชมเชย ประเภทที่ 1 (ค่าบำเหน็จเกิน 10,000 บาท, 700 บาท)</h3>
      <div class="table-scroll">
        <table class="data">
          <thead><tr><th>ชื่อ</th><th>ค่าบำเหน็จ</th><th>รางวัล</th></tr></thead>
          <tbody>${data.type1.consolation.map(e => `<tr><td>${escapeHtml(e.name)}${e.missingRate ? ' ⚠️' : ''}</td><td>${formatBaht(e.value)}</td><td>${formatBaht(e.prize)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    ` : '',
    renderAwardTable('ประเภท 2: จำนวนเคสใหม่สูงสุด (ตั้งแต่ 4 เคสขึ้นไป)', data.type2.top, 'จำนวนเคส', v => v),
    renderAwardTable('ประเภท 3: สร้างทีมสูงสุด (เปิด New Code/New Case 2 คนขึ้นไป)', data.type3.top, 'จำนวนคน', v => v)
  ].join('');
}

document.getElementById('sa-awards-compute').addEventListener('click', computeSaAwards);
document.getElementById('sa-awards-print').addEventListener('click', () => window.print());
document.getElementById('sa-awards-image').addEventListener('click', exportAwardsImage);

function exportAwardsImage() {
  if (!lastAwardsData) {
    toast('กรุณากดคำนวณรางวัลก่อน');
    return;
  }
  const data = lastAwardsData;

  const sections = [];
  sections.push({
    title: 'ประเภท 1: ค่าบำเหน็จสะสมสูงสุด (ตั้งแต่ 10,000 บาทขึ้นไป)',
    cols: ['อันดับ', 'ชื่อ', 'ค่าบำเหน็จ', 'รางวัล'],
    rows: data.type1.top.map(e => ['อันดับ ' + e.rank, e.name + (e.missingRate ? ' ⚠️' : ''), formatBaht(e.value), formatBaht(e.prize)])
  });
  if (data.type1.consolation.length) {
    sections.push({
      title: 'รางวัลชมเชย ประเภทที่ 1 (ค่าบำเหน็จเกิน 10,000 บาท, 700 บาท)',
      cols: ['ชื่อ', 'ค่าบำเหน็จ', 'รางวัล'],
      rows: data.type1.consolation.map(e => [e.name + (e.missingRate ? ' ⚠️' : ''), formatBaht(e.value), formatBaht(e.prize)])
    });
  }
  sections.push({
    title: 'ประเภท 2: จำนวนเคสใหม่สูงสุด (ตั้งแต่ 4 เคสขึ้นไป)',
    cols: ['อันดับ', 'ชื่อ', 'จำนวนเคส', 'รางวัล'],
    rows: data.type2.top.map(e => ['อันดับ ' + e.rank, e.name, String(e.value), formatBaht(e.prize)])
  });
  sections.push({
    title: 'ประเภท 3: สร้างทีมสูงสุด (เปิด New Code/New Case 2 คนขึ้นไป)',
    cols: ['อันดับ', 'ชื่อ', 'จำนวนคน', 'รางวัล'],
    rows: data.type3.top.map(e => ['อันดับ ' + e.rank, e.name, String(e.value), formatBaht(e.prize)])
  });

  const pad = 24;
  const width = 720;
  const titleH = 56;
  const sectionTitleH = 34;
  const headerH = 32;
  const rowH = 30;
  const emptyH = 30;
  const sectionGap = 16;

  let height = pad * 2 + titleH;
  sections.forEach(s => {
    height += sectionTitleH + headerH + (s.rows.length ? s.rows.length * rowH : emptyH) + sectionGap;
  });

  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0b0b0b';
  ctx.font = '700 20px Sarabun, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('สรุปรางวัล SA Asoke', pad, pad + titleH / 2);

  let y = pad + titleH;
  const tableWidth = width - pad * 2;

  sections.forEach(s => {
    ctx.fillStyle = '#0b0b0b';
    ctx.font = '600 15px Sarabun, "Segoe UI", sans-serif';
    ctx.fillText(truncateToWidth(ctx, s.title, tableWidth), pad, y + sectionTitleH / 2);
    y += sectionTitleH;

    const colCount = s.cols.length;
    const nameColIdx = s.cols.indexOf('ชื่อ');
    const colWidths = s.cols.map((c, i) => i === nameColIdx ? tableWidth * 0.38 : (tableWidth - tableWidth * 0.38) / (colCount - 1));
    const colX = [];
    let cx = pad;
    colWidths.forEach(w => { colX.push(cx); cx += w; });

    ctx.fillStyle = '#2a78d6';
    ctx.fillRect(pad, y, tableWidth, headerH);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 13px Sarabun, "Segoe UI", sans-serif';
    s.cols.forEach((c, i) => {
      ctx.textAlign = i === nameColIdx ? 'left' : 'right';
      const tx = i === nameColIdx ? colX[i] + 10 : colX[i] + colWidths[i] - 10;
      ctx.fillText(c, tx, y + headerH / 2);
    });
    y += headerH;

    ctx.font = '13px Sarabun, "Segoe UI", sans-serif';
    if (!s.rows.length) {
      ctx.fillStyle = '#898781';
      ctx.textAlign = 'left';
      ctx.fillText('ไม่มีผู้เข้าเกณฑ์', pad + 10, y + emptyH / 2);
      y += emptyH;
    }
    s.rows.forEach((row, i) => {
      if (i % 2 === 1) {
        ctx.fillStyle = '#f5f4f1';
        ctx.fillRect(pad, y, tableWidth, rowH);
      }
      ctx.fillStyle = '#0b0b0b';
      row.forEach((val, ci) => {
        ctx.textAlign = ci === nameColIdx ? 'left' : 'right';
        const tx = ci === nameColIdx ? colX[ci] + 10 : colX[ci] + colWidths[ci] - 10;
        ctx.fillText(truncateToWidth(ctx, val, colWidths[ci] - 20), tx, y + rowH / 2);
      });
      y += rowH;
    });
    y += sectionGap;
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SA-Asoke-Awards-${dateStr}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

document.getElementById('sa-asoke-print').addEventListener('click', () => {
  saAsokeEditingId = null;
  renderSaAsoke(grandTotal());
  document.body.classList.add('printing-sa-asoke');
  window.print();
});

window.addEventListener('afterprint', () => {
  document.body.classList.remove('printing-sa-asoke');
});

function truncateToWidth(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + '…';
}

function exportSaAsokeImage() {
  const rows = [...saAsokeCache].sort((a, b) => a.name.localeCompare(b.name, 'th'));
  const total = grandTotal();

  const pad = 24;
  const colName = 320;
  const colGroup = 110;
  const colPremium = 190;
  const width = pad * 2 + colName + colGroup + colPremium;
  const titleH = 56;
  const headerH = 40;
  const rowH = 32;
  const footerH = 40;
  const height = pad * 2 + titleH + headerH + Math.max(1, rows.length) * rowH + footerH;

  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0b0b0b';
  ctx.font = '700 20px Sarabun, "Segoe UI", sans-serif';
  ctx.fillText('สรุปเบี้ยรวมทั้งหมดโครงการ SA Asoke', pad, pad + titleH / 2);

  let y = pad + titleH;
  const xName = pad + 12;
  const xGroup = pad + colName + 12;
  const xPremium = pad + colName + colGroup + colPremium - 12;

  ctx.fillStyle = '#2a78d6';
  ctx.fillRect(pad, y, width - pad * 2, headerH);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 15px Sarabun, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ชื่อ', xName, y + headerH / 2);
  ctx.fillText('กลุ่ม', xGroup, y + headerH / 2);
  ctx.textAlign = 'right';
  ctx.fillText('เบี้ย', xPremium, y + headerH / 2);
  y += headerH;

  ctx.font = '15px Sarabun, "Segoe UI", sans-serif';
  if (!rows.length) {
    ctx.fillStyle = '#898781';
    ctx.textAlign = 'left';
    ctx.fillText('ยังไม่มีรายการเบี้ย', xName, y + rowH / 2);
    y += rowH;
  }
  rows.forEach((e, i) => {
    if (i % 2 === 1) {
      ctx.fillStyle = '#f5f4f1';
      ctx.fillRect(pad, y, width - pad * 2, rowH);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0b0b0b';
    ctx.fillText(truncateToWidth(ctx, e.name, colName - 24), xName, y + rowH / 2);
    ctx.fillStyle = '#52514e';
    ctx.fillText(truncateToWidth(ctx, e.group || '-', colGroup - 24), xGroup, y + rowH / 2);
    ctx.fillStyle = '#0b0b0b';
    ctx.textAlign = 'right';
    ctx.fillText(formatBaht(entryTotal(e)), xPremium, y + rowH / 2);
    y += rowH;
    ctx.strokeStyle = 'rgba(11,11,11,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  });

  ctx.fillStyle = '#f0efe9';
  ctx.fillRect(pad, y, width - pad * 2, footerH);
  ctx.fillStyle = '#0b0b0b';
  ctx.font = '700 16px Sarabun, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`รวม (${rows.length} กรมธรรม์)`, xName, y + footerH / 2);
  ctx.textAlign = 'right';
  ctx.fillText(formatBaht(total), xPremium, y + footerH / 2);

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SA-Asoke-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

document.getElementById('sa-asoke-image').addEventListener('click', exportSaAsokeImage);

// ---------- Shirts (ค่าเสื้อ) ----------
async function loadShirts() {
  const data = await api('/shirts');
  document.getElementById('shirts-paid-count').textContent = data.paidCount;
  document.getElementById('shirts-total-count').textContent = data.totalCount;

  const tbody = document.getElementById('shirts-tbody');
  tbody.innerHTML = data.orders.map((o, i) => `
    <tr${o.leftProject ? ' style="opacity:0.5"' : ''}>
      <td>${i + 1}</td>
      <td>${escapeHtml(o.name)}${o.leftProject ? ' <span class="hint">(ออกจากโครงการ)</span>' : ''}</td>
      <td>${escapeHtml(o.nickname || '-')}</td>
      <td>${escapeHtml(o.branch || '-')}</td>
      <td><input type="checkbox" class="shirt-paid-input" data-shirt-id="${o.id}" ${o.paid ? 'checked' : ''} ${o.leftProject ? 'disabled' : ''}></td>
      <td><input type="text" class="shirt-note-input" data-shirt-id="${o.id}" value="${escapeAttr(o.note)}" placeholder="หมายเหตุ" style="width:120px"></td>
      <td><button class="ghost" data-del-shirt="${o.id}">ลบ</button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.shirt-paid-input').forEach(el => {
    el.addEventListener('change', async () => {
      await api('/shirts/' + el.dataset.shirtId, { method: 'PATCH', body: JSON.stringify({ paid: el.checked }) });
      toast(el.checked ? 'บันทึกว่าจ่ายแล้ว' : 'ยกเลิกการจ่ายแล้ว');
      loadShirts();
    });
  });
  tbody.querySelectorAll('.shirt-note-input').forEach(el => {
    el.addEventListener('change', async () => {
      await api('/shirts/' + el.dataset.shirtId, { method: 'PATCH', body: JSON.stringify({ note: el.value }) });
      toast('บันทึกหมายเหตุแล้ว');
    });
  });
  tbody.querySelectorAll('[data-del-shirt]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('ลบรายชื่อนี้?')) return;
      await api('/shirts/' + btn.dataset.delShirt, { method: 'DELETE' });
      loadShirts();
    });
  });
}

document.getElementById('form-shirt').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: document.getElementById('sh-name').value,
    nickname: document.getElementById('sh-nickname').value,
    branch: document.getElementById('sh-branch').value
  };
  await api('/shirts', { method: 'POST', body: JSON.stringify(payload) });
  toast('เพิ่มรายชื่อแล้ว');
  e.target.reset();
  loadShirts();
});

// ---------- Members ----------
async function loadMembers() {
  await fetchMembers();
  const tbody = document.getElementById('members-tbody');
  const empty = document.getElementById('members-empty');
  if (!membersCache.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  tbody.innerHTML = membersCache.map(m => `
    <tr>
      <td>${escapeHtml(m.name)}</td>
      <td>${escapeHtml(m.role || '-')}</td>
      <td>${escapeHtml(m.phone || '-')}</td>
      <td><button class="ghost" data-del-member="${m.id}">ลบ</button></td>
    </tr>
  `).join('');
  tbody.querySelectorAll('[data-del-member]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('ลบสมาชิกนี้?')) return;
      await api('/members/' + btn.dataset.delMember, { method: 'DELETE' });
      loadMembers();
    });
  });
}

document.getElementById('form-member').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: document.getElementById('m-name').value,
    role: document.getElementById('m-role').value,
    phone: document.getElementById('m-phone').value
  };
  await api('/members', { method: 'POST', body: JSON.stringify(payload) });
  toast('เพิ่มสมาชิกแล้ว');
  e.target.reset();
  loadMembers();
});

// ---------- Init ----------
loadDashboard();
