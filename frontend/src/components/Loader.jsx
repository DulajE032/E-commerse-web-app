"use client";
import React from 'react';

const Loader = ({
  size = 'md',
  className = '',
  label = 'Loading...',
}) => {
  // Map size prop to height/width classes
  let sizeStyle = "h-4 w-24"; // default text placeholder
  
  if (typeof size === 'number') {
    sizeStyle = `h-${Math.ceil(size / 4)} w-${Math.ceil(size / 4)} rounded-full`;
  } else {
    switch (size) {
      case 'xs':
        sizeStyle = "h-3 w-12 rounded";
        break;
      case 'sm':
        sizeStyle = "h-4 w-16 rounded";
        break;
      case 'md':
        sizeStyle = "h-5 w-24 rounded";
        break;
      case 'lg':
        sizeStyle = "h-6 w-32 rounded";
        break;
      case 'xl':
        sizeStyle = "h-12 w-full max-w-md rounded-xl";
        break;
      default:
        sizeStyle = "h-4 w-24 rounded";
    }
  }

  return (
    <div 
      role="status" 
      aria-label={label} 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${sizeStyle} ${className}`.trim()}
    />
  );
};

export default Loader;
