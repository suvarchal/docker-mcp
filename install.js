#!/usr/bin/env node
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Paths for different Claude configurations
const CLAUDE_DESKTOP_CONFIG_PATH = join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
const CLAUDE_VSCODE_CONFIG_DIR = join(homedir(), '.config', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings');
const CLAUDE_VSCODE_CONFIG_PATH = join(CLAUDE_VSCODE_CONFIG_DIR, 'cline_mcp_settings.json');

// Docker MCP server configuration
const DOCKER_MCP_CONFIG = {
  "docker-mcp": {
    "command": "node",
    "args": [join(__dirname, "dist", "index.js")],
    "disabled": false,
    "autoApprove": []
  }
};

async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function updateConfig(configPath) {
  try {
    // Check if the config file exists
    const exists = await fileExists(configPath);
    
    let config = { mcpServers: {} };
    
    // If the file exists, read it
    if (exists) {
      const content = await fs.readFile(configPath, 'utf8');
      try {
        config = JSON.parse(content);
        if (!config.mcpServers) {
          config.mcpServers = {};
        }
      } catch (error) {
        console.error(`Error parsing ${configPath}: ${error.message}`);
        return false;
      }
    } else {
      // Create directory if it doesn't exist
      await fs.mkdir(dirname(configPath), { recursive: true });
    }
    
    // Add Docker MCP server configuration
    config.mcpServers = {
      ...config.mcpServers,
      ...DOCKER_MCP_CONFIG
    };
    
    // Write the updated config
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log(`Updated ${configPath}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${configPath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Installing Docker MCP server...');
  
  // Try to update Claude Desktop config
  const desktopResult = await updateConfig(CLAUDE_DESKTOP_CONFIG_PATH);
  if (desktopResult) {
    console.log('Successfully configured Docker MCP server for Claude Desktop');
  } else {
    console.log('Could not configure Claude Desktop (may not be installed)');
  }
  
  // Try to update Claude VSCode config
  const vscodeResult = await updateConfig(CLAUDE_VSCODE_CONFIG_PATH);
  if (vscodeResult) {
    console.log('Successfully configured Docker MCP server for Claude in VSCode');
  } else {
    console.log('Could not configure Claude in VSCode (may not be installed)');
  }
  
  console.log('\nInstallation complete!');
  console.log('\nYou can now use Docker commands with Claude.');
  console.log('Try asking Claude to "run a hello-world Docker container" or "list Docker images".');
}

main().catch(console.error);
