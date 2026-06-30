import { SearchBar } from '@/components/common/SearchBar';
import { useI18n } from '@/hooks/useI18n';

export function GlobalSearchBar() {
  const { t } = useI18n();
  return <SearchBar placeholder={t('search.placeholder')} compact />;
}
