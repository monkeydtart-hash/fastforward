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

// ---------- Tabs ----------
const tabButtons = document.querySelectorAll('nav.tabs button');
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('main > section').forEach(s => s.style.display = 'none');
    document.getElementById('tab-' + btn.dataset.tab).style.display = 'block';
    loadTab(btn.dataset.tab);
  });
});

function loadTab(tab) {
  if (tab === 'dashboard') loadDashboard();
  if (tab === 'feed') loadFeed();
  if (tab === 'resources') loadResources();
  if (tab === 'events') loadEvents();
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

// ---------- SA Asoke premium summary ----------
let saAsokeCache = [];
let saAsokeEditingId = null;

function formatBaht(n) {
  return '฿' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const SA_ASOKE_CAT_SLOTS = [
  { cssVar: '--series-blue', hex: '#2a78d6' },
  { cssVar: '--cat-2', hex: '#eb6834' },
  { cssVar: '--cat-3', hex: '#1baf7a' },
  { cssVar: '--cat-4', hex: '#eda100' },
  { cssVar: '--cat-5', hex: '#e87ba4' },
  { cssVar: '--cat-6', hex: '#008300' },
  { cssVar: '--cat-7', hex: '#4a3aa7' },
  { cssVar: '--cat-8', hex: '#e34948' }
];

function relativeLuminance(hex) {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(c.substr(i, 2), 16) / 255);
  const lin = v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function groupSaAsoke(entries) {
  const map = new Map();
  for (const e of entries) {
    const key = (e.group || '').trim() || 'ไม่ระบุ';
    if (!map.has(key)) map.set(key, { group: key, total: 0, count: 0 });
    const g = map.get(key);
    g.total += e.premium;
    g.count += 1;
  }
  return Array.from(map.values());
}

function assignGroupSlots(groups) {
  const stableOrder = [...groups].sort((a, b) => {
    const an = Number(a.group), bn = Number(b.group);
    const aNum = a.group !== 'ไม่ระบุ' && !isNaN(an);
    const bNum = b.group !== 'ไม่ระบุ' && !isNaN(bn);
    if (aNum && bNum) return an - bn;
    if (aNum) return -1;
    if (bNum) return 1;
    return a.group.localeCompare(b.group, 'th');
  });
  const maxNamed = SA_ASOKE_CAT_SLOTS.length - 1; // last slot reserved for "อื่นๆ" overflow
  const slotByGroup = {};
  stableOrder.forEach((g, i) => {
    slotByGroup[g.group] = SA_ASOKE_CAT_SLOTS[Math.min(i, maxNamed)];
  });
  return slotByGroup;
}

async function loadSaAsoke() {
  saAsokeEditingId = null;
  const data = await api('/sa-asoke');
  saAsokeCache = data.entries.sort((a, b) => a.name.localeCompare(b.name, 'th'));
  renderSaAsoke(data.total);
}

function renderSaAsokeGroups(total) {
  const groups = groupSaAsoke(saAsokeCache);
  const slotByGroup = assignGroupSlots(groups);

  // ---- Magnitude bar list (sequential blue, sorted high to low) ----
  const barsBox = document.getElementById('sa-asoke-group-bars');
  const groupEmpty = document.getElementById('sa-asoke-group-empty');
  const groupTbody = document.getElementById('sa-asoke-group-tbody');
  if (!groups.length) {
    barsBox.innerHTML = '';
    groupTbody.innerHTML = '';
    groupEmpty.style.display = 'block';
    document.getElementById('sa-asoke-stack-bar').innerHTML = '';
    document.getElementById('sa-asoke-stack-legend').innerHTML = '';
    return;
  }
  groupEmpty.style.display = 'none';

  const byTotalDesc = [...groups].sort((a, b) => b.total - a.total);
  const maxTotal = Math.max(1, ...byTotalDesc.map(g => g.total));
  barsBox.innerHTML = byTotalDesc.map((g, i) => {
    const pct = Math.max(3, Math.round((g.total / maxTotal) * 100));
    return `
      <div class="leaderboard-row">
        <div class="rank ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}">${i + 1}</div>
        <div class="name-bar">
          <div class="name">กลุ่ม ${escapeHtml(g.group)} <span class="role">${g.count} รายการ</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:var(${slotByGroup[g.group].cssVar})"></div></div>
        </div>
        <div class="points">${formatBaht(g.total)}</div>
      </div>
    `;
  }).join('');

  groupTbody.innerHTML = byTotalDesc.map(g => `
    <tr>
      <td>กลุ่ม ${escapeHtml(g.group)}</td>
      <td>${g.count}</td>
      <td>${formatBaht(g.total)}</td>
      <td>${total > 0 ? ((g.total / total) * 100).toFixed(1) : '0.0'}%</td>
    </tr>
  `).join('');

  // ---- Composition stacked bar (categorical, part-to-whole) ----
  const stackBox = document.getElementById('sa-asoke-stack-bar');
  const legendBox = document.getElementById('sa-asoke-stack-legend');
  stackBox.innerHTML = byTotalDesc.map(g => {
    const pct = total > 0 ? (g.total / total) * 100 : 0;
    const slot = slotByGroup[g.group];
    const textColor = relativeLuminance(slot.hex) > 0.5 ? '#0b0b0b' : '#ffffff';
    const label = pct >= 8 ? `${pct.toFixed(0)}%` : '';
    return `<div class="stack-segment" style="flex:0 1 ${pct}%;background:var(${slot.cssVar});color:${textColor}" title="กลุ่ม ${escapeAttr(g.group)}: ${formatBaht(g.total)} (${pct.toFixed(1)}%)">${label}</div>`;
  }).join('');

  legendBox.innerHTML = byTotalDesc.map(g => {
    const pct = total > 0 ? (g.total / total) * 100 : 0;
    return `<span class="legend-item"><span class="legend-swatch" style="background:var(${slotByGroup[g.group].cssVar})"></span>กลุ่ม ${escapeHtml(g.group)} — ${formatBaht(g.total)} (${pct.toFixed(1)}%)</span>`;
  }).join('');
}

function renderSaAsoke(total) {
  document.getElementById('sa-asoke-total').textContent = formatBaht(total);
  document.getElementById('sa-asoke-foot-total').textContent = formatBaht(total);
  renderSaAsokeGroups(total);

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
