"use client";
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/Loader';

const AddProduct = () => {
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
   name: '',
   description: '',
   price: '',
   category: '',
   brand: '',
   stock: '',
 });
 
  useEffect(() => {
    api.getCategories()
      .then(data => {
        // Handle array response or object response depending on backend structure
        setCategories(Array.isArray(data) ? data : (data.categories || []));
      })
      .catch(console.error);
  }, []);
  
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFileType(file.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');
    

    try {
      let imageUrls = [];
      let videoUrls = [];

      // 1. Upload the media if selected
      if (imageFile) {
        // Using the same upload endpoint for both images and videos (we will update backend)
        const uploadData = await api.uploadImage(imageFile, token);
        if (fileType === 'video') {
            videoUrls.push(uploadData.url);
        } else {
            imageUrls.push(uploadData.url);
        }
      }

      // 2. Submit the product data
      const productPayload = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          category: formData.category,
          brand: formData.brand,
          stock: parseInt(formData.stock, 10) || 0,
          images: imageUrls,
          videos: videoUrls,
        };

      await api.createProduct(productPayload,token);

      setMessage('Product created successfully!');
      // Reset form
      setFormData({ name: '', description: '', price: '', category: '', brand: '', stock: '' });
      setImageFile(null);
      setImagePreview(null);
      setFileType(null);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }

  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {message}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Image Upload */}
        <div className="w-full md:w-1/3">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
            <h3 className="font-semibold mb-4 text-gray-300">Product Media (Image/Video)</h3>
            <label className="border-2 border-dashed border-gray-600 rounded-lg h-64 flex flex-col items-center justify-center text-gray-500 hover:text-gray-400 hover:border-gray-500 cursor-pointer transition relative overflow-hidden">
              {imagePreview ? (
                fileType === 'video' ? (
                  <video src={imagePreview} className="absolute inset-0 w-full h-full object-cover" controls muted />
                ) : (
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                )
              ) : (
                <span>Click to Upload Image or Video</span>
              )}
              <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        {/* Right Side: Form Details */}
        <div className="w-full md:w-2/3">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md space-y-4">
            <h3 className="font-semibold text-gray-300 mb-2">Product Details</h3>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Product Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500" placeholder="Enter product name" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500 h-24" placeholder="Enter description"></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Price ($)</label>
                <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <input 
                  list="categories-list" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-blue-500" 
                  placeholder="Select or type a new category"
                  autoComplete="off"
                />
                <datalist id="categories-list">
                  {categories.map((cat, idx) => (
                    <option key={cat.id || idx} value={cat.name} />
                  ))}
                </datalist>
              </div>
            </div>

            <button type="submit" disabled={loading} className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded transition">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader size={16} dotSize={6} border={3} />
                  Saving...
                </span>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddProduct;
