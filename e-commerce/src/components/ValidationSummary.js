// src/components/ValidationSummary.js

import React from 'react';

const ValidationSummary = ({ errors, onFieldClick }) => {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }

  const getFieldStep = (field) => {
    if (['title', 'description', 'category', 'price', 'brand', 'discount_percentage'].includes(field)) {
      return 1;
    } else if (['stock', 'sku', 'weight', 'minimum_order_quantity', 'dimensions_width', 'dimensions_height', 'dimensions_depth'].includes(field)) {
      return 2;
    } else if (field === 'images') {
      return 3;
    }
    return 1;
  };

  const getFieldLabel = (field) => {
    const labels = {
      title: 'Product Title',
      description: 'Description',
      category: 'Category',
      price: 'Price',
      brand: 'Brand',
      discount_percentage: 'Discount Percentage',
      stock: 'Stock Quantity',
      sku: 'SKU',
      weight: 'Weight',
      minimum_order_quantity: 'Minimum Order Quantity',
      dimensions_width: 'Width',
      dimensions_height: 'Height',
      dimensions_depth: 'Depth',
      images: 'Product Images'
    };
    return labels[field] || field;
  };

  const getStepName = (step) => {
    const stepNames = {
      1: 'Basic Information',
      2: 'Inventory & Details',
      3: 'Images'
    };
    return stepNames[step] || 'Unknown';
  };

  // Group errors by step
  const errorsByStep = Object.entries(errors).reduce((acc, [field, error]) => {
    const step = getFieldStep(field);
    if (!acc[step]) {
      acc[step] = [];
    }
    acc[step].push({ field, error, label: getFieldLabel(field) });
    return acc;
  }, {});

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-lg font-medium text-red-800">
          Please fix the following errors:
        </h3>
      </div>
      
      <div className="space-y-4">
        {Object.entries(errorsByStep).map(([step, stepErrors]) => (
          <div key={step} className="bg-white rounded-md p-3 border border-red-200">
            <h4 className="font-medium text-red-700 mb-2">
              Step {step}: {getStepName(parseInt(step))}
            </h4>
            <ul className="space-y-1">
              {stepErrors.map(({ field, error, label }) => (
                <li key={field} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <button
                    onClick={() => onFieldClick && onFieldClick(field, parseInt(step))}
                    className="text-left text-red-700 hover:text-red-900 hover:underline"
                  >
                    <span className="font-medium">{label}:</span> {error}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-red-600">
        💡 Click on any error to jump to that field and fix it.
      </div>
    </div>
  );
};

export default ValidationSummary;
