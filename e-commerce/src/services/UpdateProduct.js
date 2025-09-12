import React, { useState } from 'react';
import axios from 'axios';
import { updateProduct } from '../services/productService';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SuccessDialog from '../components/SuccessDialog';
import ErrorDialog from '../components/ErrorDialog';
import ImageUpload from '../components/ImageUpload';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const UpdateProduct = () => {
  const { currentUser, role } = useAuth();
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchType, setSearchType] = useState('id');
  const [productNotFound, setProductNotFound] = useState(false);
  const [changedFields, setChangedFields] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [hasUnsavedImageChanges, setHasUnsavedImageChanges] = useState(false);
  const [originalImages, setOriginalImages] = useState([]);
  
  // Dialog states
  const [successDialog, setSuccessDialog] = useState({ isOpen: false });
  const [errorDialog, setErrorDialog] = useState({ isOpen: false });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', details: '', onConfirm: null });

  const extractImageUrls = (images) => {
    if (!images) return [];
    
    if (Array.isArray(images)) {
      // Images stored as array
      return images;
    } else if (images.urls && Array.isArray(images.urls)) {
      // Images stored as object with urls array
      return images.urls;
    } else if (typeof images === 'object') {
      // Images stored as object with keys like image_1, image_2, etc.
      return Object.values(images);
    }
    
    return [];
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prevState) => ({ ...prevState, [name]: value }));
    setChangedFields((prevState) => ({ ...prevState, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProduct = () => {
    const newErrors = {};
    
    // Basic Information Validation
    if (changedFields.title !== undefined) {
      if (!changedFields.title.trim()) {
        newErrors.title = 'Product title is required';
      } else if (changedFields.title.trim().length < 3) {
        newErrors.title = 'Product title must be at least 3 characters long';
      } else if (changedFields.title.trim().length > 255) {
        newErrors.title = 'Product title must be less than 255 characters';
      }
    }
    
    if (changedFields.description !== undefined) {
      if (!changedFields.description.trim()) {
        newErrors.description = 'Product description is required';
      } else if (changedFields.description.trim().length < 10) {
        newErrors.description = 'Product description must be at least 10 characters long';
      } else if (changedFields.description.trim().length > 2000) {
        newErrors.description = 'Product description must be less than 2000 characters';
      }
    }
    
    if (changedFields.category !== undefined) {
      if (!changedFields.category) {
        newErrors.category = 'Category is required';
      }
    }
    
    if (changedFields.price !== undefined) {
      if (!changedFields.price || changedFields.price <= 0) {
        newErrors.price = 'Valid price is required (must be greater than 0)';
      } else if (changedFields.price > 999999.99) {
        newErrors.price = 'Price must be less than $999,999.99';
      }
    }
    
    if (changedFields.brand !== undefined) {
      if (!changedFields.brand.trim()) {
        newErrors.brand = 'Brand is required';
      } else if (changedFields.brand.trim().length > 100) {
        newErrors.brand = 'Brand name must be less than 100 characters';
      }
    }
    
    if (changedFields.discount_percentage !== undefined) {
      if (changedFields.discount_percentage && (changedFields.discount_percentage < 0 || changedFields.discount_percentage > 100)) {
        newErrors.discount_percentage = 'Discount percentage must be between 0 and 100';
      }
    }
    
    // Inventory & Details Validation
    if (changedFields.stock !== undefined) {
      if (!changedFields.stock || changedFields.stock < 0) {
        newErrors.stock = 'Valid stock quantity is required (must be 0 or greater)';
      } else if (changedFields.stock > 999999) {
        newErrors.stock = 'Stock quantity must be less than 1,000,000';
      }
    }
    
    if (changedFields.sku !== undefined) {
      if (!changedFields.sku.trim()) {
        newErrors.sku = 'SKU is required';
      } else if (changedFields.sku.trim().length > 50) {
        newErrors.sku = 'SKU must be less than 50 characters';
      }
    }
    
    if (changedFields.weight !== undefined) {
      if (!changedFields.weight || changedFields.weight <= 0) {
        newErrors.weight = 'Valid weight is required (must be greater than 0)';
      } else if (changedFields.weight > 9999.99) {
        newErrors.weight = 'Weight must be less than 10,000 lbs';
      }
    }
    
    if (changedFields.minimum_order_quantity !== undefined) {
      if (changedFields.minimum_order_quantity && changedFields.minimum_order_quantity < 1) {
        newErrors.minimum_order_quantity = 'Minimum order quantity must be at least 1';
      }
    }
    
    // Dimensions validation
    if (changedFields.dimensions) {
      if (changedFields.dimensions.width !== undefined && changedFields.dimensions.width < 0) {
        newErrors.dimensions_width = 'Width must be 0 or greater';
      }
      if (changedFields.dimensions.height !== undefined && changedFields.dimensions.height < 0) {
        newErrors.dimensions_height = 'Height must be 0 or greater';
      }
      if (changedFields.dimensions.depth !== undefined && changedFields.dimensions.depth < 0) {
        newErrors.dimensions_depth = 'Depth must be 0 or greater';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearchProduct = async (e) => {
    e.preventDefault();
    try {
      console.log('Searching for product:', { searchType, searchId, searchTitle, API_URL });
      let response;
      if (searchType === 'id') {
        const searchUrl = `${API_URL}/products/${searchId}/`;
        console.log('Searching by ID:', searchUrl);
        response = await axios.get(searchUrl);
        if (response.data) {
          setEditingProduct(response.data);
          setProductNotFound(false);
          setCurrentStep(1);
          // Load existing images
          console.log('Product data:', response.data);
          console.log('Images data:', response.data.images);
          
          const imageUrls = extractImageUrls(response.data.images);
          setProductImages(imageUrls);
          setOriginalImages(imageUrls); // Store original images for revert functionality
          console.log('Loaded images:', imageUrls);
        } else {
          setProductNotFound(true);
          setEditingProduct(null);
        }
      } else if (searchType === 'title') {
        const searchUrl = `${API_URL}/products/`;
        const searchParams = { 
          search: searchTitle,
          page_size: 10 // Limit results for better performance
        };
        console.log('Searching by title:', searchUrl, searchParams);
        response = await axios.get(searchUrl, { params: searchParams });
        
        if (response.data && response.data.results && response.data.results.length > 0) {
          // If multiple results, show selection modal
          if (response.data.results.length === 1) {
            const product = response.data.results[0];
            setEditingProduct(product);
        setProductNotFound(false);
            setCurrentStep(1);
            // Load existing images
            console.log('Product data (title search):', product);
            console.log('Images data (title search):', product.images);
            
            const imageUrls = extractImageUrls(product.images);
            setProductImages(imageUrls);
            setOriginalImages(imageUrls); // Store original images for revert functionality
            console.log('Loaded images (title search):', imageUrls);
          } else {
            // Show multiple results for user selection
            setSearchResults(response.data.results);
            setShowProductSelection(true);
            setEditingProduct(null);
          }
      } else {
        setProductNotFound(true);
        setEditingProduct(null);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setEditingProduct(null);
      setProductNotFound(true);
      setErrorDialog({
        isOpen: true,
        title: 'Search Error',
        message: 'There was an error searching for the product. Please try again.',
        details: error.message
      });
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      showValidationErrors(currentStep);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Basic Information Validation
      if (changedFields.title !== undefined) {
        if (!changedFields.title.trim()) {
          newErrors.title = 'Product title is required';
        } else if (changedFields.title.trim().length < 3) {
          newErrors.title = 'Product title must be at least 3 characters long';
        } else if (changedFields.title.trim().length > 255) {
          newErrors.title = 'Product title must be less than 255 characters';
        }
      }
      
      if (changedFields.description !== undefined) {
        if (!changedFields.description.trim()) {
          newErrors.description = 'Product description is required';
        } else if (changedFields.description.trim().length < 10) {
          newErrors.description = 'Product description must be at least 10 characters long';
        } else if (changedFields.description.trim().length > 2000) {
          newErrors.description = 'Product description must be less than 2000 characters';
        }
      }
      
      if (changedFields.category !== undefined) {
        if (!changedFields.category) {
          newErrors.category = 'Category is required';
        }
      }
      
      if (changedFields.price !== undefined) {
        if (!changedFields.price || changedFields.price <= 0) {
          newErrors.price = 'Valid price is required (must be greater than 0)';
        } else if (changedFields.price > 999999.99) {
          newErrors.price = 'Price must be less than $999,999.99';
        }
      }
      
      if (changedFields.brand !== undefined) {
        if (!changedFields.brand.trim()) {
          newErrors.brand = 'Brand is required';
        } else if (changedFields.brand.trim().length > 100) {
          newErrors.brand = 'Brand name must be less than 100 characters';
        }
      }
      
      if (changedFields.discount_percentage !== undefined) {
        if (changedFields.discount_percentage && (changedFields.discount_percentage < 0 || changedFields.discount_percentage > 100)) {
          newErrors.discount_percentage = 'Discount percentage must be between 0 and 100';
        }
      }
    }
    
    if (step === 2) {
      // Inventory & Details Validation
      if (changedFields.stock !== undefined) {
        if (!changedFields.stock || changedFields.stock < 0) {
          newErrors.stock = 'Valid stock quantity is required (must be 0 or greater)';
        } else if (changedFields.stock > 999999) {
          newErrors.stock = 'Stock quantity must be less than 1,000,000';
        }
      }
      
      if (changedFields.sku !== undefined) {
        if (!changedFields.sku.trim()) {
          newErrors.sku = 'SKU is required';
        } else if (changedFields.sku.trim().length > 50) {
          newErrors.sku = 'SKU must be less than 50 characters';
        }
      }
      
      if (changedFields.weight !== undefined) {
        if (!changedFields.weight || changedFields.weight <= 0) {
          newErrors.weight = 'Valid weight is required (must be greater than 0)';
        } else if (changedFields.weight > 9999.99) {
          newErrors.weight = 'Weight must be less than 10,000 lbs';
        }
      }
      
      if (changedFields.minimum_order_quantity !== undefined) {
        if (changedFields.minimum_order_quantity && changedFields.minimum_order_quantity < 1) {
          newErrors.minimum_order_quantity = 'Minimum order quantity must be at least 1';
        }
      }
      
      // Dimensions validation
      if (changedFields.dimensions) {
        if (changedFields.dimensions.width !== undefined && changedFields.dimensions.width < 0) {
          newErrors.dimensions_width = 'Width must be 0 or greater';
        }
        if (changedFields.dimensions.height !== undefined && changedFields.dimensions.height < 0) {
          newErrors.dimensions_height = 'Height must be 0 or greater';
        }
        if (changedFields.dimensions.depth !== undefined && changedFields.dimensions.depth < 0) {
          newErrors.dimensions_depth = 'Depth must be 0 or greater';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showValidationErrors = (step) => {
    const errorCount = Object.keys(errors).length;
    
    if (errorCount > 0) {
      setErrorDialog({
        isOpen: true,
        title: 'Validation Errors',
        message: `Please fix the ${errorCount} error${errorCount > 1 ? 's' : ''} in Step ${step} before continuing.`,
        details: Object.values(errors).join('\n')
      });
    }
  };

  const handleProductSelect = (product) => {
    setEditingProduct(product);
    setShowProductSelection(false);
    setSearchResults([]);
    setCurrentStep(1);
    setHasUnsavedImageChanges(false);
    // Load existing images
    console.log('Product selected:', product);
    console.log('Images in selected product:', product.images);
    
    const imageUrls = extractImageUrls(product.images);
    setProductImages(imageUrls);
    setOriginalImages(imageUrls); // Store original images for revert functionality
    console.log('Loaded images from selection:', imageUrls);
  };

  const handleImagesUploaded = async (uploadedUrls) => {
    if (!editingProduct || !uploadedUrls || uploadedUrls.length === 0) return;
    
    setUploadingImages(true);
    try {
      const updatedImages = [...productImages, ...uploadedUrls];
      
      // Update local state immediately
      setProductImages(updatedImages);
      setHasUnsavedImageChanges(true);
      
      // Immediately save to database
      const imageUpdateData = {
        images: updatedImages
      };
      
      await updateProduct(editingProduct.id, imageUpdateData, currentUser, role);
      
      // Update the editing product with new images
      setEditingProduct(prev => ({
        ...prev,
        images: updatedImages
      }));
      
      setSuccessDialog({
        isOpen: true,
        title: 'Images Uploaded & Saved',
        message: `Successfully uploaded and saved ${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} to the database.`
      });
    } catch (dbError) {
      console.error('Error saving images to database:', dbError);
      // Revert local state if database save fails
      setProductImages(prev => prev.filter(img => !uploadedUrls.includes(img)));
      setErrorDialog({
        isOpen: true,
        title: 'Database Save Error',
        message: 'Images were uploaded but failed to save to database. Please try again.',
        details: dbError.response?.data?.message || dbError.message
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageDelete = async (imageUrl) => {
    // Check if user is admin
    if (role !== 'admin') {
      setErrorDialog({
        isOpen: true,
        title: 'Permission Denied',
        message: 'Only administrators can delete images.',
        details: 'You need admin privileges to delete product images.'
      });
      return;
    }

    // Show confirmation dialog
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Image',
      message: 'Are you sure you want to remove this image from the product?',
      details: 'The image will be immediately removed from the database.',
      onConfirm: async () => {
        try {
          const updatedImages = productImages.filter(img => img !== imageUrl);
          
          // Update local state
          setProductImages(updatedImages);
          setHasUnsavedImageChanges(true);
          
          // Immediately save to database
          const imageUpdateData = {
            images: updatedImages
          };
          
          await updateProduct(editingProduct.id, imageUpdateData, currentUser, role);
          
          // Update the editing product with new images
          setEditingProduct(prev => ({
            ...prev,
            images: updatedImages
          }));
          
          setSuccessDialog({
            isOpen: true,
            title: 'Image Removed & Saved',
            message: 'Image has been removed from the product and database.'
          });
        } catch (error) {
          console.error('Error removing image from database:', error);
          // Revert local state if database save fails
          setProductImages(prev => [...prev, imageUrl]);
          setErrorDialog({
            isOpen: true,
            title: 'Database Save Error',
            message: 'Failed to remove image from database. Please try again.',
            details: error.response?.data?.message || error.message
          });
        }
      }
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Only allow form submission on step 4 when Update Product button is explicitly clicked
    if (currentStep === 4) {
      handleUpdateProduct(e);
    }
  };

  const handleKeyDown = (e) => {
    // Prevent Enter key from submitting form on steps 1-3
    if (e.key === 'Enter' && currentStep < 4) {
      e.preventDefault();
      // Instead, move to next step if validation passes
      if (validateStep(currentStep)) {
        nextStep();
      }
    }
  };

  const revertImageChanges = async () => {
    try {
      // Revert images to original state
      const imageUpdateData = {
        images: originalImages
      };
      
      await updateProduct(editingProduct.id, imageUpdateData, currentUser, role);
      
      // Update local state
      setProductImages(originalImages);
      setEditingProduct(prev => ({
        ...prev,
        images: originalImages
      }));
      setHasUnsavedImageChanges(false);
      
      setSuccessDialog({
        isOpen: true,
        title: 'Changes Reverted',
        message: 'All image changes have been reverted to the original state.'
      });
    } catch (error) {
      console.error('Error reverting image changes:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Revert Failed',
        message: 'Failed to revert image changes. Please try again.',
        details: error.response?.data?.message || error.message
      });
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    // Validate the product before updating
    if (!validateProduct()) {
      setErrorDialog({
        isOpen: true,
        title: 'Validation Failed',
        message: 'Please fix the errors before updating the product.',
        details: Object.values(errors).join('\n')
      });
      return;
    }

    if (!currentUser) {
      setErrorDialog({
        isOpen: true,
        title: 'Authentication Required',
        message: 'You must be logged in to update products.',
        details: 'Please log in and try again.'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Only update non-image fields since images are already saved
      const updatedProduct = { 
        ...changedFields
        // Note: images are not included here since they're already saved immediately
      };
      
      // Only update if there are non-image changes
      if (Object.keys(updatedProduct).length > 0) {
        await updateProduct(editingProduct.id, updatedProduct, currentUser, role);
      }
      
      setSuccessDialog({
        isOpen: true,
        title: 'Product Updated Successfully! 🎉',
        message: `${editingProduct.title} has been updated successfully.`
      });
      
      setEditingProduct(null);
      setChangedFields({});
      setErrors({});
      setProductImages([]);
      setOriginalImages([]);
      setHasUnsavedImageChanges(false);
    } catch (error) {
      console.error('Error updating product with PATCH:', error);
      
      // Handle backend validation errors
      if (error.response && error.response.data && error.response.data.field_errors) {
        const backendErrors = error.response.data.field_errors;
        setErrors(backendErrors);
        
        setErrorDialog({
          isOpen: true,
          title: 'Validation Failed',
          message: 'Please fix the following errors before updating the product.',
          details: Object.entries(backendErrors).map(([field, message]) => `• ${field}: ${message}`).join('\n')
        });
      } else {
        setErrorDialog({
          isOpen: true,
          title: 'Failed to Update Product',
          message: 'There was an error updating the product. Please try again.',
          details: error.response?.data?.message || error.message
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prevState) => ({
      ...prevState,
      dimensions: { ...prevState.dimensions, [name]: value },
    }));
    setChangedFields((prevState) => ({
      ...prevState,
      dimensions: { ...prevState.dimensions, [name]: value },
    }));
  };


  const renderStepContent = () => {
    if (!editingProduct) return null;

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
                <input
                  type="text"
                  name="title"
                  value={editingProduct.title}
                  onChange={handleEditInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={editingProduct.brand}
                  onChange={handleEditInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.brand ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter brand name"
                />
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={editingProduct.description}
                onChange={handleEditInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={editingProduct.category}
                  onChange={handleEditInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter category"
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={editingProduct.price}
                  onChange={handleEditInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage</label>
              <input
                type="number"
                name="discount_percentage"
                value={editingProduct.discount_percentage}
                onChange={handleEditInputChange}
                step="0.01"
                min="0"
                max="100"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.discount_percentage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.discount_percentage && <p className="text-red-500 text-sm mt-1">{errors.discount_percentage}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Inventory & Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  value={editingProduct.stock}
                  onChange={handleEditInputChange}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.stock ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs) *</label>
                <input
                  type="number"
                  name="weight"
                  value={editingProduct.weight}
                  onChange={handleEditInputChange}
                  step="0.1"
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.weight ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
              <input
                type="text"
                name="sku"
                value={editingProduct.sku}
                onChange={handleEditInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.sku ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter SKU"
              />
              {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Quantity</label>
              <input
                type="number"
                name="minimum_order_quantity"
                value={editingProduct.minimum_order_quantity}
                onChange={handleEditInputChange}
                min="1"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.minimum_order_quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1"
              />
              {errors.minimum_order_quantity && <p className="text-red-500 text-sm mt-1">{errors.minimum_order_quantity}</p>}
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-700 mb-4">Dimensions (inches)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                  <input
                    type="number"
                    name="width"
                    value={editingProduct.dimensions?.width || ''}
                    onChange={handleDimensionChange}
                    step="0.1"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.dimensions_width ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.0"
                  />
                  {errors.dimensions_width && <p className="text-red-500 text-sm mt-1">{errors.dimensions_width}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <input
                    type="number"
                    name="height"
                    value={editingProduct.dimensions?.height || ''}
                    onChange={handleDimensionChange}
                    step="0.1"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.dimensions_height ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.0"
                  />
                  {errors.dimensions_height && <p className="text-red-500 text-sm mt-1">{errors.dimensions_height}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Depth</label>
                  <input
                    type="number"
                    name="depth"
                    value={editingProduct.dimensions?.depth || ''}
                    onChange={handleDimensionChange}
                    step="0.1"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.dimensions_depth ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.0"
                  />
                  {errors.dimensions_depth && <p className="text-red-500 text-sm mt-1">{errors.dimensions_depth}</p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Images</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Current Images</h4>
                <div className="flex items-center space-x-2">
                  {hasUnsavedImageChanges && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Images Modified
                    </span>
                  )}
                  {hasUnsavedImageChanges && (
                    <button
                      onClick={revertImageChanges}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Revert Changes
                    </button>
                  )}
                </div>
              </div>
              
              {(() => {
                console.log('Rendering images section, productImages:', productImages);
                console.log('productImages.length:', productImages.length);
                return productImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {productImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      {role === 'admin' && (
                        <button
                          onClick={() => handleImageDelete(imageUrl)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No images uploaded yet</p>
                    <p className="text-xs text-gray-400 mt-2">Debug: productImages.length = {productImages.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Debug: editingProduct.images = {JSON.stringify(editingProduct?.images)}</p>
                  </div>
                );
              })()}
              
              <div className="border-t border-gray-200 pt-6">
                <h5 className="text-md font-medium text-gray-900 mb-4">Add New Images</h5>
                <ImageUpload
                  onImagesUploaded={handleImagesUploaded}
                  multiple={true}
                  maxFiles={10}
                  showPreview={true}
                  productTitle={editingProduct.title}
                  isUpdate={true}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                <div>
                  <span className="font-medium text-gray-700">SKU:</span>
                  <span className="ml-2 text-gray-900">{editingProduct.sku}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Images:</span>
                  <span className="ml-2 text-gray-900">{productImages.length} image{productImages.length !== 1 ? 's' : ''}</span>
                  {hasUnsavedImageChanges && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Saved to Database
                    </span>
                  )}
                </div>
              </div>
              
              {productImages.length > 0 && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Image Preview:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {productImages.slice(0, 4).map((imageUrl, index) => (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border border-gray-200"
                      />
                    ))}
                    {productImages.length > 4 && (
                      <div className="w-16 h-16 bg-gray-200 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                        +{productImages.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Update Product</h1>
            <p className="text-gray-600 mt-2">Modify your product information</p>
          </div>

          {/* Search Product Form */}
          {!editingProduct && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <form onSubmit={handleSearchProduct} className="max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold mb-6 text-center">Search Product to Update</h3>
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

          {/* Update Product Form */}
          {editingProduct && (
            <div className="bg-white rounded-lg shadow-lg">
              {/* Progress Steps */}
              <div className="px-8 pt-8">
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          currentStep >= step 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {currentStep > step ? '✓' : step}
                        </div>
                        {step < 4 && (
                          <div className={`w-12 h-1 mx-2 ${
                            currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center space-x-6 text-sm font-medium text-gray-600">
                  <span>Basic Info</span>
                  <span>Inventory</span>
                  <span>Images</span>
                  <span>Review</span>
                </div>
              </div>

              {/* Form */}
              <div className="p-8">
                <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown}>
                  {/* Validation Summary */}
                  {Object.keys(errors).length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="text-lg font-medium text-red-800 mb-2">Please fix the following errors:</h4>
                      <ul className="space-y-1">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field} className="text-red-700 text-sm">
                            • {field}: {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {renderStepContent()}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleUpdateProduct}
                        disabled={submitting}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting ? 'Updating...' : 'Update Product'}
                      </button>
                    )}
                  </div>
            </form>
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

      {/* Confirmation Dialog */}
      <ErrorDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        details={confirmDialog.details}
        isConfirmation={true}
        confirmText="Remove"
        cancelText="Cancel"
        onClose={() => setConfirmDialog({ isOpen: false, title: '', message: '', details: '', onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* Product Selection Modal */}
      {showProductSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Select Product to Update</h3>
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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

export default UpdateProduct;
