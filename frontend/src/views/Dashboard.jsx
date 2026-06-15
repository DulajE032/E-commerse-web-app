"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../services/AuthContext';
import { FiUser, FiPackage, FiHeart, FiSettings, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const navigate = useRouter();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    const WishlistIcon = ({ className }) => (
      <img src="/assets/wishlistimag/wishlist.png" alt="" className={`${className} object-contain`} />
    );

    const tabs = [
      { id: 'profile', name: 'Profile', icon: FiUser },
      { id: 'orders', name: 'Order History', icon: FiPackage },
      { id: 'wishlist', name: 'Wishlist', icon: WishlistIcon },
      { id: 'settings', name: 'Settings', icon: FiSettings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-10 pb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Account</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* Sidebar */}
                    <div className="w-full md:w-64 shrink-0">
                       <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4 text-center">
                          <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                             <FiUser className="w-10 h-10" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{user?.full_name || 'Guest User'}</h3>
                          <p className="text-sm text-gray-500">{user?.email || 'guest@example.com'}</p>
                       </div>

                       <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
                          {tabs.map((tab) => (
                            <button
                               key={tab.id}
                               onClick={() => setActiveTab(tab.id)}
                               className={`flex items-center gap-3 w-full p-4 rounded-xl font-semibold transition-all ${
                                 activeTab === tab.id 
                                 ? 'bg-[#114B43] text-white shadow-md' 
                                 : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                               }`}
                            >
                               <tab.icon className="w-5 h-5" /> {tab.name}
                            </button>
                          ))}
                          
                          <div className="border-t border-gray-100 my-2"></div>
                          
                          <button
                             onClick={handleLogout}
                             className="flex items-center gap-3 w-full p-4 rounded-xl font-semibold text-red-500 hover:bg-red-50 transition-all"
                          >
                             <FiLogOut className="w-5 h-5" /> Log Out
                          </button>
                       </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                       <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 min-h-[500px]">
                          
                          {activeTab === 'profile' && (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                                <div className="space-y-6 max-w-lg">
                                   <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                      <input type="text" defaultValue={user?.full_name} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                   </div>
                                   <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                      <input type="email" defaultValue={user?.email} disabled className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                                   </div>
                                   <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                      <input type="tel" placeholder="+1 (555) 000-0000" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                   </div>
                                   <button className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-sm">
                                      Save Changes
                                   </button>
                                </div>
                             </motion.div>
                          )}

                          {activeTab === 'orders' && (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                                <div className="border border-gray-100 rounded-2xl p-8 text-center text-gray-500">
                                   <FiPackage className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                   <p className="font-semibold text-gray-900 mb-1">No orders yet</p>
                                   <p className="text-sm">When you place an order, it will appear here.</p>
                                </div>
                             </motion.div>
                          )}

                          {activeTab === 'wishlist' && (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>
                                <div className="border border-gray-100 rounded-2xl p-8 text-center text-gray-500">
                                   <WishlistIcon className="w-12 h-12 mx-auto mb-4" />
                                   <p className="font-semibold text-gray-900 mb-1">Your wishlist is empty</p>
                                   <p className="text-sm">Save items you like here to buy them later.</p>
                                </div>
                             </motion.div>
                          )}

                          {activeTab === 'settings' && (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                                <div className="space-y-6 max-w-lg">
                                   <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                      <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                   </div>
                                   <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                                      <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                                   </div>
                                   <button className="bg-[#114B43] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0d3a34] transition-colors shadow-sm">
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
    )
}

export default Dashboard;
