"use client";
import React from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiMapPin, FiMail, FiSend, FiCreditCard } from 'react-icons/fi';

const Footer = () => {
  const footerLinks = [
    { title: "QUICK LINKS", links: ["Home", "Products", "Categories", "Best Sellers"] },
    { title: "CUSTOMER SUPPORT", links: ["Order Tracking", "Shipping Policy", "Returns & Exchanges", "FAQ"] },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand & About */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white">
              <FiShoppingCart className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold">peraStore</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Experience the next generation of e-commerce. Premium products, seamless shopping experience, and modern aesthetics.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.27c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.76-1.75 1.76zm13.5 12.27h-3v-5.6c0-3.36-4-3.11-4 0v5.6h-3v-11h3v1.76c1.39-2.58 7-2.78 7 2.47v6.77z"/></svg>
              </a>
            </div>
          </div>

          {/* Columns 2 & 3: Quick Links & Support */}
          {footerLinks.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-white font-bold tracking-wider mb-6">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href="/" className="text-sm hover:text-cyan-400 transition-colors">
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
            <p className="text-sm text-slate-400 mb-4">Subscribe to get deals directly to your inbox.</p>
            <div className="flex mb-6 relative">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-slate-800 text-white text-sm rounded-l-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-4 rounded-r-lg transition-colors flex items-center justify-center">
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
                  <a href="mailto:support@perastore.com" className="hover:text-cyan-400 transition-colors">support@perastore.com</a>
               </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-sm text-slate-500 text-center md:text-left">
             &copy; {new Date().getFullYear()} peraStore. All rights reserved.
           </p>
           <div className="flex items-center gap-3 text-slate-500">
              <FiCreditCard className="w-8 h-8" />
              <span className="text-xs font-bold border border-slate-700 px-2 py-1 rounded">VISA</span>
              <span className="text-xs font-bold border border-slate-700 px-2 py-1 rounded">MASTERCARD</span>
              <span className="text-xs font-bold border border-slate-700 px-2 py-1 rounded">PAYPAL</span>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
