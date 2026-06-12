"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { FiBox, FiDollarSign, FiShoppingBag, FiUsers } from 'react-icons/fi';
import { api } from '../../services/api';
import { useAuth } from '../../services/AuthContext';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await api.getDashboardStats(token);
        if (isMounted) {
          setStats(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard stats.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (token) {
      loadStats();
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const revenueMax = useMemo(() => {
    if (!stats?.revenue_by_month?.length) return 1;
    return Math.max(...stats.revenue_by_month.map((item) => item.revenue), 1);
  }, [stats]);

  if (!token) {
    return <div className="text-gray-300">Please log in as an admin to view the dashboard.</div>;
  }

  if (loading) {
    return <div className="text-gray-300">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  if (!stats) {
    return <div className="text-gray-300">No dashboard data available.</div>;
  }

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.total_revenue),
      icon: <FiDollarSign className="text-2xl text-green-400" />,
    },
    {
      label: 'Total Orders',
      value: stats.total_orders,
      icon: <FiShoppingBag className="text-2xl text-indigo-400" />,
    },
    {
      label: 'Customers',
      value: stats.total_customers,
      icon: <FiUsers className="text-2xl text-purple-400" />,
    },
    {
      label: 'Products',
      value: stats.total_products,
      icon: <FiBox className="text-2xl text-orange-400" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md flex items-center justify-between"
            >
              <div>
                <p className="text-gray-400 text-sm">{card.label}</p>
                <p className="text-2xl font-semibold text-white mt-2">{card.value}</p>
              </div>
              {card.icon}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md xl:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue (last 6 months)</h3>
          <div className="flex items-end gap-4 h-48">
            {stats.revenue_by_month.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-indigo-500 rounded-t-md"
                  style={{ height: `${(month.revenue / revenueMax) * 100}%` }}
                />
                <span className="text-xs text-gray-400 mt-2">{month.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <h3 className="text-lg font-semibold text-white mb-4">Orders by status</h3>
          <div className="space-y-3">
            {Object.entries(stats.orders_by_status || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-300">{status}</span>
                <span className="text-white font-semibold">{count}</span>
              </div>
            ))}
            {!Object.keys(stats.orders_by_status || {}).length && (
              <p className="text-gray-400 text-sm">No orders yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
        <h3 className="text-lg font-semibold text-white mb-4">Recent orders</h3>
        <div className="space-y-4">
          {stats.recent_orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between border border-gray-700 rounded-lg p-4"
            >
              <div>
                <p className="text-white font-medium">Order #{order.id}</p>
                <p className="text-sm text-gray-400">{order.customer}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-4">
                <span className="text-white font-semibold">
                  {formatCurrency(order.total)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-gray-700 text-gray-200 capitalize">
                  {order.status}
                </span>
              </div>
            </div>
          ))}
          {!stats.recent_orders.length && (
            <p className="text-gray-400 text-sm">No recent orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
