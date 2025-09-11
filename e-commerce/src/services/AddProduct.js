import React, { useState } from 'react';
import { addProduct } from '../services/productService';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductImageUpload from '../components/ProductImageUpload';
import CategoryCreationModal from '../components/CategoryCreationModal';
import ValidationSummary from '../components/ValidationSummary';
import SuccessDialog from '../components/SuccessDialog';
import ErrorDialog from '../components/ErrorDialog';
import { getCategories } from '../services/categoryService';

const AddProduct = () => {
  const { currentUser, role } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '', details: '' });
  const [productImages, setProductImages] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    discount_percentage: '',
    stock: '',
    brand: '',
    sku: '',
    weight: '',
    warranty_information: '',
    shipping_information: '',
    availability_status: 'In Stock',
    return_policy: '',
    minimum_order_quantity: '1',
    dimensions: {
      width: '',
      height: '',
      depth: ''
    }
  });

  const [errors, setErrors] = useState({});

  // Categories will be loaded from database only

  const availabilityStatuses = [
    'In Stock', 'Out of Stock', 'Pre-order', 'Discontinued'
  ];

  // Load categories from API only
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const result = await getCategories();
      if (result.success) {
        setAvailableCategories(result.data);
      } else {
        // If API fails, show empty list with error message
        setAvailableCategories([]);
        setErrorDialog({
          isOpen: true,
          title: 'Failed to Load Categories',
          message: 'Could not load categories from the database. Please try again.',
          details: result.error
        });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setAvailableCategories([]);
      setErrorDialog({
        isOpen: true,
        title: 'Error Loading Categories',
        message: 'An error occurred while loading categories. Please refresh the page.',
        details: error.message
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle new category creation
  const handleCategoryCreated = (newCategory) => {
    // Add the new category to the list
    setAvailableCategories(prev => [...prev, newCategory]);
    // Set the new category as selected
    setNewProduct(prev => ({ ...prev, category: newCategory }));
    // Clear any category errors
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  // Load categories on component mount
  React.useEffect(() => {
    loadCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevState) => ({ ...prevState, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevState) => ({
      ...prevState,
      dimensions: { ...prevState.dimensions, [name]: value }
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Basic Information Validation
      if (!newProduct.title.trim()) {
        newErrors.title = 'Product title is required';
      } else if (newProduct.title.trim().length < 3) {
        newErrors.title = 'Product title must be at least 3 characters long';
      } else if (newProduct.title.trim().length > 255) {
        newErrors.title = 'Product title must be less than 255 characters';
      }
      
      if (!newProduct.description.trim()) {
        newErrors.description = 'Product description is required';
      } else if (newProduct.description.trim().length < 10) {
        newErrors.description = 'Product description must be at least 10 characters long';
      } else if (newProduct.description.trim().length > 2000) {
        newErrors.description = 'Product description must be less than 2000 characters';
      }
      
      if (!newProduct.category) {
        newErrors.category = 'Category is required';
      }
      
      if (!newProduct.price || newProduct.price <= 0) {
        newErrors.price = 'Valid price is required (must be greater than 0)';
      } else if (newProduct.price > 999999.99) {
        newErrors.price = 'Price must be less than $999,999.99';
      }
      
      if (!newProduct.brand.trim()) {
        newErrors.brand = 'Brand is required';
      } else if (newProduct.brand.trim().length > 100) {
        newErrors.brand = 'Brand name must be less than 100 characters';
      }
      
      if (newProduct.discount_percentage && (newProduct.discount_percentage < 0 || newProduct.discount_percentage > 100)) {
        newErrors.discount_percentage = 'Discount percentage must be between 0 and 100';
      }
    }
    
    if (step === 2) {
      // Inventory & Details Validation
      if (!newProduct.stock || newProduct.stock < 0) {
        newErrors.stock = 'Valid stock quantity is required (must be 0 or greater)';
      } else if (newProduct.stock > 999999) {
        newErrors.stock = 'Stock quantity must be less than 1,000,000';
      }
      
      if (!newProduct.sku.trim()) {
        newErrors.sku = 'SKU is required';
      } else if (newProduct.sku.trim().length > 50) {
        newErrors.sku = 'SKU must be less than 50 characters';
      }
      
      if (!newProduct.weight || newProduct.weight <= 0) {
        newErrors.weight = 'Valid weight is required (must be greater than 0)';
      } else if (newProduct.weight > 9999.99) {
        newErrors.weight = 'Weight must be less than 10,000 lbs';
      }
      
      if (newProduct.minimum_order_quantity && newProduct.minimum_order_quantity < 1) {
        newErrors.minimum_order_quantity = 'Minimum order quantity must be at least 1';
      }
      
      // Dimensions validation
      if (newProduct.dimensions.width && newProduct.dimensions.width < 0) {
        newErrors.dimensions_width = 'Width must be 0 or greater';
      }
      if (newProduct.dimensions.height && newProduct.dimensions.height < 0) {
        newErrors.dimensions_height = 'Height must be 0 or greater';
      }
      if (newProduct.dimensions.depth && newProduct.dimensions.depth < 0) {
        newErrors.dimensions_depth = 'Depth must be 0 or greater';
      }
    }
    
    if (step === 3) {
      // Images Validation
      if (productImages.length === 0) {
        newErrors.images = 'At least one product image is required';
      } else if (productImages.length > 10) {
        newErrors.images = 'Maximum 10 images allowed';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      // Show validation errors for current step
      showValidationErrors(currentStep);
    }
  };

  const validateAllSteps = () => {
    const allErrors = {};
    
    // Validate all steps
    for (let step = 1; step <= 3; step++) {
      const stepErrors = {};
      
      if (step === 1) {
        // Basic Information Validation
        if (!newProduct.title.trim()) {
          stepErrors.title = 'Product title is required';
        } else if (newProduct.title.trim().length < 3) {
          stepErrors.title = 'Product title must be at least 3 characters long';
        } else if (newProduct.title.trim().length > 255) {
          stepErrors.title = 'Product title must be less than 255 characters';
        }
        
        if (!newProduct.description.trim()) {
          stepErrors.description = 'Product description is required';
        } else if (newProduct.description.trim().length < 10) {
          stepErrors.description = 'Product description must be at least 10 characters long';
        } else if (newProduct.description.trim().length > 2000) {
          stepErrors.description = 'Product description must be less than 2000 characters';
        }
        
        if (!newProduct.category) {
          stepErrors.category = 'Category is required';
        }
        
        if (!newProduct.price || newProduct.price <= 0) {
          stepErrors.price = 'Valid price is required (must be greater than 0)';
        } else if (newProduct.price > 999999.99) {
          stepErrors.price = 'Price must be less than $999,999.99';
        }
        
        if (!newProduct.brand.trim()) {
          stepErrors.brand = 'Brand is required';
        } else if (newProduct.brand.trim().length > 100) {
          stepErrors.brand = 'Brand name must be less than 100 characters';
        }
        
        if (newProduct.discount_percentage && (newProduct.discount_percentage < 0 || newProduct.discount_percentage > 100)) {
          stepErrors.discount_percentage = 'Discount percentage must be between 0 and 100';
        }
      }
      
      if (step === 2) {
        // Inventory & Details Validation
        if (!newProduct.stock || newProduct.stock < 0) {
          stepErrors.stock = 'Valid stock quantity is required (must be 0 or greater)';
        } else if (newProduct.stock > 999999) {
          stepErrors.stock = 'Stock quantity must be less than 1,000,000';
        }
        
        if (!newProduct.sku.trim()) {
          stepErrors.sku = 'SKU is required';
        } else if (newProduct.sku.trim().length > 50) {
          stepErrors.sku = 'SKU must be less than 50 characters';
        }
        
        if (!newProduct.weight || newProduct.weight <= 0) {
          stepErrors.weight = 'Valid weight is required (must be greater than 0)';
        } else if (newProduct.weight > 9999.99) {
          stepErrors.weight = 'Weight must be less than 10,000 lbs';
        }
        
        if (newProduct.minimum_order_quantity && newProduct.minimum_order_quantity < 1) {
          stepErrors.minimum_order_quantity = 'Minimum order quantity must be at least 1';
        }
        
        // Dimensions validation
        if (newProduct.dimensions.width && newProduct.dimensions.width < 0) {
          stepErrors.dimensions_width = 'Width must be 0 or greater';
        }
        if (newProduct.dimensions.height && newProduct.dimensions.height < 0) {
          stepErrors.dimensions_height = 'Height must be 0 or greater';
        }
        if (newProduct.dimensions.depth && newProduct.dimensions.depth < 0) {
          stepErrors.dimensions_depth = 'Depth must be 0 or greater';
        }
      }
      
      if (step === 3) {
        // Images Validation
        if (productImages.length === 0) {
          stepErrors.images = 'At least one product image is required';
        } else if (productImages.length > 10) {
          stepErrors.images = 'Maximum 10 images allowed';
        }
      }
      
      if (Object.keys(stepErrors).length > 0) {
        allErrors[`step${step}`] = stepErrors;
      }
    }
    
    return allErrors;
  };

  const showValidationErrors = (step) => {
    const stepErrors = validateStep(step);
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

  const showAllValidationErrors = () => {
    const allErrors = validateAllSteps();
    const totalErrors = Object.values(allErrors).reduce((sum, stepErrors) => sum + Object.keys(stepErrors).length, 0);
    
    if (totalErrors > 0) {
      const errorDetails = Object.entries(allErrors).map(([stepKey, stepErrors]) => {
        const stepNumber = stepKey.replace('step', '');
        const stepName = stepNumber === '1' ? 'Basic Information' : 
                        stepNumber === '2' ? 'Inventory & Details' : 
                        stepNumber === '3' ? 'Images' : 'Unknown';
        
        const stepErrorList = Object.entries(stepErrors).map(([field, error]) => `• ${field}: ${error}`).join('\n');
        return `Step ${stepNumber} (${stepName}):\n${stepErrorList}`;
      }).join('\n\n');
      
      setErrorDialog({
        isOpen: true,
        title: 'Product Validation Failed',
        message: `Please fix ${totalErrors} error${totalErrors > 1 ? 's' : ''} before submitting the product.`,
        details: errorDetails
      });
      
      // Go to the first step with errors
      const firstErrorStep = Object.keys(allErrors)[0];
      const stepNumber = parseInt(firstErrorStep.replace('step', ''));
      setCurrentStep(stepNumber);
    }
  };

  const handleFieldClick = (field, step) => {
    setCurrentStep(step);
    // Focus on the field (this would need to be implemented with refs)
    setTimeout(() => {
      const fieldElement = document.querySelector(`[name="${field}"]`);
      if (fieldElement) {
        fieldElement.focus();
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleImagesSelected = (images) => {
    setProductImages(images);
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Validate all steps before submission
    const allErrors = validateAllSteps();
    if (Object.keys(allErrors).length > 0) {
      showAllValidationErrors();
      return;
    }

    if (!currentUser) {
      setErrorDialog({
        isOpen: true,
        title: 'Authentication Required',
        message: 'Please log in to add products.',
        details: ''
      });
      return;
    }

    setSubmitting(true);

    try {
      const preparedProduct = {
        ...newProduct,
        price: parseFloat(newProduct.price) || 0,
        discount_percentage: parseFloat(newProduct.discount_percentage) || 0,
        stock: parseInt(newProduct.stock) || 0,
        weight: parseFloat(newProduct.weight) || 0,
        minimum_order_quantity: parseInt(newProduct.minimum_order_quantity) || 1,
        thumbnail: productImages[0] || '',
        images: productImages,
        dimensions: {
          width: parseFloat(newProduct.dimensions.width) || 0.0,
          height: parseFloat(newProduct.dimensions.height) || 0.0,
          depth: parseFloat(newProduct.dimensions.depth) || 0.0,
        }
      };

      await addProduct(preparedProduct, currentUser, role);
      
      setSuccessDialog({
        isOpen: true,
        title: 'Product Added Successfully! 🎉',
        message: `${newProduct.title} has been added to your inventory.`
      });
      
      // Reset form
      setNewProduct({
        title: '',
        description: '',
        category: '',
        price: '',
        discount_percentage: '',
        stock: '',
        brand: '',
        sku: '',
        weight: '',
        warranty_information: '',
        shipping_information: '',
        availability_status: 'In Stock',
        return_policy: '',
        minimum_order_quantity: '1',
        dimensions: {
          width: '',
          height: '',
          depth: ''
        }
      });
      setProductImages([]);
      setCurrentStep(1);
      setErrors({});
      
    } catch (error) {
      console.error('Error adding product:', error);
      
      // Handle backend validation errors
      if (error.response && error.response.data && error.response.data.field_errors) {
        const backendErrors = error.response.data.field_errors;
        const errorDetails = Object.entries(backendErrors)
          .map(([field, message]) => `• ${field}: ${message}`)
          .join('\n');
        
        setErrorDialog({
          isOpen: true,
          title: 'Validation Failed',
          message: 'Please fix the following errors before submitting the product.',
          details: errorDetails
        });
        
        // Set field errors for highlighting
        setErrors(backendErrors);
        
        // Go to the first step with errors
        const firstErrorField = Object.keys(backendErrors)[0];
        if (['title', 'description', 'category', 'price', 'brand', 'discount_percentage'].includes(firstErrorField)) {
          setCurrentStep(1);
        } else if (['stock', 'sku', 'weight', 'minimum_order_quantity', 'dimensions_width', 'dimensions_height', 'dimensions_depth'].includes(firstErrorField)) {
          setCurrentStep(2);
        } else if (firstErrorField === 'images') {
          setCurrentStep(3);
        }
      } else {
        setErrorDialog({
          isOpen: true,
          title: 'Failed to Add Product',
          message: 'There was an error adding the product. Please try again.',
          details: error.response?.data?.message || error.message
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Basic Information</h2>
              <p className="text-gray-600">Tell us about your product</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={newProduct.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your product in detail"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="flex space-x-2">
                  <select
                    name="category"
                    value={newProduct.category}
                    onChange={handleInputChange}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loadingCategories}
                  >
                    <option value="">
                      {loadingCategories 
                        ? 'Loading categories...' 
                        : availableCategories.length === 0 
                          ? 'No categories available - Create one!' 
                          : 'Select a category'
                      }
                    </option>
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center whitespace-nowrap"
                    title="Create new category"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New
                  </button>
                </div>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {availableCategories.length === 0 
                    ? 'No categories exist yet. Create the first one!' 
                    : 'Can\'t find the right category? Create a new one!'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={newProduct.brand}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.brand ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter brand name"
                />
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount_percentage"
                  value={newProduct.discount_percentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Inventory & Details</h2>
              <p className="text-gray-600">Stock and product specifications</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.stock ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={newProduct.sku}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.sku ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Product SKU"
                />
                {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (lbs) *
                </label>
                <input
                  type="number"
                  name="weight"
                  value={newProduct.weight}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.weight ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Status
                </label>
                <select
                  name="availability_status"
                  value={newProduct.availability_status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {availabilityStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Quantity
                </label>
                <input
                  type="number"
                  name="minimum_order_quantity"
                  value={newProduct.minimum_order_quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Information
                </label>
                <input
                  type="text"
                  name="warranty_information"
                  value={newProduct.warranty_information}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 1 year manufacturer warranty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Information
                </label>
                <input
                  type="text"
                  name="shipping_information"
                  value={newProduct.shipping_information}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Free shipping on orders over $50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Policy
                </label>
                <input
                  type="text"
                  name="return_policy"
                  value={newProduct.return_policy}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 30-day return policy"
                />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dimensions (inches)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                  <input
                    type="number"
                    name="width"
                    value={newProduct.dimensions.width}
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
                    value={newProduct.dimensions.height}
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
                    value={newProduct.dimensions.depth}
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
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Product Images</h2>
              <p className="text-gray-600">Upload images to showcase your product</p>
            </div>

            <ProductImageUpload
              onImagesSelected={handleImagesSelected}
              initialImages={productImages}
            />
            
            {errors.images && (
              <div className="text-center">
                <p className="text-red-500 text-sm">{errors.images}</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Submit</h2>
              <p className="text-gray-600">Review your product information before submitting</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Title:</span>
                  <span className="ml-2 text-gray-900">{newProduct.title}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-gray-900">{newProduct.category}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Brand:</span>
                  <span className="ml-2 text-gray-900">{newProduct.brand}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Price:</span>
                  <span className="ml-2 text-gray-900">${newProduct.price}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Stock:</span>
                  <span className="ml-2 text-gray-900">{newProduct.stock} units</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">SKU:</span>
                  <span className="ml-2 text-gray-900">{newProduct.sku}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Images:</span>
                  <span className="ml-2 text-gray-900">{productImages.length} uploaded</span>
                </div>
              </div>
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
      
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ isOpen: false, title: '', message: '' })}
        title={successDialog.title}
        message={successDialog.message}
      />

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, title: '', message: '', details: '' })}
        title={errorDialog.title}
        message={errorDialog.message}
        details={errorDialog.details}
      />

      {/* Category Creation Modal */}
      <CategoryCreationModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoryCreated={handleCategoryCreated}
        availableCategories={availableCategories}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/product-crud" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Product Management
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Add New Product</h1>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  {step < 4 && (
                    <div className={`w-24 h-1 mx-4 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Basic Info</span>
              <span>Inventory</span>
              <span>Images</span>
              <span>Review</span>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleAddProduct}>
              {/* Validation Summary */}
              {Object.keys(errors).length > 0 && (
                <ValidationSummary 
                  errors={errors} 
                  onFieldClick={handleFieldClick}
                />
              )}
              
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Product...
                      </>
                    ) : (
                      'Add Product'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default AddProduct;
