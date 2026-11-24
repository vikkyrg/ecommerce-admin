import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Tag,
  Package,
  ArrowRight,
  RefreshCw,
  Eye,
  Check,
  AlertCircle
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import { previewCatalogImportApi, confirmCatalogImportApi } from '../services/adminApi';

export default function ExcelImport() {
  const { toggleMobileMenu } = useOutletContext() || {};
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [overwrite, setOverwrite] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // summary | categories | brands | products | duplicates

  const handlePreviewDefault = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await previewCatalogImportApi({});
      setPreviewData(res);
      setSuccess('WEBSITE.xlsx inspected and mapped successfully.');
    } catch (err) {
      setError(err.message || 'Failed to parse Excel file');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async evt => {
      try {
        setLoading(true);
        setError('');
        const base64Data = evt.target.result;
        const res = await previewCatalogImportApi({ base64Data });
        setPreviewData(res);
        setSuccess(`Custom Excel file '${file.name}' mapped successfully.`);
      } catch (err) {
        setError(err.message || 'Failed to parse uploaded Excel file');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;
    setImporting(true);
    setError('');
    setSuccess('');

    try {
      const res = await confirmCatalogImportApi(overwrite);
      setSuccess(`Import complete: ${res.imported.categories} categories, ${res.imported.brands} brands, and ${res.imported.products} products saved to catalog.`);
    } catch (err) {
      setError(err.message || 'Error completing import');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1114] text-[#e0e2e6] flex flex-col">
      <Topbar onMenuClick={toggleMobileMenu} />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-['Manrope'] font-bold text-xl sm:text-2xl text-white tracking-tight">
              Excel Catalog Import System
            </h1>
            <p className="font-['Inter'] text-xs sm:text-sm text-neutral-400 mt-1">
              Inspect, preview and sync categories, brands, variants and products directly from WEBSITE.xlsx.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviewDefault}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-[#ffdf9c] hover:bg-[#ffe7b3] text-black font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{loading ? 'Inspecting Excel...' : 'Inspect WEBSITE.xlsx'}</span>
            </button>

            <label className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload Custom XLSX</span>
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
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

        {/* Previews & Reports */}
        {previewData && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Summary Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#141619] border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">Master Categories</span>
                <span className="text-2xl font-bold text-white font-['Manrope']">
                  {previewData.summary.totalCategories}
                </span>
                <span className="text-[11px] text-emerald-400 block mt-1">100% Normalized</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#141619] border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">Extracted Brands</span>
                <span className="text-2xl font-bold text-white font-['Manrope']">
                  {previewData.summary.totalBrands}
                </span>
                <span className="text-[11px] text-[#ffdf9c] block mt-1">Verified Manufacturers</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#141619] border border-neutral-800">
                <span className="text-xs text-neutral-400 block mb-1">Total Products</span>
                <span className="text-2xl font-bold text-white font-['Manrope']">
                  {previewData.summary.totalProductsFound}
                </span>
                <span className="text-[11px] text-neutral-300 block mt-1">
                  {previewData.summary.newProductsCount} New / {previewData.summary.duplicateCount} Existing
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#141619] border border-neutral-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">Unmapped / Review</span>
                  <span className="text-2xl font-bold text-white font-['Manrope']">
                    {previewData.summary.unmappedOrReviewCount}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500">Zero Ambiguities</span>
              </div>
            </div>

            {/* Confirm Actions Bar */}
            <div className="p-4 bg-[#1b1e22] border border-[#ffdf9c]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="overwriteCheckbox"
                  checked={overwrite}
                  onChange={e => setOverwrite(e.target.checked)}
                  className="rounded text-[#ffdf9c] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="overwriteCheckbox" className="text-xs sm:text-sm text-neutral-200 cursor-pointer">
                  Update/overwrite existing product data if already present in database
                </label>
              </div>

              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60 self-start sm:self-auto"
              >
                {importing ? 'Saving to Database...' : 'Confirm & Save All to Database'}
              </button>
            </div>

            {/* Preview Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
              {[
                { id: 'summary', label: 'Overview' },
                { id: 'categories', label: `Categories (${previewData.categories?.length || 0})` },
                { id: 'brands', label: `Brands (${previewData.brands?.length || 0})` },
                { id: 'products', label: `Products (${previewData.newProducts?.length || 0})` },
                { id: 'duplicates', label: `Existing / Duplicate (${previewData.duplicateProducts?.length || 0})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#ffdf9c] text-black font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Categories Preview */}
            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {previewData.categories.map((c, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#141619] border border-neutral-800">
                    <span className="text-[10px] text-[#ffdf9c] font-bold block mb-1">Category #{c.displayOrder}</span>
                    <h4 className="font-bold text-white text-sm">{c.name}</h4>
                    <p className="text-xs text-neutral-400 mt-1">{c.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Brands Preview */}
            {activeTab === 'brands' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {previewData.brands.map((b, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#141619] border border-neutral-800">
                    <h5 className="font-bold text-white text-xs">{b.name}</h5>
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Categories: {b.categories.length}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Products Preview */}
            {activeTab === 'products' && (
              <div className="bg-[#141619] border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1b1e22] text-neutral-400 border-b border-neutral-800">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Brand</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Variants</th>
                        <th className="p-3">SKU</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-neutral-300">
                      {previewData.newProducts.slice(0, 100).map((p, i) => (
                        <tr key={i} className="hover:bg-neutral-800/40">
                          <td className="p-3 font-semibold text-white">{p.name}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-neutral-800 text-[#ffdf9c] text-[10px] font-mono">
                              {p.brand}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-neutral-400">{p.category}</td>
                          <td className="p-3 text-[11px]">{p.variants?.length || 1} variant(s)</td>
                          <td className="p-3 font-mono text-[11px]">{p.sku}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Existing / Duplicates */}
            {activeTab === 'duplicates' && (
              <div className="p-6 bg-[#141619] border border-neutral-800 rounded-2xl text-xs space-y-3">
                <h4 className="font-bold text-white text-sm">Existing Products Found ({previewData.duplicateProducts.length})</h4>
                <p className="text-neutral-400">
                  These products already match an existing item in your catalog. They will be skipped unless 'Update/overwrite existing product data' is checked.
                </p>
                <div className="max-h-64 overflow-y-auto divide-y divide-neutral-800">
                  {previewData.duplicateProducts.map((p, i) => (
                    <div key={i} className="py-2 flex items-center justify-between text-neutral-300">
                      <span>{p.name}</span>
                      <span className="text-neutral-500 font-mono text-[11px]">{p.brand}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
