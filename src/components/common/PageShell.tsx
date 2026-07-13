import type { ReactNode } from 'react';
import { Typography } from 'antd';
import { cn } from '@/lib/cn';

export interface PageShellProps {
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageShell({ title, description, children, actions, className }: PageShellProps) {
  return (
    <div className={cn('component-stack', className)}>
      <section className="relative overflow-hidden rounded-[1.25rem] border border-border/70 bg-card/90 px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_18px_40px_-34px_rgba(2,6,23,0.6)] sm:rounded-[1.5rem] sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--foreground)/0.04),_transparent_30%),radial-gradient(circle_at_bottom_left,_hsl(var(--primary)/0.05),_transparent_35%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 space-y-2.5">
            <Typography.Title level={2} className="!mb-0 !mt-0 text-lg tracking-tight sm:text-2xl">
              {title}
            </Typography.Title>
            {description ? (
              <Typography.Paragraph className="!mb-0 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
              </Typography.Paragraph>
            ) : null}
          </div>
          {actions ? <div className="page-actions flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">{actions}</div> : null}
        </div>
      </section>
      <div className="component-stack">{children}</div>
    </div>
  );
}
