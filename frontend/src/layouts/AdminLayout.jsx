"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiHome, FiBox, FiPlusCircle, FiLogOut, FiShoppingBag, FiHeart, FiGrid, FiUsers, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../services/AuthContext';
import Logo from '../components/Logo';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-gray-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 text-2xl font-bold border-b border-gray-700 flex items-center justify-between">
          <Logo invert={true} textClassName="!text-lg" />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1 focus:outline-none"
            aria-label="Close menu"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiHome /> Dashboard
          </Link>
          <Link href="/admin/orders" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiShoppingBag /> Orders
          </Link>
          <Link href="/admin/products" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiBox /> Products
          </Link>
          <Link href="/admin/add-product" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiPlusCircle /> Add Product
          </Link>
          <Link href="/admin/categories" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiGrid /> Categories
          </Link>
          <Link href="/admin/users" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiUsers /> Users
          </Link>
          <Link href="/admin/wishlist" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiHeart /> Wishlists
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded hover:bg-red-600 transition text-red-400 hover:text-white"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-gray-400 hover:text-white p-1 focus:outline-none"
              aria-label="Open menu"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="text-xl font-semibold">Admin Dashboard</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-900">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
