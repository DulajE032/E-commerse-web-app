"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { api, getImageUrl } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import {
  FiCheck,
  FiX,
  FiExternalLink,
  FiAlertCircle,
  FiFileText,
  FiEye,
  FiClock,
  FiShield,
} from 'react-icons/fi';

const statusStyles = {
  pending: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  shipped: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  delivered: 'bg-green-500/10 text-green-300 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-300 border-red-500/20',
  paid: 'bg-green-500/10 text-green-300 border-green-500/20',
  failed: 'bg-red-500/10 text-red-300 border-red-500/20',
  refunded: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  slip_uploaded: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  payment_rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  pending_verification: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment Verification Modal State
  const [reviewOrder, setReviewOrder] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await api.getOrders(token);
        if (isMounted) {
          setOrders(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load orders.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (token) {
      loadOrders();
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter = filter === 'all' || order.status === filter;
      if (!searchValue) return matchesFilter;
      const matchesSearch =
        `${order.id}`.includes(searchValue) ||
        (order.email || '').toLowerCase().includes(searchValue) ||
        (order.bank_reference || '').toLowerCase().includes(searchValue);
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, search]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const updatedOrder = await api.updateOrderStatus(orderId, status, token);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, ...updatedOrder } : order))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status.');
    }
  };

  const openReviewModal = (order) => {
    setReviewOrder(order);
    setAdminNotes(order.payment?.admin_notes || '');
    setModalError('');
  };

  const closeReviewModal = () => {
    setReviewOrder(null);
    setAdminNotes('');
    setModalError('');
  };

  const handleVerifySubmit = async (isApproved) => {
    if (!reviewOrder) return;

    if (!isApproved && !adminNotes.trim()) {
      setModalError('Please specify the reason for rejecting the payment slip (e.g. amount mismatch, illegible image).');
      return;
    }

    setActionLoading(true);
    setModalError('');

    try {
      const updatedOrder = await api.verifyPayment(
        reviewOrder.id,
        isApproved,
        adminNotes.trim() || undefined,
        token
      );
      setOrders((prev) =>
        prev.map((order) => (order.id === reviewOrder.id ? { ...order, ...updatedOrder } : order))
      );
      closeReviewModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to process payment verification.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!token) {
    return <div className="text-gray-300">Please log in as an admin to view orders.</div>;
  }

  if (loading) {
    return <div className="text-gray-300">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders Management</h2>
          <p className="text-xs text-gray-400 mt-1">Review orders, verify bank transfer slips, and track fulfillment.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by order ID, email, or ref..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 w-full md:w-72 text-sm focus:outline-none focus:border-indigo-500"
          />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="slip_uploaded">Slip Uploaded (Needs Review)</option>
            <option value="confirmed">Confirmed</option>
            <option value="payment_rejected">Payment Rejected</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="text-left px-6 py-4 font-medium">Order</th>
                <th className="text-left px-6 py-4 font-medium">Method & Ref</th>
                <th className="text-left px-6 py-4 font-medium">Customer</th>
                <th className="text-left px-6 py-4 font-medium">Expected Total</th>
                <th className="text-left px-6 py-4 font-medium">Order Status</th>
                <th className="text-left px-6 py-4 font-medium">Payment Status</th>
                <th className="text-left px-6 py-4 font-medium">Verification</th>
                <th className="text-left px-6 py-4 font-medium">Date</th>
                <th className="text-left px-6 py-4 font-medium">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const isBank = order.payment_method?.toLowerCase() === 'bank_transfer';
                const needsReview =
                  isBank &&
                  (order.status === 'slip_uploaded' || order.status === 'pending_verification');
                const isRejected = order.status === 'payment_rejected';
                const isVerified = order.payment?.status === 'VERIFIED' || order.payment_status === 'paid';

                return (
                  <tr key={order.id} className="border-t border-gray-700/60 hover:bg-gray-750/40 text-gray-200 transition-colors">
                    <td className="px-6 py-4 font-semibold">
                      <span className="text-white">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-gray-300">
                          {order.payment_method}
                        </span>
                        {order.bank_reference && (
                          <span className="font-mono text-xs text-amber-400 font-bold">
                            {order.bank_reference}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="truncate max-w-[180px]" title={order.email}>{order.email}</div>
                      {order.phone && <div className="text-gray-400">{order.phone}</div>}
                    </td>

                    <td className="px-6 py-4 font-bold text-white">
                      ${Number(order.total_amount).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full border text-xs capitalize font-medium ${
                          statusStyles[order.status] || statusStyles.pending
                        }`}
                      >
                        {order.status?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2.5 py-1 rounded-full border text-xs capitalize font-medium inline-block w-fit ${
                            statusStyles[order.payment_status] || statusStyles.pending
                          }`}
                        >
                          {order.payment?.status || order.payment_status}
                        </span>
                        {order.payment?.admin_notes && (
                          <span className="text-[11px] text-rose-400 max-w-[150px] truncate" title={order.payment.admin_notes}>
                            Note: {order.payment.admin_notes}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {isBank ? (
                        <div className="flex flex-col gap-1">
                          {needsReview ? (
                            <button
                              onClick={() => openReviewModal(order)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-all w-fit shadow-sm"
                            >
                              <FiAlertCircle className="w-3.5 h-3.5" />
                              Review Slip
                            </button>
                          ) : (
                            <button
                              onClick={() => openReviewModal(order)}
                              className="px-2.5 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs flex items-center gap-1 transition-colors w-fit"
                            >
                              <FiEye className="w-3 h-3" />
                              View Details
                            </button>
                          )}
                          {order.bank_slip_url && (
                            <a
                              href={getImageUrl(order.bank_slip_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline"
                            >
                              Open file <FiExternalLink className="text-[10px]" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Pay on Delivery</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(event) =>
                          handleStatusUpdate(order.id, event.target.value)
                        }
                        className="bg-gray-900 border border-gray-700 text-gray-200 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="pending_verification">Pending Verification</option>
                        <option value="slip_uploaded">Slip Uploaded</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filteredOrders.length && (
            <div className="text-center text-gray-400 py-12">No orders match the selected criteria.</div>
          )}
        </div>
      </div>

      {/* Payment Slip Verification Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <FiShield className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">
                  Bank Transfer Verification — Order #{reviewOrder.id}
                </h3>
              </div>
              <button
                onClick={closeReviewModal}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Verification Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700/80 space-y-1">
                <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                  Authoritative Expected Total
                </span>
                <div className="text-2xl font-black text-emerald-400">
                  ${Number(reviewOrder.total_amount).toFixed(2)}
                </div>
                <p className="text-[11px] text-gray-400">Calculated securely on server from inventory prices</p>
              </div>

              <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700/80 space-y-1">
                <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                  Payment Reference
                </span>
                <div className="font-mono text-lg font-bold text-amber-400">
                  {reviewOrder.bank_reference || 'N/A'}
                </div>
                <p className="text-[11px] text-gray-400">Customer was instructed to specify this in bank narration</p>
              </div>
            </div>

            {/* Customer & Status Info */}
            <div className="bg-gray-800/50 p-3.5 rounded-xl border border-gray-700/50 flex flex-wrap items-center justify-between text-xs gap-3">
              <div>
                <span className="text-gray-400">Customer:</span>{' '}
                <span className="font-semibold text-white">{reviewOrder.email}</span>
              </div>
              <div>
                <span className="text-gray-400">Order Status:</span>{' '}
                <span className="font-semibold text-white capitalize">{reviewOrder.status?.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-400">Payment Status:</span>{' '}
                <span className="font-semibold text-white capitalize">
                  {reviewOrder.payment?.status || reviewOrder.payment_status}
                </span>
              </div>
            </div>

            {/* Bank Slip Preview */}
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-gray-300 block">
                Uploaded Payment Slip
              </span>
              {reviewOrder.bank_slip_url ? (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex flex-col items-center justify-center gap-3">
                  {reviewOrder.bank_slip_url.toLowerCase().endsWith('.pdf') ? (
                    <div className="py-8 text-center space-y-2">
                      <FiFileText className="w-12 h-12 text-indigo-400 mx-auto" />
                      <p className="text-xs text-gray-300">PDF Bank Slip Document</p>
                      <a
                        href={getImageUrl(reviewOrder.bank_slip_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow"
                      >
                        Open PDF in New Window <FiExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2 w-full text-center">
                      <div className="max-h-72 overflow-hidden rounded-lg border border-gray-700 bg-black/40 flex items-center justify-center">
                        <img
                          src={getImageUrl(reviewOrder.bank_slip_url)}
                          alt="Bank Transfer Slip"
                          className="max-h-72 object-contain"
                        />
                      </div>
                      <a
                        href={getImageUrl(reviewOrder.bank_slip_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        View Full Size Image <FiExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-800 border border-dashed border-gray-700 rounded-xl p-8 text-center text-gray-400 text-xs">
                  No bank transfer slip has been uploaded yet by the customer.
                </div>
              )}
            </div>

            {/* Admin Notes / Discrepancy Reason */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-extrabold tracking-wider text-gray-300 block">
                Admin Notes / Reason for Rejection
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Expected $150.00 but slip shows $100.00, or Reference number is unreadable..."
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 placeholder-gray-500"
              />
              <span className="text-[11px] text-gray-400 block">
                This note will be emailed to the customer and visible on their dashboard if rejected.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={closeReviewModal}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 text-xs font-semibold transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleVerifySubmit(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <FiX className="w-4 h-4" />
                Reject Slip (Requires Notes)
              </button>

              <button
                type="button"
                onClick={() => handleVerifySubmit(true)}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <FiCheck className="w-4 h-4" />
                Approve & Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

