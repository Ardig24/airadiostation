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
npm install --legacy-peer-deps --no-audit --no-fund

# Check if we're using the new ESLint config
if [ -f ".eslintrc.cjs" ]; then
  echo "Using .eslintrc.cjs for ESLint configuration"
  # Rename the old config to avoid conflicts
  if [ -f "eslint.config.js" ]; then
    echo "Renaming eslint.config.js to eslint.config.js.bak to avoid conflicts"
    mv eslint.config.js eslint.config.js.bak
  fi
fi

# Run the build with CI=false to prevent treating warnings as errors
echo "Building the application..."
CI=false npm run build

echo "Build completed successfully!"
