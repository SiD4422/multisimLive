// Shape of utils/kicad_symbols.json (generated from the KiCad symbol library, CC-BY-SA 4.0).

export type KiCadFill = 'N' | 'F' | 'f';

export interface KiCadCircle { type: 'circle'; x: number; y: number; r: number; fill: KiCadFill }
export interface KiCadRect { type: 'rect'; x1: number; y1: number; x2: number; y2: number; fill: KiCadFill }
/** `points` is a flat list: [x0, y0, x1, y1, ...] */
export interface KiCadPoly { type: 'poly'; points: number[]; fill: KiCadFill }
export type KiCadDrawing = KiCadCircle | KiCadRect | KiCadPoly;

export interface KiCadPin {
  name: string;
  number: string;
  x: number;
  y: number;
  length: number;
  orientation: 'U' | 'D' | 'L' | 'R';
}

export interface KiCadSymbolDef {
  name: string;
  reference: string;
  drawings: KiCadDrawing[];
  pins: KiCadPin[];
}
