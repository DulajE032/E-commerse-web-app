"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSearch, FiShoppingCart, FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiStar, FiCamera, FiFilter, FiTag, FiCpu } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useCart } from '../services/CartContext';
import Loader from '../components/Loader';
import heroImage from '../assets/hero.jpg';
import TechCapsuleCarousel from '../components/TechCapsuleCarousel';
import Categories from '../components/Categories';
const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useRouter();

  useEffect(() => {
    // Fetch categories or mock them for the UI
    api.getCategories().then(res => {
        if (res && res.length > 0) setCategories(res);
        else setCategories([{id: 1, name: 'Electronics'}, {id: 2, name: 'Accessories'}, {id: 3, name: 'Audio'}]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getProducts({
      category: selectedCategory,
      sortBy: 'top_selling',
      limit: 8
    })
      .then(res => setProducts(res)) 
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div className="pb-20 bg-gray-50">
      
      <section className="min-h-screen bg-slate-50 p-4 md:p-10 flex justify-center">
      
      {/* 2. The White Card Container */}
      <div className="bg-white w-full max-w-5xl rounded-[2rem] pt-16 pb-10 px-6 flex flex-col items-center text-center shadow-sm">
        
        {/* 3. The Typography */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
          Robot Parts
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-md">
          Premium components. Best Prices for Builders.
        </p>
        
        {/* 4. The Button Group */}
        <div className="flex gap-4 mb-16">
          <button className="bg-gray-900 text-white px-8 py-2.5 rounded-full font-semibold hover:bg-gray-800 transition">
            Contact us
          </button>
          <button className="border border-gray-300 text-gray-900 px-8 py-2.5 rounded-full font-semibold hover:bg-gray-50 transition">
            Buy
          </button>
        </div>
        
        {/* 5. The Image */}
        <div className="w-full max-w-2xl flex justify-center">
          <img 
            src="/robot-image.png" 
            alt="3D Robot Parts" 
            className="w-full object-contain"
          />
        </div>
        
      </div>
      
    </section>

      {/* Tech Capsule Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Our Premium Calculators</h2>
          <p className="text-slate-500 mt-2">Easy online free tools for all your technical calculations.</p>
        </div>
        <div className="py-8">
          <TechCapsuleCarousel />
        </div>
      </section>

      {/* Categories Section */}
      <Categories />

      {/* Trust Elements */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-16 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: FiShield, title: "Secure Payments", desc: "100% secure checkout with 256-bit encryption" },
            { icon: FiTruck, title: "Fast Delivery", desc: "Free shipping on orders over $150" },
            { icon: FiRefreshCw, title: "Easy Returns", desc: "30-day money back guarantee" }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="bg-blue-50 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Selling Products & Filters */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
           
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
             <div>
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Top Selling Products</h2>
               <p className="text-slate-500">Discover what's trending right now. Use filters to narrow down.</p>
             </div>
             
             {/* Filter & Category UI */}
             <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1 md:flex-none">
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm border ${
                      selectedCategory === null 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                     <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm border ${
                          selectedCategory === cat.name
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'
                        }`}
                     >
                        {cat.name}
                     </button>
                  ))}
                </div>
                
                {/* Advanced Filter Button */}
                <button className="bg-white border border-gray-200 text-slate-700 px-4 py-2.5 rounded-full text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                   <FiFilter className="w-4 h-4" /> Filters
                </button>
             </div>
           </div>

           {/* Product Grid */}
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
             {loading ? (
               <div className="col-span-full flex justify-center py-16">
                 <Loader size={64} dotSize={16} border={8} />
               </div>
             ) : products.length === 0 ? (
                <div className="col-span-full py-20 text-center flex flex-col items-center">
                   <FiFilter className="w-12 h-12 text-slate-300 mb-4" />
                   <h3 className="text-xl font-bold text-slate-800">No products found</h3>
                   <p className="text-slate-500">Try selecting a different category.</p>
                </div>
             ) : (
               products.map((product, idx) => (
                 <motion.div 
                   key={product.id}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: idx * 0.1 }}
                   className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group cursor-pointer flex flex-col h-full relative"
                   onClick={() => navigate.push(`/product/${product.id}`)}
                 >
                   {/* Image Box */}
                   <div className="relative w-full aspect-[4/5] rounded-xl bg-slate-50 mb-5 overflow-hidden flex items-center justify-center p-6 group-hover:bg-slate-100 transition-colors">
                     {product.images && product.images.length > 0 ? (
                       <img 
                         src={`http://127.0.0.1:8000${product.images[0]}`}
                         alt={product.name} 
                         className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out"
                       />
                     ) : (
                       <div className="text-slate-300 text-sm font-medium">No Image</div>
                     )}
                     
                     {/* Quick Add overlay */}
                     <div className="absolute inset-x-4 bottom-4 translate-y-[150%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                       <button 
                         onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                         className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                       >
                         <FiShoppingCart className="w-4 h-4" /> Quick Add
                       </button>
                     </div>
                   </div>

                   {/* Details */}
                   <div className="flex-1 flex flex-col text-left">
                     <p className="text-blue-500 text-xs font-bold uppercase tracking-wider mb-1">{product.category}</p>
                     <h3 className="text-slate-900 font-bold text-sm md:text-base leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                     <div className="mt-auto flex items-center justify-between">
                       <span className="text-lg md:text-xl font-extrabold text-slate-900">
                         ${product.price.toFixed(2)}
                       </span>
                       <div className="flex items-center text-amber-400 text-xs gap-1 font-bold">
                         <FiStar className="fill-current w-3 h-3" /> 4.9
                       </div>
                     </div>
                   </div>
                 </motion.div>
               ))
             )}
           </div>
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-[2.5rem] bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl shadow-blue-900/20"
        >
          {/* Decor */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-cyan-500/30 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 text-white md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <span className="bg-cyan-500/20 text-cyan-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-cyan-500/30 mb-6 inline-block shadow-sm">AI Enhanced</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight text-white">Experience Smart <br/> Shopping</h2>
            <p className="text-blue-100 mb-8 max-w-sm mx-auto md:mx-0 leading-relaxed text-sm md:text-base">Upload an image and let our visual AI find identical or similar products instantly. Try it now.</p>
            <Link href="/visual-search" className="bg-cyan-500 text-slate-900 font-bold px-8 py-4 rounded-full hover:bg-cyan-400 transition-colors inline-flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <FiCamera className="w-5 h-5" /> Try Visual Search
            </Link>
          </div>

          <div className="relative z-10 w-full max-w-sm md:w-1/3">
             <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop" alt="Headphones Promotion" className="rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-8 border-white/5 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;