import React, { useState } from 'react';
import axios from 'axios';
import { updateProduct, removeReview } from '../services/productService';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL;

const UpdateProduct = () => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchType, setSearchType] = useState('id');
  const [productNotFound, setProductNotFound] = useState(false);
  const [changedFields, setChangedFields] = useState({});

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prevState) => ({ ...prevState, [name]: value }));
    setChangedFields((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSearchProduct = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (searchType === 'id') {
        response = await axios.get(`${API_URL}/products/${searchId}/`);
      } else if (searchType === 'title') {
        response = await axios.get(`${API_URL}/products/`, { params: { search: searchTitle, type: 'regular' } });
      }

      if (response.data) {
        setEditingProduct(searchType === 'id' ? response.data : response.data[0]);
        setProductNotFound(false);
      } else {
        setProductNotFound(true);
        setEditingProduct(null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setEditingProduct(null);
      setProductNotFound(true);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const updatedProduct = { ...changedFields };
      await updateProduct(editingProduct.id, updatedProduct);
      setEditingProduct(null);
      setChangedFields({});
      alert('Product updated successfully');
    } catch (error) {
      console.error('Error updating product with PATCH:', error);
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

  const handleReviewChange = (e, index) => {
    const { name, value } = e.target;
    setEditingProduct((prevState) => {
      const updatedReviews = [...prevState.reviews];
      updatedReviews[index] = { ...updatedReviews[index], [name]: value };
      return { ...prevState, reviews: updatedReviews };
    });
  };

  const handleRemoveReview = async (index) => {
    const reviewId = editingProduct.reviews[index].id;
    const productId = editingProduct.id;
    try {
      await removeReview(productId, reviewId);
      setEditingProduct((prevState) => {
        const updatedReviews = [...prevState.reviews];
        updatedReviews.splice(index, 1);
        return { ...prevState, reviews: updatedReviews };
      });
      alert('Review removed successfully');
    } catch (error) {
      console.error('Error removing review:', error);
    }
  };

  const handleAddReview = () => {
    setEditingProduct((prevState) => ({
      ...prevState,
      reviews: [...prevState.reviews, { rating: '', comment: '', reviewer_name: '', reviewer_email: '' }],
    }));
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-900 text-white min-h-screen py-12">
        <div className="container mx-auto px-6">
          <Link to="/product-crud" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-6 inline-block">
            Back to Product Control
          </Link>
          <h2 className="text-3xl font-bold text-center mb-10">Update Product</h2>

          {/* Search Product Form */}
          <form onSubmit={handleSearchProduct} className="bg-gray-800 p-6 rounded shadow-lg mb-6 mx-auto max-w-xl text-left">
            <h3 className="text-xl font-semibold mb-4">Search Product</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-200">Search By</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="mt-1 block w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm"
              >
                <option value="id">Product ID</option>
                <option value="title">Product Title</option>
              </select>
            </div>
            {searchType === 'id' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-200">Product ID</label>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="mt-1 block w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm"
                  required
                />
              </div>
            )}
            {searchType === 'title' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-200">Product Title</label>
                <input
                  type="text"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="mt-1 block w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm"
                  required
                />
              </div>
            )}
            <button type="submit" className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Search Product
            </button>
          </form>

          {productNotFound && (
            <div className="bg-red-800 border border-red-600 text-red-100 px-4 py-3 rounded relative mb-6">
              <strong>Product not found!</strong> Please search for a valid product ID or title.
            </div>
          )}

          {/* Update Product Form */}
          {editingProduct && (
            <form onSubmit={handleUpdateProduct} className="bg-gray-800 p-6 rounded shadow-lg mx-auto max-w-xl text-left">
              <h3 className="text-xl font-semibold mb-6">Edit Product Information</h3>
              {Object.keys(editingProduct).map(
                (key) =>
                  key !== 'reviews' && key !== 'dimensions' && (
                    <div className="mb-4" key={key}>
                      <label className="block text-sm font-medium text-gray-200">{key.replace(/_/g, ' ').toUpperCase()}</label>
                      <input
                        type="text"
                        name={key}
                        value={editingProduct[key]}
                        onChange={handleEditInputChange}
                        className="mt-1 block w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm"
                      />
                    </div>
                  )
              )}

              <h3 className="text-xl font-semibold mt-8 mb-4">Dimensions</h3>
              {editingProduct.dimensions &&
                Object.keys(editingProduct.dimensions).map((key) => (
                  <div className="mb-4" key={key}>
                    <label className="block text-sm font-medium text-gray-200">{key.replace(/_/g, ' ').toUpperCase()}</label>
                    <input
                      type="text"
                      name={key}
                      value={editingProduct.dimensions[key]}
                      onChange={handleDimensionChange}
                      className="mt-1 block w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm"
                    />
                  </div>
                ))}

              <button type="submit" className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 mt-6">
                Update Product
              </button>
            </form>
          )}

          {/* Reviews Section */}
          {editingProduct?.reviews && (
            <div className="bg-gray-800 p-6 rounded shadow-lg mx-auto max-w-xl mt-6">
              <h3 className="text-xl font-semibold mb-6">Reviews</h3>
              {editingProduct.reviews.map((review, index) => (
                <div key={index} className="mb-6 p-4 border border-gray-600 rounded-md">
                  <h4 className="text-lg font-semibold mb-2">Review {index + 1}</h4>
                  {Object.keys(review).map((key) => (
                    <div className="mb-2" key={key}>
                      <label className="block text-sm font-medium text-gray-200">{key.replace(/_/g, ' ').toUpperCase()}</label>
                      <input
                        type="text"
                        name={key}
                        value={review[key]}
                        onChange={(e) => handleReviewChange(e, index)}
                        className="mt-1 block w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm"
                      />
                    </div>
                  ))}
                  <button onClick={() => handleRemoveReview(index)} className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mt-2">
                    Remove Review
                  </button>
                </div>
              ))}
              <button onClick={handleAddReview} className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-2">
                Add Review
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UpdateProduct;
