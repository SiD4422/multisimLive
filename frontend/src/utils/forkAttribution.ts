export interface ForkAttribution {
  sourceCircuitId: string;
  sourceName: string;
  sourceAuthor: string;
  sourceType?: 'community' | 'template';
}

export function sanitizeForkAttribution(raw: unknown): ForkAttribution | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const candidate = raw as Record<string, unknown>;
  const sourceCircuitId =
    typeof candidate.sourceCircuitId === 'string' ? candidate.sourceCircuitId.trim().slice(0, 100) : '';
  const sourceName =
    typeof candidate.sourceName === 'string' ? candidate.sourceName.trim().slice(0, 100) : '';
  if (!sourceCircuitId || !sourceName) return undefined;

  const sourceAuthor =
    typeof candidate.sourceAuthor === 'string'
      ? candidate.sourceAuthor.trim().slice(0, 50) || 'Anonymous'
      : 'Anonymous';
  const sourceType =
    candidate.sourceType === 'community' || candidate.sourceType === 'template'
      ? candidate.sourceType
      : 'community';

  return {
    sourceCircuitId,
    sourceName,
    sourceAuthor,
    sourceType,
  };
}

export function buildForkedCircuitName(originalName: string): string {
  const clean = originalName.trim() || 'Untitled Circuit';
  const suffix = ' (Fork)';
  if (clean.endsWith('(Fork)')) {
    return clean.slice(0, 100);
  }
  const maxBase = 100 - suffix.length;
  return `${clean.slice(0, maxBase)}${suffix}`;
}

export function formatForkAttributionLabel(forkedFrom: ForkAttribution): string {
  return `Forked from ${forkedFrom.sourceName}`;
}
