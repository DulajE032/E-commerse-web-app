import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingCart, FiCreditCard, FiStar, FiChevronRight, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useCart } from '../services/CartContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    api.getProduct(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <Link to="/products" className="text-orange-500 hover:underline">Return to Products</Link>
      </div>
    );
  }

  const images = product.images?.length > 0 
    ? product.images.map(img => `http://127.0.0.1:8000${img}`)
    : ['https://via.placeholder.com/600'];

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8 gap-2 font-medium">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <FiChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-orange-500 transition-colors">Products</Link>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-gray-900 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col lg:flex-row gap-12">
          
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="w-full aspect-square bg-[#F8F9FA] rounded-3xl flex items-center justify-center p-8 overflow-hidden relative"
             >
                <img 
                  src={images[activeImage]} 
                  alt={product.name} 
                  className="w-full h-full object-contain mix-blend-multiply"
                />
                <button className="absolute top-6 right-6 bg-white p-3 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors">
                  <FiHeart className="w-6 h-6" />
                </button>
             </motion.div>
             {images.length > 1 && (
               <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                 {images.map((img, idx) => (
                   <button 
                     key={idx}
                     onClick={() => setActiveImage(idx)}
                     className={`w-24 h-24 shrink-0 rounded-2xl bg-[#F8F9FA] p-2 border-2 transition-colors ${activeImage === idx ? 'border-orange-500' : 'border-transparent hover:border-gray-200'}`}
                   >
                     <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                   </button>
                 ))}
               </div>
             )}
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col">
             <span className="text-orange-500 font-bold uppercase tracking-wider text-sm mb-2 block">{product.category || 'Premium'}</span>
             <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">{product.name}</h1>
             
             <div className="flex items-center gap-4 mb-6">
                <div className="flex text-orange-400">
                  <FiStar className="fill-current w-5 h-5" />
                  <FiStar className="fill-current w-5 h-5" />
                  <FiStar className="fill-current w-5 h-5" />
                  <FiStar className="fill-current w-5 h-5" />
                  <FiStar className="fill-current w-5 h-5" />
                </div>
                <span className="text-gray-500 text-sm font-medium">(128 Reviews)</span>
             </div>

             <div className="text-4xl font-extrabold text-[#114B43] mb-8">
               ${product.price.toFixed(2)}
               <span className="text-base text-gray-400 font-medium line-through ml-3">${(product.price * 1.2).toFixed(2)}</span>
             </div>

             <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-10">
               {product.description || "No description available for this product. Check back later for more details."}
             </p>

             <hr className="border-gray-100 mb-8" />

             {/* Variants & Actions */}
             <div className="space-y-8 flex-1 flex flex-col justify-end">
                
                {/* Quantity */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Quantity</h4>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                        <button 
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          <FiMinus />
                        </button>
                        <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(q => q + 1)}
                          className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          <FiPlus />
                        </button>
                     </div>
                     <span className="text-sm text-gray-500 font-medium text-green-600">In Stock</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-white border-2 border-[#114B43] text-[#114B43] py-4 rounded-xl font-bold text-lg hover:bg-[#114B43] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FiShoppingCart className="w-5 h-5" /> Add to Cart
                  </button>
                  <button 
                    onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                    className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <FiCreditCard className="w-5 h-5" /> Buy Now
                  </button>
                </div>

                {/* Delivery Info */}
                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <FiTruck className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-sm text-gray-900">Free Delivery</h5>
                      <p className="text-xs text-gray-500">Enter your postal code for delivery availability</p>
                    </div>
                  </div>
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
