import type { ReactNode } from 'react';

export function DataTableShell({ children, minWidth = 'min-w-[760px]' }: { children: ReactNode; minWidth?: string }) {
  return <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"><div className="overflow-x-auto"><table className={`w-full ${minWidth} text-sm`}>{children}</table></div></div>;
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-muted/60 text-left text-xs font-semibold text-muted-foreground"><tr>{children}</tr></thead>;
}

export function DataTableRow({ children }: { children: ReactNode }) {
  return <tr className="border-b border-border/70 transition-colors last:border-0 hover:bg-muted/30">{children}</tr>;
}

export const dataTableCellClass = 'px-5 py-4';
