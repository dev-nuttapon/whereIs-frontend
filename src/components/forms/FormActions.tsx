import type { ReactNode } from 'react';

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-3 pt-2">{children}</div>;
}

