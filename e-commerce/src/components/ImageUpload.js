// src/components/ImageUpload.js

import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadMultipleImages, uploadSingleImage, validateImageFiles, getImagePreview } from '../services/imageUploadService';
import SuccessDialog from './SuccessDialog';
import ErrorDialog from './ErrorDialog';

const ImageUpload = ({ 
  onImagesUploaded, 
  multiple = true, 
  maxFiles = 10,
  className = "",
  showPreview = true,
  productTitle = "",
  isUpdate = false
}) => {
  const { currentUser, role } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '', details: '' });
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    // Validate files
    const validation = validateImageFiles(files);
    if (!validation.valid) {
      setErrorDialog({
        isOpen: true,
        title: 'Invalid Files',
        message: validation.error,
        details: ''
      });
      return;
    }
    
    setSelectedFiles(files);
    
    // Generate preview URLs
    if (showPreview) {
      try {
        const previews = await Promise.all(
          files.map(file => getImagePreview(file))
        );
        setPreviewUrls(previews);
      } catch (error) {
        console.error('Error generating previews:', error);
      }
    }
  };

  const handleUpload = async () => {
    if (!currentUser) {
      setErrorDialog({
        isOpen: true,
        title: 'Authentication Required',
        message: 'Please log in to upload images.',
        details: ''
      });
      return;
    }

    if (selectedFiles.length === 0) {
      setErrorDialog({
        isOpen: true,
        title: 'No Files Selected',
        message: 'Please select at least one image to upload.',
        details: ''
      });
      return;
    }

    setUploading(true);

    try {
      let result;
      if (multiple) {
        result = await uploadMultipleImages(selectedFiles, currentUser, role, productTitle, isUpdate);
      } else {
        result = await uploadSingleImage(selectedFiles[0], currentUser, role, productTitle);
      }

      if (result.success) {
        setSuccessDialog({
          isOpen: true,
          title: 'Upload Successful! 📸',
          message: `Successfully uploaded ${result.data.count || 1} image(s) to Cloudflare.`
        });
        
        // Clear selected files and previews
        setSelectedFiles([]);
        setPreviewUrls([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Notify parent component
        if (onImagesUploaded) {
          onImagesUploaded(result.data.urls || [result.data.url]);
        }
      } else {
        setErrorDialog({
          isOpen: true,
          title: 'Upload Failed',
          message: result.error,
          details: ''
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Upload Error',
        message: 'An unexpected error occurred during upload.',
        details: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`image-upload ${className}`}>
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

      {/* File Input */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload-input"
        />
        <label
          htmlFor="image-upload-input"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {multiple ? 'Select Images' : 'Select Image'}
        </label>
        <p className="text-xs text-gray-500 mt-1">
          {multiple ? `Up to ${maxFiles} images, max 10MB each` : 'Max 10MB, JPEG/PNG/WebP'}
        </p>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Files ({selectedFiles.length})
            </h4>
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {previewUrls[index] && (
                    <img
                      src={previewUrls[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="flex space-x-2">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </div>
            ) : (
              `Upload ${selectedFiles.length} Image${selectedFiles.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
