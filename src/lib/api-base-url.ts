export function resolveApiBaseUrl(
  configuredValue: string | undefined,
  mode: string,
  origin: string,
): string {
  const value = configuredValue?.trim() || '/api/v1';

  if (value.startsWith('//')) {
    throw new Error('Production API URL must use HTTPS and must not use protocol-relative URLs.');
  }

  if (value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('VITE_API_BASE_URL must be a valid URL or same-origin path.');
  }

  if (parsed.username || parsed.password || parsed.protocol !== 'https:') {
    const isLocalhost = parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
    if (mode !== 'production' && isLocalhost && !parsed.username && !parsed.password) {
      return parsed.toString().replace(/\/$/, '');
    }
    if (mode !== 'production' && parsed.protocol === 'http:') {
      throw new Error('HTTP API URLs are allowed only for localhost during development.');
    }
    throw new Error('Production API URL must use HTTPS and must not include credentials.');
  }

  if (parsed.origin === origin) {
    return `${parsed.pathname}${parsed.search}`.replace(/\/$/, '');
  }

  return parsed.toString().replace(/\/$/, '');
}
