import React from "react";

const ProductCardSkeleton = () => {
  return (
    // 'animate-pulse' gives it the correct breathing/fading effect!
    <div className="bg-white rounded-[1.5rem] p-4 border border-gray-100 flex flex-col h-full animate-pulse">
      {/* 1. The Image Placeholder (Big gray box) */}
      <div className="w-full aspect-[4/5] rounded-xl bg-gray-200 mb-4"></div>

      {/* 2. The Text Area */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Category Label Placeholder */}
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>

        {/* Product Title Placeholder (Two lines) */}
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>

        {/* Price & Rating Placeholder */}
        <div className="mt-auto flex items-end justify-between pt-4">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-10"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
