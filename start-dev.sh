#!/bin/bash

# E-Commerce Development Startup Script
echo "🚀 Starting E-Commerce Development Environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "e-commerce" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the E-Commerce root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if backend virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "🔧 Setting up backend virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    echo "✅ Backend virtual environment found"
fi

# Check if frontend dependencies are installed
if [ ! -d "e-commerce/node_modules" ]; then
    echo "🔧 Installing frontend dependencies..."
    cd e-commerce
    npm install
    cd ..
else
    echo "✅ Frontend dependencies found"
fi

# Check if root dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "🔧 Installing root dependencies..."
    npm install
fi

echo "✅ All dependencies are ready!"

# Start development servers
echo "🌐 Starting development servers..."
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:8000"
echo "📊 Django Admin will be available at: http://localhost:8000/admin"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both servers concurrently
npm run dev 