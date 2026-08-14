const STATUS_LABELS: Record<string, string> = {
  available: 'พร้อมใช้งาน',
  borrowed: 'ถูกยืม',
  stored: 'จัดเก็บอยู่',
  out_of_stock: 'หมดสต็อก',
  active: 'ใช้งานอยู่',
  inactive: 'ไม่ใช้งาน',
  pending: 'รอดำเนินการ',
  approved: 'อนุมัติแล้ว',
  completed: 'เสร็จสิ้น',
  missing: 'สูญหาย',
  maintenance: 'อยู่ระหว่างซ่อม',
  disposed: 'จำหน่ายแล้ว',
};

export function inventoryKindLabel(kind: string) {
  return kind === 'asset' ? 'ทรัพย์สิน' : kind === 'stock' ? 'สต็อก' : 'รายการ';
}

export function statusLabel(status: string) {
  return STATUS_LABELS[status.toLowerCase()] ?? status;
}

export function formatDetailDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('th-TH') : '-';
}
