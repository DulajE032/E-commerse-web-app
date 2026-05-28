import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../services/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const location = useLocation();
  const currentPath = location.pathname;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'Contact Us', path: '/contact' }
  ];

  return (
    <>
      <div className="bg-white/100 backdrop-blur-md px-6 pt-4 pb-3 md:px-8 shadow-sm border-b border-gray-100 relative z-50 sticky top-0 transition-all">
        <div className="flex items-center gap-4 md:gap-6 max-w-7xl mx-auto">
          {/* Menu, Logo & Nav Links */}
          <div className="flex items-center gap-6 shrink-0">
             <button 
                className="md:hidden p-1 text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
             >
                <FiMenu className="w-7 h-7" />
             </button>
             <Link to="/" className="flex items-center gap-2 group">
                <img src="/logo.png" alt="peraStore" className="w-9 h-9 object-contain" />
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">peraStore</span>
             </Link>
             <div className="hidden md:flex items-center gap-6 text-base font-bold text-gray-700">
               {navLinks.map((link) => (
                  <Link 
                     key={link.name} 
                     to={link.path} 
                     className={`relative py-1 transition-colors ${currentPath === link.path ? 'text-blue-600' : 'hover:text-blue-500'}`}
                  >
                     {link.name}
                     {currentPath === link.path && (
                       <motion.div layoutId="underline" className="absolute left-0 right-0 bottom-[-4px] h-[3px] bg-blue-600 rounded-t-md" />
                     )}
                  </Link>
               ))}
             </div>
          </div>

          {/* Search Bar - Small (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center">
             <div className="w-full max-w-xs relative group">
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-gray-800 bg-gray-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner group-hover:bg-white group-hover:border-gray-200"
                />
                <FiSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
             </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4 md:gap-6 shrink-0">
             <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-gray-600 border-r border-gray-200 pr-6">
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors">
                   <span>USD</span> <FiChevronDown className="w-4 h-4" />
                </div>
             </div>
             
             <Link to="/cart" className="relative cursor-pointer text-gray-700 hover:text-blue-600 transition-colors group">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <FiShoppingCart className="w-6 h-6" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
             </Link>
             
             <div className="hidden md:flex gap-3 items-center ml-4">
                <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">Log in</Link>
                <Link to="/signup" className="text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg">Sign up</Link>
             </div>
             
             <Link to="/dashboard" className="md:hidden bg-gray-100 p-2 rounded-full text-gray-700 hover:bg-gray-200">
                <FiUser className="w-5 h-5" />
             </Link>
          </div>
        </div>

        {/* Bottom Row: Mobile Search */}
        <div className="mt-4 md:hidden max-w-7xl mx-auto">
           <div className="relative w-full">
              <input 
                 type="text" 
                 placeholder="Search products..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-4 pr-10 py-2.5 rounded-full text-gray-800 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <FiSearch className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
           </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
         className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
         onClick={() => setIsMobileMenuOpen(false)}
      >
         <div 
            className={`fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white shadow-xl z-[70] flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={(e) => e.stopPropagation()}
         >
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
               <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                  <img src="/logo.png" alt="peraStore" className="w-8 h-8 object-contain" />
                  <span className="text-xl font-extrabold text-[#114B43]">peraStore</span>
               </Link>
               <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-red-500 bg-gray-50 rounded-full transition-colors">
                  <FiX className="w-5 h-5" />
               </button>
            </div>
            
            <div className="flex flex-col p-4 gap-2 flex-1 overflow-y-auto">
               <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Navigation</div>
               {navLinks.map((link) => (
                  <Link
                     key={link.name}
                     to={link.path}
                     onClick={() => setIsMobileMenuOpen(false)}
                     className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${currentPath === link.path ? 'bg-orange-50 text-orange-500' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                     {link.name}
                  </Link>
               ))}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50">
               <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl flex justify-center mb-3 hover:bg-gray-100 transition-colors">Log In</Link>
               <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl flex justify-center hover:bg-orange-600 transition-colors shadow-sm">Sign Up</Link>
            </div>
         </div>
      </div>
    </>
  );
};

export default Navbar;
