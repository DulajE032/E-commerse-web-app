"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { api, getImageUrl } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import { FiCheck, FiX, FiExternalLink } from 'react-icons/fi';

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
  pending_verification: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
};

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        (order.email || '').toLowerCase().includes(searchValue);
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, search]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status, token);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status } : order))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status.');
    }
  };

  const handleVerifyPayment = async (orderId, isApproved) => {
    try {
      const updatedOrder = await api.verifyPayment(orderId, isApproved, token);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: updatedOrder.status, payment_status: updatedOrder.payment_status }
            : order
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify payment.');
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
        <h2 className="text-2xl font-bold text-white">Orders</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by order id or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 w-full md:w-64"
          />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2"
          >
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="slip_uploaded">Slip Uploaded</option>
            <option value="confirmed">Confirmed</option>
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
                <th className="text-left px-6 py-4 font-medium">Customer</th>
                <th className="text-left px-6 py-4 font-medium">Total</th>
                <th className="text-left px-6 py-4 font-medium">Status</th>
                <th className="text-left px-6 py-4 font-medium">Payment</th>
                <th className="text-left px-6 py-4 font-medium">Bank Slip</th>
                <th className="text-left px-6 py-4 font-medium">Date</th>
                <th className="text-left px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-700 text-gray-200">
                  <td className="px-6 py-4 font-semibold">#{order.id}</td>
                  <td className="px-6 py-4">{order.email}</td>
                  <td className="px-6 py-4">${order.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full border text-xs capitalize ${
                        statusStyles[order.status] || statusStyles.pending
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full border text-xs capitalize ${
                        statusStyles[order.payment_status] || statusStyles.pending
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.bank_slip_url ? (
                      <a
                        href={getImageUrl(order.bank_slip_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        View Slip <FiExternalLink className="text-xs" />
                      </a>
                    ) : (
                      <span className="text-gray-500 font-medium">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {order.payment_method === 'bank_transfer' &&
                      (order.status === 'slip_uploaded' || order.status === 'pending_verification') ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerifyPayment(order.id, true)}
                            title="Approve Payment"
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition flex items-center justify-center"
                          >
                            <FiCheck className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleVerifyPayment(order.id, false)}
                            title="Reject Payment"
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition flex items-center justify-center"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </div>
                      ) : null}

                      <select
                        value={order.status}
                        onChange={(event) =>
                          handleStatusUpdate(order.id, event.target.value)
                        }
                        className="bg-gray-900 border border-gray-700 text-gray-200 rounded-md px-3 py-2 text-xs"
                      >
                        <option value="pending">Pending</option>
                        <option value="pending_verification">Pending Verification</option>
                        <option value="slip_uploaded">Slip Uploaded</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredOrders.length && (
            <div className="text-center text-gray-400 py-8">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
