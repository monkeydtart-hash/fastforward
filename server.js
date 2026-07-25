const express = require('express');
const path = require('path');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3100;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function mapMember(r) {
  return { id: String(r.id), name: r.name, role: r.role, phone: r.phone };
}

function mapCase(r) {
  return {
    id: String(r.id),
    dateProposed: r.date_proposed ? r.date_proposed.toISOString().slice(0, 10) : '',
    customerName: r.customer_name,
    phone: r.phone,
    gender: r.gender,
    age: r.age ?? '',
    planType: r.plan_type,
    company: r.company,
    sumInsured: r.sum_insured ?? '',
    premium: r.premium ?? '',
    status: r.status,
    followUpDate: r.follow_up_date ? r.follow_up_date.toISOString().slice(0, 10) : '',
    notCloseReason: r.not_close_reason,
    proposedBy: r.proposed_by,
    note: r.note,
    createdAt: r.created_at.toISOString()
  };
}

function mapScoreEntry(r) {
  return { id: String(r.id), member: r.member, points: r.points, reason: r.reason, createdAt: r.created_at.toISOString() };
}

function toIntOrNull(v) {
  return v === '' || v === undefined || v === null ? null : Number(v);
}
function toDateOrNull(v) {
  return v ? v : null;
}

// ---- Members ----
app.get('/api/members', async (req, res) => {
  const { rows } = await pool.query('select * from members order by id');
  res.json(rows.map(mapMember));
});

app.post('/api/members', async (req, res) => {
  const { name, role, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const { rows } = await pool.query(
    'insert into members (name, role, phone) values ($1, $2, $3) returning *',
    [name, role || '', phone || '']
  );
  res.json(mapMember(rows[0]));
});

app.delete('/api/members/:id', async (req, res) => {
  await pool.query('delete from members where id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- Cases ----
app.get('/api/cases', async (req, res) => {
  const { rows } = await pool.query('select * from cases order by created_at desc');
  res.json(rows.map(mapCase));
});

app.post('/api/cases', async (req, res) => {
  const b = req.body;
  const { rows } = await pool.query(
    `insert into cases
      (date_proposed, customer_name, phone, gender, age, plan_type, company, sum_insured, premium, status, follow_up_date, not_close_reason, proposed_by, note)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     returning *`,
    [
      toDateOrNull(b.dateProposed), b.customerName || '', b.phone || '', b.gender || '',
      toIntOrNull(b.age), b.planType || '', b.company || '', toIntOrNull(b.sumInsured), toIntOrNull(b.premium),
      b.status || 'เสนอแล้ว', toDateOrNull(b.followUpDate), b.notCloseReason || '', b.proposedBy || '', b.note || ''
    ]
  );
  res.json(mapCase(rows[0]));
});

app.put('/api/cases/:id', async (req, res) => {
  const b = req.body;
  const { rows } = await pool.query(
    `update cases set
      date_proposed = $1, customer_name = $2, phone = $3, gender = $4, age = $5,
      plan_type = $6, company = $7, sum_insured = $8, premium = $9, status = $10,
      follow_up_date = $11, not_close_reason = $12, proposed_by = $13, note = $14
     where id = $15
     returning *`,
    [
      toDateOrNull(b.dateProposed), b.customerName || '', b.phone || '', b.gender || '',
      toIntOrNull(b.age), b.planType || '', b.company || '', toIntOrNull(b.sumInsured), toIntOrNull(b.premium),
      b.status || 'เสนอแล้ว', toDateOrNull(b.followUpDate), b.notCloseReason || '', b.proposedBy || '', b.note || '',
      req.params.id
    ]
  );
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(mapCase(rows[0]));
});

app.delete('/api/cases/:id', async (req, res) => {
  await pool.query('delete from cases where id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- Scores ----
app.get('/api/scores', async (req, res) => {
  const [membersRes, totalsRes, entriesRes] = await Promise.all([
    pool.query('select * from members order by id'),
    pool.query('select member, coalesce(sum(points), 0) as total from score_entries group by member'),
    pool.query('select * from score_entries order by created_at desc')
  ]);
  const totals = {};
  for (const r of totalsRes.rows) totals[r.member] = Number(r.total);

  const leaderboard = membersRes.rows
    .map(m => ({ ...mapMember(m), points: totals[m.name] || 0 }))
    .sort((a, b) => b.points - a.points);

  res.json({
    leaderboard,
    teamTotal: leaderboard.reduce((s, m) => s + m.points, 0),
    entries: entriesRes.rows.map(mapScoreEntry)
  });
});

app.post('/api/scores', async (req, res) => {
  const { member, points, reason } = req.body;
  if (!member || typeof points !== 'number') {
    return res.status(400).json({ error: 'member and numeric points required' });
  }
  const { rows } = await pool.query(
    'insert into score_entries (member, points, reason) values ($1, $2, $3) returning *',
    [member, points, reason || '']
  );
  res.json(mapScoreEntry(rows[0]));
});

app.delete('/api/scores/:id', async (req, res) => {
  await pool.query('delete from score_entries where id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Fast Forward running at http://localhost:${PORT}`);
});
