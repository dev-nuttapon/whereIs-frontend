import type { HTMLAttributes } from 'react';
import { Tag as AntTag } from 'antd';
import { cn } from '@/lib/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

const badgeVariants = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border bg-transparent text-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <AntTag
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', className)}
      color={variant === 'destructive' ? 'red' : variant === 'default' ? 'blue' : undefined}
      {...props}
    />
  );
}
