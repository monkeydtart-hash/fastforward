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
  const [scores, cases] = await Promise.all([
    api('/scores'), api('/cases')
  ]);

  document.getElementById('dash-team-total').textContent = scores.teamTotal || 0;

  renderLeaderboard('dash-leaderboard', scores.leaderboard);

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
        <div class="rank ${i === 0 ? 'top1' : ''}">${i + 1}</div>
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
      <td>${escapeHtml(e.member)}</td>
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

document.getElementById('form-score').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    member: document.getElementById('s-member').value,
    points: Number(document.getElementById('s-points').value),
    reason: document.getElementById('s-reason').value
  };
  await api('/scores', { method: 'POST', body: JSON.stringify(payload) });
  toast('บันทึกคะแนนแล้ว');
  e.target.reset();
  loadScores();
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
