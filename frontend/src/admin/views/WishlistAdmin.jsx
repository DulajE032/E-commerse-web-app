"use client";
import React, { useEffect, useState } from 'react';
import { FiTrendingUp, FiUsers, FiMail, FiHeart, FiPackage, FiAlertTriangle, FiCheckCircle, FiChevronDown, FiChevronUp, FiSearch, FiSend } from 'react-icons/fi';
import { api } from '../../services/api';
import { useAuth } from '../../services/AuthContext';

const WishlistAdmin = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('trending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Trending state
  const [trending, setTrending] = useState([]);

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [userWishlist, setUserWishlist] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Campaign state
  const [campaignProduct, setCampaignProduct] = useState(null);
  const [campaignResult, setCampaignResult] = useState(null);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignToast, setCampaignToast] = useState('');

  // ── Data Fetching ──
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');

    const fetchData = async () => {
      try {
        if (activeTab === 'trending' || activeTab === 'campaigns') {
          const data = await api.getWishlistTrending(token);
          setTrending(data);
        }
        if (activeTab === 'users') {
          const data = await api.getWishlistUsers(token);
          setUsers(data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, activeTab]);

  const handleExpandUser = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      setUserWishlist(null);
      return;
    }
    setExpandedUser(userId);
    setLoadingUser(true);
    try {
      const data = await api.getWishlistByUser(userId, token);
      setUserWishlist(data);
    } catch {
      setUserWishlist(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSendCampaign = async (productId) => {
    setSendingCampaign(true);
    setCampaignResult(null);
    try {
      const result = await api.sendWishlistCampaign(productId, token);
      setCampaignResult(result);
      setCampaignToast(`✅ Discount email sent to ${result.users_notified} user${result.users_notified !== 1 ? 's' : ''}!`);
      setTimeout(() => setCampaignToast(''), 4000);
    } catch (err) {
      setCampaignToast(`❌ Failed: ${err.message}`);
      setTimeout(() => setCampaignToast(''), 4000);
    } finally {
      setSendingCampaign(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.user_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.user_email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const tabs = [
    { id: 'trending', label: 'Trending Products', icon: <FiTrendingUp /> },
    { id: 'users', label: 'Customer Wishlists', icon: <FiUsers /> },
    { id: 'campaigns', label: 'Campaigns', icon: <FiMail /> },
  ];

  const getStockStatus = (stock, wishlistCount) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'text-red-400 bg-red-500/10', icon: <FiAlertTriangle className="w-3.5 h-3.5" /> };
    if (stock < wishlistCount) return { label: 'Low Stock', color: 'text-amber-400 bg-amber-500/10', icon: <FiAlertTriangle className="w-3.5 h-3.5" /> };
    return { label: 'Adequate', color: 'text-green-400 bg-green-500/10', icon: <FiCheckCircle className="w-3.5 h-3.5" /> };
  };

  const maxWishlistCount = Math.max(...trending.map((t) => t.wishlist_count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <FiHeart className="w-5 h-5 text-white" />
            </div>
            Wishlist Analytics
          </h2>
          <p className="text-gray-400 mt-1 text-sm">Track demand, manage inventory, and run targeted campaigns</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-800 p-1.5 rounded-xl border border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Campaign Toast */}
      {campaignToast && (
        <div className="bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 px-4 py-3 rounded-xl text-sm font-semibold animate-pulse">
          {campaignToast}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TAB 1: Trending Products               */}
      {/* ═══════════════════════════════════════ */}
      {!loading && activeTab === 'trending' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Total Wishlisted Products</p>
              <p className="text-3xl font-bold text-white">{trending.length}</p>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Total Wishlist Entries</p>
              <p className="text-3xl font-bold text-pink-400">
                {trending.reduce((s, t) => s + t.wishlist_count, 0)}
              </p>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Low Stock Alerts</p>
              <p className="text-3xl font-bold text-amber-400">
                {trending.filter((t) => t.stock < t.wishlist_count).length}
              </p>
            </div>
          </div>

          {/* Demand Bar Chart */}
          {trending.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Demand Distribution (Top 10)</h3>
              <div className="space-y-3">
                {trending.slice(0, 10).map((item) => {
                  const pct = (item.wishlist_count / maxWishlistCount) * 100;
                  const status = getStockStatus(item.stock, item.wishlist_count);
                  return (
                    <div key={item.product.id} className="flex items-center gap-4">
                      <span className="text-gray-300 text-sm font-medium w-40 truncate shrink-0">
                        {item.product.name}
                      </span>
                      <div className="flex-1 h-7 bg-gray-700 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-lg transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                          {item.wishlist_count} ♥
                        </span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1 shrink-0 ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">All Wishlisted Products</h3>
            </div>
            {trending.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No wishlist data yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-left border-b border-gray-700">
                      <th className="px-6 py-3 font-semibold">#</th>
                      <th className="px-6 py-3 font-semibold">Product</th>
                      <th className="px-6 py-3 font-semibold text-right">Price</th>
                      <th className="px-6 py-3 font-semibold text-center">
                        <span className="flex items-center justify-center gap-1"><FiHeart className="w-3.5 h-3.5 text-pink-400" /> Wishlists</span>
                      </th>
                      <th className="px-6 py-3 font-semibold text-center">Stock</th>
                      <th className="px-6 py-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {trending.map((item, idx) => {
                      const status = getStockStatus(item.stock, item.wishlist_count);
                      return (
                        <tr key={item.product.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 text-gray-500 font-mono">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.product.images && item.product.images.length > 0 ? (
                                <img
                                  src={`http://127.0.0.1:8000${item.product.images[0]}`}
                                  alt=""
                                  className="w-10 h-10 object-contain rounded-lg bg-gray-600/30 p-1"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-600/30 flex items-center justify-center">
                                  <FiPackage className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                              <div>
                                <p className="text-white font-medium truncate max-w-[200px]">{item.product.name}</p>
                                <p className="text-gray-500 text-xs">{item.product.category || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-white font-semibold">${Number(item.product.price).toFixed(2)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 text-pink-400 font-bold">
                              <FiHeart className="w-3.5 h-3.5 fill-current" /> {item.wishlist_count}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-white font-semibold">{item.stock}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                              {status.icon} {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TAB 2: Customer Wishlists              */}
      {/* ═══════════════════════════════════════ */}
      {!loading && activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-12 bg-gray-800 rounded-xl border border-gray-700">
              No users with wishlist items found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.user_id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <button
                    onClick={() => handleExpandUser(user.user_id)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-700/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user.user_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{user.user_name}</p>
                        <p className="text-gray-500 text-sm">{user.user_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1.5 text-pink-400 font-bold text-sm">
                        <FiHeart className="w-4 h-4 fill-current" /> {user.item_count} item{user.item_count !== 1 ? 's' : ''}
                      </span>
                      {expandedUser === user.user_id ? (
                        <FiChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <FiChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded User Wishlist */}
                  {expandedUser === user.user_id && (
                    <div className="px-6 py-4 border-t border-gray-700 bg-gray-750">
                      {loadingUser ? (
                        <div className="text-gray-400 text-sm py-4">Loading wishlist...</div>
                      ) : userWishlist ? (
                        <div className="space-y-3">
                          {userWishlist.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 bg-gray-700/30 rounded-lg p-3">
                              {item.product.images && item.product.images.length > 0 ? (
                                <img
                                  src={`http://127.0.0.1:8000${item.product.images[0]}`}
                                  alt=""
                                  className="w-12 h-12 object-contain rounded-lg bg-gray-600/30 p-1 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-600/30 flex items-center justify-center shrink-0">
                                  <FiPackage className="w-5 h-5 text-gray-500" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">{item.product.name}</p>
                                <p className="text-gray-500 text-xs">{item.product.category || '—'}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-white font-semibold text-sm">${Number(item.product.price).toFixed(2)}</p>
                                <p className="text-gray-500 text-xs">
                                  Added {new Date(item.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">Failed to load wishlist.</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TAB 3: Campaigns                       */}
      {/* ═══════════════════════════════════════ */}
      {!loading && activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Targeted Discount Campaigns</h3>
            <p className="text-gray-400 text-sm mb-6">
              Select a product and send a discount notification to every user who has it in their wishlist. 
              This is the highest-converting marketing because these customers already told you they want the item.
            </p>

            {trending.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No wishlisted products to campaign for.</div>
            ) : (
              <div className="space-y-3">
                {trending.map((item) => (
                  <div
                    key={item.product.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      campaignProduct === item.product.id
                        ? 'bg-indigo-600/10 border-indigo-500/50'
                        : 'bg-gray-700/20 border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setCampaignProduct(item.product.id === campaignProduct ? null : item.product.id)}
                  >
                    <div className="flex items-center gap-4">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={`http://127.0.0.1:8000${item.product.images[0]}`}
                          alt=""
                          className="w-12 h-12 object-contain rounded-lg bg-gray-600/30 p-1 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-600/30 flex items-center justify-center shrink-0">
                          <FiPackage className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold text-sm">{item.product.name}</p>
                        <p className="text-gray-500 text-xs">
                          {item.wishlist_count} user{item.wishlist_count !== 1 ? 's' : ''} waiting · ${Number(item.product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendCampaign(item.product.id);
                      }}
                      disabled={sendingCampaign}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shrink-0"
                    >
                      <FiSend className="w-4 h-4" />
                      {sendingCampaign ? 'Sending...' : 'Send Discount'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campaign Result */}
          {campaignResult && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <h4 className="text-green-400 font-bold text-lg mb-2">Campaign Sent Successfully! 🎉</h4>
              <p className="text-gray-300 text-sm mb-4">
                Discount notification for <span className="font-semibold text-white">{campaignResult.product_name}</span> sent to {campaignResult.users_notified} user{campaignResult.users_notified !== 1 ? 's' : ''}.
              </p>
              {campaignResult.user_emails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {campaignResult.user_emails.map((email) => (
                    <span key={email} className="bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">
                      {email}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WishlistAdmin;
