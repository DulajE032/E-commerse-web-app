"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api'; // Ensure this path is correct for your project
import Loader from '../../components/Loader'; // Ensure this path is correct for your project
import { useDropzone } from 'react-dropzone';
import CreatableSelect from 'react-select/creatable';
import { FiUploadCloud, FiX } from 'react-icons/fi';

const AddProduct = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [status, setStatus] = useState('Draft'); 

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    brand: '',
    stock: '',
  });

  // Fetch initial categories on load
  // 1. Define your static categories here! You can add as many as you want.
  const staticCategories = [
    { name: 'Electronics' },
    { name: 'Clothing & Apparel' },
    { name: 'Home & Garden' },
    { name: 'Sports & Outdoors' },
    { name: 'Health & Beauty' }
  ];

  // 2. Initialize the state with the static categories immediately
  const [categories, setCategories] = useState(staticCategories);

  useEffect(() => {
    api.getCategories()
      .then(data => {
        const dbCategories = Array.isArray(data) ? data : (data.categories || []);
        
        // 3. Combine the static list with the database list
        const combinedCategories = [...staticCategories, ...dbCategories];
        
        // 4. Filter out duplicates (so "Electronics" doesn't show up twice)
        const uniqueCategories = combinedCategories.filter((val, index, self) =>
          index === self.findIndex((t) => t.name.toLowerCase() === val.name.toLowerCase())
        );
        
        setCategories(uniqueCategories);
      })
      .catch(console.error);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.name,
    label: cat.name
  }));

  const handleCategoryChange = (selectedOption) => {
    setFormData({ ...formData, category: selectedOption ? selectedOption.value : '' });
  };

  // --- THE FIXED CATEGORY CREATOR ---
  const handleCreateCategory = async (inputValue) => {
    setLoading(true); 
    const token = localStorage.getItem('token');

    try {
      // Calls your new FastAPI endpoint (which we will write below!)
      const newCategory = await api.createCategory({ name: inputValue }, token);
      
      // Update local memory
      setCategories((prev) => [...prev, newCategory]);
      setFormData({ ...formData, category: newCategory.name });
    } catch (err) {
      console.error(err);
      setMessage("Error creating new category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- MEDIA DRAG AND DROP ---
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFileType(file.type.startsWith('video/') ? 'video' : 'image');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [], 'video/mp4': [], 'video/webm': [] },
    maxFiles: 1 
  });

  const removeMedia = (e) => {
    e.stopPropagation(); 
    setImageFile(null);
    setImagePreview(null);
    setFileType(null);
  };

  // --- MAIN SUBMIT FUNCTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');

    try {
      let imageUrls = [];
      let videoUrls = [];

      if (imageFile) {
        const uploadData = await api.uploadImage(imageFile, token);
        if (fileType === 'video') {
            videoUrls.push(uploadData.url);
        } else {
            imageUrls.push(uploadData.url);
        }
      }

      const productPayload = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
          category: formData.category,
          brand: formData.brand,
          stock: parseInt(formData.stock, 10) || 0,
          images: imageUrls,
          videos: videoUrls,
          status: status // Sends "Draft" or "Active" to backend
      };

      await api.createProduct(productPayload, token);

      setMessage('Product created successfully!');
      // Reset form
      setFormData({ name: '', description: '', price: '', discountPrice: '', category: '', brand: '', stock: '' });
      setImageFile(null);
      setImagePreview(null);
      setFileType(null);
      setStatus('Draft');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const customSelectStyles = {
    control: (base) => ({ ...base, backgroundColor: '#111827', borderColor: '#374151', color: 'white' }),
    menu: (base) => ({ ...base, backgroundColor: '#111827' }),
    option: (base, { isFocused }) => ({ ...base, backgroundColor: isFocused ? '#2563EB' : 'transparent', color: 'white', cursor: 'pointer' }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    input: (base) => ({ ...base, color: 'white' }),
  };

  return (
    <form onSubmit={handleSubmit} className="text-gray-200">
      <h2 className="text-3xl font-bold mb-8 text-white">Add New Product</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg font-medium ${message.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-white">Basic Details</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Product Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Enter product name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-32 resize-none" placeholder="Enter full product description..."></textarea>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-white">Product Media</h3>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${
                isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
              }`}
            >
              <input {...getInputProps()} />
              {imagePreview ? (
                <>
                  {fileType === 'video' ? (
                    <video src={imagePreview} className="absolute inset-0 w-full h-full object-cover" controls muted />
                  ) : (
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <button type="button" onClick={removeMedia} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg z-10">
                    <FiX className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <FiUploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-300 font-medium">
                    {isDragActive ? "Drop media here..." : "Drag & drop image/video, or click to browse"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, MP4, WEBM</p>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="space-y-8">
          
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-white">Organization</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                <CreatableSelect
                  isClearable
                  options={categoryOptions}
                  value={categoryOptions.find(c => c.value === formData.category) || null}
                  onChange={handleCategoryChange}
                  onCreateOption={handleCreateCategory} 
                  styles={customSelectStyles}
                  placeholder="Select or type..."
                  isDisabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Brand</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Nike, Apple" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 appearance-none">
                  <option value="Draft">Draft (Hidden)</option>
                  <option value="Active">Active (Published)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-white">Pricing</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price ($)</label>
                <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Discount Price ($) <span className="text-gray-500 font-normal">— optional</span></label>
                <input type="number" step="0.01" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" placeholder="Leave empty for no discount" />
                {formData.discountPrice && formData.price && parseFloat(formData.discountPrice) < parseFloat(formData.price) && (
                  <p className="text-green-400 text-xs mt-2 font-medium">
                    💰 {Math.round(((parseFloat(formData.price) - parseFloat(formData.discountPrice)) / parseFloat(formData.price)) * 100)}% discount will be shown to customers
                  </p>
                )}
                {formData.discountPrice && formData.price && parseFloat(formData.discountPrice) >= parseFloat(formData.price) && (
                  <p className="text-red-400 text-xs mt-2 font-medium">
                    ⚠️ Discount price must be lower than the regular price
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Stock Quantity</label>
                <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" placeholder="0" />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg flex items-center gap-2">
          {loading ? (
            <>
              <Loader size={18} dotSize={6} border={3} />
              Saving Product...
            </>
          ) : (
            'Save Product'
          )}
        </button>
      </div>

    </form>
  );
};

export default AddProduct;