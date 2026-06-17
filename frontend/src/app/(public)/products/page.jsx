"use client";
import React, { Suspense } from 'react';
import ProductsPage from '../../../views/ProductsPage';
import Loader from '../../../components/Loader';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader size={64} /></div>}>
      <ProductsPage />
    </Suspense>
  );
}
