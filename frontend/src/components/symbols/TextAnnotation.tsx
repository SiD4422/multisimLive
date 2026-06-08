import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Group, Text } from 'react-konva';
import { Html } from 'react-konva-utils';
import type { SchematicComponent } from '../../store/useSchematicStore';

interface TextAnnotationProps {
  component: SchematicComponent;
  selected?: boolean;
  onSelect?: () => void;
  onDragMove: (e: any) => void;
  onDragEnd: (e: any) => void;
  updateComponentValue: (id: string, value: string) => void;
}

export default function TextAnnotation({ 
  component, selected, onSelect, onDragMove, onDragEnd, updateComponentValue 
}: TextAnnotationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(component.value || "Text");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // place cursor at end
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    updateComponentValue(component.id, textValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTextValue(component.value || "Text"); // revert
    }
    e.stopPropagation();
  };

  return (
    <Group
      x={component.position.x}
      y={component.position.y}
      draggable={!isEditing}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      rotation={component.rotation || 0}
      onMouseDown={(e) => {
        if (!isEditing && onSelect) onSelect();
      }}
      onDblClick={handleDoubleClick}
    >
      {!isEditing ? (
        <Text
          text={component.value || "Text"}
          fontSize={16}
          fontFamily="Inter, sans-serif"
          fill={selected ? "#3b82f6" : "#333"}
          padding={5}
        />
      ) : (
        <Html divProps={{ style: { position: 'absolute', top: -5, left: -5 } }}>
          <textarea
            ref={inputRef}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              padding: '5px',
              border: '1px solid #3b82f6',
              borderRadius: '4px',
              outline: 'none',
              background: 'white',
              resize: 'both',
              minWidth: '100px',
              minHeight: '30px'
            }}
          />
        </Html>
      )}
    </Group>
  );
}
