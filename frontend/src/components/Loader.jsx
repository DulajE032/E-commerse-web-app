"use client";
import React from 'react';

const Loader = ({
  size = 'xl',
  className = '',
  label = 'Loading',
}) => {
  // Map numeric sizes to closest DaisyUI-style classes if passed
  const sizeClass = typeof size === 'number' 
    ? (size <= 16 ? 'loading-xs' : size <= 24 ? 'loading-sm' : size <= 32 ? 'loading-md' : size <= 48 ? 'loading-lg' : 'loading-xl')
    : `loading-${size}`;

  return (
    <span
      role="status"
      aria-label={label}
      className={`loading loading-ring ${sizeClass} ${className}`.trim()}
    />
  );
};

export default Loader;
