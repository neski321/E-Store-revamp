#!/bin/bash

echo "🚀 Railway Build Script - Building E-Commerce App..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Build React app
echo "⚛️ Building React frontend..."
cd e-commerce
npm install
npm run build
cd ..

# Run Django migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Build complete!" 