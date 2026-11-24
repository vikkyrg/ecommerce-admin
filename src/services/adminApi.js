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

// ── Generic fetch helper with timeout ────────────────────────────────────────
const fetchWithTimeout = async (url, options = {}, timeoutMs = 20000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
    throw err;
  } finally {
    clearTimeout(id);
  }
};

/* ================= AUTH ================= */
export const loginAdminApi = async (email, password) => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/admin/auth/login`, {
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
  const res = await fetchWithTimeout(`${API_BASE_URL}/categories?all=true`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.message) msg = errJson.message;
    } catch (e) {}
    throw new Error(msg || 'Failed to fetch categories');
  }
  return await res.json();
};

export const createAdminCategory = async categoryData => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create category');
  return data;
};

export const updateAdminCategory = async (id, categoryData) => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update category');
  return data;
};

export const deleteAdminCategory = async id => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete category');
  return data;
};

/* ================= CUSTOMERS MANAGEMENT ================= */
export const fetchAdminCustomers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetchWithTimeout(`${API_BASE_URL}/admin/customers?${query}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch registered customers');
  return data;
};

export const fetchAdminCustomerById = async id => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/admin/customers/${id}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch customer profile');
  return data;
};

/* ================= ENQUIRIES MANAGEMENT ================= */
export const fetchAdminEnquiries = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetchWithTimeout(`${API_BASE_URL}/admin/enquiries/admin?${query}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch enquiries');
  return data;
};

export const fetchAdminEnquiryById = async id => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/admin/enquiries/admin/${id}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch enquiry details');
  return data;
};

export const updateAdminEnquiryStatus = async (id, status) => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/admin/enquiries/admin/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update enquiry status');
  return data;
};

export const updateAdminEnquiryNotes = async (id, adminNotes) => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/admin/enquiries/admin/${id}/notes`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ adminNotes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update admin notes');
  return data;
};

export const deleteAdminEnquiry = async id => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/admin/enquiries/admin/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete enquiry');
  return data;
};

/* ================= BRANDS ================= */
export const fetchAdminBrands = async (params = {}) => {
  const q = new URLSearchParams({ activeOnly: 'false', ...params }).toString();
  const res = await fetchWithTimeout(`${API_BASE_URL}/brands${q ? `?${q}` : ''}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const e = await res.json(); if (e?.message) msg = e.message; } catch (_) {}
    throw new Error(msg || 'Failed to fetch brands');
  }
  return await res.json();
};

export const createAdminBrand = async brandData => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/brands`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(brandData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create brand');
  return data;
};

export const updateAdminBrand = async (id, brandData) => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/brands/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(brandData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update brand');
  return data;
};

export const deleteAdminBrand = async id => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/brands/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete brand');
  return data;
};

/* ================= PRODUCTS ================= */
export const fetchAdminProducts = async (params = {}) => {
  // limit=300 is intentional — the server now accepts up to 500 for admin requests
  const queryParams = new URLSearchParams({ activeOnly: 'false', limit: '300', ...params });
  const res = await fetchWithTimeout(`${API_BASE_URL}/products?${queryParams.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const e = await res.json(); if (e?.message) msg = e.message; } catch (_) {}
    throw new Error(msg || 'Failed to fetch products');
  }
  return await res.json();
};

export const createAdminProduct = async productData => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create product');
  return data;
};

export const updateAdminProduct = async (id, productData) => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update product');
  return data;
};

export const deleteAdminProduct = async id => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete product');
  return data;
};

/* ================= CATALOG IMPORT & AI IMAGES ================= */
export const previewCatalogImportApi = async (payload = {}) => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/catalog/preview`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to preview catalog import');
  return data;
};

export const confirmCatalogImportApi = async payload => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/catalog/confirm-import`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to confirm catalog import');
  return data;
};
