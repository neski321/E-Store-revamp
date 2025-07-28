// src/components/Categories.js
import React, { useEffect, useState } from 'react';
import { fetchCategories } from '../services/productService';
import { Link } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categories = await fetchCategories();
        setCategories(categories);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  // Category icons mapping
  const getCategoryIcon = (category) => {
    const icons = {
      'groceries': '🛒',
      'electronics': '📱',
      'clothing': '👕',
      'beauty': '💄',
      'womens-shoes': '👠',
      'womens-watches': '⌚',
      'womens-jewellery': '💍',
      'mens-shoes': '👞',
      'mens-watches': '⌚',
      'mens-clothing': '👔',
      'mens-shirts': '👔',
      'home-decoration': '🏠',
      'furniture': '🪑',
      'lighting': '💡',
      'automotive': '🚗',
      'motorcycle': '🏍️',
      'vehicle': '🚗',
      'sunglasses': '🕶️',
      'skincare': '🧴',
      'skin-care': '🧴',
      'fragrances': '🌸',
      'laptops': '💻',
      'smartphones': '📱',
      'tablets': '📱',
      'headphones': '🎧',
      'mobile-accessories': '📱',
      'books': '📚',
      'sports': '⚽',
      'sports-accessories': '⚽',
      'toys': '🧸',
      'baby': '🍼',
      'health': '🏥',
      'pets': '🐾',
      'womens-bags': '👜',
      'womens-dresses': '👗',
      'tops': '👕',
      'kitchen-accessories': '🍳'
    };
    return icons[category.toLowerCase()] || '📦';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Show at least 6 categories, or all if less than 6
  const displayCategories = categories.length >= 6 ? categories.slice(0, 6) : categories;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
          Shop by Category
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our diverse collection of products organized by category. Find exactly what you're looking for.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {displayCategories.map((category, index) => (
          <Link 
            to={`/category/${category.toLowerCase()}`} 
            key={index} 
            className="group bg-white rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
          >
            <div className="p-6 text-center">
              {/* Category Icon */}
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                {getCategoryIcon(category)}
              </div>
              
              {/* Category Name */}
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 capitalize">
                {category.replace('-', ' ')}
              </h3>
              
              {/* Hover Arrow */}
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg className="w-5 h-5 text-primary-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Browse All Categories CTA */}
      <div className="text-center mt-12">
        <Link
          to="/categories"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-medium hover:shadow-large transform hover:-translate-y-1 transition-all duration-200"
        >
          Browse All Categories
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default Categories;
