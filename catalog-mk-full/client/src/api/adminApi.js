import { request } from './http';

const auth = { auth: true };

export const authApi = {
  register: (data) => request('/api/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: data }),
  me: () => request('/api/auth/me', auth),
  changePassword: (data) => request('/api/auth/change-password', { ...auth, method: 'POST', body: data }),
};

export const adminApi = {
  // Продавница
  getStore: () => request('/api/admin/store', auth),
  updateStore: (data) => request('/api/admin/store', { ...auth, method: 'PUT', body: data }),

  // Слики
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return request('/api/admin/uploads', { ...auth, method: 'POST', body: form });
  },

  // Производи
  listProducts: () => request('/api/admin/products', auth),
  createProduct: (data) => request('/api/admin/products', { ...auth, method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/api/admin/products/${id}`, { ...auth, method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/api/admin/products/${id}`, { ...auth, method: 'DELETE' }),

  // Нарачки
  listOrders: ({ status, limit = 50, offset = 0 } = {}) => {
    const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (status) q.set('status', status);
    return request(`/api/admin/orders?${q}`, auth);
  },
  updateOrderStatus: (id, status) =>
    request(`/api/admin/orders/${id}`, { ...auth, method: 'PATCH', body: { status } }),
  stats: () => request('/api/admin/stats', auth),
};
