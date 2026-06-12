"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiFilter, FiChevronDown, FiStar, FiShoppingCart, FiCheck, FiHeart } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useCart } from '../services/CartContext';
import { useWishlist } from '../services/WishlistContext';
import Loader from '../components/Loader';
import { useMinLoadingTime } from '../hooks/useMinLoadingTime';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useRouter();
  
  const showLoader = useMinLoadingTime(loading, 600);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('Recommended');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  
  const sortOptions = {
    'Recommended': 'featured',
    'Price: Low to High': 'price_low',
    'Price: High to Low': 'price_high',
    'Newest First': 'newest',
    'Popularity': 'popular'
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  useEffect(() => {
    
    api.getProductFilters()
      .then((data) => {
        setCategories(data.categories || []);
        setBrands(data.brands || []);
        
        if (data.priceRange) {
          setPriceRange({
            min: data.priceRange.min ?? '',
            max: data.priceRange.max ?? '',
          })
        
        }
      
      
      }).catch(console.error);
  }, []);
  
   useEffect(() => {
   setLoading(true);
   api.getProducts({
     category: selectedCategory === 'All' ? null : selectedCategory,
     brands: selectedBrands,
     minPrice: priceRange.min === '' ? null : Number(priceRange.min),
     maxPrice: priceRange.max === '' ? null : Number(priceRange.max),
     inStock: inStockOnly,
     sortBy: sortOptions[sortBy],
   })
     .then(setProducts)
     .catch(console.error)
     .finally(() => setLoading(false));
 }, [selectedCategory, selectedBrands, priceRange, inStockOnly, sortBy]);


  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header / Breadcrumb */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shop Collection</h1>
            <p className="text-slate-500 mt-2 font-medium">Showing {products.length} results</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="md:hidden flex items-center gap-2 bg-white border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-gray-50 transition-colors shadow-sm">
               <FiFilter className="w-4 h-4" /> Filters
             </button>
             
             {/* Custom Sort By Dropdown */}
             <div className="relative">
               <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 bg-white border border-gray-300 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-gray-50 transition-colors shadow-sm min-w-[200px] justify-between"
               >
                 <span>Sort by: <span className="text-blue-600">{sortBy}</span></span>
                 <FiChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
               </button>
               
               <AnimatePresence>
                 {isSortOpen && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="absolute top-full right-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2"
                   >
                     {Object.keys(sortOptions).map(option => (
                       <button
                         key={option}
                         onClick={() => { setSortBy(option); setIsSortOpen(false); }}
                         className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${sortBy === option ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-gray-50'}`}
                       >
                         {option}
                       </button>
                     ))}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden md:block w-64 shrink-0 space-y-8">
             
             {/* 1. Category Filter */}
             <div>
                <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                  Category
                </h3>
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => setSelectedCategory('All')}
                    className={`text-sm text-left px-3 py-2 rounded-lg font-medium transition-all ${selectedCategory === 'All' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`text-sm text-left px-3 py-2 rounded-lg font-medium transition-all ${selectedCategory === cat.name ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
             </div>

             {/* 2. Price Range */}
             <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-xs">Price Range</h3>
                <div className="mb-4">
                  {/* Visual Range Slider line */}
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600 w-2/3 ml-[10%]"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={priceRange.min}
                      onChange={e => setPriceRange({...priceRange, min: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl pl-7 pr-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                  <span className="text-gray-400 font-bold">-</span>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={priceRange.max}
                      onChange={e => setPriceRange({...priceRange, max: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl pl-7 pr-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                </div>
             </div>

             {/* 3. Brand Filter */}
             <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-xs">Brand</h3>
                <div className="space-y-3">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedBrands.includes(brand) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white group-hover:border-blue-500'}`}>
                        {selectedBrands.includes(brand) && <FiCheck className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
             </div>

             <div className="border-t border-gray-200 pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly((v) => !v)}
                />
                <span className="text-sm font-medium text-slate-700">In stock only</span>
              </label>
            </div>

             <button className="w-full mt-8 bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
                Apply All Filters
             </button>
             
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {showLoader ? (
                <div className="col-span-full flex justify-center py-16">
                  <Loader size={64} dotSize={16} border={8} />
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-300">
                  <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiFilter className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">No products found</h3>
                  <p className="text-slate-500 font-medium">Try adjusting your filters or search criteria.</p>
                  <button 
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedBrands([]);
                      setPriceRange({ min: '', max: '' });
                    }}
                    className="mt-6 font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
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
                    className="bg-white rounded-[1.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group cursor-pointer flex flex-col h-full"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="relative w-full aspect-[4/5] rounded-xl bg-slate-50 mb-4 overflow-hidden flex items-center justify-center p-4">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={`http://127.0.0.1:8000${product.images[0]}`}
                          alt={product.name} 
                          className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-slate-300 text-sm font-medium">No Image</div>
                      )}

                      {/* Wishlist Heart Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-200 z-10 ${
                          isInWishlist(product.id)
                            ? 'bg-red-500 text-white scale-110'
                            : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <FiHeart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                      </button>
                      
                      {/* Action buttons on hover */}
                      <div className="absolute inset-x-4 bottom-4 translate-y-[150%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                         <button 
                           onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                           className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                         >
                           <FiShoppingCart className="w-4 h-4" /> Add
                         </button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <p className="text-cyan-600 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">{product.category}</p>
                      <h3 className="text-slate-900 font-bold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          <span className="text-lg font-extrabold text-slate-900">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center text-amber-400 text-[11px] gap-1 font-bold">
                           <FiStar className="fill-current w-3.5 h-3.5" /> 4.8
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
