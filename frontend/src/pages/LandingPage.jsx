import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiStar, FiCamera, FiFilter } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useCart } from '../services/CartContext';
import Loader from '../components/Loader';
import heroImage from '../assets/hero.png';

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories or mock them for the UI
    api.getCategories().then(res => {
        if (res && res.length > 0) setCategories(res);
        else setCategories([{id: 1, name: 'Electronics'}, {id: 2, name: 'Accessories'}, {id: 3, name: 'Audio'}]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    // User will integrate exact backend logic for filtering Top Selling
    api.getProducts(selectedCategory)
      .then(res => setProducts(res.slice(0, 8))) 
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div className="pb-20 bg-gray-50">
      
      {/* Premium Hero Section (Dark Blue Theme) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut" }} 
          className="rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative min-h-[500px]"
        >
          {/* Left Content Area */}
          <div className="bg-slate-900 text-white p-10 md:p-16 lg:p-20 flex-1 flex flex-col justify-center relative z-10 md:w-1/2">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-cyan-400 font-bold tracking-widest text-sm uppercase mb-4 block"
            >
              Next Generation E-Commerce
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-white"
            >
              Shop Smarter <br/> Not Harder
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-slate-300 text-sm md:text-base max-w-md mb-10 leading-relaxed"
            >
              Discover top-tier products with our intelligent visual search AI. Just snap a picture and find exactly what you're looking for.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex gap-4 flex-wrap"
            >
              <Link to="/products" className="bg-blue-600 text-white font-bold px-8 py-4 rounded-full hover:bg-blue-500 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-600/30 flex items-center gap-2">
                Explore Shop <FiArrowRight className="w-5 h-5" />
              </Link>
              
              {/* Visual Search CTA */}
              <Link to="/visual-search" className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold px-8 py-4 rounded-full hover:bg-white/20 transition-all shadow-sm flex items-center gap-2">
                 <FiCamera className="w-5 h-5 text-cyan-400" /> Visual Search
              </Link>
            </motion.div>
            
            {/* Decorative circles */}
            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none"></div>
          </div>
          
          {/* Right Image Area */}
          <div className="flex-1 min-h-[300px] relative hidden md:block group overflow-hidden bg-slate-800">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={heroImage}
                alt="Premium Tech" 
                className="w-full h-full object-cover object-center mix-blend-overlay opacity-80"
              />
            </motion.div>
            {/* Glassmorphism Badge */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-10 left-10 bg-slate-900/60 backdrop-blur-lg border border-slate-700 p-4 rounded-2xl shadow-2xl max-w-[200px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-cyan-400"><FiStar className="fill-current"/><FiStar className="fill-current"/><FiStar className="fill-current"/><FiStar className="fill-current"/><FiStar className="fill-current"/></div>
              </div>
              <p className="text-white text-xs font-medium leading-relaxed">"The AI visual search saved me hours of browsing!"</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

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
                   onClick={() => navigate(`/product/${product.id}`)}
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
            <Link to="/visual-search" className="bg-cyan-500 text-slate-900 font-bold px-8 py-4 rounded-full hover:bg-cyan-400 transition-colors inline-flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
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