import { Group, Path, Text, Circle, Line, Rect } from 'react-konva';
import type { SchematicComponent } from '../../store/useSchematicStore';

interface SourceSymbolProps {
  component: SchematicComponent;
  selected?: boolean;
  onSelect?: () => void;
  onDragMove: (e: any) => void;
  onDragEnd: (e: any) => void;
  onNodeClick: (e: any, pos: { x: number, y: number }) => void;
}

export default function SourceSymbol({ component, selected, onSelect, onDragMove, onDragEnd, onNodeClick }: SourceSymbolProps) {
  const strokeColor = selected ? "#3b82f6" : "#1e3a8a";
  
  // Default bounds/positions
  const radius = 15;
  const centerX = 30;
  const centerY = 0;
  
  // Render inner icon based on component type
  const renderInnerIcon = () => {
    const type = component.type;
    
    // DC Voltage (+/-)
    if (type === 'DCSource') {
      return (
        <Group>
          <Line points={[centerX, -8, centerX, -2]} stroke={strokeColor} strokeWidth={2} />
          <Line points={[centerX-3, -5, centerX+3, -5]} stroke={strokeColor} strokeWidth={2} />
          <Line points={[centerX-3, 5, centerX+3, 5]} stroke={strokeColor} strokeWidth={2} />
        </Group>
      );
    }
    // AC Voltage (Sine)
    else if (type === 'ACSource' || type.includes('Phase')) {
      return (
        <Path data={`M ${centerX-8},0 Q ${centerX-4},-8 ${centerX},0 T ${centerX+8},0`} stroke={strokeColor} strokeWidth={2} fill="transparent" />
      );
    }
    // Current Sources (Arrow)
    else if (type.includes('Current')) {
      // Arrow pointing up or right depending on how it's oriented
      // For standard MultiSim, current source arrow points towards the positive terminal (right)
      return (
        <Group>
          <Line points={[centerX-8, 0, centerX+8, 0]} stroke={strokeColor} strokeWidth={2} />
          <Path data={`M ${centerX+2},-4 L ${centerX+8},0 L ${centerX+2},4`} stroke={strokeColor} strokeWidth={2} fill="transparent" />
        </Group>
      );
    }
    // Clock / Pulse (Square wave)
    else if (type === 'ClockVoltage' || type === 'PulseVoltage') {
      return (
        <Path data={`M ${centerX-8},4 L ${centerX-8},-4 L ${centerX},-4 L ${centerX},4 L ${centerX+8},4`} stroke={strokeColor} strokeWidth={2} fill="transparent" />
      );
    }
    // AM / FM (Sine wave with text)
    else if (type.includes('AM') || type.includes('FM') || type.includes('Noise') || type.includes('Chirp')) {
      return (
        <Group>
          <Path data={`M ${centerX-8},0 Q ${centerX-4},-6 ${centerX},0 T ${centerX+8},0`} stroke={strokeColor} strokeWidth={1} fill="transparent" />
          <Text text={type.replace('Voltage', '')} x={centerX-10} y={4} fontSize={8} fontFamily="Inter" fill={strokeColor} />
        </Group>
      );
    }
    // Step Voltage (Step wave)
    else if (type === 'StepVoltage') {
      return (
        <Path data={`M ${centerX-8},4 L ${centerX},4 L ${centerX},-4 L ${centerX+8},-4`} stroke={strokeColor} strokeWidth={2} fill="transparent" />
      );
    }
    
    // Fallback: Sine wave
    return <Path data={`M ${centerX-8},0 Q ${centerX-4},-8 ${centerX},0 T ${centerX+8},0`} stroke={strokeColor} strokeWidth={2} fill="transparent" />;
  };

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
      <Circle x={centerX} y={centerY} radius={radius} stroke={strokeColor} strokeWidth={2} fill="#fff" />
      <Line points={[0, 0, centerX - radius, 0]} stroke={strokeColor} strokeWidth={2} />
      <Line points={[centerX + radius, 0, 60, 0]} stroke={strokeColor} strokeWidth={2} />
      
      {renderInnerIcon()}
      
      {/* Interaction nodes (Terminals) */}
      <Circle 
        x={0} y={0} radius={4} fill="#fff" stroke={strokeColor} strokeWidth={1.5} hitStrokeWidth={15}
        onMouseDown={(e) => { 
          e.cancelBubble = true; 
          onNodeClick(e, { x: component.position.x, y: component.position.y }); 
        }}
        onMouseEnter={(e) => { e.target.getStage()!.container().style.cursor = 'crosshair'; (e.target as any).fill('#e5e7eb'); }}
        onMouseLeave={(e) => { e.target.getStage()!.container().style.cursor = 'default'; (e.target as any).fill('#fff'); }}
      />
      <Circle 
        x={60} y={0} radius={4} fill="#fff" stroke={strokeColor} strokeWidth={1.5} hitStrokeWidth={15}
        onMouseDown={(e) => { 
          e.cancelBubble = true; 
          const rad = (component.rotation || 0) * Math.PI / 180;
          const rotX = 60 * Math.cos(rad);
          const rotY = 60 * Math.sin(rad);
          onNodeClick(e, { x: component.position.x + rotX, y: component.position.y + rotY }); 
        }}
        onMouseEnter={(e) => { e.target.getStage()!.container().style.cursor = 'crosshair'; (e.target as any).fill('#e5e7eb'); }}
        onMouseLeave={(e) => { e.target.getStage()!.container().style.cursor = 'default'; (e.target as any).fill('#fff'); }}
      />
      
      {/* Labels — positioned clear of the circle body (radius=15 at centerX=30) */}
      {(() => {
        // Build clean reference designator from the raw id
        const rawId = component.id;
        const type = component.type;
        const prefixMap: Record<string, string> = {
          DCSource: 'V', ACSource: 'V', ClockVoltage: 'V', PulseVoltage: 'V',
          StepVoltage: 'V', AMVoltage: 'V', FMVoltage: 'V', NoiseVoltage: 'V', ChirpVoltage: 'V',
          DCCurrentSource: 'I', ACCurrentSource: 'I',
        };
        const prefix = prefixMap[type] || 'V';
        const digits = rawId.replace(/\D/g, '') || '1';
        const refDes = /^[a-zA-Z]{1,3}\d+$/.test(rawId)
          ? rawId.toUpperCase()
          : `${prefix}${digits}`;
        const valText = component.value || '';

        // Label sits above circle top (centerY - radius - gap)
        // circle top ≈ y = -15, so label at y = -15 - 16 = -31
        const labelY = -31;
        const valueY = centerY + radius + 7;  // just below circle bottom

        return (
          <>
            {rawId !== 'preview' && (
              <Group x={5} y={labelY}>
                <Rect x={-3} y={-1} width={refDes.length * 8 + 6} height={15}
                  fill="rgba(255,255,255,0.85)" cornerRadius={3} listening={false} />
                <Text text={refDes} x={0} y={0} fontSize={13}
                  fontFamily="Inter, Arial, sans-serif" fill="#1a1a2e" fontStyle="bold" />
              </Group>
            )}
            {valText.length > 0 && (
              <Group x={5} y={valueY}>
                <Rect x={-3} y={-1} width={valText.length * 7 + 6} height={14}
                  fill="rgba(255,255,255,0.82)" cornerRadius={3} listening={false} />
                <Text text={valText} x={0} y={0} fontSize={12}
                  fontFamily="Inter, Arial, sans-serif" fill="#555" />
              </Group>
            )}
          </>
        );
      })()}
    </Group>
  );
}
