# Gemini Image MCP Server

A Model Context Protocol (MCP) server that provides image generation and manipulation capabilities using Google's Gemini API. This server integrates with Claude Desktop and other MCP-compatible clients to enable AI-powered image operations.

## Features

- **Image Generation**: Create images from text prompts using Gemini 2.5 Flash Image Preview
- **Image Modification**: Modify existing images with natural language instructions
- **Image Analysis**: Analyze images for objects, text, colors, emotions, and comprehensive insights
- **Batch Generation**: Generate multiple images from different prompts in one operation
- **Style Transfer**: Apply artistic styles to existing images
- **Rate Limiting**: Built-in rate limiting to respect API quotas
- **Safety Settings**: Configurable content safety levels

## Available Tools

### 1. generateImage
Generate images from text prompts with customizable options.

**Parameters:**
- `prompt` (required): Text description of the image to generate
- `width` (optional): Image width in pixels
- `height` (optional): Image height in pixels
- `aspectRatio` (optional): One of `1:1`, `16:9`, `9:16`, `4:3`, `3:4`
- `style` (optional): One of `realistic`, `artistic`, `cartoon`, `sketch`, `watercolor`, `oil-painting`
- `quality` (optional): One of `standard`, `high`, `ultra`
- `numberOfImages` (optional): Number of images to generate (default: 1)

### 2. modifyImage
Modify existing images using natural language instructions.

**Parameters:**
- `imageBase64` (required): Base64 encoded image data
- `instructions` (required): Text instructions for modification
- `preserveStyle` (optional): Whether to preserve original artistic style
- `strength` (optional): Modification strength from 0 to 1

### 3. analyzeImage
Analyze images and extract various types of information.

**Parameters:**
- `imageBase64` (required): Base64 encoded image data
- `analysisType` (optional): One of `description`, `objects`, `text`, `colors`, `emotions`, `comprehensive`
- `detail` (optional): Analysis detail level - `low`, `medium`, `high`

### 4. batchGenerate
Generate multiple images from different prompts efficiently.

**Parameters:**
- `prompts` (required): Array of text prompts
- `baseOptions` (optional): Shared options to apply to all generations

### 5. applyStyleTransfer
Apply artistic styles to existing images.

**Parameters:**
- `imageBase64` (required): Base64 encoded image data
- `style` (required): One of `anime`, `renaissance`, `impressionist`, `cyberpunk`, `minimalist`, `vintage`, `futuristic`
- `intensity` (optional): Style intensity from 0 to 100

## Installation

### Prerequisites

- Node.js 18 or higher
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Setup

1. Clone or download the project:
```bash
git clone <repository-url>
cd gemini-image-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Gemini API key:
```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

5. Build the project:
```bash
npm run build
```

## Usage

### With Claude Desktop

Add the server to your Claude Desktop configuration file:

**On macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**On Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gemini-image": {
      "command": "node",
      "args": ["/path/to/gemini-image-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-gemini-api-key-here"
      }
    }
  }
}
```

### Standalone Usage

You can also run the server directly for testing:

```bash
npm start
```

## Configuration Options

Environment variables you can set:

- `GEMINI_API_KEY` (required): Your Google Gemini API key
- `GEMINI_MODEL` (optional): Model to use (default: `gemini-2.5-flash-image-preview`)
- `SAFETY_LEVEL` (optional): Content safety level - `LOW`, `MEDIUM`, `HIGH`, `BLOCK_NONE` (default: `MEDIUM`)
- `MAX_REQUESTS_PER_MINUTE` (optional): Rate limit (default: 10)

## Examples

Once integrated with Claude Desktop, you can use natural language to interact with the tools:

### Image Generation
"Generate an image of a sunset over mountains in watercolor style"

### Image Modification
"Take this image and add a rainbow in the sky while preserving the original style"

### Image Analysis
"Analyze this image and tell me what objects you can detect with confidence scores"

### Batch Generation
"Generate 3 different versions of a futuristic cityscape: one cyberpunk style, one minimalist, and one realistic"

### Style Transfer
"Apply an impressionist style to this photograph with high intensity"

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building
```bash
npm run build
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## API Limitations

- Rate limiting is enforced based on your configuration
- Image generation may take 10-30 seconds depending on complexity
- Maximum image size depends on Gemini API limits
- Content safety filters are applied based on your safety level setting

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY environment variable is required"**
   - Ensure you've set the API key in your environment or Claude Desktop config

2. **"Rate limit exceeded"**
   - Wait for the rate limit window to reset or adjust `MAX_REQUESTS_PER_MINUTE`

3. **"Image generation failed"**
   - Check your prompt for potentially unsafe content
   - Verify your API key has proper permissions
   - Try adjusting the safety level settings

### Debug Logging

The server logs errors to stderr. Check the Claude Desktop console or your terminal for detailed error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section above
- Review Claude Desktop MCP documentation
- Create an issue in the repository