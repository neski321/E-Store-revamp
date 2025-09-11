// src/components/ProductImageUpload.js

import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import SuccessDialog from './SuccessDialog';
import ErrorDialog from './ErrorDialog';

const ProductImageUpload = ({ onImagesSelected, initialImages = [], productTitle = "" }) => {
  const [selectedImages, setSelectedImages] = useState(initialImages);
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '', details: '' });

  const handleImagesUploaded = (uploadedUrls) => {
    const newImages = [...selectedImages, ...uploadedUrls];
    setSelectedImages(newImages);
    
    // Notify parent component
    if (onImagesSelected) {
      onImagesSelected(newImages);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    
    // Notify parent component
    if (onImagesSelected) {
      onImagesSelected(newImages);
    }
  };

  const handleSetThumbnail = (index) => {
    const newImages = [...selectedImages];
    const thumbnail = newImages.splice(index, 1)[0];
    newImages.unshift(thumbnail); // Move to front
    setSelectedImages(newImages);
    
    // Notify parent component
    if (onImagesSelected) {
      onImagesSelected(newImages);
    }
  };

  return (
    <div className="product-image-upload">
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

      {/* Image Upload Component */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
        <ImageUpload
          onImagesUploaded={handleImagesUploaded}
          multiple={true}
          maxFiles={10}
          showPreview={true}
          productTitle={productTitle}
        />
      </div>

      {/* Selected Images Display */}
      {selectedImages.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            Selected Images ({selectedImages.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {selectedImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Thumbnail indicator */}
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Thumbnail
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                    {index !== 0 && (
                      <button
                        onClick={() => handleSetThumbnail(index)}
                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 transition-colors"
                        title="Set as thumbnail"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            💡 The first image will be used as the product thumbnail. Click the star icon to set a different image as thumbnail.
          </p>
        </div>
      )}

      {/* Image URLs for Database */}
      {selectedImages.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Image URLs (for database):</h5>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              <strong>Thumbnail:</strong> {selectedImages[0]}
            </div>
            <div className="text-xs text-gray-600">
              <strong>Images JSON:</strong> {JSON.stringify(selectedImages)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;
