import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminPage = () => {
  return (
    <>
      <Navbar />
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Admin Functions</h1>
          <div className="flex justify-center">
            <Link
              to="/product-crud"
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-md transition duration-300 ease-in-out"
            >
              Product Control
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminPage;
