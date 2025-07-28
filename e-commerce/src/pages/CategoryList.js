// src/pages/CategoryList.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProducts } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CategoryList = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // Use backend category filtering instead of fetching all products
        const filteredProducts = await fetchProducts({ category: category });
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category]);

  const fetchFavorites = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const favoritesRef = collection(db, 'users', currentUser.uid, 'favorites');
      const querySnapshot = await getDocs(favoritesRef);
      const favoriteIds = querySnapshot.docs.map(doc => doc.data().productId);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchFavorites();
    }
  }, [currentUser, fetchFavorites]);

  const toggleFavorite = async (productId) => {
    if (!currentUser) {
      alert('Please log in to add favorites');
      return;
    }

    try {
      const favoritesRef = collection(db, 'users', currentUser.uid, 'favorites');
      const q = query(favoritesRef, where('productId', '==', productId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Add to favorites
        await addDoc(favoritesRef, { productId });
        setFavorites(prev => [...prev, productId]);
      } else {
        // Remove from favorites
        const docToDelete = querySnapshot.docs[0];
        await deleteDoc(docToDelete.ref);
        setFavorites(prev => prev.filter(id => id !== productId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

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
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl mr-4">{getCategoryIcon(category)}</span>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
              {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Discover our amazing collection of {category.replace('-', ' ')} products
          </p>
          <div className="mt-4 text-sm text-gray-500">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 transform hover:-translate-y-2">
                {/* Product Image */}
                <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                  <img
                    src={product.thumbnail || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop&random=${product.id}`}
                    alt={product.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-t-2xl group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      const category = product.category?.toLowerCase();
                      let fallbackUrl = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop&random=${product.id}`;
                      
                      if (category === 'groceries') {
                        fallbackUrl = `https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&random=${product.id}`;
                      } else if (category === 'electronics') {
                        fallbackUrl = `https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop&random=${product.id}`;
                      } else if (category === 'clothing') {
                        fallbackUrl = `https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop&random=${product.id}`;
                      }
                      
                      e.target.src = fallbackUrl;
                    }}
                  />
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                      favorites.includes(product.id)
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-white hover:text-red-500'
                    }`}
                    title={favorites.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={favorites.includes(product.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  
                  {/* Discount Badge */}
                  {product.discount_percentage > 0 && (
                    <div className="absolute top-3 left-3 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{product.discount_percentage}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Category */}
                  <div className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-2">
                    {product.category}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">({product.rating})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ${product.price}
                      </span>
                      {product.discount_percentage > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          ${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">We couldn't find any products in this category</p>
            <Link
              to="/search"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Back to Categories */}
        <div className="text-center mt-12">
          <Link
            to="/categories"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CategoryList;
