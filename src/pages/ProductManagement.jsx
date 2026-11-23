import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
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
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      sku: prod.sku,
      description: prod.description || '',
      price: prod.price,
      mrp: prod.mrp || prod.price,
      stock: prod.stock || 0,
      size: prod.size || 'Standard',
      unit: prod.unit || 'Piece',
      image: prod.image || '',
      isFeatured: Boolean(prod.isFeatured),
      isBestSeller: Boolean(prod.isBestSeller),
      isActive: prod.isActive !== false
    });
    setImagePreview(prod.image || '');
    setShowModal(true);
  };

  // Base64 Image Upload Handler
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      alert('Only JPG, JPEG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Image exceeds 8MB limit. Please upload an image under 8MB.');
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
      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id || editingProduct.sku;
        await updateAdminProduct(id, formData);
      } else {
        await createAdminProduct(formData);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAdminProduct(deleteId);
      setDeleteId(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Topbar
        title="Product Management"
        subtitle="Manage products with dynamic MongoDB categories, Base64 image uploads & pricing"
      />

      <main className="p-6 sm:p-8 space-y-6 flex-1">
        
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-72">
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
            <div className="w-full sm:w-56">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-['Inter'] font-medium text-neutral-800 focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="All">All Categories</option>
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
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-[#ffdf9c] font-['Inter'] font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Product Table */}
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
          <div className="bg-white rounded-2xl border border-[#e2e3e1] shadow-2xs overflow-hidden">
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
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-11 h-11 object-contain rounded-lg border border-neutral-200 p-1 bg-white flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-black line-clamp-1 max-w-xs">{p.name}</span>
                          <span className="text-[10px] text-neutral-500 uppercase font-bold">{p.brand}</span>
                        </div>
                      </td>

                      <td className="p-4 text-neutral-600 line-clamp-1 max-w-[150px]">{p.category}</td>
                      <td className="p-4 font-mono font-medium text-neutral-700">{p.sku}</td>

                      <td className="p-4">
                        <span className="font-bold text-black block">₹{p.price?.toLocaleString('en-IN')}</span>
                        {p.mrp && p.mrp > p.price && (
                          <span className="text-[10px] text-neutral-400 line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.inStock !== false ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                          {p.stock || 20} {p.unit || 'units'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {p.isBestSeller && (
                            <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Best Seller
                            </span>
                          )}
                          {p.isFeatured && (
                            <span className="bg-neutral-900 text-[#ffdf9c] text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="text-[11px] font-semibold text-emerald-700">
                          Active
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p._id || p.id || p.sku)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
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
          </div>
        )}

        {/* Create / Edit Product Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-['Manrope'] font-bold text-lg text-black">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-['Inter']">
                {/* Product Name */}
                <div>
                  <label className="block font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tenax Ager Color Enhancer & Wet Look Stone Sealer"
                    className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Category Dropdown */}
                  <div>
                    <label className="block font-semibold mb-1">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-black cursor-pointer"
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
                    <label className="block font-semibold mb-1">Brand *</label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Tenax, Akemi, etc."
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block font-semibold mb-1">SKU *</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                      placeholder="TEN-AGR-001"
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 font-mono uppercase focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Price */}
                  <div>
                    <label className="block font-semibold mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="1250"
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300"
                    />
                  </div>

                  {/* MRP / Discount Price */}
                  <div>
                    <label className="block font-semibold mb-1">MRP Price (₹)</label>
                    <input
                      type="number"
                      value={formData.mrp}
                      onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                      placeholder="1500"
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block font-semibold mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="25"
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300"
                    />
                  </div>

                  {/* Size / Unit */}
                  <div>
                    <label className="block font-semibold mb-1">Package Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={e => setFormData({ ...formData, size: e.target.value })}
                      placeholder="1 Litre"
                      className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Technical description, recommended applications, surface types..."
                    className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                {/* Base64 Image Upload & Preview */}
                <div>
                  <label className="block font-semibold mb-1">Product Image (File Upload - Base64) *</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-neutral-300 hover:border-black rounded-xl cursor-pointer bg-neutral-50 transition-colors">
                      <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                      <span className="text-[11px] font-medium text-neutral-600">Select Image (JPG, PNG, WebP)</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>

                    {imagePreview && (
                      <div className="relative w-20 h-20 rounded-xl border border-neutral-300 overflow-hidden flex-shrink-0 bg-white p-1">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image: '' }));
                          }}
                          className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-0.5 hover:bg-black"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges / Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-neutral-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    />
                    <span className="font-semibold text-black">Mark as Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-neutral-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <span className="font-semibold text-black">Mark as Featured</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-neutral-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span className="font-semibold text-black">Active (Visible)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-xl hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-black text-[#ffdf9c] font-bold rounded-xl hover:bg-neutral-800 transition-colors"
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
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="font-['Manrope'] font-bold text-lg text-black">Confirm Deletion</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Are you sure you want to remove this product from the catalog? This action will immediately remove it from the customer store.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
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
