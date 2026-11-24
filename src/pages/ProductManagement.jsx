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
  AlertCircle,
  Layers,
  Tag,
  Wand2,
  Image as ImageIcon
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import {
  fetchAdminProducts,
  fetchAdminCategories,
  fetchAdminBrands,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  generateAIProductImageApi
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
    stock: 25,
    size: 'Standard',
    weight: '',
    unit: 'Piece',
    image: '',
    variants: [],
    isFeatured: false,
    isBestSeller: false,
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // AI Image Generator State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiVariations, setAiVariations] = useState([]);
  const [aiProductTarget, setAiProductTarget] = useState(null);

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
      category: categories[0]?.slug || categories[0]?.name || 'marble-and-granite-polishing-materials',
      brand: brands[0]?.name || 'TENAX',
      sku: '',
      description: '',
      price: '',
      mrp: '',
      stock: 25,
      size: 'Standard',
      weight: '',
      unit: 'Piece',
      image: '',
      variants: [{ name: 'Standard', size: 'Standard', unit: 'Piece' }],
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
      brand: prod.brand || brands[0]?.name || '',
      sku: prod.sku || '',
      description: prod.description || '',
      price: prod.price !== undefined ? prod.price : '',
      mrp: prod.mrp !== undefined ? prod.mrp : '',
      stock: prod.stock !== undefined ? prod.stock : 25,
      size: prod.size || 'Standard',
      weight: prod.weight || '',
      unit: prod.unit || 'Piece',
      image: prod.image || '',
      variants: Array.isArray(prod.variants) && prod.variants.length > 0
        ? prod.variants
        : [{ name: 'Standard', size: 'Standard', unit: 'Piece' }],
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

  // AI Image Generation Trigger
  const handleGenerateAIImages = async (prod) => {
    setAiProductTarget(prod);
    setShowAIModal(true);
    setAiGenerating(true);
    try {
      const res = await generateAIProductImageApi(prod.name, prod.brand, prod.category);
      setAiVariations(res.variations || []);
    } catch (err) {
      alert(err.message || 'Error generating AI imagery');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplyAIImage = async (imgUrl) => {
    if (!aiProductTarget) return;
    try {
      const id = aiProductTarget._id || aiProductTarget.id || aiProductTarget.sku;
      await updateAdminProduct(id, { image: imgUrl });
      setProducts(prev =>
        prev.map(p => ((p._id || p.id || p.sku) === id ? { ...p, image: imgUrl } : p))
      );
      setSuccess(`AI representative image applied to ${aiProductTarget.name}.`);
      setShowAIModal(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to assign image');
    }
  };

  // Variant helpers
  const addVariantRow = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', size: '', weight: '', unit: 'Piece', price: 0, stock: 10 }]
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
        price: Number(formData.price) || 0,
        mrp: formData.mrp ? Number(formData.mrp) : (Number(formData.price) ? Number(formData.price) * 1.15 : 0),
        stock: Number(formData.stock) || 0
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
      await deleteAdminProduct(deleteId);
      setProducts(prev => prev.filter(p => (p._id || p.id || p.sku) !== deleteId));
      setDeleteId(null);
      setSuccess('Product deleted successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      selectedCategory === 'All' ||
      p.category === selectedCategory ||
      (categories.find(c => c.slug === selectedCategory)?.name === p.category);

    const matchBrand = selectedBrand === 'All' || p.brand === selectedBrand;

    const matchStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Active' && p.isActive !== false) ||
      (selectedStatus === 'Draft' && p.isActive === false);

    return matchSearch && matchCategory && matchBrand && matchStatus;
  });

  return (
    <div className="flex-1 flex flex-col min-h-full bg-[#0f1114] text-[#e0e2e6]">
      <Topbar
        title="Product Management"
        subtitle="Manage dynamic catalog products, specifications, variants & AI packaging imagery"
        onMenuClick={toggleMobileMenu}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        {/* Actions Bar */}
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
                className="w-full pl-10 pr-4 py-2.5 bg-[#141619] border border-neutral-800 rounded-xl text-xs font-['Inter'] text-white focus:outline-none focus:border-[#ffdf9c]"
              />
            </div>

            {/* Category Dropdown Filter */}
            <div className="w-full sm:w-52">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#141619] border border-neutral-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#ffdf9c] cursor-pointer truncate"
              >
                <option value="All">All Categories ({categories.length})</option>
                {categories.map(c => (
                  <option key={c._id || c.slug} value={c.slug || c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Dropdown Filter */}
            <div className="w-full sm:w-44">
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#141619] border border-neutral-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#ffdf9c] cursor-pointer truncate"
              >
                <option value="All">All Brands ({brands.length})</option>
                {brands.map(b => (
                  <option key={b._id || b.slug} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 bg-[#ffdf9c] hover:bg-[#ffe7b3] text-black font-['Inter'] font-bold text-xs px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-20 bg-[#141619] rounded-2xl animate-pulse border border-neutral-800" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-[#141619] rounded-2xl border border-neutral-800">
            <Package className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base">No Products Found</h3>
            <p className="text-neutral-400 text-xs mt-1">
              Add a new product or check your filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-[#141619] border border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1b1e22] text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Brand</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price / Variants</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {filteredProducts.map(p => (
                    <tr key={p._id || p.sku} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-black border border-neutral-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                            ) : (
                              <Package className="w-5 h-5 text-neutral-600" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{p.name}</span>
                            <span className="font-mono text-[10px] text-neutral-500">{p.sku}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-[#1b1e22] text-[#ffdf9c] text-[10px] font-mono border border-neutral-800">
                          {p.brand}
                        </span>
                      </td>

                      <td className="p-3.5 text-neutral-400 text-[11px]">
                        {p.category}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-white">
                          {p.price > 0 ? `₹${p.price.toLocaleString('en-IN')}` : <span className="text-neutral-500 font-normal">Manage Price</span>}
                        </div>
                        {p.variants?.length > 1 && (
                          <span className="text-[10px] text-neutral-400">{p.variants.length} options</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[11px] font-semibold ${p.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {p.stock || 0} in stock
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.isActive !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {p.isActive !== false ? 'Active' : 'Draft'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleGenerateAIImages(p)}
                            className="p-1.5 text-neutral-400 hover:text-[#ffdf9c] hover:bg-neutral-800 rounded-lg cursor-pointer"
                            title="Generate AI Product Image"
                          >
                            <Wand2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p._id || p.sku)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg cursor-pointer"
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

        {/* Dynamic Add / Edit Product Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-[#141619] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
              <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
                <h3 className="font-['Manrope'] font-bold text-base text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#1b1e22] text-xs sm:text-sm text-white px-3 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#ffdf9c]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#1b1e22] text-xs text-white px-3 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#ffdf9c]"
                    >
                      {categories.map(c => (
                        <option key={c._id || c.slug} value={c.slug || c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. TENAX, AKEMI, SURIE POLEX"
                      className="w-full bg-[#1b1e22] text-xs text-white px-3 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#ffdf9c]"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="1250"
                      className="w-full bg-[#1b1e22] text-xs text-white px-3 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#ffdf9c]"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="50"
                      className="w-full bg-[#1b1e22] text-xs text-white px-3 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#ffdf9c]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#1b1e22] text-xs text-white px-3 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#ffdf9c]"
                  />
                </div>

                {/* Dynamic Product Variants */}
                <div className="border border-neutral-800 rounded-xl p-3 bg-[#1b1e22]/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Product Variants &amp; Packaging</span>
                    <button
                      type="button"
                      onClick={addVariantRow}
                      className="text-[11px] text-[#ffdf9c] font-semibold hover:underline cursor-pointer"
                    >
                      + Add Variant
                    </button>
                  </div>

                  {formData.variants?.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Variant Name / Size"
                        value={v.name}
                        onChange={e => updateVariantRow(i, 'name', e.target.value)}
                        className="flex-1 bg-[#141619] text-xs text-white p-2 rounded-lg border border-neutral-700"
                      />
                      <input
                        type="text"
                        placeholder="Size / Weight"
                        value={v.size || v.weight || ''}
                        onChange={e => updateVariantRow(i, 'size', e.target.value)}
                        className="w-28 bg-[#141619] text-xs text-white p-2 rounded-lg border border-neutral-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariantRow(i)}
                        className="p-2 text-rose-400 hover:text-rose-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Product Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Primary Image
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center p-3 border border-dashed border-neutral-700 hover:border-[#ffdf9c] rounded-xl cursor-pointer bg-[#1b1e22]">
                      <Upload className="w-4 h-4 text-neutral-400 mb-1" />
                      <span className="text-[11px] text-neutral-400">Upload Image File</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>

                    {imagePreview && (
                      <div className="relative w-16 h-16 rounded-xl border border-neutral-700 overflow-hidden bg-black p-1">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image: '' }));
                          }}
                          className="absolute top-0.5 right-0.5 bg-black text-white rounded-full p-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-[#ffdf9c] focus:ring-0"
                    />
                    <span>Active in Store</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded text-[#ffdf9c] focus:ring-0"
                    />
                    <span>Featured</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })}
                      className="rounded text-[#ffdf9c] focus:ring-0"
                    />
                    <span>Best Seller</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-[#ffdf9c] hover:bg-[#ffe7b3] text-black font-bold text-xs transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI Image Generation Modal */}
        {showAIModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="bg-[#141619] border border-neutral-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-[#ffdf9c]" />
                  <h3 className="font-bold text-base text-white">AI Representative Imagery</h3>
                </div>
                <button onClick={() => setShowAIModal(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-neutral-300">
                Product: <strong className="text-white">{aiProductTarget?.name}</strong>
                <br />
                Brand: <strong className="text-[#ffdf9c]">{aiProductTarget?.brand}</strong>
              </div>

              {aiGenerating ? (
                <div className="py-12 text-center text-xs text-neutral-400 space-y-2">
                  <div className="w-8 h-8 border-2 border-[#ffdf9c] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Generating representative studio product photographs...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-neutral-400">
                    Select an approved representative photograph to assign as the primary product image:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {aiVariations.map(v => (
                      <div
                        key={v.id}
                        className="rounded-xl border border-neutral-800 bg-[#1b1e22] overflow-hidden group hover:border-[#ffdf9c] transition-all flex flex-col justify-between"
                      >
                        <div className="h-28 overflow-hidden bg-black">
                          <img src={v.url} alt={v.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="p-2.5">
                          <span className="text-[10px] font-semibold text-neutral-300 block mb-2">{v.label}</span>
                          <button
                            onClick={() => handleApplyAIImage(v.url)}
                            className="w-full bg-[#ffdf9c] hover:bg-[#ffe7b3] text-black font-bold text-[10px] py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Approve Image
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-[#141619] border border-neutral-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-bold text-base text-white">Delete Product</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Are you sure you want to delete this product? It will be removed from both the admin dashboard and customer store.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-800 text-xs text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs text-white font-bold"
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
