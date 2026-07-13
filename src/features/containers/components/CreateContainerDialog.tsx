import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Typography } from 'antd';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/forms/FormField';
import { useI18n } from '@/hooks/useI18n';
import { ContainerIcon, LocationIcon, PlusIcon } from '@/components/ui/icons';
import { useContainers, useCreateContainer } from '@/features/containers/hooks/useContainers';
import { useSites } from '@/features/sites/hooks/useSites';
import { useLocations } from '@/features/locations/hooks/useLocations';

interface CreateContainerDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PlacementMode = 'location' | 'parent';

export function CreateContainerDialog({ wsId, open, onOpenChange }: CreateContainerDialogProps) {
  const { t } = useI18n();
  const createContainer = useCreateContainer(wsId);
  const sitesQuery = useSites(wsId);
  const containersQuery = useContainers(wsId);
  const sites = sitesQuery.data ?? [];
  const containers = containersQuery.data ?? [];
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [code, setCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [placementMode, setPlacementMode] = useState<PlacementMode>('location');
  const [siteId, setSiteId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [parentContainerId, setParentContainerId] = useState('');

  const locationsQuery = useLocations(wsId, siteId);
  const locations = locationsQuery.data ?? [];

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextSiteId = sites[0]?.id ?? '';
    setName('');
    setType('');
    setCode('');
    setQrCode('');
    setPlacementMode('location');
    setSiteId(nextSiteId);
    setLocationId('');
    setParentContainerId('');
  }, [open, sites]);

  useEffect(() => {
    if (placementMode === 'location') {
      setParentContainerId('');
      setLocationId((current) => (current && locations.some((location) => location.id === current) ? current : locations[0]?.id ?? ''));
      return;
    }

    setLocationId('');
    setParentContainerId((current) => (current && containers.some((container) => container.id === current) ? current : containers[0]?.id ?? ''));
  }, [containers, locations, placementMode]);

  const canSubmit = Boolean(name.trim())
    && (
      (placementMode === 'location' && locationId)
      || (placementMode === 'parent' && parentContainerId)
    )
    && !createContainer.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    await createContainer.mutateAsync({
      name: name.trim(),
      type: type.trim() || null,
      code: code.trim() || null,
      qrCode: qrCode.trim() || null,
      locationId: placementMode === 'location' ? locationId : null,
      parentContainerId: placementMode === 'parent' ? parentContainerId : null,
    });

    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName('');
      setType('');
      setCode('');
      setQrCode('');
      setPlacementMode('location');
      setSiteId('');
      setLocationId('');
      setParentContainerId('');
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[40rem]">
        <DialogHeader className="pr-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PlusIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <DialogTitle>{t('containers.create.title', 'สร้าง container')}</DialogTitle>
              <DialogDescription>{t('containers.create.description', 'สร้าง container ใหม่ภายใน workspace ที่เลือกอยู่')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="component-stack px-5 pb-5 sm:px-6">
            <section className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">1</span>
                <Typography.Text strong>{t('containers.create.basicInfo', 'ข้อมูล container')}</Typography.Text>
              </div>
              <div className="component-stack">
                <FormField label={t('containers.create.name', 'ชื่อ container')} htmlFor="container-name">
                  <Input
                    id="container-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t('containers.create.namePlaceholder', 'เช่น Shelf A1')}
                    autoComplete="off"
                  />
                </FormField>
                <FormField label={t('containers.create.type', 'ประเภท')} htmlFor="container-type">
                  <Input
                    id="container-type"
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    placeholder={t('containers.create.typePlaceholder', 'เช่น shelf, box, drawer')}
                    autoComplete="off"
                  />
                </FormField>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label={t('containers.create.code', 'รหัส')} htmlFor="container-code">
                    <Input
                      id="container-code"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      placeholder={t('containers.create.codePlaceholder', 'เช่น A1-01')}
                      autoComplete="off"
                    />
                  </FormField>
                  <FormField label={t('containers.create.qrCode', 'QR code')} htmlFor="container-qr">
                    <Input
                      id="container-qr"
                      value={qrCode}
                      onChange={(event) => setQrCode(event.target.value)}
                      placeholder={t('containers.create.qrPlaceholder', 'วางค่า QR ถ้ามี')}
                      autoComplete="off"
                    />
                  </FormField>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">2</span>
                <Typography.Text strong>{t('containers.create.placementTitle', 'กำหนดตำแหน่งที่สร้าง')}</Typography.Text>
              </div>
              <div className="space-y-3">
                <Select
                  className="w-full"
                  value={placementMode}
                  onChange={(event) => setPlacementMode(event.target.value as PlacementMode)}
                >
                  <option value="location">{t('containers.create.byLocation', 'สร้างภายใต้ location')}</option>
                  <option value="parent">{t('containers.create.byParent', 'สร้างเป็น container ลูก')}</option>
                </Select>

                {placementMode === 'location' ? (
                  <div className="component-stack">
                    <FormField label={t('workspace.list.current', 'Workspace')} htmlFor="container-site">
                      <Select
                        id="container-site"
                        className="w-full"
                        value={siteId}
                        onChange={(event) => setSiteId(event.target.value)}
                      >
                        {sites.length === 0 ? (
                          <option value="">{t('containers.create.noSites', 'ยังไม่มี site')}</option>
                        ) : null}
                        {sites.map((site) => (
                          <option key={site.id} value={site.id}>
                            {site.name}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                    <FormField label={t('containers.create.location', 'Location')} htmlFor="container-location">
                      <Select
                        id="container-location"
                        className="w-full"
                        value={locationId}
                        onChange={(event) => setLocationId(event.target.value)}
                        disabled={!siteId || locationsQuery.isLoading}
                      >
                        {locations.length === 0 ? (
                          <option value="">{t('containers.create.noLocations', 'ยังไม่มี location ให้เลือก')}</option>
                        ) : null}
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                    {locationsQuery.isError ? (
                      <Alert
                        type="warning"
                        showIcon
                        message={t('containers.create.locationLoadError', 'โหลด location ไม่สำเร็จ')}
                      />
                    ) : null}
                    <p className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
                      <LocationIcon className="h-4 w-4" />
                      {placementMode === 'location'
                        ? t('containers.create.placementLocation', 'เลือก location')
                        : t('containers.create.placementParent', 'เลือก parent container')}
                    </p>
                  </div>
                ) : (
                  <div className="component-stack">
                    <FormField label={t('containers.create.parentContainer', 'Parent container')} htmlFor="container-parent">
                      <Select
                        id="container-parent"
                        className="w-full"
                        value={parentContainerId}
                        onChange={(event) => setParentContainerId(event.target.value)}
                        disabled={containers.length === 0}
                      >
                        {containers.length === 0 ? (
                          <option value="">{t('containers.create.noContainers', 'ยังไม่มี container ให้เลือก')}</option>
                        ) : null}
                        {containers.map((container) => (
                          <option key={container.id} value={container.id}>
                            {container.name}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                    <p className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
                      <ContainerIcon className="h-4 w-4" />
                      {t('containers.create.parentHelp', 'เลือก container หลักเพื่อสร้าง container ลูก')}
                    </p>
                  </div>
                )}
                {placementMode === 'location' && sites.length === 0 ? (
                  <Alert
                    type="warning"
                    showIcon
                    message={t('containers.create.noSitesAvailable', 'workspace นี้ยังไม่มี site')}
                  />
                ) : null}
                {placementMode === 'parent' && containers.length === 0 ? (
                  <Alert
                    type="warning"
                    showIcon
                    message={t('containers.create.noParentContainers', 'ยังไม่มี container สำหรับสร้างลูก')}
                  />
                ) : null}
              </div>
            </section>
          </div>

          <DialogFooter className="border-t border-border/70 bg-muted/30 px-5 py-4 sm:px-6">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {createContainer.isPending ? t('common.saving', 'กำลังบันทึก...') : t('containers.create.action', 'สร้าง container')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
