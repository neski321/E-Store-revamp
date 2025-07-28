import React from 'react';
import { Link } from 'react-router-dom';

function FeaturedProducts({ products }) {
  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.slice(0, 9).map(product => (
          <div key={product.id} className="border rounded-lg p-4">
            <img src={product.thumbnail} alt={product.title} className="w-full h-48 object-cover mb-4 rounded" />
            <h2 className="text-xl font-semibold">{product.title}</h2>
            <p className="text-gray-700">{product.description}</p>
            <p className="text-gray-900 font-bold">${product.price}</p>
            <Link to={`/products/${product.id}`} className="text-blue-500 hover:underline">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturedProducts;
