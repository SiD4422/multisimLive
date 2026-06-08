import { describe, it, expect, beforeEach } from 'vitest';
import { useSchematicStore } from './useSchematicStore';
import LZString from 'lz-string';

describe('useSchematicStore Serialization', () => {
  beforeEach(() => {
    // Reset store before each test
    useSchematicStore.setState({
      components: [],
      wires: [],
      probes: [],
      scale: 1,
      stagePos: { x: 0, y: 0 }
    });
  });

  it('should successfully roundtrip exportState -> compress -> decompress -> importState', () => {
    // 1. Create a mock schematic state with >=1 component, >=1 wire, >=1 probe
    const mockComponent = {
      id: 'R1',
      type: 'Resistor',
      value: '1k',
      position: { x: 100, y: 100 },
      rotation: 0
    };

    const mockWire = {
      id: 'W1',
      points: [{ x: 100, y: 100 }, { x: 200, y: 100 }]
    };

    const mockProbe = {
      id: 'P1',
      type: 'Voltage',
      nodeId: 'n1',
      position: { x: 200, y: 100 }
    };

    // Inject mock state
    useSchematicStore.setState({
      components: [mockComponent],
      wires: [mockWire],
      probes: [mockProbe],
      scale: 1.5,
      stagePos: { x: -50, y: -50 }
    });

    // 2. Export state to JSON string
    const stateStr = useSchematicStore.getState().exportState();
    
    // 3. Compress using lz-string
    const compressed = LZString.compressToEncodedURIComponent(stateStr);
    expect(compressed).toBeDefined();
    expect(compressed.length).toBeGreaterThan(0);
    
    // Ensure compression is working correctly (often shrinks or formats uniquely)
    
    // 4. Decompress using lz-string
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    expect(decompressed).toBe(stateStr);

    // 5. Clear store to simulate fresh load
    useSchematicStore.setState({
      components: [],
      wires: [],
      probes: [],
      scale: 1,
      stagePos: { x: 0, y: 0 }
    });

    // 6. Import state
    useSchematicStore.getState().importState(decompressed);

    // 7. Assert that the resulting state strictly equals the mock state
    const newState = useSchematicStore.getState();
    expect(newState.components).toEqual([mockComponent]);
    expect(newState.wires).toEqual([mockWire]);
    expect(newState.probes).toEqual([mockProbe]);
    expect(newState.scale).toBe(1.5);
    expect(newState.stagePos).toEqual({ x: -50, y: -50 });
  });
});
