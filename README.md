# E-Commerce Full Stack Application

A comprehensive, production-ready e-commerce platform built with React frontend, Django backend, and Firebase authentication. Features include advanced product management, secure payment processing with Stripe, image management with Cloudflare R2, and a complete admin dashboard.

## 🚀 Features

### ✅ Core Features
- **Advanced User Authentication**
  - Email/Password registration and login
  - Social login (Google, Facebook, GitHub)
  - Password reset functionality
  - Email verification
  - "Remember me" functionality
  - Guest mode for browsing
  - Account management and profile updates
  - Secure session management

- **Comprehensive Product Management**
  - Product listings with advanced search and filtering
  - Product details with multiple images and descriptions
  - Category-based browsing with dynamic categories
  - Complete admin panel for product CRUD operations
  - Advanced review system with moderation
  - Product image management with Cloudflare R2
  - Inventory tracking and stock management
  - Product dimensions and specifications

- **Enhanced Shopping Experience**
  - Shopping cart functionality with persistence
  - Wishlist/favorites system
  - Advanced product search with smart filtering
  - Responsive design for all devices
  - Product comparison and reviews
  - Category-based product discovery

- **Secure Payment Processing**
  - Stripe integration for secure payments
  - Real-time payment processing
  - Order confirmation emails
  - Payment validation and error handling
  - Order tracking and status updates
  - Multiple payment methods support

- **Complete Order Management**
  - Full order lifecycle management
  - Order confirmation and tracking
  - Automated email notifications
  - Order history for users
  - Admin order management dashboard
  - Order status updates and tracking

- **Advanced Admin Features**
  - Multi-step product creation wizard
  - Product update with image management
  - Product deletion with cleanup
  - Review moderation system
  - Category management
  - User management and analytics
  - Bulk operations support
  - Newsletter management system
  - Subscriber analytics and management
  - Custom newsletter composition

- **Image Management System**
  - Cloudflare R2 integration for image storage
  - Multiple image upload per product
  - Image deletion with automatic cleanup
  - Image optimization and CDN delivery
  - Thumbnail generation
  - Drag-and-drop upload interface

- **Enhanced Search & Filtering**
  - Smart product search with auto-complete
  - Advanced filtering by category, price, rating
  - Search result optimization
  - Product selection modals
  - Search history and suggestions

- **Newsletter System**
  - Complete newsletter subscription management
  - Footer newsletter signup with validation
  - Admin newsletter management dashboard
  - Subscriber analytics and export functionality
  - Custom newsletter composition and sending
  - Email cooldown system to prevent spam
  - Unsubscribe functionality with confirmation
  - HTML and plain text newsletter support
  - Welcome email system for new subscribers

- **Security & Validation**
  - Comprehensive input validation
  - Payment security with Stripe
  - Data sanitization and protection
  - Error handling and user feedback
  - Authentication middleware
  - CORS protection

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI framework
- **Tailwind CSS 3.4.4** - Utility-first CSS framework
- **Firebase 10.12.2** - Authentication & real-time database
- **Stripe React 3.8.1** - Secure payment processing
- **React Router 6.23.1** - Client-side routing
- **Axios 1.7.2** - HTTP client for API calls

### Backend
- **Django 5.2.3** - High-level Python web framework
- **Django REST Framework 3.16.0** - Powerful API framework
- **PostgreSQL** - Robust relational database
- **Stripe 12.3.0** - Payment processing integration
- **Firebase Admin 6.9.0** - Server-side Firebase integration
- **Pillow 11.0.0** - Image processing library
- **Boto3 1.35.85** - AWS SDK for Cloudflare R2

### External Services
- **Firebase** - Authentication, Firestore, and real-time features
- **Stripe** - Payment processing and subscription management
- **Cloudflare R2** - Object storage for images and assets
- **Railway** - Cloud hosting and deployment platform

### Development Tools
- **Node.js 16+** - JavaScript runtime
- **Python 3.8+** - Backend runtime
- **Gunicorn 23.0.0** - WSGI HTTP server
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v16 or higher) - For React frontend
- **Python** (v3.8 or higher) - For Django backend
- **PostgreSQL** (v12 or higher) - Database server
- **Firebase Project** - Authentication and Firestore
- **Stripe Account** - Payment processing
- **Cloudflare Account** - R2 object storage for images
- **Railway Account** (optional) - For deployment

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
REACT_APP_API_URL=http://localhost:8000/api
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
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_gmail_address@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_r2_bucket_name
CLOUDFLARE_R2_ENDPOINT_URL=your_r2_endpoint_url
```

### 5. Database Setup
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

### 6. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password, Google, Facebook, and GitHub providers
3. Download service account key for backend integration
4. Configure Firebase Security Rules for Firestore
5. Enable Firestore database

### 7. Stripe Configuration

1. Create a Stripe account at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get API keys (publishable and secret) from the API section
3. Configure webhook endpoint for payment events
4. Set up payment methods and currencies
5. Test with Stripe test mode first

### 8. Gmail SMTP Configuration

1. Create a Gmail account or use existing Gmail account
2. Enable 2-Factor Authentication on your Gmail account
3. Generate an App Password for the application:
   - Go to Google Account settings
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password in EMAIL_HOST_PASSWORD
4. Configure the email settings in your backend environment variables
5. Test email sending with the provided test scripts

### 9. Cloudflare R2 Configuration

1. Create a Cloudflare account at [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Set up R2 Object Storage
3. Create a new R2 bucket for images
4. Generate API tokens with R2 permissions
5. Configure CORS settings for your domain

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

## 📧 Newsletter Management System

### Newsletter Features
- **Footer Subscription**: Seamless newsletter signup in website footer
- **Email Validation**: Real-time email validation and error handling
- **Welcome Emails**: Automated welcome emails for new subscribers
- **Unsubscribe Links**: Easy unsubscribe functionality with confirmation
- **Admin Dashboard**: Complete newsletter management interface
- **Subscriber Analytics**: Detailed statistics and export functionality

### Admin Newsletter Management
- **Subscriber Overview**: View all subscribers with detailed information
- **Custom Newsletters**: Compose and send custom newsletters to specific subscribers
- **Bulk Operations**: Unsubscribe multiple users with confirmation
- **Export Data**: Export subscriber data to CSV format
- **Real-time Stats**: Live subscriber count and analytics
- **Email Templates**: Professional HTML email templates

### Email System
- **Cooldown System**: Intelligent email timing to prevent spam
- **HTML Support**: Rich HTML newsletters with plain text fallback
- **Professional Templates**: Responsive email templates
- **Error Handling**: Comprehensive error handling and user feedback
- **Threading Support**: Non-blocking email sending with threading

## 📱 API Endpoints

### Products
- `GET /api/products/` - List products with filtering and pagination
- `GET /api/products/?ids=1,2,3` - Get specific products by IDs (comma-separated)
- `GET /api/products/{id}/` - Get product details
- `POST /api/products/` - Create new product (Admin only)
- `PUT /api/products/{id}/` - Update product (Admin only)
- `PATCH /api/products/{id}/` - Partial update product (Admin only)
- `DELETE /api/products/{id}/` - Delete product (Admin only)
- `GET /api/categories/` - Get available categories
- `POST /api/categories/` - Create new category (Admin only)

### Image Management
- `POST /api/products/upload-images/` - Upload product images to Cloudflare R2
- `POST /api/upload-profile-picture/` - Upload user profile picture to Cloudflare R2
- `DELETE /api/products/delete-image/{filename}/` - Delete specific image
- `GET /api/products/{id}/images/` - Get product images

### Reviews
- `GET /api/products/{id}/reviews/` - Get product reviews
- `POST /api/products/{id}/reviews/` - Create product review
- `PUT /api/reviews/{id}/` - Update review (Admin only)
- `DELETE /api/reviews/{id}/` - Delete review (Admin only)
- `GET /api/reviews/pending/` - Get pending reviews (Admin only)
- `POST /api/reviews/{id}/moderate/` - Moderate review (Admin only)

### Search & Filtering
- `GET /api/products/search/` - Advanced product search
- `GET /api/products/filter/` - Filter products by category, price, rating
- `GET /api/products/featured/` - Get featured products

### Payment Processing
- `POST /api/create-payment-intent/` - Create Stripe payment intent
- `POST /api/confirm-payment/` - Confirm payment completion
- `POST /api/webhook/` - Stripe webhook handler

### Order Management
- `GET /api/orders/` - Get user orders
- `POST /api/orders/` - Create new order
- `GET /api/orders/{id}/` - Get order details
- `POST /api/send-order-confirmation/` - Send order confirmation email
- `GET /api/orders/admin/` - Get all orders (Admin only)

### User Management
- `GET /api/user/profile/` - Get user profile
- `PUT /api/user/profile/` - Update user profile
- `POST /api/user/favorites/` - Add product to favorites
- `DELETE /api/user/favorites/{id}/` - Remove product from favorites
- `GET /api/user/favorites/` - Get user favorites

### Newsletter Management
- `POST /api/newsletter/subscribe/` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe/` - Unsubscribe from newsletter
- `GET /api/newsletter/check/` - Check subscription status
- `GET /api/newsletter/subscribers/` - Get all subscribers (Admin only)
- `POST /api/newsletter/admin-unsubscribe/` - Admin unsubscribe user (Admin only)
- `POST /api/newsletter/send-to-subscriber/` - Send newsletter to specific subscriber (Admin only)

## 🛡️ Security Features

- **Input Validation**: Comprehensive form validation
- **Payment Security**: Stripe's PCI-compliant payment processing
- **Authentication**: Firebase's secure authentication system
- **Data Protection**: Encrypted data transmission
- **Error Handling**: Graceful error handling and user feedback

## 📧 Email Configuration

The application uses **Gmail SMTP** for reliable email delivery and sends emails for:
- Order confirmations
- Password reset links
- Email verification
- Account notifications
- **Welcome emails** (sent automatically to new users)
- Newsletter welcome emails
- Newsletter subscriptions
- Custom newsletters to subscribers

### Email Features
- **Gmail SMTP Integration**: Reliable email delivery through Gmail's SMTP servers
- **Welcome Emails**: Automatically sent to new users upon account creation with professional HTML templates
- **Newsletter Welcome**: Sent when users subscribe to newsletter with intelligent timing
- **Email Cooldown System**: Prevents duplicate emails with intelligent timing controls
- **HTML Support**: Rich HTML email templates with fallback to plain text
- **Unsubscribe Links**: Automatic unsubscribe links in all newsletters
- **Admin Notifications**: Email notifications for admin actions
- **Professional Templates**: Responsive email templates with company branding

### Gmail SMTP Setup
- **SMTP Server**: smtp.gmail.com (port 587 with TLS)
- **Authentication**: Gmail App Password (not regular password)
- **Security**: 2-Factor Authentication required for App Password generation
- **Reliability**: Gmail's robust infrastructure ensures high deliverability

Configure your Gmail SMTP settings in the backend environment variables.

## 🚀 Deployment

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch
4. Configure custom domain (optional)

### Environment Variables for Production
```env
DEBUG=False
ALLOWED_HOSTS=*.railway.app,healthcheck.railway.app,your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://your-app.railway.app
STRIPE_SECRET_KEY=your_production_stripe_key
STRIPE_WEBHOOK_SECRET=your_production_webhook_secret
CLOUDFLARE_R2_ACCESS_KEY_ID=your_production_r2_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_production_r2_secret
CLOUDFLARE_R2_BUCKET_NAME=your_production_bucket
CLOUDFLARE_R2_ENDPOINT_URL=your_production_endpoint
FIREBASE_PROJECT_ID=your_production_firebase_project
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
# Gmail SMTP Configuration for Production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_production_gmail@gmail.com
EMAIL_HOST_PASSWORD=your_production_gmail_app_password
```

### Deployment Checklist
- [ ] Set up Railway project
- [ ] Configure environment variables
- [ ] Set up PostgreSQL database
- [ ] Configure Firebase production project
- [ ] Set up Stripe production account
- [ ] Configure Cloudflare R2 production bucket
- [ ] **Set up Gmail SMTP with App Password**
- [ ] **Test email sending functionality**
- [ ] Test all integrations
- [ ] Set up monitoring and logging
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificates

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

### Version 2.0 - Major Feature Release
- ✅ **Payment Processing**: Complete Stripe integration with webhooks
- ✅ **Order Management**: Full order lifecycle with tracking
- ✅ **Authentication**: Enhanced security with Firebase
- ✅ **Email System**: Automated notifications and confirmations
- ✅ **Validation**: Comprehensive input validation system
- ✅ **Error Handling**: Improved user experience and feedback

### Version 2.1 - Admin & Image Management
- ✅ **Admin Dashboard**: Complete product management interface
- ✅ **Image Management**: Cloudflare R2 integration for image storage
- ✅ **Product CRUD**: Multi-step wizards for product operations
- ✅ **Review Moderation**: Admin review approval system
- ✅ **Search Improvements**: Smart search with product selection
- ✅ **Category Management**: Dynamic category creation and management

### Version 2.2 - Enhanced User Experience
- ✅ **Advanced Search**: Smart filtering and product discovery
- ✅ **Image Optimization**: CDN delivery and automatic cleanup
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Performance**: Optimized loading and caching
- ✅ **Security**: Enhanced authentication and data protection
- ✅ **Documentation**: Comprehensive setup and deployment guides

### Version 2.3 - Profile & Favorites Enhancement
- ✅ **Profile Picture System**: Complete profile picture upload and management
- ✅ **Cloudflare Integration**: Profile pictures stored in Cloudflare R2
- ✅ **Favorites Fix**: Resolved favorites page display issues
- ✅ **Enhanced UI**: Improved user interface with better navigation
- ✅ **API Improvements**: Added support for multiple product ID filtering
- ✅ **User Experience**: Streamlined checkout process from favorites

### Version 2.4 - Newsletter Management System (Latest)
- ✅ **Complete Newsletter System**: Full newsletter subscription and management
- ✅ **Admin Newsletter Dashboard**: Professional admin interface for newsletter management
- ✅ **Subscriber Analytics**: Detailed subscriber statistics and export functionality
- ✅ **Custom Newsletter Composition**: Rich text editor for creating custom newsletters
- ✅ **Email Cooldown System**: Intelligent email timing to prevent spam
- ✅ **Unsubscribe Management**: Admin can unsubscribe users with confirmation
- ✅ **Footer Integration**: Seamless newsletter signup in website footer
- ✅ **Welcome Email System**: Automated welcome emails for new subscribers

### Key Improvements in Latest Version
- **Newsletter Management**: Complete newsletter subscription and management system
- **Admin Newsletter Dashboard**: Professional interface for managing subscribers
- **Email System**: Advanced email system with cooldown and spam prevention
- **Custom Newsletter Composition**: Rich text editor for creating newsletters
- **Subscriber Analytics**: Detailed analytics and export functionality
- **Multi-step Product Creation**: Intuitive wizard for adding products
- **Image Management**: Upload, delete, and manage product images
- **Smart Search**: Advanced search with auto-complete and filtering
- **Review System**: Complete review management with moderation
- **Admin Interface**: Professional admin dashboard for all operations
- **Cloudflare Integration**: Fast image delivery and storage
- **Enhanced Validation**: Real-time form validation and error handling
- **Mobile Optimization**: Fully responsive design for all devices

### Newsletter Management System (Latest Release)
- **Complete Newsletter System**: Full newsletter subscription and management functionality
  - Newsletter subscription from website footer with validation
  - Admin newsletter management dashboard with subscriber analytics
  - Custom newsletter composition with HTML and plain text support
  - Email cooldown system to prevent spam and duplicate emails
  - Unsubscribe functionality with admin management capabilities
  - Welcome email system for new subscribers with intelligent timing

- **Admin Newsletter Dashboard**:
  - Professional interface for managing newsletter subscribers
  - Subscriber analytics with total, active, and inactive counts
  - Export functionality to CSV for subscriber data
  - Send custom newsletters to specific subscribers
  - Unsubscribe users with confirmation modal
  - Real-time subscriber statistics and management

- **Email System Enhancements**:
  - **Gmail SMTP Integration** for reliable email delivery
  - **Automatic Welcome Emails** sent to new users upon account creation
  - Advanced email service with cooldown and timing controls
  - HTML and plain text newsletter support
  - Automatic unsubscribe links in all newsletters
  - Welcome email system with intelligent delay timing
  - Email validation and error handling
  - Professional email templates with responsive design

- **Backend API Improvements**:
  - New newsletter subscription endpoints (`/api/newsletter/`)
  - Admin newsletter management endpoints
  - Email service integration with cooldown system
  - Enhanced authentication for admin-only features
  - Comprehensive error handling and validation

- **UI/UX Improvements**:
  - Newsletter signup form in website footer
  - Professional newsletter management interface
  - Custom newsletter composition modal
  - Real-time validation and user feedback
  - Responsive design for all newsletter features
  - Loading states and success/error messaging

- **Security & Performance**:
  - Admin-only access to newsletter management features
  - Email cooldown system to prevent spam
  - Comprehensive input validation
  - Secure API endpoints with proper authentication
  - Optimized email sending with threading support

---

**Note**: This is a production-ready e-commerce application with all essential features implemented. The application includes advanced admin features, image management, profile picture system, complete newsletter management system, and comprehensive user experience improvements. Make sure to configure all environment variables and external services before deployment.
