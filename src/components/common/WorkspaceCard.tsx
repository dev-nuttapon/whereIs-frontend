import { useNavigate } from 'react-router-dom';
import { Button, Card, Tag, Typography } from 'antd';
import type { Workspace } from '@/types/domain.types';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { OpenIcon } from '@/components/ui/icons';
import { workspaceStore } from '@/stores/workspace.store';
import { cn } from '@/lib/cn';

export interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const setWorkspace = workspaceStore((state) => state.setWorkspace);
  const accentIndex = workspace.id.length % 4;
  const accentClassNames = [
    'from-slate-900 via-slate-700 to-slate-500',
    'from-cyan-900 via-cyan-700 to-sky-500',
    'from-emerald-900 via-emerald-700 to-teal-500',
    'from-amber-900 via-orange-700 to-rose-500',
  ];
  const accentClassName = accentClassNames[accentIndex];

  return (
    <Card className="responsive-card-body group h-full overflow-hidden border-border/70 bg-card/90 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-[0_18px_50px_-34px_rgba(15,23,42,0.36)]" styles={{ body: { padding: 20 } }}>
      <div className={cn('h-1 bg-gradient-to-r', accentClassName)} />
      <div className="flex flex-col gap-[18px]">
        <div className="flex items-start gap-[18px]">
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-semibold text-white shadow-sm sm:h-12 sm:w-12', accentClassName)}>
            {workspace.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <Typography.Title level={5} className="!mb-0 !mt-0 truncate text-lg">
                  {workspace.name}
                </Typography.Title>
                <Typography.Paragraph className="!mb-0 max-h-[3rem] overflow-hidden leading-6 text-muted-foreground sm:min-h-[2.5rem]">
                  {workspace.description ?? t('workspace.card.fallback')}
                </Typography.Paragraph>
              </div>
              <Tag className="shrink-0 uppercase tracking-[0.16em] text-[0.62rem]" color="blue">
                {workspace.myRole}
              </Tag>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[18px] border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
          <span className="text-sm text-muted-foreground">
            {t('workspace.card.role')}: {workspace.myRole}
          </span>
          <Button
            size="small"
            className="w-full sm:min-w-28 sm:w-auto"
            onClick={() => {
              setWorkspace(workspace);
              navigate(ROUTES.workspaceDashboard(workspace.id));
            }}
          >
            <OpenIcon className="h-4 w-4" />
            {t('workspace.card.open')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
