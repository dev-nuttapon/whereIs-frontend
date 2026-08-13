import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { useI18n } from '@/hooks/useI18n';
import { DatabaseIcon, FilterIcon, ItemIcon, OpenIcon } from '@/components/ui/icons';
import { useAssets } from '@/features/assets/hooks/useAssets';
import { useStockEntries } from '@/features/stock/hooks/useStock';
import { ROUTES } from '@/constants/routes';

interface InventoryFilters {
  search: string;
  type: 'all' | 'asset' | 'stock';
  status: string;
}

const DEFAULT_FILTERS: InventoryFilters = { search: '', type: 'all', status: '' };

export function ItemsPage() {
  const { wsId = '' } = useParams();
  const { t } = useI18n();
  const [filters, setFilters] = useState<InventoryFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const requestedPageSize = page * pageSize;
  const assetsQuery = useAssets(wsId, { page: 1, pageSize: requestedPageSize });
  const stockQuery = useStockEntries(wsId, { page: 1, pageSize: requestedPageSize });
  const assets = assetsQuery.data ?? [];
  const stockEntries = stockQuery.data?.items ?? [];
  const isLoading = assetsQuery.isLoading || stockQuery.isLoading;
  const hasError = assetsQuery.isError || stockQuery.isError;
  const hasActiveFilters = Boolean(filters.search.trim() || filters.type !== 'all' || filters.status);

  const rows = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const assetRows = filters.type === 'stock' ? [] : assets.map((asset) => ({
      id: asset.id,
      type: 'asset' as const,
      name: asset.productName,
      code: asset.serialNumber || asset.barcode || asset.id,
      status: asset.status.toLowerCase() === 'available' ? 'พร้อมใช้งาน' : asset.status.toLowerCase() === 'borrowed' ? 'ถูกยืม' : asset.status.toLowerCase() === 'missing' ? 'สูญหาย' : asset.status,
      quantity: 1,
      unit: 'ชิ้น',
      storage: asset.containerName || asset.locationName || '-',
      detailPath: ROUTES.workspaceAssetDetail(wsId, asset.id),
    }));
    const stockRows = filters.type === 'asset' ? [] : stockEntries.map((entry) => ({
      id: entry.id,
      type: 'stock' as const,
      name: entry.productName,
      code: entry.lotCode || entry.id,
      status: entry.quantity > 0 ? 'พร้อมใช้งาน' : 'หมดสต็อก',
      quantity: entry.quantity,
      unit: entry.unitCode || '-',
      storage: entry.containerName || entry.locationName || '-',
      detailPath: ROUTES.workspaceStockDetail(wsId, entry.id),
    }));
    const filteredRows = [...assetRows, ...stockRows].filter((row) => {
      const matchesSearch = !search || `${row.name} ${row.code} ${row.storage}`.toLowerCase().includes(search);
      const matchesStatus = !filters.status || row.status.toLowerCase() === filters.status.toLowerCase();
      return matchesSearch && matchesStatus;
    });
    return Array.from(new Map(filteredRows.map((row) => [`${row.type}:${row.id}`, row])).values());
  }, [assets, filters, stockEntries, wsId]);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const updateFilters = (next: InventoryFilters) => {
    setFilters(next);
    setPage(1);
  };
  const statusClass = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'พร้อมใช้งาน' || normalized === 'available' || normalized === 'จัดเก็บอยู่') return 'bg-emerald-50 text-emerald-700';
    if (normalized === 'ถูกยืม' || normalized === 'borrowed') return 'bg-blue-50 text-blue-700';
    if (normalized === 'หมดสต็อก' || normalized === 'disposed' || normalized === 'missing') return 'bg-red-50 text-red-700';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <PageShell
      title="ของทั้งหมด"
      description="ค้นหาและดูรายการทรัพย์สินกับสต็อกทั้งหมดในพื้นที่ทำงาน"
    >
      {isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {hasError ? <ErrorState message="ไม่สามารถโหลดข้อมูลของทั้งหมดได้" onRetry={() => { void assetsQuery.refetch(); void stockQuery.refetch(); }} /> : null}

      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><FilterIcon className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">ค้นหาและกรอง</p><p className="text-xs text-muted-foreground">ค้นหาและกรองตามชื่อ รหัส ตำแหน่งจัดเก็บ หรือประเภท</p></div></div><Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => updateFilters(DEFAULT_FILTERS)} disabled={!hasActiveFilters}>ล้างตัวกรอง</Button></div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">ค้นหา (ชื่อ/รหัส/ตำแหน่งจัดเก็บ)</label><Input className="w-full" value={filters.search} onChange={(event) => updateFilters({ ...filters, search: event.target.value })} placeholder="ค้นหาชื่อหรือตำแหน่งจัดเก็บ" allowClear /></div>
            <div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">ประเภท</label><Select className="w-full" value={filters.type} onChange={(event) => updateFilters({ ...filters, type: event.target.value as InventoryFilters['type'] })}>
              <option value="all">ทั้งหมด</option><option value="asset">ทรัพย์สิน</option><option value="stock">สต็อก</option>
            </Select></div>
            <div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">สถานะ</label><Select className="w-full" value={filters.status} onChange={(event) => updateFilters({ ...filters, status: event.target.value })}><option value="">ทุกสถานะ</option><option value="พร้อมใช้งาน">พร้อมใช้งาน</option><option value="ถูกยืม">ถูกยืม</option><option value="จัดเก็บอยู่">จัดเก็บอยู่</option><option value="หมดสต็อก">หมดสต็อก</option></Select></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-[18px] md:grid-cols-3">
        <StatCard label="รายการทั้งหมด" value={rows.length} />
        <StatCard label="ทรัพย์สิน" value={rows.filter((row) => row.type === 'asset').length} />
        <StatCard label="สต็อก" value={rows.filter((row) => row.type === 'stock').reduce((total, row) => total + row.quantity, 0)} />
      </div>

      {rows.length === 0 ? <EmptyState title={hasActiveFilters ? 'ไม่พบรายการตามตัวกรอง' : 'ยังไม่มีของในคลัง'} description="รายการที่เพิ่มผ่านการรับเข้าคลังจะแสดงเป็นทรัพย์สินหรือสต็อกที่นี่" icon={<ItemIcon className="h-5 w-5" />} /> : (
        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/60 text-left text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">ชื่อของ</th>
                  <th className="px-5 py-4">ประเภท</th>
                  <th className="px-5 py-4">สถานะ</th>
                  <th className="px-5 py-4 text-right">จำนวน</th>
                  <th className="px-5 py-4">ตำแหน่งจัดเก็บ</th>
                  <th className="px-5 py-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {visibleRows.map((row) => (
                  <tr key={`${row.type}-${row.id}`} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-4 font-medium text-foreground">{row.name}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.type === 'asset' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>{row.type === 'asset' ? 'ทรัพย์สิน' : 'สต็อก'}</span></td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(row.status)}`}>{row.status}</span></td>
                    <td className="px-5 py-4 text-right font-medium">{row.quantity} <span className="font-normal text-muted-foreground">{row.unit}</span></td>
                    <td className="px-5 py-4 text-muted-foreground">{row.storage}</td>
                    <td className="px-5 py-4 text-right"><Button asChild variant="outline" size="sm" className="rounded-full"><Link to={row.detailPath}><OpenIcon className="h-4 w-4" />ดูรายละเอียด</Link></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col gap-3 border-t border-border/70 px-5 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>{rows.length === 0 ? '0 รายการ' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, rows.length)} จาก ${rows.length} รายการ`}</span>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>ก่อนหน้า</Button>
                <span className="min-w-16 text-center text-foreground">หน้า {page} / {pageCount}</span>
                <Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount}>ถัดไป</Button>
                <Select className="w-24" value={String(pageSize)} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value="10">10 / หน้า</option><option value="25">25 / หน้า</option><option value="50">50 / หน้า</option></Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
