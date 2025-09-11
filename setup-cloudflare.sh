#!/bin/bash

# Cloudflare R2 Setup Script for E-Commerce Project

echo "🚀 Setting up Cloudflare R2 for your E-Commerce project..."
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file in backend directory..."
    cat > backend/.env << 'EOF'
# Database Configuration
DATABASE_URL=your-database-url-here

# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Cloudflare R2 Configuration (Add these after setting up Cloudflare)
# CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
# CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
# CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
# CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
# CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket-name.your-account-id.r2.cloudflarestorage.com

# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EOF
    echo "✅ Created backend/.env file"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📋 Next steps to complete Cloudflare R2 setup:"
echo ""
echo "1. 🌐 Go to https://dash.cloudflare.com/"
echo "2. 📦 Navigate to R2 Object Storage"
echo "3. 🆕 Create a new bucket (e.g., 'your-ecommerce-images')"
echo "4. 🔑 Go to My Profile → API Tokens → Create Token"
echo "5. ⚙️  Use 'Custom token' with R2:Edit permissions"
echo "6. 📝 Copy your Account ID from R2 dashboard"
echo "7. ✏️  Edit backend/.env and uncomment/update these lines:"
echo ""
echo "   CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id"
echo "   CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key"
echo "   CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name"
echo "   CLOUDFLARE_R2_ACCOUNT_ID=your-account-id"
echo "   CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket-name.your-account-id.r2.cloudflarestorage.com"
echo ""
echo "8. 🧪 Test the setup:"
echo "   cd backend && python manage.py runserver"
echo ""
echo "📚 For detailed instructions, see CLOUDFLARE_SETUP.md"
echo ""
echo "🎉 Setup script completed!"
