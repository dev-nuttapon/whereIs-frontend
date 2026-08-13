import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function FormSection({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('form-section', className)}>{children}</section>;
}

export function FormGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('form-grid', className)}>{children}</div>;
}
