import { Group, Line, Text, Circle } from 'react-konva';
import type { SchematicComponent } from '../../store/useSchematicStore';

interface GroundProps {
  component: SchematicComponent;
  selected?: boolean;
  onSelect?: () => void;
  onDragMove: (e: any) => void;
  onDragEnd: (e: any) => void;
  onNodeClick: (e: any, pos: { x: number, y: number }) => void;
}

export default function Ground({ component, selected, onSelect, onDragMove, onDragEnd, onNodeClick }: GroundProps) {
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
      <Line points={[0, 0, 0, 15]} stroke={strokeColor} strokeWidth={2} />
      <Line points={[-15, 15, 15, 15]} stroke={strokeColor} strokeWidth={2} />
      <Line points={[-10, 20, 10, 20]} stroke={strokeColor} strokeWidth={2} />
      <Line points={[-5, 25, 5, 25]} stroke={strokeColor} strokeWidth={2} />
      <Circle 
        x={0} y={0} radius={4} fill="#fff" stroke={strokeColor} strokeWidth={1.5} hitStrokeWidth={15}
        onMouseDown={(e) => { e.cancelBubble = true; onNodeClick(e, { x: component.position.x, y: component.position.y }); }}
        onMouseEnter={(e) => { e.target.getStage()!.container().style.cursor = 'crosshair'; (e.target as any).fill('#e5e7eb'); }}
        onMouseLeave={(e) => { e.target.getStage()!.container().style.cursor = 'default'; (e.target as any).fill('#fff'); }}
      />
      <Text text="0" x={10} y={-10} fontSize={12} fontFamily="Inter" fill="#666" />
    </Group>
  );
}
