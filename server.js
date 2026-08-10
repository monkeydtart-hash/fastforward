const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3100;

app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
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
  return { id: String(r.id), scope: r.scope, member: r.member, points: r.points, reason: r.reason, createdAt: r.created_at.toISOString() };
}

const OUR_TEAM = 'ทีมเรา';

function mapCompetitorTeam(r) {
  return { id: String(r.id), name: r.name };
}

function mapPremiumEntry(r) {
  return { id: String(r.id), team: r.team, amount: Number(r.amount), note: r.note, createdAt: r.created_at.toISOString() };
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
  const [membersRes, totalsRes, teamTotalRes, entriesRes] = await Promise.all([
    pool.query('select * from members order by id'),
    pool.query("select member, coalesce(sum(points), 0) as total from score_entries where scope = 'individual' group by member"),
    pool.query("select coalesce(sum(points), 0) as total from score_entries where scope = 'team'"),
    pool.query('select * from score_entries order by created_at desc')
  ]);
  const totals = {};
  for (const r of totalsRes.rows) totals[r.member] = Number(r.total);

  const leaderboard = membersRes.rows
    .map(m => ({ ...mapMember(m), points: totals[m.name] || 0 }))
    .sort((a, b) => b.points - a.points);

  res.json({
    leaderboard,
    teamTotal: Number(teamTotalRes.rows[0].total),
    entries: entriesRes.rows.map(mapScoreEntry)
  });
});

app.post('/api/scores', async (req, res) => {
  const { points, reason } = req.body;
  const scope = req.body.scope === 'team' ? 'team' : 'individual';
  const member = scope === 'team' ? null : req.body.member;
  if (typeof points !== 'number' || (scope === 'individual' && !member)) {
    return res.status(400).json({ error: 'member and numeric points required for individual scores' });
  }
  const { rows } = await pool.query(
    'insert into score_entries (scope, member, points, reason) values ($1, $2, $3, $4) returning *',
    [scope, member, points, reason || '']
  );
  res.json(mapScoreEntry(rows[0]));
});

app.delete('/api/scores/:id', async (req, res) => {
  await pool.query('delete from score_entries where id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- Competitor teams ----
app.get('/api/competitor-teams', async (req, res) => {
  const { rows } = await pool.query('select * from competitor_teams order by id');
  res.json(rows.map(mapCompetitorTeam));
});

app.post('/api/competitor-teams', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const { rows } = await pool.query(
    'insert into competitor_teams (name) values ($1) returning *',
    [name]
  );
  res.json(mapCompetitorTeam(rows[0]));
});

app.delete('/api/competitor-teams/:id', async (req, res) => {
  await pool.query('delete from competitor_teams where id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- Premiums ----
app.get('/api/premiums', async (req, res) => {
  const [teamsRes, totalsRes, entriesRes] = await Promise.all([
    pool.query('select * from competitor_teams order by id'),
    pool.query('select team, coalesce(sum(amount), 0) as total from premium_entries group by team'),
    pool.query('select * from premium_entries order by created_at desc')
  ]);
  const totals = {};
  for (const r of totalsRes.rows) totals[r.team] = Number(r.total);

  const teamNames = [OUR_TEAM, ...teamsRes.rows.map(t => t.name)];
  const leaderboard = teamNames
    .map(name => ({ team: name, total: totals[name] || 0 }))
    .sort((a, b) => b.total - a.total);

  res.json({
    ourTeam: OUR_TEAM,
    leaderboard,
    competitorTeams: teamsRes.rows.map(mapCompetitorTeam),
    entries: entriesRes.rows.map(mapPremiumEntry)
  });
});

app.post('/api/premiums', async (req, res) => {
  const { team, amount, note } = req.body;
  if (!team || typeof amount !== 'number') {
    return res.status(400).json({ error: 'team and numeric amount required' });
  }
  const { rows } = await pool.query(
    'insert into premium_entries (team, amount, note) values ($1, $2, $3) returning *',
    [team, amount, note || '']
  );
  res.json(mapPremiumEntry(rows[0]));
});

app.delete('/api/premiums/:id', async (req, res) => {
  await pool.query('delete from premium_entries where id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- LINE webhook: record scores announced in the LINE group ----
function verifyLineSignature(req) {
  const signature = req.get('x-line-signature');
  if (!signature || !process.env.LINE_CHANNEL_SECRET) return false;
  const hash = crypto
    .createHmac('sha256', process.env.LINE_CHANNEL_SECRET)
    .update(req.rawBody)
    .digest('base64');
  return hash === signature;
}

function parseScoreMessage(text) {
  const t = text.trim();
  let match = t.match(/^([+-]\d+)\s+(\S+)\s*(.*)$/s);
  if (match) {
    return { points: parseInt(match[1], 10), target: match[2], reason: match[3].trim() };
  }
  match = t.match(/^คะแนน(\S+)\s+([+-]\d+)\s*(.*)$/s);
  if (match) {
    return { points: parseInt(match[2], 10), target: match[1], reason: match[3].trim() };
  }
  return null;
}

function parsePremiumMessage(text) {
  const match = text.trim().match(/^เบี้ย\s+(\S+)\s+(\d+(?:\.\d+)?)\s*(.*)$/s);
  if (!match) return null;
  return { team: match[1], amount: parseFloat(match[2]), note: match[3].trim() };
}

async function replyLine(replyToken, text) {
  if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) return;
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] })
  });
}

async function scoreSummaryText() {
  const [membersRes, totalsRes, teamTotalRes] = await Promise.all([
    pool.query('select * from members order by id'),
    pool.query("select member, coalesce(sum(points), 0) as total from score_entries where scope = 'individual' group by member"),
    pool.query("select coalesce(sum(points), 0) as total from score_entries where scope = 'team'")
  ]);
  const totals = {};
  for (const r of totalsRes.rows) totals[r.member] = Number(r.total);
  const leaderboard = membersRes.rows
    .map(m => ({ name: m.name, points: totals[m.name] || 0 }))
    .sort((a, b) => b.points - a.points);
  const lines = leaderboard.map((m, i) => `${i + 1}. ${m.name} - ${m.points}`);
  return `📊 คะแนนทีม: ${Number(teamTotalRes.rows[0].total)} คะแนน\n\nอันดับคะแนนบุคคล\n${lines.join('\n')}`;
}

async function premiumSummaryText() {
  const [teamsRes, totalsRes] = await Promise.all([
    pool.query('select * from competitor_teams order by id'),
    pool.query('select team, coalesce(sum(amount), 0) as total from premium_entries group by team')
  ]);
  const totals = {};
  for (const r of totalsRes.rows) totals[r.team] = Number(r.total);
  const teamNames = [OUR_TEAM, ...teamsRes.rows.map(t => t.name)];
  const leaderboard = teamNames
    .map(name => ({ name, total: totals[name] || 0 }))
    .sort((a, b) => b.total - a.total);
  const lines = leaderboard.map((t, i) => `${i + 1}. ${t.name} - ${t.total.toLocaleString()} บาท`);
  return `💰 ยอดเบี้ย\n${lines.join('\n')}`;
}

app.post('/webhook/line', async (req, res) => {
  if (!verifyLineSignature(req)) return res.status(403).end();
  res.status(200).end();

  const events = req.body.events || [];
  for (const event of events) {
    if (event.type !== 'message' || event.message.type !== 'text') continue;

    const text = event.message.text.trim();
    if (text === 'คะแนน') {
      try {
        await replyLine(event.replyToken, await scoreSummaryText());
      } catch (err) {
        console.error('LINE webhook score summary error:', err);
      }
      continue;
    }
    if (text === 'ยอดเบี้ย') {
      try {
        await replyLine(event.replyToken, await premiumSummaryText());
      } catch (err) {
        console.error('LINE webhook premium summary error:', err);
      }
      continue;
    }

    const premium = parsePremiumMessage(event.message.text);
    if (premium) {
      try {
        const teamName = premium.team === 'ทีมเรา' ? OUR_TEAM : premium.team;
        if (teamName !== OUR_TEAM) {
          const { rows: teamRows } = await pool.query('select * from competitor_teams where name = $1', [teamName]);
          if (!teamRows.length) {
            await pool.query('insert into competitor_teams (name) values ($1)', [teamName]);
          }
        }
        await pool.query(
          'insert into premium_entries (team, amount, note) values ($1, $2, $3)',
          [teamName, premium.amount, premium.note]
        );
        await replyLine(event.replyToken, `✅ บันทึกยอดเบี้ย ${premium.amount.toLocaleString()} บาท ให้ ${teamName} แล้วครับ${premium.note ? ` (${premium.note})` : ''}`);
      } catch (err) {
        console.error('LINE webhook premium error:', err);
      }
      continue;
    }

    const parsed = parseScoreMessage(event.message.text);
    if (!parsed) continue;

    const sign = parsed.points > 0 ? '+' : '';
    try {
      if (parsed.target === 'ทีม') {
        await pool.query(
          'insert into score_entries (scope, member, points, reason) values ($1, $2, $3, $4)',
          ['team', null, parsed.points, parsed.reason]
        );
        await replyLine(event.replyToken, `✅ บันทึก ${sign}${parsed.points} คะแนนทีม แล้วครับ${parsed.reason ? ` (${parsed.reason})` : ''}`);
      } else {
        const { rows: memberRows } = await pool.query('select * from members where name = $1', [parsed.target]);
        if (!memberRows.length) {
          await replyLine(event.replyToken, `⚠️ ไม่พบชื่อ "${parsed.target}" ในระบบ พิมพ์ชื่อให้ตรงกับสมาชิกในทีมนะครับ`);
          continue;
        }
        await pool.query(
          'insert into score_entries (scope, member, points, reason) values ($1, $2, $3, $4)',
          ['individual', parsed.target, parsed.points, parsed.reason]
        );
        await replyLine(event.replyToken, `✅ บันทึก ${sign}${parsed.points} ให้ ${parsed.target} แล้วครับ${parsed.reason ? ` (${parsed.reason})` : ''}`);
      }
    } catch (err) {
      console.error('LINE webhook score error:', err);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Fast Forward running at http://localhost:${PORT}`);
});
