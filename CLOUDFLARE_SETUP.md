# Cloudflare R2 Image Storage Setup

This guide will help you set up Cloudflare R2 for hosting product images in your e-commerce application.

## Prerequisites

1. A Cloudflare account
2. Cloudflare R2 bucket created
3. R2 API tokens generated

## Step 1: Create Cloudflare R2 Bucket

1. Log in to your Cloudflare dashboard
2. Navigate to **R2 Object Storage**
3. Click **Create bucket**
4. Choose a unique bucket name (e.g., `your-ecommerce-images`)
5. Select a location close to your users
6. Click **Create bucket**

## Step 2: Generate API Tokens

1. In your Cloudflare dashboard, go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use **Custom token** template
4. Set permissions:
   - **Account** → **Cloudflare R2:Edit**
   - **Zone** → **Zone:Read** (if needed)
5. Account Resources: Include your account
6. Click **Continue to summary** → **Create Token**
7. **Copy and save** your token securely

## Step 3: Get Account ID

1. In your Cloudflare dashboard, go to **R2 Object Storage**
2. Click on your bucket
3. In the **Settings** tab, find your **Account ID**
4. Copy this value

## Step 4: Configure Environment Variables

Add these variables to your `.env` file:

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket-name.your-account-id.r2.cloudflarestorage.com
```

## Step 5: Install Dependencies

```bash
cd backend
pip install boto3 Pillow
```

## Step 6: Test the Setup

1. Start your Django server
2. Use the image upload API endpoints:
   - `POST /api/upload/image/` - Upload single image
   - `POST /api/upload/images/` - Upload multiple images
   - `DELETE /api/delete/image/` - Delete image (admin only)

## Step 7: Migrate Existing Images (Optional)

If you have existing product images, you can migrate them to Cloudflare:

```bash
# Dry run to see what would be migrated
python manage.py migrate_to_cloudflare --dry-run --limit=5

# Actually migrate images
python manage.py migrate_to_cloudflare --limit=10
```

## Usage Examples

### Frontend Integration

```jsx
import ImageUpload from './components/ImageUpload';
import ProductImageUpload from './components/ProductImageUpload';

// Basic image upload
<ImageUpload
  onImagesUploaded={(urls) => console.log('Uploaded:', urls)}
  multiple={true}
  maxFiles={10}
/>

// Product-specific image upload
<ProductImageUpload
  onImagesSelected={(images) => {
    // images[0] = thumbnail URL
    // images = all image URLs array
    setProductData({
      ...productData,
      thumbnail: images[0],
      images: images
    });
  }}
/>
```

### Backend API Usage

```python
from products.cloudflare_service import cloudflare_r2

# Upload single image
result = cloudflare_r2.upload_image(image_file, folder='products')
if result['success']:
    image_url = result['url']

# Upload multiple images
results = cloudflare_r2.upload_multiple_images(image_files, folder='products')
urls = [r['url'] for r in results if r['success']]
```

## Features

- ✅ **Automatic image optimization** - Images are resized and compressed
- ✅ **Multiple upload support** - Upload up to 10 images at once
- ✅ **Secure access** - Authentication required for uploads
- ✅ **Admin controls** - Admins can delete any image
- ✅ **CDN delivery** - Fast global image delivery
- ✅ **Cost effective** - Pay only for storage and requests used

## Security Notes

- Images are automatically optimized for web delivery
- Only authenticated users can upload images
- Only admins can delete images
- All uploads are validated for file type and size
- Images are stored with public read access for CDN delivery

## Troubleshooting

### Common Issues

1. **"Missing required Cloudflare R2 environment variables"**
   - Check that all environment variables are set correctly
   - Verify the variable names match exactly

2. **"Access Denied" errors**
   - Verify your API token has R2:Edit permissions
   - Check that the bucket name is correct

3. **"Bucket not found" errors**
   - Verify the bucket name and account ID
   - Ensure the bucket exists in your Cloudflare account

4. **Image upload fails**
   - Check file size (max 10MB)
   - Verify file type (JPEG, PNG, WebP only)
   - Check network connection

### Getting Help

- Check Cloudflare R2 documentation
- Verify your API token permissions
- Test with a simple image first
- Check Django logs for detailed error messages
