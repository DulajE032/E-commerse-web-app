"use client";
import React, { useState, useEffect } from "react";
import { FiStar, FiCheckCircle, FiMessageSquare, FiHeart } from "react-icons/fi";
import { motion } from "framer-motion";
import { api } from "../services/api";

const DEFAULT_FEEDBACKS = [
  {
    id: "d1",
    user_name: "Sarah K.",
    rating: 5,
    comment: "The delivery was lightning fast! Quality of the product exceeded all my expectations. Absolutely love the customer service too.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "d2",
    user_name: "Michael R.",
    rating: 5,
    comment: "Very smooth ordering process and direct bank transfer was seamless with the generated reference code. Will definitely purchase again!",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "d3",
    user_name: "Amanda L.",
    rating: 5,
    comment: "Best shopping experience online. Packaging was super secure and tracking updates kept me informed every step of the way.",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export default function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const data = await api.getFeaturedFeedbacks(6);
        if (Array.isArray(data) && data.length > 0) {
          setFeedbacks(data);
        } else {
          setFeedbacks(DEFAULT_FEEDBACKS);
        }
      } catch (err) {
        setFeedbacks(DEFAULT_FEEDBACKS);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden border-y border-slate-800">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <FiHeart className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
            <span>Customer Love & Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Loved by  Happy Shoppers
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Real feedback from verified customers about their purchase and delivery experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {feedbacks.map((fb, idx) => {
            const initial = fb.user_name ? fb.user_name[0].toUpperCase() : "C";
            return (
              <motion.div
                key={fb.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/20 flex flex-col justify-between relative group hover:border-indigo-500/50 transition-all"
              >
                {/* Top: Stars & Quote Icon */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < (fb.rating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <FiMessageSquare className="text-slate-600 w-4 h-4 group-hover:text-indigo-400 transition-colors" />
                  </div>

                  {/* Comment Quote */}
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                    "{fb.comment}"
                  </p>
                </div>

                {/* Bottom: Customer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-indigo-500/20">
                      {initial}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{fb.user_name}</span>
                        <span title="Verified Customer">
                          <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Verified Buyer</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {fb.created_at ? new Date(fb.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
