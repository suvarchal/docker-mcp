#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

// Import the SDK
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

const execAsync = promisify(exec);

interface ContainerArgs {
  all?: boolean;
}

interface RunContainerArgs {
  image: string;
  name?: string;
  detach?: boolean;
  ports?: string[];
  volumes?: string[];
  env?: string[];
  command?: string;
}

interface ContainerActionArgs {
  container: string;
  force?: boolean;
}

interface ImageArgs {
  image: string;
}

class DockerServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'docker-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error: any) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_containers',
          description: 'List all Docker containers',
          inputSchema: {
            type: 'object',
            properties: {
              all: {
                type: 'boolean',
                description: 'Show all containers (default shows just running)',
              },
            },
          },
        },
        {
          name: 'list_images',
          description: 'List all Docker images',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'run_container',
          description: 'Run a Docker container',
          inputSchema: {
            type: 'object',
            properties: {
              image: {
                type: 'string',
                description: 'Docker image to run',
              },
              name: {
                type: 'string',
                description: 'Name for the container',
              },
              detach: {
                type: 'boolean',
                description: 'Run container in background',
              },
              ports: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Port mappings (e.g. ["8080:80"])',
              },
              volumes: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Volume mappings (e.g. ["/host/path:/container/path"])',
              },
              env: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Environment variables (e.g. ["KEY=value"])',
              },
              command: {
                type: 'string',
                description: 'Command to run in the container',
              },
            },
            required: ['image'],
          },
        },
        {
          name: 'stop_container',
          description: 'Stop a running Docker container',
          inputSchema: {
            type: 'object',
            properties: {
              container: {
                type: 'string',
                description: 'Container ID or name',
              },
            },
            required: ['container'],
          },
        },
        {
          name: 'remove_container',
          description: 'Remove a Docker container',
          inputSchema: {
            type: 'object',
            properties: {
              container: {
                type: 'string',
                description: 'Container ID or name',
              },
              force: {
                type: 'boolean',
                description: 'Force removal of running container',
              },
            },
            required: ['container'],
          },
        },
        {
          name: 'pull_image',
          description: 'Pull a Docker image from a registry',
          inputSchema: {
            type: 'object',
            properties: {
              image: {
                type: 'string',
                description: 'Image name (e.g. "nginx:latest")',
              },
            },
            required: ['image'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'list_containers':
            return await this.listContainers(request.params.arguments as unknown as ContainerArgs);
          case 'list_images':
            return await this.listImages();
          case 'run_container':
            return await this.runContainer(request.params.arguments as unknown as RunContainerArgs);
          case 'stop_container':
            return await this.stopContainer(request.params.arguments as unknown as ContainerActionArgs);
          case 'remove_container':
            return await this.removeContainer(request.params.arguments as unknown as ContainerActionArgs);
          case 'pull_image':
            return await this.pullImage(request.params.arguments as unknown as ImageArgs);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error: any) {
        console.error(error);
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing Docker command: ${error.message}`
        );
      }
    });
  }

  private async listContainers(args: ContainerArgs) {
    const showAll = args?.all === true ? '-a' : '';
    const { stdout } = await execAsync(`docker ps ${showAll} --format "{{.ID}}\\t{{.Image}}\\t{{.Status}}\\t{{.Names}}"`);
    
    const containers = stdout.trim().split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const [id, image, status, name] = line.split('\t');
        return { id, image, status, name };
      });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(containers, null, 2),
        },
      ],
    };
  }

  private async listImages() {
    const { stdout } = await execAsync('docker images --format "{{.Repository}}:{{.Tag}}\\t{{.ID}}\\t{{.Size}}"');
    
    const images = stdout.trim().split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const [name, id, size] = line.split('\t');
        return { name, id, size };
      });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(images, null, 2),
        },
      ],
    };
  }

  private async runContainer(args: RunContainerArgs) {
    if (!args.image) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Image parameter is required'
      );
    }

    let command = 'docker run';
    
    if (args.detach) {
      command += ' -d';
    }
    
    if (args.name) {
      command += ` --name ${args.name}`;
    }
    
    if (args.ports && Array.isArray(args.ports)) {
      args.ports.forEach((port: string) => {
        command += ` -p ${port}`;
      });
    }
    
    if (args.volumes && Array.isArray(args.volumes)) {
      args.volumes.forEach((volume: string) => {
        command += ` -v ${volume}`;
      });
    }
    
    if (args.env && Array.isArray(args.env)) {
      args.env.forEach((env: string) => {
        command += ` -e ${env}`;
      });
    }
    
    command += ` ${args.image}`;
    
    if (args.command) {
      command += ` ${args.command}`;
    }
    
    const { stdout } = await execAsync(command);
    
    return {
      content: [
        {
          type: 'text',
          text: stdout.trim(),
        },
      ],
    };
  }

  private async stopContainer(args: ContainerActionArgs) {
    if (!args.container) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Container parameter is required'
      );
    }
    
    const { stdout } = await execAsync(`docker stop ${args.container}`);
    
    return {
      content: [
        {
          type: 'text',
          text: stdout.trim(),
        },
      ],
    };
  }

  private async removeContainer(args: ContainerActionArgs) {
    if (!args.container) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Container parameter is required'
      );
    }
    
    const force = args.force === true ? ' -f' : '';
    const { stdout } = await execAsync(`docker rm${force} ${args.container}`);
    
    return {
      content: [
        {
          type: 'text',
          text: stdout.trim(),
        },
      ],
    };
  }

  private async pullImage(args: ImageArgs) {
    if (!args.image) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Image parameter is required'
      );
    }
    
    const { stdout } = await execAsync(`docker pull ${args.image}`);
    
    return {
      content: [
        {
          type: 'text',
          text: stdout.trim(),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Docker MCP server running on stdio');
  }
}

const server = new DockerServer();
server.run().catch(console.error);
