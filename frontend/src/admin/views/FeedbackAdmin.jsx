"use client";
import React, { useState, useEffect } from "react";
import {
  FiStar,
  FiMessageSquare,
  FiCheckCircle,
  FiEye,
  FiSend,
  FiX,
  FiFilter,
  FiAlertCircle,
  FiUser,
  FiPackage,
  FiCheck,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";
import { useAuth } from "../../services/AuthContext";

export default function FeedbackAdmin() {
  const { token } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL, FEATURED, UNFEATURED, PENDING_RESPONSE

  // Response Modal State
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadFeedbacks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getAllFeedbacksAdmin({}, token);
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load feedbacks.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [token]);

  const handleToggleFeature = async (fb) => {
    try {
      const newStatus = !fb.is_featured;
      await api.toggleFeedbackFeature(fb.id, newStatus, token);
      setFeedbacks((prev) =>
        prev.map((item) =>
          item.id === fb.id ? { ...item, is_featured: newStatus } : item
        )
      );
      showToast(
        newStatus
          ? "Feedback featured on landing page!"
          : "Feedback removed from landing page."
      );
    } catch (err) {
      showToast(err.message || "Failed to toggle feature status", "error");
    }
  };

  const handleOpenResponseModal = (fb) => {
    setSelectedFeedback(fb);
    setResponseText(
      fb.responses && fb.responses.length > 0 ? fb.responses[0].response : ""
    );
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedFeedback || !responseText.trim()) return;
    setIsSubmittingResponse(true);
    try {
      await api.respondToFeedbackAdmin(selectedFeedback.id, responseText, token);
      await loadFeedbacks();
      showToast("Official response published and user notified!");
      setSelectedFeedback(null);
      setResponseText("");
    } catch (err) {
      showToast(err.message || "Failed to post response", "error");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (filter === "FEATURED") return fb.is_featured;
    if (filter === "UNFEATURED") return !fb.is_featured;
    if (filter === "PENDING_RESPONSE")
      return !fb.responses || fb.responses.length === 0;
    return true;
  });

  const featuredCount = feedbacks.filter((fb) => fb.is_featured).length;
  const respondedCount = feedbacks.filter(
    (fb) => fb.responses && fb.responses.length > 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 px-5 py-3 rounded-2xl bg-gray-800 text-white border border-gray-700 shadow-2xl text-xs font-semibold flex items-center gap-2"
          >
            <FiCheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Stats Cards */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Customer Feedback & Reviews
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Curate customer testimonials for the landing page and post official admin responses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Total Submissions
            </span>
            <p className="text-2xl font-black text-white mt-1">{feedbacks.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <FiMessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Featured on Landing Page
            </span>
            <p className="text-2xl font-black text-amber-400 mt-1">{featuredCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <FiStar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Responded by Admin
            </span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{respondedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-3 overflow-x-auto">
        {[
          { id: "ALL", label: `All (${feedbacks.length})` },
          { id: "FEATURED", label: `Featured on Home (${featuredCount})` },
          { id: "PENDING_RESPONSE", label: `Needs Response (${feedbacks.length - respondedCount})` },
          { id: "UNFEATURED", label: "Not Featured" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === t.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-gray-800/80 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Feedback Items List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-gray-800/50 rounded-2xl border border-gray-700">
          <FiMessageSquare className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="font-bold text-white text-base">No feedback found</p>
          <p className="text-xs mt-1">There are no feedback submissions matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredFeedbacks.map((fb) => {
            const hasResponses = fb.responses && fb.responses.length > 0;

            return (
              <div
                key={fb.id}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-4 hover:border-gray-600 transition-all shadow-lg"
              >
                {/* Header row: User, Order #, Stars, Date */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                      {fb.user_name ? fb.user_name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {fb.user_name || `User #${fb.user_id}`}
                        </span>
                        <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                          <FiPackage className="w-2.5 h-2.5" /> Order #{fb.order_id}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {new Date(fb.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < fb.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-1">
                      {fb.rating}/5
                    </span>
                  </div>
                </div>

                {/* Customer Comment */}
                <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Customer Experience
                  </span>
                  <p className="text-gray-200 text-sm leading-relaxed italic">
                    "{fb.comment}"
                  </p>
                </div>

                {/* Existing Admin Response (if any) */}
                {hasResponses && (
                  <div className="bg-indigo-950/30 border border-indigo-500/30 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Admin Response ({fb.responses[0].admin_name || "Store Admin"})
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(fb.responses[0].created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {fb.responses[0].response}
                    </p>
                  </div>
                )}

                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {/* Feature Toggle */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={fb.is_featured}
                      onChange={() => handleToggleFeature(fb)}
                      className="w-4 h-4 text-amber-500 rounded bg-gray-700 border-gray-600 focus:ring-amber-500"
                    />
                    <span
                      className={`text-xs font-semibold ${
                        fb.is_featured ? "text-amber-400" : "text-gray-400"
                      }`}
                    >
                      {fb.is_featured
                        ? "★ Featured on Landing Page"
                        : "Feature on Landing Page"}
                    </span>
                  </label>

                  {/* Respond Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenResponseModal(fb)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      hasResponses
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
                    }`}
                  >
                    <FiSend className="w-3.5 h-3.5" />
                    {hasResponses ? "Edit Response" : "Respond to Customer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADMIN RESPONSE MODAL */}
      <AnimatePresence>
        {selectedFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-700 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Respond to {selectedFeedback.user_name || "Customer"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Order #{selectedFeedback.order_id} Feedback
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Readonly Original Customer Review */}
              <div className="p-3.5 bg-gray-900 rounded-xl border border-gray-700/60 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400">
                  Original Customer Feedback (Read-Only)
                </span>
                <p className="text-gray-300 italic">"{selectedFeedback.comment}"</p>
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Official Admin Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    required
                    placeholder="e.g., Thank you so much for your kind words! We are thrilled you enjoyed the product."
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Note: Customer will receive an in-app notification when you post this response.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFeedback(null)}
                    disabled={isSubmittingResponse}
                    className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingResponse || !responseText.trim()}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    <FiSend className="w-3.5 h-3.5" />
                    {isSubmittingResponse ? "Posting..." : "Publish Response"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
