#!/bin/bash

# Exit on error
set -e

echo "Building Docker MCP server..."
npm run build

echo "Running tests..."
node test.js

echo "All done! The Docker MCP server is ready to use."
echo "To install the server configuration, run: npm run install-config"
