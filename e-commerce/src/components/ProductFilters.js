import React, { useState, useEffect, useCallback } from 'react';

const ProductFilters = ({ onFiltersChange, onSortChange, onClearFilters }) => {
  const [filters, setFilters] = useState({
    title: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    maxRating: '',
    brand: '',
    category: '',
    inStock: false,
    hasDiscount: false
  });

  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titleDebounce, setTitleDebounce] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  // Fetch brands when category changes
  useEffect(() => {
    if (filters.category) {
      fetchBrands(filters.category);
    } else {
      fetchBrands();
    }
  }, [filters.category]);

  // Debounce title filter
  useEffect(() => {
    const timer = setTimeout(() => {
      if (titleDebounce !== filters.title) {
        handleFilterChange('title', titleDebounce);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [titleDebounce]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories/');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async (category = null) => {
    try {
      let url = '/api/brands/';
      if (category) {
        url += `?category=${encodeURIComponent(category)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    
    // Clear brand when category changes
    if (name === 'category') {
      newFilters.brand = '';
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleTitleChange = (value) => {
    setTitleDebounce(value);
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    onSortChange(field, order);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      title: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      maxRating: '',
      brand: '',
      category: '',
      inStock: false,
      hasDiscount: false
    };
    setFilters(clearedFilters);
    setTitleDebounce('');
    setSortBy('id');
    setSortOrder('desc');
    onClearFilters();
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters & Sorting</h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Clear All
        </button>
      </div>

      {/* Product Title Search */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Product Title</h4>
        <input
          type="text"
          value={titleDebounce}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Search by product title..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Price Range</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Min Price</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max Price</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Rating Range Filter */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Rating Range</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Min Rating</label>
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Rating</option>
              <option value="1">1+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max Rating</label>
            <select
              value={filters.maxRating}
              onChange={(e) => handleFilterChange('maxRating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Rating</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Category</h4>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Brand</h4>
        <select
          value={filters.brand}
          onChange={(e) => handleFilterChange('brand', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={brands.length === 0}
        >
          <option value="">
            {filters.category ? `All Brands in ${filters.category}` : 'All Brands'}
          </option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        {brands.length === 0 && filters.category && (
          <p className="text-sm text-gray-500 mt-1">No brands available for this category</p>
        )}
      </div>

      {/* Availability Filters */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Availability</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hasDiscount}
              onChange={(e) => handleFilterChange('hasDiscount', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">On Sale Only</span>
          </label>
        </div>
      </div>

      {/* Sorting Options */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Sort By</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleSortChange('price', 'asc')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              sortBy === 'price' && sortOrder === 'asc'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            Price: Low to High
          </button>
          <button
            onClick={() => handleSortChange('price', 'desc')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              sortBy === 'price' && sortOrder === 'desc'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            Price: High to Low
          </button>
          <button
            onClick={() => handleSortChange('rating', 'desc')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              sortBy === 'rating' && sortOrder === 'desc'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            Highest Rated
          </button>
          <button
            onClick={() => handleSortChange('created_at', 'desc')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              sortBy === 'created_at' && sortOrder === 'desc'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            Newest First
          </button>
          <button
            onClick={() => handleSortChange('title', 'asc')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              sortBy === 'title' && sortOrder === 'asc'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            Name: A to Z
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters; 