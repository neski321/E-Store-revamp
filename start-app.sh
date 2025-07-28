#!/bin/bash

# E-Commerce Full Stack Startup Script
echo "🚀 Starting E-Commerce Full Stack Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "e-commerce" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the E-Commerce root directory"
    exit 1
fi

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists python3; then
    print_error "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

print_success "Prerequisites check passed!"

# Setup backend virtual environment
print_status "Setting up backend environment..."
cd backend

if [ ! -d "venv" ]; then
    print_status "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt

# Run database migrations
print_status "Running database migrations..."
python manage.py migrate

# Collect static files
print_status "Collecting static files..."
python manage.py collectstatic --noinput

cd ..

# Setup frontend dependencies
print_status "Setting up frontend environment..."
cd e-commerce

if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

cd ..

# Check if root dependencies are installed
if [ ! -d "node_modules" ]; then
    print_status "Installing root dependencies..."
    npm install
fi

print_success "Environment setup complete!"

# Start the application
print_status "Starting the application..."
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Django Admin: http://localhost:8000/admin"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend server
print_status "Starting Django backend server..."
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
print_status "Starting React frontend server..."
cd e-commerce
npm start &
FRONTEND_PID=$!
cd ..

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 