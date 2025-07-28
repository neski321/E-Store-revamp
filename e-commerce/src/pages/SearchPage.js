import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductFilters from '../components/ProductFilters';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const { currentUser } = useAuth();

  const searchQuery = searchParams.get('q') || '';

  const fetchProducts = useCallback(async (page = 1, newFilters = filters, newSortBy = sortBy, newSortOrder = sortOrder) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '12'
      });

      // Add search query
      if (searchQuery) {
        params.append('search', searchQuery);
        params.append('type', 'advanced');
      }

      // Add filters
      if (newFilters.title) params.append('title', newFilters.title);
      if (newFilters.minPrice) params.append('min_price', newFilters.minPrice);
      if (newFilters.maxPrice) params.append('max_price', newFilters.maxPrice);
      if (newFilters.minRating) params.append('min_rating', newFilters.minRating);
      if (newFilters.maxRating) params.append('max_rating', newFilters.maxRating);
      if (newFilters.category) params.append('category', newFilters.category);
      if (newFilters.brand) params.append('brand', newFilters.brand);
      if (newFilters.inStock) params.append('in_stock', 'true');
      if (newFilters.hasDiscount) params.append('has_discount', 'true');

      // Add sorting
      params.append('sort', newSortBy);
      params.append('order', newSortOrder);

      const response = await fetch(`/api/products/?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      if (page === 1) {
        setProducts(data.results || data);
      } else {
        setProducts(prev => [...prev, ...(data.results || data)]);
      }
      
      // Handle pagination info
      if (data.count !== undefined) {
        setHasMore(data.next !== null);
      }
      
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, sortBy, sortOrder]);

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
    fetchProducts(1);
    if (currentUser) {
      fetchFavorites();
    }
  }, [searchQuery, fetchProducts, currentUser, fetchFavorites]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    fetchProducts(1, newFilters, sortBy, sortOrder);
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    fetchProducts(1, filters, field, order);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSortBy('id');
    setSortOrder('desc');
    fetchProducts(1, {}, 'id', 'desc');
  };

  const toggleFavorite = async (productId) => {
    if (!currentUser) {
      alert('Please log in to add favorites');
      return;
    }

    try {
      const favoritesRef = collection(db, 'users', currentUser.uid, 'favorites');
      
      if (favorites.includes(productId)) {
        // Remove from favorites
        const querySnapshot = await getDocs(query(favoritesRef, where('productId', '==', productId)));
        const docToDelete = querySnapshot.docs[0];
        if (docToDelete) {
          await deleteDoc(docToDelete.ref);
          setFavorites(prev => prev.filter(id => id !== productId));
        }
      } else {
        // Add to favorites
        await addDoc(favoritesRef, { productId });
        setFavorites(prev => [...prev, productId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const addToCart = (product) => {
    // This would integrate with your cart system
    console.log('Adding to cart:', product);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Search Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Search Results
              </h1>
              {searchQuery && (
                <p className="text-gray-600">
                  Showing results for "{searchQuery}"
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <ProductFilters
                  onFiltersChange={handleFiltersChange}
                  onSortChange={handleSortChange}
                  onClearFilters={handleClearFilters}
                />
              </div>

              {/* Products Grid */}
              <div className="lg:col-span-3">
                {loading && products.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                        <div className="h-48 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                {renderStars(product.rating)}
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
                              <button
                                onClick={() => addToCart(product)}
                                disabled={product.stock === 0}
                                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                      <div className="text-center mt-8">
                        <button
                          onClick={() => fetchProducts(currentPage + 1)}
                          disabled={loading}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {loading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchPage;
