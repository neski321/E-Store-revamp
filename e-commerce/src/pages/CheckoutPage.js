import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthPromptModal from '../components/AuthPromptModal';

const CheckoutPage = () => {
  const { fetchBillingAndShippingInfo, placeOrder, currentUser } = useAuth();
  const navigate = useNavigate();
  const [billingInfo, setBillingInfo] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [showProfileRedirect, setShowProfileRedirect] = useState(false);
  const [authPromptModal, setAuthPromptModal] = useState({ isOpen: false, actionType: 'checkout' });

  const isLoggedIn = useCallback(() => {
    return currentUser && !currentUser.isAnonymous;
  }, [currentUser]);

  useEffect(() => {
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
          const cartRef = collection(db, 'users', user.uid, 'cart');
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
  }, [fetchBillingAndShippingInfo, currentUser, isLoggedIn]);

  const clearCheckoutList = async () => {
    const user = auth.currentUser;
    if (user) {
      const checkoutRef = collection(db, 'checkout', user.uid, 'items');
      const checkoutSnapshot = await getDocs(checkoutRef);
      const deletePromises = checkoutSnapshot.docs.map(docItem => deleteDoc(doc(db, 'checkout', user.uid, 'items', docItem.id)));
      await Promise.all(deletePromises);
    }
  };

  const handleConfirmOrder = async () => {
    setError('');  // Clear any previous error 

    // Validation checks
    if (cart.length === 0) {
      setError('Your cart is empty. Please add items to your cart before confirming the order.');
      return;
    }

    // Check for alphanumeric characters in Address Line 1 for billing and shipping
    const hasValidBillingInfo = billingInfo && /\w/.test(billingInfo.line1);
    const hasValidShippingInfo = shippingInfo && /\w/.test(shippingInfo.line1);

    if (!hasValidBillingInfo || !hasValidShippingInfo) {
      setError('Both billing and shipping information are required before confirming the order.');
      setShowProfileRedirect(true);
      return;
    }

    try {
      const orderData = {
        cartItems: cart,
        billingInfo,
        shippingInfo,
        totalAmount: calculateTotal(),
        orderDate: new Date().toISOString(),
      };
      await placeOrder(orderData);
      await clearCheckoutList();
      setOrderConfirmed(true);
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Error confirming order:', error);
      setError('There was an error processing your order.');
    }
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
    let subtotal = 0;
    let discountTotal = 0;
    let discountPercentages = [];
  
    cart.forEach((item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity, 10) || 1;
      const discount = item.discount ? parseFloat(item.discount) / 100 : 0;
  
      const itemDiscount = price * discount * quantity;
      discountTotal += itemDiscount;
  
      if (discount > 0) {
        discountPercentages.push(`${(discount * 100).toFixed(0)}%`);
      }
  
      subtotal += (price * quantity) - itemDiscount;
    });
  
    const tax = subtotal * 0.13;
    const total = (subtotal + tax).toFixed(2);
  
    return {
      subtotal: subtotal.toFixed(2),
      discountTotal: discountTotal.toFixed(2),
      discountPercentages: discountPercentages.join(", "),
      tax: tax.toFixed(2),
      total,
    };
  };
  
  const { subtotal, discountTotal, discountPercentages, tax, total } = calculateTotal();


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

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      
      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={authPromptModal.isOpen}
        onClose={() => setAuthPromptModal({ isOpen: false, actionType: 'checkout' })}
        actionType={authPromptModal.actionType}
      />

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-extrabold mb-10 text-center text-blue-700">Checkout</h2>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        {orderConfirmed && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center">
            🎉 Order Confirmed! Thank you for your purchase.
          </div>
        )}

        {/* Redirect to Profile Modal */}
        {showProfileRedirect && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-semibold text-red-600 mb-4">Incomplete Profile Information</h3>
              <p className="text-gray-700 mb-4">
                Please update your billing and shipping information in your profile and try again.
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Go to Profile
              </button>
              <button
                onClick={() => setShowProfileRedirect(false)}
                className="ml-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Billing Information */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-t-4 border-blue-500">
          <h3 className="text-2xl font-semibold mb-4 text-blue-600">Billing Address</h3>
          {billingInfo ? (
            <div className="text-gray-700">
              <p><strong>Address Line 1:</strong> {billingInfo.line1}</p>
              <p><strong>Address Line 2:</strong> {billingInfo.line2}</p>
              <p><strong>City:</strong> {billingInfo.city}</p>
              <p><strong>State/Province:</strong> {billingInfo.state}</p>
              <p><strong>Postal/Zip Code:</strong> {billingInfo.zip}</p>
            </div>
          ) : (
            <p className="text-red-500">No billing information found.</p>
          )}
        </div>

        {/* Shipping Information */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-t-4 border-green-500">
          <h3 className="text-2xl font-semibold mb-4 text-green-600">Shipping Address</h3>
          {shippingInfo ? (
            <div className="text-gray-700">
              <p><strong>Address Line 1:</strong> {shippingInfo.line1}</p>
              <p><strong>Address Line 2:</strong> {shippingInfo.line2}</p>
              <p><strong>City:</strong> {shippingInfo.city}</p>
              <p><strong>State/Province:</strong> {shippingInfo.state}</p>
              <p><strong>Postal/Zip Code:</strong> {shippingInfo.zip}</p>
            </div>
          ) : (
            <p className="text-red-500">No shipping information found.</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-t-4 border-yellow-500">
          <h3 className="text-2xl font-semibold mb-4 text-yellow-600">Order Summary</h3>
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-6 text-gray-800">
                <div>
                  <div className="flex items-center">
                    <span className="font-bold mr-2">{index + 1}.</span>
                    <span className="font-medium text-lg">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <button onClick={() => decreaseQuantity(item.id)} className="px-3 py-1 bg-gray-300 rounded-full">
                      -
                    </button>
                    <span className="font-semibold text-lg">{item.quantity || 1}</span>
                    <button onClick={() => increaseQuantity(item.id)} className="px-3 py-1 bg-gray-300 rounded-full">
                      +
                    </button>
                  </div>
                </div>
                <div className="text-lg font-semibold">${item.price}</div>
                <button 
                  onClick={() => removeFromCheckout(item.id)} 
                  className="ml-4 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className="text-red-500">Your cart is empty.</p>
          )}
          <hr className="my-4" />
          <div className="flex justify-between mt-4">
            <span className="text-lg">Subtotal:</span>
            <span className="text-lg font-medium">${subtotal}</span>
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-lg">Discount ({discountPercentages}):</span>
            <span className="text-lg font-medium">-${discountTotal}</span>
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-lg">Tax (13%):</span>
            <span className="text-lg font-medium">${tax}</span>
          </div>
          <div className="flex justify-between mt-4 font-bold">
            <span className="text-xl">Total:</span>
            <span className="text-xl text-blue-700">${total}</span>
          </div>
        </div>

        {/* Confirm Order Button */}
        {!orderConfirmed && (
          <button
            onClick={handleConfirmOrder}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-full font-semibold shadow-md transition duration-300 ease-in-out mt-4"
          >
            Confirm Order
          </button>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
