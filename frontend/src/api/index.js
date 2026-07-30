import { api, uploadFiles } from './client';

export const authApi = {
  signup: (data) => api('/auth/signup', { method: 'POST', body: data }),
  login: (data) => api('/auth/login', { method: 'POST', body: data }),
  logout: () => api('/auth/logout', { method: 'POST' }),
  profile: () => api('/auth/profile'),
  update: (id, data) => api(`/auth/edit/${id}`, { method: 'PUT', body: data }),
  delete: (id) => api(`/auth/delete/${id}`, { method: 'DELETE' }),
  forgotPassword: (email) => api('/auth/forgotpassword', { method: 'POST', body: { email } }),
  resetPassword: (data) => api('/auth/resetpassword', { method: 'POST', body: data }),
};

export const propertyApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(`/properties${query ? `?${query}` : ''}`);
  },
  getById: (id) => api(`/properties/${id}`),
  create: (data) => api('/properties', { method: 'POST', body: data }),
  update: (id, data) => api(`/properties/${id}`, { method: 'PUT', body: data }),
  delete: (id) => api(`/properties/${id}`, { method: 'DELETE' }),
  getPending: () => api('/properties/pending'),
  verify: (data) => api('/properties/verifyProperty', { method: 'POST', body: data }),
};

export const bookingApi = {
  create: (data) => api('/bookings', { method: 'POST', body: data }),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(`/bookings${query ? `?${query}` : ''}`);
  },
  getById: (id) => api(`/bookings/${id}`),
  update: (id, data) => api(`/bookings/${id}`, { method: 'PATCH', body: data }),
  cancel: (id, data) => api(`/bookings/${id}/cancel`, { method: 'PATCH', body: data }),
  confirm: (id) => api(`/bookings/${id}/confirm`, { method: 'PATCH' }),
  reject: (id, data) => api(`/bookings/${id}/reject`, { method: 'PATCH', body: data }),
  pay: (id, data) => api(`/bookings/${id}/pay`, { method: 'PATCH', body: data }),
  complete: (id) => api(`/bookings/${id}/complete`, { method: 'PATCH' }),
  getHostEarnings: () => api('/bookings/host/earnings'),
};

export const reviewApi = {
  getAll: (page = 1) => api(`/reviews/all?page=${page}`),
  getAllProperties: () => api('/reviews/allproperties'),
  getById: (id) => api(`/reviews/${id}`),
  getByProperty: (id) => api(`/reviews/property/${id}`),
  create: (data) => api('/reviews', { method: 'POST', body: data }),
  update: (id, data) => api(`/reviews/${id}`, { method: 'PUT', body: data }),
  report: (id, reason) => api(`/reviews/${id}/report`, { method: 'POST', body: { reason } }),
  handleReport: (id, data) => api(`/reviews/${id}/handle-report`, { method: 'POST', body: data }),
};

export const disputeApi = {
  create: (data) => api('/disputes', { method: 'POST', body: data }),
  update: (id, data) => api(`/disputes/updateDispute/${id}`, { method: 'PATCH', body: data }),
  getAll: (page = 1) => api(`/disputes?page=${page}`),
  filter: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(`/disputes/filter${query ? `?${query}` : ''}`);
  },
  getById: (id) => api(`/disputes/${id}`),
  resolve: (id, data) => api(`/disputes/${id}/resolve`, { method: 'PATCH', body: data }),
};

export { uploadFiles };
