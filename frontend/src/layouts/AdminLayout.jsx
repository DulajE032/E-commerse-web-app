"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiHome, FiBox, FiPlusCircle, FiLogOut, FiShoppingBag, FiHeart } from 'react-icons/fi';
import { useAuth } from '../services/AuthContext';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiHome /> Dashboard
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiShoppingBag /> Orders
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiBox /> Products
          </Link>
          <Link href="/admin/add-product" className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiPlusCircle /> Add Product
          </Link>
          <Link href="/admin/wishlist" className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
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
          <div className="text-xl font-semibold">Dashboard</div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-900">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
