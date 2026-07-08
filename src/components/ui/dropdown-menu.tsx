import type { ReactNode } from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';

export interface DropdownMenuProps {
  trigger: ReactNode;
  items: NonNullable<MenuProps['items']>;
  children?: ReactNode;
}

export function DropdownMenu({ trigger, items, children }: DropdownMenuProps) {
  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <span>{trigger ?? children}</span>
    </Dropdown>
  );
}

export function DropdownMenuTrigger({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function DropdownMenuContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function DropdownMenuItem({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
