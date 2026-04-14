export interface ImageGenerationOptions {
  prompt: string;
  width?: number;
  height?: number;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  style?: 'realistic' | 'artistic' | 'cartoon' | 'sketch' | 'watercolor' | 'oil-painting';
  quality?: 'standard' | 'high' | 'ultra';
  numberOfImages?: number;
  seed?: number;
}

export interface ImageModificationOptions {
  imageBase64: string;
  instructions: string;
  preserveStyle?: boolean;
  strength?: number;
}

export interface ImageAnalysisOptions {
  imageBase64: string;
  analysisType?: 'description' | 'objects' | 'text' | 'colors' | 'emotions' | 'comprehensive';
  detail?: 'low' | 'medium' | 'high';
}

export interface BatchGenerationOptions {
  prompts: string[];
  baseOptions?: Omit<ImageGenerationOptions, 'prompt'>;
}

export interface StyleTransferOptions {
  imageBase64: string;
  style: 'anime' | 'renaissance' | 'impressionist' | 'cyberpunk' | 'minimalist' | 'vintage' | 'futuristic';
  intensity?: number;
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
  width?: number;
  height?: number;
  metadata?: {
    prompt?: string;
    model?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedObject {
  name: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface DetectedColor {
  hex: string;
  name: string;
  percentage: number;
}

export interface AnalysisResult {
  description?: string;
  objects?: DetectedObject[];
  text?: string[];
  colors?: DetectedColor[];
  emotions?: Array<{ emotion: string; confidence: number }>;
  comprehensive?: {
    description: string;
    objects: DetectedObject[];
    text: string[];
    colors: DetectedColor[];
    emotions: Array<{ emotion: string; confidence: number }>;
    tags: string[];
  };
}

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  safetyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCK_NONE';
  maxRequestsPerMinute?: number;
}