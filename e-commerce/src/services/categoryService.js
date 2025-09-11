// src/services/categoryService.js

import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Get auth headers
const getAuthHeaders = (currentUser, role) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (currentUser) {
    headers['X-User-ID'] = currentUser.uid;
    headers['X-User-Email'] = currentUser.email;
    headers['X-User-Role'] = role || 'user';
  }
  
  return headers;
};

// Get all categories
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories/`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch categories'
    };
  }
};

// Create a new category
export const createCategory = async (categoryName, currentUser, role) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/categories/create/`,
      { name: categoryName },
      {
        headers: getAuthHeaders(currentUser, role),
        timeout: 10000,
      }
    );
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to create category'
    };
  }
};
