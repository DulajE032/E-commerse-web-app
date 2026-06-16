// frontend/src/components/ProductCard.jsx

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Using Next.js Image component is highly recommended
import { FiStar, FiPlus } from 'react-icons/fi';
import { useWishlist } from '../services/WishlistContext';
import wishlistIcon from '../assets/wishlist/wishlist.png';

// A helper function to get the API URL, preventing hardcoded links
const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Use the first available image, or a placeholder
  const imageUrl = product.images && product.images.length > 0
    ? `${getApiUrl()}${product.images[0]}`
    : 'https://via.placeholder.com/300';

  return (
    <div className="group bg-white rounded-3xl p-4 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col relative">
      <Link 
        href={`/product/${product.id}`} 
        className="flex flex-col flex-1"
      >
        {/* Image Container */}
        <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden mb-4">
          <Image
            src={imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="contain"
            className="group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
          />
          {/* Add to Cart button that appears on hover */}
          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent navigating when clicking the button
              // Replace with your actual addToCart logic
              alert(`Added ${product.name} to cart!`);
            }}
            className="absolute bottom-3 right-3 w-10 h-10 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white hover:text-orange-500 z-20"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>

        {/* Details Container */}
        <div className="flex flex-col flex-1 px-2">
          {/* Category */}
          <span className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">
            {product.category || 'General'}
          </span>
          
          {/* Product Name */}
          <h3 className="text-gray-900 font-bold leading-tight mb-2 truncate">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex text-orange-400">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-400 font-medium">({product.review_count || 0})</span>
          </div>

          {/* Price (pushes to the bottom) */}
          <div className="mt-auto">
            <span className="text-[#114B43] font-extrabold text-xl">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
        </div>
      </Link>

      {/* Wishlist Button - Placed outside Link to avoid nested Link/A issues */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute top-6 right-6 p-2 rounded-full shadow-md transition-all duration-200 z-30 ${
          isInWishlist(product.id)
            ? 'bg-red-500 text-white scale-110'
            : 'bg-white text-gray-400 hover:text-red-500'
        }`}
      >
        <img 
          src={wishlistIcon.src || wishlistIcon}
          alt="Wishlist Icon"
          className="w-4 h-4 object-contain"
        />
      </button>
    </div>
  );
};

export default ProductCard;
