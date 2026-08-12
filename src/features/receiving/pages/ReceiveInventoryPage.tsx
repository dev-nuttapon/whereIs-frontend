import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PageShell } from '@/components/common/PageShell';
import { FormField } from '@/components/forms/FormField';
import { PlusIcon, StockIcon, ContainerIcon } from '@/components/ui/icons';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { CreateProductDialog } from '@/features/products/components/CreateProductDialog';
import { useCreateReceivingReceipt, useReceivingReceipts } from '@/features/receiving/hooks/useReceivingReceipts';
import { buildReceivingReceiptInput, getReceivingLineError, type ReceivingFormLine } from '@/features/receiving/utils/receivingForm';
import { parseReceivingDraft } from '@/features/receiving/utils/receivingDraft';

type TrackingType = ReceivingFormLine['trackingType'];
type ReceivingLine = ReceivingFormLine;

const INITIAL_LINE: Omit<ReceivingLine, 'id'> = {
  productId: '',
  productSearch: '',
  name: '',
  quantity: '1',
  unit: 'ชิ้น',
  trackingType: 'stock',
  storage: '',
  expiryDate: '',
  alertLeadDays: '',
  lowStockAlert: '',
};

export function ReceiveInventoryPage() {
  const { wsId = '' } = useParams();
  const containersQuery = useContainers(wsId);
  const productsQuery = useProducts(wsId);
  const categoriesQuery = useCategories(wsId);
  const createReceipt = useCreateReceivingReceipt(wsId);
  const receiptsQuery = useReceivingReceipts(wsId);
  const containers = containersQuery.data ?? [];
  const products = (productsQuery.data ?? []).filter((product) => product.isActive);
  const [lines, setLines] = useState<ReceivingLine[]>([{ id: 1, ...INITIAL_LINE }]);
  const [nextId, setNextId] = useState(2);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [submittedReceiptId, setSubmittedReceiptId] = useState<string | null>(null);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [createProductForLine, setCreateProductForLine] = useState<number | null>(null);

  useEffect(() => {
    const draft = window.localStorage.getItem(`whereis:receive-draft:${wsId}`);
    if (!draft) return;

    const parsedLines = parseReceivingDraft(draft);
    if (parsedLines) {
      setLines(parsedLines);
      setNextId(Math.max(...parsedLines.map((line) => line.id)) + 1);
      setSavedAt(JSON.parse(draft).savedAt ?? null);
    } else {
      window.localStorage.removeItem(`whereis:receive-draft:${wsId}`);
    }
  }, [wsId]);

  const updateLine = (id: number, patch: Partial<ReceivingLine>) => {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const selectProduct = (lineId: number, productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      updateLine(lineId, { productId: '', name: '' });
      return;
    }

    updateLine(lineId, {
      productId,
      productSearch: product.name,
      name: product.name,
      unit: product.unitCode || 'ชิ้น',
      trackingType: product.trackingType.toLowerCase() === 'asset' ? 'asset' : 'stock',
      alertLeadDays: product.expiryLeadDaysDefault?.toString() ?? '',
      lowStockAlert: product.minStockAlert?.toString() ?? '',
    });
  };

  const removeLine = (id: number) => {
    setLines((current) => current.length === 1 ? current : current.filter((line) => line.id !== id));
  };

  const summary = useMemo(() => ({
    total: lines.length,
    stock: lines.filter((line) => line.trackingType === 'stock').length,
    assets: lines.filter((line) => line.trackingType === 'asset').length,
    expiry: lines.filter((line) => line.expiryDate).length,
  }), [lines]);
  const storageNameById = useMemo(() => new Map(containers.map((container) => [container.id, container.name])), [containers]);

  const lineErrors = useMemo(() => lines.map(getReceivingLineError), [lines]);
  const incompleteLines = lines.filter((_, index) => lineErrors[index]);
  const [showValidation, setShowValidation] = useState(false);
  const goNext = () => {
    if (currentStep === 1 && lines.some((line) => !line.productId || !line.quantity || Number(line.quantity) <= 0)) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setCurrentStep((step) => Math.min(3, step + 1) as 1 | 2 | 3);
  };
  const submitReceipt = () => {
    setShowValidation(true);
    if (incompleteLines.length > 0 || createReceipt.isPending) return;

    createReceipt.mutate(buildReceivingReceiptInput(lines, new Date()), {
      onSuccess: (receipt) => {
        setSubmittedReceiptId(receipt.id);
        window.localStorage.removeItem(`whereis:receive-draft:${wsId}`);
        setSavedAt(null);
        setLines([{ id: 1, ...INITIAL_LINE }]);
        setNextId(2);
        setCurrentStep(1);
        setShowValidation(false);
      },
    });
  };
  const saveDraft = () => {
    const nextSavedAt = new Date().toISOString();
    window.localStorage.setItem(`whereis:receive-draft:${wsId}`, JSON.stringify({ lines, savedAt: nextSavedAt }));
    setSavedAt(nextSavedAt);
  };

  return (
    <PageShell
      title="เพิ่มของเข้าคลัง"
      description="เพิ่มของที่ซื้อมาในครั้งเดียว แล้วกำหนดประเภท จำนวน จุดจัดเก็บ และการแจ้งเตือน"
      actions={<Button type="button" onClick={saveDraft}>บันทึกแบบร่าง</Button>}
    >
      {submittedReceiptId ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        เพิ่มของเข้าคลังสำเร็จแล้ว สามารถเพิ่มรายการรอบใหม่ได้ทันที
      </div> : null}
      {createReceipt.isError ? <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        บันทึกไม่สำเร็จ กรุณาตรวจสอบสินค้า จุดจัดเก็บ และสิทธิ์การใช้งาน แล้วลองใหม่อีกครั้ง
      </div> : null}
      <div className="grid gap-2 rounded-2xl border border-border/70 bg-card/70 p-3 sm:grid-cols-3 sm:p-4">
        {[
          ['1', 'เพิ่มรายการ', 'ชื่อ จำนวน และประเภท'],
          ['2', 'จัดเก็บและแจ้งเตือน', 'จุดจัดเก็บ วันหมดอายุ และจุดเตือน'],
          ['3', 'ตรวจสอบ', 'สรุปก่อนส่งเข้าระบบ'],
        ].map(([step, title, description]) => (
          <button key={step} type="button" onClick={() => setCurrentStep(Number(step) as 1 | 2 | 3)} className={`flex items-start gap-3 rounded-xl p-2.5 text-left transition-colors ${currentStep === Number(step) ? 'bg-teal-50 text-teal-900' : 'text-muted-foreground hover:bg-muted/60'}`}>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${currentStep === Number(step) ? 'bg-teal-600 text-white' : 'bg-muted text-foreground'}`}>{step}</span>
            <span className="min-w-0"><span className="block text-sm font-semibold">{title}</span><span className="block text-xs leading-5">{description}</span></span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <Card>
          <CardContent className="component-stack p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">รายการของที่ซื้อ</CardTitle>
                <CardDescription>เพิ่มหลายรายการจากการซื้อครั้งเดียวได้ที่นี่</CardDescription>
              </div>
              {currentStep === 1 ? (
                <Button type="button" variant="outline" size="sm" onClick={() => { setLines((current) => [...current, { id: nextId, ...INITIAL_LINE }]); setNextId((value) => value + 1); }}>
                  <PlusIcon className="h-4 w-4" />
                  เพิ่มรายการ
                </Button>
              ) : null}
            </div>

            <div className={`component-stack ${currentStep === 3 ? 'hidden' : ''}`}>
              {lines.map((line, index) => (
                <div key={line.id} className="rounded-2xl border border-border/70 bg-background/55 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">รายการที่ {index + 1}</p>
                    <Button type="button" variant="ghost" size="sm" disabled={lines.length === 1} onClick={() => removeLine(line.id)}>
                      ลบรายการ
                    </Button>
                  </div>
                  {currentStep === 1 ? <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="ค้นหาสินค้า" htmlFor={`receive-product-search-${line.id}`} description={products.length ? 'ค้นหาจากชื่อ รหัส หรือ SKU แล้วเลือกสินค้า' : 'ยังไม่มีสินค้า ให้สร้างสินค้าใหม่ก่อน'}>
                      <Input id={`receive-product-search-${line.id}`} value={line.productSearch ?? ''} onChange={(event) => updateLine(line.id, { productSearch: event.target.value })} placeholder="เช่น โยเกิร์ต" />
                    </FormField>
                    <FormField label="สินค้า" htmlFor={`receive-product-${line.id}`}>
                      <Select id={`receive-product-${line.id}`} value={line.productId} onChange={(event) => selectProduct(line.id, event.target.value)}>
                        <option value="">เลือกสินค้าที่มีอยู่</option>
                        {products.filter((product) => {
                          const query = (line.productSearch ?? '').trim().toLowerCase();
                          return !query || [product.name, product.code, product.sku].filter(Boolean).some((value) => value!.toLowerCase().includes(query));
                        }).map((product) => <option key={product.id} value={product.id}>{product.name}{product.code ? ` (${product.code})` : ''}</option>)}
                      </Select>
                      {products.length === 0 ? <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => { setCreateProductForLine(line.id); setCreateProductOpen(true); }}>สร้างสินค้าใหม่</Button> : null}
                    </FormField>
                    <FormField label="ชื่อรายการสำรอง" htmlFor={`receive-name-${line.id}`} description="ใช้เมื่อสินค้านี้ยังไม่ถูกสร้างในระบบ">
                      <Input id={`receive-name-${line.id}`} value={line.name} onChange={(event) => updateLine(line.id, { name: event.target.value, productId: '' })} placeholder="เช่น โยเกิร์ต" />
                    </FormField>
                    <FormField label="ประเภทการติดตาม" htmlFor={`receive-type-${line.id}`} description={line.productId ? 'ประเภทนี้กำหนดจากสินค้าในระบบ' : 'เลือกสินค้าเพื่อให้ระบบกำหนดประเภทอัตโนมัติ'}>
                      <Select id={`receive-type-${line.id}`} value={line.trackingType} disabled={Boolean(line.productId)} onChange={(event) => updateLine(line.id, { trackingType: event.target.value as TrackingType })}>
                        <option value="stock">สต็อก / นับเป็นจำนวน</option>
                        <option value="asset">ทรัพย์สิน / ติดตามรายชิ้น</option>
                      </Select>
                    </FormField>
                    <FormField label="จำนวน" htmlFor={`receive-quantity-${line.id}`}>
                      <Input id={`receive-quantity-${line.id}`} type="number" min="1" value={line.quantity} onChange={(event) => updateLine(line.id, { quantity: event.target.value })} />
                    </FormField>
                    <FormField label="หน่วย" htmlFor={`receive-unit-${line.id}`}>
                      <Input id={`receive-unit-${line.id}`} value={line.unit} onChange={(event) => updateLine(line.id, { unit: event.target.value })} placeholder="เช่น กล่อง, ชิ้น, ขวด" />
                    </FormField>
                  </div> : null}
                  {currentStep === 2 ? <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="จุดจัดเก็บ" htmlFor={`receive-storage-${line.id}`} description={containers.length ? 'เลือกจากจุดจัดเก็บที่สร้างไว้แล้ว' : 'ยังไม่มีจุดจัดเก็บ ให้สร้างก่อนแล้วกลับมาเลือกที่นี่'}>
                      <Select id={`receive-storage-${line.id}`} value={line.storage} onChange={(event) => updateLine(line.id, { storage: event.target.value })} disabled={containers.length === 0}>
                        <option value="">{containers.length ? 'เลือกจุดจัดเก็บ' : 'ยังไม่มีจุดจัดเก็บ'}</option>
                        {containers.map((container) => <option key={container.id} value={container.id}>{container.name}{container.code ? ` (${container.code})` : ''}</option>)}
                      </Select>
                    </FormField>
                    <FormField label="วันหมดอายุ" htmlFor={`receive-expiry-${line.id}`} description="เว้นว่างได้สำหรับของที่ไม่มีวันหมดอายุ">
                      <Input id={`receive-expiry-${line.id}`} type="date" value={line.expiryDate} onChange={(event) => updateLine(line.id, { expiryDate: event.target.value })} />
                    </FormField>
                    <FormField label="แจ้งเตือนก่อนหมดอายุ (วัน)" htmlFor={`receive-expiry-alert-${line.id}`}>
                      <Input id={`receive-expiry-alert-${line.id}`} type="number" min="0" value={line.alertLeadDays} onChange={(event) => updateLine(line.id, { alertLeadDays: event.target.value })} placeholder="เช่น 7" />
                    </FormField>
                    {line.trackingType === 'stock' ? (
                      <FormField label="แจ้งเตือนเมื่อเหลือต่ำกว่า" htmlFor={`receive-low-stock-${line.id}`}>
                        <Input id={`receive-low-stock-${line.id}`} type="number" min="0" value={line.lowStockAlert} onChange={(event) => updateLine(line.id, { lowStockAlert: event.target.value })} placeholder="เช่น 3" />
                      </FormField>
                    ) : null}
                  </div> : null}
                  {currentStep === 2 && containers.length === 0 ? (
                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                      <span>ยังไม่มีจุดจัดเก็บสำหรับรายการนี้</span>
                      <Button asChild type="button" variant="outline" size="sm"><Link to={`/w/${wsId}/containers`}>สร้างจุดจัดเก็บ</Link></Button>
                    </div>
                  ) : null}
                  {showValidation && lineErrors[index] ? <p className="mt-3 text-sm text-destructive">{lineErrors[index]}</p> : null}
                </div>
              ))}
            </div>
            {currentStep === 3 ? (
              <div className="space-y-3 rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">ตรวจสอบรายการก่อนบันทึก</p>
                  <p className="mt-1 text-xs text-muted-foreground">ตรวจสอบประเภท จำนวน จุดจัดเก็บ และการแจ้งเตือนให้ถูกต้อง</p>
                </div>
                {lines.map((line, index) => (
                  <div key={line.id} className="flex flex-col gap-2 rounded-xl border border-border/70 bg-background/80 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0"><p className="truncate font-medium">{index + 1}. {line.name || 'ยังไม่ได้ระบุชื่อรายการ'}</p><p className="text-xs text-muted-foreground">{line.quantity} {line.unit} · {line.trackingType === 'stock' ? 'สต็อก' : 'ทรัพย์สิน'}</p></div>
                    <div className="text-xs text-muted-foreground sm:text-right"><p>{storageNameById.get(line.storage) ?? 'ยังไม่ได้ระบุจุดจัดเก็บ'}</p><p>{line.expiryDate ? `หมดอายุ ${line.expiryDate}` : 'ไม่มีวันหมดอายุ'}</p></div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep((step) => Math.max(1, step - 1) as 1 | 2 | 3)} disabled={currentStep === 1}>ย้อนกลับ</Button>
              {currentStep < 3 ? <Button type="button" onClick={goNext}>ถัดไป</Button> : <Button type="button" onClick={submitReceipt} loading={createReceipt.isPending} disabled={incompleteLines.length > 0}>บันทึกเข้าคลัง</Button>}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardContent className="component-stack p-5 sm:p-6">
            <div className="space-y-1">
              <CardTitle className="text-base">สรุปการเพิ่มของ</CardTitle>
              <CardDescription>ตรวจสอบภาพรวมก่อนบันทึกจริง</CardDescription>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-muted-foreground"><StockIcon className="h-4 w-4" />รายการทั้งหมด</span><strong>{summary.total}</strong></div>
              <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">สต็อก</span><strong>{summary.stock}</strong></div>
              <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">ทรัพย์สิน</span><strong>{summary.assets}</strong></div>
              <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-muted-foreground"><ContainerIcon className="h-4 w-4" />มีวันหมดอายุ</span><strong>{summary.expiry}</strong></div>
            </div>
            <div className="rounded-xl bg-teal-50 p-3 text-xs leading-5 text-teal-800">
              {savedAt ? `บันทึกแบบร่างล่าสุด ${new Intl.DateTimeFormat('th-TH', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(savedAt))}` : 'กรอกชื่อรายการและจุดจัดเก็บให้ครบก่อนบันทึกแบบร่าง'}
            </div>
            <Button type="button" onClick={currentStep === 3 ? submitReceipt : saveDraft} loading={currentStep === 3 && createReceipt.isPending} disabled={currentStep === 3 ? incompleteLines.length > 0 : false}>
              {currentStep === 3 ? (incompleteLines.length > 0 ? `แก้ข้อมูลอีก ${incompleteLines.length} รายการ` : 'บันทึกเข้าคลัง') : 'บันทึกแบบร่าง'}
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="component-stack p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">ประวัติการเพิ่มของ</CardTitle>
              <CardDescription>รายการรับของล่าสุดในพื้นที่ทำงานนี้</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => receiptsQuery.refetch()} disabled={receiptsQuery.isFetching}>รีเฟรช</Button>
          </div>
          {receiptsQuery.isLoading ? <p className="text-sm text-muted-foreground">กำลังโหลดประวัติ...</p> : null}
          {receiptsQuery.isError ? <p className="text-sm text-destructive">โหลดประวัติไม่สำเร็จ</p> : null}
          {receiptsQuery.isSuccess && receiptsQuery.data.items.length === 0 ? <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการเพิ่มของ</p> : null}
          {receiptsQuery.isSuccess && receiptsQuery.data.items.length > 0 ? <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {receiptsQuery.data.items.map((receipt) => <div key={receipt.id} className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="truncate text-sm font-medium">{receipt.reference || 'การเพิ่มของเข้าคลัง'}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(receipt.receivedAt))}</p>
              <p className="mt-1 text-xs text-muted-foreground">{receipt.lineCount} รายการ</p>
            </div>)}
          </div> : null}
        </CardContent>
      </Card>
      <CreateProductDialog
        wsId={wsId}
        open={createProductOpen}
        onOpenChange={setCreateProductOpen}
        categories={categoriesQuery.data ?? []}
        onCreated={(product) => {
          if (createProductForLine === null) return;
          updateLine(createProductForLine, {
            productId: product.id,
            productSearch: product.name,
            name: product.name,
            unit: product.unitCode || 'ชิ้น',
            trackingType: product.trackingType.toLowerCase() === 'asset' ? 'asset' : 'stock',
            alertLeadDays: product.expiryLeadDaysDefault?.toString() ?? '',
            lowStockAlert: product.minStockAlert?.toString() ?? '',
          });
          setCreateProductForLine(null);
        }}
      />
    </PageShell>
  );
}
