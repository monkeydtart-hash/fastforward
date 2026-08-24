create table if not exists members (
  id serial primary key,
  name text not null,
  role text not null default '',
  phone text not null default ''
);

create table if not exists posts (
  id serial primary key,
  author text not null default '',
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists resources (
  id serial primary key,
  title text not null,
  category text not null default '',
  content text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists events (
  id serial primary key,
  title text not null,
  event_date date not null,
  event_time text not null default '',
  location text not null default '',
  note text not null default '',
  created_by text not null default '',
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

create table if not exists sa_asoke_premiums (
  id serial primary key,
  name text not null,
  group_no text not null default '',
  premium numeric not null default 0,
  created_at timestamptz not null default now()
);

insert into sa_asoke_premiums (name, group_no, premium)
select v.name, v.group_no, v.premium
from (values
  ('วิยดา สีกา', '6', 3982.00),
  ('กนกศักดิ์ มหานุชิต', '1', 20050.00),
  ('ปณิธาน เพชรรัตน์', '5', 26019.00),
  ('เฌอพลอย ดีมาก', '6', 2050.00),
  ('จุฬาภรณ์ พงษ์พฤกษ์', '2', 2800.00),
  ('พิชชา อินทกุล', '6', 5700.00),
  ('จุฬาภรณ์ พงษ์พฤกษ์', '2', 49900.00),
  ('บุญศักดิ์ บุญสังข์', '2', 1200.00),
  ('จาตุรนต์ สำเร็จกิจ', '6', 5500.00),
  ('จาตุรนต์ สำเร็จกิจ', '6', 3760.00),
  ('พิชชา อินทกุล', '6', 23190.00),
  ('อุกฤษฎ์ ยิ้มย่อง', '6', 28450.00),
  ('วริษฐ์สิริ จินตนาปิทีป', '2', 27030.00),
  ('ณัชชา แก้วอินทร์', '3', 13531.00),
  ('นพวรรณ สวนป่า', '2', 17237.00),
  ('วิยดา สีกา', '6', 3490.00),
  ('วรรทนี บัวตุ่ม', '2', 3080.00),
  ('ภัทรา วณิชชานนท์', '4', 460000.00),
  ('พิชชา อินทกุล', '6', 26500.00),
  ('ราชัย วงเวียน', '1', 2964.00)
) as v(name, group_no, premium)
where not exists (select 1 from sa_asoke_premiums);

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
