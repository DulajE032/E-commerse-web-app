import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
  });

  useEffect(() => {
    let isMounted = true;

    api
      .getProducts()
      .then((data) => {
        if (!isMounted) return;
        setProducts(data);
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

  const startEdit = (product) => {
    setEditingProductId(product.id);
    setEditForm({
      name: product.name || '',
      price: product.price ?? '',
      category: product.category || '',
      stock: product.stock ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setEditForm({
      name: '',
      price: '',
      category: '',
      stock: '',
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (productId) => {
    try {
      const payload = {
        name: editForm.name,
        price: Number(editForm.price),
        category: editForm.category || null,
        stock: Number(editForm.stock),
      };

      const updated = await api.updateProduct(productId, payload);
      setProducts((prev) => prev.map((item) => (item.id === productId ? updated : item)));
      cancelEdit();
    } catch (err) {
      setError(err.message || 'Failed to update product');
    }
  };

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

  if (loading) return <p className="text-gray-400">Loading products...</p>;

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
              {products.map((product) => {
                const isEditing = editingProductId === product.id;
                return (
                  <tr key={product.id} className="border-b border-gray-700 last:border-b-0">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                        />
                      ) : (
                        product.name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          name="price"
                          value={editForm.price}
                          onChange={handleEditChange}
                          className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                        />
                      ) : (
                        `$${Number(product.price).toFixed(2)}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                        />
                      ) : (
                        product.category || '-'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          name="stock"
                          value={editForm.stock}
                          onChange={handleEditChange}
                          className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                        />
                      ) : (
                        product.stock
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(product.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
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
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;
