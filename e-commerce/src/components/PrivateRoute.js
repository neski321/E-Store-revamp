// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute() {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking authentication state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
          <p className="text-gray-500 mt-2">Please wait while we verify your authentication</p>
        </div>
      </div>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute;
