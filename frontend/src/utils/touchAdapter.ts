// touchAdapter.ts
// Translates TouchEvents into synthetic pointer events for the Konva Stage
// and provides pinch-to-zoom detection.

/**
 * Returns the first touch as a { clientX, clientY } object.
 */
export function getTouchPointer(e: TouchEvent): { clientX: number; clientY: number } | null {
  if (!e.touches || e.touches.length === 0) return null;
  return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
}

/**
 * Detects a pinch gesture from a TouchList with 2+ fingers.
 * Returns the pinch distance and center point.
 */
export interface PinchState {
  distance: number;
  centerX: number;
  centerY: number;
}

export function getPinchState(touches: TouchList): PinchState | null {
  if (touches.length < 2) return null;
  const t1 = touches[0];
  const t2 = touches[1];
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return {
    distance: Math.sqrt(dx * dx + dy * dy),
    centerX: (t1.clientX + t2.clientX) / 2,
    centerY: (t1.clientY + t2.clientY) / 2,
  };
}
