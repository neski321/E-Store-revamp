#!/bin/bash

echo "🚀 Starting E-Commerce Django Server..."

# Navigate to backend directory
cd backend

# Use the PORT environment variable that Railway provides
# If not set, default to 8000
PORT=${PORT:-8000}

echo "📡 Server will run on port: $PORT"
echo "🌐 Environment: ${DEBUG:-False}"

# Install gunicorn if not already installed
pip install gunicorn

# Set environment variables for production
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1

# Set Node.js options for production (in case any Node.js processes are spawned)
export NODE_OPTIONS="--no-deprecation"

# Start Django server with gunicorn for production
echo "🔧 Starting Gunicorn with optimized settings..."
gunicorn backend.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 3 \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --preload \
    --access-logfile - \
    --error-logfile - \
    --log-level info

echo "✅ Server started successfully!" 