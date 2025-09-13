# Publishing Guide

This guide explains how to publish the Gemini Image MCP Server package.

## Package Distribution Options

### 1. NPM Package (Recommended)

The package is configured for npm publishing with these features:
- Global installation: `npm install -g gemini-image-mcp`
- Executable binary: `gemini-image-mcp` command
- Automatic build on publish
- Includes only necessary files (see `files` field in package.json)

#### Publishing Steps:

1. **Login to npm:**
   ```bash
   npm login
   ```

2. **Update version (if needed):**
   ```bash
   npm version patch  # or minor/major
   ```

3. **Publish:**
   ```bash
   npm publish
   ```

#### For Scoped Package:
If you want to publish under your organization:
```bash
# Update package.json name to @your-org/gemini-image-mcp
npm publish --access public
```

### 2. GitHub Package Registry

1. **Update package.json:**
   ```json
   {
     "name": "@Pritish053/gemini-image-mcp",
     "publishConfig": {
       "registry": "https://npm.pkg.github.com"
     }
   }
   ```

2. **Authenticate:**
   ```bash
   npm login --registry=https://npm.pkg.github.com
   ```

3. **Publish:**
   ```bash
   npm publish
   ```

### 3. Direct Installation from Git

Users can install directly from a Git repository:
```bash
npm install -g git+https://github.com/Pritish053/gemini-image-mcp.git
```

## Installation Methods for Users

### Method 1: NPM Global Install
```bash
npm install -g gemini-image-mcp
```

### Method 2: Using the Install Script
```bash
curl -fsSL https://raw.githubusercontent.com/Pritish053/gemini-image-mcp/main/install.sh | bash
```

### Method 3: Local Development Install
```bash
git clone https://github.com/Pritish053/gemini-image-mcp.git
cd gemini-image-mcp
npm install
npm run build
npm link
```

## Configuration After Installation

1. **Get Gemini API Key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Create a new API key

2. **Update Claude Desktop Config:**

   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "gemini-image": {
         "command": "gemini-image-mcp",
         "env": {
           "GEMINI_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## Package Details

- **Package Size:** ~14.5 kB (compressed)
- **Unpacked Size:** ~58.9 kB
- **Node.js Requirement:** >= 18.0.0
- **Platform:** Cross-platform (Windows, macOS, Linux)

## Included Files

The published package includes only necessary files:
- `dist/` - Compiled JavaScript and type definitions
- `README.md` - Documentation
- `LICENSE` - MIT license
- `.env.example` - Environment variables template

## Version Management

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR:** Breaking changes
- **MINOR:** New features (backwards compatible)
- **PATCH:** Bug fixes (backwards compatible)

## Pre-publish Checklist

- [ ] Tests pass: `npm test` (if tests exist)
- [ ] Build successful: `npm run build`
- [ ] Type checking: `npm run typecheck`
- [ ] Linting: `npm run lint`
- [ ] Package contents verified: `npm pack` and inspect
- [ ] Version updated: `npm version [patch|minor|major]`
- [ ] Changelog updated
- [ ] Git committed and tagged

## Testing the Package

Before publishing, test the package locally:

```bash
# Create package
npm pack

# Install locally
npm install -g ./gemini-image-mcp-1.0.0.tgz

# Test command
gemini-image-mcp --help

# Uninstall
npm uninstall -g gemini-image-mcp
```