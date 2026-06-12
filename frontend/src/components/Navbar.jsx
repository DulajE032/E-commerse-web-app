"use client";
import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiSearch, FiShoppingCart, FiUser, FiChevronDown, 
  FiMenu, FiX, FiHeart, FiLogOut, FiLayout
} from 'react-icons/fi';
import { useCart } from '../services/CartContext';
import { useWishlist } from '../services/WishlistContext';
import { useAuth } from '../services/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const location = usePathname();
  const currentPath = location.pathname;

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const userInitials = useMemo(() => {
    if (!user) return 'U';
    const base = user.full_name || user.email || 'User';
    const parts = base.trim().split(' ').filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [user]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
   
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]' : ''}`}>
        {/* Top Announcement Bar */}
        <AnimatePresence>
          {isAnnouncementVisible && (
            <motion.div 
              initial={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-900 text-white text-xs py-2 px-4 flex justify-center items-center relative overflow-hidden"
            >
              <p className="font-medium tracking-wide">
                <span className="font-bold text-orange-400 mr-2">FREE SHIPPING</span> 
                on all orders over $150. Shop the Summer Collection now!
              </p>
              <button 
                onClick={() => setIsAnnouncementVisible(false)}
                className="absolute right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close announcement"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Navbar */}
        <div className={`bg-white/95 backdrop-blur-md transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'} border-b border-gray-100 px-4 md:px-8`}>
          <div className="flex items-center justify-between max-w-7xl mx-auto gap-4 md:gap-8">
            
            {/* Left: Mobile Menu Toggle & Logo */}
            <div className="flex items-center gap-4 lg:w-[250px] shrink-0">
               <button 
                  className="lg:hidden p-2 -ml-2 text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open Menu"
               >
                  <FiMenu className="w-6 h-6" />
               </button>
               <Link href="/" className="flex items-center gap-2.5 group">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain invert brightness-0" />
                  </div>
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block group-hover:text-blue-600 transition-colors">
                    peraStore
                  </span>
               </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 text-[15px] font-semibold text-slate-600">
              {navLinks.map((link) => (
                <Link key={link.name} 
                  href={link.path} 
                  className={`relative py-2 group transition-colors hover:text-slate-900 ${currentPath === link.path ? 'text-slate-900' : ''}`}
                >
                  {link.name}
                  {/* Hover Underline */}
                  <span className={`absolute left-0 bottom-0 w-full h-[2px] bg-slate-900 origin-left transition-transform duration-300 ease-out ${currentPath === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </Link>
              ))}
            </nav>

            {/* Right: Search, Actions, Profile */}
            <div className="flex items-center gap-3 md:gap-5 justify-end lg:flex-1">
               
               {/* Desktop Search */}
               <div className="hidden xl:block relative w-[300px] group">
                  <input 
                    type="text" 
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm text-slate-800 bg-slate-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder-slate-400"
                  />
                  <FiSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
               </div>

               {/* Mobile Search Icon (triggers expansion or modal in a full implementation, for now just an icon) */}
               <button className="xl:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                 <FiSearch className="w-5 h-5" />
               </button>

               <div className="h-6 w-px bg-gray-200 hidden md:block mx-1"></div>

               {/* Action Icons */}
               <div className="flex items-center gap-1 sm:gap-2">
                 <Link href="/wishlist" className="relative p-2 text-slate-700 hover:bg-pink-50 hover:text-pink-600 rounded-full transition-colors group">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <FiHeart className="w-5 h-5 sm:w-6 sm:h-6" />
                      <AnimatePresence>
                        {wishlistCount > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="absolute top-1 right-1 translate-x-1/4 -translate-y-1/4 bg-pink-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                          >
                            {wishlistCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                 </Link>

                 <Link href="/cart" className="relative p-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors group">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <FiShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                      <AnimatePresence>
                        {cartCount > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="absolute top-1 right-1 translate-x-1/4 -translate-y-1/4 bg-blue-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                          >
                            {cartCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                 </Link>
               </div>

               {/* User Profile / Auth */}
               {isAuthenticated ? (
                 <div className="relative hidden sm:block ml-2">
                   <button
                     onClick={() => setIsProfileOpen((prev) => !prev)}
                     className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900"
                   >
                     <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                       {userInitials}
                     </div>
                     <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate hidden md:block">
                       {user?.full_name?.split(' ')[0] || 'User'}
                     </span>
                     <FiChevronDown className="w-4 h-4 text-slate-500" />
                   </button>
                   
                   {/* Dropdown Menu */}
                   <AnimatePresence>
                     {isProfileOpen && (
                       <>
                         <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                         <motion.div
                           initial={{ opacity: 0, y: 10, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, y: 10, scale: 0.95 }}
                           transition={{ duration: 0.2 }}
                           className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden z-50 py-2 origin-top-right"
                         >
                           <div className="px-5 py-4 border-b border-gray-100 bg-slate-50/50">
                             <p className="text-sm font-bold text-slate-900 truncate">
                               {user?.full_name || 'My Account'}
                             </p>
                             <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                           </div>
                           <div className="py-2 px-3">
                             <Link href="/dashboard"
                               onClick={() => setIsProfileOpen(false)}
                               className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                             >
                               <FiLayout className="w-4 h-4 text-slate-400" /> Dashboard
                             </Link>
                             <button
                               onClick={() => { logout(); setIsProfileOpen(false); }}
                               className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
                             >
                               <FiLogOut className="w-4 h-4" /> Log out
                             </button>
                           </div>
                         </motion.div>
                       </>
                     )}
                   </AnimatePresence>
                 </div>
               ) : (
                 <div className="hidden sm:flex items-center gap-3 ml-2">
                   <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">Log In</Link>
                   <Link href="/signup" className="text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">Sign Up</Link>
                 </div>
               )}

               {/* Mobile User Icon Fallback (when not authenticated and on very small screens where Auth buttons hide) */}
               {!isAuthenticated && (
                 <Link href="/login" className="sm:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-full">
                   <FiUser className="w-5 h-5 sm:w-6 sm:h-6" />
                 </Link>
               )}
            </div>
          </div>
        </div>
      </header>

      {/* Modern Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-2xl z-[70] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-slate-50/50">
                 <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                      <img src="/logo.png" alt="Logo" className="w-4 h-4 object-contain invert brightness-0" />
                    </div>
                    <span className="text-xl font-extrabold text-slate-900">peraStore</span>
                 </Link>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                    <FiX className="w-5 h-5" />
                 </button>
              </div>
              
              {/* Mobile Search */}
              <div className="p-5 border-b border-gray-100">
                <div className="relative w-full">
                  <input 
                     type="text" 
                     placeholder="Search..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-800 bg-slate-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                  <FiSearch className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Drawer Navigation */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                 {navLinks.map((link) => (
                    <Link key={link.name}
                       href={link.path}
                       onClick={() => setIsMobileMenuOpen(false)}
                       className={`block px-4 py-3 rounded-xl text-[15px] font-bold transition-colors ${currentPath === link.path ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                       {link.name}
                    </Link>
                 ))}
              </nav>
              
              {/* Drawer Footer / Auth */}
              <div className="p-5 border-t border-gray-100 bg-slate-50">
                 {isAuthenticated ? (
                   <div>
                     <div className="flex items-center gap-3 mb-5 px-2">
                       <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                         {userInitials}
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-base font-bold text-slate-900 truncate">
                           {user?.full_name || 'My Account'}
                         </p>
                         <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                       </div>
                     </div>
                     <div className="space-y-2">
                       <Link href="/dashboard"
                         onClick={() => setIsMobileMenuOpen(false)}
                         className="w-full bg-white border border-gray-200 text-slate-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                       >
                         <FiLayout className="w-4 h-4" /> Dashboard
                       </Link>
                       <button
                         onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                         className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
                       >
                         <FiLogOut className="w-4 h-4" /> Log out
                       </button>
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-white border border-gray-200 text-slate-800 font-bold py-3.5 rounded-xl flex justify-center hover:bg-slate-50 transition-colors shadow-sm">
                       Log In
                     </Link>
                     <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl flex justify-center hover:bg-slate-800 transition-colors shadow-md">
                       Create Account
                     </Link>
                   </div>
                 )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
