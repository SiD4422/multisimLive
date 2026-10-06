import type { Point } from '../../store/useSchematicStore';

/**
 * A wire point that carries extra netlister-only flags.
 * Ammeter probes split a wire in two; the split point is marked `_isFake` so it gets a unique
 * grid node and is never merged by the T-junction scan.
 */
export type NetPoint = Point & { _isFake?: boolean; _probeId?: string };

export const isFakePoint = (p: Point): boolean => (p as NetPoint)._isFake === true;
