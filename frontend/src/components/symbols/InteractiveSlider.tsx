import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Group, Rect, Circle, Text, Line } from 'react-konva';

interface InteractiveSliderProps {
  min: number;
  max: number;
  value: number;
  label?: string;
  onChange: (newValue: number) => void;
  onChangeEnd?: (newValue: number) => void;
  width?: number;
}

export const InteractiveSlider: React.FC<InteractiveSliderProps> = ({
  min,
  max,
  value,
  label,
  onChange,
  onChangeEnd,
  width = 80,
}) => {
  const trackHeight = 4;
  const knobRadius = 8;
  const trackY = 0;
  const trackX = knobRadius;
  const trackWidth = width - knobRadius * 2;
  const isDraggingRef = useRef(false);

  // Map value to x position on the track
  const valueToX = (v: number) => {
    const clamped = Math.max(min, Math.min(max, v));
    return trackX + ((clamped - min) / (max - min)) * trackWidth;
  };

  const xToValue = (x: number) => {
    const ratio = (x - trackX) / trackWidth;
    const rawVal = min + ratio * (max - min);
    // Round to 2 significant figures
    const clamped = Math.max(min, Math.min(max, rawVal));
    return parseFloat(clamped.toPrecision(3));
  };

  const knobX = valueToX(value);

  // Format value nicely with engineering suffixes
  const formatVal = (v: number) => {
    if (v >= 1e6) return `${(v / 1e6).toPrecision(3)}M`;
    if (v >= 1e3) return `${(v / 1e3).toPrecision(3)}k`;
    if (v >= 1) return `${v.toPrecision(3)}`;
    if (v >= 1e-3) return `${(v * 1e3).toPrecision(3)}m`;
    if (v >= 1e-6) return `${(v * 1e6).toPrecision(3)}µ`;
    return `${v.toPrecision(3)}`;
  };

  const handleDragMove = (e: any) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    const group = e.target.getParent()?.getParent();
    if (!group) return;
    const transform = group.getAbsoluteTransform().copy().invert();
    const localPos = transform.point(pointerPos);

    const newValue = xToValue(localPos.x);
    onChange(newValue);

    // Keep knob in place visually (don't let Konva move it freely)
    e.target.x(valueToX(newValue));
    e.target.y(trackY);
  };

  const handleDragEnd = (e: any) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    const group = e.target.getParent()?.getParent();
    if (!group) return;
    const transform = group.getAbsoluteTransform().copy().invert();
    const localPos = transform.point(pointerPos);

    const newValue = xToValue(localPos.x);
    onChangeEnd?.(newValue);

    e.target.x(valueToX(newValue));
    e.target.y(trackY);
  };

  return (
    <Group y={12}>
      {/* Track background */}
      <Rect
        x={trackX}
        y={trackY - trackHeight / 2}
        width={trackWidth}
        height={trackHeight}
        fill="#d1d5db"
        cornerRadius={2}
      />

      {/* Track filled portion */}
      <Rect
        x={trackX}
        y={trackY - trackHeight / 2}
        width={knobX - trackX}
        height={trackHeight}
        fill="#10b981"
        cornerRadius={2}
      />

      {/* Min/Max tick marks */}
      <Line points={[trackX, trackY - 6, trackX, trackY + 6]} stroke="#9ca3af" strokeWidth={1} />
      <Line points={[trackX + trackWidth, trackY - 6, trackX + trackWidth, trackY + 6]} stroke="#9ca3af" strokeWidth={1} />

      {/* Draggable Knob */}
      <Circle
        x={knobX}
        y={trackY}
        radius={knobRadius}
        fill="#10b981"
        stroke="#047857"
        strokeWidth={2}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={4}
        shadowOffsetY={2}
        draggable
        dragBoundFunc={(pos) => {
          // Constrain dragging to horizontal only within parent
          return { x: pos.x, y: (pos as any)._origin?.y ?? pos.y };
        }}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      />

      {/* Value label */}
      <Text
        x={0}
        y={knobRadius + 4}
        width={width}
        text={label ? `${label}: ${formatVal(value)}` : formatVal(value)}
        fontSize={9}
        fontFamily="monospace"
        fill="#047857"
        align="center"
        fontStyle="bold"
      />
    </Group>
  );
};
