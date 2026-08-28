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
  if (tab === 'sa-asoke') loadSaAsoke();
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

function formatBaht(n) {
  return '฿' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function loadSaAsoke() {
  saAsokeEditingId = null;
  const data = await api('/sa-asoke');
  saAsokeCache = data.entries.sort((a, b) => a.name.localeCompare(b.name, 'th'));
  renderSaAsoke(data.total);
}

function renderSaAsoke(total) {
  document.getElementById('sa-asoke-total').textContent = formatBaht(total);
  document.getElementById('sa-asoke-foot-total').textContent = formatBaht(total);

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
          <td><input type="number" class="sa-edit-premium" min="0" step="0.01" value="${e.premium}" style="width:110px"></td>
          <td class="no-print">
            <button class="ghost" data-save-sa="${e.id}">บันทึก</button>
            <button class="ghost" data-cancel-sa="${e.id}">ยกเลิก</button>
          </td>
        </tr>
      `;
    }
    return `
      <tr>
        <td>${escapeHtml(e.name)}</td>
        <td>${escapeHtml(e.group || '-')}</td>
        <td>${formatBaht(e.premium)}</td>
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
      renderSaAsoke(saAsokeCache.reduce((sum, e) => sum + e.premium, 0));
    });
  });
  tbody.querySelectorAll('[data-cancel-sa]').forEach(btn => {
    btn.addEventListener('click', () => {
      saAsokeEditingId = null;
      renderSaAsoke(saAsokeCache.reduce((sum, e) => sum + e.premium, 0));
    });
  });
  tbody.querySelectorAll('[data-save-sa]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest('tr');
      const payload = {
        name: row.querySelector('.sa-edit-name').value,
        group: row.querySelector('.sa-edit-group').value,
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
}

document.getElementById('form-sa-asoke').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: document.getElementById('sa-name').value,
    group: document.getElementById('sa-group').value,
    premium: Number(document.getElementById('sa-premium').value)
  };
  await api('/sa-asoke', { method: 'POST', body: JSON.stringify(payload) });
  toast('เพิ่มรายการแล้ว');
  e.target.reset();
  loadSaAsoke();
});

document.getElementById('sa-asoke-print').addEventListener('click', () => {
  saAsokeEditingId = null;
  renderSaAsoke(saAsokeCache.reduce((sum, e) => sum + e.premium, 0));
  document.body.classList.add('printing-sa-asoke');
  window.print();
});

window.addEventListener('afterprint', () => {
  document.body.classList.remove('printing-sa-asoke');
});

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
