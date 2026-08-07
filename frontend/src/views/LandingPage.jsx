"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  FiSearch,
  FiShoppingCart,
  FiArrowRight,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiStar,
  FiCamera,
  FiFilter,
  FiTag,
  FiCpu,
  FiRepeat,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { api, getImageUrl } from "../services/api";
import { useCart } from "../services/CartContext";
import { useCompare } from "../services/CompareContext";
import ProductCard from "../components/ProductCard";

import heroImage from "../assets/hero.jpg";
import TechCapsuleCarousel from "../components/TechCapsuleCarousel";
import Categories from "../components/Categories";

const LandingPageContent = () => {
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { compareItems, setIsCompareOpen } = useCompare();

  const categoryFromUrl = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ products_count: 0, customers_count: 0, successful_orders: 0 });

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || null);

  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);
  const [newLoading, setNewLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(8);
  const [totalProducts, setTotalProducts] = useState(0);
  const [mounted, setMounted] = useState(false);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setDisplayLimit(8);
    if (categoryName) {
      navigate.push(`/?category=${encodeURIComponent(categoryName)}`, { scroll: false });
    } else {
      navigate.push(`/`, { scroll: false });
    }
  };

  useEffect(() => {
    setMounted(true);

    api
      .getCategories()
      .then((res) => {
        if (res && res.length > 0) setCategories(res);
      })
      .catch(console.error);

    setRecLoading(true);
    api
      .getProducts({ limit: 4, sortBy: "featured" })
      .then((data) => setRecommendedProducts(data.products || []))
      .catch(console.error)
      .finally(() => setRecLoading(false));

    setNewLoading(true);
    api
      .getProducts({ limit: 4, sortBy: "newest" })
      .then((data) => setNewArrivals(data.products || []))
      .catch(console.error)
      .finally(() => setNewLoading(false));

    api
      .getPublicStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({
        category: selectedCategory,
        sortBy: "top_selling",
        limit: displayLimit,
      })
      .then((data) => {
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, displayLimit]);

  if (!mounted) return null;

  return (
    <div className="pb-20 bg-slate-50 relative">
      {/* Hero Section */}
      <section className="relative min-h-[75vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Robot Parts Hero"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/50 to-slate-950/20" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20 flex flex-col items-center text-center text-white">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 drop-shadow-lg uppercase text-slate-100 font-heading">
            Robot Parts
          </h1>
          <p className="text-slate-200 text-lg md:text-2xl mb-10 max-w-2xl font-light drop-shadow-md leading-relaxed">
            Premium components. Best Prices for Builders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link
              href="/products"
              className="bg-white text-slate-900 px-10 py-3.5 rounded-full font-bold hover:bg-slate-100 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 text-center"
            >
              Explore shop
            </Link>
            <Link
              href="/visual-search"
              className="bg-slate-900/40 backdrop-blur-md border border-white/30 text-white px-10 py-3.5 rounded-full font-bold hover:bg-white/20 transition shadow-lg transform hover:-translate-y-0.5 duration-200 text-center"
            >
              Visual Search
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Capsule Carousel */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Premium Calculators
          </h2>
          <p className="text-slate-500 mt-2">
            Easy online free tools for all your technical calculations.
          </p>
        </div>
        <div className="py-8">
          <TechCapsuleCarousel />
        </div>
      </section>

      {/* Categories */}
      <Categories />

      {/* Public Statistics */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-24 mb-16">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-indigo-950/30">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-indigo-800/40">
            {[
              {
                label: "Premium Products",
                value: stats.products_count ?? 0,
                suffix: "+",
                desc: "High quality curated robot parts & items",
              },
              {
                label: "Happy Customers",
                value: stats.customers_count ?? 0,
                suffix: "+",
                desc: "Registered builders worldwide",
              },
              {
                label: "Successful Orders",
                value: stats.successful_orders ?? 0,
                suffix: "+",
                desc: "Safely delivered and verified",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="pt-8 md:pt-0 md:px-6 flex flex-col items-center"
              >
                <span className="text-sm font-semibold tracking-wider text-indigo-300 uppercase mb-2">
                  {stat.label}
                </span>
                <span className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-cyan-200 tracking-tight">
                  {stat.value}{stat.suffix}
                </span>
                <p className="text-indigo-200/70 text-xs mt-3 max-w-[200px] leading-relaxed">
                  {stat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Store Products Viewing Section (Manageable & Dynamic) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
        <div className="bg-white rounded-[2.5rem] p-6 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">
                Store Catalog
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Featured & Top Selling Products
              </h2>
              <p className="text-slate-500 mt-2">
                Manageable view of available store inventory. Filter by category or load more items.
              </p>
            </div>

            {/* Category Pills Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1 md:flex-none max-w-full">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm border ${
                  selectedCategory === null
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-gray-200 hover:bg-slate-50"
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm border ${
                    selectedCategory === cat.name
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-gray-200 hover:bg-slate-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Reusable ProductCard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading && products.length === 0 ? (
              <div className="col-span-full flex justify-center py-16">
                <div className="loader" style={{ width: 64 }} />
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full py-20 text-center flex flex-col items-center">
                <FiFilter className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">
                  No products found in this category
                </h3>
                <p className="text-slate-500 mt-1">
                  Try selecting another category or explore all store products.
                </p>
              </div>
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Progressive "Load More" Button */}
          {products.length < totalProducts && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setDisplayLimit((prev) => prev + 8)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                {loading ? "Loading..." : `Load More Products (${products.length} of ${totalProducts})`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Section (Store Products) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              New Arrivals
            </h2>
            <p className="text-slate-500 mt-1">
              The latest additions to our store catalog.
            </p>
          </div>
          <Link
            href="/products"
            className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all"
          >
            Explore All <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newLoading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 h-80 animate-pulse" />
              ))
            : newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      {/* Floating Compare Button */}
      {compareItems.length > 0 && (
        <button
          onClick={() => setIsCompareOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold hover:bg-blue-600 transition-all transform hover:scale-105 border-2 border-white"
        >
          <FiRepeat className="w-5 h-5" />
          <span>Compare ({compareItems.length})</span>
        </button>
      )}
    </div>
  );
};

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}
