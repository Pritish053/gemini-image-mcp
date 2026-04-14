# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Publish under `@pritishmaheta` npm scope.
- Lazy-load `dotenv` only when a `.env` file is present, cutting cold-start
  work for MCP clients that inject env vars directly.
- Tighten tool-argument validation and surface clearer error messages to the
  calling LLM.
- Strengthen TypeScript types in `gemini-client` and shared `types.ts`,
  eliminating remaining `any` usages in public surfaces.

### Removed
- Drop unused `sharp` dependency (saves ~15 MB of native binaries in
  `node_modules`, smaller install for global npm users).

### Added
- Declare `@eslint/js` as an explicit devDependency (previously relied on a
  transitive copy).
- Declare `engines.node >=18.0.0` to match documented requirements.
- Update `install.sh` to install the scoped package name.

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