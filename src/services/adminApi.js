// Central API service for Admin operations
const BASE = import.meta.env.VITE_API_URL || '';
export const API_BASE_URL = BASE ? `${BASE.replace(/\/+$/, '')}/api` : '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('ns_stone_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
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

/* ================= PRODUCTS ================= */
export const fetchAdminProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/products?${query}&limit=200`, {
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

