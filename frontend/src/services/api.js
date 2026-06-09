const API_BASE = 'http://127.0.0.1:8000/api/v1';

const getStoredToken = () => localStorage.getItem('token');

const withAuthHeaders = (headers = {}, token = getStoredToken()) => {
  if (!token) {
    return headers;
  }
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data && typeof data.detail === 'string'
        ? data.detail
        : `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
};

export const api = {
  // Auth
  signup: async (payload) => {
    return request(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  login: async (payload) => {
    return request(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  adminLogin: async (payload) => {
    return request(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  getProfile: async (token) => {
    return request(`${API_BASE}/auth/me`, {
      headers: withAuthHeaders({}, token),
    });
  },

  // Products
  

  getProduct: async (id) => {
    return request(`${API_BASE}/products/${id}`);
  },

  getProductReviews: async (id) => {
    return request(`${API_BASE}/products/${id}/reviews`);
  },

  createProductReview: async (id, reviewData, token) => {
    return request(`${API_BASE}/products/${id}/reviews`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify(reviewData),
    });
  },

  createProduct: async (productData, token) => {
    return request(`${API_BASE}/products`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (id, payload, token) => {
    return request(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify(payload),
    });
  },

  deleteProduct: async (id, token) => {
    return request(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: withAuthHeaders({}, token),
    });
  },

  // Categories
  getCategories: async () => {
    return request(`${API_BASE}/categories`);
  },

  // Upload
  uploadImage: async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`${API_BASE}/upload`, {
      method: 'POST',
      headers: withAuthHeaders({}, token),
      body: formData,
    });
  },

  // Visual Search
  searchByText: async (query, top_k = 5) => {
    const data = await request(`${API_BASE}/visual-search/search-by-text/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k }),
    });
    return data && Array.isArray(data.results) ? data.results : data;
  },

  searchByImage: async (file, top_k = 5) => {
    const formData = new FormData();
    formData.append('file', file);
    const data = await request(`${API_BASE}/visual-search/search-by-image/?top_k=${top_k}`, {
      method: 'POST',
      body: formData,
    });
    return data && Array.isArray(data.results) ? data.results : data;
  },
  
  getProducts: async (filters = {}) => {
   const params = new URLSearchParams();
 
   if (filters.category) params.append('category', filters.category);
   if (filters.search) params.append('search', filters.search);
   if (filters.sortBy) params.append('sort_by', filters.sortBy);
   if (filters.minPrice != null) params.append('min_price', filters.minPrice);
   if (filters.maxPrice != null) params.append('max_price', filters.maxPrice);
   if (filters.inStock != null) params.append('in_stock', filters.inStock);
 
   if (Array.isArray(filters.brands)) {
     filters.brands.forEach((b) => params.append('brands', b));
   }
 
   const qs = params.toString();
   return request(`${API_BASE}/products${qs ? `?${qs}` : ''}`);
 },
 
  getProductFilters: async () => {
   return request(`${API_BASE}/products/filters`);
  },
  
  //order
  createOrder: async (orderData, token) => {
    return request(`${API_BASE}/orders`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify(orderData),
    });
  },
  
  getOrders: async (token) => {
    return request(`${API_BASE}/orders`, {
      headers: withAuthHeaders({}, token),
    }
    );
  },

  getMyOrders: async (token, status) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`${API_BASE}/orders/me${query}`, {
      headers: withAuthHeaders({}, token),
    });
  },

  getOrder: async (id, token) => {
    return request(`${API_BASE}/orders/${id}`, {
      headers: withAuthHeaders({}, token),
    });
  },
  
  updateOrderStatus: async (id, status, token) => {
  return request(`${API_BASE}/orders/${id}/status?status=${status}`, {
    method: 'PATCH',
    headers: withAuthHeaders({}, token),
  });
},

  getDashboardStats: async (token) => {
    return request(`${API_BASE}/dashboard/stats`, {
      headers: withAuthHeaders({}, token),
    });
  },

  // Wishlist — User-facing
  getWishlist: async (token) => {
    return request(`${API_BASE}/wishlist`, {
      headers: withAuthHeaders({}, token),
    });
  },

  getWishlistIds: async (token) => {
    return request(`${API_BASE}/wishlist/ids`, {
      headers: withAuthHeaders({}, token),
    });
  },

  addToWishlist: async (productId, token) => {
    return request(`${API_BASE}/wishlist`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify({ product_id: productId }),
    });
  },

  removeFromWishlist: async (productId, token) => {
    return request(`${API_BASE}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: withAuthHeaders({}, token),
    });
  },

  toggleWishlist: async (productId, token) => {
    return request(`${API_BASE}/wishlist/toggle`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify({ product_id: productId }),
    });
  },

  syncWishlist: async (productIds, token) => {
    return request(`${API_BASE}/wishlist/sync`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify({ product_ids: productIds }),
    });
  },

  // Wishlist — Admin
  getWishlistTrending: async (token) => {
    return request(`${API_BASE}/wishlist/admin/trending`, {
      headers: withAuthHeaders({}, token),
    });
  },

  getWishlistUsers: async (token) => {
    return request(`${API_BASE}/wishlist/admin/users`, {
      headers: withAuthHeaders({}, token),
    });
  },

  getWishlistByUser: async (userId, token) => {
    return request(`${API_BASE}/wishlist/admin/users/${userId}`, {
      headers: withAuthHeaders({}, token),
    });
  },

  sendWishlistCampaign: async (productId, token) => {
    return request(`${API_BASE}/wishlist/admin/campaign/${productId}`, {
      method: 'POST',
      headers: withAuthHeaders({}, token),
    });
  },
  
  
};
