import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import Products from './admin/pages/Products';
import AddProduct from './admin/pages/AddProduct';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="add-product" element={<AddProduct />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
