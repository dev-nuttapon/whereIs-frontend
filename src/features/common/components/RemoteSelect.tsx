import { Select as AntSelect } from 'antd';
import type { SelectProps } from 'antd';
import { useRemoteOptions } from '@/features/common/hooks/useRemoteOptions';

interface RemoteSelectProps extends Omit<SelectProps, 'options' | 'onChange'> {
  wsId: string;
  resource: 'products' | 'assets' | 'stock' | 'locations' | 'containers';
  value?: string;
  onChange?: (value: string) => void;
}

export function RemoteSelect({ wsId, resource, value, onChange, ...props }: RemoteSelectProps) {
  const remote = useRemoteOptions(wsId, resource, value, props.disabled !== true);
  return <AntSelect
    {...props}
    showSearch
    filterOption={false}
    value={value || undefined}
    loading={remote.isLoading || remote.isFetching}
    options={remote.options.map((option) => ({ value: option.id, label: option.code ? `${option.label} - ${option.code}` : option.label }))}
    onSearch={remote.setSearch}
    onChange={(next) => onChange?.(String(next ?? ''))}
    onPopupScroll={(event) => {
      const element = event.currentTarget;
      if (element.scrollTop + element.clientHeight >= element.scrollHeight - 24) remote.loadNextPage();
    }}
  />;
}
