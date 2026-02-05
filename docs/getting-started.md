# Getting Started

This guide covers the complete installation process and configuration for different MCP clients. For a quick overview, see the [README](../README.md).

## Prerequisites

- **Node.js ≥ 20** (check with `node --version`)
- **Chrome/Chromium** - automatically downloaded by Puppeteer on first run

## Installation

### Using npm (global)

```bash
npm install -g accessibility-hub
```

### Using pnpm (global)

```bash
pnpm add -g accessibility-hub
```

### Using npx (no installation)

You can run accessibility-hub directly without installing:

```bash
npx -y accessibility-hub
```

This is the recommended approach for MCP client configurations.

## MCP Client Configuration

Configure your preferred MCP client to use accessibility-hub. Each configuration uses `npx` to ensure you always have the latest version.

### Claude Desktop

Add to your Claude Desktop configuration file:

| Platform | Configuration Path |
|----------|-------------------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "accessibility-hub": {
      "command": "npx",
      "args": ["-y", "accessibility-hub"]
    }
  }
}
```

### Cursor

Click to install automatically:

[<img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor" height="32">](https://cursor.com/en/install-mcp?name=accessibility-hub&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImFjY2Vzc2liaWxpdHktaHViIl19)

Or add manually to `.cursor/mcp.json` in your project or global config:

```json
{
  "mcpServers": {
    "accessibility-hub": {
      "command": "npx",
      "args": ["-y", "accessibility-hub"]
    }
  }
}
```

### Windsurf

Add to your Windsurf MCP configuration (`~/.codeium/windsurf/mcp_config.json`):

```json
{
  "mcpServers": {
    "accessibility-hub": {
      "command": "npx",
      "args": ["-y", "accessibility-hub"]
    }
  }
}
```

### Claude Code (CLI)

Add the server using the Claude CLI:

```bash
claude mcp add accessibility-hub -- npx -y accessibility-hub
```

To verify it was added:

```bash
claude mcp list
```

## Local Development Configuration

For contributing or testing local changes, point to your local build instead of the npm package:

```json
{
  "mcpServers": {
    "accessibility-hub": {
      "command": "node",
      "args": ["/absolute/path/to/accessibility-hub/dist/server.js"]
    }
  }
}
```

Build the project first:

```bash
git clone https://github.com/drzkn/A-I-ccesibility.git
cd A-I-ccesibility
pnpm install
pnpm build
```

## Environment Variables

Configure server behavior with environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging verbosity (`debug`, `info`, `warn`, `error`) | `info` |

Example with environment variable:

```json
{
  "mcpServers": {
    "accessibility-hub": {
      "command": "npx",
      "args": ["-y", "accessibility-hub"],
      "env": {
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

## Verify Installation

After configuring your MCP client, verify the server is working:

1. Restart your MCP client (Claude Desktop, Cursor, etc.)
2. Ask the AI assistant: "What accessibility tools are available?"
3. The assistant should list the available tools: `analyze-with-axe`, `analyze-with-pa11y`, `analyze-contrast`, and `analyze-mixed`

## Troubleshooting

### Server not starting

- Ensure Node.js ≥ 20 is installed: `node --version`
- Check that npx can find the package: `npx -y accessibility-hub --help`
- Verify JSON syntax in your configuration file

### Chrome/Puppeteer issues

- On first run, Puppeteer downloads Chrome automatically (may take a few minutes)
- If behind a proxy, set `PUPPETEER_SKIP_DOWNLOAD=true` and install Chrome manually
- On Linux servers, you may need additional dependencies: `apt-get install libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcomposite1 libxrandr2`

### Permission errors

- If using global install, you may need `sudo` on macOS/Linux
- Alternatively, configure npm to use a user-writable directory

## Next Steps

- [Tools Documentation](./tools/README.md) - Learn about available analysis tools
- [Prompts Documentation](./prompts/README.md) - Pre-built prompts for common tasks
- [Resources Documentation](./resources/README.md) - WCAG criteria and thresholds data
- [Workflows Guide](./guides/workflows.md) - Recommended workflows and best practices
