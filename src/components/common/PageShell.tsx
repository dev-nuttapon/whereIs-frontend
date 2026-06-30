import type { ReactNode } from 'react';
import { CardDescription, CardTitle } from '@/components/ui/card';
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
      <section className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl tracking-tight sm:text-2xl">{title}</CardTitle>
            {description ? <CardDescription className="max-w-2xl text-sm">{description}</CardDescription> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </section>
      <div className="space-y-4 sm:space-y-6">{children}</div>
    </div>
  );
}
