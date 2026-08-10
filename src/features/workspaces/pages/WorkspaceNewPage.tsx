import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/forms/FormField';
import { FormActions } from '@/components/forms/FormActions';
import { createWorkspaceSchema as createWorkspaceValidationSchema, type CreateWorkspaceValues } from '@/features/workspaces/validation/createWorkspaceSchema';
import { useCreateWorkspace } from '@/features/workspaces/hooks/useCreateWorkspace';
import { useI18n } from '@/hooks/useI18n';
import { PlusIcon } from '@/components/ui/icons';
import { ROUTES } from '@/constants/routes';
import { WorkspaceSelectPageShell } from '@/components/common/WorkspaceSelectPageShell';

export function WorkspaceNewPage() {
  const createWorkspaceMutation = useCreateWorkspace();
  const { t } = useI18n();
  const createWorkspaceSchema = createWorkspaceValidationSchema(t);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createWorkspaceMutation.mutateAsync(values);
  });

  return (
    <WorkspaceSelectPageShell className="mx-auto w-full max-w-2xl">
      <Card className="workspace-form-card">
        <CardContent className="component-stack p-5 sm:p-7 lg:p-8">
          <div className="space-y-2">
            <CardTitle className="text-xl tracking-tight">{t('workspace.new.title')}</CardTitle>
            <CardDescription>{t('workspace.new.description')}</CardDescription>
          </div>
            <form className="component-stack workspace-form" onSubmit={onSubmit}>
            <FormField label={t('workspace.new.label')} htmlFor="name" error={errors.name?.message}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    id="name"
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(event.target.value)}
                    placeholder={t('workspace.new.placeholder')}
                  />
                )}
              />
            </FormField>
            <FormActions>
              <Button asChild variant="outline" type="button">
                <Link to={ROUTES.workspaces}>{t('common.cancel')}</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting || createWorkspaceMutation.isPending}>
                <PlusIcon className="h-4 w-4" />
                {isSubmitting || createWorkspaceMutation.isPending ? t('workspace.new.saving') : t('workspace.new.submit')}
              </Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>
    </WorkspaceSelectPageShell>
  );
}
