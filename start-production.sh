#!/bin/bash

echo "🚀 Starting Production Build..."

# Activate virtual environment if it exists
if [ -d "backend/venv" ]; then
    echo "🐍 Activating virtual environment..."
    source backend/venv/bin/activate
fi

# Step 1: Build React app
echo "📦 Building React app..."
cd e-commerce
npm run build
cd ..

# Step 2: Collect static files
echo "📁 Collecting static files..."
cd backend
python manage.py collectstatic --noinput

# Step 3: Run migrations
echo "🗄️ Running migrations..."
python manage.py migrate

# Step 4: Start production server
echo "🌐 Starting production server on port 8080..."
echo "📱 Access your app at: http://localhost:8080/"
echo "🔧 API at: http://localhost:8080/api/products/"
echo "⚙️ Admin at: http://localhost:8080/admin/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start with gunicorn (production) or runserver (development)
if command -v gunicorn &> /dev/null; then
    echo "🚀 Using Gunicorn (Production WSGI server)..."
    PORT=8080 gunicorn backend.wsgi:application --bind 0.0.0.0:8080 --workers 2 --timeout 120
else
    echo "🔧 Using Django development server..."
    python manage.py runserver 0.0.0.0:8080
fi 