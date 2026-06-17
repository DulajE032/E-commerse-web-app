"use client";
import React, { useState, useEffect } from 'react';
import { api, IMAGE_BASE_URL } from '../../services/api';
import Loader from '../../components/Loader';
import { FiPlus, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [newName, setNewName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName) return;

    setFormLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');

    try {
      let imageUrl = '';
      if (imageFile) {
        const uploadRes = await api.uploadImage(imageFile, token);
        imageUrl = uploadRes.url;
      }

      await api.createCategory({ name: newName, image: imageUrl }, token);
      setMessage('Category added successfully!');
      setNewName('');
      setImageFile(null);
      setImagePreview(null);
      fetchCategories();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await api.deleteCategory(id, token);
      fetchCategories();
    } catch (err) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  return (
    <div className="text-gray-200">
      <h2 className="text-3xl font-bold mb-8 text-white">Manage Categories</h2>

      {message && (
        <div className={`p-4 mb-6 rounded-lg font-medium ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add New Category */}
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-sm h-fit">
          <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <FiPlus /> Add New
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category Name</label>
              <input 
                required 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" 
                placeholder="e.g. Headphones"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category Image</label>
              <div className="relative group">
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  id="cat-image-upload" 
                  accept="image/*"
                />
                <label 
                  htmlFor="cat-image-upload"
                  className={`border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                    imagePreview ? 'border-blue-500 bg-blue-500/5' : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                  }`}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-4">
                      <FiUploadCloud className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-xs text-gray-400">Upload Image</p>
                    </div>
                  )}
                </label>
                {imagePreview && (
                  <button 
                    type="button" 
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <button 
              type="submit" 
              disabled={formLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {formLoading ? <Loader size={18} dotSize={6} border={3} /> : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-white">Existing Categories</h3>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader size={48} />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center py-20 text-gray-500 font-medium">No categories found. Start by adding one!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex items-center justify-between group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center p-1 overflow-hidden shrink-0">
                      {cat.image ? (
                        <img src={`${IMAGE_BASE_URL}${cat.image}`} alt={cat.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-gray-600 text-[10px] font-bold">N/A</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{cat.name}</p>
                      <p className="text-xs text-gray-500 truncate">{cat.slug}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
