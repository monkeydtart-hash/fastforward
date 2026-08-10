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
