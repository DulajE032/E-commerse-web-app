import React from 'react';

const AdminDashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <h3 className="text-gray-400">Total Sales</h3>
          <p className="text-3xl font-bold mt-2">$24,500</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <h3 className="text-gray-400">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">1,240</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <h3 className="text-gray-400">Products</h3>
          <p className="text-3xl font-bold mt-2">120</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
