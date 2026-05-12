import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiChevronDown, FiSliders, FiMail, FiMapPin, FiSend, FiCreditCard, FiMenu, FiX } from 'react-icons/fi';

const DUMMY_PRODUCTS = [
  { id: 1, name: 'Italian Avocado', shop: '(Local shop)', weight: '500 gm.', price: '14.99', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=60' },
  { id: 2, name: 'Cold drinks (Sprite)', shop: '(Grocery)', weight: '500 ml.', price: '06.99', img: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&auto=format&fit=crop&q=60' },
  { id: 3, name: 'Beetroot', shop: '(Local shop)', weight: '500 gm.', price: '17.99', img: 'https://images.unsplash.com/photo-1593259037207-1c39050d27ad?w=500&auto=format&fit=crop&q=60' },
  { id: 4, name: 'Szam amm', shop: '(Process food)', weight: '500 gm.', price: '13.99', img: 'https://images.unsplash.com/photo-1582284540020-8ac90f4b1da9?w=500&auto=format&fit=crop&q=60' },
  { id: 5, name: 'Beef Mixed', shop: '(Cut Bone)', weight: '500 gm.', price: '12.99', img: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=500&auto=format&fit=crop&q=60' },
  { id: 6, name: 'Fresh Carrots', shop: '(Farm direct)', weight: '1 kg.', price: '08.50', img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60' },
  { id: 7, name: 'Whole Wheat Bread', shop: '(Bakery)', weight: '1 loaf', price: '04.99', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60' },
  { id: 8, name: 'Organic Honey', shop: '(Local shop)', weight: '250 gm.', price: '15.00', img: 'https://images.unsplash.com/photo-1587049352847-4d4b12608298?w=500&auto=format&fit=crop&q=60' },
  { id: 9, name: 'Cherry Tomatoes', shop: '(Farm direct)', weight: '250 gm.', price: '05.99', img: 'https://images.unsplash.com/photo-1506484381205-f7945653044d?w=500&auto=format&fit=crop&q=60' },
  { id: 10, name: 'Almond Milk', shop: '(Dairy shop)', weight: '1 L.', price: '07.50', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60' },
];

const footerLinks = [
  { title: "QUICK LINKS", links: ["Home", "Shop All", "New Arrivals", "Best Sellers"] },
  { title: "CUSTOMER SUPPORT", links: ["Order Tracking", "Shipping Policy", "Returns & Exchanges", "FAQ"] },
];

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    { name: 'Top Sales', path: '/top-sales' },
    { name: 'Contact Us', path: '/contact' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Top Navbar Header */}
      <div className="bg-white px-4 pt-4 pb-3 md:px-8 shadow-sm relative z-50">
        
        {/* Top Row: Logo, Search, Actions */}
        <div className="flex items-center justify-between gap-4 md:gap-8">
          
          {/* Menu & Logo */}
          <div className="flex items-center gap-3 shrink-0">
             <button 
                className="md:hidden p-1 text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
             >
                <FiMenu className="w-7 h-7" />
             </button>
             <Link to="/" className="flex items-center gap-2 group">
                <FiShoppingCart className="w-8 h-8 text-orange-500 group-hover:text-orange-400 transition-colors" />
                <span className="text-2xl font-extrabold text-[#114B43] tracking-tight hidden sm:block">peraStore</span>
             </Link>
          </div>

          {/* Search Bar - Center (Desktop) */}
          <div className="flex-1 max-w-2xl relative hidden md:block">
             <input 
               type="text" 
               placeholder="Search for Grocery, Stores, Vegetable or Meat..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-5 pr-12 py-2.5 rounded-full text-gray-800 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all"
             />
             <FiSearch className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-orange-500" />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4 md:gap-6 shrink-0">
             
             {/* Currency & Language (Hidden on small screens) */}
             <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-gray-600 border-r border-gray-200 pr-6">
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-orange-500 transition-colors">
                   <span>USD</span> <FiChevronDown className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-orange-500 transition-colors">
                   <span>ENG</span> <FiChevronDown className="w-4 h-4" />
                </div>
             </div>
             
             {/* Cart */}
             <div className="relative cursor-pointer text-gray-700 hover:text-orange-500 transition-colors">
                <FiShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">2</span>
             </div>
             
             {/* Auth */}
             <div className="hidden md:flex gap-3 items-center ml-2">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">Log in</Link>
                <Link to="/signup" className="text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 px-5 py-2 rounded-full transition-colors shadow-sm">Sign up</Link>
             </div>
             
             {/* Mobile User Icon */}
             <Link to="/login" className="md:hidden bg-gray-100 p-2 rounded-full text-gray-700 hover:bg-gray-200">
                <FiUser className="w-5 h-5" />
             </Link>
          </div>
        </div>

        {/* Bottom Row: Navigation Links & Mobile Search */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
           {/* Mobile Search Bar */}
           <div className="md:hidden relative w-full">
              <input 
                 type="text" 
                 placeholder="Search products..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-4 pr-10 py-2.5 rounded-full text-gray-800 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <FiSearch className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
           </div>

           {/* Navigation Links (Desktop) */}
           <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-1000">
              {navLinks.map((link) => (
                 <Link 
                    key={link.name} 
                    to={link.path} 
                    className={`${currentPath === link.path ? 'text-orange-500 border-b-2 border-orange-500' : 'hover:text-orange-500'} transition-colors pb-1`}
                 >
                    {link.name}
                 </Link>
              ))}
           </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
         className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
         onClick={() => setIsMobileMenuOpen(false)}
      >
         {/* Slide-out Menu */}
         <div 
            className={`fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white shadow-xl z-[70] flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={(e) => e.stopPropagation()}
         >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
               <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                  <FiShoppingCart className="w-7 h-7 text-orange-500" />
                  <span className="text-xl font-extrabold text-[#114B43]">peraStore</span>
               </Link>
               <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-red-500 bg-gray-50 rounded-full transition-colors">
                  <FiX className="w-5 h-5" />
               </button>
            </div>
            
            {/* Links */}
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
               
               <div className="mt-6 mb-2 border-t border-gray-100 pt-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Settings</div>
               <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl mb-2">
                  <span className="font-semibold text-gray-700">Currency</span>
                  <div className="flex items-center gap-1 text-orange-500 font-bold text-sm cursor-pointer">
                     USD <FiChevronDown className="w-4 h-4" />
                  </div>
               </div>
               <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-700">Language</span>
                  <div className="flex items-center gap-1 text-orange-500 font-bold text-sm cursor-pointer">
                     ENG <FiChevronDown className="w-4 h-4" />
                  </div>
               </div>
            </div>
            
            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
               <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl flex justify-center mb-3 hover:bg-gray-100 transition-colors">Log In</Link>
               <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl flex justify-center hover:bg-orange-600 transition-colors shadow-sm">Sign Up</Link>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
          
          {/* Main Hero Banner */}
          <div className="rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row relative">
              {/* Left Side (Red CTA) */}
              <div className="bg-[#8A2F2D] text-white p-10 md:p-16 flex-1 flex flex-col justify-center relative z-10 md:rounded-r-[40px]">
                 <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                    GET 10% CASHBACK <br/> ON SHOPPING $150
                 </h1>
                 <p className="text-red-100 text-sm md:text-base max-w-md mb-8 leading-relaxed">
                    Shopping is a bit of a relaxing hobby for me, which is sometimes troubling for the bank balance. But with our Visual Search AI, find exactly what you want instantly.
                 </p>
                 <div className="flex gap-4 flex-wrap">
                    <Link to="/dashboard" className="bg-[#FFB84D] text-[#8A2F2D] font-bold px-8 py-3 rounded-full hover:bg-[#ffaa2b] transition-transform hover:scale-105 shadow-md">
                       Keep Exploring
                    </Link>
                    <Link to="/login" className="bg-transparent border-2 border-white/30 text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-colors shadow-sm flex items-center gap-2">
                       <FiSearch className="w-4 h-4" /> Visual Search
                    </Link>
                 </div>
              </div>
              
              {/* Right Side (Image / Spices) */}
              <div className="flex-1 bg-[#F7D2B6] min-h-[250px] relative hidden md:block group overflow-hidden">
                 <img 
                    src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop" 
                    alt="Spices and Lentils" 
                    className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-700"
                 />
              </div>
          </div>

          {/* Filtering Section Wrapper */}
          <div className="mt-12 space-y-6">
            

             {/* Pill Filters */}
             <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button className="flex items-center gap-1.5 bg-[#114B43] text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                   All Categories <FiChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-1.5 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm">
                   Price <FiChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-1.5 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm">
                   Review <FiChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-1.5 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm">
                   Color <FiChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-1.5 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm">
                   Material <FiChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-1.5 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm hidden sm:flex">
                   Offer <FiChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-1.5 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm">
                   All Filters <FiSliders className="w-4 h-4 ml-1" />
                </button>

                <div className="flex-1 min-w-[20px]"></div>

                {/* Sort By Dropdown */}
                <button className="flex items-center gap-1.5 bg-white text-gray-700 border border-gray-300 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm">
                   Sort by <FiChevronDown className="w-4 h-4" />
                </button>
             </div>
          </div>

          {/* Product Grid */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
             {DUMMY_PRODUCTS.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full">
                    {/* Image Box */}
                    <div className="relative w-full aspect-square rounded-xl bg-gray-50 mb-4 overflow-hidden flex items-center justify-center p-4">
                       <img 
                          src={product.img} 
                          alt={product.name} 
                          className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Hover Overlay overlay for "View Match" */}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                          <span className="bg-white text-[#114B43] px-3 py-1.5 rounded-full text-xs font-bold shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all">View Detail</span>
                       </div>
                    </div>

                    {/* Product Details */}
                    <div className="text-center flex-1 flex flex-col">
                       <h3 className="text-gray-900 font-bold text-sm md:text-base leading-tight mb-1">{product.name}</h3>
                       <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">{product.shop}</p>
                       <p className="text-gray-400 text-xs mb-3 flex-1">{product.weight}</p>
                       
                       <div className="mt-auto">
                          <span className="text-xl md:text-2xl font-extrabold text-[#114B43] tracking-tighter">
                             <span className="text-sm align-super">$</span>{product.price}
                          </span>
                       </div>
                    </div>
                </div>
             ))}
          </div>

      </div>

      {/* Professional Multi-Column Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Main 4 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Column 1: Brand & About */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-white">
                <FiShoppingCart className="w-8 h-8 text-orange-400" />
                <span className="text-2xl font-bold">peraStore</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Experience the next generation of e-commerce. Upload an image, let our Visual Search AI find the perfect match instantly. Shopping, smarter.
              </p>
              <div className="flex gap-4">
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-orange-500 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
                </a>
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-orange-500 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-orange-500 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.27c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.76-1.75 1.76zm13.5 12.27h-3v-5.6c0-3.36-4-3.11-4 0v5.6h-3v-11h3v1.76c1.39-2.58 7-2.78 7 2.47v6.77z"/></svg>
                </a>
              </div>
            </div>

            {/* Columns 2 & 3: Quick Links & Support (Mapped from array) */}
            {footerLinks.map((section, idx) => (
              <div key={idx}>
                <h4 className="text-white font-bold tracking-wider mb-6">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link to="/" className="text-sm hover:text-orange-400 transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Column 4: Newsletter & Contact */}
            <div>
              <h4 className="text-white font-bold tracking-wider mb-6">STAY CONNECTED</h4>
              <p className="text-sm text-slate-400 mb-4">Subscribe to get AI-curated deals directly to your inbox.</p>
              
              <div className="flex mb-6 relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-slate-800 text-white text-sm rounded-l-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                <button className="bg-orange-500 hover:bg-orange-600 px-4 rounded-r-lg transition-colors flex items-center justify-center">
                  <FiSend className="w-4 h-4 text-white" />
                </button>
              </div>

              <ul className="space-y-3">
                 <li className="flex items-start gap-3 text-sm text-slate-400">
                    <FiMapPin className="w-5 h-5 shrink-0 text-slate-500" />
                    <span>123 Innovation Drive,<br/>Tech City, TC 90210</span>
                 </li>
                 <li className="flex items-center gap-3 text-sm text-slate-400">
                    <FiMail className="w-5 h-5 shrink-0 text-slate-500" />
                    <a href="mailto:support@perastore.com" className="hover:text-orange-400 transition-colors">support@perastore.com</a>
                 </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Payments */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
             <p className="text-sm text-slate-500 text-center md:text-left">
               &copy; {new Date().getFullYear()} peraStore. All rights reserved.
             </p>
             
             {/* Payment Icons */}
             <div className="flex items-center gap-3 text-slate-500">
                <FiCreditCard className="w-8 h-8" />
                <span className="text-xs font-bold border border-slate-700 px-2 py-1 rounded">VISA</span>
                <span className="text-xs font-bold border border-slate-700 px-2 py-1 rounded">MASTERCARD</span>
                <span className="text-xs font-bold border border-slate-700 px-2 py-1 rounded">PAYPAL</span>
             </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;