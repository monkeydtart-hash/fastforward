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

function mapPost(r) {
  return { id: String(r.id), author: r.author, content: r.content, createdAt: r.created_at.toISOString() };
}

function mapResource(r) {
  return {
    id: String(r.id),
    title: r.title,
    category: r.category,
    content: r.content,
    createdBy: r.created_by,
    createdAt: r.created_at.toISOString()
  };
}

function mapEvent(r) {
  return {
    id: String(r.id),
    title: r.title,
    eventDate: r.event_date ? r.event_date.toISOString().slice(0, 10) : '',
    eventTime: r.event_time,
    location: r.location,
    note: r.note,
    createdBy: r.created_by,
    createdAt: r.created_at.toISOString()
  };
}

function mapShirtOrder(r) {
  return {
    id: String(r.id),
    name: r.name,
    nickname: r.nickname,
    branch: r.branch,
    size: r.size,
    leftProject: r.left_project,
    paid: r.paid,
    paidAt: r.paid_at ? r.paid_at.toISOString() : null,
    note: r.note
  };
}

function mapSaAsokePremium(r) {
  return {
    id: String(r.id),
    name: r.name,
    group: r.group_no,
    premium: Number(r.premium),
    productType: r.product_type,
    commissionRateRuleId: r.commission_rate_rule_id ? String(r.commission_rate_rule_id) : null,
    riders: [],
    createdAt: r.created_at.toISOString()
  };
}

function mapSaAsokeRider(r) {
  return {
    id: String(r.id),
    premiumId: String(r.premium_id),
    commissionRateRuleId: r.commission_rate_rule_id ? String(r.commission_rate_rule_id) : null,
    productType: r.product_type,
    premium: Number(r.premium)
  };
}

function mapCommissionRateRule(r) {
  return {
    id: String(r.id),
    category: r.category,
    productCode: r.product_code,
    productName: r.product_name,
    ageRange: r.age_range,
    conditionLabel: r.condition_label,
    year1Rate: r.year1_rate === null ? null : Number(r.year1_rate),
    otherYearsNote: r.other_years_note,
    productionPct: r.production_pct === null ? null : Number(r.production_pct),
    comPlus: r.com_plus === null ? null : Number(r.com_plus),
    comPlusNote: r.com_plus_note,
    laBonus: r.la_bonus === null ? null : Number(r.la_bonus)
  };
}

function mapSaAsokeRecruit(r) {
  return {
    id: String(r.id),
    recruiterName: r.recruiter_name,
    newAgentName: r.new_agent_name,
    caseOpened: r.case_opened,
    note: r.note,
    createdAt: r.created_at.toISOString()
  };
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

// ---- Feed posts ----
app.get('/api/posts', async (req, res) => {
  const { rows } = await pool.query('select * from posts order by created_at desc');
  res.json(rows.map(mapPost));
});

app.post('/api/posts', async (req, res) => {
  const { author, content } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });
  const { rows } = await pool.query(
    'insert into posts (author, content) values ($1, $2) returning *',
    [author || '', content]
  );
  res.json(mapPost(rows[0]));
});

app.delete('/api/posts/:id', async (req, res) => {
  await pool.query('delete from posts where id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- Knowledge base / sales scripts ----
app.get('/api/resources', async (req, res) => {
  const { rows } = await pool.query('select * from resources order by created_at desc');
  res.json(rows.map(mapResource));
});

app.post('/api/resources', async (req, res) => {
  const { title, category, content, createdBy } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });
  const { rows } = await pool.query(
    'insert into resources (title, category, content, created_by) values ($1, $2, $3, $4) returning *',
    [title, category || '', content, createdBy || '']
  );
  res.json(mapResource(rows[0]));
});

app.delete('/api/resources/:id', async (req, res) => {
  await pool.query('delete from resources where id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- Team events / calendar ----
app.get('/api/events', async (req, res) => {
  const { rows } = await pool.query('select * from events order by event_date asc, event_time asc');
  res.json(rows.map(mapEvent));
});

app.post('/api/events', async (req, res) => {
  const { title, eventDate, eventTime, location, note, createdBy } = req.body;
  if (!title || !eventDate) return res.status(400).json({ error: 'title and eventDate required' });
  const { rows } = await pool.query(
    `insert into events (title, event_date, event_time, location, note, created_by)
     values ($1, $2, $3, $4, $5, $6) returning *`,
    [title, eventDate, eventTime || '', location || '', note || '', createdBy || '']
  );
  res.json(mapEvent(rows[0]));
});

app.delete('/api/events/:id', async (req, res) => {
  await pool.query('delete from events where id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- Shirt orders roster, used to track ค่างานเลี้ยง (party fee) payments ----
app.get('/api/shirts', async (req, res) => {
  const { rows } = await pool.query('select * from shirt_orders order by id');
  const orders = rows.map(mapShirtOrder);
  const payable = orders.filter(o => !o.leftProject);
  res.json({
    orders,
    paidCount: payable.filter(o => o.paid).length,
    totalCount: payable.length
  });
});

app.post('/api/shirts', async (req, res) => {
  const { name, nickname, branch, size } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const { rows } = await pool.query(
    'insert into shirt_orders (name, nickname, branch, size) values ($1, $2, $3, $4) returning *',
    [name, nickname || '', branch || '', size || '']
  );
  res.json(mapShirtOrder(rows[0]));
});

app.delete('/api/shirts/:id', async (req, res) => {
  await pool.query('delete from shirt_orders where id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.patch('/api/shirts/:id', async (req, res) => {
  const b = req.body;
  const fields = [];
  const values = [];
  let i = 1;
  if (typeof b.paid === 'boolean') {
    fields.push(`paid = $${i++}`, `paid_at = $${i++}`);
    values.push(b.paid, b.paid ? new Date() : null);
  }
  if (typeof b.size === 'string') { fields.push(`size = $${i++}`); values.push(b.size); }
  if (typeof b.note === 'string') { fields.push(`note = $${i++}`); values.push(b.note); }
  if (!fields.length) return res.status(400).json({ error: 'no fields to update' });
  values.push(req.params.id);
  const { rows } = await pool.query(
    `update shirt_orders set ${fields.join(', ')} where id = $${i} returning *`,
    values
  );
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(mapShirtOrder(rows[0]));
});

// ---- SA Asoke premium summary ----
async function attachRiders(entries) {
  if (!entries.length) return entries;
  const ids = entries.map(e => Number(e.id));
  const { rows } = await pool.query('select * from sa_asoke_premium_riders where premium_id = any($1) order by id', [ids]);
  const byPremiumId = new Map();
  rows.forEach(r => {
    const rider = mapSaAsokeRider(r);
    if (!byPremiumId.has(rider.premiumId)) byPremiumId.set(rider.premiumId, []);
    byPremiumId.get(rider.premiumId).push(rider);
  });
  entries.forEach(e => { e.riders = byPremiumId.get(e.id) || []; });
  return entries;
}

async function replaceRiders(premiumId, riders) {
  await pool.query('delete from sa_asoke_premium_riders where premium_id = $1', [premiumId]);
  for (const r of riders || []) {
    if (typeof r.premium !== 'number') continue;
    await pool.query(
      'insert into sa_asoke_premium_riders (premium_id, commission_rate_rule_id, product_type, premium) values ($1, $2, $3, $4)',
      [premiumId, r.commissionRateRuleId || null, r.productType || '', r.premium]
    );
  }
}

app.get('/api/sa-asoke', async (req, res) => {
  const { rows } = await pool.query('select * from sa_asoke_premiums order by id');
  const entries = await attachRiders(rows.map(mapSaAsokePremium));
  const total = entries.reduce((sum, e) => sum + e.premium + e.riders.reduce((s, r) => s + r.premium, 0), 0);
  res.json({ entries, total });
});

app.post('/api/sa-asoke', async (req, res) => {
  const { name, group, premium, productType, commissionRateRuleId, riders } = req.body;
  if (!name || typeof premium !== 'number') {
    return res.status(400).json({ error: 'name and numeric premium required' });
  }
  const { rows } = await pool.query(
    'insert into sa_asoke_premiums (name, group_no, premium, product_type, commission_rate_rule_id) values ($1, $2, $3, $4, $5) returning *',
    [name, group || '', premium, productType || '', commissionRateRuleId || null]
  );
  const entry = mapSaAsokePremium(rows[0]);
  await replaceRiders(entry.id, riders);
  const [saved] = await attachRiders([entry]);
  res.json(saved);
});

app.put('/api/sa-asoke/:id', async (req, res) => {
  const { name, group, premium, productType, commissionRateRuleId, riders } = req.body;
  if (!name || typeof premium !== 'number') {
    return res.status(400).json({ error: 'name and numeric premium required' });
  }
  const { rows } = await pool.query(
    'update sa_asoke_premiums set name = $1, group_no = $2, premium = $3, product_type = $4, commission_rate_rule_id = $5 where id = $6 returning *',
    [name, group || '', premium, productType || '', commissionRateRuleId || null, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  const entry = mapSaAsokePremium(rows[0]);
  if (riders !== undefined) await replaceRiders(entry.id, riders);
  const [saved] = await attachRiders([entry]);
  res.json(saved);
});

app.delete('/api/sa-asoke/:id', async (req, res) => {
  await pool.query('delete from sa_asoke_premiums where id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.post('/api/sa-asoke/:id/riders', async (req, res) => {
  const { commissionRateRuleId, productType, premium } = req.body;
  if (typeof premium !== 'number') {
    return res.status(400).json({ error: 'numeric premium required' });
  }
  const { rows } = await pool.query(
    'insert into sa_asoke_premium_riders (premium_id, commission_rate_rule_id, product_type, premium) values ($1, $2, $3, $4) returning *',
    [req.params.id, commissionRateRuleId || null, productType || '', premium]
  );
  res.json(mapSaAsokeRider(rows[0]));
});

app.delete('/api/sa-asoke/riders/:riderId', async (req, res) => {
  await pool.query('delete from sa_asoke_premium_riders where id = $1', [req.params.riderId]);
  res.json({ ok: true });
});

// ---- Commission rate rules (ตารางค่าคอม) ----
app.get('/api/sa-asoke/commission-rates', async (req, res) => {
  const { rows } = await pool.query('select * from commission_rate_rules order by category, product_code, id');
  res.json(rows.map(mapCommissionRateRule));
});

app.post('/api/sa-asoke/commission-rates', async (req, res) => {
  const { category, productCode, productName, ageRange, conditionLabel, year1Rate, otherYearsNote, productionPct, comPlus, comPlusNote, laBonus } = req.body;
  if (!category || !productCode || !productName) {
    return res.status(400).json({ error: 'category, productCode and productName required' });
  }
  const { rows } = await pool.query(
    `insert into commission_rate_rules
     (category, product_code, product_name, age_range, condition_label, year1_rate, other_years_note, production_pct, com_plus, com_plus_note, la_bonus)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning *`,
    [category, productCode, productName, ageRange || '', conditionLabel || '', year1Rate ?? null, otherYearsNote || '', productionPct ?? null, comPlus ?? null, comPlusNote || '', laBonus ?? null]
  );
  res.json(mapCommissionRateRule(rows[0]));
});

app.put('/api/sa-asoke/commission-rates/:id', async (req, res) => {
  const { category, productCode, productName, ageRange, conditionLabel, year1Rate, otherYearsNote, productionPct, comPlus, comPlusNote, laBonus } = req.body;
  if (!category || !productCode || !productName) {
    return res.status(400).json({ error: 'category, productCode and productName required' });
  }
  const { rows } = await pool.query(
    `update commission_rate_rules set
     category = $1, product_code = $2, product_name = $3, age_range = $4, condition_label = $5,
     year1_rate = $6, other_years_note = $7, production_pct = $8, com_plus = $9, com_plus_note = $10, la_bonus = $11
     where id = $12 returning *`,
    [category, productCode, productName, ageRange || '', conditionLabel || '', year1Rate ?? null, otherYearsNote || '', productionPct ?? null, comPlus ?? null, comPlusNote || '', laBonus ?? null, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(mapCommissionRateRule(rows[0]));
});

app.delete('/api/sa-asoke/commission-rates/:id', async (req, res) => {
  await pool.query('delete from commission_rate_rules where id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- SA Asoke team building (สร้างทีม เปิด New Code/New Case) ----
app.get('/api/sa-asoke/recruits', async (req, res) => {
  const { rows } = await pool.query('select * from sa_asoke_recruits order by id');
  res.json(rows.map(mapSaAsokeRecruit));
});

app.post('/api/sa-asoke/recruits', async (req, res) => {
  const { recruiterName, newAgentName, caseOpened, note } = req.body;
  if (!recruiterName || !newAgentName) {
    return res.status(400).json({ error: 'recruiterName and newAgentName required' });
  }
  const { rows } = await pool.query(
    'insert into sa_asoke_recruits (recruiter_name, new_agent_name, case_opened, note) values ($1, $2, $3, $4) returning *',
    [recruiterName, newAgentName, !!caseOpened, note || '']
  );
  res.json(mapSaAsokeRecruit(rows[0]));
});

app.put('/api/sa-asoke/recruits/:id', async (req, res) => {
  const { recruiterName, newAgentName, caseOpened, note } = req.body;
  if (!recruiterName || !newAgentName) {
    return res.status(400).json({ error: 'recruiterName and newAgentName required' });
  }
  const { rows } = await pool.query(
    'update sa_asoke_recruits set recruiter_name = $1, new_agent_name = $2, case_opened = $3, note = $4 where id = $5 returning *',
    [recruiterName, newAgentName, !!caseOpened, note || '', req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(mapSaAsokeRecruit(rows[0]));
});

app.delete('/api/sa-asoke/recruits/:id', async (req, res) => {
  await pool.query('delete from sa_asoke_recruits where id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- SA Asoke awards summary ----
app.get('/api/sa-asoke/awards', async (req, res) => {
  const [premiumsRes, rulesRes, recruitsRes, ridersRes] = await Promise.all([
    pool.query('select * from sa_asoke_premiums order by id'),
    pool.query('select * from commission_rate_rules'),
    pool.query('select * from sa_asoke_recruits order by id'),
    pool.query('select * from sa_asoke_premium_riders')
  ]);

  const rateById = new Map(rulesRes.rows.map(r => [String(r.id), r.year1_rate === null ? null : Number(r.year1_rate)]));
  const premiums = premiumsRes.rows.map(mapSaAsokePremium);
  const ridersByPremiumId = new Map();
  ridersRes.rows.map(mapSaAsokeRider).forEach(r => {
    if (!ridersByPremiumId.has(r.premiumId)) ridersByPremiumId.set(r.premiumId, []);
    ridersByPremiumId.get(r.premiumId).push(r);
  });

  const byPerson = new Map();
  const ensurePerson = (name) => {
    if (!byPerson.has(name)) {
      byPerson.set(name, { name, caseCount: 0, totalPremium: 0, totalCommission: 0, missingRate: false });
    }
    return byPerson.get(name);
  };

  const addCommission = (person, premium, ruleId) => {
    const rate = ruleId ? rateById.get(ruleId) : null;
    if (rate !== null && rate !== undefined) {
      person.totalCommission += premium * (rate / 100);
    } else {
      person.missingRate = true;
    }
  };

  for (const p of premiums) {
    const person = ensurePerson(p.name);
    person.caseCount += 1;
    person.totalPremium += p.premium;
    addCommission(person, p.premium, p.commissionRateRuleId);
    for (const rider of ridersByPremiumId.get(p.id) || []) {
      person.totalPremium += rider.premium;
      addCommission(person, rider.premium, rider.commissionRateRuleId);
    }
  }

  const recruitCounts = new Map();
  for (const r of recruitsRes.rows) {
    if (!r.case_opened) continue;
    recruitCounts.set(r.recruiter_name, (recruitCounts.get(r.recruiter_name) || 0) + 1);
  }

  const people = [...byPerson.values()];

  const tierPrizes = [1700, 1500, 1300];
  const rankTop3 = (list) => list.slice(0, 3).map((entry, i) => ({ ...entry, rank: i + 1, prize: tierPrizes[i] }));

  // ประเภท 1: ค่าบำเหน็จสะสมสูงสุด ตั้งแต่ 10,000 บาทขึ้นไป
  const eligible1 = people.filter(p => p.totalCommission >= 10000)
    .sort((a, b) => b.totalCommission - a.totalCommission);
  const type1Top = rankTop3(eligible1.map(p => ({ name: p.name, value: p.totalCommission, missingRate: p.missingRate })));
  const type1Consolation = eligible1.slice(3, 3 + 21).map(p => ({ name: p.name, value: p.totalCommission, prize: 700, missingRate: p.missingRate }));

  // ประเภท 2: จำนวนเคสใหม่สูงสุด ตั้งแต่ 4 เคสขึ้นไป (เสมอกันตัดสินที่ค่าบำเหน็จ)
  const eligible2 = people.filter(p => p.caseCount >= 4)
    .sort((a, b) => b.caseCount - a.caseCount || b.totalCommission - a.totalCommission);
  const type2Top = rankTop3(eligible2.map(p => ({ name: p.name, value: p.caseCount, tiebreak: p.totalCommission })));

  // ประเภท 3: สร้างทีมสูงสุด เปิด New Code/New Case 2 คนขึ้นไป (เสมอกันตัดสินที่ค่าบำเหน็จ)
  const eligible3 = [...recruitCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([name, count]) => ({ name, value: count, tiebreak: (byPerson.get(name) || { totalCommission: 0 }).totalCommission }))
    .sort((a, b) => b.value - a.value || b.tiebreak - a.tiebreak);
  const type3Top = rankTop3(eligible3);

  res.json({
    type1: { top: type1Top, consolation: type1Consolation },
    type2: { top: type2Top },
    type3: { top: type3Top },
    peopleMissingRate: people.filter(p => p.missingRate).map(p => p.name)
  });
});

// ---- MDRT tracking ----
app.get('/api/mdrt', async (req, res) => {
  const { member, year } = req.query;
  if (!member || !year) return res.status(400).json({ error: 'member and year required' });
  const [targetRes, entriesRes] = await Promise.all([
    pool.query('select * from mdrt_targets where member = $1 and year = $2', [member, year]),
    pool.query('select * from mdrt_entries where member = $1 and year = $2', [member, year])
  ]);
  const entries = {};
  for (const r of entriesRes.rows) entries[r.month] = Number(r.fyp);
  res.json({
    target: targetRes.rows[0] ? Number(targetRes.rows[0].target_amount) : 0,
    entries
  });
});

app.post('/api/mdrt/target', async (req, res) => {
  const { member, year, targetAmount } = req.body;
  if (!member || !year || typeof targetAmount !== 'number') {
    return res.status(400).json({ error: 'member, year and numeric targetAmount required' });
  }
  await pool.query(
    `insert into mdrt_targets (member, year, target_amount) values ($1, $2, $3)
     on conflict (member, year) do update set target_amount = excluded.target_amount`,
    [member, year, targetAmount]
  );
  res.json({ ok: true });
});

app.post('/api/mdrt/entry', async (req, res) => {
  const { member, year, month, fyp } = req.body;
  if (!member || !year || !month || typeof fyp !== 'number') {
    return res.status(400).json({ error: 'member, year, month and numeric fyp required' });
  }
  await pool.query(
    `insert into mdrt_entries (member, year, month, fyp) values ($1, $2, $3, $4)
     on conflict (member, year, month) do update set fyp = excluded.fyp`,
    [member, year, month, fyp]
  );
  res.json({ ok: true });
});

// ---- LINE webhook: party fee commands from the LINE group ----
function verifyLineSignature(req) {
  const signature = req.get('x-line-signature');
  if (!signature || !process.env.LINE_CHANNEL_SECRET) return false;
  const hash = crypto
    .createHmac('sha256', process.env.LINE_CHANNEL_SECRET)
    .update(req.rawBody)
    .digest('base64');
  return hash === signature;
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

async function shirtSummaryText() {
  const { rows } = await pool.query(
    "select * from shirt_orders where left_project = false order by paid asc, id"
  );
  const paid = rows.filter(r => r.paid);
  const unpaid = rows.filter(r => !r.paid);
  const unpaidNames = unpaid.map(r => r.nickname || r.name).join(', ');
  return `🎉 ค่างานเลี้ยง: จ่ายแล้ว ${paid.length}/${rows.length} คน\n` +
    (unpaid.length ? `ยังไม่จ่าย: ${unpaidNames}` : 'จ่ายครบทุกคนแล้ว 🎉');
}

async function findShirtOrdersByTarget(target) {
  const { rows } = await pool.query(
    'select * from shirt_orders where nickname = $1 or name = $1',
    [target]
  );
  return rows;
}

app.post('/webhook/line', async (req, res) => {
  if (!verifyLineSignature(req)) return res.status(403).end();
  res.status(200).end();

  const events = req.body.events || [];
  for (const event of events) {
    if (event.type !== 'message' || event.message.type !== 'text') continue;

    const text = event.message.text.trim();
    if (text === 'งานเลี้ยง') {
      try {
        await replyLine(event.replyToken, await shirtSummaryText());
      } catch (err) {
        console.error('LINE webhook party fee summary error:', err);
      }
      continue;
    }

    const shirtPaidMatch = text.match(/^(ยกเลิก)?จ่ายงานเลี้ยง\s+(.+)$/s);
    if (shirtPaidMatch) {
      try {
        const cancel = !!shirtPaidMatch[1];
        const target = shirtPaidMatch[2].trim();
        const matches = await findShirtOrdersByTarget(target);
        if (!matches.length) {
          await replyLine(event.replyToken, `⚠️ ไม่พบชื่อ "${target}" ในรายชื่อ พิมพ์ชื่อเล่นให้ตรงกับรายชื่อนะครับ`);
        } else if (matches.length > 1) {
          await replyLine(event.replyToken, `⚠️ พบชื่อ "${target}" มากกว่า 1 คน กรุณาพิมพ์ชื่อ-นามสกุลเต็มแทนชื่อเล่นนะครับ`);
        } else {
          const order = matches[0];
          await pool.query(
            'update shirt_orders set paid = $1, paid_at = $2 where id = $3',
            [!cancel, cancel ? null : new Date(), order.id]
          );
          const who = order.nickname || order.name;
          await replyLine(event.replyToken, cancel
            ? `↩️ ยกเลิกการจ่ายค่างานเลี้ยงของ ${who} แล้วครับ`
            : `✅ บันทึกว่า ${who} จ่ายค่างานเลี้ยงแล้วครับ`);
        }
      } catch (err) {
        console.error('LINE webhook party fee payment error:', err);
      }
      continue;
    }
  }
});

app.listen(PORT, () => {
  console.log(`Fast Forward running at http://localhost:${PORT}`);
});
