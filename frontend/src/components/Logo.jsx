import React from 'react';
import Link from 'next/link';

export function LogoSvg({ className = "w-6 h-6", invert = false }) {
  const primaryColor = invert ? "#FFFFFF" : "#0F172A";
  const eyeletColor = invert ? "#334155" : "#E2E8F0";

  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Shopping bag golden/yellow gradient */}
        <linearGradient id="logoBagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Bag Handle */}
      <path 
        d="M40.5 33 C40.5 17, 56.5 17, 56.5 33" 
        stroke={primaryColor} 
        strokeWidth="4" 
        strokeLinecap="round" 
        fill="none" 
      />

      {/* Shopping Bag (Left Shape) */}
      <path 
        d="M35 30 L55 30 C58.5 30, 58.5 35, 55 38.5 C51 42.5, 41.5 46.5, 40.5 52 L32.5 68 H31.5 L35 30 Z" 
        fill="url(#logoBagGrad)" 
      />

      {/* Handle Eyelets */}
      <circle cx="41" cy="33" r="2.5" fill={eyeletColor} stroke={primaryColor} strokeWidth="1.5" />
      <circle cx="56" cy="33" r="2.5" fill={eyeletColor} stroke={primaryColor} strokeWidth="1.5" />

      {/* Letter 'P' (Right Shape) */}
      <path 
        d="M43 68 H51.5 V52 C51.5 46, 55.5 42, 60 40 C65.5 37.5, 71.5 33, 71.5 27 C71.5 19.5, 65.5 15, 59 15 H48 C45 15, 43 17, 43 20 V68 Z M51.5 23 H58.5 C62 23, 64 25, 64 27.5 C64 30, 62 32, 58.5 32 H51.5 V23 Z" 
        fill={primaryColor} 
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Logo({ 
  className = "", 
  containerClassName = "w-15 h-15", 
  imageClassName = "w-15 h-15", 
  textClassName = "", 
  invert = false 
}) {
  // Check if custom sizes are passed in containerClassName
  const hasContainerWidth = /\bw-\d+\b|\bw-\[\w+\]\b/.test(containerClassName);
  const hasContainerHeight = /\bh-\d+\b|\bh-\[\w+\]\b/.test(containerClassName);
  
  // Check if custom sizes are passed in imageClassName
  const hasImageWidth = /\bw-\d+\b|\bw-\[\w+\]\b/.test(imageClassName);
  const hasImageHeight = /\bh-\d+\b|\bh-\[\w+\]\b/.test(imageClassName);

  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div className={`rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${invert ? 'bg-slate-900' : 'bg-white'} ${hasContainerWidth ? '' : 'w-10'} ${hasContainerHeight ? '' : 'h-10'} ${containerClassName}`}>
        <LogoSvg className={`${hasImageWidth ? '' : 'w-7'} ${hasImageHeight ? '' : 'h-7'} ${imageClassName}`} invert={invert} />
      </div>
      <span className={`text-2xl font-extrabold tracking-tight hidden sm:block group-hover:text-blue-600 transition-colors ${invert ? 'text-white' : 'text-slate-900'} ${textClassName}`}>
        PERA STORE
      </span>
    </Link>
  );
}

