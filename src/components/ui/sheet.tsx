import type { ReactNode } from 'react';
import { Drawer } from 'antd';

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  return (
    <Drawer
      open={open}
      onClose={() => onOpenChange?.(false)}
      placement="right"
      width={320}
      styles={{ body: { padding: 16 } }}
    >
      {children}
    </Drawer>
  );
}

export function SheetContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
