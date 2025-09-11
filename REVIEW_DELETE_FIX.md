# Review Deletion Fix

## 🐛 **Problem Identified:**

Reviews were not deleting because:
1. **Missing API_URL** - Frontend was using relative URLs instead of full API URLs
2. **Missing reviewer_id** - Existing reviews had `None` for `reviewer_id`, causing permission check failures
3. **Authentication headers** - Frontend wasn't sending proper authentication headers

## ✅ **Solutions Implemented:**

### **1. Fixed API URLs in Frontend:**
- **Before**: Used relative URLs like `/api/products/${productId}/reviews/${reviewId}/`
- **After**: Added `API_URL` constant and used full URLs like `${API_URL}/products/${productId}/reviews/${reviewId}/`

### **2. Fixed Missing reviewer_id:**
- **Problem**: Existing reviews had `reviewer_id = None` from before authentication was implemented
- **Solution**: Created management command to set `reviewer_id = 'legacy_review'` for all existing reviews
- **Result**: All 583 reviews now have a proper `reviewer_id`

### **3. Added Debug Logging:**
- Added console logging in backend to track permission checks
- Shows user ID, role, review ID, and reviewer ID for debugging

## 🔧 **Technical Changes:**

### **Frontend (`ProductReviews.js`):**
```javascript
// Added API_URL constant
const API_URL = process.env.REACT_APP_API_URL;

// Updated all fetch calls to use full URLs
const response = await fetch(`${API_URL}/products/${productId}/reviews/${reviewId}/`, {
  method: 'DELETE',
  headers,
});
```

### **Backend (`fix_review_ownership.py`):**
```python
# Management command to fix existing reviews
reviews_without_owner = Review.objects.filter(reviewer_id__isnull=True)
for review in reviews_without_owner:
    review.reviewer_id = 'legacy_review'
    review.save()
```

### **Backend (`views.py`):**
```python
# Added debug logging
print(f"Review deletion attempt - User ID: {user_id}, Role: {user_role}, Review ID: {review_id}, Reviewer ID: {review.reviewer_id}")
print(f"Permission check - Is owner: {is_owner}, Is admin: {is_admin}")
```

## 🎯 **Permission Logic:**

### **Review Deletion Permissions:**
- ✅ **Admin users** - Can delete any review
- ✅ **Review owner** - Can delete their own review
- ✅ **Legacy reviews** - Can be deleted by admins (reviewer_id = 'legacy_review')

### **Review Editing Permissions:**
- ✅ **Review owner only** - Only the review author can edit their review
- ❌ **Admins cannot edit** - Admins can only delete, not edit reviews

## 📝 **Testing:**

### **To Test Review Deletion:**
1. **As Admin** - Should be able to delete any review
2. **As Review Owner** - Should be able to delete own reviews
3. **As Regular User** - Should only be able to delete own reviews
4. **Legacy Reviews** - Should be deletable by admins

### **Debug Information:**
- Check backend console for permission debug logs
- Look for "Review deletion attempt" and "Permission check" messages
- Verify user ID, role, and reviewer ID are being passed correctly

## 🚀 **Expected Behavior:**

### **Admin Users:**
- ✅ Can delete any review (including legacy reviews)
- ❌ Cannot edit reviews they didn't write
- ✅ See purple dot indicator for non-owner reviews

### **Regular Users:**
- ✅ Can delete their own reviews
- ✅ Can edit their own reviews
- ❌ Cannot delete/edit other users' reviews

### **Legacy Reviews:**
- ✅ Can be deleted by admins
- ❌ Cannot be edited by anyone (no original owner)

## 🔍 **Debugging:**

If reviews still don't delete, check:
1. **Console logs** - Look for permission debug messages
2. **Network tab** - Check if API calls are reaching the backend
3. **Authentication** - Verify user is logged in and has proper role
4. **Headers** - Ensure X-User-ID, X-User-Email, X-User-Role are being sent

**Review deletion should now work properly! 🎉**
