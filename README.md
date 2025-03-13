# Docker MCP Server

A Model Context Protocol (MCP) server for Docker operations. This server allows Claude and other AI assistants to interact with Docker through the MCP protocol.

**Note:** This MCP server works with standard Docker CLI commands and does not currently support Docker Compose operations, other MCP servers with docker-compose didn't work reliably with cline yet.

## Features

- List Docker containers
- List Docker images
- Run Docker containers
- Stop running containers
- Remove containers
- Pull Docker images from registries

## Installation

### Prerequisites

- Node.js 18 or higher
- Docker installed and running on your system

### Install from npm

```bash
npm install -g docker-mcp-server
```

### Install from source

1. Clone this repository
2. Install dependencies:

```bash
cd docker-mcp
npm install
```

3. Build the project:

```bash
npm run build
```

## Usage

### Running the server

```bash
docker-mcp-server
```

Or if installed from source:

```bash
npm start
```

### Configuring with Claude

You can use the included installation script to automatically configure the Docker MCP server with Claude:

```bash
npm run install-config
```

This script will:
1. Detect your Claude installations (Desktop and/or VSCode)
2. Update the configuration files to include the Docker MCP server
3. Set up the correct paths for your system

#### Manual Configuration

If you prefer to configure manually, you need to add the Docker MCP server to your MCP settings configuration file:

##### For Claude Desktop App (macOS)

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

##### For Claude in VSCode

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

**Note:** After configuring the Docker MCP server in VS Code, you may need to restart VS Code for the changes to take effect in Cline. If you encounter issues with the Docker MCP server not being recognized or working properly in Cline, try restarting VS Code.

## Available Tools

### list_containers

List all Docker containers.

Parameters:
- `all` (boolean, optional): Show all containers (default shows just running)

### list_images

List all Docker images.

### run_container

Run a Docker container.

Parameters:
- `image` (string, required): Docker image to run
- `name` (string, optional): Name for the container
- `detach` (boolean, optional): Run container in background
- `ports` (array of strings, optional): Port mappings (e.g. ["8080:80"])
- `volumes` (array of strings, optional): Volume mappings (e.g. ["/host/path:/container/path"])
- `env` (array of strings, optional): Environment variables (e.g. ["KEY=value"])
- `command` (string, optional): Command to run in the container

### stop_container

Stop a running Docker container.

Parameters:
- `container` (string, required): Container ID or name

### remove_container

Remove a Docker container.

Parameters:
- `container` (string, required): Container ID or name
- `force` (boolean, optional): Force removal of running container

### pull_image

Pull a Docker image from a registry.

Parameters:
- `image` (string, required): Image name (e.g. "nginx:latest")

## Example Usage with Claude

Once configured, you can ask Claude to perform Docker operations:

- "Run a hello-world Docker container"
- "List all Docker containers"
- "Pull the latest nginx image"
- "Run an nginx container on port 8080"
- "Stop the nginx container"
- "Remove all stopped containers"

## MCP Marketplace

This Docker MCP server is available on the Cline MCP Marketplace, making it easy for users to discover and install with one click.

The logo for the MCP Marketplace submission is located in the `assets/logo.png` file.

For more information about the MCP Marketplace, visit:
- [MCP Marketplace Repository](https://github.com/cline/mcp-marketplace)
- [Introducing the MCP Marketplace](https://cline.bot/blog/introducing-the-mcp-marketplace-clines-new-app-store)

## License

MIT
