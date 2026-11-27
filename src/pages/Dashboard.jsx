import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Layers,
  Package,
  Plus,
  ArrowRight,
  Tag
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import { fetchAdminCategories, fetchAdminProducts } from '../services/adminApi';
import { getProductStockStatus } from '../utils/productStock';

export default function Dashboard() {
  const { toggleMobileMenu } = useOutletContext() || {};
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchAdminCategories(), fetchAdminProducts()])
      .then(([cats, prodsData]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setProducts(Array.isArray(prodsData?.products) ? prodsData.products : []);
      })
      .catch(err => setError(err.message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const activeProducts = products.filter(p => p.isActive !== false);
  const recentProducts = products.slice(0, 8);
  const totalAvailableStock = products.reduce(
    (total, product) => total + (Number.isSafeInteger(product.stock) && product.stock > 0 ? product.stock : 0),
    0
  );
  const outOfStockProducts = products.filter(product =>
    getProductStockStatus(product.stock) === 'Out of Stock'
  ).length;
  const lowStockProducts = products.filter(product =>
    getProductStockStatus(product.stock) === 'Low Stock'
  ).length;
  const criticalStockProducts = products.filter(product =>
    getProductStockStatus(product.stock) === 'Critical Stock'
  ).length;

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Topbar
        title="Dashboard Overview"
        subtitle="Live catalog inventory statistics, stock levels, and recently modified products"
        onMenuClick={toggleMobileMenu}
      />

      <main className="min-w-0 p-3.5 sm:p-6 lg:p-8 space-y-7 flex-1 max-w-7xl w-full mx-auto">
        {error && (
          <div role="alert" className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700 text-[13.5px]">
            {error}
          </div>
        )}
        
        {/* Quick Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-[#E2E8F0]">
          <div>
            <h2 className="text-[18px] font-[650] text-[#1E293B] tracking-[-0.015em]">Quick Catalog Actions</h2>
            <p className="text-[14px] text-[#64748B] mt-0.5 font-normal">Direct shortcuts to add items or create new application categories.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/categories?action=new"
              className="flex-1 sm:flex-none h-[40px] px-4 bg-white hover:bg-[#F8FAFC] text-[#1E293B] text-[13.5px] font-semibold border border-[#E2E8F0] rounded-md transition-colors inline-flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#64748B]" />
              <span>Add Category</span>
            </Link>

            <Link
              to="/products?action=new"
              className="flex-1 sm:flex-none h-[40px] px-4 bg-[#B8862D] hover:bg-[#9c7126] text-white text-[13.5px] font-semibold rounded-md transition-colors inline-flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
          {/* Total Categories */}
          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">Total Categories</span>
                <div className="w-8 h-8 rounded-md bg-[#F8F3E9] text-[#B8862D] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[30px] font-bold text-[#1E293B] tracking-[-0.03em] leading-tight mt-1">
                {loading ? '...' : categories.length}
              </p>
            </div>
            <Link to="/categories" className="text-[13.5px] font-semibold text-[#B8862D] hover:underline inline-flex items-center gap-1.5 mt-5 pt-3.5 border-t border-[#E2E8F0]">
              <span>Manage Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Total Products */}
          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">Total Products</span>
                <div className="w-8 h-8 rounded-md bg-slate-100 text-[#1E293B] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[30px] font-bold text-[#1E293B] tracking-[-0.03em] leading-tight mt-1">
                {loading ? '...' : products.length}
              </p>
            </div>
            <Link to="/products" className="text-[13.5px] font-semibold text-[#B8862D] hover:underline inline-flex items-center gap-1.5 mt-5 pt-3.5 border-t border-[#E2E8F0]">
              <span>Manage Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Active in Store */}
          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">Active in Store</span>
                <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
              </div>
              <p className="text-[30px] font-bold text-[#1E293B] tracking-[-0.03em] leading-tight mt-1">
                {loading ? '...' : activeProducts.length}
              </p>
            </div>
            <div className="text-[13px] text-[#64748B] mt-5 pt-3.5 border-t border-[#E2E8F0]">
              Published to customer store
            </div>
          </div>

          {/* Brand Coverage */}
          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">Brand Coverage</span>
                <div className="w-8 h-8 rounded-md bg-slate-100 text-[#1E293B] flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[30px] font-bold text-[#1E293B] tracking-[-0.03em] leading-tight mt-1">
                {loading ? '...' : new Set(products.map(p => p.brand).filter(Boolean)).size}
              </p>
            </div>
            <Link to="/brands" className="text-[13.5px] font-semibold text-[#B8862D] hover:underline inline-flex items-center gap-1.5 mt-5 pt-3.5 border-t border-[#E2E8F0]">
              <span>Manage Brands</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <section className="space-y-3">
          <div>
            <h2 className="text-[18px] font-[650] text-[#1E293B]">Inventory Summary</h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">Live stock quantities across the product catalog.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Available Stock', value: totalAvailableStock, color: 'text-[#1E293B]' },
              { label: 'Out of Stock', value: outOfStockProducts, color: 'text-red-700' },
              { label: 'Low Stock (6-10)', value: lowStockProducts, color: 'text-amber-700' },
              { label: 'Critical Stock (1-5)', value: criticalStockProducts, color: 'text-orange-700' }
            ].map(item => (
              <div key={item.label} className="bg-white p-5 rounded-lg border border-[#E2E8F0]">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">{item.label}</p>
                <p className={`text-[28px] font-bold mt-2 ${item.color}`}>{loading ? '...' : item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Products Table */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[#E2E8F0] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-[18px] font-[650] text-[#1E293B] tracking-[-0.015em]">Recently Updated Products</h2>
              <p className="text-[14px] text-[#64748B] mt-0.5">Specifications and inventory balances of items recently modified in your catalog.</p>
            </div>
            <Link
              to="/products"
              className="text-[13.5px] font-semibold text-[#B8862D] hover:underline inline-flex items-center gap-1"
            >
              <span>View all products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-5 py-3.5 text-[12.5px] font-semibold">Product Title</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-semibold">Brand</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-semibold">Price</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-semibold">Stock Balance</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[14px] text-[#64748B]">
                      Loading records...
                    </td>
                  </tr>
                ) : recentProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[14px] text-[#64748B]">
                      No products recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentProducts.map(p => (
                    <tr key={p._id || p.sku} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-md border border-[#E2E8F0] bg-white p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                            ) : (
                              <Package className="w-5 h-5 text-[#94A3B8]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[14px] font-semibold text-[#1E293B] block truncate max-w-[280px]">
                              {p.name}
                            </span>
                            <span className="text-[12px] text-[#64748B] font-mono block mt-0.5">
                              {p.sku || 'No SKU'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-[14px] text-[#475569] font-medium">
                        {p.brand || '—'}
                      </td>

                      <td className="px-5 py-3.5 text-[14px] font-semibold text-[#1E293B]">
                        {p.price != null ? `₹${Number(p.price).toLocaleString('en-IN')}` : '—'}
                      </td>

                      <td className="px-5 py-3.5 text-[14px] text-[#475569]">
                        {p.stock != null ? `${p.stock} units` : '—'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[12px] font-medium ${
                          p.isActive !== false
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {p.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to="/products"
                          className="text-[13px] font-semibold text-[#B8862D] hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
