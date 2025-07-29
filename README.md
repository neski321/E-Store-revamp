# E-Commerce Full Stack Application

A comprehensive e-commerce platform built with React frontend, Django backend, and Firebase authentication. Features include product management, shopping cart, secure payment processing with Stripe, and advanced user authentication.

## 🚀 Features

### ✅ Implemented Features
- **User Authentication (Enhanced)**
  - Email/Password registration and login
  - Social login (Google, Facebook, GitHub)
  - Password reset functionality
  - Email verification
  - "Remember me" functionality
  - Guest mode for browsing
  - Account management and profile updates

- **Product Management**
  - Product listings with search and filtering
  - Product details with images and descriptions
  - Category-based browsing
  - Admin panel for product management
  - Review system with moderation

- **Shopping Experience**
  - Shopping cart functionality
  - Wishlist/favorites
  - Product search and filtering
  - Responsive design for all devices

- **Payment Processing (NEW)**
  - Stripe integration for secure payments
  - Real-time payment processing
  - Order confirmation emails
  - Payment validation and error handling
  - Order tracking and status updates

- **Order Management (NEW)**
  - Complete order lifecycle
  - Order confirmation and tracking
  - Email notifications
  - Order history for users
  - Admin order management

- **Security & Validation (NEW)**
  - Enhanced billing/shipping validation
  - Payment security with Stripe
  - Input validation and sanitization
  - Error handling and user feedback

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Firebase Authentication** - User management
- **Stripe React** - Payment processing
- **React Router** - Navigation

### Backend
- **Django 5.2** - Web framework
- **Django REST Framework** - API
- **PostgreSQL** - Database
- **Stripe Python** - Payment processing
- **Firebase Admin** - Authentication integration

### External Services
- **Firebase** - Authentication & Firestore
- **Stripe** - Payment processing
- **Railway** - Hosting & deployment

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (or Railway PostgreSQL)
- **Firebase Project** with Authentication enabled
- **Stripe Account** for payment processing

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd E-Commerce
```

### 2. Frontend Setup
```bash
cd e-commerce
npm install
```

### 3. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Environment Configuration

#### Frontend Environment (.env in e-commerce/)
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

#### Backend Environment (.env in backend/)
```env
SECRET_KEY=your_django_secret_key
DEBUG=True
DATABASE_URL=your_database_url
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
DEFAULT_FROM_EMAIL=noreply@yourstore.com
```

### 5. Database Setup
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

### 6. Firebase Configuration

1. Create a Firebase project
2. Enable Authentication with Email/Password, Google, Facebook, and GitHub providers
3. Download service account key for backend
4. Configure Firebase Security Rules for Firestore

### 7. Stripe Configuration

1. Create a Stripe account
2. Get API keys (publishable and secret)
3. Configure webhook endpoint for payment events
4. Set up payment methods and currencies

## 🚀 Running the Application

### Development Mode
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

### Production Mode
```bash
npm run build
npm run start:production
```

## 🌐 Access Points

When running in development mode:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **API Endpoints**: http://localhost:8000/api/

## 💳 Payment Processing Setup

### Stripe Integration
1. **Frontend**: Uses Stripe React components for secure card input
2. **Backend**: Processes payments through Stripe API
3. **Webhooks**: Handles payment events and order updates
4. **Email Notifications**: Sends order confirmations

### Payment Flow
1. User adds items to cart
2. Proceeds to checkout with billing/shipping info
3. Enters payment details securely via Stripe
4. Payment is processed and order is created
5. Confirmation email is sent
6. Order tracking is available

## 🔐 Authentication Features

### Enhanced Security
- **Password Reset**: Secure email-based password reset
- **Email Verification**: Account verification via email
- **Social Login**: Google, Facebook, GitHub integration
- **Remember Me**: Persistent login sessions
- **Guest Mode**: Browse without account creation

### User Management
- Profile updates and preferences
- Order history and tracking
- Address management
- Account security settings

## 📱 API Endpoints

### Products
- `GET /api/products/` - List products with filtering
- `GET /api/products/{id}/` - Product details
- `GET /api/categories/` - Available categories

### Authentication
- `POST /api/create-payment-intent/` - Create Stripe payment intent
- `POST /api/send-order-confirmation/` - Send order confirmation email
- `POST /api/webhook/` - Stripe webhook handler

## 🛡️ Security Features

- **Input Validation**: Comprehensive form validation
- **Payment Security**: Stripe's PCI-compliant payment processing
- **Authentication**: Firebase's secure authentication system
- **Data Protection**: Encrypted data transmission
- **Error Handling**: Graceful error handling and user feedback

## 📧 Email Configuration

The application sends emails for:
- Order confirmations
- Password reset links
- Email verification
- Account notifications

Configure your email settings in the backend environment variables.

## 🚀 Deployment

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
DEBUG=False
ALLOWED_HOSTS=*.railway.app,healthcheck.railway.app
CORS_ALLOWED_ORIGINS=https://your-domain.com
STRIPE_SECRET_KEY=your_production_stripe_key
STRIPE_WEBHOOK_SECRET=your_production_webhook_secret
```

## 🔧 Development Scripts

```bash
# Install all dependencies
npm run install:all

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Database operations
npm run migrate
npm run makemigrations
npm run shell
npm run createsuperuser
```

## 📊 Monitoring & Analytics

- **Payment Analytics**: Track through Stripe Dashboard
- **User Analytics**: Firebase Analytics integration
- **Error Monitoring**: Django error logging
- **Performance**: React performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Contact the development team
- Check the issue tracker

## 🔄 Recent Updates

### Version 2.0 - Enhanced Features
- ✅ **Payment Processing**: Complete Stripe integration
- ✅ **Order Management**: Full order lifecycle
- ✅ **Authentication**: Enhanced security features
- ✅ **Email System**: Automated notifications
- ✅ **Validation**: Comprehensive input validation
- ✅ **Error Handling**: Improved user experience

---

**Note**: This is a production-ready e-commerce application with all essential features implemented. Make sure to configure all environment variables and external services before deployment.
