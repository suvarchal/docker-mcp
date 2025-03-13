#!/usr/bin/env node
import { spawn } from 'child_process';
import { createInterface } from 'readline';

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Create readline interface for reading server output
const rl = createInterface({
  input: server.stdout,
  crlfDelay: Infinity
});

// Wait for server to start
setTimeout(() => {
  console.log('Testing Docker MCP server...');
  
  // Test list_tools request
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: '1',
    method: 'list_tools',
    params: {}
  };
  
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
  
  // Test run_container request (hello-world)
  setTimeout(() => {
    const runContainerRequest = {
      jsonrpc: '2.0',
      id: '2',
      method: 'call_tool',
      params: {
        name: 'run_container',
        arguments: {
          image: 'hello-world'
        }
      }
    };
    
    server.stdin.write(JSON.stringify(runContainerRequest) + '\n');
  }, 1000);
  
  // Exit after tests
  setTimeout(() => {
    console.log('Tests completed. Exiting...');
    server.kill();
    process.exit(0);
  }, 5000);
}, 1000);

// Handle server responses
rl.on('line', (line) => {
  try {
    const response = JSON.parse(line);
    console.log('Server response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error parsing response:', error);
  }
});

// Handle server exit
server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});
