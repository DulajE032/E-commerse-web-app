"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiX, FiStar, FiShoppingCart, FiHeart, FiCheck, FiTruck, FiShield } from 'react-icons/fi';
import { useCart } from '../services/CartContext';
import { useWishlist } from '../services/WishlistContext';
import { getImageUrl } from '../services/api';

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const images = product?.images && product.images.length > 0 ? product.images : [null];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) return null;

  const currentPrice = Number(product.discountPrice ?? product.discount_price ?? product.price);
  const originalPrice = (product.discountPrice || product.discount_price) ? Number(product.price) : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  
  const stock = product.stock ?? 0;
  const rating = product.rating || 0;
  const reviewCount = product.reviewCount ?? product.review_count ?? 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-gray-100 text-gray-500 rounded-full hover:bg-slate-900 hover:text-white transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Left Side: Images */}
        <div className="w-full md:w-1/2 p-6 bg-slate-50 flex flex-col justify-between items-center">
          <div className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden flex items-center justify-center p-4 shadow-sm border border-gray-100">
            <Image
              src={getImageUrl(images[selectedImageIndex])}
              alt={product.name}
              fill
              className="object-contain p-4 mix-blend-multiply"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
              {discountPercent > 0 && (
                <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  -{discountPercent}% OFF
                </span>
              )}
              {(product.freeShipping || product.free_shipping) && (
                <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Free Shipping
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto max-w-full pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-14 h-14 rounded-xl border-2 overflow-hidden bg-white shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-slate-900 scale-105' : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={getImageUrl(img)}
                    alt=""
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Info */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            {/* Category & Brand */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50 px-2.5 py-1 rounded-md">
                {product.category || 'General'}
              </span>
              {product.brand && (
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  • {product.brand}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h2 className="text-2xl font-black text-slate-900 leading-tight mb-3">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({reviewCount} reviews)</span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-black text-slate-900">
                ${currentPrice.toFixed(2)}
              </span>
              {originalPrice && originalPrice > currentPrice && (
                <span className="text-base font-bold text-gray-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="mb-6">
              {stock > 5 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  In Stock ({stock} available)
                </span>
              ) : stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Low Stock (Only {stock} left!)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
              {product.description || 'High-performance components engineered for excellence.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex gap-3">
              <button
                disabled={stock <= 0}
                onClick={() => {
                  addToCart(product);
                  onClose();
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingCart className="w-5 h-5" /> Add to Cart
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isInWishlist(product.id)
                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                    : 'border-gray-200 text-slate-600 hover:border-slate-900'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <Link
              href={`/product/${product.id}`}
              onClick={onClose}
              className="block w-full text-center text-xs font-bold text-slate-500 hover:text-slate-900 py-2"
            >
              View Full Product Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
