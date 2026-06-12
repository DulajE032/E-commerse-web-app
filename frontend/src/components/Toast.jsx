"use client";
import React from 'react';
import { useCart } from '../services/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiX } from 'react-icons/fi';

const Toast = () => {
  const { toastMessage, setToastMessage } = useCart();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 right-6 z-[100] bg-white text-gray-800 shadow-2xl rounded-xl px-5 py-4 border border-gray-100 flex items-center gap-4 min-w-[280px]"
        >
          <div className="bg-green-100 text-green-600 rounded-full p-1">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <p className="font-semibold text-sm flex-1">{toastMessage}</p>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
