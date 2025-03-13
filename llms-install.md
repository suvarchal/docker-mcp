# Docker MCP Server Installation Guide for AI Agents

This guide provides step-by-step instructions for installing and configuring the Docker MCP server. This server allows AI assistants like Cline to interact with Docker through the Model Context Protocol (MCP).

## Prerequisites

- Node.js 18 or higher
- Docker installed and running on the system
- npm (Node Package Manager)

## Installation Methods

### Method 1: Install from npm (Recommended)

```bash
npm install -g docker-mcp-server
```

### Method 2: Install from source

1. Clone the repository:
```bash
git clone https://github.com/suvarchal/docker-mcp.git
cd docker-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

### Automatic Configuration (Recommended)

Run the included installation script to automatically configure the Docker MCP server with Cline:

```bash
npm run install-config
```

This script will:
1. Detect Cline installations (Desktop and/or VSCode)
2. Update the configuration files to include the Docker MCP server
3. Set up the correct paths for the system

### Manual Configuration

#### For Cline Desktop App (macOS)

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "docker-mcp": {
      "command": "node",
      "args": ["/path/to/docker-mcp/dist/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

#### For Cline in VSCode

Edit `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "docker-mcp": {
      "command": "node",
      "args": ["/path/to/docker-mcp/dist/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**Important Note:** After configuring the Docker MCP server in VS Code, you may need to restart VS Code for the changes to take effect in Cline.

## Verification

To verify that the Docker MCP server is working correctly, ask Cline to:

```
Run a hello-world Docker container
```

If successful, you should see the standard Docker hello-world message, confirming that:
1. The Docker daemon is running correctly
2. The Docker client can communicate with the daemon
3. The Docker daemon was able to pull the hello-world image
4. The container was created and executed successfully

## Troubleshooting

1. If the Docker MCP server is not recognized in Cline, try restarting VS Code or the Cline Desktop app.
2. Ensure Docker is running on your system.
3. Check that the paths in your configuration file are correct.
4. Verify that Node.js version 18 or higher is installed.

## Usage Examples

Once installed, you can ask Cline to perform Docker operations such as:

- "Run a hello-world Docker container"
- "List all Docker containers"
- "Pull the latest nginx image"
- "Run an nginx container on port 8080"
- "Stop the nginx container"
- "Remove all stopped containers"
