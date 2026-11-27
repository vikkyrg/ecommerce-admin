import api from './apiClient';

export { API_BASE_URL, resolveImageUrl } from './apiClient';

const responseData = response => response.data;

export const loginAdminApi = (email, password) =>
  api.post('/admin/auth/login', { email, password }).then(responseData);

export const verifyAdminSession = () =>
  api.get('/admin/auth/me').then(responseData);

export const fetchAdminCategories = () =>
  api.get('/categories', { params: { all: true } }).then(responseData);

export const createAdminCategory = categoryData =>
  api.post('/categories', categoryData).then(responseData);

export const updateAdminCategory = (id, categoryData) =>
  api.put(`/categories/${encodeURIComponent(id)}`, categoryData).then(responseData);

export const deleteAdminCategory = id =>
  api.delete(`/categories/${encodeURIComponent(id)}`).then(responseData);

export const fetchAdminCustomers = (params = {}) =>
  api.get('/admin/customers', { params }).then(responseData);

export const fetchAdminCustomerById = id =>
  api.get(`/admin/customers/${encodeURIComponent(id)}`).then(responseData);

export const fetchAdminEnquiries = (params = {}) =>
  api.get('/admin/enquiries/admin', { params }).then(responseData);

export const fetchAdminEnquiryById = id =>
  api.get(`/admin/enquiries/admin/${encodeURIComponent(id)}`).then(responseData);

export const updateAdminEnquiryStatus = (id, status) =>
  api.patch(`/admin/enquiries/admin/${encodeURIComponent(id)}/status`, { status }).then(responseData);

export const updateAdminEnquiryNotes = (id, adminNotes) =>
  api.patch(`/admin/enquiries/admin/${encodeURIComponent(id)}/notes`, { adminNotes }).then(responseData);

export const deleteAdminEnquiry = id =>
  api.delete(`/admin/enquiries/admin/${encodeURIComponent(id)}`).then(responseData);

export const fetchAdminBrands = (params = {}) =>
  api.get('/brands', { params: { activeOnly: false, ...params } }).then(responseData);

export const createAdminBrand = brandData =>
  api.post('/brands', brandData).then(responseData);

export const updateAdminBrand = (id, brandData) =>
  api.put(`/brands/${encodeURIComponent(id)}`, brandData).then(responseData);

export const deleteAdminBrand = id =>
  api.delete(`/brands/${encodeURIComponent(id)}`).then(responseData);

export const fetchAdminProducts = (params = {}) =>
  api.get('/products', {
    params: { activeOnly: false, limit: 300, ...params }
  }).then(responseData);

export const createAdminProduct = productData =>
  api.post('/products', productData).then(responseData);

export const updateAdminProduct = (id, productData) =>
  api.put(`/products/${encodeURIComponent(id)}`, productData).then(responseData);

export const updateAdminProductPrice = (id, pricingData) =>
  api.patch(`/products/${encodeURIComponent(id)}/price`, pricingData).then(responseData);

export const updateAdminProductStock = (id, stock) =>
  api.patch(`/products/${encodeURIComponent(id)}/stock`, { stock }).then(responseData);

export const updateAdminProductDescription = (id, descriptionData) =>
  api.patch(`/products/${encodeURIComponent(id)}/description`, descriptionData).then(responseData);

export const deleteAdminProduct = id =>
  api.delete(`/products/${encodeURIComponent(id)}`).then(responseData);

export const fetchAdminOrders = (params = {}) =>
  api.get('/orders', { params }).then(responseData);

export const fetchAdminOrderById = id =>
  api.get(`/orders/${encodeURIComponent(id)}`).then(responseData);

export const updateAdminOrderStatus = (id, data) =>
  api.put(`/orders/${encodeURIComponent(id)}/status`, data).then(responseData);

export const previewCatalogImportApi = (payload = {}) =>
  api.post('/catalog/preview', payload).then(responseData);

export const confirmCatalogImportApi = payload =>
  api.post('/catalog/confirm-import', payload).then(responseData);
