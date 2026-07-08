import type { HTMLAttributes } from 'react';
import { Divider as AntDivider } from 'antd';
import { cn } from '@/lib/cn';

export function Separator({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <AntDivider className={cn(className)} {...props} />;
}
