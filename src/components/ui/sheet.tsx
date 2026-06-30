import type { ReactNode } from 'react';

export function Sheet({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SheetContent({ children }: { children: ReactNode }) {
  return <div className="fixed inset-y-0 right-0 z-50 w-80 border-l border-border bg-background p-4 shadow-xl">{children}</div>;
}
