import type { HTMLAttributes } from 'react';
import { Alert as AntAlert } from 'antd';
import { cn } from '@/lib/cn';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const alertVariants = {
  default: 'border-border/70 bg-card/90 text-card-foreground shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]',
  destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
};

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return <AntAlert className={cn(className)} type={variant === 'destructive' ? 'error' : 'info'} showIcon {...props} />;
}

export function AlertTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('mb-1 font-semibold leading-none tracking-tight', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-sm opacity-90', className)} {...props} />;
}
