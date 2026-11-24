import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Layers,
  Upload
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import {
  fetchAdminBrands,
  fetchAdminCategories,
  createAdminBrand,
  updateAdminBrand,
  deleteAdminBrand
} from '../services/adminApi';

export default function BrandManagement() {
  const { toggleMobileMenu } = useOutletContext() || {};
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    categories: [],
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [brandData, catData] = await Promise.all([
        fetchAdminBrands(),
        fetchAdminCategories()
      ]);
      setBrands(Array.isArray(brandData) ? brandData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      setError(err.message || 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      description: '',
      logo: '',
      categories: [],
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = b => {
    setEditingBrand(b);
    setFormData({
      name: b.name,
      description: b.description || '',
      logo: b.logo || '',
      categories: Array.isArray(b.categories) ? b.categories : [],
      isActive: b.isActive !== false
    });
    setShowModal(true);
  };

  const toggleCategorySelection = catSlug => {
    setFormData(prev => {
      const exists = prev.categories.includes(catSlug);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter(c => c !== catSlug)
          : [...prev.categories, catSlug]
      };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingBrand) {
        await updateAdminBrand(editingBrand._id || editingBrand.id || editingBrand.slug, formData);
        setSuccess(`Brand '${formData.name}' updated successfully.`);
      } else {
        await createAdminBrand(formData);
        setSuccess(`Brand '${formData.name}' added successfully.`);
      }
      setShowModal(false);
      loadData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Error saving brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAdminBrand(deleteId);
      setDeleteId(null);
      setSuccess('Brand deleted successfully.');
      loadData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Could not delete brand');
      setDeleteId(null);
    }
  };

  const filteredBrands = brands.filter(b => {
    const matchesSearch =
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      (b.categories && b.categories.includes(selectedCategory));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0f1114] text-[#e0e2e6] flex flex-col">
      <Topbar onMenuClick={toggleMobileMenu} />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-['Manrope'] font-bold text-xl sm:text-2xl text-white tracking-tight">
              Brand Management
            </h1>
            <p className="font-['Inter'] text-xs sm:text-sm text-neutral-400 mt-1">
              Manage dynamic product manufacturers, import partners and category assignments.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#ffdf9c] hover:bg-[#ffe7b3] text-black font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand</span>
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

        {/* Filters and Search Bar */}
        <div className="bg-[#141619] border border-neutral-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search brands by name..."
              className="w-full bg-[#1b1e22] text-xs sm:text-sm text-white placeholder-neutral-500 pl-9 pr-3 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#ffdf9c]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-neutral-400 whitespace-nowrap">Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-[#1b1e22] text-xs text-white px-3 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#ffdf9c]"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Brands Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-40 bg-[#141619] rounded-2xl animate-pulse border border-neutral-800" />
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-12 text-center bg-[#141619] rounded-2xl border border-neutral-800">
            <Tag className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base">No Brands Found</h3>
            <p className="text-neutral-400 text-xs mt-1">
              Add brands manually or import the WEBSITE.xlsx catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBrands.map(b => (
              <div
                key={b._id || b.slug}
                className="bg-[#141619] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-['Manrope'] font-bold text-base text-white group-hover:text-[#ffdf9c] transition-colors">
                      {b.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.isActive !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {b.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                    {b.description || 'Verified manufacturer / brand in NS Stone Chemicals catalog.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {b.categories && b.categories.map(catSlug => {
                      const matched = categories.find(c => c.slug === catSlug);
                      return (
                        <span key={catSlug} className="text-[10px] px-2 py-0.5 rounded-md bg-[#1b1e22] text-[#ffdf9c] border border-neutral-800">
                          {matched ? matched.name : catSlug}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-neutral-800">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    title="Edit Brand"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(b._id || b.slug)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                    title="Delete Brand"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Brand Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#141619] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="font-['Manrope'] font-bold text-base text-white">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. TENAX, AKEMI, SURIE POLEX"
                  className="w-full bg-[#1b1e22] text-xs sm:text-sm text-white px-3 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#ffdf9c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Brand Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brand details, specialty products and warranty information..."
                  className="w-full bg-[#1b1e22] text-xs text-white px-3 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#ffdf9c]"
                />
              </div>

              {/* Assign Categories */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Assign to Categories
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-[#1b1e22] rounded-xl border border-neutral-800">
                  {categories.map(cat => {
                    const selected = formData.categories.includes(cat.slug);
                    return (
                      <div
                        key={cat.slug}
                        onClick={() => toggleCategorySelection(cat.slug)}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          selected ? 'bg-[#ffdf9c]/10 text-[#ffdf9c] font-semibold' : 'text-neutral-400 hover:bg-neutral-800'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <input
                          type="checkbox"
                          checked={selected}
                          readOnly
                          className="rounded text-[#ffdf9c] focus:ring-0"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-[#ffdf9c] focus:ring-0"
                />
                <span className="text-xs text-neutral-300">Brand is Active &amp; Published</span>
              </label>

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
                  {submitting ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#141619] border border-neutral-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Delete Brand</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete this brand? Products linked to this brand cannot be deleted automatically.
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
                Delete Brand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
