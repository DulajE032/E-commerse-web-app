import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingCart, FiCreditCard, FiStar, FiChevronRight, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useCart } from '../services/CartContext';
import { useAuth } from '../services/AuthContext';
import Loader from '../components/Loader';
import { useMinLoadingTime } from '../hooks/useMinLoadingTime';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeMedia, setActiveMedia] = useState({ type: 'image', url: '' });
  
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const { addToCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  
  const showLoader = useMinLoadingTime(loading, 600);

  useEffect(() => {
    setLoading(true);
    // Reset state when ID changes
    setQuantity(1);
    setProduct(null);
    setReviews([]);
    setRelatedProducts([]);

    Promise.all([
      api.getProduct(id),
      api.getProductReviews(id).catch(() => [])
    ])
    .then(([productData, reviewsData]) => {
      setProduct(productData);
      setReviews(reviewsData);
      
      const hasImages = productData.images && productData.images.length > 0;
      const hasVideos = productData.videos && productData.videos.length > 0;
      
      if (hasImages) {
        setActiveMedia({ type: 'image', url: `http://127.0.0.1:8000${productData.images[0]}` });
      } else if (hasVideos) {
        setActiveMedia({ type: 'video', url: `http://127.0.0.1:8000${productData.videos[0]}` });
      } else {
        setActiveMedia({ type: 'image', url: 'https://via.placeholder.com/600' });
      }

      // Fetch related products
      if (productData.category) {
        api.getProducts({ category: productData.category })
          .then(related => {
            setRelatedProducts(related.filter(p => p.id !== parseInt(id)).slice(0, 4));
          })
          .catch(console.error);
      }
    })
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSubmittingReview(true);
    try {
      const newReview = await api.createProductReview(id, reviewForm, token);
      setReviews(prev => [newReview, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      // Refetch product to get updated rating
      const updatedProduct = await api.getProduct(id);
      setProduct(updatedProduct);
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (showLoader) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size={64} dotSize={16} border={8} />
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

  const allMedia = [
    ...(product.videos?.map(v => ({ type: 'video', url: `http://127.0.0.1:8000${v}` })) || []),
    ...(product.images?.map(i => ({ type: 'image', url: `http://127.0.0.1:8000${i}` })) || [])
  ];
  if (allMedia.length === 0) {
    allMedia.push({ type: 'image', url: 'https://via.placeholder.com/600' });
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8 gap-2 font-medium">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <FiChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-orange-500 transition-colors">Products</Link>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-gray-900 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </div>

        {/* Top Section: Media & Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="p-6 md:p-10 flex flex-col lg:flex-row gap-12">
            
            {/* Left: Product Media Gallery */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 key={activeMedia.url}
                 className="w-full aspect-square bg-[#F8F9FA] rounded-3xl flex items-center justify-center p-2 overflow-hidden relative"
               >
                  {activeMedia.type === 'video' ? (
                    <video src={activeMedia.url} controls className="w-full h-full object-contain rounded-2xl" />
                  ) : (
                    <img src={activeMedia.url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                  )}
                  <button className="absolute top-6 right-6 bg-white p-3 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors">
                    <FiHeart className="w-6 h-6" />
                  </button>
               </motion.div>
               {allMedia.length > 1 && (
                 <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                   {allMedia.map((media, idx) => (
                     <button 
                       key={idx}
                       onClick={() => setActiveMedia(media)}
                       className={`w-24 h-24 shrink-0 rounded-2xl bg-[#F8F9FA] p-1 border-2 transition-colors ${activeMedia.url === media.url ? 'border-orange-500' : 'border-transparent hover:border-gray-200'}`}
                     >
                       {media.type === 'video' ? (
                         <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center text-xs font-bold text-gray-500">Video</div>
                       ) : (
                         <img src={media.url} alt="" className="w-full h-full object-contain rounded-xl mix-blend-multiply" />
                       )}
                     </button>
                   ))}
                 </div>
               )}
            </div>

            {/* Right: Product Information */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <span className="text-orange-500 font-bold uppercase tracking-wider text-sm mb-2 block">{product.category || 'General'}</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex text-orange-400">
                      {[1,2,3,4,5].map(i => (
                        <FiStar key={i} className={`w-5 h-5 ${i <= Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm font-medium">({reviews.length} Reviews)</span>
                </div>

                <div className="text-4xl font-extrabold text-[#114B43] mb-8">
                  ${Number(product.price).toFixed(2)}
                </div>

                <hr className="border-gray-100 mb-8" />

                <div className="space-y-8 flex-1 flex flex-col justify-end">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Quantity</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"><FiMinus /></button>
                            <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"><FiPlus /></button>
                        </div>
                        <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={handleAddToCart} disabled={product.stock <= 0} className="flex-1 bg-white border-2 border-[#114B43] text-[#114B43] py-4 rounded-xl font-bold text-lg hover:bg-[#114B43] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                        <FiShoppingCart className="w-5 h-5" /> Add to Cart
                      </button>
                      <button onClick={() => { handleAddToCart(); navigate('/checkout'); }} disabled={product.stock <= 0} className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50">
                        <FiCreditCard className="w-5 h-5" /> Buy Now
                      </button>
                    </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Description, Reviews, Related Products */}
        <div className="flex flex-col gap-12">
          
          {/* Description */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
            <div className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap">
              {product.description || "No description available for this product."}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
            
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Reviews List */}
              <div className="w-full lg:w-2/3 flex flex-col gap-6">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 italic bg-gray-50 p-6 rounded-2xl text-center">No reviews yet. Be the first to review this product!</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
                            {review.user_name ? review.user_name[0] : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{review.user_name}</span>
                            <span className="text-xs text-gray-400 block">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex text-orange-400">
                          {[1,2,3,4,5].map(i => (
                            <FiStar key={i} className={`w-4 h-4 ${i <= review.rating ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed ml-13">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
              
              {/* Add Review Form */}
              <div className="w-full lg:w-1/3">
                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 sticky top-6">
                    <h4 className="font-bold text-gray-800 text-lg border-b border-gray-200 pb-2">Write a Review</h4>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-gray-600">Your Rating</span>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(star => (
                          <button type="button" key={star} onClick={() => setReviewForm({...reviewForm, rating: star})}>
                            <FiStar className={`w-8 h-8 transition-colors ${star <= reviewForm.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-300 hover:text-orange-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-sm font-medium text-gray-600">Your Review</span>
                      <textarea 
                        required
                        value={reviewForm.comment}
                        onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                        placeholder="What did you think about this product?"
                        className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none"
                      />
                    </div>
                    <button type="submit" disabled={submittingReview} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors mt-2 disabled:opacity-50">
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-blue-50 p-6 rounded-2xl text-blue-800 font-medium text-center flex flex-col items-center gap-4 border border-blue-100">
                    <span className="text-lg">Want to share your thoughts?</span>
                    <p className="text-sm text-blue-600">Please log in to leave a review and let others know what you think.</p>
                    <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors w-full">Log In</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map(rel => (
                  <Link to={`/product/${rel.id}`} key={rel.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col">
                    <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-2 relative">
                      {rel.images && rel.images.length > 0 ? (
                        <img src={`http://127.0.0.1:8000${rel.images[0]}`} alt={rel.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">{rel.category}</span>
                      <h3 className="text-gray-900 font-bold mb-1 truncate">{rel.name}</h3>
                      <div className="flex text-orange-400 mb-2">
                        {[1,2,3,4,5].map(i => (
                          <FiStar key={i} className={`w-3 h-3 ${i <= Math.round(rel.rating || 0) ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-[#114B43] font-bold text-lg mt-auto">${Number(rel.price).toFixed(2)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
