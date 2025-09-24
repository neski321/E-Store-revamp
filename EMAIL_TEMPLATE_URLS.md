# Email Template URL Configuration

This document explains how URL variables work in email templates and how to configure them for different environments.

## URL Variables Available

The following variables are automatically available in email templates:

- `{email}` - User's email address
- `{name}` - User's name (defaults to "Valued Customer")
- `{company}` - Company name (defaults to "E-Store")
- `{website}` - Main website URL
- `{login_url}` - Login page URL
- `{unsubscribe_url}` - Unsubscribe page URL (includes email parameter)
- `{support_email}` - Support email address
- `{shop_url}` - Products/shop page URL

## Environment Configuration

### Frontend (React)
The frontend automatically uses `window.location.origin` to determine the correct URLs for the current environment:
- **Local Development**: `http://localhost:3000`
- **Production (Railway)**: Your Railway domain (e.g., `https://your-app.railway.app`)

### Backend (Django)
The backend uses the `FRONTEND_URL` environment variable:
- **Local Development**: `FRONTEND_URL=http://localhost:3000`
- **Production (Railway)**: `FRONTEND_URL=https://your-app.railway.app`

## Setting Environment Variables

### For Local Development
Create a `.env` file in the backend directory:
```bash
FRONTEND_URL=http://localhost:3000
```

### For Railway Deployment
Set the environment variable in your Railway dashboard:
```bash
FRONTEND_URL=https://your-app.railway.app
```

## Example Template Usage

```text
=== Welcome to Our Store! ===

Hi {name},

Thank you for joining our community!

[BUTTON: Start Shopping Now]({shop_url})
[BUTTON: Login to Your Account]({login_url})

Need help? Contact us at {support_email}

[Unsubscribe from our emails]({unsubscribe_url})
```

## Testing URLs

### Local Testing
- Website: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Shop: `http://localhost:3000/products`
- Unsubscribe: `http://localhost:3000/unsubscribe?email=user@example.com`

### Production (Railway)
- Website: `https://your-app.railway.app`
- Login: `https://your-app.railway.app/login`
- Shop: `https://your-app.railway.app/products`
- Unsubscribe: `https://your-app.railway.app/unsubscribe?email=user@example.com`

## Automatic URL Detection

The system automatically detects the correct URLs based on the environment:

1. **Frontend**: Uses `window.location.origin` to get the current domain
2. **Backend**: Uses `FRONTEND_URL` environment variable
3. **Email Templates**: Variables are replaced with the correct URLs when emails are sent

This ensures that links in emails always point to the correct environment, whether you're testing locally or running in production.

