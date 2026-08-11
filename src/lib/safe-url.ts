export function safeAssetUrl(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
    const url = new URL(value, origin);
    const isSameOrigin = url.origin === origin;
    const isHttps = url.protocol === 'https:';

    if (isSameOrigin || isHttps) {
      return url.href;
    }
  } catch {
    return undefined;
  }

  return undefined;
}
