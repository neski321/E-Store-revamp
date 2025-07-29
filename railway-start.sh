#!/bin/bash

echo "🚀 Starting Django server..."

# Navigate to backend directory
cd backend

# Use the PORT environment variable that Railway provides
# If not set, default to 3000
PORT=${PORT:-3000}

echo "📡 Server will run on port: $PORT"

# Install gunicorn if not already installed
pip install gunicorn

# Start Django server with gunicorn for production
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120 