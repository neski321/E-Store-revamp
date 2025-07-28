// src/services/productService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getCategoriesFromProducts = (products) => {
  const categories = [...new Set(products.map(product => product.category))];
  return categories;
};

export const addProduct = async (productData) => {
    try {
      console.log('Product Data Sent:', productData);  // Log the product data before sending it
  
      const response = await axios.post(`${API_URL}/products/`, productData);
  
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
      const response = await axios.patch(`${API_URL}/products/${id}/`, updatedProduct);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

export const deleteProduct = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/products/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

export const removeReview = (productId, reviewId) => axios.delete(`${API_URL}/products/${productId}/reviews/${reviewId}`);