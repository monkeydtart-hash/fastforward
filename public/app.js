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

const statusClass = {
  'เสนอแล้ว': 'proposed',
  'รอนัด': 'pending',
  'ปิดได้': 'closed',
  'ไม่ปิด': 'lost'
};

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
  if (tab === 'propose') loadProposeForm();
  if (tab === 'cases') loadCases();
  if (tab === 'scores') loadScores();
  if (tab === 'premiums') loadPremiums();
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
  const [scores, cases, premiums] = await Promise.all([
    api('/scores'), api('/cases'), api('/premiums')
  ]);

  document.getElementById('dash-team-total').textContent = scores.teamTotal || 0;

  renderLeaderboard('dash-leaderboard', scores.leaderboard);
  renderPremiumLeaderboard('dash-premium-leaderboard', premiums.leaderboard);

  const recent = cases.slice(0, 5);
  const box = document.getElementById('dash-recent-cases');
  if (recent.length === 0) {
    box.innerHTML = '<div class="empty">ยังไม่มีเคส</div>';
  } else {
    box.innerHTML = recent.map(c => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gridline)">
        <div>
          <div style="font-size:14px">${escapeHtml(c.customerName || '(ไม่ระบุชื่อ)')} — ${escapeHtml(c.planType || '-')}</div>
          <div class="hint">${escapeHtml(c.proposedBy || '-')} · ${escapeHtml(c.dateProposed || '-')}</div>
        </div>
        <span class="status-pill ${statusClass[c.status] || 'proposed'}">${escapeHtml(c.status)}</span>
      </div>
    `).join('');
  }
}

function renderLeaderboard(elId, leaderboard) {
  const box = document.getElementById(elId);
  if (!leaderboard.length) {
    box.innerHTML = '<div class="empty">ยังไม่มีสมาชิก</div>';
    return;
  }
  const max = Math.max(1, ...leaderboard.map(m => m.points));
  box.innerHTML = leaderboard.map((m, i) => {
    const pct = Math.max(3, Math.round((Math.max(0, m.points) / max) * 100));
    return `
      <div class="leaderboard-row">
        <div class="rank ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}">${i + 1}</div>
        <div class="name-bar">
          <div class="name">${escapeHtml(m.name)} <span class="role">${escapeHtml(m.role || '')}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="points">${m.points}</div>
      </div>
    `;
  }).join('');
}

// ---------- Propose case ----------
async function loadProposeForm() {
  await fetchMembers();
  fillMemberSelect(document.getElementById('c-proposedBy'));
  const dateEl = document.getElementById('c-dateProposed');
  if (!dateEl.value) dateEl.value = new Date().toISOString().slice(0, 10);
}

document.getElementById('form-case').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    proposedBy: document.getElementById('c-proposedBy').value,
    dateProposed: document.getElementById('c-dateProposed').value,
    customerName: document.getElementById('c-customerName').value,
    phone: document.getElementById('c-phone').value,
    gender: document.getElementById('c-gender').value,
    age: document.getElementById('c-age').value,
    planType: document.getElementById('c-planType').value,
    company: document.getElementById('c-company').value,
    sumInsured: document.getElementById('c-sumInsured').value,
    premium: document.getElementById('c-premium').value,
    status: document.getElementById('c-status').value,
    followUpDate: document.getElementById('c-followUpDate').value,
    notCloseReason: document.getElementById('c-notCloseReason').value,
    note: document.getElementById('c-note').value
  };
  await api('/cases', { method: 'POST', body: JSON.stringify(payload) });
  toast('บันทึกเคสแล้ว');
  e.target.reset();
  document.getElementById('c-dateProposed').value = new Date().toISOString().slice(0, 10);
  await fetchMembers();
  fillMemberSelect(document.getElementById('c-proposedBy'));
});

// ---------- Cases list ----------
async function loadCases() {
  const cases = await api('/cases');
  const tbody = document.getElementById('cases-tbody');
  const empty = document.getElementById('cases-empty');
  if (!cases.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  tbody.innerHTML = cases.map(c => `
    <tr>
      <td>${escapeHtml(c.dateProposed || '-')}</td>
      <td>${escapeHtml(c.customerName || '-')}</td>
      <td>${escapeHtml(c.planType || '-')}</td>
      <td>${escapeHtml(c.company || '-')}</td>
      <td>${c.premium ? Number(c.premium).toLocaleString() : '-'}</td>
      <td><span class="status-pill ${statusClass[c.status] || 'proposed'}">${escapeHtml(c.status)}</span></td>
      <td>${escapeHtml(c.proposedBy || '-')}</td>
      <td><button class="ghost" data-del-case="${c.id}">ลบ</button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-del-case]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('ลบเคสนี้?')) return;
      await api('/cases/' + btn.dataset.delCase, { method: 'DELETE' });
      loadCases();
    });
  });
}

// ---------- Scores ----------
async function loadScores() {
  await fetchMembers();
  fillMemberSelect(document.getElementById('s-member'));
  const scores = await api('/scores');
  document.getElementById('scores-team-total').textContent = scores.teamTotal;
  renderLeaderboard('scores-leaderboard', scores.leaderboard);

  const tbody = document.getElementById('score-history-tbody');
  const empty = document.getElementById('score-history-empty');
  if (!scores.entries.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  tbody.innerHTML = scores.entries.map(e => `
    <tr>
      <td>${new Date(e.createdAt).toLocaleDateString('th-TH')}</td>
      <td>${e.scope === 'team' ? 'ทีม' : escapeHtml(e.member || '-')}</td>
      <td style="font-weight:700">${e.points > 0 ? '+' : ''}${e.points}</td>
      <td>${escapeHtml(e.reason || '-')}</td>
      <td><button class="ghost" data-del-score="${e.id}">ลบ</button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-del-score]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('ลบรายการนี้?')) return;
      await api('/scores/' + btn.dataset.delScore, { method: 'DELETE' });
      loadScores();
    });
  });
}

document.getElementById('s-scope').addEventListener('change', (e) => {
  document.getElementById('s-member-field').style.display = e.target.value === 'team' ? 'none' : '';
});

document.getElementById('form-score').addEventListener('submit', async (e) => {
  e.preventDefault();
  const scope = document.getElementById('s-scope').value;
  const payload = {
    scope,
    member: scope === 'team' ? null : document.getElementById('s-member').value,
    points: Number(document.getElementById('s-points').value),
    reason: document.getElementById('s-reason').value
  };
  await api('/scores', { method: 'POST', body: JSON.stringify(payload) });
  toast('บันทึกคะแนนแล้ว');
  e.target.reset();
  document.getElementById('s-member-field').style.display = '';
  loadScores();
});

// ---------- Premiums ----------
const OUR_TEAM = 'ทีมเรา';
let competitorTeamsCache = [];

function fillTeamSelect(select) {
  const names = [OUR_TEAM, ...competitorTeamsCache.map(t => t.name)];
  select.innerHTML = names.map(n => `<option value="${escapeAttr(n)}">${escapeHtml(n)}</option>`).join('');
}

function renderPremiumLeaderboard(elId, leaderboard) {
  const box = document.getElementById(elId);
  if (!leaderboard.length) {
    box.innerHTML = '<div class="empty">ยังไม่มีข้อมูล</div>';
    return;
  }
  const max = Math.max(1, ...leaderboard.map(t => t.total));
  const ourTotal = (leaderboard.find(t => t.team === OUR_TEAM) || {}).total || 0;
  const topRival = leaderboard.find(t => t.team !== OUR_TEAM);
  const legend = `
    <div class="compare-bar-legend">
      <span><span class="swatch ours"></span>ทีมเรา</span>
      <span><span class="swatch theirs"></span>ทีมคู่แข่ง</span>
    </div>
  `;
  let summary = '';
  if (topRival) {
    const diff = ourTotal - topRival.total;
    const leading = diff >= 0;
    summary = `
      <div class="diff-summary ${leading ? 'lead' : 'behind'}">
        ${leading ? 'นำ' : 'ตาม'} "${escapeHtml(topRival.team)}" อยู่ ${Math.abs(diff).toLocaleString()} บาท
      </div>
    `;
  }
  const rows = leaderboard.map(t => {
    const ours = t.team === OUR_TEAM;
    const pct = Math.max(2, Math.round((Math.max(0, t.total) / max) * 100));
    return `
      <div class="compare-bar-row">
        <div class="compare-bar-head">
          <span class="name">${escapeHtml(t.team)} <span class="tag">${ours ? '(เรา)' : '(คู่แข่ง)'}</span></span>
          <span class="value">${t.total.toLocaleString()} บาท</span>
        </div>
        <div class="compare-bar-track"><div class="compare-bar-fill${ours ? ' ours' : ''}" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');
  box.innerHTML = legend + summary + rows;
}

async function loadPremiums() {
  competitorTeamsCache = await api('/competitor-teams');
  fillTeamSelect(document.getElementById('p-team'));

  const premiums = await api('/premiums');
  renderPremiumLeaderboard('premium-leaderboard', premiums.leaderboard);

  const tbody = document.getElementById('premium-history-tbody');
  const empty = document.getElementById('premium-history-empty');
  if (!premiums.entries.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    tbody.innerHTML = premiums.entries.map(e => `
      <tr>
        <td>${new Date(e.createdAt).toLocaleDateString('th-TH')}</td>
        <td>${escapeHtml(e.team)}</td>
        <td style="font-weight:700">${e.amount.toLocaleString()}</td>
        <td>${escapeHtml(e.note || '-')}</td>
        <td><button class="ghost" data-del-premium="${e.id}">ลบ</button></td>
      </tr>
    `).join('');
    tbody.querySelectorAll('[data-del-premium]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('ลบรายการนี้?')) return;
        await api('/premiums/' + btn.dataset.delPremium, { method: 'DELETE' });
        loadPremiums();
      });
    });
  }

  const ctBody = document.getElementById('competitor-teams-tbody');
  const ctEmpty = document.getElementById('competitor-teams-empty');
  if (!competitorTeamsCache.length) {
    ctBody.innerHTML = '';
    ctEmpty.style.display = 'block';
  } else {
    ctEmpty.style.display = 'none';
    ctBody.innerHTML = competitorTeamsCache.map(t => `
      <tr>
        <td>${escapeHtml(t.name)}</td>
        <td><button class="ghost" data-del-team="${t.id}">ลบ</button></td>
      </tr>
    `).join('');
    ctBody.querySelectorAll('[data-del-team]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('ลบทีมนี้?')) return;
        await api('/competitor-teams/' + btn.dataset.delTeam, { method: 'DELETE' });
        loadPremiums();
      });
    });
  }
}

document.getElementById('form-premium').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    team: document.getElementById('p-team').value,
    amount: Number(document.getElementById('p-amount').value),
    note: document.getElementById('p-note').value
  };
  await api('/premiums', { method: 'POST', body: JSON.stringify(payload) });
  toast('บันทึกยอดเบี้ยแล้ว');
  e.target.reset();
  loadPremiums();
});

document.getElementById('form-competitor-team').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = { name: document.getElementById('ct-name').value };
  await api('/competitor-teams', { method: 'POST', body: JSON.stringify(payload) });
  toast('เพิ่มทีมคู่แข่งแล้ว');
  e.target.reset();
  loadPremiums();
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
