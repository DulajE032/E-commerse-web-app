import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white max-w-lg w-full rounded-[2rem] shadow-xl border border-gray-100 p-10 md:p-16 text-center flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
           <FiAlertCircle className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Page Not Found</h2>
        <p className="text-slate-500 text-lg mb-10">
          Oops! The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>
        
        <Link 
          to="/" 
          className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center gap-3 shadow-lg shadow-blue-600/30"
        >
          <FiHome className="w-5 h-5" /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
