#!/bin/bash

# Build troubleshooting script for deployment issues

echo "🔧 MyOwnStore Frontend Deployment Troubleshooter"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the Frontend directory."
    exit 1
fi

echo "✅ Found package.json"

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies found"
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Build output:"
    ls -la dist/
    echo ""
    echo "🌐 To test locally, run: npm run preview"
    echo "🚀 Ready for deployment!"
else
    echo "❌ Build failed. Check the errors above."
    exit 1
fi

echo ""
echo "📋 Deployment Checklist:"
echo "- ✅ vercel.json configured with proper routes"
echo "- ✅ vite.config.js updated with build settings"
echo "- ✅ Static assets properly configured"
echo "- ✅ Build script ready"
echo ""
echo "🔄 If you still get MIME type errors after deployment:"
echo "1. Clear your browser cache"
echo "2. Wait a few minutes for CDN propagation"
echo "3. Check Vercel deployment logs"
echo "4. Ensure your domain DNS is properly configured"
