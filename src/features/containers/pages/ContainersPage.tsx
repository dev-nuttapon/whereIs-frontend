import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Tag } from 'antd';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { ContainerIcon, FilterIcon, OpenIcon, PlusIcon } from '@/components/ui/icons';
import { CreateContainerDialog } from '@/features/containers/components/CreateContainerDialog';
import { useLocations } from '@/features/locations/hooks/useLocations';
import { useSites } from '@/features/sites/hooks/useSites';
import { buildLocationLabelMap } from '@/features/containers/utils/locationOptions';
import { formatContainerTypeLabel } from '@/features/containers/utils/containerLabels';
import type { Container } from '@/types/domain.types';
import { usePermission } from '@/hooks/usePermission';
import { safeAssetUrl } from '@/lib/safe-url';
import { DataTableHead, DataTableRow, DataTableShell, dataTableCellClass } from '@/components/common/DataTableShell';

function groupContainersByParent(containers: Container[]) {
  return containers.reduce<Map<string | null, Container[]>>((groups, container) => {
    const key = container.parentId ?? null;
    const bucket = groups.get(key) ?? [];
    bucket.push(container);
    groups.set(key, bucket);
    return groups;
  }, new Map());
}

function ContainerTreeCard({
  container,
  childMap,
  wsId,
  t,
  locationLabelById,
}: {
  container: Container;
  childMap: Map<string | null, Container[]>;
  wsId: string;
  t: (key: string, fallback?: string) => string;
  locationLabelById: Map<string, string>;
}) {
  const children = (childMap.get(container.id) ?? []).slice().sort((left, right) => left.name.localeCompare(right.name));

  return (
    <div className="space-y-3">
      <Card className="hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="space-y-4 p-5 sm:p-6">
          {container.photoUrl ? (
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
              <img src={safeAssetUrl(container.photoUrl)} alt={container.name} className="h-36 w-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
            </div>
          ) : null}
          <div className="space-y-1">
            <CardTitle className="text-lg">{container.name}</CardTitle>
            <CardDescription>{formatContainerTypeLabel(container.typeLabel)}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag>{container.parentId ? container.parentId : t('containers.list.root', 'Root container')}</Tag>
            <Tag>{container.locationId ? (locationLabelById.get(container.locationId) ?? container.locationId) : t('container.detail.noLocation', 'No location')}</Tag>
            <Tag>{container.itemCount ?? 0} {container.itemCount === 1 ? t('common.item', 'item') : t('common.items', 'items')}</Tag>
            <Tag>{container.childContainerCount ?? 0} {container.childContainerCount === 1 ? t('common.child', 'child') : t('common.children', 'children')}</Tag>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full rounded-full sm:w-auto">
            <Link to={ROUTES.workspaceContainerDetail(wsId, container.id)}>
              <OpenIcon className="h-4 w-4" />
              {t('containers.list.open')}
            </Link>
          </Button>
        </CardContent>
      </Card>
      {children.length > 0 ? (
        <div className="ml-4 space-y-3 border-l border-border/60 pl-4">
          {children.map((child) => (
            <ContainerTreeCard key={child.id} container={child} childMap={childMap} wsId={wsId} t={t} locationLabelById={locationLabelById} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ContainersPage() {
  const { wsId = '' } = useParams();
  const { t } = useI18n();
  const { can } = usePermission();
  const containersQuery = useContainers(wsId);
  const locationsQuery = useLocations(wsId);
  const sitesQuery = useSites(wsId);
  const containers = containersQuery.data ?? [];
  const locationLabelById = useMemo(
    () => buildLocationLabelMap(locationsQuery.data ?? [], sitesQuery.data ?? []),
    [locationsQuery.data, sitesQuery.data],
  );
  const childMap = useMemo(() => groupContainersByParent(containers), [containers]);
  const rootContainers = useMemo(
    () => (childMap.get(null) ?? []).slice().sort((left, right) => left.name.localeCompare(right.name)),
    [childMap],
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filteredContainers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return containers.filter((container) => {
      const matchesSearch = !term || `${container.name} ${container.code ?? ''} ${container.typeLabel ?? ''} ${container.locationId ?? ''}`.toLowerCase().includes(term);
      const matchesStatus = !status || (status === 'with_items' ? (container.itemCount ?? 0) > 0 : (container.itemCount ?? 0) === 0);
      return matchesSearch && matchesStatus;
    });
  }, [containers, search, status]);
  const pageCount = Math.max(1, Math.ceil(filteredContainers.length / pageSize));
  const visibleContainers = filteredContainers.slice((page - 1) * pageSize, page * pageSize);
  const updateSearch = (value: string) => { setSearch(value); setPage(1); };
  const updateStatus = (value: string) => { setStatus(value); setPage(1); };

  return (
    <PageShell
      title={t('containers.list.title')}
      description={t('containers.list.description')}
      actions={can('container.create') ? (
        <Button className="w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          {t('containers.list.create', 'สร้าง container')}
        </Button>
      ) : null}
    >
      {containersQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {containersQuery.isError ? <ErrorState message={t('containers.list.error', 'Unable to load containers.')} onRetry={() => containersQuery.refetch()} /> : null}
      <Card className="shadow-sm"><CardContent className="space-y-4 p-4 sm:p-6"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><FilterIcon className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">ค้นหาและกรอง</p><p className="text-xs text-muted-foreground">ค้นหาชื่อ รหัส ประเภท หรือกรองตามรายการ</p></div></div><Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => { setSearch(''); setStatus(''); setPage(1); }} disabled={!search && !status}>ล้างตัวกรอง</Button></div><div className="grid grid-cols-1 gap-3 md:grid-cols-3"><div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">ค้นหา (ชื่อ/รหัส/ประเภท)</label><Input className="w-full rounded-full" value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="ค้นหาภาชนะจัดเก็บ" /></div><div className="min-w-0 space-y-1"><label className="block text-xs font-medium text-muted-foreground">สถานะรายการ</label><Select className="w-full" value={status} onChange={(event) => updateStatus(event.target.value)}><option value="">ทุกรายการ</option><option value="with_items">มีรายการ</option><option value="empty">ว่าง</option></Select></div></div></CardContent></Card>

      <div className="grid gap-[18px] md:grid-cols-3">
        <StatCard label={t('containers.list.itemCount')} value={visibleContainers.reduce((sum, container) => sum + (container.itemCount ?? 0), 0)} />
        <StatCard label={t('containers.list.total')} value={filteredContainers.length} />
        <StatCard label={t('containers.list.childCount')} value={visibleContainers.reduce((sum, container) => sum + (container.childContainerCount ?? 0), 0)} />
      </div>

      {filteredContainers.length === 0 ? (
        <EmptyState
          title={t('containers.list.emptyTitle')}
          description={t('containers.list.emptyDescription')}
          icon={<ContainerIcon className="h-5 w-5" />}
        />
      ) : (
        <><DataTableShell minWidth="min-w-[850px]"><DataTableHead><th className={dataTableCellClass}>ภาชนะจัดเก็บ</th><th className={dataTableCellClass}>ประเภท</th><th className={dataTableCellClass}>สถานที่</th><th className={dataTableCellClass}>รายการ</th><th className={`${dataTableCellClass} text-right`}>จัดการ</th></DataTableHead><tbody>{visibleContainers.map((container) => <DataTableRow key={container.id}><td className={`${dataTableCellClass} font-medium`}><span className={container.parentId ? 'pl-5 text-muted-foreground' : ''}>{container.parentId ? '↳ ' : ''}{container.name}</span></td><td className={`${dataTableCellClass} text-muted-foreground`}>{formatContainerTypeLabel(container.typeLabel)}</td><td className={`${dataTableCellClass} text-muted-foreground`}>{container.locationId ? (locationLabelById.get(container.locationId) ?? '-') : '-'}</td><td className={`${dataTableCellClass} text-muted-foreground`}>{container.itemCount ?? 0}</td><td className={`${dataTableCellClass} text-right`}><Button asChild variant="outline" size="sm" className="rounded-full"><Link to={ROUTES.workspaceContainerDetail(wsId, container.id)}><OpenIcon className="h-4 w-4" />ดูรายละเอียด</Link></Button></td></DataTableRow>)}</tbody></DataTableShell><div className="flex items-center justify-between gap-3 border-t border-border/70 px-5 py-3 text-sm text-muted-foreground"><span>{filteredContainers.length === 0 ? '0 รายการ' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filteredContainers.length)} จาก ${filteredContainers.length} รายการ`}</span><div className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>ก่อนหน้า</Button><span className="min-w-16 text-center text-foreground">หน้า {page} / {pageCount}</span><Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount}>ถัดไป</Button><Select className="w-24" value={String(pageSize)} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value="10">10 / หน้า</option><option value="25">25 / หน้า</option><option value="50">50 / หน้า</option></Select></div></div></>
      )}

      <CreateContainerDialog wsId={wsId} open={createOpen} onOpenChange={setCreateOpen} />
    </PageShell>
  );
}
