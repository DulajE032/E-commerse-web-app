"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../services/AuthContext';
import { FiUser, FiPackage, FiSettings, FiLogOut, FiCheck, FiClock, FiTruck, FiXCircle, FiUpload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../services/WishlistContext';
import ProductCard from '../components/ProductCard';
import { api, getImageUrl } from '../services/api';
import WishlistIconSvg from '../components/WishlistIcon';

const Dashboard = () => {
  const navigate = useRouter();
  const { user, token, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // default to orders as user requested
  const { wishlistItems, fetchWishlistItems } = useWishlist();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [uploadingSlipOrderId, setUploadingSlipOrderId] = useState(null);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'wishlist') {
      fetchWishlistItems();
    }
  }, [isAuthenticated, activeTab, fetchWishlistItems]);

  useEffect(() => {
    if (isAuthenticated && token && activeTab === 'orders') {
      setOrdersLoading(true);
      api
        .getMyOrders(token)
        .then((res) => setOrders(res || []))
        .catch(console.error)
        .finally(() => setOrdersLoading(false));
    }
  }, [isAuthenticated, token, activeTab]);

  const handleLogout = () => {
    logout();
    navigate.push('/');
  };

  const handleSlipUpload = async (orderId, file) => {
    if (!file) return;
    try {
      setUploadingSlipOrderId(orderId);
      await api.uploadBankSlip(orderId, file, token);
      // Refresh orders
      const updated = await api.getMyOrders(token);
      setOrders(updated || []);
      alert('Payment slip uploaded successfully!');
    } catch (err) {
      alert(err.message || 'Failed to upload slip');
    } finally {
      setUploadingSlipOrderId(null);
    }
  };

  const WishlistIcon = ({ className }) => (
    <WishlistIconSvg className={className} />
  );

  const tabs = [
    { id: 'orders', name: 'Order History', icon: FiPackage },
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'wishlist', name: 'Wishlist', icon: WishlistIcon },
    { id: 'settings', name: 'Settings', icon: FiSettings },
  ];

  const filteredOrders = orders.filter((order) => {
    if (orderStatusFilter === 'ALL') return true;
    return order.status?.toLowerCase() === orderStatusFilter.toLowerCase();
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'slip_uploaded':
      case 'pending_verification':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled':
      case 'payment_rejected':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4 text-center">
              <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <FiUser className="w-8 h-8" />}
              </div>
              <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{user?.full_name || 'Valued Customer'}</h3>
              <p className="text-sm text-slate-500">{user?.email || ''}</p>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full p-4 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-orange-500'
                  }`}
                >
                  <tab.icon className="w-5 h-5" /> {tab.name}
                </button>
              ))}

              <div className="border-t border-gray-100 my-2"></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-4 rounded-xl font-semibold text-rose-500 hover:bg-rose-50 transition-all"
              >
                <FiLogOut className="w-5 h-5" /> Log Out
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 min-h-[500px]">
              
              {/* Order History Tab */}
              {activeTab === 'orders' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Order History</h2>
                      <p className="text-slate-500 text-sm">View and track all your store purchases</p>
                    </div>

                    {/* Status Filter Pills */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                      {['ALL', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setOrderStatusFilter(status)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                            orderStatusFilter === status
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-100'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {ordersLoading ? (
                    <div className="py-20 flex justify-center">
                      <div className="loader" style={{ width: 48 }} />
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-3xl p-12 text-center text-slate-500 bg-slate-50">
                      <FiPackage className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                      <p className="font-bold text-slate-900 text-lg mb-1">No orders found</p>
                      <p className="text-sm mb-6">
                        {orderStatusFilter === 'ALL'
                          ? "You haven't placed any orders yet."
                          : `No orders match the filter '${orderStatusFilter}'.`}
                      </p>
                      <button
                        onClick={() => navigate.push('/products')}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredOrders.map((order) => {
                        const isExpanded = expandedOrderId === order.id;
                        const items = order.items || [];

                        return (
                          <div
                            key={order.id}
                            className="border border-gray-200 rounded-3xl p-6 bg-white hover:border-slate-300 transition-all shadow-sm"
                          >
                            {/* Order Summary Header */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                              <div>
                                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                                  Order #{order.id}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                                <span className="text-lg font-black text-slate-900">
                                  ${order.total_amount ? Number(order.total_amount).toFixed(2) : '0.00'}
                                </span>
                              </div>
                            </div>

                            {/* Status Timeline Bar */}
                            <div className="py-4 border-b border-gray-100">
                              <div className="flex items-center justify-between max-w-xl mx-auto px-4 text-xs font-bold text-slate-500">
                                <div className={`flex flex-col items-center gap-1 ${['pending', 'confirmed', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'text-slate-900' : ''}`}>
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${['pending', 'confirmed', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'bg-slate-900 text-white' : 'bg-gray-100'}`}>
                                    <FiClock className="w-3.5 h-3.5" />
                                  </div>
                                  <span>Placed</span>
                                </div>
                                <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
                                <div className={`flex flex-col items-center gap-1 ${['confirmed', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'text-slate-900' : ''}`}>
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${['confirmed', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'bg-slate-900 text-white' : 'bg-gray-100'}`}>
                                    <FiCheck className="w-3.5 h-3.5" />
                                  </div>
                                  <span>Confirmed</span>
                                </div>
                                <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
                                <div className={`flex flex-col items-center gap-1 ${['shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'text-slate-900' : ''}`}>
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${['shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'bg-slate-900 text-white' : 'bg-gray-100'}`}>
                                    <FiTruck className="w-3.5 h-3.5" />
                                  </div>
                                  <span>Shipped</span>
                                </div>
                                <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
                                <div className={`flex flex-col items-center gap-1 ${order.status?.toLowerCase() === 'delivered' ? 'text-slate-900' : ''}`}>
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>
                                    <FiCheck className="w-3.5 h-3.5" />
                                  </div>
                                  <span>Delivered</span>
                                </div>
                              </div>
                            </div>

                            {/* Items Thumbnails Row */}
                            <div className="pt-4 flex items-center justify-between">
                              <div className="flex items-center gap-3 overflow-x-auto">
                                {items.map((item, idx) => (
                                  <div key={idx} className="relative w-14 h-14 bg-slate-50 rounded-xl border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                    <Image
                                      src={getImageUrl(item.image)}
                                      alt={item.name}
                                      fill
                                      className="object-contain p-1 mix-blend-multiply"
                                    />
                                  </div>
                                ))}
                                <span className="text-xs font-bold text-slate-600">
                                  {items.length} {items.length === 1 ? 'item' : 'items'}
                                </span>
                              </div>

                              <button
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 underline"
                              >
                                {isExpanded ? 'Hide Details' : 'View Details'}
                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                              </button>
                            </div>

                            {/* Expanded Order Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-gray-100 space-y-4 text-xs"
                                >
                                  {/* Itemized List */}
                                  <div className="space-y-2">
                                    <h4 className="font-extrabold text-slate-900 uppercase tracking-wider">Ordered Items</h4>
                                    {items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                        <div className="flex items-center gap-3">
                                          <div className="relative w-10 h-10 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0">
                                            <Image src={getImageUrl(item.image)} alt={item.name} fill className="object-contain p-1" />
                                          </div>
                                          <div>
                                            <p className="font-bold text-slate-900">{item.name}</p>
                                            <p className="text-slate-500">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                                          </div>
                                        </div>
                                        <span className="font-extrabold text-slate-900">${(item.quantity * item.price).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Shipping & Payment Info */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                                    <div>
                                      <h4 className="font-extrabold text-slate-900 uppercase tracking-wider mb-1">Shipping Details</h4>
                                      <p className="text-slate-600 font-medium">
                                        {order.shipping_address?.first_name} {order.shipping_address?.last_name}<br />
                                        {order.shipping_address?.street}, {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip_code}
                                      </p>
                                      <p className="text-slate-500 mt-1">Phone: {order.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-extrabold text-slate-900 uppercase tracking-wider mb-1">Payment Method</h4>
                                      <p className="text-slate-600 font-bold uppercase">{order.payment_method}</p>
                                      <p className="text-slate-500">Payment status: <span className="font-bold text-slate-800">{order.payment_status}</span></p>
                                      
                                      {/* Bank slip upload trigger */}
                                      {order.payment_method === 'bank_transfer' && order.status !== 'confirmed' && (
                                        <div className="mt-3">
                                          <label className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors">
                                            <FiUpload className="w-4 h-4" />
                                            {uploadingSlipOrderId === order.id ? 'Uploading...' : 'Upload Payment Slip'}
                                            <input
                                              type="file"
                                              accept="image/*,.pdf"
                                              className="hidden"
                                              onChange={(e) => handleSlipUpload(order.id, e.target.files[0])}
                                            />
                                          </label>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Information</h2>
                  <div className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                      <input type="text" defaultValue={user?.full_name} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                      <input type="email" defaultValue={user?.email} disabled className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                      <input type="tel" placeholder="+1 (555) 000-0000" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 focus:outline-none" />
                    </div>
                    <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm">
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">My Wishlist</h2>
                  {wishlistItems && wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {wishlistItems.map((item) => (
                        <ProductCard key={item.id} product={item.product} />
                      ))}
                    </div>
                  ) : (
                    <div className="border border-gray-100 rounded-2xl p-12 text-center text-slate-500 bg-slate-50">
                      <WishlistIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="font-bold text-slate-900 text-lg mb-2">Your wishlist is empty</p>
                      <p className="text-sm mb-6">Save items you like here to buy them later.</p>
                      <button onClick={() => navigate.push('/products')} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800">
                        Start Shopping
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Account Settings</h2>
                  <div className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                      <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 focus:outline-none" />
                    </div>
                    <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm">
                      Update Password
                    </button>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
