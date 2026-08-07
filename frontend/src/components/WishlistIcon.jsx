import React from 'react';

export default function WishlistIcon({ className = "w-6 h-6", color = "currentColor", fill = "none" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer 3D Card / Book Front */}
      <path 
        d="M32 28 L66 14 L75 22 V70 L32 90 Z" 
        stroke={color} 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill={fill}
      />

      {/* Folded Top Corner */}
      <path 
        d="M66 14 V22 H75" 
        stroke={color} 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Left Depth / Spine */}
      <path 
        d="M24 23 L32 28 V90 L24 85 V23 Z" 
        stroke={color} 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Dashed line on left spine */}
      <line 
        x1="24" y1="46" x2="24" y2="58"
        stroke={color} 
        strokeWidth="3.5" 
        strokeDasharray="3 3" 
        strokeLinecap="round"
      />

      {/* Top Accent Line */}
      <path 
        d="M39 34 L61 24" 
        stroke={color} 
        strokeWidth="3.5" 
        strokeLinecap="round"
      />

      {/* Heart Symbol in Center */}
      <path 
        d="M53 43 C47 37, 39 41, 41 49 C43 56, 52 62, 54 66 C56 62, 66 56, 67 48 C68 41, 60 37, 53 43 Z" 
        stroke={color} 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Bottom Accent Line */}
      <path 
        d="M39 80 L68 67" 
        stroke={color} 
        strokeWidth="3.5" 
        strokeLinecap="round"
      />
    </svg>
  );
}
