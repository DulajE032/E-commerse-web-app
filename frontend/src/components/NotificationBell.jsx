"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiDollarSign,
  FiMessageSquare,
  FiAlertCircle,
  FiClock,
  
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { useAuth } from "../services/AuthContext";
import Link from "next/link";

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 60) return "just now";
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "order_placed":
      return <FiPackage className="text-indigo-400 w-4 h-4" />;
    case "order_confirmed":
      return <FiCheckCircle className="text-emerald-400 w-4 h-4" />;
    case "order_shipped":
      return <FiTruck className="text-cyan-400 w-4 h-4" />;
    case "order_delivered":
      return <FiPackage className="text-teal-400 w-4 h-4" />;
    case "payment_verified":
      return <FiDollarSign className="text-emerald-400 w-4 h-4" />;
    case "payment_rejected":
    case "order_cancelled":
      return <FiAlertCircle className="text-rose-400 w-4 h-4" />;
    case "feedback_response":
    case "feedback_submitted":
      return <FiMessageSquare className="text-violet-400 w-4 h-4" />;
    default:
      return <FiBell className="text-amber-800 w-4 h-4" />;
  }
};

export default function NotificationBell() {
  const { token, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);


  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await api.getUnreadNotificationCount(token);
      setUnreadCount(res.count || 0);
    } catch (e) {
      // silent fail
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getNotifications(token, 15, 0);
      setNotifications(Array.isArray(data) ? data : []);
      fetchUnreadCount();
    } catch (e) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [token]);

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  const handleMarkRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.markNotificationRead(id, token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  if (!mounted || !user || !token) return null;


  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        aria-label="Notifications"
      >
        <FiBell className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-12" />
        
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 translate-x-1/4 -translate-y-1/4 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>


      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium border border-indigo-200">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <FiCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>Loading updates...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <FiCheckCircle className="w-8 h-8 text-slate-300 mb-1" />
                  <span className="font-medium text-slate-700">All caught up!</span>
                  <span>No notifications to show right now.</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id, n.is_read)}
                    className={`p-3.5 flex gap-3 items-start transition-colors cursor-pointer ${
                      n.is_read
                        ? "bg-white hover:bg-slate-50/80 text-slate-600"
                        : "bg-indigo-50/40 hover:bg-indigo-50/80 text-slate-800"
                    }`}
                  >
                    <div className="mt-0.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex-shrink-0">
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs font-semibold truncate ${
                            n.is_read ? "text-slate-700" : "text-slate-900"
                          }`}
                        >
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
                          <FiClock className="w-3 h-3" />
                          {formatRelativeTime(n.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      {n.order_id && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="inline-block text-[11px] text-indigo-600 hover:text-indigo-700 font-medium pt-0.5"
                        >
                          View in Dashboard →
                        </Link>
                      )}
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0 ring-4 ring-indigo-500/20" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Go to Order Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
