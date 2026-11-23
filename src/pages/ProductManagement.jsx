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
  XCircle,
  Star,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import {
  fetchAdminProducts,
  fetchAdminCategories,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct
} from '../services/adminApi';

export default function ProductManagement() {
  const { toggleMobileMenu } = useOutletContext() || {};
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: 'Tenax',
    sku: '',
    description: '',
    price: '',
    mrp: '',
    stock: 25,
    size: '1 Litre',
    unit: 'Bottle',
    image: '',
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
      const [prodsData, catsData] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminCategories()
      ]);
      setProducts(Array.isArray(prodsData?.products) ? prodsData.products : []);
      const catsList = Array.isArray(catsData) ? catsData : [];
      setCategories(catsList);
      if (catsList.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: catsList[0].name }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load products');
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
      category: categories[0]?.name || 'Marble & Granite Polishing',
      brand: 'Tenax',
      sku: '',
      description: '',
      price: '',
      mrp: '',
      stock: 25,
      size: '1 Litre',
      unit: 'Bottle',
      image: '',
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
      category: prod.category || categories[0]?.name || '',
      brand: prod.brand || 'Tenax',
      sku: prod.sku || '',
      description: prod.description || '',
      price: prod.price || '',
      mrp: prod.mrp || '',
      stock: prod.stock || 25,
      size: prod.size || '1 Litre',
      unit: prod.unit || 'Bottle',
      image: prod.image || '',
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

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        mrp: formData.mrp ? Number(formData.mrp) : Number(formData.price) * 1.15,
        stock: Number(formData.stock)
      };

      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id || editingProduct.sku;
        const updated = await updateAdminProduct(id, payload);
        setProducts(prev =>
          prev.map(p => ((p._id || p.id || p.sku) === id ? { ...p, ...updated } : p))
        );
      } else {
        const created = await createAdminProduct(payload);
        setProducts(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAdminProduct(deleteId);
      setProducts(prev => prev.filter(p => (p._id || p.id || p.sku) !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Topbar
        title="Product Management"
        subtitle="Manage products with dynamic MongoDB categories, Base64 image uploads & pricing"
        onMenuClick={toggleMobileMenu}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        
        {/* Actions Bar: Fully Responsive Search, Filter & Add Button */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2.5 sm:gap-3 w-full">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by title, SKU, brand..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-['Inter'] focus:outline-none focus:border-black"
              />
            </div>

            {/* Category Dropdown Filter */}
            <div className="w-full sm:w-60">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-['Inter'] font-medium text-neutral-800 focus:outline-none focus:border-black cursor-pointer truncate"
              >
                <option value="All">All Categories ({products.length})</option>
                {categories.map(c => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-[#ffdf9c] font-['Inter'] font-bold text-xs px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Product Catalog Display */}
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500 font-['Inter']">
            Loading catalog from database...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e3e1] p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="font-['Manrope'] font-bold text-base text-neutral-800">No products match your criteria</p>
            <p className="text-xs text-neutral-500">Adjust your search query or add a new product.</p>
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table (Hidden on small mobile < 768px) */}
            <div className="hidden md:block bg-white rounded-2xl border border-[#e2e3e1] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-['Inter']">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Badges</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.map(p => (
                      <tr key={p._id || p.id || p.sku} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg border border-neutral-200 bg-white p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-contain"
                                onError={e => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Package className="w-5 h-5 text-neutral-300" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span className="font-bold text-black block truncate">{p.name}</span>
                            <span className="text-[10px] text-neutral-400 block">{p.brand} • {p.size}</span>
                          </div>
                        </td>
                        <td className="p-4 text-neutral-600 max-w-[150px] truncate">{p.category}</td>
                        <td className="p-4 font-mono font-medium text-neutral-600 whitespace-nowrap">{p.sku}</td>
                        <td className="p-4 font-bold text-black whitespace-nowrap">
                          ₹{p.price?.toLocaleString('en-IN')}
                          {p.mrp && p.mrp > p.price && (
                            <span className="text-[10px] text-neutral-400 line-through block font-normal">
                              ₹{p.mrp?.toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`font-semibold ${(p.stock || 0) < 10 ? 'text-amber-600' : 'text-neutral-700'}`}>
                            {p.stock || 0} in stock
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {p.isBestSeller && (
                              <span className="p-1 bg-amber-50 text-amber-700 border border-amber-200 rounded" title="Best Seller">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              </span>
                            )}
                            {p.isFeatured && (
                              <span className="p-1 bg-purple-50 text-purple-700 border border-purple-200 rounded" title="Featured">
                                <Sparkles className="w-3 h-3 text-purple-600" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.isActive !== false
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                            }`}
                          >
                            {p.isActive !== false ? 'Active' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg cursor-pointer"
                              title="Edit"
                              aria-label="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(p._id || p.id || p.sku)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete"
                              aria-label="Delete product"
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
            </div>

            {/* Mobile Product Card Layout (Visible only on mobile screens < 768px) */}
            <div className="md:hidden space-y-3">
              {filteredProducts.map(p => (
                <div
                  key={p._id || p.id || p.sku}
                  className="bg-white rounded-2xl border border-[#e2e3e1] p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl border border-neutral-200 bg-white p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          onError={e => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package className="w-6 h-6 text-neutral-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-black line-clamp-2 leading-snug">{p.name}</h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 uppercase ${
                            p.isActive !== false
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                          }`}
                        >
                          {p.isActive !== false ? 'Active' : 'Draft'}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block truncate mt-1">
                        {p.category} • <span className="font-mono text-neutral-600">{p.sku}</span>
                      </span>
                    </div>
                  </div>

                  {/* Pricing, Badges & Stock Row */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-black text-sm">₹{p.price?.toLocaleString('en-IN')}</span>
                      {p.mrp && p.mrp > p.price && (
                        <span className="text-[10px] text-neutral-400 line-through">₹{p.mrp?.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.isBestSeller && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold">
                          Best Seller
                        </span>
                      )}
                      {p.isFeatured && (
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[9px] font-bold">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock & Action Buttons Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="text-[11px] text-neutral-500">
                      Stock: <strong className="text-neutral-800">{p.stock || 0}</strong> ({p.size || 'Standard'})
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        aria-label="Edit product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteId(p._id || p.id || p.sku)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer transition-colors"
                        title="Delete product"
                        aria-label="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Add/Edit Product Modal: Responsive Drawer on Mobile, Centered Modal on Desktop */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom sm:slide-in-from-top duration-200">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-100 mb-4 sticky top-0 bg-white z-10">
                <div>
                  <h3 className="font-['Manrope'] font-bold text-base sm:text-lg text-black">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">Save product details directly to the database.</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-['Inter']">
                {/* Product Name */}
                <div>
                  <label className="block font-semibold mb-1 text-neutral-800">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tenax Proseal Nano Impregnating Sealer"
                    className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-black text-xs"
                  />
                </div>

                {/* 2-Column Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Category Dropdown */}
                  <div>
                    <label className="block font-semibold mb-1 text-neutral-800">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-black text-xs cursor-pointer truncate"
                    >
                      {categories.map(c => (
                        <option key={c._id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block font-semibold mb-1 text-neutral-800">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Tenax, Bellinzoni, Akemi..."
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-black text-xs"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block font-semibold mb-1 text-neutral-800">SKU / Code</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g. TNX-PRS-1L"
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 font-mono text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block font-semibold mb-1 text-neutral-800">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="1250"
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* MRP */}
                  <div>
                    <label className="block font-semibold mb-1 text-neutral-800">MRP Price (₹)</label>
                    <input
                      type="number"
                      value={formData.mrp}
                      onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                      placeholder="1500"
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block font-semibold mb-1 text-neutral-800">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="25"
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block font-semibold mb-1 text-neutral-800">Package Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={e => setFormData({ ...formData, size: e.target.value })}
                      placeholder="1 Litre"
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Packaging Unit */}
                  <div>
                    <label className="block font-semibold mb-1 text-neutral-800">Packaging Unit</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="Bottle, Can, Bag..."
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold mb-1 text-neutral-800">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Technical description, recommended applications, surface types..."
                    className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-black text-xs"
                  />
                </div>

                {/* Base64 Image Upload & Preview */}
                <div>
                  <label className="block font-semibold mb-1 text-neutral-800">Product Image (File Upload - Base64) *</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-neutral-300 hover:border-black rounded-xl cursor-pointer bg-neutral-50 transition-colors">
                      <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                      <span className="text-[11px] font-medium text-neutral-600">Select Image (JPG, PNG, WebP)</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>

                    {imagePreview && (
                      <div className="relative w-20 h-20 rounded-xl border border-neutral-300 overflow-hidden flex-shrink-0 bg-white p-1 mx-auto sm:mx-0">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image: '' }));
                          }}
                          className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 hover:bg-black"
                          title="Remove image"
                          aria-label="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges / Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-neutral-200 cursor-pointer bg-neutral-50/50">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })}
                      className="rounded w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-black">Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-neutral-200 cursor-pointer bg-neutral-50/50">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-black">Featured</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-neutral-200 cursor-pointer bg-neutral-50/50">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-black">Active in Store</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-4 py-2.5 border rounded-xl hover:bg-neutral-100 font-semibold text-neutral-700 order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-5 py-2.5 bg-black text-[#ffdf9c] font-bold rounded-xl hover:bg-neutral-800 transition-colors shadow-xs order-1 sm:order-2 disabled:opacity-60"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="font-['Manrope'] font-bold text-base sm:text-lg text-black">Confirm Deletion</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="w-full sm:w-auto px-4 py-2.5 border rounded-xl text-xs font-semibold hover:bg-neutral-100 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 order-1 sm:order-2"
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
