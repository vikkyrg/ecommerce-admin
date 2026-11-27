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
  updateAdminProductStock,
  deleteAdminProduct
} from '../services/adminApi';
import { getProductStockStatus, getStockStatusClass } from '../utils/productStock';

const verifyPersistedProduct = (product, expected) => {
  const savedDiscountPrice = product.discountPrice == null || Number(product.discountPrice) <= 0
    ? null
    : Number(product.discountPrice);
  const savedDiscountPercentage = product.discountPercentage == null
    ? null
    : Number(product.discountPercentage);
  const savedStock = product.stock == null ? null : Number(product.stock);

  if (
    Number(product.originalPrice ?? product.price) !== Number(expected.originalPrice) ||
    Number(product.price) !== Number(expected.price) ||
    savedDiscountPrice !== expected.discountPrice ||
    savedDiscountPercentage !== expected.discountPercentage ||
    (expected.stock !== undefined && savedStock !== expected.stock) ||
    product.shortDescription !== expected.shortDescription ||
    product.description !== expected.description
  ) {
    throw new Error('The server did not return the saved product price, stock and descriptions. Verify the product API response before proceeding.');
  }
};

export default function ProductManagement() {
  const { toggleMobileMenu } = useOutletContext() || {};
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Product Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const initialFormState = {
    name: '',
    category: '',
    brand: '',
    sku: '',
    shortDescription: '',
    description: '',
    applications: '',
    features: '',
    price: '',
    discountPrice: '',
    discountPercentage: '',
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
  };

  const [formData, setFormData] = useState(initialFormState);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingStockId, setEditingStockId] = useState('');
  const [stockDraft, setStockDraft] = useState('');
  const [savingStockId, setSavingStockId] = useState('');

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
      ...initialFormState,
      category: categories[0]?.slug || categories[0]?.name || ''
    });
    setImagePreview('');
    setShowModal(true);
  };

  const openEditModal = prod => {
    setEditingProduct(prod);
    const regularPrice = prod.originalPrice ?? (prod.price != null && prod.price !== '' ? prod.price : '');
    const savedDiscountPrice = prod.discountPrice ?? prod.offerPrice;
    const hasDiscount = regularPrice !== '' &&
      Number.isFinite(Number(regularPrice)) &&
      Number(regularPrice) > 0 &&
      savedDiscountPrice != null &&
      savedDiscountPrice !== '' &&
      Number.isFinite(Number(savedDiscountPrice)) &&
      Number(savedDiscountPrice) > 0 &&
      Number(savedDiscountPrice) < Number(regularPrice);
    const discountPrice = hasDiscount ? savedDiscountPrice : '';
    const storedDiscountPercentage = Number(prod.discountPercentage);
    const discountPct = hasDiscount
      ? Number.isFinite(storedDiscountPercentage) && storedDiscountPercentage > 0 && storedDiscountPercentage <= 100
        ? storedDiscountPercentage
        : Math.round(((Number(regularPrice) - Number(discountPrice)) / Number(regularPrice)) * 100)
      : '';

    const featuresStr = Array.isArray(prod.features)
      ? prod.features.join('\n')
      : typeof prod.features === 'string'
        ? prod.features
        : '';

    setFormData({
      name: prod.name || '',
      category: prod.category || categories[0]?.slug || '',
      brand: prod.brand || '',
      sku: prod.sku || '',
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      applications: prod.applications || '',
      features: featuresStr,
      price: regularPrice,
      discountPrice: discountPrice,
      discountPercentage: discountPct,
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
      if (formData.price === '' || formData.price === null || formData.price === undefined) {
        setError('Product Price is required.');
        setSubmitting(false);
        return;
      }
      if (!Number.isFinite(Number(formData.price)) || Number(formData.price) <= 0) {
        setError('Product Price must be a positive number.');
        setSubmitting(false);
        return;
      }
      if (formData.discountPrice !== '' && formData.discountPrice !== null && formData.discountPrice !== undefined) {
        if (!Number.isFinite(Number(formData.discountPrice)) || Number(formData.discountPrice) < 0) {
          setError('Discount Price must be a valid non-negative number.');
          setSubmitting(false);
          return;
        }
        if (Number(formData.discountPrice) > Number(formData.price)) {
          setError('Discount Price cannot be greater than Product Price.');
          setSubmitting(false);
          return;
        }
      }
      const enteredStock = formData.stock === '' ? undefined : Number(formData.stock);
      if (enteredStock !== undefined && (!Number.isSafeInteger(enteredStock) || enteredStock < 0)) {
        setError('Stock must be a non-negative whole number.');
        setSubmitting(false);
        return;
      }

      const calculatedDiscount = (formData.price && Number(formData.discountPrice) > 0 && Number(formData.price) > 0 && Number(formData.discountPrice) < Number(formData.price))
        ? Math.round(((Number(formData.price) - Number(formData.discountPrice)) / Number(formData.price)) * 100)
        : null;
      const savedOriginalPrice = Number(editingProduct?.originalPrice ?? editingProduct?.price);
      const savedDiscountPrice = editingProduct?.discountPrice == null || editingProduct.discountPrice === ''
        ? null
        : Number(editingProduct.discountPrice);
      const enteredDiscountPrice = formData.discountPrice === '' || formData.discountPrice == null
        ? null
        : Number(formData.discountPrice);
      const savedDiscountPercentage = Number(editingProduct?.discountPercentage);
      const unchangedSavedPricing = Boolean(editingProduct) &&
        savedOriginalPrice === Number(formData.price) &&
        savedDiscountPrice === enteredDiscountPrice;
      const discountPercentage = unchangedSavedPricing &&
        Number(formData.discountPercentage) === savedDiscountPercentage &&
        Number.isFinite(savedDiscountPercentage) &&
        savedDiscountPercentage > 0 &&
        savedDiscountPercentage <= 100
        ? savedDiscountPercentage
        : calculatedDiscount;

      const payload = {
        ...formData,
        originalPrice: Number(formData.price),
        price: Number(formData.price),
        discountPrice: formData.discountPrice === '' ||
          formData.discountPrice === null ||
          formData.discountPrice === undefined ||
          !Number.isFinite(Number(formData.discountPrice)) ||
          Number(formData.discountPrice) <= 0 ||
          Number(formData.discountPrice) === Number(formData.price)
          ? null
          : Number(formData.discountPrice),
        discountPercentage,
        shortDescription: formData.shortDescription?.trim() || '',
        description: formData.description?.trim() || '',
        applications: formData.applications?.trim() || '',
        features: (formData.features || '').split(/\r?\n/).map(f => f.trim()).filter(Boolean),
        mrp: formData.mrp === '' ? (formData.discountPrice ? Number(formData.price) : null) : Number(formData.mrp),
        stock: enteredStock,
        variants: formData.variants.filter(variant => variant.name?.trim())
      };

      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id || editingProduct.sku;
        await updateAdminProduct(id, payload);
        const productsData = await fetchAdminProducts();
        const persistedProducts = Array.isArray(productsData?.products) ? productsData.products : [];
        const persistedProduct = persistedProducts.find(product =>
          String(product._id || product.id || product.sku) === String(id)
        );
        if (!persistedProduct) {
          throw new Error('The updated product was not returned by the product API. Refresh and check the product before proceeding.');
        }
        verifyPersistedProduct(persistedProduct, payload);
        setProducts(persistedProducts);
        setSuccess(`Product '${formData.name}' updated.`);
      } else {
        const created = await createAdminProduct(payload);
        const productsData = await fetchAdminProducts();
        const persistedProducts = Array.isArray(productsData?.products) ? productsData.products : [];
        const persistedProduct = persistedProducts.find(product =>
          String(product._id || product.id || product.sku) === String(created._id || created.id || created.sku)
        );
        if (!persistedProduct) {
          throw new Error('The created product was not returned by the product API. Refresh and check the product before proceeding.');
        }
        verifyPersistedProduct(persistedProduct, payload);
        setProducts(persistedProducts);
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

  const startStockEdit = product => {
    const id = String(product._id || product.id || product.sku);
    setEditingStockId(id);
    setStockDraft(String(product.stock ?? ''));
    setError('');
    setSuccess('');
  };

  const saveStock = async id => {
    const stock = Number(stockDraft);
    if (!Number.isSafeInteger(stock) || stock < 0 || stockDraft.trim() === '') {
      setError('Stock must be a non-negative whole number.');
      return;
    }

    setSavingStockId(id);
    setError('');
    setSuccess('');
    try {
      const updated = await updateAdminProductStock(id, stock);
      setProducts(current => current.map(product =>
        String(product._id || product.id || product.sku) === id
          ? { ...product, ...updated }
          : product
      ));
      setEditingStockId('');
      setStockDraft('');
      setSuccess(`Stock updated to ${updated.stock} units.`);
    } catch (err) {
      setError(err.message || 'Failed to update stock.');
    } finally {
      setSavingStockId('');
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

    const matchStockStatus = selectedStockStatus === 'All' ||
      getProductStockStatus(p.stock) === selectedStockStatus;

    return matchSearch && matchCategory && matchBrand && matchStatus && matchStockStatus;
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

      <main className="min-w-0 p-3.5 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        {/* Search & Multi-Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-lg border border-[#E2E8F0]">
          <div className="flex-1 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full min-w-0 flex-1 sm:w-auto sm:min-w-[220px]">
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
            <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[170px]">
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
            <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[150px]">
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
            <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[130px]">
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

            <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[150px]">
              <select
                value={selectedStockStatus}
                onChange={e => { setSelectedStockStatus(e.target.value); setCurrentPage(1); }}
                className="w-full h-[42px] pl-3.5 pr-8 bg-white text-[#1E293B] text-[14px] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D] appearance-none cursor-pointer"
              >
                <option value="All">All Stock Levels</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Critical Stock">Critical Stock</option>
                <option value="Out of Stock">Out of Stock</option>
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
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[1060px] text-left">
                <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Product Title</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Brand</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Category</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Regular / Discount Price</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Stock Balance</th>
                    <th className="px-5 py-3.5 text-[12.5px] font-semibold">Stock Status</th>
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
                        <div className="space-y-0.5">
                          <div className="text-[13px] font-semibold text-[#1E293B]">
                            Regular: {(p.originalPrice ?? p.price) != null
                              ? `₹${Number(p.originalPrice ?? p.price).toLocaleString('en-IN')}`
                              : 'Not set'}
                          </div>
                          <div className="text-[12px] text-[#64748B]">
                            Discount: {p.discountPrice != null &&
                              Number(p.discountPrice) < Number(p.originalPrice ?? p.price)
                              ? `₹${Number(p.discountPrice).toLocaleString('en-IN')}`
                              : '—'}
                          </div>
                        {p.variants?.length > 1 && (
                          <span className="text-[12px] text-[#64748B] block mt-0.5">{p.variants.length} options</span>
                        )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        {editingStockId === String(p._id || p.id || p.sku) ? (
                          <div className="flex flex-col items-start gap-1.5">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={stockDraft}
                              onChange={event => setStockDraft(event.target.value)}
                              aria-label={`Stock quantity for ${p.name}`}
                              className="h-10 w-24 rounded border border-[#CBD5E1] px-2 text-[13px]"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={savingStockId === String(p._id || p.id || p.sku)}
                                onClick={() => saveStock(String(p._id || p.id || p.sku))}
                                className="min-h-9 px-1 text-left text-[12px] font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                              >
                                {savingStockId === String(p._id || p.id || p.sku) ? 'Saving…' : 'Save Changes'}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEditingStockId(''); setStockDraft(''); }}
                                className="min-h-9 px-1 text-[12px] font-semibold text-[#64748B] hover:underline"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-[14px] font-medium text-[#1E293B]">
                              {Number.isSafeInteger(p.stock) ? `${p.stock} units` : 'Not set'}
                            </span>
                            <button
                              type="button"
                              onClick={() => startStockEdit(p)}
                              className="inline-flex min-h-9 items-center text-[12px] font-semibold text-[#B8862D] hover:underline"
                            >
                              Edit Stock
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        {(() => {
                          const stockStatus = getProductStockStatus(p.stock);
                          return (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-[12px] font-medium ${getStockStatusClass(stockStatus)}`}>
                              {stockStatus}
                            </span>
                          );
                        })()}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[12px] font-medium ${p.isActive !== false ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                          {p.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                            title="Edit Product"
                            aria-label={`Edit ${p.name}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p._id || p.sku)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                            title="Delete Product"
                            aria-label={`Delete ${p.name}`}
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
                  className="h-10 px-3.5 border border-[#E2E8F0] rounded text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[13px]"
                >
                  Previous
                </button>
                <span className="tabular-nums px-2 font-medium">Page {activePage} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
                  disabled={activePage >= totalPages}
                  className="h-10 px-3.5 border border-[#E2E8F0] rounded text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[13px]"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Add / Edit Product Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-900/40 p-2 sm:items-center sm:p-4">
          <div className="relative my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-lg sm:max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-4 sm:px-6">
                <h3 className="text-[18px] font-[650] text-[#1E293B] tracking-tight">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                  aria-label="Close product form"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="min-h-0 space-y-4 overflow-y-auto p-4 sm:p-6">
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                  {/* Pricing Section: Product Price (₹) & Discount Price (₹) */}
                  <div>
                    <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                      Regular Price (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={e => {
                        const val = e.target.value;
                        const disc = formData.discountPrice;
                        let pct = '';
                        if (val && disc && Number(val) > 0 && Number(disc) < Number(val)) {
                          pct = Math.round(((Number(val) - Number(disc)) / Number(val)) * 100);
                        }
                        setFormData({
                          ...formData,
                          price: val,
                          discountPercentage: pct
                        });
                      }}
                      placeholder="2500"
                      className="w-full h-[42px] px-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                      Discount Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discountPrice}
                      onChange={e => {
                        const val = e.target.value;
                        const regPrice = formData.price;
                        let pct = '';
                        if (regPrice && val && Number(regPrice) > 0 && Number(val) < Number(regPrice)) {
                          pct = Math.round(((Number(regPrice) - Number(val)) / Number(regPrice)) * 100);
                        }
                        setFormData({
                          ...formData,
                          discountPrice: val,
                          discountPercentage: pct
                        });
                      }}
                      placeholder="2000"
                      className="w-full h-[42px] px-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                    />
                  </div>

                  {/* Discount Percentage (Auto-calculated, read-only) */}
                  <div>
                    <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.discountPercentage ? `${formData.discountPercentage}%` : ''}
                      placeholder="Auto-calculated (e.g. 20%)"
                      className="w-full h-[42px] px-3.5 bg-slate-50 text-[#64748B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md cursor-not-allowed select-none"
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
                      placeholder="Catalog default"
                      className="w-full h-[42px] px-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                    Short Description (Brief summary for product card &amp; highlights)
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="e.g. High-performance polymer-modified tile adhesive"
                    className="w-full h-[42px] px-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                  />
                </div>

                {/* Full Product Description */}
                <div>
                  <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                    Full Product Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed information about the product, formulation, and characteristics..."
                    className="w-full p-3 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                  />
                </div>

                {/* Applications / Uses */}
                <div>
                  <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                    Applications / Uses
                  </label>
                  <textarea
                    rows={3}
                    value={formData.applications}
                    onChange={e => setFormData({ ...formData, applications: e.target.value })}
                    placeholder="Where and how this product can be applied (e.g. Interior floors & walls, ceramic tiles, vitrified tiles)..."
                    className="w-full p-3 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                  />
                </div>

                {/* Product Features */}
                <div>
                  <label className="block text-[13.5px] font-semibold text-[#1E293B] mb-1.5">
                    Product Features (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.features}
                    onChange={e => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Ready to use, just add water&#10;Excellent bonding strength&#10;No shrinkage or cracking"
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
                        className="h-[36px] w-full rounded border border-[#E2E8F0] bg-white px-3 text-[13px] text-[#1E293B] focus:outline-none focus:border-[#B8862D] sm:w-32"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariantRow(i)}
                        className="inline-flex h-10 w-10 items-center justify-center text-red-600 hover:text-red-700"
                        aria-label={`Remove variant ${i + 1}`}
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
                          className="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white"
                          aria-label="Remove image"
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

                <div className="flex flex-col-reverse gap-2 border-t border-[#E2E8F0] pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="h-11 w-full rounded-md border border-[#E2E8F0] px-4 text-[13.5px] font-semibold text-[#1E293B] hover:bg-[#F8FAFC] sm:h-[40px] sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-full rounded-md bg-[#B8862D] px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#9c7126] disabled:opacity-50 sm:h-[40px] sm:w-auto"
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
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-3 sm:items-center sm:p-4">
            <div className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-sm space-y-4 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-lg sm:p-6">
              <div className="flex items-center gap-2.5 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-semibold text-[17px] text-[#1E293B]">Delete Product</h3>
              </div>
              <p className="text-[13.5px] text-[#64748B] leading-relaxed">
                Are you sure you want to delete this product? It will be removed from both the inventory dashboard and customer store.
              </p>
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="h-10 px-3.5 rounded-md border border-[#E2E8F0] text-[13px] text-[#1E293B] font-medium hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="h-10 px-3.5 rounded-md bg-red-600 hover:bg-red-700 text-[13px] text-white font-semibold"
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
