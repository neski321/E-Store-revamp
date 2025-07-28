// src/components/Categories.js
import React, { useEffect, useState } from 'react';
import { fetchProducts, getCategoriesFromProducts } from '../services/productService';
import { Link } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const toggleCategories = () => {
    setShowCategories(!showCategories);
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const products = await fetchProducts();
        const categories = getCategoriesFromProducts(products);
        setCategories(categories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    if (!loaded) {
      loadCategories();
      setLoaded(true);
    }
    loadCategories();
  }, [loaded]);

  return (
    <div className="px-6 py-8">
      <button onClick={toggleCategories} className="bg-gray-200 text-2xl font-bold px-4 py-2 rounded hover:bg-gray-500">
            Shop by Category
          </button>
      {showCategories && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <Link to={`/category/${category.toLowerCase()}`} key={index} className="block group">
              <div className="border rounded p-4 hover:bg-gray-100 transition duration-300 ease-in-out">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-600">{category}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
