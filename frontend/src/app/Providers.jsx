"use client";

import { CartProvider } from '../services/CartContext';
import { AuthProvider } from '../services/AuthContext';
import { WishlistProvider } from '../services/WishlistContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com";

export default function Providers({ children }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <CartProvider>
        <AuthProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </AuthProvider>
      </CartProvider>
    </GoogleOAuthProvider>
  );
}
