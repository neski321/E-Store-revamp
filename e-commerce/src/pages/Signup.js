import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { AuthErrorCodes } from 'firebase/auth';

function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const roleRef = useRef();
  const { currentUser, signup, googleSignIn } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (currentUser) return <Navigate to="/" />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value, roleRef.current.value);
      navigate('/');
    } catch (error) {
      switch (error.code) {
        case AuthErrorCodes.EMAIL_EXISTS:
          setError('Email address is already in use');
          break;
        case AuthErrorCodes.WEAK_PASSWORD:
          setError('Password should be at least 6 characters');
          break;
        default:
          setError('Failed to create an account');
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
      setError('Failed to sign up with Google');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100">
      {/* Branding Side */}
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10">
        <h1 className="text-5xl font-extrabold tracking-tight drop-shadow mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">E-Commerce Store</span>
        </h1>
        <p className="text-lg text-gray-100 font-medium text-center max-w-sm">
          Join the future of online shopping — curated just for you.
        </p>
      </div>

      {/* Signup Form */}
      <div className="flex items-center justify-center p-10">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Create Your Account</h2>
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" ref={emailRef} required className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" id="password" ref={passwordRef} required className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input type="password" id="password-confirm" ref={passwordConfirmRef} required className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select id="role" ref={roleRef} className="w-full px-3 py-2 border rounded">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-semibold"
            >
              Sign Up
            </button>
          </form>
          <div className="text-center mt-4">
            Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Log In</Link>
            <p className="text-sm text-gray-500 mt-2">OR</p>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded font-medium mt-2"
          >
            Sign Up with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
