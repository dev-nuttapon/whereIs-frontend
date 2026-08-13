import type { CreateReceivingReceiptInput } from '@/api/receiving.api';

export type ReceivingTrackingType = 'stock' | 'asset' | '';

export interface ReceivingFormLine {
  id: number;
  productId: string;
  productSearch: string;
  name: string;
  quantity: string;
  unit: string;
  trackingType: ReceivingTrackingType;
  storage: string;
  expiryDate: string;
  alertLeadDays: string;
  lowStockAlert: string;
}

function optionalNumber(value: string): number | null {
  return value.trim() ? Number(value) : null;
}

export function getReceivingLineError(line: ReceivingFormLine): string {
  if (!line.productId) return 'ต้องเลือกสินค้าที่มีอยู่ในระบบก่อนบันทึกเข้าคลัง';
  if (!line.trackingType) return 'สินค้านี้ยังไม่ได้กำหนดประเภทการติดตามใน Master';
  if (!line.unit.trim()) return 'สินค้านี้ยังไม่ได้กำหนดหน่วยใน Master';
  if (!line.quantity || Number(line.quantity) <= 0) return 'จำนวนต้องมากกว่า 0';
  if (!line.storage.trim()) return 'เลือกจุดจัดเก็บ';
  if (line.trackingType === 'asset' && !Number.isInteger(Number(line.quantity))) return 'ทรัพย์สินต้องมีจำนวนเป็นจำนวนเต็ม';
  if (line.expiryDate && line.alertLeadDays && Number(line.alertLeadDays) < 0) return 'จำนวนวันแจ้งเตือนต้องไม่ติดลบ';
  if (line.trackingType === 'stock' && line.lowStockAlert && Number(line.lowStockAlert) < 0) return 'จุดเตือนสต็อกต้องไม่ติดลบ';
  return '';
}

export function buildReceivingReceiptInput(lines: ReceivingFormLine[], receivedAt: Date): CreateReceivingReceiptInput {
  return {
    reference: `เพิ่มของเข้าคลัง ${new Intl.DateTimeFormat('th-TH').format(receivedAt)}`,
    receivedAt: receivedAt.toISOString(),
    notes: null,
    lines: lines.map((line) => ({
      productId: line.productId,
      quantity: Number(line.quantity),
      unitCode: line.unit || null,
      locationId: null,
      containerId: line.storage || null,
      lotCode: null,
      expiryDate: line.expiryDate ? new Date(`${line.expiryDate}T00:00:00.000Z`).toISOString() : null,
      alertLeadDays: optionalNumber(line.alertLeadDays),
      lowStockThreshold: line.trackingType === 'stock' ? optionalNumber(line.lowStockAlert) : null,
      serialNumber: null,
      barcode: null,
      notes: null,
    })),
  };
}
