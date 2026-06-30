import type { ReactNode } from 'react';

export function DropdownMenu({ children }: { children: ReactNode }) {
  return <div className="relative inline-block">{children}</div>;
}

export function DropdownMenuTrigger({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function DropdownMenuContent({ children }: { children: ReactNode }) {
  return <div className="absolute right-0 top-full mt-2 min-w-48 rounded-md border border-border bg-background p-2 shadow-lg">{children}</div>;
}

export function DropdownMenuItem({ children }: { children: ReactNode }) {
  return <div className="cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-muted">{children}</div>;
}
