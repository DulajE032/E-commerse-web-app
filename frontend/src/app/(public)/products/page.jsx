"use client";
import React, { Suspense } from 'react';
import ProductsPage from '../../../views/ProductsPage';


export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="loader" style={{ width: 64 }} /></div>}>
      <ProductsPage />
    </Suspense>
  );
}
