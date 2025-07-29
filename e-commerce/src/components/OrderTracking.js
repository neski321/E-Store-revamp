import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';

const OrderTracking = ({ orderId }) => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getOrderTracking(orderId);
        setOrderData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-600';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Order Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Order not found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Order Tracking</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(orderData.status)}`}>
            {getStatusText(orderData.status)}
          </span>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Order Information</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Order ID:</span> {orderId}</p>
            <p><span className="font-medium">Order Date:</span> {new Date(orderData.orderDate).toLocaleDateString()}</p>
            <p><span className="font-medium">Payment Status:</span> 
              <span className="text-green-600 font-medium ml-1">Paid</span>
            </p>
            {orderData.paymentIntentId && (
              <p><span className="font-medium">Payment ID:</span> {orderData.paymentIntentId}</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Shipping Address</h4>
          <div className="text-sm space-y-1">
            <p>{orderData.shippingInfo?.line1}</p>
            {orderData.shippingInfo?.line2 && <p>{orderData.shippingInfo.line2}</p>}
            <p>{orderData.shippingInfo?.city}, {orderData.shippingInfo?.state} {orderData.shippingInfo?.zip}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Order Items</h4>
        <div className="space-y-3">
          {orderData.cartItems?.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 font-medium">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">${item.price}</p>
                {item.discount && (
                  <p className="text-sm text-green-600">-{item.discount}% off</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-700 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${orderData.totalAmount?.subtotal}</span>
          </div>
          {orderData.totalAmount?.discountTotal > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-${orderData.totalAmount.discountTotal}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${orderData.totalAmount?.tax}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${orderData.totalAmount?.total}</span>
          </div>
        </div>
      </div>

      {/* Estimated Delivery */}
      {orderData.status === 'shipped' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div>
              <p className="font-medium text-blue-800">Estimated Delivery</p>
              <p className="text-sm text-blue-600">Your order is on its way! Expected delivery in 3-5 business days.</p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-gray-800">Need Help?</p>
            <p className="text-sm text-gray-600">If you have any questions about your order, please contact our support team.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking; 