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
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      <section className="relative overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/90 px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_18px_40px_-34px_rgba(2,6,23,0.6)] sm:px-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--foreground)/0.04),_transparent_30%),radial-gradient(circle_at_bottom_left,_hsl(var(--primary)/0.05),_transparent_35%)]" />
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Typography.Title level={2} className="!mb-0 !mt-0 text-xl tracking-tight sm:text-2xl">
              {title}
            </Typography.Title>
            {description ? (
              <Typography.Paragraph className="!mb-0 max-w-2xl text-sm text-muted-foreground">
                {description}
              </Typography.Paragraph>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </section>
      <div className="space-y-4 sm:space-y-6">{children}</div>
    </div>
  );
}
