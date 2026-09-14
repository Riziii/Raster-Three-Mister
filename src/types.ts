export interface ImagePreset {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
  isCustom?: boolean;
}

export type DimensionUnit = 'cm' | 'inch';

export type KnockoutTarget = 'none' | 'black' | 'white' | 'custom';

export type HalftoneShape = 'dot' | 'ellipse' | 'line' | 'square';

export type HalftoneMode = 'none' | 'monochrome' | 'color-luminance' | 'cmyk';

export interface ProcessorSettings {
  // Canvas size and DPI settings
  presetId: string;
  width: number; // in current unit
  height: number; // in current unit
  unit: DimensionUnit;
  dpi: number;
  
  // Color Knockout settings
  knockoutTarget: KnockoutTarget;
  knockoutColor: string; // hex color code
  knockoutTolerance: number; // 0 to 100
  knockoutFuzziness: number; // 0 to 100 (smoothness)
  
  // Halftone settings
  halftoneMode: HalftoneMode;
  halftoneShape: HalftoneShape;
  lpi: number; // Lines Per Inch (or frequency scale)
  dotScale: number; // 0.1 to 1.5 multiplier for dot size
  brightness: number; // contrast/brightness tuning for halftones
  contrast: number;
  saturation: number; // saturation boost for sharper/vibrant colors (-100 to 100)
  invertHalftone: boolean; // invert dot scaling
  
  // Custom screen angles for CMYK halftones
  angleC: number;
  angleM: number;
  angleY: number;
  angleK: number;
  angleMono: number;
  
  // Visuals for Mockup
  mockupBgColor: string; // T-Shirt background color for preview
  mockupShowGrid: boolean;
  mockupType: 'flat' | 't-shirt';
}

export const PRESET_SIZES: ImagePreset[] = [
  { id: 'a3', name: 'A3 (29.7 x 42 cm)', widthCm: 29.7, heightCm: 42.0 },
  { id: 'a3plus', name: 'A3+ (32.9 x 48.3 cm)', widthCm: 32.9, heightCm: 48.3 },
  { id: 'a4', name: 'A4 (21 x 29.7 cm)', widthCm: 21.0, heightCm: 29.7 },
  { id: 'meter60', name: 'Meter Roll (60 x 100 cm)', widthCm: 60.0, heightCm: 100.0 },
  { id: 'custom', name: 'Kustom (Ukuran Sendiri)', widthCm: 30.0, heightCm: 30.0, isCustom: true },
];

export const DEFAULT_SETTINGS: ProcessorSettings = {
  presetId: 'a3',
  width: 29.7,
  height: 42.0,
  unit: 'cm',
  dpi: 300,
  
  knockoutTarget: 'none',
  knockoutColor: '#000000',
  knockoutTolerance: 20,
  knockoutFuzziness: 10,
  
  halftoneMode: 'none',
  halftoneShape: 'dot',
  lpi: 45,
  dotScale: 1.0,
  brightness: 0,
  contrast: 0,
  saturation: 20,
  invertHalftone: false,
  
  angleC: 15,
  angleM: 75,
  angleY: 0,
  angleK: 45,
  angleMono: 45,
  
  mockupBgColor: '#1e293b', // slate-800 mockup as default
  mockupShowGrid: true,
  mockupType: 't-shirt',
};
