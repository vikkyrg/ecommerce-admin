import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Layers,
  Package,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import { fetchAdminCategories, fetchAdminProducts } from '../services/adminApi';

export default function Dashboard() {
  const { toggleMobileMenu } = useOutletContext() || {};
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminCategories(), fetchAdminProducts()])
      .then(([cats, prodsData]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setProducts(Array.isArray(prodsData?.products) ? prodsData.products : []);
      })
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeProducts = products.filter(p => p.isActive !== false && p.inStock !== false);
  const recentProducts = products.slice(0, 6);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <Topbar
        title="Admin Control Center"
        subtitle="Overview of categories, inventory, and catalog status"
        onMenuClick={toggleMobileMenu}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 flex-1 max-w-7xl w-full mx-auto">
        
        {/* Quick Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e3e1] shadow-2xs">
          <div>
            <h3 className="font-['Manrope'] font-bold text-base text-black">Quick Actions</h3>
            <p className="text-xs text-neutral-500 font-['Inter']">Manage your product catalog and store categories directly.</p>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to="/categories?action=new"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-black text-white px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-semibold font-['Inter'] transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </Link>

            <Link
              to="/products?action=new"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-black hover:bg-neutral-800 text-[#ffdf9c] px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold font-['Inter'] transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Cards: 1 col on XS, 2 col on SM/MD, 4 col on LG+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Categories */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e2e3e1] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-['Inter']">Total Categories</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="font-['Manrope'] font-extrabold text-2xl sm:text-3xl text-black">
                {loading ? '...' : categories.length}
              </p>
            </div>
            <Link to="/categories" className="text-xs font-semibold text-neutral-600 hover:text-black inline-flex items-center gap-1 mt-4 pt-3 border-t border-neutral-100">
              <span>Manage Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Total Products */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e2e3e1] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-['Inter']">Total Products</span>
                <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="font-['Manrope'] font-extrabold text-2xl sm:text-3xl text-black">
                {loading ? '...' : products.length}
              </p>
            </div>
            <Link to="/products" className="text-xs font-semibold text-neutral-600 hover:text-black inline-flex items-center gap-1 mt-4 pt-3 border-t border-neutral-100">
              <span>View Product List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Active Products */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e2e3e1] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-['Inter']">Active In Store</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="font-['Manrope'] font-extrabold text-2xl sm:text-3xl text-emerald-700">
                {loading ? '...' : activeProducts.length}
              </p>
            </div>
            <span className="text-[11px] text-neutral-500 block mt-4 pt-3 border-t border-neutral-100 truncate">
              Visible to direct customers
            </span>
          </div>

          {/* Best Sellers */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e2e3e1] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-['Inter']">Best Sellers</span>
                <div className="w-9 h-9 rounded-xl bg-[#141619] text-[#ffdf9c] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="font-['Manrope'] font-extrabold text-2xl sm:text-3xl text-black">
                {loading ? '...' : products.filter(p => p.isBestSeller).length}
              </p>
            </div>
            <span className="text-[11px] text-neutral-500 block mt-4 pt-3 border-t border-neutral-100 truncate">
              Featured on Home Page
            </span>
          </div>
        </div>

        {/* Recently Added Products: Adaptive Table for Desktop, Card List for Mobile */}
        <div className="bg-white rounded-2xl border border-[#e2e3e1] shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-['Manrope'] font-bold text-sm sm:text-base text-black">Recent Products</h3>
              <p className="text-xs text-neutral-500">Live products in the NS Stone Chemicals catalog.</p>
            </div>
            <Link to="/products" className="text-xs font-bold text-black hover:underline whitespace-nowrap">
              View All →
            </Link>
          </div>

          {/* Desktop & Tablet Table (Hidden on small mobile) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs font-['Inter']">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentProducts.map(p => (
                  <tr key={p.id || p.sku || p._id} className="hover:bg-neutral-50/70">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-9 h-9 object-contain rounded border border-neutral-200 p-0.5 bg-white flex-shrink-0"
                        onError={e => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span className="font-semibold text-black line-clamp-1 max-w-xs">{p.name}</span>
                    </td>
                    <td className="p-4 font-mono font-medium text-neutral-600 whitespace-nowrap">{p.sku}</td>
                    <td className="p-4 text-neutral-600 line-clamp-1 max-w-[140px]">{p.category}</td>
                    <td className="p-4 font-bold text-black whitespace-nowrap">₹{p.price?.toLocaleString('en-IN')}</td>
                    <td className="p-4 whitespace-nowrap">{p.stock || 25} units</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout (Visible only on mobile screens < 640px) */}
          <div className="sm:hidden divide-y divide-neutral-100">
            {recentProducts.map(p => (
              <div key={p.id || p.sku || p._id} className="p-4 flex items-center gap-3">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-12 h-12 object-contain rounded-xl border border-neutral-200 p-1 bg-white flex-shrink-0"
                  onError={e => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs text-black line-clamp-1">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-xs text-black">₹{p.price?.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">({p.sku})</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 block truncate mt-0.5">{p.category}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex-shrink-0">
                  Active
                </span>
              </div>
            ))}
          </div>

        </div>

      </main>
    </div>
  );
}
