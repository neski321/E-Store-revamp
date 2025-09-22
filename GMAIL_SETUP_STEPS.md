# 📧 Gmail SMTP Setup - Complete Guide

## Step 1: Gmail Account Preparation

### 1.1 Choose Your Gmail Account
- Use any Gmail account (personal or business)
- If you don't have one, create a new Gmail account
- **Recommended**: Create a dedicated account like `yourstore.notifications@gmail.com`

### 1.2 Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Find **2-Step Verification** and click it
4. Follow the setup process:
   - Add your phone number
   - Verify with SMS or call
   - Confirm setup

### 1.3 Generate App Password
1. Still in **Security** section
2. Find **App passwords** (you'll see this after enabling 2FA)
3. Click **App passwords**
4. Select app: **Mail**
5. Select device: **Other (custom name)**
6. Enter name: **E-Commerce App**
7. Click **Generate**
8. **COPY THE 16-DIGIT PASSWORD** (you'll need this!)

## Step 2: Test Locally First

### 2.1 Set Environment Variables
Create a `.env` file in your backend directory:

```bash
# Navigate to backend
cd backend

# Create .env file
touch .env
```

Add these lines to `.env`:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-16-digit-app-password
DEFAULT_FROM_EMAIL=your-gmail@gmail.com
FRONTEND_URL=http://localhost:3000
```

**Replace:**
- `your-gmail@gmail.com` with your actual Gmail
- `your-16-digit-app-password` with the password from Step 1.3

### 2.2 Test Email Functionality
```bash
# Make sure you're in backend directory
cd backend

# Run the test script
python test_email.py
```

Follow the prompts to test both welcome and verification emails.

## Step 3: Deploy to Railway

### 3.1 Add Environment Variables to Railway
1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Variables** tab
4. Add these variables one by one:

```
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = your-gmail@gmail.com
EMAIL_HOST_PASSWORD = your-16-digit-app-password
DEFAULT_FROM_EMAIL = your-gmail@gmail.com
FRONTEND_URL = https://your-railway-app.up.railway.app
```

### 3.2 Deploy and Test
1. Push your changes to trigger deployment
2. Wait for deployment to complete
3. Test signup flow on your live app
4. Check your email for welcome message

## Step 4: Verify Everything Works

### 4.1 Test Signup Flow
1. Go to your deployed app
2. Navigate to signup page
3. Create a new account with your email
4. Check your inbox for welcome email
5. Check spam folder if not in inbox

### 4.2 Test API Endpoints
```bash
# Replace with your actual Railway URL
curl -X POST https://your-railway-app.up.railway.app/api/send-welcome-email/ \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "your-email@gmail.com", "displayName": "Test User"}'
```

## Troubleshooting Common Issues

### Issue 1: "Authentication failed"
**Solution:**
- Double-check your Gmail address
- Make sure you're using App Password, not regular password
- Verify 2FA is enabled

### Issue 2: "Connection refused"
**Solution:**
- Check EMAIL_HOST and EMAIL_PORT
- Try EMAIL_USE_SSL=True instead of TLS
- Check your internet connection

### Issue 3: Emails in spam
**Solution:**
- This is normal for testing
- Mark as "Not Spam" in Gmail
- Use professional sender name

### Issue 4: "Invalid credentials"
**Solution:**
- Regenerate App Password
- Make sure no spaces in the password
- Check Gmail account settings

## Expected Results

✅ **Welcome email sent within 2-3 seconds of signup**
✅ **Professional HTML email with your branding**
✅ **Personalized greeting with user's name**
✅ **Links back to your app**
✅ **No impact on signup speed**

## Security Notes

- Never commit your `.env` file to git
- Use App Passwords, never regular passwords
- Consider using a dedicated email account
- Monitor email sending limits (Gmail: 500/day for free accounts)

## Next Steps After Testing

1. **Monitor email delivery** in production
2. **Set up email templates** for different scenarios
3. **Add unsubscribe functionality**
4. **Consider upgrading** to SendGrid/Mailgun for production scale
5. **Set up domain** and professional email later
