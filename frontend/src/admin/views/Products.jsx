"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import Loader from '../../components/Loader';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useRouter();

  useEffect(() => {
    let isMounted = true;

    api
      .getProducts({ limit: 100 })
      .then((data) => {
        if (!isMounted) return;
        setProducts(data.products);
        setError('');
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load products');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);



  const handleDelete = async (productId) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this product?');
    if (!shouldDelete) {
      return;
    }

    try {
      await api.deleteProduct(productId);
      setProducts((prev) => prev.filter((item) => item.id !== productId));
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader size={48} dotSize={12} border={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {products.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-md p-6">
          <p className="text-gray-400">No products available.</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-md overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-700 last:border-b-0">
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{`$${Number(product.price).toFixed(2)}`}</td>
                    <td className="px-4 py-3">{product.category || '-'}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;
