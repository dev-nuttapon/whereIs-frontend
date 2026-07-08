import { cloneElement, forwardRef, isValidElement } from 'react';
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { Button as AntButton, type ButtonProps as AntButtonProps } from 'antd';
import { cn } from '@/lib/cn';

export interface ButtonProps extends Omit<AntButtonProps, 'type' | 'size' | 'children' | 'danger' | 'shape' | 'variant'> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  asChild?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  className,
  variant = 'default',
  size = 'md',
  children,
  type = 'button',
  asChild = false,
  ...props
}, ref) {
  const antType: AntButtonProps['type'] = variant === 'default' ? 'primary' : variant === 'destructive' ? 'primary' : 'default';
  const danger = variant === 'destructive';
  const shape = 'round';

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: cn(
        'ant-btn ant-btn-default inline-flex items-center justify-center gap-2 font-medium transition-colors',
        variant === 'default' ? 'ant-btn-primary' : '',
        variant === 'secondary' ? 'ant-btn-default' : '',
        variant === 'outline' ? 'ant-btn-default ant-btn-outlined' : '',
        variant === 'ghost' ? 'ant-btn-text' : '',
        variant === 'destructive' ? 'ant-btn-primary ant-btn-dangerous' : '',
        size === 'sm' ? 'ant-btn-sm' : '',
        size === 'lg' ? 'ant-btn-lg' : '',
        'rounded-full',
        className,
        child.props.className,
      ),
    });
  }

  return (
    <AntButton
      ref={ref}
      htmlType={type}
      type={antType}
      danger={danger}
      shape={shape}
      size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'middle'}
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </AntButton>
  );
});
