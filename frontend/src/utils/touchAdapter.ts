// touchAdapter.ts
// Translates TouchEvents into pointer coordinates and computes pinch-to-zoom transforms.

export interface PinchState {
  distance: number;
  centerX: number;
  centerY: number;
}

export interface PinchTransformResult {
  scale: number;
  stagePos: { x: number; y: number };
}

/**
 * Returns the first touch as a { clientX, clientY } object.
 */
export function getTouchPointer(e: TouchEvent): { clientX: number; clientY: number } | null {
  if (!e.touches || e.touches.length === 0) return null;
  return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
}

/**
 * Detects a pinch gesture from a TouchList with 2+ fingers.
 * Returns the pinch distance and midpoint screen coordinates.
 */
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

/**
 * Computes new zoom scale and stage translation anchored around the pinch midpoint.
 */
export function computePinchTransform(
  prevPinch: PinchState,
  nextPinch: PinchState,
  currentScale: number,
  currentPos: { x: number; y: number },
  containerRect: { left: number; top: number },
  minScale = 0.25,
  maxScale = 4,
): PinchTransformResult {
  if (prevPinch.distance <= 0 || nextPinch.distance <= 0 || currentScale <= 0) {
    return { scale: currentScale, stagePos: currentPos };
  }

  const ratio = nextPinch.distance / prevPinch.distance;
  const nextScale = Math.min(Math.max(currentScale * ratio, minScale), maxScale);

  const prevCenterX = prevPinch.centerX - containerRect.left;
  const prevCenterY = prevPinch.centerY - containerRect.top;
  const nextCenterX = nextPinch.centerX - containerRect.left;
  const nextCenterY = nextPinch.centerY - containerRect.top;

  const worldX = (prevCenterX - currentPos.x) / currentScale;
  const worldY = (prevCenterY - currentPos.y) / currentScale;

  return {
    scale: nextScale,
    stagePos: {
      x: nextCenterX - worldX * nextScale,
      y: nextCenterY - worldY * nextScale,
    },
  };
}
