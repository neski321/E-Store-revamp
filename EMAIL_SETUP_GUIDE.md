# 📧 Email Setup Guide for Testing (No Domain Required)

## 🏆 Recommended: Gmail SMTP Setup

### Step 1: Prepare Your Gmail Account

1. **Use any Gmail account** (personal or business)
2. **Enable 2-Factor Authentication:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification
   - Follow the setup process

3. **Generate App Password:**
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" as the app
   - Copy the 16-digit password (you'll need this)

### Step 2: Set Environment Variables

Add these to your Railway dashboard or `.env` file:

```bash
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-16-digit-app-password
DEFAULT_FROM_EMAIL=your-gmail@gmail.com

# Your app URLs
FRONTEND_URL=https://your-railway-app.up.railway.app
```

### Step 3: Test Locally

```bash
# Navigate to backend directory
cd backend

# Set environment variables (replace with your values)
export EMAIL_HOST=smtp.gmail.com
export EMAIL_PORT=587
export EMAIL_USE_TLS=True
export EMAIL_HOST_USER=your-gmail@gmail.com
export EMAIL_HOST_PASSWORD=your-16-digit-app-password
export DEFAULT_FROM_EMAIL=your-gmail@gmail.com
export FRONTEND_URL=http://localhost:3000

# Run the test script
python test_email.py
```

### Step 4: Test on Railway

1. **Add environment variables to Railway dashboard**
2. **Deploy your app**
3. **Test signup flow** - welcome emails will be sent automatically

---

## 🚀 Alternative Options (No Domain Required)

### Option 2: SendGrid (Free Tier)

**Benefits:**
- 100 free emails/day
- Professional service
- No domain required initially

**Setup:**
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify sender identity (use your Gmail)
3. Get API key
4. Update email service

**Environment Variables:**
```bash
SENDGRID_API_KEY=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=your-gmail@gmail.com
```

### Option 3: Mailgun (Free Tier)

**Benefits:**
- 10,000 free emails/month
- No domain required for testing
- Reliable delivery

**Setup:**
1. Sign up at [mailgun.com](https://mailgun.com)
2. Use sandbox domain for testing
3. Get API key
4. Update email service

---

## 📋 Quick Test Commands

### Test Email API Endpoints:

```bash
# Test welcome email
curl -X POST http://localhost:8000/api/send-welcome-email/ \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "your-email@gmail.com", "displayName": "Test User"}'

# Test verification reminder
curl -X POST http://localhost:8000/api/send-verification-reminder/ \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "your-email@gmail.com", "displayName": "Test User"}'
```

### Test Signup Flow:

1. Go to your signup page
2. Create a new account
3. Check your email for welcome message
4. Check spam folder if not in inbox

---

## 🔧 Troubleshooting

### Common Issues:

**1. "Authentication failed" error:**
- Make sure 2FA is enabled
- Use App Password, not regular password
- Check EMAIL_HOST_USER is correct

**2. "Connection refused" error:**
- Check EMAIL_HOST and EMAIL_PORT
- Try EMAIL_USE_SSL=True instead of TLS

**3. Emails going to spam:**
- This is normal for testing
- Use a professional sender name
- Avoid spam trigger words

**4. "Invalid credentials" error:**
- Regenerate App Password
- Make sure no spaces in password
- Check Gmail account settings

---

## 📈 Production Recommendations

### When you get a domain:

1. **Set up SPF record:**
   ```
   v=spf1 include:_spf.google.com ~all
   ```

2. **Set up DKIM:**
   - Follow Gmail's DKIM setup guide
   - Add TXT record to your DNS

3. **Set up DMARC:**
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
   ```

4. **Use professional email service:**
   - SendGrid, Mailgun, or AWS SES
   - Better deliverability
   - Analytics and tracking

---

## ✅ Testing Checklist

- [ ] Gmail 2FA enabled
- [ ] App Password generated
- [ ] Environment variables set
- [ ] Local test passes
- [ ] Railway deployment successful
- [ ] Signup flow tested
- [ ] Welcome email received
- [ ] Email not in spam folder

---

## 🎯 Expected Results

**Welcome Email Should Include:**
- Professional HTML design
- Personalized greeting
- Store features overview
- Call-to-action button
- Contact information
- Unsubscribe option

**Timing:**
- Email sent within 2-3 seconds of signup
- Non-blocking (doesn't slow down signup)
- Error logged if sending fails

---

## 💡 Pro Tips

1. **Use a dedicated email** for testing (not your main Gmail)
2. **Test with multiple email providers** (Gmail, Yahoo, Outlook)
3. **Check spam folders** during testing
4. **Monitor email logs** for delivery issues
5. **Set up email templates** for different scenarios
6. **Add unsubscribe links** for compliance
7. **Track email metrics** in production

This setup will work perfectly for testing and can easily scale to production when you get your domain!
