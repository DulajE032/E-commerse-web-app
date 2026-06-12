"use client";

import { CartProvider } from '../services/CartContext';
import { AuthProvider } from '../services/AuthContext';
import { WishlistProvider } from '../services/WishlistContext';

export default function Providers({ children }) {
  return (
    <CartProvider>
      <AuthProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </AuthProvider>
    </CartProvider>
  );
}
