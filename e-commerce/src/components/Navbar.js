import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebaseConfig';
import AuthPromptModal from './AuthPromptModal';

function Navbar() {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authPromptModal, setAuthPromptModal] = useState({ isOpen: false, actionType: 'signup' });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error("Failed to Logout");
    }
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleCreateAccount = () => {
    setDropdownOpen(false);
    setAuthPromptModal({ isOpen: true, actionType: 'signup' });
  };

  const getUserInitial = () => {
    if (currentUser) {
      if (currentUser.isAnonymous) {
        return 'G'; // Guest
      } else if (currentUser.email) {
        return currentUser.email.charAt(0).toUpperCase();
      }
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (currentUser) {
      if (currentUser.isAnonymous) {
        return 'Guest User';
      } else if (currentUser.email) {
        return currentUser.email.split('@')[0];
      }
    }
    return 'User';
  };

  const isGuestUser = () => {
    return currentUser && currentUser.isAnonymous;
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={authPromptModal.isOpen}
        onClose={() => setAuthPromptModal({ isOpen: false, actionType: 'signup' })}
        actionType={authPromptModal.actionType}
      />

      <nav className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-display font-bold text-gray-900">E-Store</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                to="/home"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/home') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/search"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/search') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                Search
              </Link>
              <Link
                to="/categories"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/categories') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                Categories
              </Link>
              <Link
                to="/favorites"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/favorites') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                Favorites
              </Link>
              {role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/admin') 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right side - User menu and cart */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            {currentUser && (
              <Link
                to="/checkout"
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </Link>
                )}

            {/* User dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-2 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{getUserInitial()}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">
                    {getUserDisplayName()}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-large border border-gray-100 py-1 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {isGuestUser() ? 'Guest User' : currentUser.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {isGuestUser() ? 'guest account' : `${role} account`}
                      </p>
                    </div>
                    
                    {!isGuestUser() && (
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Profile Settings
                      </Link>
                    )}
                    
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      My Favorites
                    </Link>
                    
                    {role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Admin Panel
                      </Link>
                    )}
                    
                    {isGuestUser() && (
                      <button
                        onClick={handleCreateAccount}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                      >
                        Create Account
                      </button>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      {isGuestUser() ? 'Exit Guest Mode' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/home"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/home') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/search"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/search') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Search
            </Link>
            <Link
              to="/categories"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/categories') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              to="/favorites"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/favorites') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Favorites
            </Link>
          {currentUser && (
              <Link
                to="/checkout"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cart
              </Link>
            )}
            {role === 'admin' && (
              <Link
                to="/admin"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/admin') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {currentUser ? (
              <div className="border-t border-gray-200 pt-4">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {isGuestUser() ? 'Guest User' : currentUser.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {isGuestUser() ? 'guest account' : `${role} account`}
                  </p>
                </div>
                
                {!isGuestUser() && (
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                )}
                
                {isGuestUser() && (
                  <button
                    onClick={() => {
                      handleCreateAccount();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-base font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Create Account
                  </button>
                )}
                
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                >
                  {isGuestUser() ? 'Exit Guest Mode' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-primary-600 hover:bg-primary-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
        </div>
      </div>
      )}
    </nav>
    </>
  );
}

export default Navbar;
