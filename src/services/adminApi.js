// Central API service for Admin operations
// Always uses relative API path so it works with Vite proxy (dev) and Vercel rewrites (prod)
export const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('ns_stone_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

/* ================= AUTH ================= */
export const loginAdminApi = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Invalid admin credentials');
  }
  return data;
};

/* ================= CATEGORIES ================= */
export const fetchAdminCategories = async () => {
  const res = await fetch(`${API_BASE_URL}/categories?all=true`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return await res.json();
};

export const createAdminCategory = async categoryData => {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create category');
  return data;
};

export const updateAdminCategory = async (id, categoryData) => {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update category');
  return data;
};

export const deleteAdminCategory = async id => {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete category');
  return data;
};

/* ================= BRANDS ================= */
export const fetchAdminBrands = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/brands?${query}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch brands');
  return await res.json();
};

export const createAdminBrand = async brandData => {
  const res = await fetch(`${API_BASE_URL}/brands`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(brandData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create brand');
  return data;
};

export const updateAdminBrand = async (id, brandData) => {
  const res = await fetch(`${API_BASE_URL}/brands/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(brandData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update brand');
  return data;
};

export const deleteAdminBrand = async id => {
  const res = await fetch(`${API_BASE_URL}/brands/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete brand');
  return data;
};

/* ================= PRODUCTS ================= */
export const fetchAdminProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/products?activeOnly=false&${query}&limit=300`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return await res.json();
};

export const createAdminProduct = async productData => {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create product');
  return data;
};

export const updateAdminProduct = async (id, productData) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update product');
  return data;
};

export const deleteAdminProduct = async id => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete product');
  return data;
};

/* ================= CATALOG IMPORT & AI IMAGES ================= */
export const previewCatalogImportApi = async (payload = {}) => {
  const res = await fetch(`${API_BASE_URL}/catalog/preview`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to preview catalog import');
  return data;
};

export const confirmCatalogImportApi = async (overwriteExisting = false) => {
  const res = await fetch(`${API_BASE_URL}/catalog/confirm-import`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ overwriteExisting })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to confirm catalog import');
  return data;
};

export const generateAIProductImageApi = async (productName, brand, category) => {
  const res = await fetch(`${API_BASE_URL}/catalog/ai-generate-image`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productName, brand, category })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to generate AI images');
  return data;
};
