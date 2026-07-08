import { Switch as AntSwitch, type SwitchProps as AntSwitchProps } from 'antd';
import { cn } from '@/lib/cn';

export type SwitchProps = AntSwitchProps;

export function Switch({ className, ...props }: SwitchProps) {
  return <AntSwitch className={cn(className)} {...props} />;
}
