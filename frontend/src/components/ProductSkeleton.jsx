// ProductSkeleton.jsx
import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Breadcrumb Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>

        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-10 flex flex-col lg:flex-row gap-12 mb-12">
          
          {/* Left Side: Image Gallery Skeleton */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            {/* Main Big Image Box */}
            <div className="w-full aspect-square bg-gray-200 rounded-3xl animate-pulse"></div>
            {/* Small Thumbnail Boxes */}
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="w-24 h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="w-24 h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>

          {/* Right Side: Product Info Skeleton */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center gap-4">
            {/* Category Tag */}
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            {/* Huge Title */}
            <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            {/* Stars / Reviews */}
            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
            {/* Price */}
            <div className="h-10 bg-gray-200 rounded w-32 mt-4 mb-8 animate-pulse"></div>
            
            {/* Add to Cart Buttons */}
            <div className="flex gap-4 mt-auto">
               <div className="h-14 bg-gray-200 rounded-xl flex-1 animate-pulse"></div>
               <div className="h-14 bg-gray-200 rounded-xl flex-1 animate-pulse"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;