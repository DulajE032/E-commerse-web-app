"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiStar, FiPlus, FiEye, FiRepeat, FiHeart, FiShoppingCart, FiTruck, FiCheck } from 'react-icons/fi';
import { useWishlist } from '../services/WishlistContext';
import { useCart } from '../services/CartContext';
import { useCompare } from '../services/CompareContext';
import { getImageUrl } from '../services/api';
import QuickViewModal from './QuickViewModal';
import WishlistIcon from './WishlistIcon';

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isInCompare, toggleCompare } = useCompare();

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  // Image handling
  const primaryImage = product.images?.[0] ? getImageUrl(product.images[0]) : "/logo.png";
  const secondaryImage = product.images?.[1] ? getImageUrl(product.images[1]) : primaryImage;

  // Price calculations
  const price = Number(product.discountPrice ?? product.discount_price ?? product.price);
  const originalPrice = (product.discountPrice || product.discount_price) ? Number(product.price) : null;
  const discountPercent = originalPrice && originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  // Stock status
  const stock = product.stock ?? 0;
  
  // Rating & Review Count
  const rating = Number(product.rating || 0);
  const reviewCount = product.reviewCount ?? product.review_count ?? 0;

  // Badge logic (driven by DB properties)
  const isNew = product.created_at || product.createdAt 
    ? (new Date() - new Date(product.created_at || product.createdAt)) / (1000 * 60 * 60 * 24) < 14 
    : false;
  const isBestSeller = (product.sales_count ?? product.salesCount ?? 0) >= 5 || product.featured;
  const isFreeShipping = product.free_shipping || product.freeShipping;

  return (
    <>
      <div 
        className="group bg-white rounded-3xl p-4 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* --- Top Badges Overlay --- */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-1.5 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              -{discountPercent}% SALE
            </span>
          )}
          {isBestSeller && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              BESTSELLER
            </span>
          )}
          {isNew && !discountPercent && (
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              NEW
            </span>
          )}
          {isFreeShipping && (
            <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              FREE SHIPPING
            </span>
          )}
        </div>

        {/* --- Quick Action Buttons (Wishlist, Quick View, Compare) --- */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Favorite / Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
            className={`p-2.5 rounded-full shadow-md transition-all duration-200 ${
              isInWishlist(product.id)
                ? 'bg-rose-500 text-white scale-110'
                : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-rose-500 hover:bg-white'
            }`}
          >
            <WishlistIcon className={`w-4 h-4 ${isInWishlist(product.id) ? 'text-white fill-white' : 'text-gray-400 group-hover:text-rose-500'}`} />
          </button>

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQuickViewOpen(true);
            }}
            title="Quick View"
            className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-500 hover:text-slate-900 hover:bg-white shadow-md transition-all duration-200"
          >
            <FiEye className="w-4 h-4" />
          </button>

          {/* Compare Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompare(product);
            }}
            title={isInCompare(product.id) ? "Remove from Compare" : "Compare Product"}
            className={`p-2.5 rounded-full shadow-md transition-all duration-200 ${
              isInCompare(product.id)
                ? 'bg-slate-900 text-white'
                : 'bg-white/90 backdrop-blur-sm text-gray-500 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <FiRepeat className="w-4 h-4" />
          </button>
        </div>

        {/* --- Image Container with Secondary Image Hover --- */}
        <Link href={`/product/${product.id}`} className="block relative aspect-square w-full bg-slate-50 rounded-2xl overflow-hidden mb-4">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={`object-contain p-4 mix-blend-multiply transition-all duration-500 ${
              isHovered && secondaryImage !== primaryImage ? 'opacity-0 scale-95' : 'opacity-100 group-hover:scale-105'
            }`}
          />
          {secondaryImage !== primaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} secondary`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className={`object-contain p-4 mix-blend-multiply transition-all duration-500 absolute inset-0 ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
              }`}
            />
          )}

          {/* Quick Add to Cart Overlay */}
          <div className="absolute inset-x-3 bottom-3 z-10 translate-y-12 group-hover:translate-y-0 transition-transform duration-300 ease-out hidden sm:block">
            <button
              disabled={stock <= 0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
              }}
              className="w-full bg-slate-900/90 backdrop-blur-md text-white py-2.5 rounded-xl font-bold text-xs shadow-lg hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <FiShoppingCart className="w-4 h-4" /> {stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </Link>

        {/* --- Details Container --- */}
        <div className="flex flex-col flex-1 px-1">
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1">
            <span className="text-orange-500 truncate">{product.category || 'General'}</span>
            {product.brand && <span className="text-slate-400 font-semibold truncate">{product.brand}</span>}
          </div>

          {/* Product Name */}
          <Link href={`/product/${product.id}`} className="group-hover:text-blue-600 transition-colors">
            <h3 className="text-slate-900 font-bold text-sm leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          {/* Rating & Review Count */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'fill-current' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
            <span className="text-xs text-slate-400">({reviewCount})</span>
          </div>

          {/* Stock Status Indicator */}
          <div className="mb-3">
            {stock > 5 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock
              </span>
            ) : stock > 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Low Stock ({stock})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Out of Stock
              </span>
            )}
          </div>

          {/* Price & Action Footer */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-900 font-black text-lg">
                  ${price.toFixed(2)}
                </span>
                {originalPrice && originalPrice > price && (
                  <span className="text-xs text-gray-400 font-bold line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* View Details Link */}
            <Link
              href={`/product/${product.id}`}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              Details
            </Link>
          </div>
        </div>
      </div>

      {/* Quick View Modal Trigger */}
      {isQuickViewOpen && (
        <QuickViewModal
          product={product}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
};

export default React.memo(ProductCard);
