import { Link } from 'react-router-dom';
import type { Workspace } from '@/types/domain.types';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { OpenIcon } from '@/components/ui/icons';
import { workspaceStore } from '@/stores/workspace.store';

export interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const { t } = useI18n();
  const setWorkspace = workspaceStore((state) => state.setWorkspace);

  return (
    <Card>
      <CardContent className="space-y-3 p-5 sm:space-y-4 sm:p-6">
        <div className="space-y-1">
          <CardTitle>{workspace.name}</CardTitle>
          <CardDescription>{workspace.description ?? t('workspace.card.fallback')}</CardDescription>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {t('workspace.card.role')}: {workspace.myRole}
          </span>
          <Button asChild size="sm">
            <Link to={ROUTES.workspaceDashboard(workspace.id)} onClick={() => setWorkspace(workspace)}>
              <OpenIcon className="h-4 w-4" />
              {t('workspace.card.open')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
