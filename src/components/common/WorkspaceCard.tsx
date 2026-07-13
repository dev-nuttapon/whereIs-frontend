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
    <Card className="responsive-card-body group h-full overflow-hidden border-border/70 bg-card/92 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-[0_22px_55px_-38px_rgba(15,23,42,0.5)]" styles={{ body: { padding: 20 } }}>
      <div className="flex h-full flex-col gap-[18px]">
        <div className="flex items-start gap-[18px]">
          <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(15,23,42,0.8)]', accentClassName)}>
            {workspace.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Typography.Title level={5} className="!mb-0 !mt-0 min-w-0 truncate text-base font-semibold">
                {workspace.name}
              </Typography.Title>
              <Tag className="m-0 shrink-0 rounded-full border-primary/10 bg-primary/8 px-2 py-0 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-primary">
                {workspace.myRole}
              </Tag>
            </div>
            <Typography.Paragraph className="!mb-0 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {workspace.description ?? t('workspace.card.fallback')}
            </Typography.Paragraph>
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-[18px] rounded-2xl border border-border/70 bg-background/65 p-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {t('workspace.card.role')}: {workspace.myRole}
          </span>
          <Button
            size="small"
            className="w-full border-border/70 bg-card shadow-none sm:min-w-28 sm:w-auto"
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
