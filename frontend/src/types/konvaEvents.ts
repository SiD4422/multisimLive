// Shared Konva event aliases so handlers don't need `(e: any)`.
import type { KonvaEventObject } from 'konva/lib/Node';

export type DragEvt = KonvaEventObject<DragEvent>;
export type MouseEvt = KonvaEventObject<MouseEvent>;
export type TouchEvt = KonvaEventObject<TouchEvent>;
export type WheelEvt = KonvaEventObject<WheelEvent>;
/** Mouse or touch pointer event (stage-level handlers receive both). */
export type PointerEvt = KonvaEventObject<MouseEvent | TouchEvent>;
