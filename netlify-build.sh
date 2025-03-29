#!/bin/bash
# Custom build script for Netlify

# Install dependencies with legacy peer deps flag
echo "Installing dependencies with --legacy-peer-deps flag..."
npm install --legacy-peer-deps

# Run the build
echo "Building the application..."
npm run build

echo "Build completed successfully!"
