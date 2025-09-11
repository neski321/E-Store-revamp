# Railway Deployment Checklist

## ✅ **Pre-Deployment Checklist**

### **1. Environment Variables Setup**
Ensure all these variables are set in your Railway dashboard:

#### **Django Backend Variables:**
- [ ] `DEBUG=False`
- [ ] `SECRET_KEY=your_django_secret_key`
- [ ] `DATABASE_URL` (auto-provided by Railway PostgreSQL)
- [ ] `ALLOWED_HOSTS=*.railway.app,healthcheck.railway.app,e-commerce-by-neski.up.railway.app`
- [ ] `CORS_ALLOWED_ORIGINS=https://e-commerce-by-neski.up.railway.app`

#### **Firebase Configuration:**
- [ ] `FIREBASE_PROJECT_ID=your_firebase_project_id`
- [ ] `FIREBASE_PRIVATE_KEY_ID=your_private_key_id`
- [ ] `FIREBASE_PRIVATE_KEY=your_private_key`
- [ ] `FIREBASE_CLIENT_EMAIL=your_client_email`
- [ ] `FIREBASE_CLIENT_ID=your_client_id`
- [ ] `FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth`
- [ ] `FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token`
- [ ] `FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs`
- [ ] `FIREBASE_CLIENT_X509_CERT_URL=your_cert_url`

#### **Cloudflare R2 Configuration:**
- [ ] `CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id`
- [ ] `CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key`
- [ ] `CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name`
- [ ] `CLOUDFLARE_R2_ACCOUNT_ID=your_account_id`
- [ ] `CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.your-account.r2.cloudflarestorage.com`

#### **Stripe Configuration:**
- [ ] `STRIPE_SECRET_KEY=your_stripe_secret_key`
- [ ] `STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret`

#### **Frontend Environment Variables:**
- [ ] `REACT_APP_API_URL=https://e-commerce-by-neski.up.railway.app/api`
- [ ] `REACT_APP_FIREBASE_API_KEY=your_firebase_api_key`
- [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com`
- [ ] `REACT_APP_FIREBASE_PROJECT_ID=your_project_id`
- [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com`
- [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id`
- [ ] `REACT_APP_FIREBASE_APP_ID=your_app_id`
- [ ] `REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key`

### **2. External Services Setup**

#### **Firebase:**
- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] Service account key generated
- [ ] Firebase config added to environment variables

#### **Cloudflare R2:**
- [ ] R2 bucket created
- [ ] API tokens generated
- [ ] CORS policy configured for your domain
- [ ] Public URL accessible

#### **Stripe:**
- [ ] Stripe account created
- [ ] API keys generated
- [ ] Webhook endpoints configured
- [ ] Payment methods enabled

### **3. Code Verification**

#### **Backend:**
- [ ] All dependencies in `requirements.txt`
- [ ] CORS settings properly configured
- [ ] Authentication middleware working
- [ ] API endpoints tested
- [ ] Image upload functionality working

#### **Frontend:**
- [ ] All dependencies in `package.json`
- [ ] Build process working (`npm run build`)
- [ ] API calls using correct URLs
- [ ] Authentication integration working
- [ ] Image upload components working

## 🚀 **Deployment Process**

### **1. Deploy to Railway:**
1. Push changes to your main branch
2. Railway will automatically trigger deployment
3. Monitor build logs for any errors
4. Check deployment status

### **2. Post-Deployment Verification:**

#### **Backend API Tests:**
- [ ] Health check: `GET /api/products/`
- [ ] Authentication: Test login/register
- [ ] Product CRUD: Test create/read/update/delete
- [ ] Image upload: Test image upload endpoints
- [ ] Search functionality: Test product search

#### **Frontend Tests:**
- [ ] Homepage loads correctly
- [ ] Authentication works (login/register)
- [ ] Admin panel accessible
- [ ] Product management works
- [ ] Image upload works
- [ ] Search functionality works
- [ ] Payment flow works

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. CORS Errors:**
- Check `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Verify `CORS_ALLOW_CREDENTIALS=True`

#### **2. Authentication Issues:**
- Verify all Firebase environment variables are set
- Check Firebase project configuration
- Ensure service account has proper permissions

#### **3. Image Upload Issues:**
- Verify Cloudflare R2 credentials
- Check bucket permissions
- Ensure CORS policy allows your domain

#### **4. API Connection Issues:**
- Verify `REACT_APP_API_URL` points to correct backend URL
- Check if backend is running and accessible
- Verify all required environment variables are set

### **Debug Commands:**
```bash
# Check environment variables
echo $REACT_APP_API_URL

# Test API connectivity
curl https://e-commerce-by-neski.up.railway.app/api/products/

# Check build logs
railway logs
```

## 📊 **Monitoring**

### **Key Metrics to Monitor:**
- [ ] Server response times
- [ ] Error rates
- [ ] Database connection status
- [ ] Image upload success rate
- [ ] Authentication success rate
- [ ] Payment processing success rate

### **Logs to Check:**
- [ ] Application logs
- [ ] Error logs
- [ ] Access logs
- [ ] Database logs

## ✅ **Success Criteria**

Your deployment is successful when:
- [ ] All pages load without errors
- [ ] Users can register and login
- [ ] Admin can manage products
- [ ] Images upload and display correctly
- [ ] Search functionality works
- [ ] Payment processing works
- [ ] No CORS or authentication errors
- [ ] All API endpoints respond correctly

## 🆘 **Support**

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables are set
3. Test API endpoints individually
4. Check external service configurations
5. Review this checklist for missed items
