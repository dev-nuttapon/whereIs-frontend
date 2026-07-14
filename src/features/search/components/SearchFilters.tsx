import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FilterIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';

export interface SearchFilterValues {
  q: string;
  status: string;
  containerId: string;
  kind: string;
}

interface SearchFiltersProps {
  value: SearchFilterValues;
  onChange: (next: SearchFilterValues) => void;
  containerOptions: Array<{ value: string; label: string }>;
}

export function SearchFilters({ value, onChange, containerOptions }: SearchFiltersProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <FilterIcon className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{t('search.filtersTitle', 'Filters')}</p>
          <p className="text-xs text-muted-foreground">{t('search.filtersDescription', 'Narrow results by type, status, and container.')}</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <Input
          value={value.q}
          onChange={(event) => onChange({ ...value, q: event.target.value })}
          placeholder={t('search.placeholder')}
          className="rounded-full"
          allowClear
        />

        <Select value={value.kind} onChange={(event) => onChange({ ...value, kind: event.target.value })} className="w-full">
          <option value="">{t('search.all', 'All')}</option>
          <option value="single">{t('items.kind.single', 'Individual Item')}</option>
          <option value="stock">{t('items.kind.stock', 'Quantity Item')}</option>
        </Select>

        <Select value={value.status} onChange={(event) => onChange({ ...value, status: event.target.value })} className="w-full">
          <option value="">{t('search.all', 'All')}</option>
          <option value="stored">{t('items.status.stored', 'Stored')}</option>
          <option value="taken_out">{t('items.status.taken_out', 'Taken out')}</option>
          <option value="reserved">{t('items.status.reserved', 'Reserved')}</option>
          <option value="missing">{t('items.status.missing', 'Missing')}</option>
          <option value="repair">{t('items.status.repair', 'Repair')}</option>
          <option value="disposed">{t('items.status.disposed', 'Disposed')}</option>
        </Select>

        <Select value={value.containerId} onChange={(event) => onChange({ ...value, containerId: event.target.value })} className="w-full">
          <option value="">{t('search.container', 'Container')}</option>
          {containerOptions.map((container) => (
            <option key={container.value} value={container.value}>
              {container.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
