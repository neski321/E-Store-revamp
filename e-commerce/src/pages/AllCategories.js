// src/pages/AllCategories.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../services/productService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AllCategories = () => {
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

  // Category descriptions
  const getCategoryDescription = (category) => {
    const descriptions = {
      'groceries': 'Fresh food, beverages, and household essentials',
      'electronics': 'Latest gadgets, computers, and smart devices',
      'clothing': 'Fashionable apparel for all occasions',
      'beauty': 'Cosmetics, skincare, and beauty products',
      'womens-shoes': 'Stylish footwear for women',
      'womens-watches': 'Elegant timepieces and accessories',
      'womens-jewellery': 'Beautiful jewelry and accessories',
      'mens-shoes': 'Comfortable and stylish men\'s footwear',
      'mens-watches': 'Sophisticated watches for men',
      'mens-clothing': 'Trendy clothing for men',
      'mens-shirts': 'Comfortable and stylish men\'s shirts',
      'home-decoration': 'Beautiful decor to enhance your space',
      'furniture': 'Quality furniture for every room',
      'lighting': 'Illuminate your space with style',
      'automotive': 'Car accessories and maintenance products',
      'motorcycle': 'Motorcycle gear and accessories',
      'vehicle': 'Automotive parts and accessories',
      'sunglasses': 'Protect your eyes with style',
      'skincare': 'Nourish and protect your skin',
      'skin-care': 'Nourish and protect your skin',
      'fragrances': 'Luxury perfumes and colognes',
      'laptops': 'Powerful computing solutions',
      'smartphones': 'Latest mobile technology',
      'tablets': 'Portable computing devices',
      'headphones': 'Premium audio experiences',
      'mobile-accessories': 'Essential mobile device accessories',
      'books': 'Knowledge and entertainment',
      'sports': 'Equipment for active lifestyles',
      'sports-accessories': 'Equipment and gear for sports enthusiasts',
      'toys': 'Fun and educational toys',
      'baby': 'Everything for your little ones',
      'health': 'Wellness and healthcare products',
      'pets': 'Care and comfort for your pets',
      'womens-bags': 'Stylish bags and purses for women',
      'womens-dresses': 'Elegant dresses for every occasion',
      'tops': 'Comfortable and trendy tops',
      'kitchen-accessories': 'Essential tools for your kitchen'
    };
    return descriptions[category.toLowerCase()] || 'Explore amazing products in this category';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            All Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our complete collection of products organized by category. 
            Find exactly what you're looking for with our diverse range of offerings.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            {categories.length} categories available
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link 
              to={`/category/${category.toLowerCase()}`} 
              key={index} 
              className="group bg-white rounded-3xl shadow-soft hover:shadow-large transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              <div className="p-8">
                {/* Category Icon */}
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-200 text-center">
                  {getCategoryIcon(category)}
                </div>
                
                {/* Category Name */}
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 text-center capitalize mb-4">
                  {category.replace('-', ' ')}
                </h3>
                
                {/* Category Description */}
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  {getCategoryDescription(category)}
                </p>
                
                {/* Explore Button */}
                <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-primary-600 font-semibold flex items-center">
                    Explore Category
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* go to search products page CTA */}
        <div className="text-center mt-16">
          <Link
            to="/search"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-medium hover:shadow-large transform hover:-translate-y-1 transition-all duration-200"
          >
            Browse all products
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllCategories; 