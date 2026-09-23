"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../services/AuthContext';
import {
  FiUser,
  FiPackage,
  FiSettings,
  FiLogOut,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiXCircle,
  FiUpload,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiStar,
  FiMessageSquare,
  FiAlertCircle,
  FiX,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../services/WishlistContext';
import ProductCard from '../components/ProductCard';
import { api, getImageUrl } from '../services/api';
import WishlistIconSvg from '../components/WishlistIcon';

// Helper hook for live 2-hour countdown
const useCancelCountdown = (createdAt) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!createdAt) return;
    const calculate = () => {
      const createdTime = new Date(createdAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - createdTime) / 1000);
      const remaining = 7200 - elapsed; // 2 hours = 7200 seconds

      if (remaining <= 0) {
        setTimeLeft(null);
      } else {
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        setTimeLeft({ hours, minutes, seconds, total: remaining });
      }
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [createdAt]);

  return timeLeft;
};

// Component for order card with countdown and cancellation
const OrderCardItem = ({
  order,
  isExpanded,
  onToggleExpand,
  onCancelRequest,
  onOpenFeedback,
  feedback,
  onUploadSlip,
  uploadingSlip,
}) => {
  const countdown = useCancelCountdown(order.created_at);
  const [copiedRef, setCopiedRef] = useState(false);

  const isBankTransfer = order.payment_method?.toLowerCase() === 'bank_transfer';
  const isDelivered = order.status?.toLowerCase() === 'delivered';
  const isCancelled = order.status?.toLowerCase() === 'cancelled';
  const isShipped = order.status?.toLowerCase() === 'shipped';

  const canCancel = !isCancelled && !isDelivered && !isShipped && countdown !== null;

  const copyRef = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'slip_uploaded':
      case 'pending_verification':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'cancelled':
      case 'payment_rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const items = order.items || [];

  return (
    <div className="border border-slate-200 rounded-3xl p-6 bg-white hover:border-slate-300 transition-all shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Order #{order.id}
            </span>
            {isBankTransfer && order.bank_reference && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-mono px-2 py-0.5 rounded-lg">
                Ref: {order.bank_reference}
                <button
                  type="button"
                  onClick={() => copyRef(order.bank_reference)}
                  title="Copy Reference"
                  className="hover:text-amber-950"
                >
                  {copiedRef ? <FiCheck className="w-3 h-3 text-emerald-600" /> : <FiCopy className="w-3 h-3" />}
                </button>
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">
            {order.created_at
              ? new Date(order.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
            {order.status}
          </span>
          <span className="text-lg font-black text-slate-900">
            ${order.total_amount ? Number(order.total_amount).toFixed(2) : '0.00'}
          </span>
        </div>
      </div>

      {/* 2-Hour Cancellation Banner or Feedback CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
        {/* Left info badge */}
        <div className="flex items-center gap-2 text-xs">
          {canCancel ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700 bg-amber-100/70 border border-amber-200 px-2.5 py-1 rounded-full">
              <FiClock className="w-3.5 h-3.5" />
              Can cancel within: {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
            </span>
          ) : !isCancelled && !isDelivered && !isShipped ? (
            <span className="text-slate-400 font-medium">
              Cancellation window expired (2h passed)
            </span>
          ) : isCancelled ? (
            <span className="text-rose-600 font-medium flex items-center gap-1">
              <FiXCircle className="w-3.5 h-3.5" /> This order has been cancelled
            </span>
          ) : isDelivered ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <FiCheck className="w-3.5 h-3.5" /> Order successfully delivered
            </span>
          ) : null}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cancel button */}
          {canCancel && (
            <button
              type="button"
              onClick={() => onCancelRequest(order.id)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors shadow-sm"
            >
              Cancel Order
            </button>
          )}

          {/* Feedback button */}
          {isDelivered && !feedback && (
            <button
              type="button"
              onClick={() => onOpenFeedback(order)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <FiStar className="w-3.5 h-3.5 text-amber-300" />
              Leave Feedback
            </button>
          )}

          {isDelivered && feedback && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <FiCheck className="w-3 h-3" /> Feedback Submitted
            </span>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="py-2 border-b border-slate-100">
        <div className="flex items-center justify-between max-w-xl mx-auto px-2 text-xs font-bold text-slate-500">
          <div className={`flex flex-col items-center gap-1 ${['pending', 'confirmed', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'text-slate-900' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${['pending', 'confirmed', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>
              <FiClock className="w-3.5 h-3.5" />
            </div>
            <span>Placed</span>
          </div>
          <div className="flex-1 h-1 bg-slate-200 mx-2"></div>
          <div className={`flex flex-col items-center gap-1 ${['confirmed', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'text-slate-900' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${['confirmed', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>
              <FiCheck className="w-3.5 h-3.5" />
            </div>
            <span>Confirmed</span>
          </div>
          <div className="flex-1 h-1 bg-slate-200 mx-2"></div>
          <div className={`flex flex-col items-center gap-1 ${['shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'text-slate-900' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${['shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>
              <FiTruck className="w-3.5 h-3.5" />
            </div>
            <span>Shipped</span>
          </div>
          <div className="flex-1 h-1 bg-slate-200 mx-2"></div>
          <div className={`flex flex-col items-center gap-1 ${order.status?.toLowerCase() === 'delivered' ? 'text-slate-900' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>
              <FiCheck className="w-3.5 h-3.5" />
            </div>
            <span>Delivered</span>
          </div>
        </div>
      </div>

      {/* Items Preview Row & Details Toggle */}
      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-x-auto">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="relative w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1"
            >
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
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 underline"
        >
          {isExpanded ? 'Hide Details' : 'View Details'}
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      {/* Expanded Details Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-slate-100 space-y-4 text-xs"
          >
            {/* Items Breakdown */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider">Ordered Items</h4>
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0">
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

            {/* Shipping & Payment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
              <div>
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider mb-1">Shipping Address</h4>
                <p className="text-slate-600 font-medium">
                  {order.shipping_address?.first_name} {order.shipping_address?.last_name}<br />
                  {order.shipping_address?.street}, {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip_code}
                </p>
                <p className="text-slate-500 mt-1">Phone: {order.phone || 'N/A'}</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider mb-1">Payment Information</h4>
                <p className="text-slate-700 font-bold uppercase">{order.payment_method}</p>
                <p className="text-slate-500">
                  Status: <span className="font-bold text-slate-800">{order.payment_status}</span>
                </p>

                {isBankTransfer && order.bank_reference && (
                  <div className="mt-2 bg-white p-2.5 rounded-xl border border-amber-200">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Bank Reference</span>
                    <div className="flex items-center justify-between font-mono font-bold text-amber-900 text-sm">
                      <span>{order.bank_reference}</span>
                      <button
                        type="button"
                        onClick={() => copyRef(order.bank_reference)}
                        className="text-xs text-amber-700 hover:text-amber-900"
                      >
                        {copiedRef ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Bank slip upload */}
                {isBankTransfer && order.status !== 'confirmed' && order.status !== 'cancelled' && (
                  <div className="mt-3">
                    <label className="inline-flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors shadow-sm">
                      <FiUpload className="w-4 h-4" />
                      {uploadingSlip ? 'Uploading...' : order.bank_slip_url ? 'Re-upload Payment Slip' : 'Upload Payment Slip'}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => onUploadSlip(order.id, e.target.files[0])}
                      />
                    </label>
                    {order.bank_slip_url && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1">✓ Slip uploaded and under review</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Existing Feedback & Admin Response Section */}
            {feedback && (
              <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-indigo-950 uppercase tracking-wider text-[11px]">Your Feedback</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-3.5 h-3.5 ${i < feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-700 italic">"{feedback.comment}"</p>

                {/* Admin Responses */}
                {feedback.responses && feedback.responses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-indigo-200/60 space-y-2">
                    {feedback.responses.map((resp) => (
                      <div key={resp.id} className="bg-white/80 p-3 rounded-xl border border-indigo-200/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                            <FiMessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                            Store Response ({resp.admin_name || 'Admin'}):
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(resp.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs">{resp.response}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useRouter();
  const { user, token, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const { wishlistItems, fetchWishlistItems } = useWishlist();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [uploadingSlipOrderId, setUploadingSlipOrderId] = useState(null);

  // User Feedbacks map: { [order_id]: feedback }
  const [myFeedbacks, setMyFeedbacks] = useState({});

  // Cancellation Modal State
  const [cancelModalOrderId, setCancelModalOrderId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Feedback Modal State
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  // Toast / Alert message
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadFeedbacks = async () => {
    if (!token) return;
    try {
      const fbList = await api.getMyFeedbacks(token);
      const fbMap = {};
      if (Array.isArray(fbList)) {
        fbList.forEach((fb) => {
          fbMap[fb.order_id] = fb;
        });
      }
      setMyFeedbacks(fbMap);
    } catch (e) {
      console.error(e);
    }
  };

  const loadOrders = async () => {
    if (!token) return;
    setOrdersLoading(true);
    try {
      const res = await api.getMyOrders(token);
      setOrders(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'wishlist') {
      fetchWishlistItems();
    }
  }, [isAuthenticated, activeTab, fetchWishlistItems]);

  useEffect(() => {
    if (isAuthenticated && token && activeTab === 'orders') {
      loadOrders();
      loadFeedbacks();
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
      await loadOrders();
      showToast('Payment slip uploaded successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to upload slip', 'error');
    } finally {
      setUploadingSlipOrderId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrderId) return;
    setIsCancelling(true);
    try {
      await api.cancelOrder(cancelModalOrderId, token);
      await loadOrders();
      showToast(`Order #${cancelModalOrderId} has been cancelled.`);
      setCancelModalOrderId(null);
    } catch (err) {
      showToast(err.message || 'Could not cancel order.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackOrder) return;
    setIsSubmittingFeedback(true);
    setFeedbackError('');
    try {
      await api.submitOrderFeedback(feedbackOrder.id, { rating, comment }, token);
      await loadFeedbacks();
      showToast('Thank you! Your feedback has been submitted.');
      setFeedbackOrder(null);
      setComment('');
      setRating(5);
    } catch (err) {
      setFeedbackError(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const WishlistIcon = ({ className }) => <WishlistIconSvg className={className} />;

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

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-2 ${
              toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <FiAlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <FiCheckCircle className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toastMessage.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome back, <span className="font-semibold text-slate-800">{user?.full_name || 'Customer'}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors text-sm font-semibold border border-slate-200"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="md:col-span-3">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Orders Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Your Orders</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Orders can be cancelled within 2 hours of placement.</p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                    {['ALL', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setOrderStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                          orderStatusFilter === status
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                {ordersLoading ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-500 bg-white shadow-sm">
                    <FiPackage className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="font-bold text-slate-900 text-lg mb-1">No orders found</p>
                    <p className="text-sm mb-6">
                      {orderStatusFilter === 'ALL'
                        ? "You haven't placed any orders yet."
                        : `No orders match filter '${orderStatusFilter}'.`}
                    </p>
                    <button
                      onClick={() => navigate.push('/products')}
                      className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <OrderCardItem
                        key={order.id}
                        order={order}
                        isExpanded={expandedOrderId === order.id}
                        onToggleExpand={() =>
                          setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                        }
                        onCancelRequest={(orderId) => setCancelModalOrderId(orderId)}
                        onOpenFeedback={(ord) => setFeedbackOrder(ord)}
                        feedback={myFeedbacks[order.id]}
                        onUploadSlip={handleSlipUpload}
                        uploadingSlip={uploadingSlipOrderId === order.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-xl">
                <h2 className="text-xl font-black text-slate-900">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.full_name}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      disabled
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Role</label>
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase">
                      {user?.role || 'Customer'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-900">My Wishlist</h2>
                {wishlistItems && wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      <ProductCard key={item.id} product={item.product} />
                    ))}
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-3xl p-12 text-center text-slate-500 bg-white shadow-sm">
                    <WishlistIcon className="w-16 h-16 mx-auto mb-4 opacity-40 text-slate-400" />
                    <p className="font-bold text-slate-900 text-lg mb-2">Your wishlist is empty</p>
                    <p className="text-sm mb-6">Save items you love to view and purchase later.</p>
                    <button
                      onClick={() => navigate.push('/products')}
                      className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-xl">
                <h2 className="text-xl font-black text-slate-900">Account Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm">
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CANCELLATION CONFIRMATION MODAL */}
      <AnimatePresence>
        {cancelModalOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                  <FiAlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Cancel Order #{cancelModalOrderId}?</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                Are you sure you want to cancel this order? All items will be returned to inventory stock immediately.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOrderId(null)}
                  disabled={isCancelling}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEAVE FEEDBACK MODAL */}
      <AnimatePresence>
        {feedbackOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Share Your Experience</h3>
                  <p className="text-xs text-slate-500">Order #{feedbackOrder.id} Delivered</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackOrder(null)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {feedbackError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {feedbackError}
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Overall Satisfaction Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1.5 focus:outline-none transition-transform hover:scale-110"
                      >
                        <FiStar
                          className={`w-7 h-7 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Your Feedback & Review
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    required
                    minLength={3}
                    placeholder="How was the product quality, packaging, and delivery speed?"
                    className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackOrder(null)}
                    disabled={isSubmittingFeedback}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback || !comment.trim()}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-md"
                  >
                    {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
