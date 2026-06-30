import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
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
      {compact ? null : <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />}
      <Input
        className={compact ? 'h-14 rounded-full border-border/70 bg-card/80 px-5 text-[0.95rem] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_1px_4px_rgba(15,23,42,0.08)] backdrop-blur placeholder:text-muted-foreground/90' : 'h-14 rounded-full border-border/70 bg-card/80 pl-10 pr-4 text-[0.95rem] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_1px_4px_rgba(15,23,42,0.08)] backdrop-blur placeholder:text-muted-foreground/90'}
        value={value}
        placeholder={placeholder ?? t('search.placeholder')}
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
