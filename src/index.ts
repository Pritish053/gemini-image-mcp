#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from 'dotenv';
import { GeminiImageClient } from './gemini-client.js';
import {
  ImageGenerationOptions,
  ImageModificationOptions,
  ImageAnalysisOptions,
  BatchGenerationOptions,
  StyleTransferOptions,
  GeminiConfig
} from './types.js';

// Load environment variables
config();

class GeminiImageMCPServer {
  private server: Server;
  private geminiClient: GeminiImageClient;

  constructor() {
    // Validate required environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY environment variable is required');
      process.exit(1);
    }

    // Initialize Gemini client
    const geminiConfig: GeminiConfig = {
      apiKey,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-image-preview',
      safetyLevel: (process.env.SAFETY_LEVEL as any) || 'MEDIUM',
      maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '10')
    };

    this.geminiClient = new GeminiImageClient(geminiConfig);

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'gemini-image-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
    this.setupErrorHandling();
  }

  private setupTools() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'generateImage',
            description: 'Generate images from text prompts using Google Gemini',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Text prompt describing the image to generate'
                },
                width: {
                  type: 'number',
                  description: 'Image width in pixels (optional)'
                },
                height: {
                  type: 'number',
                  description: 'Image height in pixels (optional)'
                },
                aspectRatio: {
                  type: 'string',
                  enum: ['1:1', '16:9', '9:16', '4:3', '3:4'],
                  description: 'Image aspect ratio (optional)'
                },
                style: {
                  type: 'string',
                  enum: ['realistic', 'artistic', 'cartoon', 'sketch', 'watercolor', 'oil-painting'],
                  description: 'Image style (optional)'
                },
                quality: {
                  type: 'string',
                  enum: ['standard', 'high', 'ultra'],
                  description: 'Image quality level (optional)'
                },
                numberOfImages: {
                  type: 'number',
                  description: 'Number of images to generate (optional, default: 1)'
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'modifyImage',
            description: 'Modify existing images with text instructions',
            inputSchema: {
              type: 'object',
              properties: {
                imageBase64: {
                  type: 'string',
                  description: 'Base64 encoded image data'
                },
                instructions: {
                  type: 'string',
                  description: 'Instructions for modifying the image'
                },
                preserveStyle: {
                  type: 'boolean',
                  description: 'Whether to preserve the original style (optional)'
                },
                strength: {
                  type: 'number',
                  description: 'Modification strength from 0 to 1 (optional)'
                }
              },
              required: ['imageBase64', 'instructions']
            }
          },
          {
            name: 'analyzeImage',
            description: 'Analyze images and extract information',
            inputSchema: {
              type: 'object',
              properties: {
                imageBase64: {
                  type: 'string',
                  description: 'Base64 encoded image data'
                },
                analysisType: {
                  type: 'string',
                  enum: ['description', 'objects', 'text', 'colors', 'emotions', 'comprehensive'],
                  description: 'Type of analysis to perform (optional)'
                },
                detail: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Level of detail for analysis (optional)'
                }
              },
              required: ['imageBase64']
            }
          },
          {
            name: 'batchGenerate',
            description: 'Generate multiple images from different prompts',
            inputSchema: {
              type: 'object',
              properties: {
                prompts: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of text prompts'
                },
                baseOptions: {
                  type: 'object',
                  description: 'Base options to apply to all generations (optional)',
                  properties: {
                    aspectRatio: { type: 'string' },
                    style: { type: 'string' },
                    quality: { type: 'string' }
                  }
                }
              },
              required: ['prompts']
            }
          },
          {
            name: 'applyStyleTransfer',
            description: 'Apply artistic styles to existing images',
            inputSchema: {
              type: 'object',
              properties: {
                imageBase64: {
                  type: 'string',
                  description: 'Base64 encoded image data'
                },
                style: {
                  type: 'string',
                  enum: ['anime', 'renaissance', 'impressionist', 'cyberpunk', 'minimalist', 'vintage', 'futuristic'],
                  description: 'Artistic style to apply'
                },
                intensity: {
                  type: 'number',
                  description: 'Style intensity from 0 to 100 (optional)'
                }
              },
              required: ['imageBase64', 'style']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generateImage':
            return await this.handleGenerateImage(args as unknown as ImageGenerationOptions);

          case 'modifyImage':
            return await this.handleModifyImage(args as unknown as ImageModificationOptions);

          case 'analyzeImage':
            return await this.handleAnalyzeImage(args as unknown as ImageAnalysisOptions);

          case 'batchGenerate':
            return await this.handleBatchGenerate(args as unknown as BatchGenerationOptions);

          case 'applyStyleTransfer':
            return await this.handleStyleTransfer(args as unknown as StyleTransferOptions);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`
            }
          ],
          isError: true
        };
      }
    });
  }

  private async handleGenerateImage(options: ImageGenerationOptions) {
    const images = await this.geminiClient.generateImage(options);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully generated ${images.length} image(s) for prompt: "${options.prompt}"`
        },
        ...images.map(image => ({
          type: 'image' as const,
          data: image.base64,
          mimeType: image.mimeType
        }))
      ]
    };
  }

  private async handleModifyImage(options: ImageModificationOptions) {
    const image = await this.geminiClient.modifyImage(options);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully modified image with instructions: "${options.instructions}"`
        },
        {
          type: 'image' as const,
          data: image.base64,
          mimeType: image.mimeType
        }
      ]
    };
  }

  private async handleAnalyzeImage(options: ImageAnalysisOptions) {
    const analysis = await this.geminiClient.analyzeImage(options);

    let resultText = '';

    if (analysis.description) {
      resultText += `Description: ${analysis.description}\n\n`;
    }

    if (analysis.objects && analysis.objects.length > 0) {
      resultText += 'Objects detected:\n';
      analysis.objects.forEach(obj => {
        resultText += `- ${obj.name} (confidence: ${(obj.confidence * 100).toFixed(1)}%)\n`;
      });
      resultText += '\n';
    }

    if (analysis.text && analysis.text.length > 0) {
      resultText += `Text found: ${analysis.text.join(', ')}\n\n`;
    }

    if (analysis.colors && analysis.colors.length > 0) {
      resultText += 'Dominant colors:\n';
      analysis.colors.forEach(color => {
        resultText += `- ${color.name} (${color.hex}) - ${color.percentage}%\n`;
      });
      resultText += '\n';
    }

    if (analysis.emotions && analysis.emotions.length > 0) {
      resultText += 'Emotions detected:\n';
      analysis.emotions.forEach(emotion => {
        resultText += `- ${emotion.emotion} (confidence: ${(emotion.confidence * 100).toFixed(1)}%)\n`;
      });
    }

    if (analysis.comprehensive) {
      resultText = JSON.stringify(analysis.comprehensive, null, 2);
    }

    return {
      content: [
        {
          type: 'text',
          text: resultText.trim() || 'Analysis completed but no specific results were extracted.'
        }
      ]
    };
  }

  private async handleBatchGenerate(options: BatchGenerationOptions) {
    const images = await this.geminiClient.generateBatch(options);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully generated ${images.length} images from ${options.prompts.length} prompts`
        },
        ...images.map((image) => ({
          type: 'image' as const,
          data: image.base64,
          mimeType: image.mimeType
        }))
      ]
    };
  }

  private async handleStyleTransfer(options: StyleTransferOptions) {
    const image = await this.geminiClient.applyStyleTransfer(options);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully applied ${options.style} style to the image`
        },
        {
          type: 'image' as const,
          data: image.base64,
          mimeType: image.mimeType
        }
      ]
    };
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Gemini Image MCP server running on stdio');
  }
}

// Start the server
const server = new GeminiImageMCPServer();
server.run().catch((error) => {
  console.error('Failed to run server:', error);
  process.exit(1);
});