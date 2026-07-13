import type { ChangeEvent, ChangeEventHandler, ComponentType, ReactNode, SelectHTMLAttributes } from 'react';
import { Select as AntSelect } from 'antd';
import { cn } from '@/lib/cn';

const AntSelectAny = AntSelect as unknown as ComponentType<Record<string, unknown>>;

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'defaultValue' | 'children' | 'size'> {
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: ReactNode;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  children?: ReactNode;
}

export function Select({ className, children, onChange, placeholder, ...props }: SelectProps) {
  const options = (Array.isArray(children) ? children : [children])
    .flat()
    .filter(Boolean)
    .map((child) => {
      if (!child || typeof child !== 'object' || !('props' in child)) {
        return null;
      }

      const option = child as { props?: { value?: string | number; children?: ReactNode; disabled?: boolean } };
      return {
        label: option.props?.children,
        value: option.props?.value,
        disabled: option.props?.disabled,
      };
    })
    .filter(Boolean) as Array<{ label: ReactNode; value?: string | number; disabled?: boolean }>;

  return (
    <AntSelectAny
      className={cn(className)}
      options={options.length > 0 ? options : undefined}
      placeholder={placeholder}
      {...(props as Record<string, unknown>)}
      onChange={(value: string | number) => {
        onChange?.({
          target: { value },
        } as ChangeEvent<HTMLSelectElement>);
      }}
    >
      {options.length > 0 ? null : children}
    </AntSelectAny>
  );
}
