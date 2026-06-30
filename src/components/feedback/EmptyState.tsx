import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
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
    <Card className="border-dashed border-border">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center sm:gap-4 sm:py-10">
        {icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <div className="text-xl">{icon}</div>
          </div>
        ) : null}
        <div className="space-y-1">
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          <CardDescription className="max-w-md">{description}</CardDescription>
        </div>
        {actionLabel && onAction ? (
          <Button onClick={onAction} className="px-5">
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
