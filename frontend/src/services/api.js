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

  getProfile: async (token) => {
    return request(`${API_BASE}/auth/me`, {
      headers: withAuthHeaders({}, token),
    });
  },

  // Products
  getProducts: async (category = null) => {
    const url = category 
      ? `${API_BASE}/products?category=${encodeURIComponent(category)}`
      : `${API_BASE}/products`;
    return request(url);
  },

  getProduct: async (id) => {
    return request(`${API_BASE}/products/${id}`);
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
};
