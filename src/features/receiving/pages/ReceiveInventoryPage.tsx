import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PageShell } from '@/components/common/PageShell';
import { FormField } from '@/components/forms/FormField';
import { FormGrid, FormSection } from '@/components/forms/FormLayout';
import { PlusIcon, StockIcon, ContainerIcon } from '@/components/ui/icons';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { CreateProductDialog } from '@/features/products/components/CreateProductDialog';
import { useCreateReceivingReceipt, useReceivingReceipts } from '@/features/receiving/hooks/useReceivingReceipts';
import { buildReceivingReceiptInput, getReceivingLineError, type ReceivingFormLine } from '@/features/receiving/utils/receivingForm';
import { parseReceivingDraft } from '@/features/receiving/utils/receivingDraft';
import { uploadReceivingEvidence } from '@/api/receiving.api';

type TrackingType = ReceivingFormLine['trackingType'];
type ReceivingLine = ReceivingFormLine;

const INITIAL_LINE: Omit<ReceivingLine, 'id'> = {
  productId: '',
  productSearch: '',
  name: '',
  quantity: '1',
  unit: '',
  trackingType: '',
  storage: '',
  expiryDate: '',
  alertLeadDays: '',
  lowStockAlert: '',
};

export function ReceiveInventoryPage() {
  const { wsId = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');
  const returnPath = from === 'assets' ? `/w/${wsId}/assets` : from === 'stock' ? `/w/${wsId}/stock` : null;
  const containersQuery = useContainers(wsId);
  const productsQuery = useProducts(wsId);
  const categoriesQuery = useCategories(wsId);
  const createReceipt = useCreateReceivingReceipt(wsId);
  const receiptsQuery = useReceivingReceipts(wsId);
  const containers = containersQuery.data ?? [];
  const products = useMemo(() => (productsQuery.data ?? []).filter((product) => product.isActive), [productsQuery.data]);
  const selectableProducts = useMemo(() => {
    const trackingType = from === 'assets' ? 'asset' : from === 'stock' ? 'stock' : null;
    return trackingType ? products.filter((product) => product.trackingType.toLowerCase() === trackingType) : products;
  }, [from, products]);
  const [lines, setLines] = useState<ReceivingLine[]>([{ id: 1, ...INITIAL_LINE }]);
  const [nextId, setNextId] = useState(2);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submittedReceiptId, setSubmittedReceiptId] = useState<string | null>(null);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [createProductForLine, setCreateProductForLine] = useState<number | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  useEffect(() => {
    const draft = returnPath ? null : window.localStorage.getItem(`whereis:receive-draft:${wsId}`);
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

  useEffect(() => {
    if (!productsQuery.data) return;
    setLines((current) => current.map((line) => {
      if (!line.productId) return { ...line, name: '', unit: '', trackingType: '' };
      const product = products.find((item) => item.id === line.productId);
      if (!product) return { ...line, productId: '', name: '', unit: '', trackingType: '' };
      const trackingType = product.trackingType.toLowerCase();
      return {
        ...line,
        name: product.name,
        productSearch: product.name,
        unit: product.unitCode || '',
        trackingType: trackingType === 'asset' || trackingType === 'stock' ? trackingType : '',
      };
    }));
  }, [productsQuery.data, products]);

  const updateLine = (id: number, patch: Partial<ReceivingLine>) => {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const selectProduct = (lineId: number, productId: string) => {
    const product = selectableProducts.find((item) => item.id === productId) ?? products.find((item) => item.id === productId);
    if (!product) {
      updateLine(lineId, { productId: '', name: '' });
      return;
    }

    updateLine(lineId, {
      productId,
      productSearch: product.name,
      name: product.name,
      unit: product.unitCode || '',
      trackingType: product.trackingType.toLowerCase() === 'asset' ? 'asset' : product.trackingType.toLowerCase() === 'stock' ? 'stock' : '',
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
  const submitReceipt = () => {
    setShowValidation(true);
    if (incompleteLines.length > 0 || createReceipt.isPending) return;

      createReceipt.mutate(buildReceivingReceiptInput(lines, new Date()), {
      onSuccess: (receipt) => {
        if (evidenceFiles.length > 0) {
          void uploadReceivingEvidence(wsId, receipt.id, evidenceFiles);
        }
        if (returnPath) {
          navigate(returnPath);
          return;
        }
        setSubmittedReceiptId(receipt.id);
        window.localStorage.removeItem(`whereis:receive-draft:${wsId}`);
        setSavedAt(null);
        setLines([{ id: 1, ...INITIAL_LINE }]);
        setNextId(2);
        setShowValidation(false);
        setEvidenceFiles([]);
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
      description="เพิ่มของที่ซื้อมาในครั้งเดียว แล้วกำหนดประเภท จำนวน ภาชนะจัดเก็บ และการแจ้งเตือน"
      actions={<Button type="button" onClick={saveDraft}>บันทึกแบบร่าง</Button>}
    >
      {submittedReceiptId ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        เพิ่มของเข้าคลังสำเร็จแล้ว สามารถเพิ่มรายการรอบใหม่ได้ทันที
      </div> : null}
      {createReceipt.isError ? <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        บันทึกไม่สำเร็จ กรุณาตรวจสอบสินค้า ภาชนะจัดเก็บ และสิทธิ์การใช้งาน แล้วลองใหม่อีกครั้ง
      </div> : null}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <Card>
          <CardHeader className="border-b border-border/70 px-5 py-5 sm:px-6">
            <CardTitle className="text-lg">รายการของที่ซื้อ</CardTitle>
            <CardDescription>เพิ่มหลายรายการจากการซื้อครั้งเดียวได้ที่นี่</CardDescription>
          </CardHeader>
          <CardContent className="component-stack p-5 sm:p-6">
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-destructive">*</span> ช่องที่มีเครื่องหมายนี้จำเป็นต้องกรอก</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <Button type="button" variant="outline" size="sm" onClick={() => { setLines((current) => [...current, { id: nextId, ...INITIAL_LINE }]); setNextId((value) => value + 1); }}>
                  <PlusIcon className="h-4 w-4" />
                  เพิ่มรายการ
                </Button>
            </div>

            <div className="component-stack">
              {lines.map((line, index) => (
                <div key={line.id} className="rounded-2xl border border-border/70 bg-background/55 p-4">
                  {(() => {
                    const selectedProduct = products.find((product) => product.id === line.productId);
                    const trackingType = line.trackingType || selectedProduct?.trackingType?.toLowerCase() || '';
                    const unit = line.unit || selectedProduct?.unitCode || '-';
                    return (<>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">รายการที่ {index + 1}</p>
                    <Button type="button" variant="ghost" size="sm" disabled={lines.length === 1} onClick={() => removeLine(line.id)}>
                      ลบรายการ
                    </Button>
                  </div>
                  <FormSection>
                    <FormField label="สินค้า *" htmlFor={`receive-product-search-${line.id}`} description="พิมพ์เพื่อค้นหา หรือเลือกสินค้าจากรายการที่แนะนำ ต้องเลือกจากสินค้าใน Master">
                      <Input
                        id={`receive-product-search-${line.id}`}
                        list={`receive-product-options-${line.id}`}
                        value={line.productSearch ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          const matched = products.find((product) => [product.name, product.code, product.sku].filter(Boolean).some((candidate) => candidate?.toLowerCase() === value.trim().toLowerCase()));
                          if (matched) selectProduct(line.id, matched.id);
                          else updateLine(line.id, { productSearch: value, productId: '', name: value });
                        }}
                        placeholder="พิมพ์ชื่อสินค้า รหัส หรือ SKU"
                      />
                      <datalist id={`receive-product-options-${line.id}`}>
                        {selectableProducts.map((product) => <option key={product.id} value={product.name}>{product.code || product.sku ? `${product.code ?? product.sku}` : undefined}</option>)}
                      </datalist>
                      {!line.productId && line.productSearch?.trim() ? (
                        <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                          <span>ไม่พบสินค้า “{line.productSearch}” ในระบบ</span>
                          <Button type="button" variant="outline" size="sm" onClick={() => { setCreateProductForLine(line.id); setCreateProductOpen(true); }}>สร้างสินค้าใหม่</Button>
                        </div>
                      ) : null}
                    </FormField>

                    <FormGrid className="border-t border-border/60 pt-6">
                      <div className="space-y-1.5">
                        <p className="text-sm font-medium">ชื่อสินค้า</p>
                        <p className="min-h-10 w-full rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">{line.name}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm font-medium">ประเภทการติดตาม</p>
                        <p className="min-h-10 w-full rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                          {trackingType === 'asset' ? 'ทรัพย์สิน / ติดตามรายชิ้น' : trackingType === 'stock' ? 'สต็อก / นับเป็นจำนวน' : trackingType || '-'}
                        </p>
                      </div>
                    </FormGrid>

                    <FormGrid className="border-t border-border/60 pt-6">
                      <FormField label="จำนวน *" htmlFor={`receive-quantity-${line.id}`} description="ต้องมากกว่า 0">
                        <Input id={`receive-quantity-${line.id}`} type="number" min="1" value={line.quantity} onChange={(event) => updateLine(line.id, { quantity: event.target.value })} />
                      </FormField>
                      <FormField label="หน่วย" htmlFor={`receive-unit-${line.id}`}>
                        <div id={`receive-unit-${line.id}`} className="min-h-10 w-full rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                          {unit}
                        </div>
                      </FormField>
                    </FormGrid>
                  </FormSection>
                  <FormGrid>
                      <FormField label="ภาชนะจัดเก็บ *" htmlFor={`receive-storage-${line.id}`} description={containers.length ? 'เลือกจากภาชนะจัดเก็บที่สร้างไว้แล้ว' : 'ยังไม่มีภาชนะจัดเก็บ ให้สร้างก่อนแล้วกลับมาเลือกที่นี่'}>
                      <Select id={`receive-storage-${line.id}`} value={line.storage} onChange={(event) => updateLine(line.id, { storage: event.target.value })} disabled={containers.length === 0}>
                        <option value="">{containers.length ? 'เลือกภาชนะจัดเก็บ' : 'ยังไม่มีภาชนะจัดเก็บ'}</option>
                        {containers.map((container) => <option key={container.id} value={container.id}>{container.name}{container.code ? ` (${container.code})` : ''}</option>)}
                      </Select>
                    </FormField>
                    <FormField label="วันหมดอายุ (ไม่บังคับ)" htmlFor={`receive-expiry-${line.id}`} description="เว้นว่างได้สำหรับของที่ไม่มีวันหมดอายุ">
                      <Input id={`receive-expiry-${line.id}`} type="date" value={line.expiryDate} onChange={(event) => updateLine(line.id, { expiryDate: event.target.value })} />
                    </FormField>
                    <FormField label="แจ้งเตือนก่อนหมดอายุ (วัน) (ไม่บังคับ)" htmlFor={`receive-expiry-alert-${line.id}`}>
                      <Input id={`receive-expiry-alert-${line.id}`} type="number" min="0" value={line.alertLeadDays} onChange={(event) => updateLine(line.id, { alertLeadDays: event.target.value })} placeholder="เช่น 7" />
                    </FormField>
                    {line.trackingType === 'stock' ? (
                      <FormField label="แจ้งเตือนเมื่อเหลือต่ำกว่า (ไม่บังคับ)" htmlFor={`receive-low-stock-${line.id}`}>
                        <Input id={`receive-low-stock-${line.id}`} type="number" min="0" value={line.lowStockAlert} onChange={(event) => updateLine(line.id, { lowStockAlert: event.target.value })} placeholder="เช่น 3" />
                      </FormField>
                    ) : null}
                  </FormGrid>
                  {containers.length === 0 ? (
                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                      <span>ยังไม่มีภาชนะจัดเก็บสำหรับรายการนี้</span>
                      <Button asChild type="button" variant="outline" size="sm"><Link to={`/w/${wsId}/containers`}>สร้างจุดจัดเก็บ</Link></Button>
                    </div>
                  ) : null}
                  {showValidation && lineErrors[index] ? <p className="mt-3 text-sm text-destructive">{lineErrors[index]}</p> : null}
                    </>);
                  })()}
                </div>
              ))}
            </div>
            {
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
            }
            <FormSection>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">รูปหลักฐานการรับเข้าครั้งนี้</p>
                  <p className="text-xs text-muted-foreground">แยกจากรูป Master ของสินค้า และอัปโหลดได้หลายรูป เช่น ใบส่งของ กล่อง หรือสภาพสินค้า</p>
                </div>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-5 text-center hover:border-primary/60">
                  <span className="text-sm font-medium">คลิกเพื่อเลือกไฟล์รูปภาพ</span>
                  <span className="mt-1 text-xs text-muted-foreground">เลือกได้หลายไฟล์ · JPG, PNG, WebP</span>
                  <Input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(event) => setEvidenceFiles((current) => [...current, ...Array.from(event.target.files ?? [])])} />
                </label>
                {evidenceFiles.length > 0 ? (
                  <div className="space-y-2">
                    {evidenceFiles.map((file, index) => (
                      <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2 text-sm">
                        <span className="min-w-0 truncate">{file.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEvidenceFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}>ลบ</Button>
                      </div>
                    ))}
                  </div>
                ) : null}
            </FormSection>
            <div className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span />
              <Button type="button" onClick={submitReceipt} loading={createReceipt.isPending} disabled={incompleteLines.length > 0}>บันทึกเข้าคลัง</Button>
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
            <Button type="button" onClick={submitReceipt} loading={createReceipt.isPending} disabled={incompleteLines.length > 0}>
              {incompleteLines.length > 0 ? `แก้ข้อมูลอีก ${incompleteLines.length} รายการ` : 'บันทึกเข้าคลัง'}
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
        initialName={lines.find((line) => line.id === createProductForLine)?.productSearch ?? ''}
        onCreated={(product) => {
          if (createProductForLine === null) return;
          updateLine(createProductForLine, {
            productId: product.id,
            productSearch: product.name,
            name: product.name,
            unit: product.unitCode || 'ชิ้น',
            trackingType: product.trackingType.toLowerCase() === 'asset' ? 'asset' : product.trackingType.toLowerCase() === 'stock' ? 'stock' : '',
            alertLeadDays: product.expiryLeadDaysDefault?.toString() ?? '',
            lowStockAlert: product.minStockAlert?.toString() ?? '',
          });
          setCreateProductForLine(null);
        }}
      />
    </PageShell>
  );
}
