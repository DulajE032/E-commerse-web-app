"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, getImageUrl } from "../services/api";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// Fallback data if DB is empty
const fallbackCategories = [
  { id: 'f1', name: "Electronics", image: "/categories/laptops.png" },
  { id: 'f2', name: "Accessories", image: "/categories/earbuds.png" },
  { id: 'f3', name: "Audio", image: "/categories/speakers.png" },
  { id: 'f4', name: "Phones", image: "/categories/phones.png" },
  { id: 'f5', name: "Cameras", image: "/categories/gimbals.png" },
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await api.getCategories();
        
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          // If database is empty, use fallbacks
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
        setCategories(fallbackCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Hydration guard: Don't render anything until the component has mounted on the client
  if (!mounted) return null;

  const SkeletonCard = () => (
    <div className="block bg-[#e5e5e5] rounded-2xl p-5 flex flex-col items-center min-h-[200px] animate-pulse">
      <div className="h-4 w-3/4 bg-slate-300 rounded mb-4 mt-2"></div>
      <div className="w-full flex-1 bg-slate-300 rounded-lg mt-2"></div>
    </div>
  );

  return (
    <section
      id="categories-section"
      className="max-w-7xl mx-auto px-4 md:px-8 mt-16 mb-16"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Categories
        </h2>
        <Link
          href="/products"
          className="text-sm font-semibold text-amber-700 hover:text-amber-900 hover:underline mt-2 inline-block transition-colors"
        >
          See more ›
        </Link>
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))
          : categories.map((cat, index) => (
              <motion.div key={cat.id || index} variants={cardVariants}>
                <Link
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="block bg-[#e5e5e5] rounded-2xl p-5 flex flex-col items-center hover:shadow-xl hover:-translate-y-1.5 hover:bg-[#dcdcdc] transition-all duration-300 ease-out group cursor-pointer min-h-[200px]"
                >
                  <h3 className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-800 text-center mb-3 leading-snug min-h-[32px] flex items-center justify-center">
                    {cat.name}
                  </h3>
                  <div className="w-full flex-1 flex items-center justify-center p-2 overflow-hidden">
                    {cat.image ? (
                      <img
                        src={getImageUrl(cat.image)}
                        alt={cat.name}
                        className="max-w-full max-h-[140px] object-contain group-hover:scale-110 transition-transform duration-500 ease-out mix-blend-multiply"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/logo.png"; // Fallback image if source fails
                        }}
                      />
                    ) : (
                      <div className="text-slate-400 text-[10px] font-bold">No Image</div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
      </motion.div>
    </section>
  );
}
