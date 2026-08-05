import React from 'react';
import Link from 'next/link';

export default function Logo({ className = "", imageClassName = "", textClassName = "", invert = false }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${invert ? 'bg-white' : 'bg-slate-900'}`}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          className={`w-6 h-6 object-contain ${invert ? '' : 'invert brightness-0'} ${imageClassName}`} 
        />
      </div>
      <span className={`text-2xl font-black-ops tracking-tight hidden sm:block group-hover:text-blue-600 transition-colors ${invert ? 'text-white' : 'text-slate-900'} ${textClassName}`}>
        PERA STORE
      </span>
    </Link>
  );
}
