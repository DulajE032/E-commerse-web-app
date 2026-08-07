"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiTrash2, FiShoppingCart, FiCheck, FiMinus } from 'react-icons/fi';
import { useCompare } from '../services/CompareContext';
import { useCart } from '../services/CartContext';
import { getImageUrl } from '../services/api';

const CompareDrawer = () => {
  const { compareItems, removeFromCompare, clearCompare, isCompareOpen, setIsCompareOpen } = useCompare();
  const { addToCart } = useCart();

  if (!isCompareOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div>
            <h2 className="text-xl font-black">Compare Products</h2>
            <p className="text-xs text-slate-300">Comparing {compareItems.length} of 4 items</p>
          </div>
          <div className="flex items-center gap-3">
            {compareItems.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs font-bold text-slate-300 hover:text-rose-400 flex items-center gap-1"
              >
                <FiTrash2 className="w-4 h-4" /> Clear All
              </button>
            )}
            <button
              onClick={() => setIsCompareOpen(false)}
              className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 p-6 overflow-x-auto overflow-y-auto">
          {compareItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <FiMinus className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No products to compare</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Click the Compare button on product cards to add products for side-by-side spec comparison.
              </p>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${compareItems.length}, minmax(220px, 1fr))` }}>
              {compareItems.map((product) => {
                const price = Number(product.discountPrice ?? product.discount_price ?? product.price);
                const originalPrice = (product.discountPrice || product.discount_price) ? Number(product.price) : null;
                const images = product.images || [];

                return (
                  <div key={product.id} className="border border-gray-200 rounded-2xl p-4 bg-slate-50 flex flex-col justify-between relative group">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white text-slate-400 rounded-full shadow hover:text-rose-500 transition-colors z-10"
                      title="Remove"
                    >
                      <FiX className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden mb-3 p-2">
                        <Image
                          src={getImageUrl(images[0])}
                          alt={product.name}
                          fill
                          className="object-contain p-2 mix-blend-multiply"
                        />
                      </div>

                      <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest block mb-1">
                        {product.category || 'General'}
                      </span>

                      <h4 className="font-bold text-slate-900 text-sm leading-snug mb-2 line-clamp-2">
                        {product.name}
                      </h4>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-black text-slate-900">${price.toFixed(2)}</span>
                        {originalPrice && (
                          <span className="text-xs text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Feature Checklist */}
                      <div className="space-y-2 text-xs border-t border-gray-200 pt-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">Brand:</span>
                          <span className="font-bold text-slate-800">{product.brand || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">Rating:</span>
                          <span className="font-bold text-slate-800">{product.rating ? `${product.rating} ★` : 'New'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">Stock:</span>
                          <span className={`font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">Shipping:</span>
                          <span className="font-bold text-slate-800">
                            {product.freeShipping || product.free_shipping ? 'Free' : 'Standard'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors disabled:opacity-50"
                    >
                      <FiShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-slate-50 flex justify-end">
          <button
            onClick={() => setIsCompareOpen(false)}
            className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareDrawer;
