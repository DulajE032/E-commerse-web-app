"use client";
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { FiImage, FiSearch, FiSend, FiX, FiUser } from 'react-icons/fi';
import { api } from '../services/api';
import Loader from '../components/Loader';

const BACKEND_BASE = 'http://127.0.0.1:8000';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400';

const VisualSearchPage = () => {
  const [query, setQuery] = useState('');
  const [file, setFile] = useState(null);
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const normalizedTopK = useMemo(() => Math.max(1, Math.min(20, Number(topK) || 5)), [topK]);

  const getImageUrl = (product) => {
    if (!product?.images?.length) return PLACEHOLDER_IMAGE;
    const img = product.images[0];
    return img.startsWith('http') ? img : `${BACKEND_BASE}${img}`;
  };

  const hydrateResults = async (rawResults) => {
    if (!Array.isArray(rawResults) || rawResults.length === 0) return [];
    if (rawResults[0]?.error) {
      throw new Error(rawResults[0].error);
    }

    const ids = [...new Set(rawResults.map((r) => r.product_id))];
    const detailMap = new Map();

    await Promise.all(
      ids.map(async (id) => {
        try {
          const detail = await api.getProduct(id);
          detailMap.set(id, detail);
        } catch {
          detailMap.set(id, null);
        }
      })
    );

    return rawResults.map((result) => ({
      ...result,
      product: detailMap.get(result.product_id),
    }));
  };

  const handleTextSearch = async (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Enter a search query.');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(false);
    try {
      const raw = await api.searchByText(trimmed, normalizedTopK);
      const hydrated = await hydrateResults(raw);
      setResults(hydrated);
    } catch (err) {
      setError(err.message || 'Search failed.');
      setResults([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleImageSearch = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Choose an image to search.');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(false);
    try {
      const raw = await api.searchByImage(file, normalizedTopK);
      const hydrated = await hydrateResults(raw);
      setResults(hydrated);
    } catch (err) {
      setError(err.message || 'Image search failed.');
      setResults([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (file) {
      handleImageSearch(event);
    } else {
      handleTextSearch(event);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] flex flex-col pt-4">
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 flex flex-col relative pb-32">
        
        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
          {/* Default Welcome Message */}
          <div className="flex items-start gap-3 md:gap-4 mb-6 text-sm md:text-base">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex flex-shrink-0 items-center justify-center text-white font-bold shadow-md">
              AI
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none p-4 md:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 max-w-[85%] text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900 mb-1">Hello! I am your AI personal shopper.</p>
              You can type what you're looking for or upload an image to find similar products. 
            </div>
          </div>

          {/* User Prompt (if searched) */}
          {(results.length > 0 || loading || error) && (query || file) && (
            <div className="flex items-start gap-3 md:gap-4 mb-6 flex-row-reverse text-sm md:text-base mt-2">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex flex-shrink-0 items-center justify-center text-white shadow-md">
                <FiUser className="w-5 h-5" />
              </div>
              <div className="bg-slate-900 text-white rounded-2xl rounded-tr-none p-4 md:p-5 shadow-sm max-w-[85%] break-words">
                {file && !query ? (
                   <span className="flex items-center gap-2 font-medium">
                     <FiImage /> Image Search Request
                   </span>
                ) : (
                   query
                )}
              </div>
            </div>
          )}

          {/* Error Message Bubble */}
          {error && (
            <div className="flex items-start gap-3 md:gap-4 mb-6 text-sm md:text-base mt-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex flex-shrink-0 items-center justify-center text-white font-bold shadow-md">
                AI
              </div>
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl rounded-tl-none p-4 md:p-5 shadow-sm max-w-[85%]">
                {error}
              </div>
            </div>
          )}

          {/* Loading Bubble */}
          {loading && (
            <div className="flex items-start gap-3 md:gap-4 mb-6 text-sm md:text-base mt-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex flex-shrink-0 items-center justify-center text-white font-bold shadow-md">
                AI
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none py-6 px-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-center min-w-[120px]">
                <Loader size={40} dotSize={10} border={4} />
              </div>
            </div>
          )}

          {/* Results Bubble */}
          {results.length > 0 && !loading && !error && (
            <div className="flex items-start gap-3 md:gap-4 mb-10 text-sm md:text-base mt-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex flex-shrink-0 items-center justify-center text-white font-bold shadow-md">
                AI
              </div>
              <div className="w-full">
                <div className="bg-white rounded-2xl rounded-tl-none p-4 md:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 max-w-[85%] text-slate-700 mb-6 font-medium inline-block">
                  Here is what I found for you:
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 lg:pr-12">
                  {results.map((result, index) => {
                    const product = result.product;
                    const imageUrl = getImageUrl(product);
                    const name = product?.name || result.name || 'Unnamed product';
                    const price = product?.price ?? result.price ?? 0;
                    const score = typeof result.similarity_score === 'number'
                      ? `${(result.similarity_score * 100).toFixed(1)}%`
                      : 'N/A';

                    return (
                      <div
                        key={`${result.product_id}-${index}`}
                        className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col h-full"
                      >
                        <Link href={`/product/${result.product_id}`} className="block flex-1 flex flex-col">
                          <div className="w-full aspect-[4/3] bg-slate-50 flex items-center justify-center p-6 group-hover:bg-slate-100 transition-colors">
                            <img src={imageUrl} alt={name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1.5 flex justify-between">
                              <span>Match</span>
                              <span>{score}</span>
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{name}</h3>
                            <div className="mt-auto pt-3">
                              <span className="text-lg font-black text-slate-900">
                                ${Number(price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* No Results Message */}
          {hasSearched && results.length === 0 && !loading && !error && (
            <div className="flex items-start gap-3 md:gap-4 mb-6 text-sm md:text-base mt-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex flex-shrink-0 items-center justify-center text-white font-bold shadow-md">
                AI
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-4 md:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 max-w-[85%] text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900 mb-1">No matching products found</p>
                Sorry, I couldn't find any products similar to your search. Try describing a product we carry, or upload a photo of something in our catalog.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Input Floating Box */}
      <div className="fixed bottom-0 left-0 right-0 bg-white md:bg-transparent border-t border-gray-200 md:border-none p-3 md:p-6 md:pb-8 z-20">
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative bg-white border border-gray-200 md:border-gray-300 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center px-2 py-2">
          
          {/* File Attachment Preview */}
          {file && (
            <div className="absolute -top-12 md:-top-14 left-4 flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold shadow-sm border border-blue-100">
              <FiImage className="w-4 h-4" /> 
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button type="button" onClick={() => setFile(null)} className="ml-1 text-slate-400 hover:text-red-500 transition-colors">
                 <FiX className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Image Upload Button */}
          <label className="p-2 md:p-3 text-slate-400 hover:text-blue-600 cursor-pointer rounded-full hover:bg-slate-50 transition-colors flex-shrink-0">
            <FiImage className="w-5 h-5 md:w-6 md:h-6" />
            <input type="file" className="hidden" accept="image/*" onChange={e => {
                setFile(e.target.files?.[0] || null);
                setQuery('');
            }} />
          </label>
          
          {/* Text Input */}
          <input 
            type="text"
            value={query}
            onChange={e => {
               setQuery(e.target.value);
               if (file) setFile(null);
            }}
            placeholder={file ? 'Image selected. Press send to search.' : 'Type to search for products (e.g. "red shoes")'}
            disabled={!!file}
            className="flex-1 bg-transparent px-2 md:px-4 py-2 outline-none text-slate-700 disabled:opacity-40 text-sm md:text-base"
          />

          {/* Top K Control */}
          <div className="hidden md:flex items-center gap-2 px-4 border-l border-gray-200 flex-shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Results</span>
            <input 
               type="number" min="1" max="20" 
               value={topK} 
               onChange={e=>setTopK(e.target.value)} 
               className="w-12 outline-none text-sm font-bold text-slate-700 bg-transparent text-center" 
            />
          </div>

          {/* Send Button */}
          <button 
            type="submit" 
            disabled={!file && !query.trim()} 
            className="bg-blue-600 text-white p-2 md:p-3 rounded-full hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm flex-shrink-0 ml-1 md:ml-2"
          >
             <FiSend className="w-4 h-4 md:w-5 md:h-5" />
          </button>

        </form>
      </div>
    </div>
  );
};

export default VisualSearchPage;
