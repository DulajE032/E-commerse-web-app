const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const IMAGE_BASE_URL = API_BASE.replace('/api/v1', '');

export const getImageUrl = (path) => {
  if (!path) return "/logo.png";
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `${IMAGE_BASE_URL}${path}`;
  if (path.startsWith('uploads')) return `${IMAGE_BASE_URL}/${path}`;
  return path; // For public folder assets like /categories/phones.png
};

export const getStoredToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
export const getStoredRefreshToken = () => (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null);

export const setAuthTokens = (accessToken, refreshToken) => {
  if (typeof window === 'undefined') return;
  if (accessToken) localStorage.setItem('token', accessToken);
  if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
};

export const clearAuthTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
};

const withAuthHeaders = (headers = {}, token = getStoredToken()) => {
  if (!token) {
    return headers;
  }
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

let refreshPromise = null;

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  const currentRefreshToken = getStoredRefreshToken();
  if (!currentRefreshToken) {
    clearAuthTokens();
    return null;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: currentRefreshToken }),
      });

      if (!res.ok) {
        clearAuthTokens();
        return null;
      }

      const data = await res.json();
      setAuthTokens(data.access_token, data.refresh_token);
      return data.access_token;
    } catch {
      clearAuthTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const request = async (url, options = {}, isRetry = false) => {
  let res;
  try {
    res = await fetch(url, options);
  } catch (networkError) {
    throw new Error(`Unable to connect to the backend server (${API_BASE}). Please check if the server is running.`);
  }

  const isAuthEndpoint =
    url.includes('/auth/login') ||
    url.includes('/auth/admin-login') ||
    url.includes('/auth/google') ||
    url.includes('/auth/signup') ||
    url.includes('/auth/refresh');

  // If token expired (401) and not already retrying, attempt silent refresh on protected endpoints
  if (res.status === 401 && !isRetry && !isAuthEndpoint) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      const retryHeaders = {
        ...(options.headers || {}),
        Authorization: `Bearer ${newAccessToken}`,
      };
      return request(url, { ...options, headers: retryHeaders }, true);
    }
  }

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
      body: JSON.stringify({
        ...payload,
        turnstile_token: payload.turnstile_token || undefined,
      }),
    });
  },

  login: async (payload) => {
    return request(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        turnstile_token: payload.turnstile_token || undefined,
      }),
    });
  },

  adminLogin: async (payload) => {
    return request(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        turnstile_token: payload.turnstile_token || undefined,
      }),
    });
  },

  refreshToken: async (refreshToken) => {
    return request(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  serverLogout: async (refreshToken) => {
    return request(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  getProfile: async (token) => {
    return request(`${API_BASE}/auth/me`, {
      headers: withAuthHeaders({}, token),
    });
  },

  googleAuth: async (payload) => {
    return request(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
    return request(`${API_BASE}/products/`, {
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
    return request(`${API_BASE}/categories/`);
  },

  createCategory: async (categoryData, token) => {
    return request(`${API_BASE}/categories/`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify(categoryData),
    });
  },

  deleteCategory: async (id, token) => {
    return request(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: withAuthHeaders({}, token),
    });
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

    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.minPrice != null) params.append('min_price', filters.minPrice);
    if (filters.maxPrice != null) params.append('max_price', filters.maxPrice);
    if (filters.inStock === true) params.append('in_stock', 'true');

    if (Array.isArray(filters.brands)) {
      filters.brands.forEach((b) => params.append('brands', b));
    }

    const qs = params.toString();
    return request(`${API_BASE}/products/${qs ? `?${qs}` : ''}`);
  },

  getProductFilters: async () => {
    return request(`${API_BASE}/products/filters`);
  },

  // Orders
  createOrder: async (orderData, token) => {
    return request(`${API_BASE}/orders/`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify({
        ...orderData,
        turnstile_token: orderData.turnstile_token || undefined,
      }),
    });
  },

  getOrders: async (token) => {
    return request(`${API_BASE}/orders/`, {
      headers: withAuthHeaders({}, token),
    });
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
    return request(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify({ status }),
    });
  },

  uploadBankSlip: async (orderId, file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`${API_BASE}/orders/${orderId}/upload-slip`, {
      method: 'POST',
      headers: withAuthHeaders({}, token),
      body: formData,
    });
  },

  cancelOrder: async (orderId, token) => {
    return request(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: withAuthHeaders({}, token),
    });
  },

  verifyPayment: async (orderId, isApproved, adminNotes, token) => {
    return request(`${API_BASE}/orders/${orderId}/verify-payment`, {
      method: 'PATCH',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify({ is_approved: isApproved, admin_notes: adminNotes }),
    });
  },

  // Notifications
  getNotifications: async (token, limit = 20, offset = 0) => {
    return request(`${API_BASE}/notifications/?limit=${limit}&offset=${offset}`, {
      headers: withAuthHeaders({}, token),
    });
  },

  getUnreadNotificationCount: async (token) => {
    return request(`${API_BASE}/notifications/unread-count`, {
      headers: withAuthHeaders({}, token),
    });
  },

  markNotificationRead: async (id, token) => {
    return request(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: withAuthHeaders({}, token),
    });
  },

  markAllNotificationsRead: async (token) => {
    return request(`${API_BASE}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: withAuthHeaders({}, token),
    });
  },

  // Feedback & Testimonials
  submitOrderFeedback: async (orderId, { rating, comment }, token) => {
    return request(`${API_BASE}/feedback/${orderId}`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify({ rating, comment }),
    });
  },

  getMyFeedbacks: async (token) => {
    return request(`${API_BASE}/feedback/my`, {
      headers: withAuthHeaders({}, token),
    });
  },

  getFeaturedFeedbacks: async (limit = 6) => {
    return request(`${API_BASE}/feedback/featured?limit=${limit}`);
  },

  getAllFeedbacksAdmin: async (params = {}, token) => {
    const qs = new URLSearchParams();
    if (params.is_featured !== undefined) qs.append('is_featured', params.is_featured);
    if (params.limit) qs.append('limit', params.limit);
    if (params.offset) qs.append('offset', params.offset);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request(`${API_BASE}/feedback/admin/all${query}`, {
      headers: withAuthHeaders({}, token),
    });
  },

  toggleFeedbackFeature: async (feedbackId, isFeatured, token) => {
    return request(`${API_BASE}/feedback/${feedbackId}/feature`, {
      method: 'PATCH',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify({ is_featured: isFeatured }),
    });
  },

  respondToFeedbackAdmin: async (feedbackId, responseText, token) => {
    return request(`${API_BASE}/feedback/${feedbackId}/respond`, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }, token),
      body: JSON.stringify({ response: responseText }),
    });
  },

  getDashboardStats: async (token) => {
    return request(`${API_BASE}/dashboard/stats`, {
      headers: withAuthHeaders({}, token),
    });
  },


  getUsers: async (token) => {
    return request(`${API_BASE}/users/`, {
      headers: withAuthHeaders({}, token),
    });
  },

  // Wishlist — User-facing
  getWishlist: async (token) => {
    return request(`${API_BASE}/wishlist/`, {
      headers: withAuthHeaders({}, token),
    });
  },

  getWishlistIds: async (token) => {
    return request(`${API_BASE}/wishlist/ids`, {
      headers: withAuthHeaders({}, token),
    });
  },

  addToWishlist: async (productId, token) => {
    return request(`${API_BASE}/wishlist/`, {
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

  getPublicStats: async () => {
    return request(`${API_BASE}/stats/public`);
  },
};
