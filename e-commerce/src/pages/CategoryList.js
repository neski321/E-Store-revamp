// src/pages/CategoryList.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProducts } from '../services/productService';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CategoryList = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await fetchProducts();
        const filteredProducts = allProducts.filter(product => product.category.toLowerCase() === category.toLowerCase());
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadProducts();
  }, [category]);

  return (
    <div className="px-6 py-8">
      <Navbar />
      <h2 className="text-2xl font-bold mb-4">Products in {category}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="border rounded p-4">
            <h3 className="text-xl font-semibold">{product.title}</h3>
            <p className="text-gray-700">{product.brand}</p>
            <p className="text-gray-900 font-bold">${product.price}</p>
            <img src={product.thumbnail} alt={product.title} className="w-full h-48 object-cover mt-2"/>
            <br />
            <button className="bg-gray-200 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"><Link to={`/products/${product.id}`} className="text-blue-500 hover:underline">
              View Details
            </Link>
            </button>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryList;
