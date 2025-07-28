import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [searchType, setSearchType] = useState('regular');
  const { currentUser } = useAuth();

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

  const handleSearch = useCallback(async (e, page = 1, newQuery = null) => {
    e?.preventDefault();
    const queryToUse = newQuery || searchQuery;
    
    if (!queryToUse.trim()) {
      setResults([]);
      setHasMore(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        search: queryToUse,
        type: searchType,
        page: page.toString(),
        page_size: '12'
      });

      const response = await fetch(`/api/products/?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      const products = data.results || data;

      if (page === 1) {
        setResults(products);
      } else {
        setResults(prev => [...prev, ...products]);
      }

      setHasMore(data.next !== null);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType]);

  const loadMoreResults = () => {
    if (hasMore && !loading) {
      handleSearch(null, currentPage + 1);
    }
  };

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

  const addToCart = async (product) => {
    if (!currentUser) {
      alert('Please log in to add items to cart');
      return;
    }

    try {
      const cartRef = collection(db, 'checkout', currentUser.uid, 'items');
      await addDoc(cartRef, {
        productId: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: 1,
        addedAt: new Date()
      });
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Search Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find exactly what you're looking for with our powerful search functionality.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={(e) => handleSearch(e, 1)} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="Search for products..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    setSearchType(searchType === 'regular' ? 'advanced' : 'regular');
                    handleSearch(e, 1);
                  }}
                  className="px-6 py-3 bg-secondary-600 text-white font-semibold rounded-lg hover:bg-secondary-700 transition-colors duration-200"
                >
                  {searchType === 'regular' ? 'Advanced' : 'Regular'}
                </button>
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-500">
                {searchType === 'regular' 
                  ? 'Search by product title' 
                  : 'Search by title, description, category, and price'
                }
              </span>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 text-center">
                Error: {error}
                <button 
                  onClick={() => handleSearch(null, 1)}
                  className="ml-2 text-red-600 hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Found {results.length} product{results.length !== 1 ? 's' : ''}
              </h2>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((product) => (
                <div key={product.id} className="group bg-white rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 transform hover:-translate-y-2">
                  {/* Product Image */}
                  <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                    <img
                      src={product.thumbnail || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop&random=${product.id}`}
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-cover rounded-t-2xl group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
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
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', e.target.src);
                        console.log('Image dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                      }}
                      onLoadStart={() => {
                        console.log('Starting to load image for product:', product.title);
                        console.log('Image URL:', product.thumbnail || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop&random=${product.id}`);
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
              <div className="text-center mt-12">
                <button
                  onClick={loadMoreResults}
                  disabled={loading}
                  className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600 shadow-soft hover:shadow-medium transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Results
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No products found matching "{query}"
            </div>
            <p className="text-gray-400">
              Try adjusting your search terms or browse our categories
            </p>
          </div>
        )}

        {/* Initial State */}
        {!query && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              Enter a search term to find products
            </div>
            <p className="text-gray-400">
              Search by product name, category, or description
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchPage;
