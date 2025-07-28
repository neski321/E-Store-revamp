import React, { useState } from 'react';
import { addProduct } from '../services/productService';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AddProduct = () => {
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    discount_percentage: '',
    rating: '',
    stock: '',
    brand: '',
    sku: '',
    weight: '',
    warranty_information: '',
    shipping_information: '',
    availability_status: '',
    return_policy: '',
    minimum_order_quantity: '',
    thumbnail: '',
    images: {},
    dimensions: {
      width: '',
      height: '',
      depth: ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const preparedProduct = {
      ...newProduct,
      title: newProduct.title || 'N/A',
      description: newProduct.description || 'N/A',
      category: newProduct.category || 'N/A',
      price: newProduct.price || 0,
      discount_percentage: newProduct.discount_percentage || 0,
      rating: newProduct.rating || 0,
      stock: newProduct.stock || 0,
      brand: newProduct.brand || 'N/A',
      sku: newProduct.sku || 'N/A',
      weight: newProduct.weight || 0,
      warranty_information: newProduct.warranty_information || 'N/A',
      shipping_information: newProduct.shipping_information || 'N/A',
      availability_status: newProduct.availability_status || 'N/A',
      return_policy: newProduct.return_policy || 'N/A',
      minimum_order_quantity: newProduct.minimum_order_quantity || 1,
      thumbnail: newProduct.thumbnail || 'https://via.placeholder.com/150',
      images: newProduct.images || {},
      dimensions: {
        width: newProduct.dimensions.width || 0.0,
        height: newProduct.dimensions.height || 0.0,
        depth: newProduct.dimensions.depth || 0.0,
      }
    };

    try {
      await addProduct(preparedProduct);
      setNewProduct({
        title: '',
        description: '',
        category: '',
        price: '',
        discount_percentage: '',
        rating: '',
        stock: '',
        brand: '',
        sku: '',
        weight: '',
        warranty_information: '',
        shipping_information: '',
        availability_status: '',
        return_policy: '',
        minimum_order_quantity: '',
        thumbnail: '',
        images: {},
        dimensions: {
          width: '',
          height: '',
          depth: ''
        }
      });
      alert('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 bg-gray-900 text-white min-h-screen flex justify-center items-center">
        <div className="container max-w-lg mx-auto bg-gray-800 p-6 rounded shadow-lg">
          <Link to="/product-crud" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center mb-6 block">
            Back to Product Control
          </Link>

          <h2 className="text-3xl font-bold mb-6 text-center text-white">Add Product</h2>

          <form onSubmit={handleAddProduct} className="space-y-4">
            {Object.keys(newProduct).map((key) => (
              key !== 'reviews' && key !== 'dimensions' && (
                <div className="mb-4" key={key}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</label>
                  <input
                    type="text"
                    name={key}
                    value={newProduct[key]}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    style={{ transition: 'width 0.4s ease-in-out', minWidth: '150px', maxWidth: '100%' }}
                  />
                </div>
              )
            ))}

            <h3 className="text-xl font-bold mb-2 text-white">Dimensions</h3>
            {Object.keys(newProduct.dimensions).map((key) => (
              <div className="mb-4" key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</label>
                <input
                  type="text"
                  name={key}
                  value={newProduct.dimensions[key]}
                  onChange={(e) => setNewProduct((prevState) => ({
                    ...prevState,
                    dimensions: { ...prevState.dimensions, [key]: e.target.value }
                  }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  style={{ transition: 'width 0.4s ease-in-out', minWidth: '150px', maxWidth: '100%' }}
                />
              </div>
            ))}

            <button type="submit" className="w-full bg-blue-500 text-white py-3 px-8 rounded-full hover:bg-blue-600 transition duration-300 ease-in-out">
              Add Product
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddProduct;
