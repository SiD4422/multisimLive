import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Group, Path, Rect, Circle, Line, Text } from 'react-konva';
import type { SchematicComponent } from '../../store/useSchematicStore';
import symbolsData from '../../utils/kicad_symbols.json';

interface KiCadSymbolProps {
  component: SchematicComponent;
  symbolName: string;
  selected?: boolean;
  onSelect?: () => void;
  onDragMove: (e: any) => void;
  onDragEnd: (e: any) => void;
  onNodeClick: (e: any, pos: { x: number, y: number }) => void;
}

const SCALE = 0.2; // 50 units = 10px (half a grid square)

export default function KiCadSymbol({ component, symbolName, selected, onSelect, onDragMove, onDragEnd, onNodeClick }: KiCadSymbolProps) {
  // @ts-ignore
  const symDef = symbolsData[symbolName];
  if (!symDef) return null;

  const strokeColor = selected ? "#3b82f6" : "#1e3a8a";

  return (
    <Group
      x={component.position.x}
      y={component.position.y}
      draggable
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      rotation={component.rotation || 0}
      onMouseDown={(e) => {
        if (onSelect) onSelect();
      }}
    >
      {/* Invisible hit box */}
      <Rect x={-40} y={-40} width={80} height={80} fill="transparent" />

      {symDef.drawings.map((draw: any, i: number) => {
        if (draw.type === 'rect') {
          const w = Math.abs(draw.x2 - draw.x1) * SCALE;
          const h = Math.abs(draw.y2 - draw.y1) * SCALE;
          const x = Math.min(draw.x1, draw.x2) * SCALE;
          // KiCad Y is inverted compared to screen coordinates
          const y = -Math.max(draw.y1, draw.y2) * SCALE;
          return (
            <Rect 
              key={`rect-${i}`} 
              x={x} y={y} width={w} height={h} 
              stroke={strokeColor} strokeWidth={2} 
              fill={draw.fill === 'F' ? strokeColor : 'transparent'} 
            />
          );
        }
        if (draw.type === 'poly') {
          const flatPoints = draw.points.map((p: number, idx: number) => idx % 2 === 0 ? p * SCALE : -p * SCALE);
          return (
            <Line 
              key={`poly-${i}`} 
              points={flatPoints} 
              stroke={strokeColor} strokeWidth={2} 
              closed={draw.fill === 'f'}
              fill={draw.fill === 'F' ? strokeColor : 'transparent'} 
            />
          );
        }
        if (draw.type === 'circle') {
          return (
            <Circle 
              key={`circle-${i}`} 
              x={draw.x * SCALE} y={-draw.y * SCALE} 
              radius={draw.r * SCALE} 
              stroke={strokeColor} strokeWidth={2} 
              fill={draw.fill === 'F' ? strokeColor : 'transparent'} 
            />
          );
        }
        return null;
      })}

      {symDef.pins.map((pin: any, i: number) => {
        const px = pin.x * SCALE;
        const py = -pin.y * SCALE;
        const len = pin.length * SCALE;
        let linePoints: number[] = [];
        let nodeX = px;
        let nodeY = py;

        if (pin.orientation === 'U') {
          linePoints = [px, py, px, py - len];
          nodeY = py - len;
        } else if (pin.orientation === 'D') {
          linePoints = [px, py, px, py + len];
          nodeY = py + len;
        } else if (pin.orientation === 'L') {
          linePoints = [px, py, px - len, py];
          nodeX = px - len;
        } else if (pin.orientation === 'R') {
          linePoints = [px, py, px + len, py];
          nodeX = px + len;
        }

        return (
          <React.Fragment key={`pin-${i}`}>
            <Line points={linePoints} stroke={strokeColor} strokeWidth={2} />
            <Circle 
              x={nodeX} y={nodeY} radius={4} fill="#fff" stroke={strokeColor} strokeWidth={1.5} hitStrokeWidth={15}
              onMouseDown={(e) => { 
                e.cancelBubble = true; 
                // We must apply rotation matrix to node point before sending it to SchematicStore
                const rad = (component.rotation || 0) * Math.PI / 180;
                const rotX = nodeX * Math.cos(rad) - nodeY * Math.sin(rad);
                const rotY = nodeX * Math.sin(rad) + nodeY * Math.cos(rad);
                onNodeClick(e, { x: component.position.x + rotX, y: component.position.y + rotY }); 
              }}
              onMouseEnter={(e) => { e.target.getStage()!.container().style.cursor = 'crosshair'; (e.target as any).fill('#e5e7eb'); }}
              onMouseLeave={(e) => { e.target.getStage()!.container().style.cursor = 'default'; (e.target as any).fill('#fff'); }}
            />
          </React.Fragment>
        );
      })}

      {/* Labels — counter-rotated and repositioned so they never overlap the symbol */}
      {(() => {
        const rot = component.rotation || 0;
        const rad = rot * Math.PI / 180;
        const cos = Math.cos(-rad);
        const sin = Math.sin(-rad);

        // World-space anchor: always place labels to the bottom-right of component
        // These are world-space offsets from component center
        const idWorldX = 36;
        const idWorldY = -28;
        const valWorldX = 36;
        const valWorldY = -12;

        // Rotate the world-space offset into the component's LOCAL space
        // (because the Text is inside the rotated Group, so we must undo the group rotation)
        const idLocalX  = idWorldX  * cos - idWorldY  * sin;
        const idLocalY  = idWorldX  * sin + idWorldY  * cos;
        const valLocalX = valWorldX * cos - valWorldY * sin;
        const valLocalY = valWorldX * sin + valWorldY * cos;

        return (
          <>
            <Text
              text={component.id}
              x={idLocalX} y={idLocalY}
              fontSize={13} fontFamily="Inter" fill="#111" fontStyle="bold"
              rotation={-rot}
            />
            <Text
              text={component.value || symbolName}
              x={valLocalX} y={valLocalY}
              fontSize={12} fontFamily="Inter" fill="#666"
              rotation={-rot}
            />
          </>
        );
      })()}
    </Group>
  );
}
