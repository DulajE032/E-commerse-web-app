"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiFilter,
  FiChevronDown,
  FiStar,
  FiShoppingCart,
  FiCheck,
  FiHeart,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { api, getImageUrl } from "../services/api";
import { useCart } from "../services/CartContext";
import { useWishlist } from "../services/WishlistContext";
import Loader from "../components/Loader";
import { useMinLoadingTime } from "../hooks/useMinLoadingTime";
import ProductSkeleton from "../components/SkeletonForCard";

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
  // 1. ALL ORIGINAL STATE LOGIC (Unchanged)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const showLoader = useMinLoadingTime(loading, 600);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("Recommended");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // NEW: Mobile UI State (Only controls the sliding menu)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const sortOptions = {
    Recommended: "featured",
    "Low price: Low to High": "price_low",
    "Max price: High to Low": "price_high",
    "Newest First": "newest",
    Popularity: "popular",
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  // 2. ALL ORIGINAL API LOGIC (Unchanged)
  useEffect(() => {
    setMounted(true);
    api
      .getProductFilters()
      .then((data) => {
        setCategories(data.categories || []);
        setBrands(data.brands || []);
        if (data.priceRange) {
          setPriceRange({
            min: data.priceRange.min ?? "",
            max: data.priceRange.max ?? "",
          });
        }
      })
      .catch(console.error);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedBrands,
    priceRange,
    inStockOnly,
    sortBy,
    searchQuery,
  ]);

  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    api
      .getProducts({
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        category: selectedCategory === "All" ? null : selectedCategory,
        brands: selectedBrands,
        minPrice: priceRange.min === "" ? null : Number(priceRange.min),
        maxPrice: priceRange.max === "" ? null : Number(priceRange.max),
        inStock: inStockOnly,
        sortBy: sortOptions[sortBy],
        search: searchQuery || null,
      })
      .then((data) => {
        setProducts(data.products);
        setTotalProducts(data.total);
        setTotalPages(data.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [
    selectedCategory,
    selectedBrands,
    priceRange,
    inStockOnly,
    sortBy,
    searchQuery,
    mounted,
    currentPage,
  ]);

  // 3. THE UPGRADED UI LAYOUT
  if (!mounted) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Header / Breadcrumb */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : "All Products"}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {totalProducts} products found
              {totalPages > 1 ? ` — Page ${currentPage} of ${totalPages}` : ""}
            </p>
          </div>

          <div className="flex gap-2">
            {searchQuery && (
              <button
                onClick={() => navigate.push("/products")}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 w-full md:w-auto shadow-sm"
              >
                <FiX className="w-4 h-4" /> Clear Search
              </button>
            )}
            {/* Mobile Filter Button - Triggers Drawer */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 w-full md:w-auto shadow-sm"
            >
              <FiFilter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* --- MACRO GRID START --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start relative">
          {/* Mobile Dark Overlay (Click to close) */}
          {isMobileFilterOpen && (
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileFilterOpen(false)}
            />
          )}

          {/* LEFT COLUMN: The Sidebar (Mobile Drawer + Desktop Sticky) */}
          <aside
            className={`
            fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-white p-6 shadow-2xl overflow-y-auto transition-transform duration-300 
            lg:static lg:translate-x-0 lg:block lg:col-span-1 lg:rounded-[2rem] lg:border lg:border-gray-100 lg:sticky lg:top-8 lg:z-0 lg:w-auto lg:shadow-sm
            ${isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          >
            {/* Mobile Drawer Header */}
            <div className="flex justify-between items-center mb-8 lg:hidden">
              <h2 className="text-xl font-extrabold text-slate-900">Filters</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            {/* 1. Category Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-xs">
                Category
              </h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`text-sm text-left px-3 py-2 rounded-lg font-medium transition-all ${selectedCategory === "All" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`text-sm text-left px-3 py-2 rounded-lg font-medium transition-all ${selectedCategory === cat.name ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Price Range (Your original detailed UI) */}
            <div className="mb-8 border-t border-gray-100 pt-6">
              <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-xs">
                Price Range
              </h3>
              <div className="mb-4">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 w-2/3 ml-[10%]"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl pl-7 pr-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  />
                </div>
                <span className="text-gray-400 font-bold">-</span>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl pl-7 pr-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 3. Brand Filter */}
            <div className="mb-8 border-t border-gray-100 pt-6">
              <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-xs">
                Brand
              </h3>
              <div className="space-y-3">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedBrands.includes(brand) ? "bg-slate-900 border-slate-900" : "border-gray-300 bg-white group-hover:border-slate-500"}`}
                    >
                      {selectedBrands.includes(brand) && (
                        <FiCheck className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. In Stock Filter */}
            <div className="mb-8 border-t border-gray-100 pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly((v) => !v)}
                />
                <span className="text-sm font-medium text-slate-700">
                  In stock only
                </span>
              </label>
            </div>

            {/* 5. Mobile Apply Button */}
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="lg:hidden w-full bg-slate-900 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg"
            >
              Apply Filters
            </button>
          </aside>

          {/* RIGHT COLUMN: MAIN CONTENT */}
          <main className="lg:col-span-3 flex flex-col gap-6">
            {/* Top Sort Bar (Transforms on mobile) */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between overflow-x-auto">
              <div className="flex items-center gap-4 px-3 min-w-max">
                <span className="text-sm text-gray-500 font-medium hidden sm:block">
                  Sort by:
                </span>
                <div className="flex gap-2">
                  {Object.keys(sortOptions)
                    .slice(0, 4)
                    .map((option) => (
                      <button
                        key={option}
                        onClick={() => setSortBy(option)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${sortBy === option ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                      >
                        {option.split(":")[0]}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {showLoader ? (
                Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-300">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiFilter className="w-10 h-10 text-slate-900" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-slate-500 font-medium">
                    Try adjusting your filters or search criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedBrands([]);
                      setPriceRange({ min: "", max: "" });
                      setInStockOnly(false);
                    }}
                    className="mt-6 font-bold text-slate-900 hover:text-slate-700 underline underline-offset-4"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-white rounded-[1.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300 group cursor-pointer flex flex-col h-full"
                    onClick={() => navigate.push(`/product/${product.id}`)}
                  >
                    <div className="relative w-full aspect-[4/5] rounded-xl bg-slate-50 mb-4 overflow-hidden flex items-center justify-center p-4">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-slate-300 text-sm font-medium">
                          No Image
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-200 z-10 ${
                          isInWishlist(product.id)
                            ? "bg-red-500 text-white scale-110"
                            : "bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500"
                        }`}
                      >
                        <FiHeart
                          className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-current" : ""}`}
                        />
                      </button>

                      <div className="absolute inset-x-4 bottom-4 translate-y-[150%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-20 hidden md:block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold shadow-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiShoppingCart className="w-4 h-4" /> Add
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">
                        {product.category}
                      </p>
                      <h3 className="text-slate-900 font-bold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-slate-600 transition-colors">
                        {product.name}
                      </h3>

                      <div className="mt-auto flex items-end justify-between">
                        <span className="text-lg font-extrabold text-slate-900">
                          ${product.price.toFixed(2)}
                        </span>
                        <div className="flex items-center text-amber-400 text-[11px] gap-1 font-bold">
                          <FiStar className="fill-current w-3.5 h-3.5" />{" "}
                          {product.ratingSmall
                            ? product.ratingSmall.toFixed(1)
                            : "New"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && !showLoader && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-200 text-slate-700 hover:bg-slate-100 shadow-sm"
                >
                  ← Prev
                </button>

                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let start = Math.max(
                    1,
                    currentPage - Math.floor(maxVisible / 2),
                  );
                  let end = Math.min(totalPages, start + maxVisible - 1);
                  if (end - start + 1 < maxVisible)
                    start = Math.max(1, end - maxVisible + 1);

                  if (start > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => {
                          setCurrentPage(1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-10 h-10 rounded-xl text-sm font-bold bg-white border border-gray-200 text-slate-700 hover:bg-slate-100 shadow-sm"
                      >
                        1
                      </button>,
                    );
                    if (start > 2)
                      pages.push(
                        <span key="start-dots" className="px-1 text-slate-400">
                          …
                        </span>,
                      );
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentPage(i);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                          currentPage === i
                            ? "bg-slate-900 text-white shadow-md"
                            : "bg-white border border-gray-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {i}
                      </button>,
                    );
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1)
                      pages.push(
                        <span key="end-dots" className="px-1 text-slate-400">
                          …
                        </span>,
                      );
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => {
                          setCurrentPage(totalPages);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-10 h-10 rounded-xl text-sm font-bold bg-white border border-gray-200 text-slate-700 hover:bg-slate-100 shadow-sm"
                      >
                        {totalPages}
                      </button>,
                    );
                  }

                  return pages;
                })()}

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-200 text-slate-700 hover:bg-slate-100 shadow-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
