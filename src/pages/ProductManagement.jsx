import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  CheckCircle2,
  X,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import {
  fetchAdminProducts,
  fetchAdminCategories,
  fetchAdminBrands,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct
} from '../services/adminApi';

export default function ProductManagement() {
  const { toggleMobileMenu } = useOutletContext() || {};
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Product Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    sku: '',
    description: '',
    price: '',
    mrp: '',
    stock: '',
    size: '',
    weight: '',
    unit: '',
    image: '',
    variants: [],
    isFeatured: false,
    isBestSeller: false,
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [searchParams] = useSearchParams();

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [prodsData, catsData, brandsData] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminCategories(),
        fetchAdminBrands()
      ]);
      setProducts(Array.isArray(prodsData?.products) ? prodsData.products : []);
      const catsList = Array.isArray(catsData) ? catsData : [];
      setCategories(catsList);
      const brandsList = Array.isArray(brandsData) ? brandsData : [];
      setBrands(brandsList);

      if (catsList.length > 0 && !formData.category) {
        setFormData(prev => ({
          ...prev,
          category: catsList[0].slug || catsList[0].name
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (searchParams.get('action') === 'new') {
      openAddModal();
    }
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.slug || categories[0]?.name || '',
      brand: '',
      sku: '',
      description: '',
      price: '',
      mrp: '',
      stock: '',
      size: '',
      weight: '',
      unit: '',
      image: '',
      variants: [],
      isFeatured: false,
      isBestSeller: false,
      isActive: true
    });
    setImagePreview('');
    setShowModal(true);
  };

  const openEditModal = prod => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      category: prod.category || categories[0]?.slug || '',
      brand: prod.brand || '',
      sku: prod.sku || '',
      description: prod.description || '',
      price: prod.price ?? '',
      mrp: prod.mrp ?? '',
      stock: prod.stock ?? '',
      size: prod.size || '',
      weight: prod.weight || '',
      unit: prod.unit || '',
      image: prod.image || '',
      variants: Array.isArray(prod.variants) && prod.variants.length > 0
        ? prod.variants
        : [],
      isFeatured: Boolean(prod.isFeatured),
      isBestSeller: Boolean(prod.isBestSeller),
      isActive: prod.isActive !== false
    });
    setImagePreview(prod.image || '');
    setShowModal(true);
  };

  // Base64 Image Upload
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      alert('Only JPG, JPEG, PNG, and WebP images are supported.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Image file size must be under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Variant helpers
  const addVariantRow = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', size: '', weight: '', unit: '', price: null, stock: null }]
    }));
  };

  const updateVariantRow = (idx, field, val) => {
    setFormData(prev => {
      const updated = [...prev.variants];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, variants: updated };
    });
  };

  const removeVariantRow = idx => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        price: formData.price === '' ? null : Number(formData.price),
        mrp: formData.mrp === '' ? null : Number(formData.mrp),
        stock: formData.stock === '' ? null : Number(formData.stock),
        variants: formData.variants.filter(variant => variant.name?.trim())
      };

      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id || editingProduct.sku;
        const updated = await updateAdminProduct(id, payload);
        setProducts(prev =>
          prev.map(p => ((p._id || p.id || p.sku) === id ? { ...p, ...updated } : p))
        );
        setSuccess(`Product '${formData.name}' updated.`);
      } else {
        const created = await createAdminProduct(payload);
        setProducts(prev => [created, ...prev]);
        setSuccess(`Product '${formData.name}' created.`);
      }
      setShowModal(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setError('');
      await deleteAdminProduct(deleteId);
      setProducts(prev => prev.filter(p => (p._id || p.id || p.sku) !== deleteId));
      setDeleteId(null);
      setSuccess('Product deleted successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      selectedCategory === 'All' || p.category === selectedCategory;

    const matchBrand =
      selectedBrand === 'All' || p.brand === selectedBrand;

    const matchStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Active' && p.isActive !== false) ||
      (selectedStatus === 'Draft' && p.isActive === false);

    return matchSearch && matchCategory && matchBrand && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const visibleProducts = filteredProducts.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize
  );

  const applicableBrands = brands.filter(brand => {
    if (!formData.category) return true;
    if (!Array.isArray(brand.categories) || brand.categories.length === 0) return true;
    return brand.categories.includes(formData.category);
  });

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Topbar
        title="Products & Inventory"
        subtitle="Catalog database, specifications, variants, packaging, and stock balances"
        onMenuClick={toggleMobileMenu}
      />

      <main className="p-5 sm:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        {/* Search & Multi-Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-lg border border-[#E2E8F0]">
          <div className="flex-1 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search products by title, SKU, brand..."
                className="w-full h-[42px] pl-10 pr-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative min-w-[170px]">
              <select
                value={selectedCategory}
                onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="w-full h-[42px] pl-3.5 pr-8 bg-white text-[#1E293B] text-[14px] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D] appearance-none cursor-pointer"
              >
                <option value="All">All Categories ({categories.length})</option>
                {categories.map(c => (
                  <option key={c._id || c.slug} value={c.slug || c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Brand Dropdown */}
            <div className="relative min-w-[150px]">
              <select
                value={selectedBrand}
                onChange={e => { setSelectedBrand(e.target.value); setCurrentPage(1); }}
                className="w-full h-[42px] pl-3.5 pr-8 bg-white text-[#1E293B] text-[14px] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D] appearance-none cursor-pointer"
              >
                <option value="All">All Brands ({brands.length})</option>
                {brands.map(b => (
                  <option key={b._id || b.slug} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Dropdown */}
            <div className="relative min-w-[130px]">
              <select
                value={selectedStatus}
                onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="w-full h-[42px] pl-3.5 pr-8 bg-white text-[#1E293B] text-[14px] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D] appearance-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Draft">Inactive</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="h-[40px] px-4 bg-[#B8862D] hover:bg-[#9c7126] text-white text-[13.5px] font-semibold rounded-md transition-colors inline-flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-[13.5px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[12px] font-semibold transition cursor-pointer flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-[13.5px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="h-16 bg-white rounded-lg border border-[#E2E8F0] animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-14 text-center bg-white rounded-lg border border-[#E2E8F0]">
            <Package className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
            <h3 className="text-[18px] font-[650] text-[#1E293B]">No Products Found</h3>
            <p className="text-[14px] text-[#64748B] mt-1">
              Add a new product or check your search and filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Product Title</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Brand</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Category</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Price / Variants</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Stock Balance</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Status</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                  {visibleProducts.map(p => (
                    <tr key={p._id || p.sku} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-md border border-[#E2E8F0] bg-white p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<span class="flex items-center justify-center w-full h-full"><svg class="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></span>';
                                }}
                              />
                            ) : (
                              <Package className="w-4 h-4 text-[#94A3B8]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[14px] font-semibold text-[#1E293B] block truncate max-w-[280px]">
                              {p.name}
                            </span>
                            <span className="text-[12px] font-mono text-[#64748B] block mt-0.5">
                              {p.sku || 'No SKU'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-[13px] font-semibold text-[#1E293B]">
                          {p.brand || '—'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-[14px] text-[#475569]">
                        {categories.find(category => category.slug === p.category)?.name || p.category}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="text-[14px] font-semibold text-[#1E293B]">
                          {p.price != null ? `₹${Number(p.price).toLocaleString('en-IN')}` : <span className="text-[#94A3B8] font-normal">Not set</span>}
                        </div>
                        {p.variants?.length > 1 && (
                          <span className="text-[12px] text-[#64748B] block mt-0.5">{p.variants.length} options</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`text-[14px] font-medium ${p.stock == null ? 'text-[#94A3B8]' : p.stock > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {p.stock == null ? 'Not set' : `${p.stock} units`}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[12px] font-medium ${
                          p.isActive !== false ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {p.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p._id || p.sku)}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-[#E2E8F0] text-[13px] text-[#64748B]">
              <span>
                Showing {filteredProducts.length ? (activePage - 1) * pageSize + 1 : 0} to {Math.min(activePage * pageSize, filteredProducts.length)} of {filteredProducts.length} entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, activePage - 1))}
                  disabled={activePage === 1}
                  className="h-[34px] px-3.5 border border-[#E2E8F0] rounded text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[13px]"
                >
                  Previous
                </button>
                <span className="tabular-nums px-2 font-medium">Page {activePage} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
                  disabled={activePage >= totalPages}
                  className="h-[34px] px-3.5 border border-[#E2E8F0] rounded text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[13px]"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Add / Edit Product Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-lg shadow-lg overflow-hidden my-auto max-h-[90vh] flex flex-col">
              <div className="px-6 py-4.5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 className="text-[18px] font-[650] text-[#1E293B] tracking-tight">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[#64748B] hover:text-[#1E293B] p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-[42px] px-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                      Category *
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.category}
                        onChange={e => {
                          const category = e.target.value;
                          const selectedBrand = brands.find(brand =>
                            brand.name === formData.brand &&
                            Array.isArray(brand.categories) &&
                            brand.categories.includes(category)
                          );
                          setFormData({ ...formData, category, brand: selectedBrand?.name || '' });
                        }}
                        className="w-full h-[42px] pl-3.5 pr-8 bg-white text-[#1E293B] text-[14px] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D] appearance-none cursor-pointer"
                      >
                        {categories.map(c => (
                          <option key={c._id || c.slug} value={c.slug || c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                      Brand (optional)
                    </label>
                    <div className="relative">
                      <select
                        value={formData.brand}
                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full h-[42px] pl-3.5 pr-8 bg-white text-[#1E293B] text-[14px] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D] appearance-none cursor-pointer"
                      >
                        <option value="">No identifiable brand</option>
                        {applicableBrands.map(brand => (
                          <option key={brand._id || brand.slug} value={brand.name}>{brand.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Leave blank if unavailable"
                      className="w-full h-[42px] px-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                    />
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="1250"
                      className="w-full h-[42px] px-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                    />
                  </div>

                  {/* MRP */}
                  <div>
                    <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                      MRP (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.mrp}
                      onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                      placeholder="1500"
                      className="w-full h-[42px] px-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                      Stock Balance
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="50"
                      className="w-full h-[42px] px-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                    Description & Applications
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                  />
                </div>

                {/* Dynamic Product Variants */}
                <div className="border border-[#E2E8F0] rounded-md p-4 bg-[#F8FAFC] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-semibold text-[#1E293B]">Product Variants &amp; Packaging</span>
                    <button
                      type="button"
                      onClick={addVariantRow}
                      className="text-[12.5px] text-[#B8862D] font-semibold hover:underline cursor-pointer"
                    >
                      + Add Variant
                    </button>
                  </div>

                  {formData.variants?.map((v, i) => (
                    <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Variant Name / Size"
                        value={v.name}
                        onChange={e => updateVariantRow(i, 'name', e.target.value)}
                        className="flex-1 min-w-[150px] h-[36px] bg-white text-[13px] text-[#1E293B] px-3 rounded border border-[#E2E8F0] focus:outline-none focus:border-[#B8862D]"
                      />
                      <input
                        type="text"
                        placeholder="Size / Weight"
                        value={v.size || v.weight || ''}
                        onChange={e => updateVariantRow(i, 'size', e.target.value)}
                        className="w-32 h-[36px] bg-white text-[13px] text-[#1E293B] px-3 rounded border border-[#E2E8F0] focus:outline-none focus:border-[#B8862D]"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariantRow(i)}
                        className="p-1.5 text-red-600 hover:text-red-700"
                        title="Remove Variant"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Product Image Upload */}
                <div>
                  <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                    Primary Image
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-[#E2E8F0] hover:border-[#B8862D] rounded-md cursor-pointer bg-[#F8FAFC]">
                      <Upload className="w-4 h-4 text-[#64748B] mb-1" />
                      <span className="text-[12.5px] text-[#64748B] font-medium">Click to browse image file</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>

                    {imagePreview && (
                      <div className="relative w-16 h-16 rounded border border-[#E2E8F0] overflow-hidden bg-white p-1">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image: '' }));
                          }}
                          className="absolute top-1 right-1 bg-slate-900 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-5 pt-1">
                  <label className="flex items-center gap-2 text-[13.5px] text-[#1E293B] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-[#B8862D] focus:ring-0 w-4 h-4"
                    />
                    <span>Active in Store</span>
                  </label>

                  <label className="flex items-center gap-2 text-[13.5px] text-[#1E293B] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded text-[#B8862D] focus:ring-0 w-4 h-4"
                    />
                    <span>Featured Item</span>
                  </label>

                  <label className="flex items-center gap-2 text-[13.5px] text-[#1E293B] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })}
                      className="rounded text-[#B8862D] focus:ring-0 w-4 h-4"
                    />
                    <span>Best Seller</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="h-[40px] px-4 rounded-md border border-[#E2E8F0] text-[13.5px] font-semibold text-[#1E293B] hover:bg-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-[40px] px-4 rounded-md bg-[#B8862D] hover:bg-[#9c7126] text-white font-semibold text-[13.5px] transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 max-w-sm w-full space-y-4 shadow-lg">
              <div className="flex items-center gap-2.5 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-semibold text-[17px] text-[#1E293B]">Delete Product</h3>
              </div>
              <p className="text-[13.5px] text-[#64748B] leading-relaxed">
                Are you sure you want to delete this product? It will be removed from both the inventory dashboard and customer store.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="h-[36px] px-3.5 rounded-md border border-[#E2E8F0] text-[13px] text-[#1E293B] font-medium hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="h-[36px] px-3.5 rounded-md bg-red-600 hover:bg-red-700 text-[13px] text-white font-semibold"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
