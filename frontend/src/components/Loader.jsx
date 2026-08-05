"use client";
import React from 'react';

const Loader = ({ size = 100, className = '' }) => {
  const sizeVal = typeof size === 'number' ? size : 100;

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`loader ${className}`}
      style={{ width: sizeVal, aspectRatio: 1 }}
    />
  );
};

export default Loader;
