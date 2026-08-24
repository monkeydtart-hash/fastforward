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
  return { id: String(r.id), name: r.name, group: r.group_no, premium: Number(r.premium), createdAt: r.created_at.toISOString() };
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
app.get('/api/sa-asoke', async (req, res) => {
  const { rows } = await pool.query('select * from sa_asoke_premiums order by id');
  const entries = rows.map(mapSaAsokePremium);
  const total = entries.reduce((sum, e) => sum + e.premium, 0);
  res.json({ entries, total });
});

app.post('/api/sa-asoke', async (req, res) => {
  const { name, group, premium } = req.body;
  if (!name || typeof premium !== 'number') {
    return res.status(400).json({ error: 'name and numeric premium required' });
  }
  const { rows } = await pool.query(
    'insert into sa_asoke_premiums (name, group_no, premium) values ($1, $2, $3) returning *',
    [name, group || '', premium]
  );
  res.json(mapSaAsokePremium(rows[0]));
});

app.put('/api/sa-asoke/:id', async (req, res) => {
  const { name, group, premium } = req.body;
  if (!name || typeof premium !== 'number') {
    return res.status(400).json({ error: 'name and numeric premium required' });
  }
  const { rows } = await pool.query(
    'update sa_asoke_premiums set name = $1, group_no = $2, premium = $3 where id = $4 returning *',
    [name, group || '', premium, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(mapSaAsokePremium(rows[0]));
});

app.delete('/api/sa-asoke/:id', async (req, res) => {
  await pool.query('delete from sa_asoke_premiums where id = $1', [req.params.id]);
  res.json({ ok: true });
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
