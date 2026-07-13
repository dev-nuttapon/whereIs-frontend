import type { ReactNode } from 'react';

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="form-actions flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">{children}</div>;
}
