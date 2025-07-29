import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import paymentService from '../services/paymentService';

const PaymentForm = ({ amount, orderData, onPaymentSuccess, onPaymentError, onValidationError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate billing and shipping information
      const billingErrors = paymentService.validateBillingInfo(orderData.billingInfo);
      const shippingErrors = paymentService.validateShippingInfo(orderData.shippingInfo);

      if (billingErrors.length > 0 || shippingErrors.length > 0) {
        const allErrors = [...billingErrors, ...shippingErrors];
        onValidationError(allErrors);
        setLoading(false);
        return;
      }

      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message);
        onPaymentError(paymentMethodError.message);
        setLoading(false);
        return;
      }

      setProcessing(true);

      // Process payment
      const result = await paymentService.processPayment(
        paymentMethod.id,
        amount,
        orderData
      );

      if (result.success) {
        onPaymentSuccess(result.paymentIntent);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message);
      onPaymentError(error.message);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-purple-500">
      <h3 className="text-2xl font-semibold mb-4 text-purple-600">Payment Information</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Order Total</h4>
          <div className="text-2xl font-bold text-purple-600">
            ${amount.toFixed(2)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Your payment will be processed securely through Stripe
          </p>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading || processing}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold shadow-md transition duration-300 ease-in-out disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed hover:from-purple-600 hover:to-blue-700"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </span>
          ) : processing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Confirming Payment...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v1" />
              </svg>
              Pay ${amount.toFixed(2)}
            </span>
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>🔒 Your payment information is encrypted and secure</p>
        <p>Powered by Stripe</p>
      </div>
    </div>
  );
};

export default PaymentForm; 