#!/bin/bash

echo "🚀 Gmail SMTP Email Setup Script"
echo "================================"

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Please run this script from the project root directory"
    echo "   (where you can see the 'backend' and 'e-commerce' folders)"
    exit 1
fi

echo "📧 Gmail SMTP Email Setup"
echo ""

# Get Gmail credentials from user
read -p "Enter your Gmail address: " GMAIL_ADDRESS
read -s -p "Enter your 16-digit App Password: " APP_PASSWORD
echo ""

# Validate inputs
if [[ -z "$GMAIL_ADDRESS" ]]; then
    echo "❌ Gmail address is required"
    exit 1
fi

if [[ ${#APP_PASSWORD} -ne 16 ]]; then
    echo "❌ App Password must be 16 digits"
    exit 1
fi

echo ""
echo "🔧 Setting up environment variables..."

# Create .env file in backend directory
cat > backend/.env << EOF
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=$GMAIL_ADDRESS
EMAIL_HOST_PASSWORD=$APP_PASSWORD
DEFAULT_FROM_EMAIL=$GMAIL_ADDRESS

# Frontend URL (update this to your Railway URL when deploying)
FRONTEND_URL=http://localhost:3000
EOF

echo "✅ Created backend/.env file with Gmail configuration"
echo ""

# Test the configuration
echo "🧪 Testing email configuration..."
cd backend

# Check if Django is set up
if [ ! -f "manage.py" ]; then
    echo "❌ Django not found in backend directory"
    exit 1
fi

# Run the email test
echo "📧 Running email test..."
python test_email.py

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. If the test passed, your local setup is ready"
echo "2. Add the same environment variables to Railway dashboard"
echo "3. Deploy your app and test the signup flow"
echo ""
echo "🔗 Railway Environment Variables to add:"
echo "EMAIL_HOST=smtp.gmail.com"
echo "EMAIL_PORT=587"
echo "EMAIL_USE_TLS=True"
echo "EMAIL_HOST_USER=$GMAIL_ADDRESS"
echo "EMAIL_HOST_PASSWORD=$APP_PASSWORD"
echo "DEFAULT_FROM_EMAIL=$GMAIL_ADDRESS"
echo "FRONTEND_URL=https://your-railway-app.up.railway.app"
