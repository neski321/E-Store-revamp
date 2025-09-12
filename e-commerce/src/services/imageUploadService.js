// src/services/imageUploadService.js

import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Get auth headers
const getAuthHeaders = (currentUser, role) => {
  const headers = {
    'Content-Type': 'multipart/form-data',
  };
  
  if (currentUser) {
    headers['X-User-ID'] = currentUser.uid;
    headers['X-User-Email'] = currentUser.email;
    headers['X-User-Role'] = role || 'user';
  }
  
  return headers;
};

// Upload multiple images
export const uploadMultipleImages = async (imageFiles, currentUser, role, productTitle = '', isUpdate = false) => {
  try {
    const formData = new FormData();
    
    // Add each image file to FormData
    imageFiles.forEach((file, index) => {
      formData.append('images', file);
    });
    
    // Add product title to FormData
    if (productTitle) {
      formData.append('product_title', productTitle);
    }
    
    // Add update flag to FormData
    formData.append('is_update', isUpdate.toString());
    
    const response = await axios.post(
      `${API_BASE_URL}/upload/images/`,
      formData,
      {
        headers: getAuthHeaders(currentUser, role),
        timeout: 30000, // 30 second timeout for large uploads
      }
    );
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error uploading images:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to upload images'
    };
  }
};

// Upload single image
export const uploadSingleImage = async (imageFile, currentUser, role, productTitle = '') => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Add product title to FormData
    if (productTitle) {
      formData.append('product_title', productTitle);
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/upload/image/`,
      formData,
      {
        headers: getAuthHeaders(currentUser, role),
        timeout: 15000, // 15 second timeout
      }
    );
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to upload image'
    };
  }
};

// Delete image
export const deleteImage = async (imageUrl, currentUser, role) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/delete/image/`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser?.uid,
          'X-User-Email': currentUser?.email,
          'X-User-Role': role || 'user',
        },
        data: { url: imageUrl },
        timeout: 10000,
      }
    );
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to delete image'
    };
  }
};

// Validate image file
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File must be a JPEG, PNG, or WebP image' };
  }
  
  return { valid: true };
};

// Validate multiple image files
export const validateImageFiles = (files) => {
  const maxFiles = 10;
  const results = [];
  
  if (files.length > maxFiles) {
    return { valid: false, error: `Maximum ${maxFiles} files allowed` };
  }
  
  for (let i = 0; i < files.length; i++) {
    const validation = validateImageFile(files[i]);
    if (!validation.valid) {
      return { valid: false, error: `File ${i + 1}: ${validation.error}` };
    }
  }
  
  return { valid: true };
};

// Get image preview URL
export const getImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

// Resize image for preview
export const resizeImageForPreview = (file, maxWidth = 300, maxHeight = 300) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
