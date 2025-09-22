import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductReviews from '../components/ProductReviews';
import ImageViewer from '../components/ImageViewer';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import ErrorDialog from '../components/ErrorDialog';
import SuccessDialog from '../components/SuccessDialog';
import AuthPromptModal from '../components/AuthPromptModal';
import { useAuth } from '../contexts/AuthContext';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [checkoutList, setCheckoutList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '', details: '' });
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });
  const [authPromptModal, setAuthPromptModal] = useState({ isOpen: false, actionType: 'checkout' });
  const [imageViewer, setImageViewer] = useState({ isOpen: false, images: [], currentIndex: 0 });
  const { currentUser } = useAuth();

  const isLoggedIn = useCallback(() => {
    return currentUser && !currentUser.isAnonymous;
  }, [currentUser]);

  const closeErrorDialog = () => {
    setErrorDialog({ isOpen: false, title: '', message: '', details: '' });
  };

  const closeSuccessDialog = () => {
    setSuccessDialog({ isOpen: false, title: '', message: '' });
  };

  const closeAuthPromptModal = () => {
    setAuthPromptModal({ isOpen: false, actionType: 'checkout' });
  };

  const openImageViewer = (images, startIndex = 0) => {
    setImageViewer({
      isOpen: true,
      images: images.map((img, index) => ({
        src: img,
        alt: `${product.title} ${index + 1}`
      })),
      currentIndex: startIndex
    });
  };

  const closeImageViewer = () => {
    setImageViewer({ isOpen: false, images: [], currentIndex: 0 });
  };

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching the product:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Error Loading Product',
        message: 'Failed to load product details. Please try again.',
        details: error.message
      });
    }
  }, [id]);

  const loadCheckoutList = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        console.log("Loading checkout list for user:", user.uid);
        const checkoutRef = collection(db, 'checkout', user.uid, 'items');
        console.log("Firebase collection path:", `checkout/${user.uid}/items`);
        const querySnapshot = await getDocs(checkoutRef);
        const checkoutProducts = querySnapshot.docs.map(doc => doc.data().productId);
        setCheckoutList(checkoutProducts);
      } catch (error) {
        console.error("Error loading checkout list:", error);
        setCheckoutList([]);
      }
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!isLoggedIn()) return;
    
    try {
      const user = auth.currentUser;
      if (user) {
        const favoritesRef = collection(db, 'users', user.uid, 'favorites');
        const querySnapshot = await getDocs(favoritesRef);
        const favoriteIds = querySnapshot.docs.map(doc => doc.data().productId);
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Fetch product details
    fetchProduct();

    // Load checkout list
    loadCheckoutList();

    // Load favorites
    fetchFavorites();
  }, [id, fetchProduct, loadCheckoutList, fetchFavorites]);

  const showAlert = (message, isError = false) => {
    if (isError) {
      setErrorDialog({
        isOpen: true,
        title: 'Error',
        message: message,
        details: ''
      });
    } else {
      setSuccessDialog({
        isOpen: true,
        title: 'Success',
        message: message
      });
    }
  };

  const addToCheckout = async () => {
    if (!isLoggedIn()) {
      setAuthPromptModal({ isOpen: true, actionType: 'checkout' });
      return;
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const checkoutRef = collection(db, 'checkout', user.uid, 'items');
        
        // thumbnail image or set a default placeholder
        const productImage = product.images && Array.isArray(product.images) && product.images.length > 0 
          ? product.images[0] 
          : 'https://via.placeholder.com/150';

        await addDoc(checkoutRef, {
          productId: product.id,
          name: product.title,
          price: product.price,
          images: [productImage], // Ensure this is an array format for Firestore
          discount: product.discount_percentage,
          stock: product.stock
        });
          setCheckoutList([...checkoutList, product.id]);
          showAlert('Added to checkout list successfully! 🛒');
        } catch (error) {
          console.error('Error adding to checkout:', error);
          showAlert('Failed to add to checkout list. Please try again.', true);
        }
      }
  };

  const removeFromCheckout = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const checkoutRef = collection(db, 'checkout', user.uid, 'items');
        const querySnapshot = await getDocs(checkoutRef);
        const checkoutItem = querySnapshot.docs.find(doc => doc.data().productId === product.id);

        if (checkoutItem) {
          await deleteDoc(doc(db, 'checkout', user.uid, 'items', checkoutItem.id));
          setCheckoutList(checkoutList.filter(itemId => itemId !== product.id));
          showAlert('Removed from checkout list successfully! ✅');
        }
      } catch (error) {
        console.error('Error removing from checkout:', error);
        showAlert('Failed to remove from checkout list. Please try again.', true);
      }
    }
  };

  const toggleFavorite = async () => {
    if (!isLoggedIn()) {
      setAuthPromptModal({ isOpen: true, actionType: 'favorites' });
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const favoritesRef = collection(db, 'users', user.uid, 'favorites');
        const q = query(favoritesRef, where('productId', '==', product.id));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Add to favorites
          await addDoc(favoritesRef, { productId: product.id });
          setFavorites(prev => [...prev, product.id]);
          showAlert('Added to favorites! ❤️');
        } else {
          // Remove from favorites
          const docToDelete = querySnapshot.docs[0];
          await deleteDoc(docToDelete.ref);
          setFavorites(prev => prev.filter(id => id !== product.id));
          showAlert('Removed from favorites! 💔');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showAlert('Failed to update favorites. Please try again.', true);
    }
  };

  const isInCheckout = checkoutList.includes(product?.id);
  const isInFavorites = favorites.includes(product?.id);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const renderImage = () => {
    // Extract image URLs from different formats
    let imageUrls = [];
    
    if (product?.images) {
      if (Array.isArray(product.images)) {
        // Array format: ['url1', 'url2', ...]
        imageUrls = product.images;
      } else if (product.images.urls && Array.isArray(product.images.urls)) {
        // Object with urls array: {urls: ['url1', 'url2', ...]}
        imageUrls = product.images.urls;
      } else if (typeof product.images === 'object') {
        // Object format: {image_1: 'url1', image_2: 'url2', ...}
        imageUrls = Object.values(product.images).filter(url => typeof url === 'string');
      }
    }
    
    if (imageUrls.length > 0) {
      const displayImages = imageUrls.slice(0, 4);
      const remainingCount = imageUrls.length - 4;
      
      return (
        <div className="space-y-4">
          {/* Main image grid - show up to 4 images */}
          <div className="grid grid-cols-2 gap-4">
            {displayImages.map((image, index) => (
              <div 
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => openImageViewer(imageUrls, index)}
              >
                <img 
                  src={image} 
                  alt={`${product.title} ${index + 1}`} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show "+X more" if there are more than 4 images */}
            {remainingCount > 0 && (
              <div 
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-gray-100 flex items-center justify-center"
                onClick={() => openImageViewer(imageUrls, 4)}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-600 mb-2">+{remainingCount}</div>
                  <div className="text-sm text-gray-500">more images</div>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Click instruction */}
          <p className="text-sm text-gray-500 text-center">
            Click on any image to view in full size
          </p>
        </div>
      );
    } else if (product?.thumbnail && product.thumbnail !== 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') {
      return (
        <div 
          className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          onClick={() => openImageViewer([product.thumbnail], 0)}
        >
          <img 
            src={product.thumbnail} 
            alt={product.title} 
            className="w-full max-w-md h-auto group-hover:scale-105 transition-transform duration-300"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center mt-2">
            Click to view in full size
          </p>
        </div>
      );
    } else {
      return (
        <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Image not available</p>
        </div>
      );
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={authPromptModal.isOpen}
        onClose={closeAuthPromptModal}
        actionType={authPromptModal.actionType}
      />

      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={closeErrorDialog}
        title={errorDialog.title}
        message={errorDialog.message}
        details={errorDialog.details}
      />

      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={closeSuccessDialog}
        title={successDialog.title}
        message={successDialog.message}
      />

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={imageViewer.isOpen}
        onClose={closeImageViewer}
        images={imageViewer.images}
        currentIndex={imageViewer.currentIndex}
      />

      <div className="container mx-auto px-4 py-8">
        
        <div className="max-w-6xl mx-auto">
          {/* Product Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images */}
              <div>
                {renderImage()}
              </div>

              {/* Product Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-2">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-lg text-gray-600">({product.review_count || 0})</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                    {product.discount_percentage > 0 && (
                      <span className="text-lg text-gray-500 line-through">
                        ${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}
                      </span>
                    )}
                    {product.discount_percentage > 0 && (
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                        -{product.discount_percentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={isInCheckout ? removeFromCheckout : addToCheckout}
                    disabled={product.stock === 0}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      isInCheckout 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } ${product.stock === 0 ? 'bg-gray-300 cursor-not-allowed' : ''}`}
                  >
                    {isInCheckout ? 'Remove from Checkout' : 'Add to Checkout'}
                  </button>
                  
                  <button
                    onClick={toggleFavorite}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                      isInFavorites 
                        ? 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                    }`}
                  >
                    <svg 
                      className={`w-5 h-5 ${isInFavorites ? 'fill-current' : ''}`} 
                      fill={isInFavorites ? 'currentColor' : 'none'} 
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
                    <span>{isInFavorites ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Reviews */}
              <ProductReviews 
                productId={product.id} 
                productTitle={product.title} 
                reviews={product.reviews || []} 
                onReviewAdded={fetchProduct}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Product Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category</span>
                    <p className="text-gray-900">{product.category}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Brand</span>
                    <p className="text-gray-900">{product.brand}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">SKU</span>
                    <p className="text-gray-900">{product.sku}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Weight</span>
                    <p className="text-gray-900">{product.weight}g</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Availability</span>
                    <p className="text-gray-900">{product.availability_status}</p>
                  </div>
                </div>
              </div>

              {/* Shipping & Returns */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping & Returns</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Shipping</span>
                    <p className="text-gray-900">{product.shipping_information}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Return Policy</span>
                    <p className="text-gray-900">{product.return_policy}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Warranty</span>
                    <p className="text-gray-900">{product.warranty_information}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetail;
