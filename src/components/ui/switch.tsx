import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2', className)}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="relative h-6 w-11 rounded-full bg-muted transition peer-checked:bg-primary">
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-background transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

