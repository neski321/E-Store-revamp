#!/bin/bash

echo "🚀 Starting Django server on port 3000..."

# Set the port to 3000
export PORT=3000

# Start Django server on port 3000
python manage.py runserver 0.0.0.0:3000 