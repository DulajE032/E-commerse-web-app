import { Outlet, Link } from 'react-router-dom';
import { FiHome, FiBox, FiPlusCircle, FiLogOut } from 'react-icons/fi';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiHome /> Dashboard
          </Link>
          <Link to="/admin/products" className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiBox /> Products
          </Link>
          <Link to="/admin/add-product" className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition">
            <FiPlusCircle /> Add Product
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center gap-3 w-full p-3 rounded hover:bg-red-600 transition text-red-400 hover:text-white">
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
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">A</div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-900">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
