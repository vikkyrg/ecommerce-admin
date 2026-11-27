import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  X,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory
} from '../services/adminApi';

export default function CategoryManagement() {
  const { toggleMobileMenu } = useOutletContext() || {};
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [searchParams] = useSearchParams();

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAdminCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    if (searchParams.get('action') === 'new') {
      openAddModal();
    }
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = cat => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      isActive: cat.isActive !== false
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingCategory) {
        const id = editingCategory._id || editingCategory.id || editingCategory.slug;
        const updated = await updateAdminCategory(id, formData);
        setCategories(prev =>
          prev.map(c => ((c._id || c.id || c.slug) === id ? { ...c, ...updated } : c))
        );
        setSuccess(`Category '${formData.name}' updated successfully.`);
      } else {
        const created = await createAdminCategory(formData);
        setCategories(prev => [created, ...prev]);
        setSuccess(`Category '${formData.name}' created successfully.`);
      }
      setShowModal(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setError('');
      await deleteAdminCategory(deleteId);
      setCategories(prev => prev.filter(c => (c._id || c.id || c.slug) !== deleteId));
      setDeleteId(null);
      setSuccess('Category deleted successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(cat => {
    const matchesSearch =
      !search ||
      cat.name?.toLowerCase().includes(search.toLowerCase()) ||
      cat.slug?.toLowerCase().includes(search.toLowerCase()) ||
      cat.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Active' && cat.isActive !== false) ||
      (selectedStatus === 'Inactive' && cat.isActive === false);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Topbar
        title="Category Management"
        subtitle="Organize stone processing chemicals and application groupings"
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
                placeholder="Search categories by name, slug..."
                className="w-full h-[42px] pl-10 pr-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[160px]">
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full h-[42px] pl-3.5 pr-8 bg-white text-[#1E293B] text-[14px] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D] appearance-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="h-[40px] px-4 bg-[#B8862D] hover:bg-[#9c7126] text-white text-[13px] font-semibold rounded-md transition-colors inline-flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Category</span>
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
              onClick={loadCategories}
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

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-44 bg-white rounded-lg border border-[#E2E8F0] animate-pulse" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-12 text-center">
            <Layers className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
            <h3 className="text-[16px] font-semibold text-[#1E293B]">No Categories Found</h3>
            <p className="text-[13px] text-[#64748B] mt-1">Create your first category or change your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map(cat => (
              <div
                key={cat._id || cat.id || cat.slug}
                className="bg-white rounded-lg border border-[#E2E8F0] hover:border-slate-300 p-5 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center text-[#64748B] flex-shrink-0 overflow-hidden">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="flex items-center justify-center w-full h-full"><svg class="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></span>';
                          }}
                        />
                      ) : (
                        <Layers className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        cat.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {cat.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="text-[15px] font-semibold text-[#1E293B]">{cat.name}</h3>
                  <span className="font-mono text-[11px] text-[#64748B] block mt-0.5 truncate">/{cat.slug}</span>
                  <p className="text-[13px] text-[#64748B] mt-2 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[12px] text-[#64748B] font-medium">
                    {cat.brandCount || 0} brands · {cat.itemCount || 0} products
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                      title="Edit Category"
                      aria-label="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(cat._id || cat.id || cat.slug)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                      title="Delete Category"
                      aria-label="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Category Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-900/40 p-2 sm:items-center sm:p-4">
            <div className="relative my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-lg flex-col overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white shadow-lg sm:max-h-[90vh]">
              <div className="mb-4 flex flex-shrink-0 items-center justify-between border-b border-[#E2E8F0] px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
                <h3 className="text-[16px] font-semibold text-[#1E293B]">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                  aria-label="Close category form"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
                <div>
                  <label className="block text-[13px] font-medium text-[#1E293B] mb-1.5">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        slug: formData.slug ? formData.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                      });
                    }}
                    placeholder="e.g. Marble & Granite Polishing Materials"
                    className="w-full h-[42px] px-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#1E293B] mb-1.5">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="marble-granite-polishing-materials"
                    className="w-full h-[42px] px-3.5 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] font-mono border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#1E293B] mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief summary of items in this category..."
                    className="w-full p-3 bg-white text-[#1E293B] text-[14px] placeholder-[#94A3B8] border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#B8862D] focus:ring-1 focus:ring-[#B8862D]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="catIsActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-[#B8862D] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="catIsActive" className="text-[13px] font-medium text-[#1E293B] cursor-pointer">
                    Enable category on customer store (Active)
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-[#E2E8F0] pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="h-11 w-full rounded-md border border-[#E2E8F0] px-4 text-[13px] font-semibold text-[#1E293B] hover:bg-[#F8FAFC] sm:h-[38px] sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-full rounded-md bg-[#B8862D] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#9c7126] disabled:opacity-50 sm:h-[38px] sm:w-auto"
                  >
                    {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
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
                <h4 className="text-[16px] font-semibold text-[#1E293B]">Confirm Deletion</h4>
              </div>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Categories assigned to brands or products cannot be deleted. Reassign or delete those records first.
              </p>
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="h-10 px-3.5 border border-[#E2E8F0] rounded-md text-[13px] font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="h-10 px-3.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-[13px] font-semibold"
                >
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
