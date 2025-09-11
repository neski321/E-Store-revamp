# Cloudflare Image Integration Example

Here's how to integrate Cloudflare image uploads into your existing AddProduct component:

## 1. Update AddProduct.js

```jsx
// Add this import at the top
import ProductImageUpload from '../components/ProductImageUpload';

// In your AddProduct component, add image state
const [productImages, setProductImages] = useState([]);

// Add this in your form JSX (before the submit button)
<div className="mb-6">
  <ProductImageUpload
    onImagesSelected={(images) => {
      setProductImages(images);
      // Update your product state
      setNewProduct(prev => ({
        ...prev,
        thumbnail: images[0] || '', // First image as thumbnail
        images: images // All images as array
      }));
    }}
  />
</div>

// Update your handleSubmit function to include images
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Convert images array to the format your backend expects
  const productData = {
    ...newProduct,
    thumbnail: productImages[0] || '',
    images: productImages.reduce((acc, img, index) => {
      acc[`image_${index + 1}`] = img;
      return acc;
    }, {})
  };
  
  // Submit to your backend
  const result = await addProduct(productData);
  // ... rest of your submit logic
};
```

## 2. Update Product Model (if needed)

Your existing model already supports this:

```python
# In products/models.py - already configured!
thumbnail = models.URLField(default='XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
images = models.JSONField(default=dict)
```

## 3. Backend API Usage

The API endpoints are already set up:

- `POST /api/upload/image/` - Upload single image
- `POST /api/upload/images/` - Upload multiple images  
- `DELETE /api/delete/image/` - Delete image (admin only)

## 4. Environment Variables

Add to your `.env` file:

```bash
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.your-account.r2.cloudflarestorage.com
```

## 5. Install Dependencies

```bash
cd backend
pip install boto3 Pillow
```

## 6. Test the Integration

1. Start your backend server
2. Navigate to your AddProduct page
3. Select images using the new upload component
4. Submit the form
5. Check that images are uploaded to Cloudflare and URLs are saved to database

## Features You Get

- ✅ **Drag & drop image upload**
- ✅ **Image preview before upload**
- ✅ **Automatic image optimization**
- ✅ **Multiple image support**
- ✅ **Thumbnail selection**
- ✅ **Progress indicators**
- ✅ **Error handling**
- ✅ **File validation**
- ✅ **CDN delivery for fast loading**

## Example Data Flow

1. User selects images → `ProductImageUpload` component
2. Images upload to Cloudflare R2 → Returns URLs
3. URLs stored in component state → `productImages`
4. On form submit → URLs sent to backend
5. Backend saves URLs to database → `thumbnail` and `images` fields
6. Frontend displays images from Cloudflare URLs → Fast CDN delivery

This setup gives you a professional image management system that scales with your e-commerce platform!
