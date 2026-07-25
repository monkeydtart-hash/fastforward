# ทีม 6 คน — ระบบสะสมคะแนน + จัดการโปรเจค

เว็บแอปภายในสำหรับคณะกรรมการ 6 คน ใช้บันทึกคะแนนสะสมและติดตามโปรเจคของทีม
สร้างด้วย Next.js (App Router) + Supabase

สมาชิก: ประธาน (ต๊าส), รองประธาน (พี่กอล์ฟ), เลขา (วา), เหรัญญิก (เฌอพลอย),
สวัสดิการ (ปาเก้, อุ๋ม)

## Setup

### 1. สร้างโปรเจค Supabase

1. ไปที่ [supabase.com](https://supabase.com) สร้างโปรเจคใหม่ (ฟรี)
2. เปิด **SQL Editor** แล้วรันไฟล์ [`supabase/schema.sql`](./supabase/schema.sql) ทั้งหมด
   - จะสร้างตาราง `members`, `projects`, `project_members`, `point_logs`
   - และใส่ข้อมูลสมาชิกทั้ง 6 คนให้อัตโนมัติ พร้อม PIN เริ่มต้น = **เบอร์โทร 4 หลักสุดท้าย**
3. ไปที่ **Project Settings → API** คัดลอกค่า:
   - `Project URL` → ใช้เป็น `SUPABASE_URL`
   - `service_role` key (secret, ไม่ใช่ `anon`) → ใช้เป็น `SUPABASE_SERVICE_ROLE_KEY`

> ระบบนี้ไม่ได้เปิดใช้ Row Level Security เพราะเป็นเครื่องมือภายในของทีมเล็ก
> (6 คน) และการอ่าน/เขียนข้อมูลทั้งหมดทำผ่าน Server Actions ของ Next.js ที่ใช้
> service role key เท่านั้น — **ห้ามนำ service role key ไปใช้ฝั่ง client**

### 2. ตั้งค่า environment variables

คัดลอก `.env.local.example` เป็น `.env.local` แล้วกรอกค่าจริง:

```bash
cp .env.local.example .env.local
```

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
SESSION_SECRET=<random string>
```

สร้าง `SESSION_SECRET` แบบสุ่มด้วยคำสั่ง:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. รันแอป

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ระบบจะพาไปหน้า `/login`
เลือกชื่อของตัวเอง แล้วกรอก PIN (เบอร์โทร 4 หลักสุดท้าย)

## ฟีเจอร์

- **ภาพรวม (Dashboard)** — กระดานคะแนนเรียงอันดับ, สรุปสถานะโปรเจค, กิจกรรมล่าสุด
- **คะแนน** — เพิ่ม/หักคะแนนให้สมาชิกพร้อมเหตุผล และดูประวัติทั้งหมด
- **โปรเจค** — สร้างโปรเจค กำหนดผู้รับผิดชอบและคะแนนรางวัล เปลี่ยนสถานะ
  (วางแผน → กำลังทำ → เสร็จแล้ว/ยกเลิก) เมื่อโปรเจคถูกทำเครื่องหมายว่า
  "เสร็จแล้ว" ระบบจะมอบคะแนนรางวัลให้ผู้รับผิดชอบทุกคนอัตโนมัติ (ครั้งเดียว)

## Deploy

Deploy ได้ตรงกับ [Vercel](https://vercel.com/new) — ตั้งค่า environment
variables เดียวกับ `.env.local` ในหน้า Project Settings ของ Vercel
