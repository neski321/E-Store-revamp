import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { deleteProduct } from '../services/productService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SuccessDialog from '../components/SuccessDialog';
import ErrorDialog from '../components/ErrorDialog';

const API_URL = process.env.REACT_APP_API_URL || '';

const DeleteProduct = () => {
  const { currentUser, role } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchType, setSearchType] = useState('id');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productNotFound, setProductNotFound] = useState(false);
  const [productId, setProductId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showProductSelection, setShowProductSelection] = useState(false);
  
  // Dialog states
  const [successDialog, setSuccessDialog] = useState({ isOpen: false });
  const [errorDialog, setErrorDialog] = useState({ isOpen: false });

  const handleDeleteProduct = async () => {
    if (!productId) {
      setErrorDialog({
        isOpen: true,
        title: 'No Product Selected',
        message: 'Please select a product to delete.',
        details: 'Search for a product first before attempting to delete.'
      });
      return;
    }

    if (!currentUser) {
      setErrorDialog({
        isOpen: true,
        title: 'Authentication Required',
        message: 'You must be logged in to delete products.',
        details: 'Please log in and try again.'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      await deleteProduct(productId, currentUser, role);
      
      setSuccessDialog({
        isOpen: true,
        title: 'Product Deleted Successfully! 🗑️',
        message: `${editingProduct?.title || 'Product'} has been deleted successfully. All associated images have been removed from storage.`
      });
      
      setProductId('');
      setEditingProduct(null);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Failed to Delete Product',
        message: 'There was an error deleting the product. Please try again.',
        details: error.response?.data?.message || error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchProduct = async (e) => {
    e.preventDefault();
    try {
      let response;
  
      if (searchType === 'id') {
        response = await axios.get(`${API_URL}/products/${searchId}/`);
        if (response.data) {
          setEditingProduct(response.data);
          setProductId(response.data.id);
          setProductNotFound(false);
        } else {
          setProductNotFound(true);
          setEditingProduct(null);
        }
      } else if (searchType === 'title') {
        response = await axios.get(`${API_URL}/products/`, {
          params: {
            search: searchTitle,
            page_size: 10 // Limit results for better performance
          },
        });
        
        if (response.data && response.data.results && response.data.results.length > 0) {
          // If multiple results, show selection modal
          if (response.data.results.length === 1) {
            const product = response.data.results[0];
            setEditingProduct(product);
            setProductId(product.id);
            setProductNotFound(false);
          } else {
            // Show multiple results for user selection
            setSearchResults(response.data.results);
            setShowProductSelection(true);
            setEditingProduct(null);
            setProductId('');
          }
        } else {
          setProductNotFound(true);
          setEditingProduct(null);
          setProductId('');
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setEditingProduct(null);
      setProductNotFound(true);
      setProductId('');
      setErrorDialog({
        isOpen: true,
        title: 'Search Error',
        message: 'There was an error searching for the product. Please try again.',
        details: error.message
      });
    }
  };

  const handleProductSelect = (product) => {
    setEditingProduct(product);
    setProductId(product.id);
    setShowProductSelection(false);
    setSearchResults([]);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/product-crud" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Product Control
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Delete Product</h1>
            <p className="text-gray-600 mt-2">Remove a product from your inventory</p>
          </div>

          {/* Search Product Form */}
          {!editingProduct && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <form onSubmit={handleSearchProduct} className="max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold mb-6 text-center">Search Product to Delete</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search By</label>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="id">Product ID</option>
                      <option value="title">Product Title</option>
                    </select>
                  </div>
                  <div>
                    {searchType === 'id' ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product ID</label>
                        <input
                          type="text"
                          value={searchId}
                          onChange={(e) => setSearchId(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter product ID"
                          required
                        />
                      </>
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
                        <input
                          type="text"
                          value={searchTitle}
                          onChange={(e) => setSearchTitle(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter product title"
                          required
                        />
                      </>
                    )}
                  </div>
                </div>
                <button type="submit" className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Search Product
                </button>
              </form>

              {productNotFound && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <strong>Product not found!</strong> Please search for a valid product ID or title.
                </div>
              )}
            </div>
          )}

          {/* Product Preview and Delete Confirmation */}
          {editingProduct && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Product Deletion</h2>
                <p className="text-gray-600">This action cannot be undone and will remove all associated images from storage.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Product ID:</span>
                    <span className="ml-2 text-gray-900">{editingProduct.id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Title:</span>
                    <span className="ml-2 text-gray-900">{editingProduct.title}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Brand:</span>
                    <span className="ml-2 text-gray-900">{editingProduct.brand}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-2 text-gray-900">{editingProduct.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Price:</span>
                    <span className="ml-2 text-gray-900">${editingProduct.price}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Stock:</span>
                    <span className="ml-2 text-gray-900">{editingProduct.stock} units</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="mt-1 text-gray-900">{editingProduct.description}</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductId('');
                    setSearchId('');
                    setSearchTitle('');
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={submitting}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        title={successDialog.title}
        message={successDialog.message}
        onClose={() => setSuccessDialog({ isOpen: false })}
      />

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        title={errorDialog.title}
        message={errorDialog.message}
        details={errorDialog.details}
        onClose={() => setErrorDialog({ isOpen: false })}
      />

      {/* Delete Confirmation Dialog */}
      <ErrorDialog
        isOpen={showConfirmDialog}
        title="Delete Product"
        message={`Are you sure you want to delete "${editingProduct?.title || 'this product'}"? This action cannot be undone and will remove all associated images from storage.`}
        isConfirmation={true}
        onConfirm={handleDeleteProduct}
        onClose={() => setShowConfirmDialog(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Product Selection Modal */}
      {showProductSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Select Product to Delete</h3>
              <p className="text-sm text-gray-600 mt-1">Multiple products found matching "{searchTitle}". Please select one:</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{product.title}</h4>
                      <p className="text-sm text-gray-600">ID: {product.id} • Brand: {product.brand}</p>
                      <p className="text-sm text-gray-500">${product.price} • Stock: {product.stock}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowProductSelection(false)}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default DeleteProduct;
