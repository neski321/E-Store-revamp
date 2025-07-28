import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL;

const DeleteProduct = () => {
  const [searchId, setSearchId] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchType, setSearchType] = useState('id');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productNotFound, setProductNotFound] = useState(false);
  const [productId, setProductId] = useState('');

  const handleDeleteProduct = async (e) => {
    e.preventDefault();
    if (!productId) {
      alert('Please select a product to delete.');
      return;
    }
    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      setProductId('');
      alert('Product deleted successfully');
      setEditingProduct(null); // Clear product info after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleSearchProduct = async (e) => {
    e.preventDefault();
    try {
      let response;
  
      if (searchType === 'id') {
        response = await axios.get(`${API_URL}/products/${searchId}/`);
      } else if (searchType === 'title') {
        response = await axios.get(`${API_URL}/products/`, {
          params: {
            search: searchTitle,
            type: 'regular',
          },
        });
      }
  
      if (response.data) {
        const product = searchType === 'id' ? response.data : response.data[0];
        setEditingProduct(product);
        setProductId(product.id);  // Set the product ID for deletion
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

  return (
    <>
      <Navbar />
      <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center py-12">
        <div className="w-full max-w-lg bg-gray-800 p-6 rounded-lg shadow-lg">
          <Link
            to="/product-crud"
            className="block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full text-center mb-6 font-semibold transition duration-300 ease-in-out"
          >
            Back to Product Control
          </Link>

          <h2 className="text-3xl font-bold mb-6 text-center text-white">Delete Product</h2>

          <form onSubmit={handleSearchProduct} className="bg-gray-700 p-6 rounded shadow-md mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300">Search By</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="mt-1 block w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="id">Product ID</option>
                <option value="title">Product Title</option>
              </select>
            </div>

            {searchType === 'id' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">Product ID</label>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="mt-1 block w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            {searchType === 'title' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">Product Title</label>
                <input
                  type="text"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="mt-1 block w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-full hover:bg-green-600 transition duration-300 ease-in-out"
            >
              Search Product
            </button>
          </form>

          {productNotFound && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-center mb-6">
              <strong className="font-bold">Product not found!</strong>
              <span className="block">Please search for a valid product ID or title.</span>
            </div>
          )}

          {editingProduct && (
            <div className="bg-gray-700 p-6 rounded-lg shadow-md text-white">
              <h3 className="text-2xl font-bold mb-4">Product to be Deleted</h3>
              <p className="mb-2"><strong>Product ID:</strong> {editingProduct.id}</p>
              <p className="mb-2"><strong>Title:</strong> {editingProduct.title}</p>
              <p className="mb-2"><strong>Description:</strong> {editingProduct.description}</p>
              <p className="mb-2"><strong>Category:</strong> {editingProduct.category}</p>
              <p className="mb-4"><strong>Price:</strong> ${editingProduct.price}</p>

              <form onSubmit={handleDeleteProduct}>
                <button
                  type="submit"
                  className="w-full bg-red-500 text-white py-2 rounded-full hover:bg-red-600 transition duration-300 ease-in-out"
                  disabled={!editingProduct}
                >
                  Delete Product
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DeleteProduct;
