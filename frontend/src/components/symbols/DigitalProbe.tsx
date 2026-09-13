import React from 'react';
import { Group, Rect, Text, Path, Circle } from 'react-konva';
import { useSchematicStore } from '../../store/useSchematicStore';
import { getSpiceNodeForPoint } from '../../utils/netlister';

interface DigitalProbeProps {
  id: string;
  position: { x: number, y: number };
}

export const DigitalProbe: React.FC<DigitalProbeProps> = ({ id, position }) => {
  const { isSimulating, simulationBuffer, playbackTime, components, wires, selectedProbeId, setSelectedProbe } = useSchematicStore();
  
  // Calculate Spice Node at this position
  const spiceNode = React.useMemo(() => {
    return getSpiceNodeForPoint(position, components, wires);
  }, [position, components, wires]);

  let valueDisplay = "X";
  let isHigh = false;
  
  if (simulationBuffer && simulationBuffer.length > 0) {
    const isAc = (simulationBuffer as any).__plotType === 'ac';
    
    if (isAc) {
      valueDisplay = "X";
    } else {
      // Find the current point based on playbackTime
      const activeData = simulationBuffer.filter((row: any) => row.time <= playbackTime);
      const lastPoint = activeData.length > 0 ? activeData[activeData.length - 1] : simulationBuffer[0];
      
      const key1 = `v(${spiceNode})`;
      const key2 = `V(${spiceNode})`;
      
      let val = undefined;
      if (lastPoint[key1] !== undefined) {
        val = lastPoint[key1];
      } else if (lastPoint[key2] !== undefined) {
        val = lastPoint[key2];
      } else if (spiceNode === '0') {
        val = 0;
      }
      
      if (val !== undefined) {
        isHigh = val > 2.5; // Threshold for 5V logic
        valueDisplay = isHigh ? "1" : "0";
      }
    }
  } else if (spiceNode === '0') {
    valueDisplay = "0";
    isHigh = false;
  }

  const ledColor = isHigh ? "#10b981" : "#1f2937"; // Bright green if high, dark grey if low
  const strokeColor = isHigh ? "#059669" : "#374151";

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
          x={-24}
          y={-48}
          width={48}
          height={50}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[4, 4]}
        />
      )}
      {/* Probe pointer */}
      <Path
        data="M 0 0 L -8 -15 L 8 -15 Z"
        fill={strokeColor}
        stroke={strokeColor}
        strokeWidth={1}
      />
      {/* LED Box */}
      <Circle
        x={0}
        y={-30}
        radius={12}
        fill={ledColor}
        stroke={strokeColor}
        strokeWidth={2}
        shadowColor={isHigh ? "#10b981" : "transparent"}
        shadowBlur={isHigh ? 10 : 0}
      />
      <Text
        x={-12}
        y={-36}
        width={24}
        text={valueDisplay}
        fontSize={14}
        fontFamily="monospace"
        fill="#ffffff"
        align="center"
        fontStyle="bold"
      />
      {/* ID Label */}
      <Text
        x={-25}
        y={-50}
        width={50}
        text={id}
        fontSize={10}
        fill="#6b7280"
        align="center"
      />
    </Group>
  );
};
