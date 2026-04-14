#!/bin/bash

# Gemini Image MCP Server Installation Script

set -e

echo "🚀 Installing Gemini Image MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "❌ Error: Node.js version 18 or higher is required. Current version: $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install the package globally
echo "📦 Installing @pritishmaheta/gemini-image-mcp globally..."
npm install -g @pritishmaheta/gemini-image-mcp

echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Get your Gemini API key from: https://makersuite.google.com/app/apikey"
echo "2. Add the server to your Claude Desktop config:"
echo ""
echo '{
  "mcpServers": {
    "gemini-image": {
      "command": "gemini-image-mcp",
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}'
echo ""
echo "3. Restart Claude Desktop"
echo ""
echo "🎉 You're all set! You can now generate and modify images with Claude."