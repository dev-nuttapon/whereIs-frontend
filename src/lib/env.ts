import { resolveApiBaseUrl } from '@/lib/api-base-url';

export const env = {
  apiBaseUrl: resolveApiBaseUrl(
    import.meta.env.VITE_API_BASE_URL,
    import.meta.env.MODE,
    typeof window === 'undefined' ? '' : window.location.origin,
  ),
} as const;
