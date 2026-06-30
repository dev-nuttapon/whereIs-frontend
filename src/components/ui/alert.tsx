import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const alertVariants = {
  default: 'border-border bg-card text-card-foreground',
  destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
};

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return <div className={cn('rounded-lg border p-4 text-sm', alertVariants[variant], className)} {...props} />;
}

export function AlertTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('mb-1 font-semibold leading-none tracking-tight', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-sm opacity-90', className)} {...props} />;
}
