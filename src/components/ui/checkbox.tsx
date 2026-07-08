import { Checkbox as AntCheckbox, type CheckboxProps as AntCheckboxProps } from 'antd';
import { cn } from '@/lib/cn';

export type CheckboxProps = AntCheckboxProps;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <AntCheckbox
      className={cn(className)}
      {...props}
    />
  );
}
