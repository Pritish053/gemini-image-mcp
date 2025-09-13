# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-14

### Added
- Initial release of Gemini Image MCP Server
- Image generation from text prompts using Gemini 2.5 Flash Image Preview
- Image modification with natural language instructions
- Image analysis capabilities (objects, text, colors, emotions, comprehensive)
- Batch image generation from multiple prompts
- Style transfer functionality with various artistic styles
- Rate limiting and safety settings
- Global npm package installation support
- Comprehensive documentation and examples
- Claude Desktop integration configuration

### Features
- **generateImage**: Create images from text descriptions
- **modifyImage**: Edit existing images with instructions
- **analyzeImage**: Extract information and insights from images
- **batchGenerate**: Generate multiple images efficiently
- **applyStyleTransfer**: Apply artistic styles to images

### Technical Details
- Built with TypeScript for type safety
- Uses Model Context Protocol (MCP) SDK v1.18.0
- Google Generative AI SDK integration
- Configurable API key management
- Error handling and logging
- Cross-platform compatibility