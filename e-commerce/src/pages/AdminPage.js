import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminPage = () => {
  const { currentUser, userRole } = useAuth();

  const isAdmin = () => {
    return currentUser && userRole === 'admin';
  };

  if (!isAdmin()) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-900 text-white min-h-screen">
          <div className="container mx-auto py-12 px-4 text-center">
            <h1 className="text-4xl font-bold mb-6">Access Denied</h1>
            <p className="text-xl mb-8">You don't have permission to access this page.</p>
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-md transition duration-300 ease-in-out"
            >
              Go Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Admin Functions</h1>
          <div className="flex flex-col space-y-6 items-center">
            <Link
              to="/product-crud"
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-md transition duration-300 ease-in-out"
            >
              Product Control
            </Link>
            <Link
              to="/review-moderation"
              className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-md transition duration-300 ease-in-out"
            >
              Review Moderation
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminPage;
