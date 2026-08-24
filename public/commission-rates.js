// Commission rate table, transcribed from the agency's quarterly rate sheet.
// Update this file each quarter when a new sheet is provided.
const COMMISSION_RATE_PERIOD = 'ใช้ได้ 1 ก.ค. 69 – 30 ก.ย. 69';

const COMMISSION_RATE_TABLE = [
  // ---- สะสมทรัพย์ (ไม่มีเงินคืน) ----
  { code: 'NJ', name: 'เกษมเกษียณ 60/60', category: 'สะสมทรัพย์ (ไม่มีเงินคืน)', tiers: [
    { ageRange: '15-50', condition: 'ชำระ ≤ 10 ปี', y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: null },
    { ageRange: '15-50', condition: 'ชำระ 11-15 ปี', y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: null },
    { ageRange: '15-50', condition: 'ชำระ ≥ 16 ปี', y1: 25, y2: 10, y3: 8, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'PJ', name: 'คุ้มทวี 5 เท่า 20/20', category: 'สะสมทรัพย์ (ไม่มีเงินคืน)', tiers: [
    { ageRange: '20-60', condition: null, y1: 40, y2: 20, y3: 10, y4: 4, participation: 100, comPlus: null }
  ]},
  { code: 'PM', name: 'คุ้มทวี 10 เท่า 20/20', category: 'สะสมทรัพย์ (ไม่มีเงินคืน)', tiers: [
    { ageRange: '20-60', condition: null, y1: 40, y2: 20, y3: 10, y4: 4, participation: 100, comPlus: null }
  ]},
  { code: 'FA05', name: 'ทีแอลแพลน 15/5', category: 'สะสมทรัพย์ (ไม่มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 5, y2: 3, y3: 2, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'FA10', name: 'ทีแอลแพลน 15/10', category: 'สะสมทรัพย์ (ไม่มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'FC10', name: 'ทีแอลแพลน 20/10', category: 'สะสมทรัพย์ (ไม่มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'FC15', name: 'ทีแอลแพลน 20/15', category: 'สะสมทรัพย์ (ไม่มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 25, y2: 10, y3: 8, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'EP', name: 'ธนทรัพย์ 15/15', category: 'สะสมทรัพย์ (ไม่มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 25, y2: 10, y3: 8, y4: 2, participation: 100, comPlus: 3 }
  ]},
  { code: 'EQ', name: 'ธนทรัพย์ 20/20', category: 'สะสมทรัพย์ (ไม่มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 32, y2: 15, y3: 10, y4: 2, participation: 100, comPlus: 5 }
  ]},
  { code: 'ER', name: 'ธนทรัพย์ 25/25', category: 'สะสมทรัพย์ (ไม่มีเงินคืน)', tiers: [
    { ageRange: '0-65', condition: 'ทุน < 1 ล้าน', y1: 35, y2: 15, y3: 10, y4: 2, participation: 100, comPlus: 5 }
  ]},
  { code: 'ES', name: 'ธนทรัพย์ 30/30', category: 'สะสมทรัพย์ (ไม่มีเงินคืน)', tiers: [
    { ageRange: '0-60', condition: null, y1: 35, y2: 15, y3: 10, y4: 2, participation: 100, comPlus: 5 }
  ]},

  // ---- สะสมทรัพย์ (มีเงินคืน) ----
  { code: 'SL', name: 'เกษมทรัพย์ 130 (20/20)', category: 'สะสมทรัพย์ (มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 25, y2: 10, y3: 8, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'EN62', name: 'เกษมทวี (1) (เกษมทวีพลัส) 14/7', category: 'สะสมทรัพย์ (มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 5, y2: 3, y3: 2, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'EN01', name: 'เกษมบันผล 10/10', category: 'สะสมทรัพย์ (มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 8, y2: 4, y3: 2, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'SH', name: 'ทรัพย์ทวี 400 (20/20)', category: 'สะสมทรัพย์ (มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'EL', name: 'ทรัพย์บันผล 20/20', category: 'สะสมทรัพย์ (มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 30, y2: 12, y3: 8, y4: 2, participation: 100, comPlus: 5 }
  ]},
  { code: 'NH', name: 'ทรัพย์บันผล1 20/20', category: 'สะสมทรัพย์ (มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 32, y2: 15, y3: 10, y4: 2, participation: 100, comPlus: 3 }
  ]},
  { code: 'EN42', name: 'ธนวี1 10/5 (2)', category: 'สะสมทรัพย์ (มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: 'ไม่จ่าย ป.2', y1: 1, y2: 0.5, y3: 0.25, y4: 0, participation: 10, comPlus: null }
  ]},
  { code: 'EN43', name: 'ธนวี1 15/6 (1)', category: 'สะสมทรัพย์ (มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: 'ไม่จ่าย ป.2', y1: 2, y2: 1, y3: 0.5, y4: 0, participation: 10, comPlus: null }
  ]},
  { code: 'EN38', name: 'ธนวี 15/8', category: 'สะสมทรัพย์ (มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: 'อายุ 0-59', y1: 4, y2: 2, y3: 2, y4: 2, participation: 100, comPlus: null },
    { ageRange: '0-70', condition: 'อายุ 60-70', y1: 2, y2: 2, y3: 2, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'EN44', name: 'ธนวี 15/8 (1)', category: 'สะสมทรัพย์ (มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: 'อายุ 0-60', y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: null },
    { ageRange: '0-70', condition: 'อายุ 61-70', y1: 8, y2: 4, y3: 2, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'EN27', name: 'ธนวี 25/15', category: 'สะสมทรัพย์ (มีเงินคืน)', tiers: [
    { ageRange: '0-70', condition: null, y1: 22, y2: 10, y3: 6, y4: 2, participation: 100, comPlus: 3 }
  ]},

  // ---- ตลอดชีพ ----
  { code: 'WN3', name: 'เกษมสิน 3', category: 'ตลอดชีพ', tiers: [
    { ageRange: '0-70', condition: 'ทุน < 5 แสน', y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '0-70', condition: 'ทุน 5-9 แสน', y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '0-70', condition: 'ทุน ≥ 1 ล้าน', y1: 35, y2: 15, y3: 10, y4: 2, participation: 100, comPlus: 5 }
  ]},
  { code: 'W004', name: 'คุ้มธนกิจ 99/20 (Nn)', category: 'ตลอดชีพ', tiers: [
    { ageRange: '0-70', condition: 'ทุน < 5 แสน', y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '0-70', condition: 'ทุน 5-9 แสน', y1: 30, y2: 12, y3: 8, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '0-70', condition: 'ทุน ≥ 1 ล้าน', y1: 40, y2: 16, y3: 10, y4: 2, participation: 100, comPlus: 3 },
    { ageRange: '71-75', condition: 'ทุน < 5 แสน', y1: 10, y2: 5, y3: 3, y4: 2, participation: 100, comPlus: null },
    { ageRange: '71-75', condition: 'ทุน 5-9 แสน', y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: null },
    { ageRange: '71-75', condition: 'ทุน ≥ 1 ล้าน', y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'W006', name: 'คุ้มธนกิจ 99/20 (1n)', category: 'ตลอดชีพ', tiers: [
    { ageRange: '0-70', condition: 'ทุน < 5 แสน', y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '0-70', condition: 'ทุน 5-9 แสน', y1: 30, y2: 12, y3: 8, y4: 2, participation: 100, comPlus: null },
    { ageRange: '0-70', condition: 'ทุน ≥ 1 ล้าน', y1: 40, y2: 16, y3: 10, y4: 2, participation: 100, comPlus: 3 }
  ]},
  { code: 'W019', name: 'คุ้มธนกิจ 99/99 Nn (1)', category: 'ตลอดชีพ', tiers: [
    { ageRange: '0-70', condition: 'ทุน < 5 แสน', y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: null },
    { ageRange: '0-70', condition: 'ทุน 5-9 แสน', y1: 30, y2: 12, y3: 8, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '0-70', condition: 'ทุน ≥ 1 ล้าน', y1: 40, y2: 16, y3: 10, y4: 2, participation: 100, comPlus: 3 },
    { ageRange: '71-80', condition: 'ทุน < 5 แสน', y1: 5, y2: 2, y3: 2, y4: 2, participation: 100, comPlus: null },
    { ageRange: '71-80', condition: 'ทุน 5-9 แสน', y1: 10, y2: 5, y3: 3, y4: 2, participation: 100, comPlus: null },
    { ageRange: '71-80', condition: 'ทุน ≥ 1 ล้าน', y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: null }
  ]},

  // ---- ระยะยาว ----
  { code: 'W018', name: 'เลกาซี่ ฟิต รีไทร์ 99/10', category: 'ระยะยาว', tiers: [
    { ageRange: '0-50', condition: 'อายุ ≤ 40', y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: 15 },
    { ageRange: '0-50', condition: 'อายุ ≥ 41', y1: 8, y2: 4, y3: 2, y4: 2, participation: 100, comPlus: 15 }
  ]},
  { code: 'W022', name: 'เลกาซี่ ฟิต แคร์ 99/10', category: 'ระยะยาว', tiers: [
    { ageRange: '0-50', condition: 'ทุน < 1 ล้าน', y1: 10, y2: 4, y3: 3, y4: 2, participation: 100, comPlus: 15 },
    { ageRange: '0-50', condition: 'ทุน 1-2.9 ล้าน', y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: 15 },
    { ageRange: '0-50', condition: 'ทุน ≥ 3 ล้าน', y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 15 }
  ]},
  { code: 'EN32', name: 'ธนทรัพย์ 85/10', category: 'ระยะยาว', tiers: [
    { ageRange: '0-70', condition: null, y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'EN60', name: 'เลกาซี่ ฟิต เฟิร์ม 80/8', category: 'ระยะยาว', tiers: [
    { ageRange: '0-65', condition: null, y1: 10, y2: 4, y3: 3, y4: 2, participation: 100, comPlus: 5 }
  ]},

  // ---- PAR Product ----
  { code: 'EN54', name: 'มันนี่ ฟิต เฟิร์ม 20/10', category: 'PAR Product', tiers: [
    { ageRange: '0-50', condition: 'ทุน < 2 แสน', y1: 22, y2: 10, y3: 6, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '0-50', condition: 'ทุน ≥ 2 แสน', y1: 25, y2: 10, y3: 8, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '51-60', condition: 'ทุน < 2 แสน', y1: 18, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '51-60', condition: 'ทุน ≥ 2 แสน', y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 10 }
  ]},
  { code: 'EN57', name: 'มันนี่ ฟิต เฟิร์ม 25/20 (1)', category: 'PAR Product', tiers: [
    { ageRange: '0-60', condition: 'ทุน < 2 แสน', y1: 35, y2: 15, y3: 10, y4: 2, participation: 100, comPlus: 5 },
    { ageRange: '0-60', condition: 'ทุน ≥ 2 แสน', y1: 40, y2: 16, y3: 10, y4: 2, participation: 100, comPlus: null },
    { ageRange: '61-65', condition: 'ทุน < 2 แสน', y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 5 },
    { ageRange: '61-65', condition: 'ทุน ≥ 2 แสน', y1: 25, y2: 10, y3: 8, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'EN52', name: 'มันนี่ ฟิต เฟิร์ม 30/15', category: 'PAR Product', tiers: [
    { ageRange: '0-60', condition: 'อายุ 0-50', y1: 30, y2: 12, y3: 8, y4: 2, participation: 100, comPlus: 15 },
    { ageRange: '0-60', condition: 'อายุ 51-60', y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 15 }
  ]},
  { code: 'EN58', name: 'มันนี่ ฟิต เฟิร์ม 30/25 (1)', category: 'PAR Product', tiers: [
    { ageRange: '0-50', condition: 'ทุน < 2 แสน', y1: 35, y2: 15, y3: 10, y4: 2, participation: 100, comPlus: 5 },
    { ageRange: '0-50', condition: 'ทุน ≥ 2 แสน', y1: 40, y2: 16, y3: 10, y4: 2, participation: 100, comPlus: null },
    { ageRange: '51-60', condition: 'ทุน < 2 แสน', y1: 25, y2: 10, y3: 8, y4: 2, participation: 100, comPlus: 5 },
    { ageRange: '51-60', condition: 'ทุน ≥ 2 แสน', y1: 30, y2: 12, y3: 8, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'EN64', name: 'มันนี่ ฟิต เวลท์ตี้ 15/5 (1)', category: 'PAR Product', tiers: [
    { ageRange: '0-70', condition: null, y1: 8, y2: 4, y3: 2, y4: 1, participation: 100, comPlus: 10 }
  ]},
  { code: 'EN65', name: 'มันนี่ ฟิต เวลท์ตี้ 12/6 (1)', category: 'PAR Product', tiers: [
    { ageRange: '0-75', condition: null, y1: 8, y2: 4, y3: 2, y4: 1, participation: 100, comPlus: 7 }
  ]},
  { code: 'EN61', name: 'มันนี่ ฟิต เวลท์ตี้ 18/4', category: 'PAR Product', tiers: [
    { ageRange: '0-65', condition: null, y1: 12, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: 10 }
  ]},
  { code: 'W023', name: 'เลกาซี่ ฟิต รีไทร์ 99/10 (แบบมีส่วนร่วมในเงินปันผล)', category: 'PAR Product', tiers: [
    { ageRange: '0-40', condition: null, y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 15 },
    { ageRange: '41-50', condition: null, y1: 10, y2: 4, y3: 3, y4: 2, participation: 100, comPlus: 15 }
  ]},

  // ---- Wealth ทุน ≥ 10 ล้าน ----
  { code: 'W021', name: 'ไทยไลฟ์ เลกาซี่ ฟิต 99/1', category: 'Wealth ทุน ≥ 10 ล้าน', tiers: [
    { ageRange: '0-80', condition: null, y1: 2, y2: 0, y3: 0, y4: 0, participation: 10, comPlus: 0.5 }
  ]},
  { code: 'W001', name: 'ไทยไลฟ์ เลกาซี่ ฟิต 99/5', category: 'Wealth ทุน ≥ 10 ล้าน', tiers: [
    { ageRange: '0-70', condition: null, y1: 5, y2: 3, y3: 2, y4: 2, participation: 100, comPlus: 5 }
  ]},
  { code: 'W002', name: 'ไทยไลฟ์ เลกาซี่ ฟิต 99/10', category: 'Wealth ทุน ≥ 10 ล้าน', tiers: [
    { ageRange: '0-70', condition: null, y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 8 }
  ]},
  { code: 'W003', name: 'ไทยไลฟ์ เลกาซี่ ฟิต 99/15', category: 'Wealth ทุน ≥ 10 ล้าน', tiers: [
    { ageRange: '0-70', condition: null, y1: 25, y2: 10, y3: 7, y4: 2, participation: 100, comPlus: 10 }
  ]},

  // ---- พิการ / ท้อง / อิสลาม / สูงอายุ ----
  { code: 'EG', name: 'กรมธรรม์พิเศษเพื่อคนพิการ 20/10', category: 'พิการ / ท้อง / อิสลาม / สูงอายุ', tiers: [
    { ageRange: '15-55', condition: null, y1: 12, y2: 5, y3: 3, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'EN08', name: 'ตะกาฟุล 20/20', category: 'พิการ / ท้อง / อิสลาม / สูงอายุ', tiers: [
    { ageRange: '0-70', condition: null, y1: 12, y2: 5, y3: 3, y4: 2, participation: 100, comPlus: null }
  ]},
  { code: 'YH', name: 'ทรัพย์มิ่งขวัญ 90/15', category: 'พิการ / ท้อง / อิสลาม / สูงอายุ', tiers: [
    { ageRange: '60-75', condition: null, y1: 20, y2: 8, y3: 5, y4: 3, participation: 100, comPlus: 5 }
  ]},

  // ---- ลดหย่อนภาษีบำนาญ ----
  { code: 'AW01', name: 'เกษมบำนาญ A1 (1) 85/1', category: 'ลดหย่อนภาษีบำนาญ', tiers: [
    { ageRange: '55-64', condition: null, y1: 0.25, y2: 0, y3: 0, y4: 0, participation: 10, comPlus: 0.25 }
  ]},
  { code: 'AW02', name: 'เกษมบำนาญ 3 (90/60)', category: 'ลดหย่อนภาษีบำนาญ', tiers: [
    { ageRange: '20-55', condition: 'ชำระ ≤ 14 ปี', y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '20-55', condition: 'ชำระ ≥ 15 ปี', y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 10 }
  ]},
  { code: 'AM60', name: 'ทรัพย์บำนาญ 60 (1) 90/60', category: 'ลดหย่อนภาษีบำนาญ', tiers: [
    { ageRange: '20-55', condition: 'ไม่จ่าย ป.2', y1: 5, y2: 3, y3: 2, y4: 0, participation: 10, comPlus: 5 }
  ]},
  { code: 'AV60', name: 'ทรัพย์บำนาญ 60 (2) (90/60)', category: 'ลดหย่อนภาษีบำนาญ', tiers: [
    { ageRange: '20-50', condition: 'ชำระ ≤ 14 ปี', y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: 15 },
    { ageRange: '20-50', condition: 'ชำระ ≥ 15 ปี', y1: 25, y2: 10, y3: 8, y4: 2, participation: 100, comPlus: 15 }
  ]},
  { code: 'AV65', name: 'ทรัพย์บำนาญ 65 (2) (90/65)', category: 'ลดหย่อนภาษีบำนาญ', tiers: [
    { ageRange: '20-55', condition: 'ชำระ ≤ 14 ปี', y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: 15 },
    { ageRange: '20-55', condition: 'ชำระ ≥ 15 ปี', y1: 25, y2: 10, y3: 8, y4: 2, participation: 100, comPlus: 15 }
  ]},
  { code: 'AR65', name: 'ทรัพย์บำนาญ G 65 (90/65)', category: 'ลดหย่อนภาษีบำนาญ', tiers: [
    { ageRange: '20-60', condition: null, y1: 5, y2: 3, y3: 2, y4: 0, participation: 10, comPlus: 5 }
  ]},
  { code: 'AU10', name: 'ทรัพย์บำนาญ G 85/10', category: 'ลดหย่อนภาษีบำนาญ', tiers: [
    { ageRange: '20-50', condition: null, y1: 18, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 10 }
  ]},
  { code: 'AU60', name: 'ทรัพย์บำนาญ G 85/60', category: 'ลดหย่อนภาษีบำนาญ', tiers: [
    { ageRange: '20-50', condition: 'ชำระ ≤ 14 ปี', y1: 20, y2: 8, y3: 5, y4: 2, participation: 100, comPlus: 15 },
    { ageRange: '20-50', condition: 'ชำระ ≥ 15 ปี', y1: 30, y2: 12, y3: 8, y4: 2, participation: 100, comPlus: 15 }
  ]},
  { code: 'AW05', name: 'มันนี่ ฟิต รีไทร์ (G) 85/5', category: 'ลดหย่อนภาษีบำนาญ', tiers: [
    { ageRange: '20-55', condition: 'อายุ 20-40', y1: 10, y2: 5, y3: 3, y4: 2, participation: 100, comPlus: 5 },
    { ageRange: '20-55', condition: 'อายุ 41-50', y1: 8, y2: 4, y3: 2, y4: 2, participation: 100, comPlus: 5 },
    { ageRange: '20-55', condition: 'อายุ 51-55', y1: 5, y2: 3, y3: 2, y4: 2, participation: 100, comPlus: 5 }
  ]},
  { code: 'AW06', name: 'มันนี่ ฟิต รีไทร์ (G) 85/10', category: 'ลดหย่อนภาษีบำนาญ', tiers: [
    { ageRange: '20-49', condition: 'อายุ 20-40', y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '20-49', condition: 'อายุ 41-49', y1: 8, y2: 4, y3: 2, y4: 2, participation: 100, comPlus: 10 }
  ]},
  { code: 'AW07', name: 'มันนี่ ฟิต รีไทร์ (G) 85/60', category: 'ลดหย่อนภาษีบำนาญ', tiers: [
    { ageRange: '20-54', condition: 'อายุ 20-40', y1: 15, y2: 6, y3: 4, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '20-54', condition: 'อายุ 41-50', y1: 8, y2: 4, y3: 2, y4: 2, participation: 100, comPlus: 10 },
    { ageRange: '20-54', condition: 'อายุ 51-54', y1: 4, y2: 2, y3: 2, y4: 2, participation: 100, comPlus: 10 }
  ]},

  // ---- จำกัดระยะเวลาชาย (ผลงาน/Com+ เท่านั้น ไม่มีคอมมิชชั่นแยก) ----
  { code: 'EN39', name: 'ธนวี8 3/2', category: 'จำกัดระยะเวลาชาย', tiers: [
    { ageRange: '0-80', condition: null, y1: 0, y2: 0, y3: 0, y4: 0, participation: 5, comPlus: 0.5 }
  ]},
  { code: 'W011', name: 'เลกาซี่ ฟิต เวลท์ตี้ 99/1', category: 'จำกัดระยะเวลาชาย', tiers: [
    { ageRange: '0-70', condition: null, y1: 0, y2: 0, y3: 0, y4: 0, participation: 5, comPlus: 0.5 }
  ]},
  { code: 'W017', name: 'เลกาซี่ ฟิต เวลท์ตี้ 99/2 (2)', category: 'จำกัดระยะเวลาชาย', tiers: [
    { ageRange: '0-70', condition: null, y1: 0, y2: 0, y3: 0, y4: 0, participation: 5, comPlus: 0.5 }
  ]},

  // ---- ชั่วระยะเวลา (สัญญาหลัก) ----
  { code: 'TH2', name: 'คุ้มทรัพย์ (T) 19/19', category: 'ชั่วระยะเวลา', tiers: [
    { ageRange: '20-60', condition: 'ทุน ≥ 5 แสน', y1: 30, y2: 12, y3: 8, y4: 4, participation: 100, comPlus: null }
  ]},

  // ---- โรคร้าย (สัญญาหลัก) ----
  { code: 'TE15', name: 'เฮลท์ ฟิต ซีเนียร์ ซีโอ', category: 'โรคร้าย', tiers: [
    { ageRange: '40-80 (คุ้มครองถึง 85)', condition: null, y1: 25, y2: 12, y3: 8, y4: 4, participation: 100, comPlus: 15 }
  ]},
  { code: 'TE16', name: 'ค่ารักษาพยาบาลรายวัน รีฟันด์ 5/5', category: 'โรคร้าย', tiers: [
    { ageRange: '20-60', condition: null, y1: 15, y2: 6, y3: 4, y4: 4, participation: 100, comPlus: null }
  ]},

  // ---- PA (สัญญาเพิ่มเติมอุบัติเหตุส่วนบุคคล, อัตราคงที่ทุกปี ไม่มีข้อมูลผลงาน/Com+) ----
  { code: 'TJ1', name: 'พีเอ คลาสสิค ชิลด์', category: 'PA', tiers: [
    { ageRange: '0-15', condition: 'แผน 1-2', y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: null },
    { ageRange: '0-15', condition: 'แผน 3-5', y1: 5, y2: 5, y3: 5, y4: 5, participation: null, comPlus: null },
    { ageRange: '16-75', condition: 'แผน 1-5', y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: null }
  ]},
  { code: 'TL1', name: 'พีเอ โบน ชิลด์', category: 'PA', tiers: [
    { ageRange: '0-75', condition: 'แผน 1-5', y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: null }
  ]},
  { code: 'TX2', name: 'พีเอ ไมโคร ฮอสพิทอล ชิลด์', category: 'PA', tiers: [
    { ageRange: '6-60', condition: 'แผน 1-3', y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: null }
  ]},
  { code: 'TY', name: 'พีเอ รีฟันด์', category: 'PA', tiers: [
    { ageRange: '6-65', condition: 'แผน 1-3', y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: null }
  ]},
  { code: 'TM1', name: 'พีเอ ฮอสพิทอล ชิลด์', category: 'PA', tiers: [
    { ageRange: '6-60', condition: 'แผน 1-5', y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: null }
  ]},
  { code: 'TK1', name: 'พีเอ ซูเปอร์ ชิลด์', category: 'PA', tiers: [
    { ageRange: '25-60', condition: 'แผน 1-5', y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: null }
  ]},
  { code: 'TQ1', name: 'พีเอ ซีเนียร์ โบน ชิลด์', category: 'PA', tiers: [
    { ageRange: '40-75', condition: 'แผน 1-3', y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: null }
  ]},
  { code: 'TN1', name: 'พีเอ ซีเนียร์ โบน ชิลด์ (ลูกกตัญญู)', category: 'PA', tiers: [
    { ageRange: '50-75', condition: 'แผน 1-5', y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: null }
  ]},

  // ---- เฮลท์ ฟิต สบายสบาย (พิกัดอายุ 11-64 ปี) ----
  { code: 'W013', name: 'คุ้มธนกิจ 99/99 (Nn)', category: 'เฮลท์ ฟิต สบายสบาย', tiers: [
    { ageRange: '11-64', condition: null, y1: 20, y2: 8, y3: 5, y4: 2, participation: null, comPlus: null }
  ]},
  { code: 'HHE-HHG', name: 'เฮลท์ ฟิต ชิลด์ (แผน 1-3)', category: 'เฮลท์ ฟิต สบายสบาย', tiers: [
    { ageRange: '11-64', condition: null, y1: 15, y2: 8, y3: 4, y4: 2, participation: null, comPlus: 15 }
  ]},
  { code: 'HHH', name: 'เฮลท์ ฟิต ชิลด์ (แผน 4)', category: 'เฮลท์ ฟิต สบายสบาย', tiers: [
    { ageRange: '11-64', condition: null, y1: 20, y2: 10, y3: 6, y4: 3, participation: null, comPlus: 15 }
  ]},
  { code: 'อ07', name: 'อ.3', category: 'เฮลท์ ฟิต สบายสบาย', tiers: [
    { ageRange: '11-64', condition: null, y1: 8, y2: 4, y3: 4, y4: 2, participation: null, comPlus: null }
  ]},
  { code: 'อ05', name: 'อ.1', category: 'เฮลท์ ฟิต สบายสบาย', tiers: [
    { ageRange: '11-64', condition: null, y1: 35, y2: 15, y3: 10, y4: 4, participation: null, comPlus: 5 }
  ]},
  { code: 'อ06', name: 'อ.2', category: 'เฮลท์ ฟิต สบายสบาย', tiers: [
    { ageRange: '11-64', condition: null, y1: 35, y2: 15, y3: 10, y4: 4, participation: null, comPlus: 10 }
  ]},
  { code: 'NHB', name: 'เฮลท์ ฟิต เฮชบี โปร', category: 'เฮลท์ ฟิต สบายสบาย', tiers: [
    { ageRange: '11-64', condition: null, y1: 25, y2: 12, y3: 8, y4: 4, participation: null, comPlus: 15 }
  ]},
  { code: 'D16', name: 'มัลติเพย์', category: 'เฮลท์ ฟิต สบายสบาย', tiers: [
    { ageRange: '11-64', condition: null, y1: 25, y2: 12, y3: 8, y4: 4, participation: null, comPlus: 15 }
  ]},
  { code: 'OPH', name: 'ผู้ป่วยนอก', category: 'เฮลท์ ฟิต สบายสบาย', tiers: [
    { ageRange: '11-64', condition: null, y1: 10, y2: 5, y3: 4, y4: 4, participation: null, comPlus: 10 }
  ]},

  // ---- สัญญาเพิ่มเติมอุบัติเหตุ (แนบสัญญาหลักทั่วไป) ----
  { code: 'อ01', name: 'อ.1', category: 'สัญญาเพิ่มเติมอุบัติเหตุ', tiers: [
    { ageRange: '0-64', condition: null, y1: 35, y2: 15, y3: 10, y4: 4, participation: null, comPlus: 5 }
  ]},
  { code: 'ขา1', name: 'ขา.1', category: 'สัญญาเพิ่มเติมอุบัติเหตุ', tiers: [
    { ageRange: '0-64', condition: null, y1: 35, y2: 15, y3: 10, y4: 4, participation: null, comPlus: null }
  ]},
  { code: 'อ02', name: 'อ.2', category: 'สัญญาเพิ่มเติมอุบัติเหตุ', tiers: [
    { ageRange: '5-64', condition: null, y1: 35, y2: 15, y3: 10, y4: 4, participation: null, comPlus: 10 }
  ]},
  { code: 'ขา2', name: 'ขา.2', category: 'สัญญาเพิ่มเติมอุบัติเหตุ', tiers: [
    { ageRange: '5-64', condition: null, y1: 35, y2: 15, y3: 10, y4: 4, participation: null, comPlus: null }
  ]},
  { code: 'A03', name: 'อ.3', category: 'สัญญาเพิ่มเติมอุบัติเหตุ', tiers: [
    { ageRange: '5-64', condition: null, y1: 8, y2: 4, y3: 4, y4: 2, participation: null, comPlus: null }
  ]},

  // ---- สัญญาเพิ่มเติมค่าชดเชยรายวัน ----
  { code: 'สพ.', name: 'ค่ารักษาพยาบาลรายวัน', category: 'สัญญาเพิ่มเติมค่าชดเชยรายวัน', tiers: [
    { ageRange: '0-65', condition: null, y1: 35, y2: 15, y3: 10, y4: 4, participation: null, comPlus: 10 }
  ]},
  { code: 'NHG', name: 'เฮลท์ ฟิต เฮชบี โปร', category: 'สัญญาเพิ่มเติมค่าชดเชยรายวัน', tiers: [
    { ageRange: '1-10', condition: null, y1: 15, y2: 8, y3: 5, y4: 4, participation: null, comPlus: null },
    { ageRange: '11-70', condition: null, y1: 25, y2: 12, y3: 8, y4: 4, participation: null, comPlus: 15 }
  ]},

  // ---- สัญญาเพิ่มเติมโรคร้ายแรง ----
  { code: 'สส2', name: 'สส.2', category: 'สัญญาเพิ่มเติมโรคร้ายแรง', tiers: [
    { ageRange: '20-70', condition: null, y1: 20, y2: 10, y3: 8, y4: 4, participation: null, comPlus: 10 }
  ]},
  { code: 'D11', name: 'มัลติเพย์', category: 'สัญญาเพิ่มเติมโรคร้ายแรง', tiers: [
    { ageRange: '0-65', condition: null, y1: 25, y2: 12, y3: 8, y4: 4, participation: null, comPlus: 15 }
  ]},
  { code: 'C21', name: 'เฮลท์ ฟิต มัลติเพย์ แคนเซอร์', category: 'สัญญาเพิ่มเติมโรคร้ายแรง', tiers: [
    { ageRange: '16-70', condition: null, y1: 25, y2: 12, y3: 8, y4: 4, participation: null, comPlus: 15 }
  ]},
  { code: 'D10', name: 'กร.44', category: 'สัญญาเพิ่มเติมโรคร้ายแรง', tiers: [
    { ageRange: '20-65', condition: null, y1: 35, y2: 15, y3: 10, y4: 4, participation: null, comPlus: 5 }
  ]},
  { code: 'D28', name: 'กร.48', category: 'สัญญาเพิ่มเติมโรคร้ายแรง', tiers: [
    { ageRange: '15-60', condition: null, y1: 25, y2: 12, y3: 8, y4: 4, participation: null, comPlus: 15 }
  ]},

  // ---- สัญญาเพิ่มเติมชั่วระยะเวลา ----
  { code: 'ฉพ4', name: 'ฉพ.', category: 'สัญญาเพิ่มเติมชั่วระยะเวลา', tiers: [
    { ageRange: '20-60', condition: null, y1: 30, y2: 12, y3: 8, y4: 4, participation: null, comPlus: 5 }
  ]},
  { code: 'คบ2', name: 'คบ.', category: 'สัญญาเพิ่มเติมชั่วระยะเวลา', tiers: [
    { ageRange: '0-20', condition: null, y1: 35, y2: 15, y3: 10, y4: 4, participation: null, comPlus: 5 }
  ]},

  // ---- สัญญาเพิ่มเติมประกันสุขภาพ ----
  { code: 'HHA-HHC', name: 'เฮลท์ ฟิต ชิลด์ (แผน 1-3)', category: 'สัญญาเพิ่มเติมประกันสุขภาพ', tiers: [
    { ageRange: '0-10', condition: null, y1: 4, y2: 2, y3: 2, y4: 2, participation: null, comPlus: null },
    { ageRange: '11-70', condition: null, y1: 15, y2: 8, y3: 4, y4: 2, participation: null, comPlus: 15 },
    { ageRange: '71-80', condition: null, y1: 8, y2: 4, y3: 2, y4: 2, participation: null, comPlus: 15 }
  ]},
  { code: 'HHD', name: 'เฮลท์ ฟิต ชิลด์ (แผน 4)', category: 'สัญญาเพิ่มเติมประกันสุขภาพ', tiers: [
    { ageRange: '0-10', condition: null, y1: 10, y2: 5, y3: 3, y4: 3, participation: null, comPlus: 5 },
    { ageRange: '11-70', condition: null, y1: 20, y2: 10, y3: 6, y4: 3, participation: null, comPlus: 15 },
    { ageRange: '71-80', condition: null, y1: 10, y2: 5, y3: 3, y4: 3, participation: null, comPlus: 15 }
  ]},
  { code: 'VP1-VP2', name: 'เฮลท์ ฟิต อัลตร้า', category: 'สัญญาเพิ่มเติมประกันสุขภาพ', tiers: [
    { ageRange: '11-80', condition: null, y1: 10, y2: 5, y3: 5, y4: 5, participation: null, comPlus: 15 }
  ]},
  { code: 'SPH-SPV', name: 'เฮลท์ ฟิต ดีดี', category: 'สัญญาเพิ่มเติมประกันสุขภาพ', tiers: [
    { ageRange: '0-5', condition: 'ไม่มี Deduct', y1: 3, y2: 1.5, y3: 1.5, y4: 1.5, participation: null, comPlus: null },
    { ageRange: '0-5', condition: 'มี Deduct', y1: 8, y2: 4, y3: 4, y4: 2, participation: null, comPlus: null },
    { ageRange: '6-10', condition: null, y1: 8, y2: 4, y3: 4, y4: 2, participation: null, comPlus: null },
    { ageRange: '11-70', condition: null, y1: 15, y2: 8, y3: 5, y4: 4, participation: null, comPlus: 15, comPlusNote: 'อายุ ≥ 16' },
    { ageRange: '71-80', condition: null, y1: 8, y2: 4, y3: 4, y4: 2, participation: null, comPlus: 15, comPlusNote: 'อายุ ≥ 16' }
  ]},
  { code: 'OP4', name: 'ผู้ป่วยนอก', category: 'สัญญาเพิ่มเติมประกันสุขภาพ', tiers: [
    { ageRange: '6-10', condition: null, y1: 5, y2: 2, y3: 2, y4: 2, participation: null, comPlus: null },
    { ageRange: '11-70', condition: null, y1: 10, y2: 5, y3: 4, y4: 2, participation: null, comPlus: 10 },
    { ageRange: '71-80', condition: null, y1: 5, y2: 2, y3: 2, y4: 2, participation: null, comPlus: null }
  ]},

  // ---- LifeVerse (เบี้ยหลัก) ----
  { code: 'UWD', name: 'ไลฟ์เวิร์ส เวลท์ ฟิต 99/99', category: 'LifeVerse', tiers: [
    { ageRange: '0-80', condition: 'เบี้ยหลัก', y1: 30, y2: 12, y3: 8, y4: 4, participation: 100, comPlus: 10, note: 'ปี ≥ 10 ลดเหลือ 2%' },
    { ageRange: '0-80', condition: 'เบี้ย Top Up', y1: 0, y2: 0, y3: 0, y4: 0, participation: 10, comPlus: null }
  ]},
  { code: 'AW08', name: 'ไลฟ์เวิร์ส รีไทร์ ฟิต 99/1', category: 'LifeVerse', tiers: [
    { ageRange: '55-70', condition: null, y1: 0, y2: 0, y3: 0, y4: 0, participation: 10, comPlus: null }
  ]},

  // ---- LV สัญญาเพิ่มเติมอุบัติเหตุ (แนบ LifeVerse เท่านั้น อัตราต่างจากสัญญาเพิ่มเติมทั่วไป) ----
  { code: 'LV-อ01', name: 'อ.1 (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมอุบัติเหตุ', tiers: [
    { ageRange: '0-64', condition: null, y1: 15, y2: 15, y3: 15, y4: 15, participation: null, comPlus: 5, laBonus: 12 }
  ]},
  { code: 'LV-ขา1', name: 'ขา.1 (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมอุบัติเหตุ', tiers: [
    { ageRange: '0-64', condition: null, y1: 15, y2: 15, y3: 15, y4: 15, participation: null, comPlus: null, laBonus: null }
  ]},
  { code: 'LV-อ02', name: 'อ.2 (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมอุบัติเหตุ', tiers: [
    { ageRange: '5-64', condition: null, y1: 15, y2: 15, y3: 15, y4: 15, participation: null, comPlus: 5, laBonus: 12 }
  ]},
  { code: 'LV-ขา2', name: 'ขา.2 (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมอุบัติเหตุ', tiers: [
    { ageRange: '5-64', condition: null, y1: 15, y2: 15, y3: 15, y4: 15, participation: null, comPlus: null, laBonus: null }
  ]},
  { code: 'LV-A03', name: 'อ.3 (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมอุบัติเหตุ', tiers: [
    { ageRange: '5-64', condition: null, y1: 4, y2: 4, y3: 4, y4: 4, participation: null, comPlus: null, laBonus: null }
  ]},

  // ---- LV สัญญาเพิ่มเติมค่าชดเชยรายวัน ----
  { code: 'LV-สพ.', name: 'ค่ารักษาพยาบาลรายวัน (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมค่าชดเชยรายวัน', tiers: [
    { ageRange: '0-65', condition: null, y1: 15, y2: 15, y3: 15, y4: 15, participation: null, comPlus: 10, laBonus: 12 }
  ]},
  { code: 'LV-NHG', name: 'เฮลท์ ฟิต เฮชบี โปร (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมค่าชดเชยรายวัน', tiers: [
    { ageRange: '1-10', condition: null, y1: 8, y2: 8, y3: 8, y4: 8, participation: null, comPlus: null, laBonus: null },
    { ageRange: '11-70', condition: null, y1: 15, y2: 15, y3: 15, y4: 15, participation: null, comPlus: 10, laBonus: 12 }
  ]},

  // ---- LV สัญญาเพิ่มเติมโรคร้ายแรง ----
  { code: 'LV-สส2', name: 'สส.2 (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมโรคร้ายแรง', tiers: [
    { ageRange: '20-70', condition: null, y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: 5, laBonus: 12 }
  ]},
  { code: 'LV-D11', name: 'มัลติเพย์ (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมโรคร้ายแรง', tiers: [
    { ageRange: '0-65', condition: null, y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: 15, laBonus: 12 }
  ]},
  { code: 'LV-C21', name: 'เฮลท์ ฟิต มัลติเพย์ แคนเซอร์ (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมโรคร้ายแรง', tiers: [
    { ageRange: '16-70', condition: null, y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: 10, laBonus: 12 }
  ]},
  { code: 'LV-D28', name: 'กร.48 (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมโรคร้ายแรง', tiers: [
    { ageRange: '15-60', condition: null, y1: 10, y2: 10, y3: 10, y4: 10, participation: null, comPlus: 10, laBonus: 12 }
  ]},

  // ---- LV สัญญาเพิ่มเติมประกันสุขภาพ ----
  { code: 'LV-HHA-HHD', name: 'เฮลท์ ฟิต ชิลด์ (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมประกันสุขภาพ', tiers: [
    { ageRange: '0-10', condition: null, y1: 4, y2: 4, y3: 4, y4: 4, participation: null, comPlus: null, laBonus: null },
    { ageRange: '11-70', condition: null, y1: 8, y2: 8, y3: 8, y4: 8, participation: null, comPlus: 8, laBonus: 12 },
    { ageRange: '71-80', condition: null, y1: 4, y2: 4, y3: 4, y4: 4, participation: null, comPlus: 4, laBonus: 12 }
  ]},
  { code: 'LV-VP1-VP2', name: 'เฮลท์ ฟิต อัลตร้า (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมประกันสุขภาพ', tiers: [
    { ageRange: '11-80', condition: null, y1: 8, y2: 8, y3: 8, y4: 8, participation: null, comPlus: 8, laBonus: 12 }
  ]},
  { code: 'LV-SPH-SPV', name: 'เฮลท์ ฟิต ดีดี (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมประกันสุขภาพ', tiers: [
    { ageRange: '0-10', condition: null, y1: 4, y2: 4, y3: 4, y4: 4, participation: null, comPlus: null, laBonus: null },
    { ageRange: '11-15', condition: null, y1: 8, y2: 8, y3: 8, y4: 8, participation: null, comPlus: null, laBonus: null },
    { ageRange: '16-70', condition: null, y1: 8, y2: 8, y3: 8, y4: 8, participation: null, comPlus: 8, laBonus: 12 },
    { ageRange: '71-80', condition: null, y1: 4, y2: 4, y3: 4, y4: 4, participation: null, comPlus: 4, laBonus: 12 }
  ]},
  { code: 'LV-OP4', name: 'ผู้ป่วยนอก (แนบ LifeVerse)', category: 'LV สัญญาเพิ่มเติมประกันสุขภาพ', tiers: [
    { ageRange: '6-10', condition: null, y1: 2, y2: 2, y3: 2, y4: 2, participation: null, comPlus: null, laBonus: null },
    { ageRange: '11-70', condition: null, y1: 4, y2: 5, y3: 5, y4: 5, participation: null, comPlus: 4, laBonus: 12 },
    { ageRange: '71-80', condition: null, y1: 2, y2: 2, y3: 2, y4: 2, participation: null, comPlus: 2, laBonus: 12 }
  ]}
];
