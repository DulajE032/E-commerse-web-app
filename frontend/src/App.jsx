import React from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import { CartProvider } from './services/CartContext';
import { AuthProvider } from './services/AuthContext';
import { WishlistProvider } from './services/WishlistContext';

// Pages
import LandingPage from './views/LandingPage';
import LoginPage from './views/LoginPage';
import SignupPage from './views/SignupPage';
import AdminLoginPage from './views/AdminLoginPage';
import Dashboard from './views/Dashboard';
import ProductsPage from './views/ProductsPage';
import ProductDetailPage from './views/ProductDetailPage';
import CartPage from './views/CartPage';
import CheckoutPage from './views/CheckoutPage';
import VisualSearchPage from './views/VisualSearchPage';
import WishlistPage from './views/WishlistPage';
import NotFoundPage from './views/NotFoundPage';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Admin Pages
import AdminDashboard from './admin/views/AdminDashboard';
import Products from './admin/views/Products';
import AddProduct from './admin/views/AddProduct';
import UpdateProduct from './admin/views/UpdateProduct';
import Orders from './admin/views/Orders';
import WishlistAdmin from './admin/views/WishlistAdmin';

// Auth Components
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute';

import './App.css';

function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <WishlistProvider>
        <Router>
          <Routes>
            
            {/* Public Routes with Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/visual-search" element={<VisualSearchPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route
                path="/checkout"
                element={(
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                )}
              />
              
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected User Routes within Layout */}
              <Route
                path="/dashboard"
                element={(
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                )}
              />
              
              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Auth */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={(
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              )}
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products" element={<Products />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<UpdateProduct />} />
              <Route path="wishlist" element={<WishlistAdmin />} />
            </Route>
            
          </Routes>
        </Router>
        </WishlistProvider>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
