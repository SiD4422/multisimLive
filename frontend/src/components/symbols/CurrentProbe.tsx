import { Group, Circle, Text, Path, Rect } from 'react-konva';
import type { Point } from '../../store/useSchematicStore';
import { useSchematicStore } from '../../store/useSchematicStore';

interface CurrentProbeProps {
  id: string;
  position: Point;
}

export const CurrentProbe: React.FC<CurrentProbeProps> = ({ id, position }) => {
  const { isSimulating, simulationBuffer, playbackTime, selectedProbeId, setSelectedProbe, updateProbePosition } = useSchematicStore();
  
  // ngspice outputs branch current for a voltage source "V_PROBE_PR2" as "v_probe_pr2#branch"
  const idLower = id.toLowerCase();
  const currentKey1 = `v_probe_${idLower}#branch`;   // most common ngspice format
  const currentKey2 = `i(v_probe_${idLower})`;        // alternative format
  const currentKey3 = `v_probe_${id}#branch`;          // uppercase id variant
  
  let currentDisplay = "A: --";
  
  if (simulationBuffer && simulationBuffer.length > 0) {
    const activeData = simulationBuffer.filter((row: any) => row.time <= playbackTime);
    const lastPoint = activeData.length > 0 ? activeData[activeData.length - 1] : simulationBuffer[0];
    
    // Try all key variants
    const val = lastPoint[currentKey1] ?? lastPoint[currentKey2] ?? lastPoint[currentKey3];
    if (val !== undefined) {
      // Show absolute value of current with correct unit
      const absVal = Math.abs(val);
      if (absVal === 0) {
        currentDisplay = `A: 0.000 A`;
      } else if (absVal >= 1 || absVal === 0) {
        currentDisplay = `A: ${val.toFixed(4)} A`;
      } else if (absVal >= 0.001) {
        currentDisplay = `A: ${(val * 1000).toFixed(3)} mA`;
      } else {
        currentDisplay = `A: ${val.toExponential(3)} A`;
      }
    } else {
      // Debug: log all available keys so we can see what ngspice actually returned
      console.log('[CurrentProbe] Available keys:', Object.keys(lastPoint), 'Looking for:', currentKey1);
    }
  }

  const isSelected = selectedProbeId === id;

  const handleDragEnd = (e: any) => {
    const x = Math.round(e.target.x() / 10) * 10;
    const y = Math.round(e.target.y() / 10) * 10;
    e.target.position({ x, y });
    updateProbePosition(id, { x, y });
  };

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragEnd={handleDragEnd}
      onMouseDown={(e) => {
        e.cancelBubble = true;
        setSelectedProbe(id);
      }}
    >
      {/* Selection Box */}
      {isSelected && (
        <Rect
          x={-38}
          y={-58}
          width={76}
          height={60}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[4, 4]}
        />
      )}
      
      {/* Probe pointer (Anchor Arrow) */}
      <Path
        data="M 0 0 L -10 -20 L 10 -20 Z"
        fill="#10b981"
        stroke="#047857"
        strokeWidth={1}
      />
      
      {/* Value Box (Matches VoltageProbe but offset for the circle) */}
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
        text={currentDisplay}
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
