import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { AuthErrorCodes } from 'firebase/auth';

function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { currentUser, login, googleSignIn } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to="/" />;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/');
    } catch (error) {
      switch (error.code) {
        case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
          setError('The password and email address do not match. Please try again or create an account.');
          break;
        default:
          setError('Failed to log in');
          break;
      }
    }

    setLoading(false);
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await googleSignIn();
      navigate('/');
    } catch {
      setError('Failed to log in with Google');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100">
      {/* Branding section */}
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">E-commerce Store</span>
        </h1>
        <p className="text-lg text-gray-100 mt-2 font-medium text-center max-w-sm">
          Welcome back to your favorite online store — fast, stylish, and made for you.
        </p>
      </div>

      {/* Login form section */}
      <div className="flex items-center justify-center p-10">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Log In to Your Account</h2>
          {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" ref={emailRef} required className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" id="password" ref={passwordRef} required className="w-full px-3 py-2 border rounded" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
            >
              Log In
            </button>
          </form>
          <div className="text-center mt-4">
            <p>Need an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link></p>
            <p className="mt-2 text-sm text-gray-500">OR</p>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition mt-2"
          >
            Log in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
