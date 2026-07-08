import type { TextareaHTMLAttributes } from 'react';
import { Input as AntInput } from 'antd';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <AntInput.TextArea
      className={cn(className)}
      {...props}
    />
  );
}
