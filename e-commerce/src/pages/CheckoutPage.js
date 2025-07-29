import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PaymentForm from '../components/PaymentForm';
import AuthPromptModal from '../components/AuthPromptModal';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ErrorDialog from '../components/ErrorDialog';
import SuccessDialog from '../components/SuccessDialog';

// Initialize Stripe
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [billingInfo, setBillingInfo] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: ''
  });
  const [shippingInfo, setShippingInfo] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: ''
  });
  const [paymentStep, setPaymentStep] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [authPromptModal, setAuthPromptModal] = useState({ isOpen: false, actionType: 'checkout' });
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '', details: '' });
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });
  const { currentUser, fetchBillingAndShippingInfo } = useAuth();

  useEffect(() => {
    const isLoggedIn = () => {
      return currentUser && !currentUser.isAnonymous;
    };

    if (!isLoggedIn()) {
      setAuthPromptModal({ isOpen: true, actionType: 'checkout' });
      setIsLoading(false);
      return;
    }

    const loadProfileInfo = async () => {
      try {
        const profileInfo = await fetchBillingAndShippingInfo();
        if (profileInfo) {
          setBillingInfo({
            line1: profileInfo.billingAddressLine1 || '',
            line2: profileInfo.billingAddressLine2 || '',
            city: profileInfo.billingCity || '',
            state: profileInfo.billingState || '',
            zip: profileInfo.billingZip || '',
          });
          setShippingInfo({
            line1: profileInfo.shippingAddressLine1 || '',
            line2: profileInfo.shippingAddressLine2 || '',
            city: profileInfo.shippingCity || '',
            state: profileInfo.shippingState || '',
            zip: profileInfo.shippingZip || '',
          });
        }
      } catch (error) {
        console.error("Error fetching billing and shipping info:", error);
        setError("There was an error loading profile information.");
      }
    };

    const loadCartFromFirebase = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const cartRef = collection(db, 'checkout', user.uid, 'items');
          const cartSnapshot = await getDocs(cartRef);
          const cartItems = cartSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCart(cartItems);
        } catch (error) {
          console.error("Error loading cart:", error);
          setError("Failed to load cart items.");
        }
      }
    };

    loadProfileInfo();
    loadCartFromFirebase();
    setIsLoading(false);
  }, [currentUser, fetchBillingAndShippingInfo]);

  const clearCheckoutList = async () => {
    const user = auth.currentUser;
    if (user) {
      const checkoutRef = collection(db, 'checkout', user.uid, 'items');
      const checkoutSnapshot = await getDocs(checkoutRef);
      const deletePromises = checkoutSnapshot.docs.map(docItem => deleteDoc(doc(db, 'checkout', user.uid, 'items', docItem.id)));
      await Promise.all(deletePromises);
    }
  };

  const handleProceedToPayment = () => {
    setError('');  // Clear any previous error 

    // Validation checks
    if (cart.length === 0) {
      setError('Your cart is empty. Please add items to your cart before proceeding.');
      return;
    }

    // Check for alphanumeric characters in Address Line 1 for billing and shipping
    const hasValidBillingInfo = billingInfo && /\w/.test(billingInfo.line1);
    const hasValidShippingInfo = shippingInfo && /\w/.test(shippingInfo.line1);

    if (!hasValidBillingInfo || !hasValidShippingInfo) {
      setError('Both billing and shipping information are required before proceeding to payment.');
      return;
    }

    setPaymentStep(true);
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      await clearCheckoutList();
      setOrderConfirmed(true);
      setOrderId(paymentIntent.id);
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Error after payment success:', error);
      setError('Payment was successful but there was an error clearing your cart.');
    }
  };

  const handlePaymentError = (errorMessage) => {
    setError(`Payment failed: ${errorMessage}`);
  };

  const handleValidationError = (errors) => {
    setError(errors.join('. '));
  };

  const removeFromCheckout = async (itemId) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await deleteDoc(doc(db, 'checkout', user.uid, 'items', itemId));
        setCart(cart.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Error removing item from checkout:', error);
      }
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = item.quantity || 1;
      return total + (itemPrice * itemQuantity);
    }, 0);
  };

  const subtotal = calculateTotal();
  const discountTotal = 0; // You can implement discount logic here
  const discountPercentages = 0;
  const tax = subtotal * 0.13; // 13% tax
  const total = subtotal + tax - discountTotal;

  const increaseQuantity = async (itemId) => {
    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.min((item.quantity || 1) + 1, item.stock); // Limit to stock
        if (newQuantity !== item.quantity) {
          updateDoc(doc(db, 'checkout', auth.currentUser.uid, 'items', itemId), { quantity: newQuantity });
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const decreaseQuantity = async (itemId) => {
    const updatedCart = cart.map(item => {
      if (item.id === itemId && item.quantity > 1) {
        const newQuantity = item.quantity - 1;
        updateDoc(doc(db, 'checkout', auth.currentUser.uid, 'items', itemId), { quantity: newQuantity });
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(updatedCart);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600 text-lg">Loading your checkout...</p>
      </div>
    </div>
  );

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium text-gray-900">{orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium text-gray-900">${total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/home'}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => window.location.href = '/orders'}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                View Order History
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Error Dialog */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, title: '', message: '', details: '' })}
        title={errorDialog.title}
        message={errorDialog.message}
        details={errorDialog.details}
      />

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ isOpen: false, title: '', message: '' })}
        title={successDialog.title}
        message={successDialog.message}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={authPromptModal.isOpen}
        onClose={() => setAuthPromptModal({ isOpen: false, actionType: 'checkout' })}
        actionType={authPromptModal.actionType}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${paymentStep ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="ml-2 font-medium">Review Order</span>
            </div>
            
            <div className="w-16 h-1 bg-gray-200 rounded-full">
              <div className={`h-1 bg-blue-600 rounded-full transition-all duration-500 ${paymentStep ? 'w-full' : 'w-0'}`}></div>
            </div>
            
            <div className={`flex items-center ${paymentStep ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {paymentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">2</span>
                )}
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-green-500">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Shipping Address</h3>
                  <p className="text-gray-600">Your delivery information</p>
                </div>
              </div>
              
              {shippingInfo.line1 ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address Line 1:</span>
                    <span className="font-medium">{shippingInfo.line1}</span>
                  </div>
                  {shippingInfo.line2 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address Line 2:</span>
                      <span className="font-medium">{shippingInfo.line2}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">{shippingInfo.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">State/Province:</span>
                    <span className="font-medium">{shippingInfo.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Postal/Zip Code:</span>
                    <span className="font-medium">{shippingInfo.zip}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-500 mb-4">No shipping information found</p>
                  <button
                    onClick={() => window.location.href = '/profile'}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Shipping Info
                  </button>
                </div>
              )}
            </div>

            {/* Payment Section */}
            {paymentStep ? (
              stripePromise ? (
                <div className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-blue-500">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Payment Information</h3>
                      <p className="text-gray-600">Complete your purchase securely</p>
                    </div>
                  </div>
                  
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      amount={parseFloat(total)}
                      orderData={{
                        cartItems: cart,
                        billingInfo,
                        shippingInfo,
                        totalAmount: calculateTotal(),
                        orderDate: new Date().toISOString(),
                      }}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      onValidationError={handleValidationError}
                    />
                  </Elements>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-semibold text-red-800">Payment Processing Unavailable</h3>
                      <p className="text-red-600">Please check your Stripe configuration.</p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <button
                onClick={handleProceedToPayment}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Proceed to Payment
              </button>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-yellow-500 sticky top-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Order Summary</h3>
                  <p className="text-gray-600">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {cart.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={item.id} className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-bold text-gray-500 mr-2">{index + 1}.</span>
                            <h4 className="font-semibold text-gray-900 line-clamp-2">{item.name || item.title}</h4>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => decreaseQuantity(item.id)}
                                className="w-8 h-8 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="font-bold text-lg min-w-[2rem] text-center">{item.quantity || 1}</span>
                              <button 
                                onClick={() => increaseQuantity(item.id)}
                                className="w-8 h-8 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-gray-900">${item.price}</div>
                              <button 
                                onClick={() => removeFromCheckout(item.id)} 
                                className="text-red-500 text-sm hover:text-red-700 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <button
                    onClick={() => window.location.href = '/home'}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}

              {cart.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Discount ({discountPercentages}%):</span>
                    <span className="font-semibold text-green-600">-${discountTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (13%):</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
