import type { ComponentProps } from 'react';
import { Input as AntInput } from 'antd';
import { cn } from '@/lib/cn';

export interface InputProps extends ComponentProps<typeof AntInput> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <AntInput
      className={cn(className)}
      {...props}
    />
  );
}
