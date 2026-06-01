import React from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import { CartProvider } from './services/CartContext';
import { AuthProvider } from './services/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLoginPage from './pages/AdminLoginPage';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import VisualSearchPage from './pages/VisualSearchPage';
import NotFoundPage from './pages/NotFoundPage';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Admin Pages
import AdminDashboard from './admin/pages/AdminDashboard';
import Products from './admin/pages/Products';
import AddProduct from './admin/pages/AddProduct';
import UpdateProduct from './admin/pages/UpdateProduct';

// Auth Components
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute';

import './App.css';

function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <Router>
          <Routes>
            
            {/* Public Routes with Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/visual-search" element={<VisualSearchPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              
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
              <Route path="products" element={<Products />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<UpdateProduct />} />
            </Route>
            
          </Routes>
        </Router>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
