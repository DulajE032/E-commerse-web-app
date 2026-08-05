"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMinus, FiPlus, FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCart } from '../services/CartContext';
import { getImageUrl } from '../services/api';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const router = useRouter();

  const shipping = cartTotal > 0 ? 15.00 : 0;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-20 flex flex-col items-center justify-center">
        <div className="bg-white p-10 rounded-full shadow-sm mb-6">
          <FiShoppingBag className="w-20 h-20 text-gray-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link href="/products" className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm hover:text-orange-500 transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6"
              >
                {/* Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#F8F9FA] rounded-xl flex items-center justify-center p-2 shrink-0">
                  {item.images && item.images.length > 0 ? (
                    <img src={getImageUrl(item.images[0])} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                  ) : (
                    <div className="text-gray-300 text-xs">No Image</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-left flex flex-col h-full justify-between w-full">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                    <p className="text-gray-400 text-sm">{item.category}</p>
                  </div>
                  <div className="mt-4 sm:mt-auto flex items-center justify-between">
                    <span className="text-xl font-extrabold text-[#114B43]">${item.price.toFixed(2)}</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      title="Remove item"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-gray-900 w-6 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-gray-900">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax</span>
                  <span className="font-bold text-gray-900">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between text-base font-extrabold text-gray-900">
                  <span>Total</span>
                  <span className="text-[#114B43] text-xl">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link 
                href="/checkout" 
                className="w-full bg-[#114B43] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-95 transition-all shadow-md block text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;
