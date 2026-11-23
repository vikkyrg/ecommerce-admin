import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  AlertCircle,
  X
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [searchParams] = useSearchParams();

  const loadCategories = async () => {
    try {
      setLoading(true);
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
      image: '',
      isActive: true
    });
    setImagePreview('');
    setShowModal(true);
  };

  const openEditModal = cat => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive !== false
    });
    setImagePreview(cat.image || '');
    setShowModal(true);
  };

  // Base64 Image Upload Handler
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      alert('Only JPG, JPEG, PNG, and WebP images are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be under 5MB.');
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
      if (editingCategory) {
        const id = editingCategory._id || editingCategory.id || editingCategory.slug;
        const updated = await updateAdminCategory(id, formData);
        setCategories(prev =>
          prev.map(c => ((c._id || c.id || c.slug) === id ? { ...c, ...updated } : c))
        );
      } else {
        const created = await createAdminCategory(formData);
        setCategories(prev => [created, ...prev]);
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
      await deleteAdminCategory(deleteId);
      setCategories(prev => prev.filter(c => (c._id || c.id || c.slug) !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Topbar
        title="Category Management"
        subtitle="Manage dynamic store categories with real-time MongoDB sync"
        onMenuClick={toggleMobileMenu}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        
        {/* Actions Bar: Fully Responsive Search & Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search categories by name or slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-['Inter'] focus:outline-none focus:border-black"
            />
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-[#ffdf9c] font-['Inter'] font-bold text-xs px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Categories Grid (Responsive: 1 col mobile, 2 col tablet, 3 col desktop) */}
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500 font-['Inter']">
            Loading categories from database...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e3e1] p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="font-['Manrope'] font-bold text-base text-neutral-800">No categories found</p>
            <p className="text-xs text-neutral-500">Create your first category or change your search filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredCategories.map(cat => (
              <div
                key={cat._id || cat.id || cat.slug}
                className="bg-white rounded-2xl border border-[#e2e3e1] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          onError={e => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <Layers className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        cat.isActive !== false
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      {cat.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="font-['Manrope'] font-bold text-sm sm:text-base text-black">{cat.name}</h3>
                  <span className="font-mono text-[11px] text-neutral-400 block mt-0.5 truncate">/{cat.slug}</span>
                  <p className="font-['Inter'] text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-['Inter']">
                    {cat.itemCount || 0} products
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
                      title="Edit Category"
                      aria-label="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(cat._id || cat.id || cat.slug)}
                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
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

        {/* Add/Edit Category Modal: Mobile full-screen, Desktop centered dialog */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom sm:slide-in-from-top duration-200">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-100 mb-4 sticky top-0 bg-white z-10">
                <h3 className="font-['Manrope'] font-bold text-base sm:text-lg text-black">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-['Inter']">
                <div>
                  <label className="block font-semibold mb-1 text-neutral-800">Category Name *</label>
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
                    className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-black text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-neutral-800">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="marble-granite-polishing-materials"
                    className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:border-black text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-neutral-800">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief summary of items in this category..."
                    className="w-full bg-[#f9f9f7] p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-black text-xs"
                  />
                </div>

                {/* Base64 Image Upload & Preview */}
                <div>
                  <label className="block font-semibold mb-1 text-neutral-800">Category Image (Upload or URL)</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-neutral-300 hover:border-black rounded-xl cursor-pointer bg-neutral-50/50 transition-colors">
                      <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                      <span className="text-[11px] font-medium text-neutral-600">Select Image (JPG, PNG, WebP)</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>

                    {imagePreview && (
                      <div className="relative w-20 h-20 rounded-xl border border-neutral-300 overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image: '' }));
                          }}
                          className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 hover:bg-black"
                          aria-label="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="catIsActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="catIsActive" className="font-semibold text-neutral-800 cursor-pointer">
                    Enable category on customer store (Active)
                  </label>
                </div>

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
                    {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
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
                Are you sure you want to delete this category? Products assigned to it should be updated.
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
