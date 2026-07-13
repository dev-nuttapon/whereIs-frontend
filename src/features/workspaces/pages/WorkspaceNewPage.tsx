import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { PageShell } from '@/components/common/PageShell';
import { FormField } from '@/components/forms/FormField';
import { FormActions } from '@/components/forms/FormActions';
import { createWorkspaceSchema as createWorkspaceValidationSchema, type CreateWorkspaceValues } from '@/features/workspaces/validation/createWorkspaceSchema';
import { useCreateWorkspace } from '@/features/workspaces/hooks/useCreateWorkspace';
import { useI18n } from '@/hooks/useI18n';
import { PlusIcon } from '@/components/ui/icons';

export function WorkspaceNewPage() {
  const createWorkspaceMutation = useCreateWorkspace();
  const { t } = useI18n();
  const createWorkspaceSchema = createWorkspaceValidationSchema(t);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: 'Warehouse Workspace',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createWorkspaceMutation.mutateAsync(values);
  });

  return (
    <PageShell title={t('workspace.new.title')} description={t('workspace.new.description')}>
      <Card>
        <CardContent className="component-stack p-5 sm:p-6">
          <div className="space-y-2">
            <CardTitle className="text-base">{t('workspace.new.cardTitle')}</CardTitle>
            <CardDescription>{t('workspace.new.cardDescription')}</CardDescription>
          </div>
          <form className="component-stack" onSubmit={onSubmit}>
            <FormField label={t('workspace.new.label')} htmlFor="name" error={errors.name?.message}>
              <Input id="name" placeholder={t('workspace.new.placeholder')} {...register('name')} />
            </FormField>
            <FormActions>
              <Button type="submit" disabled={isSubmitting || createWorkspaceMutation.isPending}>
                <PlusIcon className="h-4 w-4" />
                {isSubmitting || createWorkspaceMutation.isPending ? t('workspace.new.saving') : t('workspace.new.submit')}
              </Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}
