import type { ReactNode } from 'react';
import { Tooltip as AntTooltip } from 'antd';

export interface TooltipProps {
  title: ReactNode;
  children: ReactNode;
}

export function Tooltip({ title, children }: TooltipProps) {
  return <AntTooltip title={title}>{children}</AntTooltip>;
}
