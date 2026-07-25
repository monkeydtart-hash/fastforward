create table if not exists members (
  id serial primary key,
  name text not null,
  role text not null default '',
  phone text not null default ''
);

create table if not exists cases (
  id serial primary key,
  date_proposed date,
  customer_name text not null default '',
  phone text not null default '',
  gender text not null default '',
  age integer,
  plan_type text not null default '',
  company text not null default '',
  sum_insured numeric,
  premium numeric,
  status text not null default 'เสนอแล้ว',
  follow_up_date date,
  not_close_reason text not null default '',
  proposed_by text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists score_entries (
  id serial primary key,
  member text not null,
  points integer not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

insert into members (name, role, phone)
select v.name, v.role, v.phone
from (values
  ('ต๊าส', 'ประธาน', '0860404640'),
  ('พี่กอล์ฟ', 'รอง', '0957074795'),
  ('วา', 'เลขา', '0875923494'),
  ('เฌอพลอย', 'เหรัญญิก', '0855619559'),
  ('ปาเก้', 'สวัสดิการ', '0935405946'),
  ('อุ๋ม', 'สวัสดิการ', '0979974917')
) as v(name, role, phone)
where not exists (select 1 from members);
