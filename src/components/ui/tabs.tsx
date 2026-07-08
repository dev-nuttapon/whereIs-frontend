import type { ReactNode } from 'react';
import { Tabs as AntTabs, type TabsProps as AntTabsProps } from 'antd';

export interface TabsProps extends Omit<AntTabsProps, 'items'> {
  items: NonNullable<AntTabsProps['items']>;
}

export function Tabs({ items, ...props }: TabsProps) {
  return <AntTabs items={items} {...props} />;
}

export function TabsList({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function TabsTrigger({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function TabsContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
