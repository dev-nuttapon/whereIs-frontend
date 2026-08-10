export function isGenericContainerTypeLabel(typeLabel?: string | null) {
  const normalized = typeLabel?.trim().toLowerCase();
  return !normalized || normalized === 'container' || normalized === 'คอนเทนเนอร์';
}

export function formatContainerTypeLabel(typeLabel?: string | null, fallback = 'คอนเทนเนอร์') {
  if (isGenericContainerTypeLabel(typeLabel)) {
    return fallback;
  }

  return typeLabel?.trim() || fallback;
}
