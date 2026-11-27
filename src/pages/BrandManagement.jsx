import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown
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
    setSubmitting(true);
    setError('');

    try {
      if (editingBrand) {
        const id = editingBrand._id || editingBrand.id || editingBrand.slug;
        const updated = await updateAdminBrand(id, formData);
        setBrands(prev =>
          prev.map(b => ((b._id || b.id || b.slug) === id ? { ...b, ...updated } : b))
        );
        setSuccess(`Brand '${formData.name}' updated successfully.`);
      } else {
        const created = await createAdminBrand(formData);
        setBrands(prev => [created, ...prev]);
        setSuccess(`Brand '${formData.name}' created successfully.`);
      }
      setShowModal(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Brand action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setError('');
      await deleteAdminBrand(deleteId);
      setBrands(prev => prev.filter(b => (b._id || b.id || b.slug) !== deleteId));
      setDeleteId(null);
      setSuccess('Brand deleted successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete brand');
    }
  };

  const filteredBrands = brands.filter(b => {
    const matchSearch =
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase()));

    const matchCategory =
      selectedCategory === 'All' ||
      (Array.isArray(b.categories) && b.categories.includes(selectedCategory));

    return matchSearch && matchCategory;
  });

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Topbar
        title="Brand Management"
        subtitle="Manage certified chemical brands and authorized partnerships"
        onMenuClick={toggleMobileMenu}
      />

      <main className="min-w-0 p-3.5 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-[#E2E8F0]">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full min-w-0 flex-1 sm:max-w-md">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search brands by name..."
                className="w-full h-[42px] pl-10 pr-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[200px]">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full h-[42px] pl-3.5 pr-8 bg-white text-[#1E293B] text-[14px] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D] appearance-none cursor-pointer"
              >
                <option value="All">All Categories ({categories.length})</option>
                {categories.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="h-[40px] px-4 bg-[#B8862D] hover:bg-[#9c7126] text-white text-[13px] font-semibold rounded-md transition-colors inline-flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Brand</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[12px] font-medium transition cursor-pointer flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}
        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-md flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Brands Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-44 bg-white rounded-lg border border-[#E2E8F0] animate-pulse" />
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border border-[#E2E8F0]">
            <Tag className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
            <h3 className="text-[16px] font-semibold text-[#1E293B]">No Brands Found</h3>
            <p className="text-[13px] text-[#64748B] mt-1">
              Add a brand or adjust your search filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBrands.map(b => (
              <div
                key={b._id || b.slug}
                className="bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-lg p-5 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[15px] font-semibold text-[#1E293B] truncate pr-2">
                      {b.name}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      b.isActive !== false
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {b.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#64748B] line-clamp-2 mb-3 min-h-[36px]">
                    {b.description || 'No description provided.'}
                  </p>
                  
                  <div className="text-[12px] text-[#64748B] mb-3 font-medium">
                    {b.productCount || 0} associated products
                  </div>

                  {/* Associated Category Tags */}
                  <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                    {b.categories && b.categories.slice(0, 3).map(catSlug => {
                      const matched = categories.find(c => c.slug === catSlug);
                      return (
                        <span key={catSlug} className="text-[11px] px-2 py-0.5 rounded bg-[#F8F3E9] text-[#B8862D] border border-[#E2D9C8]">
                          {matched ? matched.name : catSlug}
                        </span>
                      );
                    })}
                    {b.categories && b.categories.length > 3 && (
                      <span className="text-[11px] text-[#64748B] self-center">
                        +{b.categories.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => openEditModal(b)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                    title="Edit Brand"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(b._id || b.slug)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-900/40 p-2 sm:items-center sm:p-4">
          <div className="relative my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-lg sm:max-h-[90vh]">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-[#E2E8F0] px-4 py-4 sm:px-5">
              <h3 className="text-[16px] font-semibold text-[#1E293B]">
                {editingBrand ? 'Edit Brand' : 'Add Brand'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                aria-label="Close brand form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="min-h-0 space-y-4 overflow-y-auto p-4 sm:p-5">
              <div>
                <label className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. TENAX, AKEMI, SURIE POLEX"
                  className="w-full h-[42px] px-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
                  Brand Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brand details, specialty products, and warranty information..."
                  className="w-full p-3 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                />
              </div>

              {/* Assign Categories */}
              <div>
                <label className="block text-[13px] font-medium text-[#1E293B] mb-1.5">
                  Assign to Categories
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto p-2 bg-[#F8FAFC] rounded-md border border-[#E2E8F0]">
                  {categories.map(cat => {
                    const selected = formData.categories.includes(cat.slug);
                    return (
                      <div
                        key={cat.slug}
                        onClick={() => toggleCategorySelection(cat.slug)}
                        className={`flex items-center justify-between p-2 rounded text-[13px] cursor-pointer transition-colors ${
                          selected ? 'bg-[#F8F3E9] text-[#B8862D] font-medium' : 'text-[#64748B] hover:bg-slate-200/50'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <input
                          type="checkbox"
                          checked={selected}
                          readOnly
                          className="rounded text-[#B8862D] focus:ring-0"
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
                  className="rounded text-[#B8862D] focus:ring-0 w-4 h-4"
                />
                <span className="text-[13px] text-[#1E293B]">Brand is Active &amp; Published</span>
              </label>

              <div className="flex flex-col-reverse gap-2 border-t border-[#E2E8F0] pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-11 w-full rounded-md border border-[#E2E8F0] px-4 text-[13px] font-semibold text-[#1E293B] transition-colors hover:bg-[#F8FAFC] sm:h-[38px] sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full rounded-md bg-[#B8862D] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#9c7126] disabled:opacity-50 sm:h-[38px] sm:w-auto"
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-3 sm:items-center sm:p-4">
          <div className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-sm space-y-4 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-lg sm:p-6">
            <div className="flex items-center gap-2.5 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold text-[16px] text-[#1E293B]">Delete Brand</h3>
            </div>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              Are you sure you want to delete this brand? Products linked to this brand will remain in your catalog.
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
                Delete Brand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
