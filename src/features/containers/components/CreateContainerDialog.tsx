import { useI18n } from '@/hooks/useI18n';
import { useCreateContainer } from '@/features/containers/hooks/useContainers';
import { ContainerFormDialog } from '@/features/containers/components/ContainerFormDialog';

interface CreateContainerDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateContainerDialog({ wsId, open, onOpenChange }: CreateContainerDialogProps) {
  const { t } = useI18n();
  const createContainer = useCreateContainer(wsId);

  return (
    <ContainerFormDialog
      wsId={wsId}
      open={open}
      onOpenChange={onOpenChange}
      title={t('containers.create.title', 'สร้าง container')}
      description={t('containers.create.description', 'สร้าง container ใหม่ภายใน workspace ปัจจุบัน')}
      submitLabel={t('containers.create.action', 'สร้าง container')}
      showParentSelector
      onSubmit={async (values) => {
        await createContainer.mutateAsync({
          locationId: values.locationId || null,
          name: values.name,
          type: values.type || null,
          code: values.code || null,
          qrCode: values.qrCode || null,
          photoUrl: values.photoUrl || null,
          parentContainerId: values.parentContainerId || null,
        });
        onOpenChange(false);
      }}
      isSubmitting={createContainer.isPending}
    />
  );
}
