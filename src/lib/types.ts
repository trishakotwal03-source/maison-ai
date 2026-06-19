export interface WallPolygon {
  polygon: [number, number][];
}

export interface WallDetectionResult {
  walls: WallPolygon[];
}

export interface ColorPalette {
  name: string;
  hex: string;
}

export interface QuestionnaireData {
  vibe: string;
  roomType: string;
  favoriteColors: string;
  warmCool: string;
  lighting: string;
  styles: string[];
}

export interface FurnitureAsset {
  id: string;
  name: string;
  category: string;
  src: string;
  defaultWidth: number;
  defaultHeight: number;
}

export interface FurnitureInstance {
  id: string;
  assetId: string;
  src: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  shadow: boolean;
  perspective: number;
}

export interface ThemeRecommendation {
  theme: string;
  description: string;
  palette: ColorPalette[];
  furniture: string[];
  decor: string[];
  lighting: string[];
  curtains: string;
  wallArt: string;
  plants: string;
  textures: string[];
  improvements: string[];
}

export interface DesignRecord {
  id: number;
  type: 'color' | 'furniture' | 'theme';
  title: string;
  thumbnail: string | null;
  design_data: Record<string, unknown> | null;
  created_at: string;
}
