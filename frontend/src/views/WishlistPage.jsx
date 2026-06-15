"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiHeart, FiShoppingCart, FiTrash2, FiChevronRight, FiPackage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../services/WishlistContext';
import { useCart } from '../services/CartContext';
import { useAuth } from '../services/AuthContext';
import Loader from '../components/Loader';
import { useMinLoadingTime } from '../hooks/useMinLoadingTime';

const WishlistPage = () => {
  const { wishlistItems, wishlistCount, loading, fetchWishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useRouter();
  const showLoader = useMinLoadingTime(loading, 600);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlistItems();
    }
  }, [isAuthenticated, fetchWishlistItems]);

  const handleMoveToCart = (item) => {
    const product = item.product;
    addToCart(product);
    removeFromWishlist(item.product_id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHeart className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Sign in to view your Wishlist</h2>
          <p className="text-gray-500 mb-8 font-medium">Save your favorite items and access them anytime by signing in to your account.</p>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6 gap-2 font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-gray-900">My Wishlist</span>
        </div>

        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <FiHeart className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Wishlist</h1>
              <p className="text-slate-500 mt-0.5 font-medium">
                {wishlistCount === 0 ? 'No saved items' : `${wishlistCount} saved item${wishlistCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {showLoader ? (
          <div className="flex justify-center py-20">
            <Loader size={64} dotSize={16} border={8} />
          </div>
        ) : wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-300"
          >
            <div className="bg-pink-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <img src="/assets/wishlistimag/wishlist.png" alt="Wishlist" className="w-10 h-10 object-contain" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Your wishlist is empty</h3>
            <p className="text-slate-500 font-medium mb-6">Start adding items you love by clicking the ♥ icon on any product.</p>
            <Link href="/products"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
            >
              <FiPackage className="w-5 h-5" />
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((item, idx) => {
                const product = item.product;
                if (!product) return null;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="bg-white rounded-[1.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:border-pink-100 transition-all duration-300 group flex flex-col h-full"
                  >
                    {/* Image */}
                    <div
                      className="relative w-full aspect-[4/5] rounded-xl bg-slate-50 mb-4 overflow-hidden flex items-center justify-center p-4 cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`http://127.0.0.1:8000${product.images[0]}`}
                          alt={product.name}
                          className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-slate-300 text-sm font-medium">No Image</div>
                      )}

                      {/* Remove Heart Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromWishlist(product.id); }}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-md text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 z-10"
                        title="Remove from wishlist"
                      >
                        <FiHeart className="w-5 h-5 fill-current" />
                      </button>

                      {/* Stock Badge */}
                      {product.stock <= 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col">
                      <p className="text-cyan-600 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">
                        {product.category}
                      </p>
                      <h3
                        className="text-slate-900 font-bold text-sm leading-snug mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {product.name}
                      </h3>

                      <div className="mt-auto">
                        <div className="flex items-end justify-between mb-4">
                          <span className="text-lg font-extrabold text-slate-900">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          {product.discountPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ${Number(product.discountPrice).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMoveToCart(item)}
                            disabled={product.stock <= 0}
                            className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiShoppingCart className="w-4 h-4" /> Move to Cart
                          </button>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Remove"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
