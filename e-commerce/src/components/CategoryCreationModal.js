// src/components/CategoryCreationModal.js

import React, { useState } from 'react';
import { createCategory } from '../services/categoryService';
import { useAuth } from '../contexts/AuthContext';
import SuccessDialog from './SuccessDialog';
import ErrorDialog from './ErrorDialog';

const CategoryCreationModal = ({ isOpen, onClose, onCategoryCreated, availableCategories = [] }) => {
  const { currentUser, role } = useAuth();
  const [categoryName, setCategoryName] = useState('');
  const [creating, setCreating] = useState(false);
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '', details: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      setErrorDialog({
        isOpen: true,
        title: 'Invalid Input',
        message: 'Please enter a category name.',
        details: ''
      });
      return;
    }

    if (!currentUser) {
      setErrorDialog({
        isOpen: true,
        title: 'Authentication Required',
        message: 'Please log in to create categories.',
        details: ''
      });
      return;
    }

    setCreating(true);

    try {
      const result = await createCategory(categoryName.trim(), currentUser, role);
      
      if (result.success) {
        setSuccessDialog({
          isOpen: true,
          title: 'Category Created! 🎉',
          message: `"${categoryName}" has been added to the available categories.`
        });
        
        // Reset form
        setCategoryName('');
        
        // Notify parent component
        if (onCategoryCreated) {
          onCategoryCreated(result.data.category);
        }
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
        
      } else {
        setErrorDialog({
          isOpen: true,
          title: 'Failed to Create Category',
          message: result.error,
          details: ''
        });
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Error',
        message: 'An unexpected error occurred while creating the category.',
        details: error.message
      });
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setCategoryName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
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

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Category</h2>
            <button
              onClick={handleClose}
              disabled={creating}
              className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name (e.g., Electronics, Clothing)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={creating}
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                {availableCategories && availableCategories.length === 0 
                  ? 'This will be the first category in your system and will be available for all products.'
                  : 'This category will be available for all products once created.'
                }
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={creating}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !categoryName.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {creating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Category'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CategoryCreationModal;
