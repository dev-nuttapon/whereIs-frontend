import type { ReactNode } from 'react';
import { Empty, Typography } from 'antd';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <Empty
      image={icon ? <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl">{icon}</div> : Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div className="space-y-1">
          <Typography.Title level={5} className="!mb-0 !mt-0">
            {title}
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 !text-sm text-muted-foreground">
            {description}
          </Typography.Paragraph>
        </div>
      }
    >
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="px-5">
          {actionLabel}
        </Button>
      ) : null}
    </Empty>
  );
}
