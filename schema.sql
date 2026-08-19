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
  scope text not null default 'individual' check (scope in ('individual', 'team')),
  member text,
  points integer not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists competitor_teams (
  id serial primary key,
  name text not null unique
);

create table if not exists premium_entries (
  id serial primary key,
  team text not null,
  amount numeric not null,
  note text not null default '',
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

create table if not exists shirt_orders (
  id serial primary key,
  name text not null,
  nickname text not null default '',
  branch text not null default '',
  size text not null default '',
  left_project boolean not null default false,
  paid boolean not null default false,
  paid_at timestamptz,
  note text not null default ''
);

insert into shirt_orders (name, nickname, branch, size, left_project)
select v.name, v.nickname, v.branch, v.size, v.left_project
from (values
  ('เพ็ญพิชชา จำเนียร', 'หยก', '9', 'M', false),
  ('กมลชนก ไวยบุรี', '', '9', '', true),
  ('รัตนาภรณ์ สิทธิยานนท์', 'แอม', '9', 'S, L', false),
  ('นวนาฏ พัวประเสริฐ', 'เจี๊ยบ', '9', '3XL', false),
  ('เพ็ญพิมล มนูญชัย', 'ปุ้ย', '9', 'M', false),
  ('สุกัญญา พรศาสตร์', 'เก๋', '9', '2XL', false),
  ('สุภิญญา ไชยพิณ', 'ปาร์เก้', '9', 'L', false),
  ('วชิรารัตน์ ธนพัฒน์รัฐกุล', 'มิน', '9', 'L', false),
  ('ภัทรา วณิชชานนท์', 'น้อง', '9', 'L', false),
  ('จุฬาภรณ์ พงษ์พฤกษ์', 'แทม', '9', 'L', false),
  ('ฐิตารีย์ แสนหลวง', 'เนเน่', '11', 'L', false),
  ('ฐิติกาญจน์ มีมาก', 'หวิว', '11', 'M', false),
  ('เกษร เข็มนาค', 'แจ๊ด', '11', 'L', false),
  ('สายรุ้ง ลอยเลื่อน', 'รุ้ง', '11', 'M', false),
  ('หทัยกาญจน์ ยอดต่อ', 'หนิง', '11', 'M', false),
  ('วลันยี์ อารีย์วงศ์', 'นก', '11', 'S', false),
  ('บุษกร เตชะมนูญ', 'บุษ', '24', 'XL', false),
  ('ณัชชา แก้วอินทร์', 'น้ำอ้อย', '24', 'S', false),
  ('ปัทมาวดี จำปาแก้ว', 'หลี', '28', 'M', false),
  ('กนกศักดิ์ มหานุชิต', 'โอเล่', '28', 'XL', false),
  ('วริษฐ์สิริ จินตนาปิทีป', 'สิริ', '28', 'XL', false),
  ('วรรทนี บัวตุ่ม', 'ต่อย', '28', '2XL', false),
  ('อัญญารัตน์ ชานิสุทธิ์', 'อัญ', '34', 'XL', false),
  ('นพวรรณ สวนป่า', 'น้อย', '34', 'S', false),
  ('จาตุรนต์ สำเร็จกิจ', 'ตาร์ท', '36', 'L', false),
  ('พิชชา อินทกุล', 'จิ๋ว', '36', 'M', false),
  ('เฌอพลอย ดีมาก', 'ถง', '36', '3XL', false),
  ('จิตพิสุทธิ์ ศรีวัฒนพงศ์', 'อาย', '36', 'S ×2', false),
  ('วิยดา สีกา', 'อุ๋มอิ๋ม', '36', 'XL', false),
  ('โชษิตา ขำมี', '', '36', 'L', false),
  ('ปาริชาติ กตัญญู', 'แอน๋', '36', 'L', false),
  ('สุรชัย ชมเปราะ', '', '36', 'L', false),
  ('ปารวี มินหะรีสุไรมาน', '', '38', '', true),
  ('ณัฐฐาพร สุขสถิตย์', 'นุ่น', '38', '3XL', false),
  ('ราชัย วงเวียน', 'นก', '38', 'M', false),
  ('มานะ นิ่มอนงค์', '', '38', '', false),
  ('ปณิธาน เพชรรัตน์', 'นู๋', '38', 'M', false),
  ('ปริญญา พิพัฒน์เสาวพงศ์', 'น๊อต', '51', 'L', false),
  ('ปิยะวัฒน์ อินทรแพง', 'โตโย่', '51', 'L ×2', false),
  ('อุกฤษฎ์ ยิ้มย่อง', 'กอล์ฟ', '51', 'XL', false),
  ('ปัทมา ธนะสมบูรณ์', 'พี่ปัท', '36', 'XL', false),
  ('อ.โทนี่', 'อ.โทนี่', '36', 'XL', false)
) as v(name, nickname, branch, size, left_project)
where not exists (select 1 from shirt_orders);
