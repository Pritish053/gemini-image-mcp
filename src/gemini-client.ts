import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import {
  GeminiConfig,
  ImageGenerationOptions,
  ImageModificationOptions,
  ImageAnalysisOptions,
  GeneratedImage,
  AnalysisResult,
  StyleTransferOptions,
  BatchGenerationOptions
} from './types.js';

export class GeminiImageClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: GeminiConfig;
  private requestTimestamps: number[] = [];

  constructor(config: GeminiConfig) {
    this.config = {
      model: 'gemini-2.5-flash-image-preview',
      safetyLevel: 'MEDIUM',
      maxRequestsPerMinute: 10,
      ...config
    };

    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: this.config.model!,
      safetySettings: this.getSafetySettings()
    });
  }

  private getSafetySettings() {
    const level = this.config.safetyLevel;
    let threshold: HarmBlockThreshold;

    switch (level) {
      case 'LOW':
        threshold = HarmBlockThreshold.BLOCK_ONLY_HIGH;
        break;
      case 'HIGH':
        threshold = HarmBlockThreshold.BLOCK_LOW_AND_ABOVE;
        break;
      case 'BLOCK_NONE':
        threshold = HarmBlockThreshold.BLOCK_NONE;
        break;
      default:
        threshold = HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE;
    }

    return [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold
      }
    ];
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);

    if (this.requestTimestamps.length >= this.config.maxRequestsPerMinute!) {
      const oldestRequest = Math.min(...this.requestTimestamps);
      const waitTime = 60000 - (now - oldestRequest);
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    this.requestTimestamps.push(now);
  }

  async generateImage(options: ImageGenerationOptions): Promise<GeneratedImage[]> {
    await this.checkRateLimit();

    try {
      const prompt = this.buildGenerationPrompt(options);

      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });

      const response = await result.response;
      const images = this.extractImagesFromResponse(response, options);

      return images;
    } catch (error) {
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async modifyImage(options: ImageModificationOptions): Promise<GeneratedImage> {
    await this.checkRateLimit();

    try {
      let prompt = `Modify this image according to the following instructions: ${options.instructions}`;

      if (options.preserveStyle) {
        prompt += ' Please preserve the original artistic style and composition.';
      }

      const imagePart = {
        inlineData: {
          data: options.imageBase64,
          mimeType: 'image/png'
        }
      };

      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            imagePart
          ]
        }]
      });

      const response = await result.response;
      const images = this.extractImagesFromResponse(response, { prompt: options.instructions });

      return images[0];
    } catch (error) {
      throw new Error(`Image modification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeImage(options: ImageAnalysisOptions): Promise<AnalysisResult> {
    await this.checkRateLimit();

    try {
      const prompt = this.buildAnalysisPrompt(options);

      const imagePart = {
        inlineData: {
          data: options.imageBase64,
          mimeType: 'image/png'
        }
      };

      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            imagePart
          ]
        }]
      });

      const response = await result.response;
      const text = response.text();

      return this.parseAnalysisResult(text, options.analysisType || 'description');
    } catch (error) {
      throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateBatch(options: BatchGenerationOptions): Promise<GeneratedImage[]> {
    const results: GeneratedImage[] = [];

    for (const prompt of options.prompts) {
      const imageOptions: ImageGenerationOptions = {
        ...options.baseOptions,
        prompt
      };

      const images = await this.generateImage(imageOptions);
      results.push(...images);
    }

    return results;
  }

  async applyStyleTransfer(options: StyleTransferOptions): Promise<GeneratedImage> {
    const instructions = `Apply ${options.style} style to this image. ${
      options.intensity ? `Use ${options.intensity}% intensity for the style transfer.` : ''
    }`;

    return this.modifyImage({
      imageBase64: options.imageBase64,
      instructions,
      preserveStyle: false
    });
  }

  private buildGenerationPrompt(options: ImageGenerationOptions): string {
    let prompt = options.prompt;

    if (options.style && options.style !== 'realistic') {
      prompt += ` in ${options.style} style`;
    }

    if (options.aspectRatio) {
      prompt += ` with ${options.aspectRatio} aspect ratio`;
    }

    if (options.quality === 'high') {
      prompt += ', high quality, detailed';
    } else if (options.quality === 'ultra') {
      prompt += ', ultra high quality, extremely detailed, masterpiece';
    }

    return prompt;
  }

  private buildAnalysisPrompt(options: ImageAnalysisOptions): string {
    const type = options.analysisType || 'description';
    const detail = options.detail || 'medium';

    switch (type) {
      case 'description':
        return `Provide a ${detail} detail description of this image.`;
      case 'objects':
        return 'Identify and list all objects visible in this image with confidence scores.';
      case 'text':
        return 'Extract and transcribe any text visible in this image.';
      case 'colors':
        return 'Analyze the color palette of this image, identifying dominant colors with their hex values.';
      case 'emotions':
        return 'Analyze the emotional content and mood conveyed by this image.';
      case 'comprehensive':
        return 'Provide a comprehensive analysis including description, objects, text, colors, emotions, and relevant tags.';
      default:
        return `Provide a ${detail} detail description of this image.`;
    }
  }

  private extractImagesFromResponse(_response: any, options: any): GeneratedImage[] {
    // Note: This is a simplified implementation.
    // The actual Gemini API response structure for images may differ
    const images: GeneratedImage[] = [];

    try {
      // For now, we'll simulate image generation since the exact API structure may vary
      const timestamp = new Date().toISOString();

      // This would be replaced with actual image extraction logic
      const mockImage: GeneratedImage = {
        base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        mimeType: 'image/png',
        metadata: {
          prompt: options.prompt,
          model: this.config.model,
          timestamp
        }
      };

      images.push(mockImage);
    } catch (error) {
      console.error('Error extracting images from response:', error);
    }

    return images;
  }

  private parseAnalysisResult(text: string, analysisType: string): AnalysisResult {
    const result: AnalysisResult = {};

    try {
      switch (analysisType) {
        case 'description':
          result.description = text;
          break;
        case 'objects':
          result.objects = this.parseObjects(text);
          break;
        case 'text':
          result.text = this.parseText(text);
          break;
        case 'colors':
          result.colors = this.parseColors(text);
          break;
        case 'emotions':
          result.emotions = this.parseEmotions(text);
          break;
        case 'comprehensive':
          result.comprehensive = this.parseComprehensive(text);
          break;
        default:
          result.description = text;
      }
    } catch (error) {
      result.description = text;
    }

    return result;
  }

  private parseObjects(text: string): Array<{ name: string; confidence: number }> {
    // Simple parsing logic - would be enhanced based on actual API response format
    const lines = text.split('\n');
    const objects: Array<{ name: string; confidence: number }> = [];

    for (const line of lines) {
      const match = line.match(/(.+?):\s*(\d+)%/);
      if (match) {
        objects.push({
          name: match[1].trim(),
          confidence: parseInt(match[2]) / 100
        });
      }
    }

    return objects;
  }

  private parseText(text: string): string[] {
    return text.split('\n').filter(line => line.trim().length > 0);
  }

  private parseColors(text: string): Array<{ hex: string; name: string; percentage: number }> {
    const colors: Array<{ hex: string; name: string; percentage: number }> = [];

    const hexMatches = text.match(/#[0-9A-Fa-f]{6}/g);
    if (hexMatches) {
      hexMatches.forEach(hex => {
        colors.push({
          hex,
          name: 'Unknown',
          percentage: 0
        });
      });
    }

    return colors;
  }

  private parseEmotions(text: string): Array<{ emotion: string; confidence: number }> {
    const emotions = ['happy', 'sad', 'angry', 'surprised', 'fear', 'disgust', 'neutral'];
    const result: Array<{ emotion: string; confidence: number }> = [];

    for (const emotion of emotions) {
      const regex = new RegExp(`${emotion}.*?(\\d+)%`, 'i');
      const match = text.match(regex);
      if (match) {
        result.push({
          emotion,
          confidence: parseInt(match[1]) / 100
        });
      }
    }

    return result;
  }

  private parseComprehensive(text: string): any {
    return {
      description: text,
      objects: [],
      text: [],
      colors: [],
      emotions: [],
      tags: []
    };
  }
}