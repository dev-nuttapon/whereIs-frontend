import { Tag } from 'antd';

export function masterStatus(status: string, kind: 'active' | 'asset' | 'borrow' | 'stock' = 'active') {
  const value = status.trim().toLowerCase();
  if (kind === 'active') return value === 'active' || value === 'ใช้งานอยู่' ? { label: 'ใช้งานอยู่', color: 'green' as const } : { label: 'ไม่ใช้งาน', color: undefined };
  if (kind === 'asset') {
    if (value === 'available' || value === 'พร้อมใช้งาน') return { label: 'พร้อมใช้งาน', color: 'green' as const };
    if (value === 'borrowed' || value === 'ถูกยืม') return { label: 'ถูกยืม', color: 'blue' as const };
    if (value === 'missing' || value === 'สูญหาย') return { label: 'สูญหาย', color: 'red' as const };
    if (value === 'maintenance' || value === 'ซ่อมบำรุง') return { label: 'ซ่อมบำรุง', color: 'orange' as const };
    if (value === 'disposed' || value === 'จำหน่ายแล้ว') return { label: 'จำหน่ายแล้ว', color: undefined };
  }
  if (kind === 'borrow') {
    if (value.includes('pending')) return { label: 'รออนุมัติ', color: 'gold' as const };
    if (value.includes('approved')) return { label: 'อนุมัติแล้ว', color: 'blue' as const };
    if (value.includes('active')) return { label: 'กำลังยืม', color: 'green' as const };
    if (value.includes('completed')) return { label: 'เสร็จสิ้น', color: 'green' as const };
    if (value.includes('cancel')) return { label: 'ยกเลิก', color: 'red' as const };
    if (value.includes('reject')) return { label: 'ปฏิเสธ', color: undefined };
  }
  if (kind === 'stock') return value === 'หมดสต็อก' ? { label: 'หมดสต็อก', color: 'red' as const } : { label: 'มีสต็อก', color: 'green' as const };
  return { label: status || '-', color: undefined };
}

export function MasterStatusBadge({ status, kind }: { status: string; kind?: 'active' | 'asset' | 'borrow' | 'stock' }) {
  const item = masterStatus(status, kind);
  return <Tag color={item.color}>{item.label}</Tag>;
}
