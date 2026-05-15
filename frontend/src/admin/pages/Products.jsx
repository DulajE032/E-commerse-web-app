import React from 'react';

const Products = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Add New Product
        </button>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-md p-6">
        <p className="text-gray-400">Product list will be displayed here.</p>
      </div>
    </div>
  );
};

export default Products;
