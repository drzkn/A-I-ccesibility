# Getting Started

## Installation

### Using npm (global)

```bash
npm install -g accessibility-hub-mcp
```

### Using pnpm (global)

```bash
pnpm add -g accessibility-hub-mcp
```

## MCP Client Configuration

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "accessibility-hub": {
      "command": "npx",
      "args": ["-y", "accessibility-hub-mcp"]
    }
  }
}
```

### Cursor

[<img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor">](https://cursor.com/en/install-mcp?name=accessibility-hub&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImFjY2Vzc2liaWxpdHktaHViIl19)
Add to your Cursor MCP configuration (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "accessibility-hub": {
      "command": "npx",
      "args": ["-y", "accessibility-hub-mcp"]
    }
  }
}
```

### Windsurf

Add to your Windsurf MCP configuration:

```json
{
  "mcpServers": {
    "accessibility-hub": {
      "command": "npx",
      "args": ["-y", "accessibility-hub-mcp"]
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add accessibility-hub -- npx -y accessibility-hub-mcp
```

## Local Development Configuration

For development, point to your local build:

```json
{
  "mcpServers": {
    "accessibility-hub": {
      "command": "node",
      "args": ["/path/to/accessibility-hub-mcp/dist/server.js"]
    }
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging verbosity (debug, info, warn, error) | `info` |

## Next Steps

- [Tools Documentation](./tools/README.md) - Learn about available analysis tools
- [Prompts Documentation](./prompts/README.md) - Pre-built prompts for common tasks
- [Resources Documentation](./resources/README.md) - WCAG criteria and thresholds data
- [Guides](./guides/workflows.md) - Recommended workflows and best practices
