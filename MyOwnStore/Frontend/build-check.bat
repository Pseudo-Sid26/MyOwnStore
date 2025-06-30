@echo off
echo 🔧 MyOwnStore Frontend Deployment Troubleshooter
echo ================================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Make sure you're in the Frontend directory.
    exit /b 1
)

echo ✅ Found package.json

REM Check for node_modules
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
) else (
    echo ✅ Dependencies found
)

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist "dist" rmdir /s /q dist

REM Build the project
echo 🏗️  Building project...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    echo.
    echo 📁 Build output:
    dir dist
    echo.
    echo 🌐 To test locally, run: npm run preview
    echo 🚀 Ready for deployment!
) else (
    echo ❌ Build failed. Check the errors above.
    exit /b 1
)

echo.
echo 📋 Deployment Checklist:
echo - ✅ vercel.json configured with proper routes
echo - ✅ vite.config.js updated with build settings
echo - ✅ Static assets properly configured
echo - ✅ Build script ready
echo.
echo 🔄 If you still get MIME type errors after deployment:
echo 1. Clear your browser cache
echo 2. Wait a few minutes for CDN propagation
echo 3. Check Vercel deployment logs
echo 4. Ensure your domain DNS is properly configured

pause
