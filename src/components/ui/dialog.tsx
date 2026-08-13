import type { HTMLAttributes, ReactNode } from 'react';
import { Modal as AntModal } from 'antd';
import { cn } from '@/lib/cn';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  size?: 'compact' | 'form' | 'wide';
}

export function Dialog({ open = false, onOpenChange, children, size = 'form' }: DialogProps) {
  const width = size === 'compact'
    ? 'min(32rem, calc(100vw - 2rem))'
    : size === 'wide'
      ? 'min(60rem, calc(100vw - 2rem))'
      : 'min(46rem, calc(100vw - 2rem))';

  return (
    <AntModal
      open={open}
      onCancel={() => onOpenChange?.(false)}
      footer={null}
      centered
      destroyOnHidden
      width={width}
      styles={{
        body: { maxHeight: 'min(78vh, 48rem)', overflowY: 'auto', padding: 0 },
        mask: { backdropFilter: 'blur(4px)' },
      }}
    >
      {children}
    </AntModal>
  );
}

export function DialogContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'w-full rounded-2xl border-0 bg-card/95 p-5 shadow-[0_24px_70px_-48px_rgb(15_23_42_/_0.7)] backdrop-blur-xl sm:rounded-3xl sm:p-6',
        className,
      )}
      {...props}
    />
  );
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 space-y-2', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold leading-tight tracking-tight sm:text-xl', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:items-center sm:justify-end', className)} {...props} />;
}
