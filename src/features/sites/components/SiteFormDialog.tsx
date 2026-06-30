import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Site } from '@/types/domain.types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { FormActions } from '@/components/forms/FormActions';
import { createSiteSchema, type SiteValues } from '@/features/sites/validation/siteSchema';
import { useCreateSite, useUpdateSite } from '@/features/sites/hooks/useSites';
import { useI18n } from '@/hooks/useI18n';

export interface SiteFormDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: Site;
}

export function SiteFormDialog({ wsId, open, onOpenChange, site }: SiteFormDialogProps) {
  const createMutation = useCreateSite(wsId);
  const updateMutation = useUpdateSite(wsId, site?.id ?? '');
  const isEditing = Boolean(site);
  const mutation = isEditing ? updateMutation : createMutation;
  const { t } = useI18n();
  const siteSchema = createSiteSchema(t);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SiteValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: site?.name ?? 'Sample Site',
      description: site?.description ?? 'Sample site for this workspace',
    },
  });

  useEffect(() => {
    reset({
      name: site?.name ?? 'Sample Site',
      description: site?.description ?? 'Sample site for this workspace',
    });
  }, [reset, site]);

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t('sites.form.editTitle') : t('sites.form.createTitle')}</DialogTitle>
          <DialogDescription>{t('sites.form.description')}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField label={t('sites.form.name')} htmlFor="site-name" error={errors.name?.message}>
            <Input id="site-name" {...register('name')} />
          </FormField>
          <FormField label={t('sites.form.descriptionLabel')} htmlFor="site-description" error={errors.description?.message}>
            <Textarea id="site-description" rows={4} {...register('description')} />
          </FormField>
          <FormActions>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('sites.form.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending ? t('sites.form.saving') : t('sites.form.save')}
            </Button>
          </FormActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
