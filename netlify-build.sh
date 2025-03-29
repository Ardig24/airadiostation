#!/bin/bash
# Custom build script for Netlify
set -e  # Exit immediately if a command exits with a non-zero status

# Print Node.js and npm versions for debugging
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Clean install to avoid any caching issues
echo "Cleaning npm cache..."
npm cache clean --force

# Install dependencies with legacy peer deps flag
echo "Installing dependencies with --legacy-peer-deps flag..."
npm install --legacy-peer-deps

# Run the build with CI=false to prevent treating warnings as errors
echo "Building the application..."
CI=false npm run build

echo "Build completed successfully!"
