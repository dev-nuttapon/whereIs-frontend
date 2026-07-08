import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Input } from 'antd';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { SearchIcon } from '@/components/ui/icons';

export interface SearchBarProps {
  placeholder?: string;
  compact?: boolean;
}

export function SearchBar({ placeholder, compact = false }: SearchBarProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    setValue(searchParams.get('q') ?? '');
  }, [searchParams]);

  const wsId = params.wsId ?? 'ws-warehouse';

  return (
    <div className="relative">
      <Input
        className="w-full"
        size={compact ? 'large' : 'large'}
        prefix={compact ? null : <SearchIcon className="h-4 w-4 text-muted-foreground" />}
        value={value}
        placeholder={placeholder ?? t('search.placeholder')}
        allowClear
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            navigate({
              pathname: ROUTES.workspaceSearch(wsId),
              search: value ? `?q=${encodeURIComponent(value)}` : '',
            });
          }
        }}
      />
    </div>
  );
}
