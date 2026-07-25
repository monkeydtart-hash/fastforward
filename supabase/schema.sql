-- Team 6 Committee App schema
-- Run this in the Supabase SQL editor for a fresh project.
-- Row Level Security is intentionally left OFF: the app is a small trusted
-- internal tool and all reads/writes go through Next.js server actions
-- using the service role key. Do not expose the anon key to the browser.

create extension if not exists "pgcrypto";

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  phone text not null,
  pin_hash text not null,
  avatar_color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  status text not null default 'planning'
    check (status in ('planning', 'in_progress', 'done', 'cancelled')),
  due_date date,
  points_reward integer not null default 0,
  created_by uuid references members(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists project_members (
  project_id uuid not null references projects(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  primary key (project_id, member_id)
);

create table if not exists point_logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  points integer not null,
  reason text not null,
  project_id uuid references projects(id) on delete set null,
  created_by uuid references members(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists point_logs_member_idx on point_logs(member_id);
create index if not exists point_logs_project_idx on point_logs(project_id);
create index if not exists project_members_member_idx on project_members(member_id);

-- Seed the 6 committee members.
-- Default PIN = last 4 digits of each member's phone number.
-- Hashes below are bcrypt(10) of those PINs; change PINs later if desired.
insert into members (name, role, phone, pin_hash, avatar_color) values
  ('ต๊าส', 'ประธาน', '0860404640', '$2b$10$yFJTgNa62NAS4tk2Tbvz8.n3S/vP2vhgC2rwkNsU4UbpNKtlNa.eq', '#6366f1'),
  ('พี่กอล์ฟ', 'รองประธาน', '0957074795', '$2b$10$l6qR1baPsMwmIbwkcXh5oOHVvDflMmmjjQFjNl7NnILKeAyAlCq2q', '#0ea5e9'),
  ('วา', 'เลขา', '0875923494', '$2b$10$yHla8VjAtT6vYt6qz59q7OcnDles9IcdaYrMU9DKxhSZAWC3oIWr2', '#10b981'),
  ('เฌอพลอย', 'เหรัญญิก', '0855619559', '$2b$10$gY5R8tKMTHQSI1gKXrrOheUw0JfvgFr2IctNOEYnVgsSZuRmiEHHm', '#f59e0b'),
  ('ปาเก้', 'สวัสดิการ', '0935405946', '$2b$10$vzqPwLwsEdGilgMz3lfdvOQAvS/4VH1MINABd342aKdarjm4vBzJm', '#ec4899'),
  ('อุ๋ม', 'สวัสดิการ', '0979974917', '$2b$10$GvAOkDbNQmfvLbX0FcGofuwuNFDdjXVZ5/MsycSZ/0jmcDpUbf1aG', '#8b5cf6')
on conflict do nothing;
