import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Group, Rect, Text, Path } from 'react-konva';
import { useSchematicStore } from '../../store/useSchematicStore';
import { getSpiceNodeForPoint } from '../../utils/netlister';

interface VoltageProbeProps {
  id: string;
  position: { x: number, y: number };
}

export const VoltageProbe: React.FC<VoltageProbeProps> = ({ id, position }) => {
  const { isSimulating, simulationBuffer, playbackTime, components, wires, selectedProbeId, setSelectedProbe } = useSchematicStore();
  
  // Calculate Spice Node at this position
  const spiceNode = React.useMemo(() => {
    return getSpiceNodeForPoint(position, components, wires);
  }, [position, components, wires]);

  let valueDisplay = "V: --";
  
  if (simulationBuffer && simulationBuffer.length > 0) {
    // Find the current point based on playbackTime
    const activeData = simulationBuffer.filter((row: any) => row.time <= playbackTime);
    const lastPoint = activeData.length > 0 ? activeData[activeData.length - 1] : simulationBuffer[0];
    
    const key1 = `v(${spiceNode})`;
    const key2 = `V(${spiceNode})`;
    if (lastPoint[key1] !== undefined) {
      const val = lastPoint[key1];
      valueDisplay = `V: ${val.toFixed(3)} V`;
    } else if (lastPoint[key2] !== undefined) {
      const val = lastPoint[key2];
      valueDisplay = `V: ${val.toFixed(3)} V`;
    } else if (spiceNode === '0') {
      valueDisplay = "V: 0.000 V";
    }
  } else if (spiceNode === '0') {
    valueDisplay = "V: 0.000 V"; // Ground is always 0
  }

  return (
    <Group 
      x={position.x} 
      y={position.y} 
      draggable
      onDragEnd={(e: any) => {
        const x = Math.round(e.target.x() / 10) * 10; // SNAP_GRID
        const y = Math.round(e.target.y() / 10) * 10;
        e.target.position({ x, y });
        useSchematicStore.getState().updateProbePosition(id, { x, y });
      }}
      onClick={(e: any) => {
        e.cancelBubble = true;
        setSelectedProbe(id);
      }}
    >
      {/* Selection Box */}
      {selectedProbeId === id && (
        <Rect
          x={-38}
          y={-48}
          width={76}
          height={50}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[4, 4]}
        />
      )}
      {/* Probe pointer */}
      <Path
        data="M 0 0 L -10 -20 L 10 -20 Z"
        fill="#10b981" // Emerald green
        stroke="#047857"
        strokeWidth={1}
      />
      {/* Value Box */}
      <Rect
        x={-35}
        y={-45}
        width={70}
        height={22}
        fill="#ecfdf5"
        stroke="#10b981"
        strokeWidth={2}
        cornerRadius={4}
        shadowColor="rgba(0,0,0,0.2)"
        shadowBlur={4}
        shadowOffsetY={2}
      />
      <Text
        x={-35}
        y={-40}
        width={70}
        text={valueDisplay}
        fontSize={11}
        fontFamily="monospace"
        fill="#065f46"
        align="center"
        fontStyle="bold"
      />
      {/* ID Label */}
      <Text
        x={-35}
        y={-60}
        width={70}
        text={id}
        fontSize={10}
        fill="#6b7280"
        align="center"
      />
    </Group>
  );
};
