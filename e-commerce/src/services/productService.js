// src/services/productService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Fetch all products
export const fetchProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = `${API_BASE_URL}/products/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Fetching products from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Products response:', data);
    
    // Handle paginated response
    return data.results || data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Fetch categories from backend
export const fetchCategories = async () => {
  try {
    const url = `${API_BASE_URL}/products/categories/`;
    console.log('Fetching categories from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const categories = await response.json();
    console.log('Categories response:', categories);
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback: return some default categories if the API fails
    console.log('Using fallback categories');
    return [
      'groceries',
      'electronics', 
      'clothing',
      'beauty',
      'home-decoration',
      'furniture',
      'automotive',
      'sports',
      'toys',
      'health',
      'books',
      'pets'
    ];
  }
};

// Get categories from products (fallback method)
export const getCategoriesFromProducts = (products) => {
  if (!Array.isArray(products)) {
    console.warn('getCategoriesFromProducts: products is not an array:', products);
    return [];
  }
  
  const categories = [...new Set(products.map(product => product.category))];
  return categories.filter(category => category && category.trim() !== '');
};

export const addProduct = async (productData) => {
    try {
      console.log('Product Data Sent:', productData);  // Log the product data before sending it
  
      const response = await axios.post(`${API_BASE_URL}/products/`, productData);
  
      // Log the entire response
      console.log('Response from Server:', response.data);
  
      return response.data;
    } catch (error) {
      // Log the error response from the backend
      if (error.response) {
        console.error('Error Response from Server:', error.response.data);
      } else {
        console.error('Error adding product:', error.message);
      }
      throw error;
    }
  };

export const updateProduct = async (id, updatedProduct) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/products/${id}/`, updatedProduct);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

export const deleteProduct = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/products/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

export const removeReview = (productId, reviewId) => axios.delete(`${API_BASE_URL}/products/${productId}/reviews/${reviewId}`);