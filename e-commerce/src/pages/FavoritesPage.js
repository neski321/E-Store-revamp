import React, { useEffect, useState, useCallback, useRef } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthPromptModal from '../components/AuthPromptModal';
import { useAuth } from '../contexts/AuthContext';

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [authPromptModal, setAuthPromptModal] = useState({ isOpen: false, actionType: 'favorites' });
    const fetchFavoritesRef = useRef();
    const { currentUser } = useAuth();

    const isLoggedIn = () => {
        return currentUser && !currentUser.isAnonymous;
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setUser(user);
            if (!user || !isLoggedIn()) {
                setAuthPromptModal({ isOpen: true, actionType: 'favorites' });
                setLoading(false);
            } else {
                setError(null);
                setLoading(true);
                // Call fetchFavorites after a short delay to avoid the dependency issue
                setTimeout(() => {
                    if (fetchFavoritesRef.current) {
                        fetchFavoritesRef.current();
                    }
                }, 100);
            }
        });
        return unsubscribe;
    }, [currentUser]);

    const fetchFavorites = useCallback(async () => {
        if (!user) {
            console.log("No user logged in");
            setLoading(false);
            setError("Please log in to view your favorites");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            console.log("Fetching favorites for user:", user.uid);
            console.log("User authentication status:", user.email);
            console.log("User UID:", user.uid);
            
            // Get favorite product IDs from Firebase
            const favoritesRef = collection(db, 'users', user.uid, 'favorites');
            console.log("Firebase collection path:", `users/${user.uid}/favorites`);
            
            const favoritesSnapshot = await getDocs(favoritesRef);
            const favoriteIds = favoritesSnapshot.docs.map(doc => doc.data().productId);
            
            console.log("Found favorite IDs:", favoriteIds);
            
            if (favoriteIds.length === 0) {
                console.log("No favorites found");
                setFavorites([]);
                setLoading(false);
                return;
            }

            // Fetch product details from the API
            const apiUrl = `/api/products/?ids=${favoriteIds.join(',')}`;
            console.log("Fetching from API:", apiUrl);
            
            const response = await fetch(apiUrl);
            console.log("API response status:", response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("API error:", errorText);
                throw new Error(`Failed to fetch favorite products: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("API response data:", data);
            
            const products = data.results || data;
            
            // Filter to only include products that are still in favorites
            const favoriteProducts = products.filter(product => favoriteIds.includes(product.id));
            console.log("Filtered favorite products:", favoriteProducts);
            
            setFavorites(favoriteProducts);
        } catch (error) {
            console.error("Error fetching favorites:", error);
            setError(`Failed to load favorites: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Store the function in a ref to avoid dependency issues
    useEffect(() => {
        fetchFavoritesRef.current = fetchFavorites;
    }, [fetchFavorites]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const removeFromFavorites = async (productId) => {
        if (!user) return;

        try {
            // Find the favorite document in Firebase
            const favoritesRef = collection(db, 'users', user.uid, 'favorites');
            const q = query(favoritesRef, where('productId', '==', productId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Remove from Firebase
                const docToDelete = querySnapshot.docs[0];
                await deleteDoc(docToDelete.ref);

                // Update local state
                setFavorites(prev => prev.filter(product => product.id !== productId));
            }
        } catch (error) {
            console.error("Error removing product from favorites:", error);
            alert("Failed to remove from favorites.");
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your favorites...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
                        {error.includes("Please log in") ? (
                            <Link
                                to="/login"
                                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
                            >
                                Go to Login
                            </Link>
                        ) : (
                            <button 
                                onClick={fetchFavorites}
                                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            
            {/* Auth Prompt Modal */}
            <AuthPromptModal
                isOpen={authPromptModal.isOpen}
                onClose={() => setAuthPromptModal({ isOpen: false, actionType: 'favorites' })}
                actionType={authPromptModal.actionType}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                        My Favorites
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Your saved products and items you love
                    </p>
                </div>

                {/* Favorites Grid */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((product) => (
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
                                    
                                    {/* Remove from Favorites Button */}
                                    <button
                                        onClick={() => removeFromFavorites(product.id)}
                                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-200"
                                        title="Remove from favorites"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
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
                                            onClick={() => removeFromFavorites(product.id)}
                                            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                            <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
                        <p className="text-gray-600 mb-6">Start adding products to your favorites to see them here</p>
                        <Link
                            to="/search"
                            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
                        >
                            Browse Products
                        </Link>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default FavoritesPage;
