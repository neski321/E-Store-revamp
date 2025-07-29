import { loadStripe } from '@stripe/stripe-js';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Initialize Stripe (replace with your publishable key)
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

class PaymentService {
  constructor() {
    this.stripe = null;
    this.initializeStripe();
  }

  async initializeStripe() {
    try {
      if (!stripePromise) {
        console.warn('Stripe publishable key not found. Payment functionality will be disabled.');
        this.stripe = null;
        return;
      }
      this.stripe = await stripePromise;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      this.stripe = null;
    }
  }

  // Create payment intent on the backend
  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const response = await fetch('/api/create-payment-intent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return data.client_secret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Process payment with Stripe
  async processPayment(paymentMethodId, amount, orderData) {
    try {
      if (!this.stripe) {
        throw new Error('Payment processing is not available. Please check your Stripe configuration.');
      }

      // Create payment intent
      const clientSecret = await this.createPaymentIntent(amount);

      // Confirm payment
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Create order in Firestore
        await this.createOrder(orderData, paymentIntent.id);
        return { success: true, paymentIntent };
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  // Create order in Firestore
  async createOrder(orderData, paymentIntentId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const orderCollectionRef = collection(db, 'users', user.uid, 'orders');
      const orderDoc = await addDoc(orderCollectionRef, {
        ...orderData,
        paymentIntentId,
        status: 'confirmed',
        orderDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Send order confirmation email
      await this.sendOrderConfirmationEmail(orderDoc.id, orderData);

      return orderDoc.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Send order confirmation email
  async sendOrderConfirmationEmail(orderId, orderData) {
    try {
      const response = await fetch('/api/send-order-confirmation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          orderData,
          userEmail: auth.currentUser?.email,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to send order confirmation email');
      }
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }
  }

  // Validate billing and shipping information
  validateBillingInfo(billingInfo) {
    const errors = [];

    if (!billingInfo.line1 || billingInfo.line1.trim().length < 5) {
      errors.push('Billing address line 1 is required and must be at least 5 characters');
    }

    if (!billingInfo.city || billingInfo.city.trim().length < 2) {
      errors.push('City is required and must be at least 2 characters');
    }

    if (!billingInfo.state || billingInfo.state.trim().length < 2) {
      errors.push('State/Province is required and must be at least 2 characters');
    }

    if (!billingInfo.zip || !/^\d{5}(-\d{4})?$/.test(billingInfo.zip)) {
      errors.push('Valid ZIP/Postal code is required');
    }

    return errors;
  }

  validateShippingInfo(shippingInfo) {
    const errors = [];

    if (!shippingInfo.line1 || shippingInfo.line1.trim().length < 5) {
      errors.push('Shipping address line 1 is required and must be at least 5 characters');
    }

    if (!shippingInfo.city || shippingInfo.city.trim().length < 2) {
      errors.push('City is required and must be at least 2 characters');
    }

    if (!shippingInfo.state || shippingInfo.state.trim().length < 2) {
      errors.push('State/Province is required and must be at least 2 characters');
    }

    if (!shippingInfo.zip || !/^\d{5}(-\d{4})?$/.test(shippingInfo.zip)) {
      errors.push('Valid ZIP/Postal code is required');
    }

    return errors;
  }

  // Get order tracking information
  async getOrderTracking(orderId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const orderDocRef = doc(db, 'users', user.uid, 'orders', orderId);
      const orderDoc = await getDoc(orderDocRef);

      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }

      return orderDoc.data();
    } catch (error) {
      console.error('Error getting order tracking:', error);
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const orderDocRef = doc(db, 'users', user.uid, 'orders', orderId);
      await updateDoc(orderDocRef, {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}

const paymentService = new PaymentService();
export default paymentService; 