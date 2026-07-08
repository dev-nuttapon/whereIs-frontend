import type { HTMLAttributes, ReactNode } from 'react';
import { Modal as AntModal } from 'antd';
import { cn } from '@/lib/cn';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  return (
    <AntModal
      open={open}
      onCancel={() => onOpenChange?.(false)}
      footer={null}
      centered
      destroyOnClose
      styles={{
        body: { padding: 0 },
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
        'w-full max-w-lg rounded-3xl border border-border/70 bg-card/95 p-6 shadow-none backdrop-blur-xl',
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
  return <div className={cn('mt-6 flex items-center justify-end gap-2', className)} {...props} />;
}
