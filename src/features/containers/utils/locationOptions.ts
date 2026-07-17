import type { Container, Location, Site } from '@/types/domain.types';

function sortLocations(left: Location, right: Location) {
  return left.sortOrder - right.sortOrder || left.name.localeCompare(right.name);
}

export function buildLocationLabelMap(locations: Location[], sites: Site[]) {
  const siteNameById = new Map(sites.map((site) => [site.id, site.name] as const));
  const grouped = new Map<string | null, Location[]>();

  for (const location of locations) {
    const key = location.parentLocationId ?? null;
    const bucket = grouped.get(key) ?? [];
    bucket.push(location);
    grouped.set(key, bucket);
  }

  const labels = new Map<string, string>();

  const visit = (parentId: string | null, depth: number, siteId?: string) => {
    const children = (grouped.get(parentId) ?? []).slice().sort(sortLocations);
    for (const location of children) {
      const resolvedSiteName = siteNameById.get(location.siteId) ?? siteId ?? location.siteId;
      const prefix = '— '.repeat(depth);
      labels.set(location.id, `${resolvedSiteName} / ${prefix}${location.name}${location.code ? ` (${location.code})` : ''}`);
      visit(location.id, depth + 1, location.siteId);
    }
  };

  visit(null, 0);
  return labels;
}

export function buildLocationOptions(locations: Location[], sites: Site[]) {
  const labels = buildLocationLabelMap(locations, sites);
  return Array.from(labels.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

function sortContainers(left: Container, right: Container) {
  return left.name.localeCompare(right.name) || left.createdAt.localeCompare(right.createdAt);
}

export function buildContainerLabelMap(containers: Container[]) {
  const grouped = new Map<string | null, Container[]>();

  for (const container of containers) {
    const key = container.parentId ?? null;
    const bucket = grouped.get(key) ?? [];
    bucket.push(container);
    grouped.set(key, bucket);
  }

  const labels = new Map<string, string>();

  const visit = (parentId: string | null, depth: number) => {
    const children = (grouped.get(parentId) ?? []).slice().sort(sortContainers);
    for (const container of children) {
      const prefix = '— '.repeat(depth);
      labels.set(container.id, `${prefix}${container.name}${container.code ? ` (${container.code})` : ''}`);
      visit(container.id, depth + 1);
    }
  };

  visit(null, 0);
  return labels;
}

export function buildContainerOptions(containers: Container[]) {
  const labels = buildContainerLabelMap(containers);
  return Array.from(labels.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label));
}
