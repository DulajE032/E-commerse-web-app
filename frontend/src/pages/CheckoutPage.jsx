import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiLock, FiCreditCard } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCart } from '../services/CartContext';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const shipping = cartTotal > 0 ? 15.00 : 0;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    // Simulate API Call
    setTimeout(() => {
      setIsSuccess(true);
      clearCart();
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} 
          className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6"
        >
          <FiCheckCircle className="w-12 h-12" />
        </motion.div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8 max-w-md">Thank you for your purchase. We've sent a confirmation email to you with the order details and tracking info.</p>
        <Link to="/products" className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <Link to="/products" className="text-orange-500 hover:underline">Return to Products</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/cart')} className="p-2 bg-white rounded-full shadow-sm hover:text-orange-500 transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">Secure Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Checkout Form */}
          <div className="flex-1 space-y-8">
             <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-8">
                
                {/* Contact Info */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                   <h2 className="text-xl font-bold text-gray-900 mb-6">1. Contact Information</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                        <input type="email" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="+1 (555) 000-0000" />
                      </div>
                   </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                   <h2 className="text-xl font-bold text-gray-900 mb-6">2. Shipping Address</h2>
                   <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                          <input type="text" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="John" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                          <input type="text" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="Doe" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address</label>
                        <input type="text" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="123 Main St, Apt 4B" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                          <input type="text" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="New York" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                          <input type="text" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="NY" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Zip Code</label>
                          <input type="text" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="10001" />
                        </div>
                      </div>
                   </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                   <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                     3. Payment Method <FiLock className="w-4 h-4 text-green-500" />
                   </h2>
                   
                   <div className="space-y-4">
                      {/* Options */}
                      <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-orange-500 focus:ring-orange-500" />
                        <div className="flex-1 flex justify-between items-center">
                          <span className="font-bold text-gray-900">Credit / Debit Card</span>
                          <FiCreditCard className="w-6 h-6 text-gray-400" />
                        </div>
                      </label>

                      {/* Card Details (Visible if Card is selected) */}
                      {paymentMethod === 'card' && (
                        <div className="p-4 border border-gray-200 rounded-xl space-y-4 bg-gray-50">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Card Number</label>
                            <input type="text" required placeholder="0000 0000 0000 0000" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry (MM/YY)</label>
                              <input type="text" required placeholder="MM/YY" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-700 mb-1">CVC</label>
                              <input type="text" required placeholder="123" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                            </div>
                          </div>
                        </div>
                      )}

                      <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-orange-500 focus:ring-orange-500" />
                        <span className="font-bold text-gray-900">PayPal</span>
                      </label>

                      <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-orange-500 focus:ring-orange-500" />
                        <span className="font-bold text-gray-900">Cash on Delivery</span>
                      </label>
                   </div>
                </div>

             </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 sticky top-24">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6">Your Order</h3>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg p-1 shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img src={`http://127.0.0.1:8000${item.images[0]}`} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                         <div className="w-full h-full bg-gray-200 rounded"></div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                      <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-gray-900 font-bold">Total</span>
                  <span className="text-3xl font-extrabold text-[#114B43]">${total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit"
                form="checkout-form"
                className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center shadow-md hover:shadow-lg gap-2"
              >
                <FiLock className="w-4 h-4" /> Place Order
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
