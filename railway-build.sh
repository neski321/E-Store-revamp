#!/bin/bash

echo "🚀 Railway Build Script - Building E-Commerce App..."

# Set environment variables for build
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Build React app
echo "⚛️ Building React frontend..."
cd e-commerce
npm install --legacy-peer-deps
npm run build
cd ..

# Run Django migrations
echo "🗄️ Running database migrations..."
cd backend
python manage.py migrate --noinput

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Create necessary directories
echo "📂 Creating necessary directories..."
mkdir -p staticfiles
mkdir -p ../e-commerce/build/static

cd ..

echo "✅ Build complete!"
echo "🎯 Features included:"
echo "  - Django REST API with authentication"
echo "  - React frontend with admin panel"
echo "  - Firebase authentication integration"
echo "  - Cloudflare R2 image storage"
echo "  - Stripe payment processing"
echo "  - Product management (CRUD operations)"
echo "  - Image upload/management"
echo "  - Review system"
echo "  - Search and filtering" 