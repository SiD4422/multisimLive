import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { computePinchTransform, getPinchState, getTouchPointer } from '../touchAdapter';

function makeTouchList(points: Array<{ clientX: number; clientY: number }>): TouchList {
  const list = points.map((p, idx) => ({ identifier: idx, ...p })) as unknown as TouchList;
  Object.defineProperty(list, 'length', { value: points.length });
  return list;
}

describe('Phase 3.3: Mobile Touch, Pinch-to-Zoom & Responsive Simulator', () => {
  it('extracts single touch pointer and returns null on empty TouchList', () => {
    expect(getTouchPointer({ touches: makeTouchList([]) } as unknown as TouchEvent)).toBeNull();
    expect(
      getTouchPointer({ touches: makeTouchList([{ clientX: 120, clientY: 240 }]) } as unknown as TouchEvent),
    ).toEqual({ clientX: 120, clientY: 240 });
  });

  it('computes distance and center midpoint for 2-finger pinch', () => {
    expect(getPinchState(makeTouchList([{ clientX: 10, clientY: 20 }]))).toBeNull();
    const pinch = getPinchState(
      makeTouchList([
        { clientX: 100, clientY: 100 },
        { clientX: 160, clientY: 180 },
      ]),
    );
    expect(pinch).toEqual({ distance: 100, centerX: 130, centerY: 140 });
  });

  it('anchors world coordinate under the pinch midpoint during zoom and respects scale bounds', () => {
    const prev = { distance: 100, centerX: 250, centerY: 200 };
    const next = { distance: 200, centerX: 250, centerY: 200 };
    const rect = { left: 50, top: 40 };
    const startScale = 1.0;
    const startPos = { x: 20, y: -10 };

    const result = computePinchTransform(prev, next, startScale, startPos, rect, 0.25, 4);
    expect(result.scale).toBeCloseTo(2.0, 5);

    // World point directly under pinch center must stay invariant in screen space
    const worldXBefore = (prev.centerX - rect.left - startPos.x) / startScale;
    const worldYBefore = (prev.centerY - rect.top - startPos.y) / startScale;
    const screenXAfter = worldXBefore * result.scale + result.stagePos.x;
    const screenYAfter = worldYBefore * result.scale + result.stagePos.y;
    expect(screenXAfter).toBeCloseTo(next.centerX - rect.left, 5);
    expect(screenYAfter).toBeCloseTo(next.centerY - rect.top, 5);

    // Clamp at maxScale (4) and minScale (0.25)
    const zoomedMax = computePinchTransform(
      { distance: 50, centerX: 150, centerY: 140 },
      { distance: 500, centerX: 150, centerY: 140 },
      2.0,
      { x: 0, y: 0 },
      rect,
      0.25,
      4,
    );
    expect(zoomedMax.scale).toBe(4);

    const zoomedMin = computePinchTransform(
      { distance: 400, centerX: 150, centerY: 140 },
      { distance: 10, centerX: 150, centerY: 140 },
      0.5,
      { x: 0, y: 0 },
      rect,
      0.25,
      4,
    );
    expect(zoomedMin.scale).toBe(0.25);
  });

  it('preserves scroll-safe touch selection and explicit drawer close in ComponentPalette', () => {
    const paletteSrc = readFileSync(resolve(__dirname, '../../components/ComponentPalette.tsx'), 'utf8');
    expect(paletteSrc).not.toMatch(/onTouchStart=\{\(e\)\s*=>\s*\{\s*e\.preventDefault\(\)/);
    expect(paletteSrc).toContain('mobile-drawer-close');
    expect(paletteSrc).toContain("touchAction: 'pan-y'");
  });

  it('renders mobile bottom action bar and keeps pinch zoom safe from Stage.draggable conflicts', () => {
    const simSrc = readFileSync(resolve(__dirname, '../../pages/Simulator.tsx'), 'utf8');
    const editorSrc = readFileSync(resolve(__dirname, '../../components/SchematicEditor.tsx'), 'utf8');
    const cssSrc = readFileSync(resolve(__dirname, '../../index.css'), 'utf8');

    expect(simSrc).toContain('className="mobile-bottom-bar"');
    expect(simSrc).toContain('window.innerWidth > 768');
    expect(editorSrc).toContain('computePinchTransform');
    expect(editorSrc).toContain('placePendingComponentAt');
    expect(editorSrc).toContain('!isPinching && !wirePoints && !pendingComponent && !touchWireStart');
    expect(cssSrc).toContain('@media (max-width: 768px)');
    expect(cssSrc).toContain('.mobile-bottom-bar');
  });
});
